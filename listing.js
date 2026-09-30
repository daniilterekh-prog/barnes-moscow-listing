const list = document.querySelector("#catalog-list");
const sortSelect = document.querySelector("#sort-select");
const quickFilters = document.querySelector("#quick-filters");
const quickPopover = document.querySelector("#quick-filter-popover");
const quickPopoverTitle = document.querySelector("#quick-filter-popover-title");
const quickPopoverOptions = document.querySelector("#quick-filter-popover-options");
const quickPopoverClose = document.querySelector("#quick-filter-popover-close");
const quickEmpty = document.querySelector("#catalog-empty");

const quickFilterConfig = {
  type: {
    label: "Тип недвижимости",
    options: ["Квартира", "Апартаменты", "Пентхаус"],
  },
  budget: {
    label: "Бюджет",
    options: ["до 50 млн ₽", "50–100 млн ₽", "100–200 млн ₽", "от 200 млн ₽"],
  },
  district: {
    label: "Район",
    options: ["ЦАО", "Хамовники", "Пресненский"],
  },
  area: {
    label: "Площадь",
    options: ["до 120 м²", "120–250 м²", "от 250 м²"],
  },
  rooms: {
    label: "Комнаты",
    options: ["1", "2–3", "4–5", "5+"],
  },
};

const quickState = {
  type: null,
  budget: null,
  district: null,
  area: null,
  rooms: null,
};

const matchesQuickFilter = (card, key, value) => {
  if (key !== "area") return card.dataset[key] === value;

  const area = Number(card.dataset.area);
  if (value === "до 120 м²") return area <= 120;
  if (value === "120–250 м²") return area > 120 && area <= 250;
  if (value === "от 250 м²") return area > 250;
  return true;
};

const renderQuickButtons = () => {
  quickFilters.querySelectorAll(".quick-filter[data-filter]").forEach((button) => {
    const key = button.dataset.filter;
    const value = quickState[key];
    button.classList.toggle("is-active", Boolean(value));
    button.setAttribute("aria-expanded", String(button.dataset.open === "true"));
    button.querySelector(".quick-filter__value").textContent = value || "Не выбрано";
  });
};

const applyQuickFilters = () => {
  let visibleCount = 0;

  [...list.children].forEach((item) => {
    const card = item.querySelector(".apartment-card");
    const visible = Object.entries(quickState).every(([key, value]) => {
      return !value || matchesQuickFilter(card, key, value);
    });

    item.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  quickEmpty.hidden = visibleCount > 0;
};

const closeQuickPopover = () => {
  quickPopover.hidden = true;
  quickFilters.querySelectorAll(".quick-filter[data-filter]").forEach((button) => {
    button.dataset.open = "false";
  });
  renderQuickButtons();
};

const openQuickPopover = (key) => {
  quickPopoverTitle.textContent = quickFilterConfig[key].label;
  quickPopoverOptions.innerHTML = quickFilterConfig[key].options.map((option) => {
    const selected = quickState[key] === option;
    return `<button class="quick-filter-option${selected ? " is-selected" : ""}" type="button" data-option="${option}">${option}</button>`;
  }).join("");

  quickFilters.querySelectorAll(".quick-filter[data-filter]").forEach((button) => {
    button.dataset.open = String(button.dataset.filter === key);
  });
  quickPopover.hidden = false;
  renderQuickButtons();
};

const chooseQuickFilter = (key, value) => {
  quickState[key] = quickState[key] === value ? null : value;
  closeQuickPopover();
  renderQuickButtons();
  applyQuickFilters();
};

quickFilters.addEventListener("click", (event) => {
  const option = event.target.closest(".quick-filter-option");
  if (option) {
    chooseQuickFilter(quickPopover.dataset.filter, option.dataset.option);
    return;
  }

  const button = event.target.closest(".quick-filter[data-filter]");
  if (!button) return;

  const key = button.dataset.filter;
  quickPopover.dataset.filter = key;
  if (button.dataset.open === "true") closeQuickPopover();
  else openQuickPopover(key);
});

quickPopoverClose.addEventListener("click", closeQuickPopover);

document.addEventListener("click", (event) => {
  if (!event.target.closest("#quick-filters")) closeQuickPopover();
});

document.querySelectorAll(".apartment-card__favorite").forEach((button) => {
  button.addEventListener("click", () => {
    const isPressed = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!isPressed));
    button.textContent = isPressed ? "♡" : "♥";
  });
});

sortSelect.addEventListener("change", () => {
  const items = [...list.children];
  const value = sortSelect.value;

  items.sort((first, second) => {
    if (value === "relevance") return Number(first.dataset.order) - Number(second.dataset.order);
    const field = value.startsWith("price") ? "price" : "area";
    const direction = value.endsWith("desc") ? -1 : 1;
    return (Number(first.querySelector(".apartment-card").dataset[field]) - Number(second.querySelector(".apartment-card").dataset[field])) * direction;
  });

  items.forEach((item) => list.appendChild(item));
});

renderQuickButtons();
applyQuickFilters();
