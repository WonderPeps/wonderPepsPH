begin;

alter table public.payment_methods
  add column if not exists instructions_visible boolean not null default true,
  add column if not exists cod_fee numeric(12,2) not null default 0
    check (cod_fee >= 0);

alter table public.orders
  add column if not exists payment_fee numeric(12,2) not null default 0
    check (payment_fee >= 0);

-- Give existing Cash on Delivery methods the requested J&T COD fee.
update public.payment_methods
set cod_fee = 50
where (
  lower(trim(payment_name)) = 'cod'
  or lower(payment_name) like '%cash on delivery%'
)
and cod_fee = 0;

create or replace function public.place_storefront_order(
  p_order jsonb,
  p_items jsonb
)
returns table(order_id text, order_ref text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id public.orders.id%type;
  v_order_ref public.orders.order_ref%type;
  v_item_json jsonb;
  v_item public.order_items%rowtype;
begin
  if coalesce(trim(p_order->>'order_ref'), '') = '' then
    raise exception 'Order reference is required';
  end if;

  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one order item is required';
  end if;

  insert into public.orders (
    order_ref, customer_name, customer_username, phone, email, address,
    province, city, barangay, street, house_unit, zipcode, payment_method,
    shipping_method, shipping_method_type, notes, shipping_fee, payment_fee,
    subtotal, total, amount_paid, payment_status, receipt_image,
    reference_number, paid_at, status
  ) values (
    trim(p_order->>'order_ref'), trim(p_order->>'customer_name'),
    nullif(trim(p_order->>'customer_username'), ''), trim(p_order->>'phone'),
    nullif(trim(p_order->>'email'), ''), trim(p_order->>'address'),
    trim(p_order->>'province'), trim(p_order->>'city'),
    trim(p_order->>'barangay'), trim(p_order->>'street'),
    trim(p_order->>'house_unit'), nullif(trim(p_order->>'zipcode'), ''),
    trim(p_order->>'payment_method'), nullif(trim(p_order->>'shipping_method'), ''),
    nullif(trim(p_order->>'shipping_method_type'), ''),
    nullif(trim(p_order->>'notes'), ''),
    greatest(coalesce((p_order->>'shipping_fee')::numeric, 0), 0),
    greatest(coalesce((p_order->>'payment_fee')::numeric, 0), 0),
    greatest(coalesce((p_order->>'subtotal')::numeric, 0), 0),
    greatest(coalesce((p_order->>'total')::numeric, 0), 0),
    greatest(coalesce((p_order->>'amount_paid')::numeric, 0), 0),
    'Pending', nullif(p_order->>'receipt_image', ''),
    nullif(trim(p_order->>'reference_number'), ''),
    nullif(p_order->>'paid_at', '')::timestamptz, 'Pending'
  )
  returning orders.id, orders.order_ref into v_order_id, v_order_ref;

  for v_item_json in select value from jsonb_array_elements(p_items)
  loop
    if coalesce((v_item_json->>'quantity')::integer, 0) <= 0 then
      raise exception 'Every order item must have a positive quantity';
    end if;

    v_item := jsonb_populate_record(
      null::public.order_items,
      jsonb_build_object(
        'product_id', v_item_json->'product_id',
        'product_name', v_item_json->'product_name',
        'variant_id', v_item_json->'variant_id',
        'variant_name', v_item_json->'variant_name',
        'variant_sku', v_item_json->'variant_sku',
        'unit_price', v_item_json->'unit_price',
        'quantity', v_item_json->'quantity',
        'line_total', v_item_json->'line_total'
      )
    );

    insert into public.order_items (
      order_id, product_id, product_name, variant_id, variant_name,
      variant_sku, unit_price, quantity, line_total
    ) values (
      v_order_id, v_item.product_id, v_item.product_name, v_item.variant_id,
      v_item.variant_name, v_item.variant_sku, v_item.unit_price,
      v_item.quantity, v_item.line_total
    );
  end loop;

  return query select v_order_id::text, v_order_ref::text;
end;
$$;

revoke all on function public.place_storefront_order(jsonb, jsonb) from public;
grant execute on function public.place_storefront_order(jsonb, jsonb) to anon, authenticated;

commit;
