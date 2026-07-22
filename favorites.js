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

  return true;
}

function removeFavorite(productId) {
  favorites = favorites.filter(
    item => String(item.productId) !== String(productId)
  );

  saveFavorites();

  return true;
}

function toggleFavorite(productId) {
  if (isFavorite(productId)) {
    removeFavorite(productId);
    return false;
  }

  addFavorite(productId);
  return true;
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