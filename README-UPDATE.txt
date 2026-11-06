# WonderPeps COA & Protocol media update

## Files to replace/add in the existing GitHub branch

Replace:
- `admin.html`
- `admin.css`
- `coa.html`
- `protocol.html`

Add:
- `info-pages.css`
- `info-pages.js`
- `admin-info-media.js`

Also run `supabase-info-page-media.sql` once in Supabase Dashboard → SQL Editor.

## How it works
- COA and Protocol pages use a compact WonderPeps header, a centered page title, a pill-shaped search bar, and a responsive image/video card grid.
- Public visitors can view and search the media cards.
- Signed-in admins with `is_admin() = true` can upload and delete media from the new **COA & Protocol media** section in the admin sidebar.
- Uploads use the dedicated public Supabase Storage bucket `info-page-media`; metadata is stored in `public.info_page_media`.
- Images are limited to 20 MB and videos to 100 MB in the admin interface. The SQL bucket limit is 100 MB.

## Deploy safely
Commit these changes to the existing preview branch (`new-menu-drawer`) and test its Vercel Preview URL. Do not merge to `main` until verified.

The website already uses `supabase.js`, so it is intentionally not included in this update.
