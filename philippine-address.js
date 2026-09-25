(() => {
  const API_BASE = "https://psgc.cloud/api";
  const provinceInput = document.querySelector("#checkoutProvince");
  const cityInput = document.querySelector("#checkoutCity");
  const barangayInput = document.querySelector("#checkoutBarangay");
  const zipInput = document.querySelector('[name="zipcode"]');
  const provinceList = document.querySelector("#checkoutProvinceOptions");
  const cityList = document.querySelector("#checkoutCityOptions");
  const barangayList = document.querySelector("#checkoutBarangayOptions");
  const status = document.querySelector("#checkoutAddressStatus");
  const checkoutForm = document.querySelector("#checkoutForm");

  if (!provinceInput || !cityInput || !barangayInput) return;

  let provinces = [];
  let localities = [];
  let barangays = [];
  let strictSelection = true;
  let provinceRequest = 0;
  let localityRequest = 0;
  const comboControllers = [];

  const normalize = (value) => String(value || "").trim().toLocaleLowerCase("en-PH");

  function extractItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  }

  async function fetchItems(path) {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Address service returned ${response.status}`);
    return extractItems(await response.json());
  }

  function sortByName(items) {
    return [...items].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "en-PH"));
  }

  function renderOptions(list, items) {
    list.replaceChildren(...sortByName(items).map((item) => {
      const option = document.createElement("option");
      option.value = String(item.name || "").trim();
      return option;
    }));
  }

  function findExact(items, value) {
    const target = normalize(value);
    return items.find((item) => normalize(item.name) === target) || null;
  }

  function setStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  function setLoading(input, loading, placeholder) {
    input.disabled = loading;
    input.closest(".address-combobox")?.classList.toggle("is-disabled", loading);
    if (placeholder) input.placeholder = placeholder;
  }

  function createAddressCombobox(input, list, getItems, emptyText) {
    let suppressNextOpen = false;
    input.removeAttribute("list");
    input.readOnly = true;
    input.inputMode = "none";
    input.setAttribute("aria-readonly", "true");
    input.setAttribute("autocomplete", "off");
    list.hidden = true;

    const wrapper = document.createElement("div");
    wrapper.className = "address-combobox";
    input.before(wrapper);
    wrapper.append(input);

    const toggle = document.createElement("button");
    toggle.className = "address-combobox-toggle";
    toggle.type = "button";
    toggle.tabIndex = -1;
    toggle.setAttribute("aria-label", `Show ${input.name} choices`);
    toggle.innerHTML = '<span aria-hidden="true">⌄</span>';

    const panel = document.createElement("div");
    panel.className = "address-combobox-panel";
    panel.hidden = true;

    wrapper.append(toggle, panel);
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "none");
    input.setAttribute("aria-expanded", "false");

    function close() {
      panel.hidden = true;
      wrapper.classList.remove("is-open");
      input.setAttribute("aria-expanded", "false");
    }

    function render(showAll = false) {
      const matches = sortByName(getItems());
      panel.replaceChildren();

      if (!matches.length) {
        const empty = document.createElement("p");
        empty.className = "address-combobox-empty";
        empty.textContent = emptyText;
        panel.append(empty);
        return;
      }

      matches.forEach((item) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "address-combobox-option";
        option.innerHTML = `<span aria-hidden="true">♡</span><strong></strong>`;
        option.querySelector("strong").textContent = String(item.name || "");
        if (normalize(item.name) === normalize(input.value)) option.classList.add("is-selected");
        option.addEventListener("click", () => {
          input.value = String(item.name || "");
          input.setCustomValidity("");
          close();
          input.dispatchEvent(new Event("change", { bubbles: true }));
          suppressNextOpen = true;
          input.focus({ preventScroll: true });
        });
        panel.append(option);
      });
    }

    function open(showAll = false) {
      if (input.disabled) return;
      comboControllers.forEach((controller) => {
        if (controller.input !== input) controller.close();
      });
      render(showAll);
      panel.hidden = false;
      wrapper.classList.add("is-open");
      input.setAttribute("aria-expanded", "true");
    }

    input.addEventListener("focus", () => {
      if (suppressNextOpen) {
        suppressNextOpen = false;
        return;
      }
      open(true);
    });
    input.addEventListener("click", () => open(true));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        open(true);
        panel.querySelector(".address-combobox-option")?.focus();
      }
    });
    toggle.addEventListener("click", () => {
      if (panel.hidden) {
        open(true);
        input.focus({ preventScroll: true });
      } else {
        close();
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (!wrapper.contains(event.target)) close();
    });

    const controller = { input, close, render };
    comboControllers.push(controller);
    return controller;
  }

  function clearLocality() {
    localities = [];
    barangays = [];
    cityInput.value = "";
    barangayInput.value = "";
    cityList.replaceChildren();
    barangayList.replaceChildren();
    cityInput.placeholder = "Choose a province first";
    barangayInput.placeholder = "Choose a city first";
  }

  function clearBarangay() {
    barangays = [];
    barangayInput.value = "";
    barangayList.replaceChildren();
    barangayInput.placeholder = "Choose a city first";
  }

  async function loadLocalities() {
    const selected = findExact(provinces, provinceInput.value);
    clearLocality();
    provinceInput.setCustomValidity("");

    if (!selected) {
      if (strictSelection && provinceInput.value.trim()) {
        provinceInput.setCustomValidity("Please select a province from the official list.");
      }
      return;
    }

    const requestId = ++provinceRequest;
    setLoading(cityInput, true, "Loading cities and municipalities…");
    setStatus("Loading cities and municipalities…");

    try {
      const path = selected.isNcr
        ? "/regions/1300000000/cities-municipalities?per_page=100"
        : `/provinces/${encodeURIComponent(selected.code)}/cities-municipalities?per_page=100`;
      const results = await fetchItems(path);
      if (requestId !== provinceRequest) return;
      localities = results;
      renderOptions(cityList, localities);
      cityInput.placeholder = "Choose a city / municipality";
      setStatus("♡ Now choose your city or municipality.");
    } catch (error) {
      cityInput.placeholder = "City choices unavailable";
      setStatus("City choices could not load. Please choose the province again.", true);
    } finally {
      if (requestId === provinceRequest) setLoading(cityInput, false);
    }
  }

  async function loadBarangays() {
    const selected = findExact(localities, cityInput.value);
    clearBarangay();
    cityInput.setCustomValidity("");

    if (!selected) {
      if (strictSelection && cityInput.value.trim()) {
        cityInput.setCustomValidity("Please select a city or municipality from the official list.");
      }
      return;
    }

    if (zipInput && selected.zip_code) zipInput.value = selected.zip_code;
    const requestId = ++localityRequest;
    setLoading(barangayInput, true, "Loading barangays…");
    setStatus("Loading barangays…");

    try {
      const results = await fetchItems(`/cities-municipalities/${encodeURIComponent(selected.code)}/barangays?per_page=2000`);
      if (requestId !== localityRequest) return;
      barangays = results;
      renderOptions(barangayList, barangays);
      barangayInput.placeholder = "Choose a barangay / district";
      setStatus("♡ Your Philippine address choices are ready.");
    } catch (error) {
      barangayInput.placeholder = "Barangay choices unavailable";
      setStatus("Barangay choices could not load. Please choose the city again.", true);
    } finally {
      if (requestId === localityRequest) setLoading(barangayInput, false);
    }
  }

  provinceInput.addEventListener("change", loadLocalities);
  cityInput.addEventListener("change", loadBarangays);
  barangayInput.addEventListener("change", () => {
    barangayInput.setCustomValidity("");
    if (strictSelection && barangayInput.value.trim() && !findExact(barangays, barangayInput.value)) {
      barangayInput.setCustomValidity("Please select a barangay from the official list.");
    }
  });

  createAddressCombobox(provinceInput, provinceList, () => provinces, "No matching province found.");
  createAddressCombobox(cityInput, cityList, () => localities, "Choose a province first.");
  createAddressCombobox(barangayInput, barangayList, () => barangays, "Choose a city or municipality first.");

  checkoutForm?.addEventListener("submit", (event) => {
    if (!strictSelection) return;
    provinceInput.setCustomValidity(findExact(provinces, provinceInput.value) ? "" : "Please select a province from the official list.");
    cityInput.setCustomValidity(findExact(localities, cityInput.value) ? "" : "Please select a city or municipality from the official list.");
    barangayInput.setCustomValidity(findExact(barangays, barangayInput.value) ? "" : "Please select a barangay from the official list.");
    const addressIsValid = Boolean(
      findExact(provinces, provinceInput.value)
      && findExact(localities, cityInput.value)
      && findExact(barangays, barangayInput.value)
    );
    if (!addressIsValid || !checkoutForm.checkValidity()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      checkoutForm.reportValidity();
    }
  }, true);

  async function initialize() {
    setLoading(provinceInput, true, "Loading provinces…");
    setLoading(cityInput, true);
    setLoading(barangayInput, true);

    try {
      provinces = await fetchItems("/provinces?per_page=100");
      provinces.push({ code: "NCR", name: "Metro Manila (NCR)", isNcr: true });
      renderOptions(provinceList, provinces);
      strictSelection = true;
      provinceInput.placeholder = "Choose a province";
      setStatus("♡ Start with your province, then choose your city and barangay.");
    } catch (error) {
      provinceInput.placeholder = "Province choices unavailable";
      cityInput.placeholder = "Choose a province first";
      barangayInput.placeholder = "Choose a city first";
      setStatus("Address choices could not load. Please check your connection and reopen checkout.", true);
    } finally {
      setLoading(provinceInput, false);
      setLoading(cityInput, false);
      setLoading(barangayInput, false);
    }
  }

  initialize();
})();
