(() => {
  const page = document.body;
  const adminContent = document.getElementById("adminContent");
  const toggle = document.getElementById("mobileAdminMenuToggle");
  const drawer = document.getElementById("adminMobileDrawer");
  const backdrop = document.getElementById("mobileAdminNavBackdrop");
  const bottomNav = document.querySelector(".admin-mobile-bottom-nav");
  if (!adminContent || !toggle || !drawer || !backdrop || !bottomNav) return;

  toggle.hidden = true;

  const isMobile = () => window.matchMedia("(max-width: 680px)").matches;
  const isAdminVisible = () => !adminContent.hidden;

  function setDrawer(open) {
    const shouldOpen = Boolean(open && isMobile() && isAdminVisible());
    page.classList.toggle("mobile-admin-nav-open", shouldOpen);
    toggle.setAttribute("aria-expanded", String(shouldOpen));
    toggle.setAttribute("aria-label", shouldOpen ? "Close admin navigation" : "Open admin navigation");
  }

  function syncVisibility() {
    toggle.hidden = !isAdminVisible() || !isMobile();
    if (!isMobile() || !isAdminVisible()) setDrawer(false);
  }

  function setActive(sectionId) {
    bottomNav.querySelectorAll("a[data-mobile-section]").forEach((link) => {
      const active = link.dataset.mobileSection === sectionId;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  toggle.addEventListener("click", () => {
    setDrawer(!page.classList.contains("mobile-admin-nav-open"));
  });
  backdrop.addEventListener("click", () => setDrawer(false));

  drawer.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    setDrawer(false);
    const target = link.getAttribute("href") || "";
    if (target.startsWith("#")) {
      const sectionId = target.slice(1);
      if (bottomNav.querySelector(`[data-mobile-section="${CSS.escape(sectionId)}"]`)) {
        setActive(sectionId);
      }
    }
  });

  bottomNav.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-mobile-section]");
    if (!link) return;
    setActive(link.dataset.mobileSection);
    setDrawer(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setDrawer(false);
  });
  window.addEventListener("resize", syncVisibility);
  window.addEventListener("hashchange", () => {
    const sectionId = location.hash.slice(1);
    if (bottomNav.querySelector(`[data-mobile-section="${CSS.escape(sectionId)}"]`)) {
      setActive(sectionId);
    }
    setDrawer(false);
  });

  // Existing admin.js controls the login state. Observe only its hidden attribute;
  // this script does not touch authentication, data, or existing admin handlers.
  new MutationObserver(syncVisibility).observe(adminContent, {
    attributes: true,
    attributeFilter: ["hidden"]
  });

  syncVisibility();
  const initialSection = location.hash.slice(1);
  if (bottomNav.querySelector(`[data-mobile-section="${CSS.escape(initialSection)}"]`)) {
    setActive(initialSection);
  }
})();