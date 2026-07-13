<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Wonder Peps PH Admin</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header">
    <a class="brand" href="index.html"><span class="brand-mark">♡</span><span>Wonder Peps <small>ADMIN</small></span></a>
    <a class="secondary-button" href="index.html">View shop</a>
  </header>

  <main class="admin-shell">
    <div class="admin-top">
      <div>
        <p class="eyebrow">Stage 1</p>
        <h1 style="font-size:clamp(2.2rem,7vw,4rem)">Shop admin</h1>
      </div>
      <button id="resetButton" class="secondary-button danger">Reset demo data</button>
    </div>

    <div class="admin-grid">
      <section class="admin-card">
        <h2 id="formTitle">Add product</h2>
        <form id="productForm" class="admin-form">
          <input type="hidden" name="id" />
          <label>Product name<input name="name" required /></label>
          <label>Price (₱)<input name="price" type="number" min="0" required /></label>
          <label>Stock<input name="stock" type="number" min="0" required /></label>
          <label>Category<input name="category" /></label>
          <label>Image URL<input name="image" placeholder="Optional image link" /></label>
          <label>Description<textarea name="description" rows="4"></textarea></label>
          <button class="primary-button full" type="submit">Save product</button>
          <button id="cancelEdit" class="secondary-button full" type="button" hidden>Cancel editing</button>
        </form>
      </section>

      <section class="admin-card">
        <h2>Products</h2>
        <div id="adminProducts" class="admin-products"></div>
      </section>
    </div>

    <section class="admin-card" style="margin-top:24px">
      <h2>Orders on this device</h2>
      <div id="ordersList"></div>
    </section>
  </main>

  <script src="admin.js"></script>
</body>
</html>
