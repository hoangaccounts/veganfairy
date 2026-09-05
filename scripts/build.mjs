import fs from "node:fs";
import path from "node:path";
import { recipes, featuredSlugs, categoryOrder } from "../data/recipes.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const origin = "https://veganfairy.com";

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const slugify = (value) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const imagePath = (recipe) => `/images/recipe-${recipe.image}.jpg`;
const recipeUrl = (recipe) => `/recipes/${recipe.slug}/`;
const categoryUrl = (category) => `/categories/${slugify(category)}/`;
const recipeCategories = (recipe) => [recipe.category, ...recipe.tags];

const icon = (name) => ({
  arrow: '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5"/></svg>',
  leaf: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19.5 4.5C13 4.5 7 7 5 13c3 1 7.5.5 10-2.5M5 13c-1 2-1.5 4-1.5 6.5"/></svg>',
  people: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2.5 20c.5-4 2-6 5.5-6s5 2 5.5 6M10.5 20c.5-4 2-6 5.5-6s5 2 5.5 6"/></svg>',
  print: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 9V3h10v6M7 17H4V9h16v8h-3M7 14h10v7H7z"/></svg>',
  menu: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
}[name]);

function logo() {
  return `<a class="brand" href="/" aria-label="Vegan Fairy home"><span class="brand-mark" aria-hidden="true">✦</span><span>Vegan Fairy</span></a>`;
}

function header() {
  return `<header class="site-header"><div class="shell header-inner">${logo()}<button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">${icon("menu")}</button><nav id="site-nav" class="site-nav" aria-label="Main navigation"><a href="/recipes/">Recipes</a><a href="/categories/">Categories</a><a href="/about/">Our kitchen</a><a class="nav-cta" href="/recipes/">Find dinner ${icon("arrow")}</a></nav></div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="shell footer-grid"><div class="footer-brand">${logo()}<p>Fresh, practical plant-based cooking from Tien’s kitchen.</p></div><div><h2>Explore</h2><a href="/recipes/">All recipes</a><a href="/categories/">Categories</a><a href="/about/">Our kitchen</a></div><div><h2>Say hello</h2><a href="mailto:hello@veganfairy.com">hello@veganfairy.com</a><a href="/privacy/">Privacy</a></div></div><div class="shell footer-bottom"><span>© ${new Date().getFullYear()} Vegan Fairy</span><span>Cooked with plants &amp; care.</span></div></footer>`;
}

function meta({ title, description, pathName = "/", image = "/og.png", type = "website", jsonLd = "" }) {
  const pageTitle = title === "Vegan Fairy" ? title : `${title} · Vegan Fairy`;
  const absoluteImage = image.startsWith("http") ? image : `${origin}${image}`;
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(pageTitle)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${origin}${pathName}"><meta property="og:type" content="${type}"><meta property="og:site_name" content="Vegan Fairy"><meta property="og:title" content="${esc(pageTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}${pathName}"><meta property="og:image" content="${absoluteImage}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(pageTitle)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${absoluteImage}"><meta name="theme-color" content="#254a36"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/styles.css">${jsonLd}`;
}

function layout({ title, description, pathName, content, image, type, jsonLd, bodyClass = "" }) {
  return `<!doctype html><html lang="en"><head>${meta({ title, description, pathName, image, type, jsonLd })}</head><body class="${bodyClass}"><a class="skip-link" href="#main">Skip to content</a>${header()}<main id="main">${content}</main>${footer()}<script src="/assets/site.js" defer></script></body></html>`;
}

function recipeCard(recipe, eager = false) {
  return `<article class="recipe-card" data-categories="${esc(recipeCategories(recipe).join("|"))}"><a class="card-image" href="${recipeUrl(recipe)}"><img src="${imagePath(recipe)}" alt="${esc(recipe.title)}" loading="${eager ? "eager" : "lazy"}" decoding="async"><span class="card-arrow">${icon("arrow")}</span></a><div class="card-copy"><a class="eyebrow-link" href="${categoryUrl(recipe.category)}">${esc(recipe.category)}</a><h3><a href="${recipeUrl(recipe)}">${esc(recipe.title)}</a></h3><p>${esc(recipe.description)}</p></div></article>`;
}

function sectionHeading(kicker, title, copy = "", link = "") {
  return `<div class="section-heading"><div><span class="kicker">${esc(kicker)}</span><h2>${esc(title)}</h2>${copy ? `<p>${esc(copy)}</p>` : ""}</div>${link ? `<a class="text-link section-link" href="${link}">View all ${icon("arrow")}</a>` : ""}</div>`;
}

function homePage() {
  const featured = featuredSlugs.map((slug) => recipes.find((r) => r.slug === slug)).filter(Boolean);
  const latest = recipes.slice(0, 8);
  const counts = Object.fromEntries(categoryOrder.map((category) => [category, recipes.filter((r) => recipeCategories(r).includes(category)).length]));
  const content = `
  <section class="hero"><div class="shell hero-inner"><div class="hero-copy"><span class="kicker">Vegan Fairy · Tien’s kitchen</span><h1>Good food, in just the <em>right amount.</em></h1><p>Simple vegan meals for two, photographed and cooked at home.</p><div class="hero-actions"><a class="button button-dark" href="/recipes/">Explore recipes ${icon("arrow")}</a><a class="button button-soft" href="#featured">See what’s new</a></div></div><div class="hero-visual"><div class="hero-frame"><img src="/images/recipe-2094.jpg" alt="Vietnamese vegan rice noodle bowls" fetchpriority="high"><span class="photo-label"><small>Tonight’s pick</small><strong>Vietnamese rice noodle bowl</strong><a href="/recipes/vietnamese-vegan-rice-noodle-bowl/">View recipe ${icon("arrow")}</a></span></div></div></div></section>
  <section id="featured" class="section shell">${sectionHeading("Recently cooked", "Beautiful food. Simple steps.", "Colorful bowls, comforting soups, and fresh plates made for real weeknights.", "/recipes/")}<div class="featured-grid">${featured.map((r, i) => recipeCard(r, i < 2)).join("")}</div></section>
  <section class="category-band"><div class="shell">${sectionHeading("Browse", "Cook by mood") }<div class="category-grid">${categoryOrder.map((category, i) => `<a class="category-tile category-${i + 1}" href="${categoryUrl(category)}"><span class="category-number">0${i + 1}</span><span><strong>${esc(category)}</strong><small>${counts[category]} ${counts[category] === 1 ? "recipe" : "recipes"}</small></span>${icon("arrow")}</a>`).join("")}</div></div></section>
  <section class="section shell">${sectionHeading("The recipe box", "More to discover", "A growing collection of plant-based dishes from Tien’s table.", "/recipes/")}<div class="recipe-grid">${latest.map((r) => recipeCard(r)).join("")}</div></section>
  <section class="manifesto shell"><div class="manifesto-grid"><div class="manifesto-photo"><img src="/images/recipe-1940.jpg" alt="Fresh vegan spring rolls arranged around peanut dipping sauce" loading="lazy"></div><div class="manifesto-copy"><span class="kicker light">A quieter way to cook</span><h2>Less calculation. More dinner.</h2><p>Vegan Fairy is a collection of practical plant-based food from Tien’s kitchen—full of color, texture, and everyday comfort.</p><a class="button button-light" href="/about/">Our kitchen ${icon("arrow")}</a></div></div></section>`;
  return layout({ title: "Vegan Fairy", description: "Simple, delicious vegan recipes made for two. Discover plant-based bowls, soups, tofu dishes, noodles, and comfort food without leftovers.", pathName: "/", content, bodyClass: "home" });
}

function recipesPage() {
  const filters = ["All", ...categoryOrder];
  const content = `<section class="page-hero small"><div class="shell"><span class="kicker">The recipe box</span><h1>What’s for <em>dinner?</em></h1><p>Pick a mood and find your next plant-based favorite.</p></div></section><section class="section shell"><div class="filter-bar" aria-label="Filter recipes">${filters.map((item, i) => `<button class="filter-button${i === 0 ? " active" : ""}" type="button" data-filter="${esc(item)}" aria-pressed="${i === 0}">${esc(item)}</button>`).join("")}</div><p class="filter-count" aria-live="polite">Showing all ${recipes.length} recipes</p><div class="recipe-grid all-recipes">${recipes.map((r) => recipeCard(r)).join("")}</div><div class="empty-state" hidden><span aria-hidden="true">✦</span><h2>No recipes in that basket yet.</h2><p>Try another category for something delicious.</p></div></section>`;
  return layout({ title: "Vegan Recipes for Two", description: `Browse ${recipes.length} practical vegan recipes made for exactly two people, including tofu, noodles, soups, quick meals, and comfort food.`, pathName: "/recipes/", content });
}

function categoriesPage() {
  const tiles = categoryOrder.map((category, i) => {
    const matches = recipes.filter((r) => recipeCategories(r).includes(category));
    const cover = matches[0];
    return `<a class="category-card" href="${categoryUrl(category)}"><img src="${imagePath(cover)}" alt="${esc(category)} vegan recipes" loading="${i < 2 ? "eager" : "lazy"}"><span class="category-card-overlay"><small>${matches.length} ${matches.length === 1 ? "recipe" : "recipes"}</small><strong>${esc(category)}</strong>${icon("arrow")}</span></a>`;
  }).join("");
  const content = `<section class="page-hero small warm"><div class="shell"><span class="kicker">Cook by craving</span><h1>A recipe for <em>every mood.</em></h1><p>Go light and crisp, warm up with a soup, or lean all the way into comfort.</p></div></section><section class="section shell"><div class="category-card-grid">${tiles}</div></section>`;
  return layout({ title: "Vegan Recipe Categories", description: "Browse vegan recipes for two by category: tofu, noodles and bowls, soups and stews, quick meals, Asian-inspired dishes, comfort food, and fresh meals.", pathName: "/categories/", content });
}

function categoryPage(category) {
  const matches = recipes.filter((r) => recipeCategories(r).includes(category));
  const content = `<section class="page-hero small"><div class="shell"><a class="back-link" href="/categories/">← All categories</a><span class="kicker">${matches.length} ${matches.length === 1 ? "recipe" : "recipes"}</span><h1>${esc(category)}</h1><p>Fresh ideas from the Vegan Fairy kitchen.</p></div></section><section class="section shell"><div class="recipe-grid">${matches.map((r) => recipeCard(r)).join("")}</div></section>`;
  return layout({ title: `${category} Vegan Recipes for Two`, description: `Discover ${matches.length} ${category.toLowerCase()} vegan recipes made for two people. Practical, plant-based dishes from the Vegan Fairy kitchen.`, pathName: categoryUrl(category), content });
}

function recipePage(recipe, index) {
  const related = recipes.filter((r) => r.slug !== recipe.slug && recipeCategories(r).some((c) => recipeCategories(recipe).includes(c))).slice(0, 3);
  const jsonLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: [`${origin}${imagePath(recipe)}`],
    author: { "@type": "Organization", name: "Vegan Fairy" },
    recipeYield: "2 servings",
    recipeCategory: recipe.category,
    recipeCuisine: recipe.tags.includes("Asian-Inspired") ? "Asian-inspired" : "Vegan",
    keywords: recipeCategories(recipe).join(", "),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map((text) => ({ "@type": "HowToStep", text }))
  }).replaceAll("<", "\\u003c")}</script>`;
  const note = recipe.note ? `<aside class="recipe-note"><span aria-hidden="true">✦</span><div><strong>Tien’s note</strong><p>${esc(recipe.note)}</p></div></aside>` : "";
  const content = `<article class="recipe-page"><div class="shell recipe-crumbs"><a href="/recipes/">Recipes</a><span>/</span><a href="${categoryUrl(recipe.category)}">${esc(recipe.category)}</a></div><header class="shell recipe-header"><div class="recipe-intro"><span class="kicker">${esc(recipe.category)}</span><h1>${esc(recipe.title)}</h1><p class="recipe-dek">${esc(recipe.description)}</p><div class="recipe-facts"><span>${icon("people")}<small>Yield</small><strong>Serves 2</strong></span><span>${icon("leaf")}<small>Style</small><strong>Plant-based</strong></span></div><div class="recipe-actions"><a class="button button-dark" href="#recipe-card">View recipe ${icon("arrow")}</a><button class="button button-outline print-button" type="button">${icon("print")} Print</button></div></div><figure class="recipe-hero-image"><img src="${imagePath(recipe)}" alt="${esc(recipe.title)}" fetchpriority="high"></figure></header><div id="recipe-card" class="shell recipe-body"><section class="ingredient-panel"><div class="recipe-card-title"><span class="kicker">Gather</span><h2>Ingredients</h2></div><ul>${recipe.ingredients.map((item) => `<li><span aria-hidden="true"></span>${esc(item)}</li>`).join("")}</ul>${note}</section><section class="method-panel"><div class="recipe-card-title"><span class="kicker">Make</span><h2>Method</h2><p>Cook with your senses and season to taste.</p></div><ol>${recipe.instructions.map((item, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(item)}</p></li>`).join("")}</ol></section></div></article><section class="related section shell">${sectionHeading("Keep cooking", "More from the recipe box", "A few more dishes you may like.")}<div class="recipe-grid three">${related.map((r) => recipeCard(r)).join("")}</div></section>`;
  return layout({ title: `${recipe.title} — Vegan Recipe for Two`, description: `${recipe.description} This practical vegan recipe serves two.`, pathName: recipeUrl(recipe), image: imagePath(recipe), type: "article", jsonLd, content });
}

function infoPage(kind) {
  const pages = {
    about: { title: "Our Kitchen", pathName: "/about/", eyebrow: "Why Vegan Fairy", heading: "Food for real life.", copy: `<p>Vegan Fairy shares practical plant-based food cooked in a real home kitchen.</p><p>The dishes begin at Tien’s table: colorful bowls, cozy soups, crisp vegetables, tofu in a dozen moods, and the kind of food you want to pass around.</p><p>We believe a smaller recipe can still feel abundant. It should use sensible amounts, leave room for improvising, and make dinner feel like a small daily pleasure.</p><a class="button button-green" href="/recipes/">Find your next dinner ${icon("arrow")}</a>` },
    privacy: { title: "Privacy", pathName: "/privacy/", eyebrow: "The clear version", heading: "Your privacy matters.", copy: `<p>Vegan Fairy is in its first season. We currently do not offer user accounts or sell personal information.</p><p>As the site grows, we may use basic analytics, advertising, or affiliate links. When those tools are added, this page will be updated to explain what is collected and how it is used.</p><p>Questions? Email <a href="mailto:hello@veganfairy.com">hello@veganfairy.com</a>.</p>` }
  };
  const page = pages[kind];
  const content = `<section class="page-hero small warm"><div class="shell"><span class="kicker">${page.eyebrow}</span><h1>${page.heading}</h1></div></section><section class="section shell prose"><div>${page.copy}</div><figure><img src="/images/recipe-${kind === "about" ? "1930" : "2089"}.jpg" alt="A plant-based Vegan Fairy meal"></figure></section>`;
  return layout({ title: page.title, description: kind === "about" ? "Meet Vegan Fairy: practical, plant-based recipes from Tien’s kitchen, intentionally portioned for two." : "Vegan Fairy privacy information.", pathName: page.pathName, content });
}

function notFoundPage() {
  const content = `<section class="not-found"><div class="shell"><span aria-hidden="true">✦</span><p class="kicker light">404 · a little kitchen mishap</p><h1>That recipe wandered off.</h1><p>Let’s get you back to something delicious.</p><a class="button button-light" href="/recipes/">Browse recipes ${icon("arrow")}</a></div></section>`;
  return layout({ title: "Page Not Found", description: "The page you requested could not be found.", pathName: "/404.html", content });
}

function write(relative, content) {
  const target = path.join(dist, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.cpSync(path.join(root, "public"), dist, { recursive: true });
write("assets/styles.css", fs.readFileSync(path.join(root, "src/styles.css"), "utf8"));
write("assets/site.js", fs.readFileSync(path.join(root, "src/site.js"), "utf8"));
write("index.html", homePage());
write("recipes/index.html", recipesPage());
write("categories/index.html", categoriesPage());
for (const category of categoryOrder) write(`categories/${slugify(category)}/index.html`, categoryPage(category));
for (const [index, recipe] of recipes.entries()) write(`recipes/${recipe.slug}/index.html`, recipePage(recipe, index));
write("about/index.html", infoPage("about"));
write("privacy/index.html", infoPage("privacy"));
write("404.html", notFoundPage());

const urls = ["/", "/recipes/", "/categories/", "/about/", ...categoryOrder.map(categoryUrl), ...recipes.map(recipeUrl)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${origin}${url}</loc></url>`).join("")}</urlset>`);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);

console.log(`Built Vegan Fairy: ${recipes.length} recipes, ${categoryOrder.length} categories, ${urls.length} indexable pages.`);
