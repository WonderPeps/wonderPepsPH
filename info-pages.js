(() => {
  const form = document.querySelector(".wonder-search-form");
  const input = form?.querySelector('input[name="q"]');
  const feedback = document.querySelector(".wonder-search-feedback");
  const emptyState = document.querySelector(".wonder-info-empty");
  const results = document.querySelector(".wonder-info-results");
  if (!form || !input || !feedback || !results) return;

  const pageName = document.body.dataset.pageName || "documents";
  const entries = Array.from(results.querySelectorAll("[data-search-item]"));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim().toLocaleLowerCase();
    if (!query) {
      feedback.textContent = "Please type a keyword to search.";
      input.focus();
      return;
    }
    if (!entries.length) {
      feedback.textContent = `No ${pageName.toUpperCase()} documents are available to search yet.`;
      if (emptyState) {
        const message = emptyState.querySelector("p");
        if (message) message.textContent = `No ${pageName} results found for “${input.value.trim()}”.`;
      }
      return;
    }
    let matches = 0;
    entries.forEach((entry) => {
      const searchable = `${entry.textContent} ${entry.dataset.searchItem || ""}`.toLocaleLowerCase();
      const isMatch = searchable.includes(query);
      entry.hidden = !isMatch;
      if (isMatch) matches += 1;
    });
    if (emptyState) emptyState.hidden = matches > 0;
    feedback.textContent = matches
      ? `${matches} ${matches === 1 ? "result" : "results"} found.`
      : `No ${pageName.toUpperCase()} results found for “${input.value.trim()}”.`;
  });

  input.addEventListener("input", () => {
    if (!input.value.trim()) {
      entries.forEach((entry) => { entry.hidden = false; });
      if (emptyState) emptyState.hidden = false;
      feedback.textContent = "Type a keyword to search.";
    }
  });
})();
