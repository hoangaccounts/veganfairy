const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("open", !isOpen);
  });
}

const filters = [...document.querySelectorAll("[data-filter]")];
const cards = [...document.querySelectorAll(".all-recipes .recipe-card")];
const count = document.querySelector(".filter-count");
const empty = document.querySelector(".empty-state");

for (const button of filters) {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    let visible = 0;
    for (const card of cards) {
      const matches = filter === "All" || card.dataset.categories.split("|").includes(filter);
      card.hidden = !matches;
      if (matches) visible += 1;
    }
    if (count) count.textContent = filter === "All" ? `Showing all ${visible} recipes` : `Showing ${visible} ${filter.toLowerCase()} ${visible === 1 ? "recipe" : "recipes"}`;
    if (empty) empty.hidden = visible !== 0;
  });
}

document.querySelector(".print-button")?.addEventListener("click", () => window.print());
