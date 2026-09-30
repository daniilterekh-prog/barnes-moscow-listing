const filterConfig = {
  type: { label: "Тип недвижимости", options: ["Квартира", "Пентхаус", "Таунхаус"] },
  budget: { label: "Бюджет", options: ["до 500 000 $", "500 000–1 000 000 $", "от 1 000 000 $"] },
  district: { label: "Район", options: ["ЦАО", "Хамовники", "Пресненский"] },
  area: { label: "Площадь", options: ["до 120 м²", "120–250 м²", "от 250 м²"] },
  rooms: { label: "Комнаты", options: ["2–3 комнаты", "4–5 комнат", "6+ комнат"] }
};

const state = {
  filters: Object.fromEntries(Object.keys(filterConfig).map((key) => [key, null])),
  openFilter: null,
  zoom: 1,
  search: ""
};

const quickList = document.querySelector("#quick-filter-list");
const popover = document.querySelector("#filter-popover");
const popoverTitle = document.querySelector("#popover-title");
const options = document.querySelector("#filter-options");
const drawer = document.querySelector("#filter-drawer");
const drawerGroups = document.querySelector("#drawer-groups");
const title = document.querySelector("#result-title");
const appliedFilters = document.querySelector("#applied-filters");
const clearFilters = document.querySelector("#clear-filters");
const mapMarkers = document.querySelector("#map-markers");
const searchInput = document.querySelector("#search-input");
const mobileObjectCard = document.querySelector("#mobile-object-card");
const mobileObjectImage = document.querySelector("#mobile-object-image");
const mobileObjectId = document.querySelector("#mobile-object-id");
const mobileObjectTitle = document.querySelector("#mobile-object-title");
const mobileObjectAddress = document.querySelector("#mobile-object-address");
const mobileObjectStats = document.querySelector("#mobile-object-stats");
const mobileObjectPrice = document.querySelector("#mobile-object-price");

const markerPositions = [
  [48, 31], [41, 38], [54, 42], [45, 46], [61, 35], [36, 48], [50, 52], [57, 57],
  [30, 41], [34, 55], [44, 59], [66, 47], [39, 64], [52, 68], [59, 72], [26, 59],
  [70, 42], [32, 34], [47, 25], [57, 29], [63, 62], [40, 73], [24, 50], [73, 52]
];

const mapObjects = [
  { id: "ID 585863", title: "Изысканный 2-комнатный апартамент в ЖК «Поклонная 9»", address: "Поклонная ул, 9", stats: [["50,6 м²", "Площадь"], ["20", "Этаж"], ["1", "Спальня"], ["2", "Комнаты"]], price: "56 000 000 ₽", image: "./assets/project-figma.jpg" },
  { id: "ID 559973", title: "Видовой пентхаус с террасой BOGENHOUSE", address: "Озерковская наб, 6", stats: [["261,4 м²", "Площадь"], ["5", "Этаж"], ["4", "Спальни"], ["6", "Комнаты"]], price: "370 000 000 ₽", image: "./assets/project-second.jpg" },
  { id: "ID 587753", title: "Роскошная 3-комнатная квартира в ЖК «Акватория»", address: "Ленинградское ш, 69к2", stats: [["95,3 м²", "Площадь"], ["20", "Этаж"], ["2", "Спальни"], ["3", "Комнаты"]], price: "61 945 000 ₽", image: "./assets/project-figma.jpg" }
];

function createQuickFilters() {
  quickList.innerHTML = Object.entries(filterConfig).map(([key, config]) => `
    <button class="quick-filter" type="button" data-filter="${key}" aria-expanded="false">
      <span class="quick-filter__label">${config.label}</span>
      <span class="quick-filter__value">Не выбрано</span>
      <i class="quick-filter__chevron" aria-hidden="true"></i>
    </button>
  `).join("");
}

function createDrawer() {
  const districts = ["Арбатский", "Академический", "Аэропорт", "Басманный", "Беговой", "Бутырский", "Даниловский", "Донской", "Замоскворечье", "Хамовники", "Пресненский", "Тверской"];
  drawerGroups.innerHTML = `
    <section class="drawer-group" data-group="type">
      <h3 class="drawer-group__title">Тип недвижимости</h3>
      <div class="drawer-group__options">
        ${["Апартаменты", "Квартира", "Квартира в новостройке", "Пентхаус"].map((option) => `<button class="option" type="button" data-option="${option}" data-filter="type">${option}</button>`).join("")}
      </div>
    </section>
    <section class="drawer-group" data-group="price">
      <h3 class="drawer-group__title">Цена ₽</h3>
      <div class="drawer-inputs"><input class="drawer-input" type="text" placeholder="от 7 346 525 ₽" aria-label="Минимальная цена" /><input class="drawer-input" type="text" placeholder="до 2 185 036 900 ₽" aria-label="Максимальная цена" /></div>
    </section>
    <section class="drawer-group" data-group="budget">
      <h3 class="drawer-group__title">Диапазоны</h3>
      <div class="drawer-group__options">
        ${["до 50 млн ₽", "50 – 100 млн ₽", "100 – 200 млн ₽", "от 200 млн ₽"].map((option) => `<button class="option" type="button" data-option="${option}" data-filter="budget">${option}</button>`).join("")}
      </div>
    </section>
    <section class="drawer-group" data-group="area">
      <h3 class="drawer-group__title">Общая площадь</h3>
      <div class="drawer-inputs"><input class="drawer-input" type="text" placeholder="от 0 м²" aria-label="Минимальная площадь" /><input class="drawer-input" type="text" placeholder="до 1 846 м²" aria-label="Максимальная площадь" /></div>
    </section>
    <section class="drawer-group" data-group="district">
      <h3 class="drawer-group__title">Районы</h3>
      <div class="drawer-checks">
        ${districts.map((district) => `<label class="drawer-check"><input type="checkbox" data-filter="district" value="${district}" /><span>${district}</span></label>`).join("")}
      </div>
    </section>
  `;
}

function createMarkers() {
  mapMarkers.innerHTML = markerPositions.map(([left, top], index) => `
    <button class="map-marker${index === 8 ? " is-selected" : ""}" type="button" style="left:${left}%; top:${top}%" aria-label="Открыть объект ${index + 1}" data-marker="${index + 1}"></button>
  `).join("");
}

function showMobileObject(index) {
  if (!mobileObjectCard) return;
  const object = mapObjects[index % mapObjects.length];
  mobileObjectImage.src = object.image;
  mobileObjectImage.alt = object.title;
  mobileObjectId.textContent = object.id;
  mobileObjectTitle.textContent = object.title;
  mobileObjectAddress.textContent = object.address;
  mobileObjectStats.innerHTML = object.stats.map(([value, label]) => `<span><strong>${value}</strong><small>${label}</small></span>`).join("");
  mobileObjectPrice.textContent = object.price;
  mobileObjectCard.hidden = false;
}

function selectedCount() {
  return Object.values(state.filters).filter(Boolean).length;
}

function renderFilterButtons() {
  quickList.querySelectorAll("[data-filter]").forEach((button) => {
    const key = button.dataset.filter;
    const value = state.filters[key];
    button.classList.toggle("is-active", Boolean(value));
    button.setAttribute("aria-expanded", state.openFilter === key ? "true" : "false");
    button.querySelector(".quick-filter__value").textContent = value || "Не выбрано";
  });

  document.querySelectorAll(".drawer-group").forEach((group) => {
    const key = group.dataset.group;
    group.querySelectorAll(".option").forEach((option) => {
      option.classList.toggle("is-selected", state.filters[key] === option.dataset.option);
    });
    group.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = state.filters[key] === input.value;
    });
  });
}

function renderAppliedFilters() {
  appliedFilters.innerHTML = Object.entries(state.filters)
    .filter(([, value]) => value)
    .map(([key, value]) => `<span class="applied-chip">${filterConfig[key].label}: ${value}<button type="button" data-remove="${key}" aria-label="Сбросить фильтр ${filterConfig[key].label}">×</button></span>`)
    .join("");
  clearFilters.hidden = selectedCount() === 0;
}

function renderResultCount() {
  const query = state.search.trim().toLowerCase();
  const matches = [...document.querySelectorAll(".property-card")].filter((card) => !query || card.dataset.search.includes(query));
  const base = matches.length ? 16 : 0;
  const visibleCount = Math.max(0, base - selectedCount() * 2);
  title.textContent = `${visibleCount} ${visibleCount === 1 ? "совпадение" : visibleCount < 5 ? "совпадения" : "совпадений"}`;
  document.querySelectorAll(".property-card").forEach((card) => card.classList.toggle("is-hidden", Boolean(query) && !card.dataset.search.includes(query)));
}

function renderOptions(key) {
  const config = filterConfig[key];
  popoverTitle.textContent = config.label;
  options.innerHTML = config.options.map((option) => `<button class="option${state.filters[key] === option ? " is-selected" : ""}" type="button" data-option="${option}" data-filter="${key}">${option}</button>`).join("");
  popover.hidden = false;
}

function openQuickFilter(key) {
  state.openFilter = state.openFilter === key ? null : key;
  if (state.openFilter) renderOptions(state.openFilter);
  else popover.hidden = true;
  renderFilterButtons();
}

function chooseFilter(key, value) {
  state.filters[key] = state.filters[key] === value ? null : value;
  state.openFilter = null;
  popover.hidden = true;
  renderFilterButtons();
  renderAppliedFilters();
  renderResultCount();
}

function clearAllFilters() {
  Object.keys(state.filters).forEach((key) => { state.filters[key] = null; });
  state.openFilter = null;
  popover.hidden = true;
  renderFilterButtons();
  renderAppliedFilters();
  renderResultCount();
}

function toggleDrawer(isOpen) {
  drawer.hidden = !isOpen;
  document.querySelector("#advanced-filter-button").setAttribute("aria-expanded", String(isOpen));
  document.querySelector("#mobile-filter-button").setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    state.openFilter = null;
    popover.hidden = true;
    renderFilterButtons();
  }
}

quickList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (button) openQuickFilter(button.dataset.filter);
});

options.addEventListener("click", (event) => {
  const option = event.target.closest("[data-option]");
  if (option) chooseFilter(option.dataset.filter, option.dataset.option);
});

drawerGroups.addEventListener("click", (event) => {
  const option = event.target.closest("[data-option]");
  if (option) chooseFilter(option.dataset.filter, option.dataset.option);
});

drawerGroups.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-filter]");
  if (input) chooseFilter(input.dataset.filter, input.value);
});

appliedFilters.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove]");
  if (remove) chooseFilter(remove.dataset.remove, state.filters[remove.dataset.remove]);
});

document.querySelector("#popover-close").addEventListener("click", () => {
  state.openFilter = null;
  popover.hidden = true;
  renderFilterButtons();
});
document.querySelector("#advanced-filter-button").addEventListener("click", () => toggleDrawer(drawer.hidden));
document.querySelector("#mobile-filter-button").addEventListener("click", () => toggleDrawer(drawer.hidden));
document.querySelector("#drawer-close").addEventListener("click", () => toggleDrawer(false));
document.querySelector("#drawer-backdrop").addEventListener("click", () => toggleDrawer(false));
document.querySelector("#apply-filters").addEventListener("click", () => toggleDrawer(false));
document.querySelector("#reset-filters").addEventListener("click", clearAllFilters);
clearFilters.addEventListener("click", clearAllFilters);

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderResultCount();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("#quick-menu")) {
    state.openFilter = null;
    popover.hidden = true;
    renderFilterButtons();
  }
});

document.querySelectorAll(".save-button").forEach((button) => {
  button.addEventListener("click", () => {
    const pressed = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!pressed));
    button.textContent = pressed ? "♡" : "♥";
  });
});

mapMarkers.addEventListener("click", (event) => {
  const marker = event.target.closest(".map-marker");
  if (!marker) return;
  mapMarkers.querySelectorAll(".map-marker").forEach((item) => item.classList.remove("is-selected"));
  marker.classList.add("is-selected");
  showMobileObject(Number(marker.dataset.marker) - 1);
});

document.querySelector("#mobile-object-close").addEventListener("click", () => {
  mobileObjectCard.hidden = true;
});

document.querySelector("#zoom-in").addEventListener("click", () => {
  state.zoom = Math.min(1.22, state.zoom + 0.08);
  mapMarkers.style.transform = `scale(${state.zoom})`;
});
document.querySelector("#zoom-out").addEventListener("click", () => {
  state.zoom = Math.max(0.9, state.zoom - 0.08);
  mapMarkers.style.transform = `scale(${state.zoom})`;
});

createQuickFilters();
createDrawer();
createMarkers();
renderFilterButtons();
renderAppliedFilters();
renderResultCount();
