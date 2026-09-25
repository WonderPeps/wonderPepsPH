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
  let strictSelection = false;
  let provinceRequest = 0;
  let localityRequest = 0;

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
    if (placeholder) input.placeholder = placeholder;
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
      cityInput.placeholder = "Choose or type a city / municipality";
      setStatus(`${localities.length} city and municipality choices loaded.`);
    } catch (error) {
      strictSelection = false;
      cityInput.placeholder = "Type your city / municipality";
      setStatus("Address choices are temporarily unavailable. You may type the address manually.", true);
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
      barangayInput.placeholder = "Choose or type a barangay / district";
      setStatus(`${barangays.length} barangay choices loaded.`);
    } catch (error) {
      strictSelection = false;
      barangayInput.placeholder = "Type your barangay / district";
      setStatus("Barangay choices are temporarily unavailable. You may type it manually.", true);
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

  checkoutForm?.addEventListener("submit", (event) => {
    if (!strictSelection) return;
    provinceInput.setCustomValidity(findExact(provinces, provinceInput.value) ? "" : "Please select a province from the official list.");
    cityInput.setCustomValidity(findExact(localities, cityInput.value) ? "" : "Please select a city or municipality from the official list.");
    barangayInput.setCustomValidity(findExact(barangays, barangayInput.value) ? "" : "Please select a barangay from the official list.");
    if (!checkoutForm.checkValidity()) {
      event.preventDefault();
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
      provinceInput.placeholder = "Choose or type a province";
      setStatus("Start with your province, then choose your city and barangay.");
    } catch (error) {
      strictSelection = false;
      provinceInput.placeholder = "Type your province";
      cityInput.placeholder = "Type your city / municipality";
      barangayInput.placeholder = "Type your barangay / district";
      setStatus("Address choices are temporarily unavailable. You may type the address manually.", true);
    } finally {
      setLoading(provinceInput, false);
      setLoading(cityInput, false);
      setLoading(barangayInput, false);
    }
  }

  initialize();
})();
