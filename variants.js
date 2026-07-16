/* ==========================================================
   WONDER PEPS PH
   PRODUCT VARIANTS MODULE
========================================================== */

const VariantManager = (() => {
  let elements = {};
  let supabase = null;
  let uploadImage = null;

  function init(config) {
    elements = {
      productForm: config.productForm,
      hasVariantsToggle: config.hasVariantsToggle,
      variantManager: config.variantManager,
      variantRows: config.variantRows,
      addVariantButton: config.addVariantButton,
      standardPricingFields: config.standardPricingFields
    };

    supabase = config.supabaseClient;
    uploadImage = config.uploadProductImage;

    console.log("Variant Manager initialized");
  }

  function isEnabled() {
    return Boolean(elements.hasVariantsToggle?.checked);
  }

  function getCards() {
    return Array.from(
      elements.variantRows?.querySelectorAll(".variant-card") || []
    );
  }

  function readCard(card, index) {
    const getField = (name) =>
      card.querySelector(`[data-variant-field="${name}"]`);

    const name = String(getField("name")?.value || "").trim();
    const priceValue = getField("price")?.value;
    const stockValue = getField("stock")?.value;

    return {
      existingId: String(card.dataset.variantId || "").trim() || null,
      name,
      price:
        priceValue === "" || priceValue == null
          ? Number.NaN
          : Number(priceValue),
      stock:
        stockValue === "" || stockValue == null
          ? Number.NaN
          : Number(stockValue),
      badge: String(getField("badge")?.value || "").trim() || null,
      sku: String(getField("sku")?.value || "").trim() || null,
      imageUrl:
        String(getField("image_url")?.value || "").trim() || null,
      imageFile: getField("image_file")?.files?.[0] || null,
      isDefault: Boolean(getField("is_default")?.checked),
      isActive: Boolean(getField("is_active")?.checked),
      sortOrder: index
    };
  }

  function collect() {
    if (!isEnabled()) {
      return [];
    }

    const variants = getCards().map(readCard);

    if (!variants.length) {
      throw new Error("Add at least one product variant.");
    }

    variants.forEach((variant, index) => {
      if (!variant.name) {
        throw new Error(`Variant ${index + 1} needs a name.`);
      }

      if (!Number.isFinite(variant.price) || variant.price < 0) {
        throw new Error(
          `Variant ${index + 1} needs a valid price.`
        );
      }

      if (
        !Number.isInteger(variant.stock) ||
        variant.stock < 0
      ) {
        throw new Error(
          `Variant ${index + 1} needs valid whole-number stock.`
        );
      }
    });

    const defaultCount = variants.filter(
      (variant) => variant.isDefault
    ).length;

    if (defaultCount === 0) {
      variants[0].isDefault = true;
    }

    if (defaultCount > 1) {
      throw new Error("Only one variant can be the default.");
    }

    const enteredSkus = variants
      .map((variant) => variant.sku)
      .filter(Boolean);

    if (new Set(enteredSkus).size !== enteredSkus.length) {
      throw new Error(
        "Each variant SKU must be unique for this product."
      );
    }

    return variants;
  }

  async function prepareVariantPayload(productId, variant) {
    let imageUrl = variant.imageUrl;

    if (variant.imageFile) {
      if (typeof uploadImage !== "function") {
        throw new Error(
          "Variant image upload is not available."
        );
      }

      imageUrl = await uploadImage(variant.imageFile);
    }

    return {
      product_id: productId,
      name: variant.name,
      price: variant.price,
      stock: variant.stock,
      badge: variant.badge,
      image_url: imageUrl,
      sku: variant.sku,
      is_default: variant.isDefault,
      is_active: variant.isActive,
      sort_order: variant.sortOrder,
      updated_at: new Date().toISOString()
    };
  }

  async function save(productId) {
    if (!supabase) {
      throw new Error("Supabase is not connected.");
    }

    if (!productId) {
      throw new Error("Cannot save variants without a product ID.");
    }

    /*
     * No variants selected:
     * remove any existing variants from this product.
     */
    if (!isEnabled()) {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

      if (error) {
        throw error;
      }

      return [];
    }

    const variants = collect();

    /*
     * Build every payload before changing existing records.
     * This prevents old variants from being deleted if an
     * image upload or validation fails first.
     */
    const payloads = [];

    for (const variant of variants) {
      payloads.push(
        await prepareVariantPayload(productId, variant)
      );
    }

    /*
     * Replace the current variant set.
     * This is simple and reliable for the first implementation.
     */
    const { error: deleteError } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      throw deleteError;
    }

    const { data, error: insertError } = await supabase
      .from("product_variants")
      .insert(payloads)
      .select("*");

    if (insertError) {
      throw insertError;
    }

    return data || [];
  }

  return {
    init,
    isEnabled,
    collect,
    save
  };
})();