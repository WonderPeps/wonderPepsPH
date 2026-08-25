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
    link.addEventListener("click", () => {
      const id = link.getAttribute("href").slice(1);
      setActiveLink(id);

      if (window.matchMedia("(max-width: 900px)").matches) {
        link.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    });
  });

  if ("IntersectionObserver" in window) {
    const visibleSections = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleSections.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        const active = Array.from(visibleSections.entries())
          .filter(([, ratio]) => ratio > 0)
          .sort((first, second) => second[1] - first[1])[0];

        if (active) setActiveLink(active[0]);
      },
      { rootMargin: "-120px 0px -58% 0px", threshold: [0.05, 0.2, 0.5] }
    );

    sectionById.forEach((section) => observer.observe(section));
  }

  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.setAttribute("aria-controls", "settingsForm");
  });
})();
