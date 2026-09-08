/* Wonder Peps Admin Studio — presentation-only enhancements. */
(function () {
  const navLinks = Array.from(
    document.querySelectorAll('.admin-sidebar-nav a[href^="#"]')
  );

  const sectionById = new Map(
    navLinks
      .map((link) => {
        const id = link.getAttribute("href").slice(1);
        return [id, document.getElementById(id)];
      })
      .filter(([, section]) => Boolean(section))
  );

  function setActiveLink(id) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.getAttribute("href").slice(1);
      const section = sectionById.get(id);
      if (!section) return;

      setActiveLink(id);
      section.scrollIntoView({ behavior: "auto", block: "start" });
      history.replaceState(null, "", `${location.pathname}${location.search}#${id}`);

      if (window.matchMedia("(max-width: 900px)").matches) {
        link.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    });
  });

  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.setAttribute("aria-controls", "settingsForm");
  });
})();
