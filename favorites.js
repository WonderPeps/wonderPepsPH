/* -------------------------
   FAVORITES
------------------------- */

const FAVORITES_STORAGE_KEY = "wonderPepsFavorites";

let favorites = loadSavedFavorites();

function loadSavedFavorites() {
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!savedFavorites) {
      return [];
    }

    const parsedFavorites = JSON.parse(savedFavorites);

    return Array.isArray(parsedFavorites)
      ? parsedFavorites
      : [];
  } catch (error) {
    console.error("Unable to load saved favorites:", error);
    return [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favorites)
    );
  } catch (error) {
    console.error("Unable to save favorites:", error);
  }
}

function clearSavedFavorites() {
  favorites = [];
  localStorage.removeItem(FAVORITES_STORAGE_KEY);
}

function isFavorite(productId) {
  return favorites.some(
    item => String(item.productId) === String(productId)
  );
}

function addFavorite(productId) {
  if (isFavorite(productId)) {
    return false;
  }

  favorites.push({
    productId
  });

  saveFavorites();
  updateFavoritesBadge();
  return true;
}

function removeFavorite(productId) {
  favorites = favorites.filter(
    item => String(item.productId) !== String(productId)
  );

  saveFavorites();
  updateFavoritesBadge();
  return true;
}

function toggleFavorite(productId) {
  if (isFavorite(productId)) {
    removeFavorite(productId);

    renderFavoritesDrawer();

    return false;
  }

  addFavorite(productId);

  renderFavoritesDrawer();

  return true;
}

function getFavorites() {
  return favorites.map(item => String(item.productId));
}

function getFavoriteProducts() {
  if (typeof getProductById !== "function") {
    return [];
  }

  return favorites
    .map(item => getProductById(item.productId))
    .filter(Boolean);
}

function getFavoriteCount() {
  return favorites.length;
}
function updateFavoritesBadge() {
    const badge = document.getElementById("favoritesCount");

    if (!badge) {
        return;
    }

    const count = getFavoriteCount();

    badge.textContent = count;

    badge.hidden = count === 0;
}
document.addEventListener("DOMContentLoaded", () => {
    updateFavoritesBadge();
    renderFavoritesDrawer();
});
function renderFavoritesDrawer() {
    const container = document.getElementById("favoritesItems");

    if (!container) {
        return;
    }

    const favoriteProducts = getFavoriteProducts();
    if (!favoriteProducts.length) {
        container.innerHTML = `
            <p class="empty">
                No favorites yet.
            </p>
        `;
        return;
    }

    container.innerHTML = favoriteProducts
  .map((product) => `
    <div class="favorite-item">

      ${
        product.image_url
          ? `
            <img
              class="favorite-thumb"
              src="${product.image_url}"
              alt="${product.name}">
          `
          : `
            <div class="favorite-thumb favorite-thumb-placeholder">
              ♡
            </div>
          `
      }

      <div class="favorite-details">
        <strong>${product.name}</strong>
        <span>${formatCurrency(product.price)}</span>
      </div>

      <button
        class="favorite-remove"
        data-favorite-product="${product.id}">
        ♥
      </button>

    </div>
  `)
  .join("");
    container
    .querySelectorAll(".favorite-remove")
    .forEach((button) => {
   button.addEventListener("click", () => {

    removeFavorite(button.dataset.favoriteProduct);

    renderFavoritesDrawer();

    updateFavoritesBadge();

    // Refresh the product cards so the heart icon updates
    if (typeof renderProducts === "function") {
        renderProducts(products);
    }

});
    });
}