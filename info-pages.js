(() => {
  const pageKey = document.body.dataset.infoPage;
  const grid = document.getElementById("infoMediaGrid");
  const input = document.getElementById("infoSearchInput");
  const form = document.getElementById("infoSearchForm");
  const hint = document.getElementById("infoSearchHint");
  if (!pageKey || !grid || typeof supabaseClient === "undefined") return;

  let mediaItems = [];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  const lightbox = document.createElement("dialog");
  lightbox.className = "info-lightbox";
  lightbox.setAttribute("aria-label", "Expanded media viewer");
  lightbox.innerHTML = `
    <div class="info-lightbox-header">
      <span class="info-lightbox-brand">WonderPeps</span>
      <button class="info-lightbox-close" type="button" aria-label="Close expanded media">×</button>
    </div>
    <div class="info-lightbox-content"></div>`;
  document.body.appendChild(lightbox);
  const lightboxContent = lightbox.querySelector(".info-lightbox-content");

  function closeLightbox() {
    if (lightbox.open) lightbox.close();
    lightboxContent.replaceChildren();
  }
  lightbox.querySelector(".info-lightbox-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("close", () => lightboxContent.replaceChildren());

  function openMedia(url, type, title) {
    const media = document.createElement(type === "video" ? "video" : "img");
    media.src = url;
    media.alt = title || pageKey.toUpperCase();
    if (type === "video") {
      media.controls = true;
      media.playsInline = true;
      media.autoplay = true;
    }
    lightboxContent.replaceChildren(media);
    if (!lightbox.open) lightbox.showModal();
  }

  function render(items) {
    if (!items.length) {
      const searching = Boolean(input.value.trim());
      grid.innerHTML = `<div class="info-empty">
        <span class="info-empty-heart" aria-hidden="true">♡</span>
        <strong>${searching ? "No matching items found." : `No ${pageKey} content has been added yet.`}</strong>
        <span>${searching ? "Try another keyword." : "When media is added, you can find it here."}</span>
      </div>`;
      return;
    }
    grid.innerHTML = items.map((item) => {
      const title = escapeHtml(item.title || pageKey.toUpperCase());
      const url = escapeHtml(item.media_url);
      const media = item.media_type === "video"
        ? `<video src="${url}" controls playsinline preload="metadata"></video>
           <button class="info-media-expand" type="button" data-expand-media="${url}" data-media-type="video" data-media-title="${title}">Expand video</button>`
        : `<button class="info-media-open" type="button" data-expand-media="${url}" data-media-type="image" data-media-title="${title}" aria-label="Expand ${title}">
             <img src="${url}" alt="${title}" loading="lazy">
           </button>`;
      return `<article class="info-media-card">${media}<h2 class="info-media-title">${title}</h2></article>`;
    }).join("");
  }

  function applySearch() {
    const query = input.value.trim().toLowerCase();
    const filtered = mediaItems.filter((item) =>
      String(item.title || "").toLowerCase().includes(query)
    );
    render(filtered);
    hint.textContent = query
      ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} found.`
      : `Browse the ${pageKey} collection.`;
  }

  input.addEventListener("input", applySearch);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applySearch();
  });
  grid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-expand-media]");
    if (!trigger) return;
    openMedia(
      trigger.dataset.expandMedia,
      trigger.dataset.mediaType,
      trigger.dataset.mediaTitle
    );
  });

  async function loadMedia() {
    const { data, error } = await supabaseClient
      .from("info_page_media")
      .select("id,page_key,title,media_url,media_type,sort_order,created_at")
      .eq("page_key", pageKey)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load page media:", error.message);
      grid.innerHTML = `<div class="info-empty"><strong>Media could not be loaded.</strong><span>Please try again later.</span></div>`;
      return;
    }
    mediaItems = data || [];
    applySearch();
  }

  loadMedia();
})();
