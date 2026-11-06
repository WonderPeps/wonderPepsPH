(() => {
  const form = document.getElementById("infoMediaUploadForm");
  const list = document.getElementById("infoMediaAdminList");
  const status = document.getElementById("infoMediaUploadStatus");
  const filter = document.getElementById("infoMediaFilter");
  if (!form || !list || typeof supabaseClient === "undefined") return;

  const BUCKET = "info-page-media";
  let allItems = [];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  async function requireAdmin() {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Please sign in to the admin account.");
    const { data, error } = await supabaseClient.rpc("is_admin");
    if (error || data !== true) throw new Error("Admin access is required to manage COA and Protocol media.");
  }

  function renderList() {
    const selected = filter.value;
    const items = allItems.filter(item => selected === "all" || item.page_key === selected);
    if (!items.length) {
      list.innerHTML = '<p class="tiny-note">No media uploaded yet for this selection.</p>';
      return;
    }
    list.innerHTML = items.map(item => `
      <article class="info-media-admin-row">
        <div class="info-media-admin-preview">
          ${item.media_type === "video"
            ? '<span aria-label="Video">▶ VIDEO</span>'
            : `<img src="${escapeHtml(item.media_url)}" alt="">`}
        </div>
        <div class="info-media-admin-meta">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${item.page_key.toUpperCase()} · ${item.media_type}</span>
        </div>
        <div class="info-media-admin-actions">
          <button class="secondary-button" type="button" data-edit-info-media="${escapeHtml(item.id)}">Edit</button>
          <button class="secondary-button danger" type="button" data-delete-info-media="${escapeHtml(item.id)}">Delete</button>
        </div>
      </article>`).join("");
  }

  async function loadItems() {
    const { data, error } = await supabaseClient
      .from("info_page_media")
      .select("id,page_key,title,media_url,media_type,storage_path,sort_order,created_at")
      .order("page_key", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    allItems = data || [];
    renderList();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const file = data.get("media_file");
    const pageKey = data.get("page_key");
    const title = String(data.get("title") || "").trim();
    if (!(file instanceof File) || !file.size) {
      status.textContent = "Choose an image or video first.";
      return;
    }
    const isVideo = file.type.startsWith("video/");
    if (!file.type.startsWith("image/") && !isVideo) {
      status.textContent = "Please choose a supported image or video file.";
      return;
    }
    if (file.size > (isVideo ? 100 : 20) * 1024 * 1024) {
      status.textContent = `This ${isVideo ? "video" : "image"} is too large. Maximum size: ${isVideo ? "100 MB" : "20 MB"}.`;
      return;
    }
    submit.disabled = true;
    status.textContent = "Uploading media…";
    let storagePath = "";
    try {
      await requireAdmin();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-90);
      storagePath = `${pageKey}/${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}-${safeName}`;
      const { error: uploadError } = await supabaseClient.storage.from(BUCKET).upload(storagePath, file, {
        cacheControl: "3600", upsert: false, contentType: file.type
      });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabaseClient.storage.from(BUCKET).getPublicUrl(storagePath);
      const { error: insertError } = await supabaseClient.from("info_page_media").insert({
        page_key: pageKey, title, media_url: publicData.publicUrl,
        media_type: isVideo ? "video" : "image", storage_path: storagePath
      });
      if (insertError) {
        await supabaseClient.storage.from(BUCKET).remove([storagePath]);
        throw insertError;
      }
      form.reset();
      // Clear the mobile local-file preview after a successful upload.
      // The uploaded item remains available in the saved-media gallery below.
      const mediaInput = form.querySelector('input[type="file"][name="media_file"]');
      if (mediaInput) mediaInput.dispatchEvent(new Event("change", { bubbles: true }));
      status.textContent = "Media uploaded successfully.";
      await loadItems();
    } catch (error) {
      console.error("COA / Protocol media upload failed:", error);
      status.textContent = error.message || "Upload failed. Check the Supabase setup and try again.";
    } finally {
      submit.disabled = false;
    }
  });

  filter.addEventListener("change", renderList);
  list.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-info-media]");
    if (editButton) {
      const item = allItems.find(entry => entry.id === editButton.dataset.editInfoMedia);
      if (!item) return;
      const nextTitle = prompt("Edit media title:", item.title || "");
      if (nextTitle === null) return;
      const cleanTitle = nextTitle.trim();
      if (!cleanTitle) {
        status.textContent = "Please enter a title.";
        return;
      }
      const nextPage = prompt('Show this media on which page? Enter "coa" or "protocol":', item.page_key);
      if (nextPage === null) return;
      const cleanPage = nextPage.trim().toLowerCase();
      if (!["coa", "protocol"].includes(cleanPage)) {
        status.textContent = 'Page must be either "coa" or "protocol".';
        return;
      }
      editButton.disabled = true;
      try {
        await requireAdmin();
        const { error: updateError } = await supabaseClient
          .from("info_page_media")
          .update({ title: cleanTitle, page_key: cleanPage })
          .eq("id", item.id);
        if (updateError) throw updateError;
        await loadItems();
        status.textContent = "Media details updated.";
      } catch (error) {
        editButton.disabled = false;
        status.textContent = error.message || "Could not update this media.";
      }
      return;
    }

    const button = event.target.closest("[data-delete-info-media]");
    if (!button) return;
    const item = allItems.find(entry => entry.id === button.dataset.deleteInfoMedia);
    if (!item || !confirm(`Delete "${item.title}" from ${item.page_key.toUpperCase()}?`)) return;
    button.disabled = true;
    try {
      await requireAdmin();
      const { error: deleteError } = await supabaseClient.from("info_page_media").delete().eq("id", item.id);
      if (deleteError) throw deleteError;
      if (item.storage_path) {
        const { error: storageError } = await supabaseClient.storage.from(BUCKET).remove([item.storage_path]);
        if (storageError) console.warn("Media row deleted, but storage cleanup failed:", storageError.message);
      }
      await loadItems();
      status.textContent = "Media deleted.";
    } catch (error) {
      button.disabled = false;
      status.textContent = error.message || "Could not delete this media.";
    }
  });

  requireAdmin().then(loadItems).catch(error => {
    list.innerHTML = `<p class="tiny-note">${escapeHtml(error.message)}</p>`;
  });
})();
