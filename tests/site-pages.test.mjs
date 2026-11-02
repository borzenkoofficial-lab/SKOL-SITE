import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
test("catalogue and CRM detail routes are registered", () => {
  assert.match(source, /path === "\/catalog" \? "catalog"/);
  assert.match(source, /path === "\/products\/skol-crm" \? "product"/);
  assert.match(source, /route==="catalog"\?catalog\(\)/);
  assert.match(source, /route==="product"\?product\(\)/);
});
test("catalogue links to the CRM product detail page", () => {
  assert.match(source, /href="\/products\/skol-crm"/);
  assert.match(source, /СКОЛ CRM/);
  assert.match(source, /PRODUCT PIPELINE/);
});
test("CRM page documents product modules and tiers", () => {
  for (const phrase of ["Клиенты и заявки", "Объекты и задачи", "Сметы и коммерческие предложения", "Производство и ПИ", "Инженерный расчёт", "Финансы и экономика", "Поиск заказов", "START", "PRO", "BUSINESS"]) assert.ok(source.includes(phrase));
});
test("CRM page discloses offline licensing limitations", () => {
  for (const phrase of ["Ed25519", "Device ID", "удалённо отозвать", "updatesUntil", "выполняется вручную"]) assert.ok(source.includes(phrase));
});
test("page metadata is set per route and base HTML remains Russian", () => {
  assert.match(source, /function setPageMeta\(\)/);
  assert.match(source, /Каталог программ СКОЛ/);
  assert.match(source, /СКОЛ CRM — возможности, модули и лицензии/);
  assert.match(html, /<html lang="ru">/);
  assert.match(html, /rel="canonical"/);
});

test("visual system provides accessible light and dark themes", () => {
  assert.match(source, /function setupTheme\(\)/);
  assert.match(source, /skol-theme/);
  assert.match(source, /theme-toggle/);
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /--canvas:#f5f2ed/);
  assert.match(styles, /prefers-reduced-motion/);
});
test("theme control is initialized and has an accessible label", () => {
  assert.match(source, /aria-label="Включить тёмную тему"/);
  assert.match(source, /setupTheme\(\);setupCatalogFolders\(\);setupHomeInteractions\(\);setupMotion\(\)/);
});

test("reference-driven visual system is present across SKOL", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(source, /Система координации операций и логики/);
  assert.match(source, /hero-monitor/);
  assert.match(source, /site-header/);
  assert.match(styles, /--accent:#ef6a21/);
  assert.match(styles, /\.hero-visual/);
  assert.match(styles, /\.site-header/);
  assert.match(styles, /@media\(max-width:600px\)/);
});
test("homepage and tariff particle layers are scoped DOM effects, not canvas renderers", () => {
  assert.match(source, /function setupParticles\(\)\{const scene=document\.querySelector\("\.hero-visual"\)/);
  assert.match(source, /function setupTariffMotion\(\)/);
  assert.match(source, /tariff-particle-field/);
  assert.match(source, /key-visual-plate/);
});
test("tariff page includes the 3D edition scene, interactive cards and request flow", () => {
  for (const token of ["tariff-hero-scene", "tariff-scene-core", "tariff-card-3d", "data-tariff-card", "comparison-table", "tariff-form"]) assert.ok(source.includes(token));
  assert.match(source, /setupTariffMotion\(\)/);
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  for (const token of [".tariff-hero-scene", ".tariff-scene-orbit", ".tariff-card-orb", ".tariff-particle-field", "prefers-reduced-motion"]) assert.ok(styles.includes(token));
});

test("catalogue product is presented as an accessible interactive folder", () => {
  assert.match(source, /data-catalog-folder/);
  assert.match(source, /aria-expanded="false"/);
  assert.match(source, /aria-controls="catalog-product-details"/);
  assert.match(source, /function setupCatalogFolders\(\)/);
  assert.match(source, /setupCatalogFolders\(\)/);
  assert.match(source, /Открыть папку продукта СКОЛ CRM/);
  assert.match(source, /Изучить программу/);
});
test("folder reveal has hover, keyboard, touch and reduced-motion styling", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.catalog-folder:hover \.folder-reveal/);
  assert.match(styles, /\.catalog-folder:focus-within \.folder-reveal/);
  assert.match(styles, /\.catalog-folder\.is-open \.folder-reveal/);
  assert.match(styles, /@media\(max-width:600px\)/);
  assert.match(styles, /folder-reveal-inner/);
  assert.match(styles, /prefers-reduced-motion/);
});

test("SKOL brand acronym is expanded in the homepage hero", () => {
  assert.match(source, /Система координации операций и логики/);
  assert.match(source, /class="skol-expansion"/);
  for (const line of ["<i>С</i>истема","<i>К</i>оординации","<i>О</i>пераций","<i>Л</i>огики."]) assert.ok(source.includes(line));
});

test("desktop navigation has four accessible interactive product links", () => {
  assert.match(source, /data-nav-item/);
  for (const label of ["Продукты","Платформа","Тарифы","Поддержка"]) assert.ok(source.includes("['"+label+"'"));
  assert.match(source, /aria-current="page"/);
});
test("navigation hover uses a jelly animation, glow and accessible focus state", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /@keyframes nav-jelly/);
  assert.match(styles, /\.desktop-nav a:hover/);
  assert.match(styles, /\.desktop-nav a:focus-visible/);
  assert.match(styles, /box-shadow:0 0 8px rgba\(239,106,33/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
});

test("hero dashboard mockup uses a non-overlapping responsive layout", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.hero-monitor-main\s*\{[^}]*display:grid/s);
  assert.match(styles, /grid-template-rows:auto auto auto minmax\(52px,1fr\) auto/);
  assert.match(styles, /\.hero-monitor-metrics>div\s*\{[^}]*min-height:50px/s);
  assert.match(styles, /@media\(max-width:600px\)/);
});
test("hero dashboard mockup has jelly hover and reduced-motion behavior", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /@keyframes hero-monitor-jelly/);
  assert.match(styles, /\.hero-monitor:hover\s*\{/);
  assert.match(styles, /animation:hero-monitor-jelly/);
  assert.match(styles, /\.hero-monitor:hover\{animation:none!important\}/);
});

test("hero scene places dashboard and supporting elements into distinct layout areas", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /grid-template-areas:[\s\S]*"monitor panel"[\s\S]*"monitor float-top"[\s\S]*"float-right device"[\s\S]*"note note"/);
  assert.match(styles, /\.hero-monitor\s*\{[\s\S]*grid-area:monitor/);
  assert.match(styles, /\.hero-back-panel\s*\{[\s\S]*grid-area:panel/);
  assert.match(styles, /\.hero-float-top\s*\{grid-area:float-top/);
  assert.match(styles, /\.hero-float-right\s*\{grid-area:float-right/);
  assert.match(styles, /@media\(max-width:600px\)/);
});
test("hero scene stacks on mobile without absolute overlap", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /"monitor monitor"[\s\S]*"panel panel"[\s\S]*"float-top float-right"/);
  assert.match(styles, /\.hero-mini-device\{display:none\}/);
});

test("homepage after hero is a five-chapter product story", () => {
  for (const marker of ["home-products","home-story","home-pillars","home-method","home-final"]) assert.ok(source.includes(marker));
  for (const heading of ["Программы, которые","Сначала понять","Четыре буквы","От запроса","Давайте найдём"]) assert.ok(source.includes(heading));
});
test("homepage product and acronym cards are accessible interactive folders", () => {
  assert.match(source, /data-home-folder/);
  assert.match(source, /function setupHomeInteractions\(\)/);
  assert.match(source, /setupHomeInteractions\(\)/);
  assert.match(source, /aria-controls="home-crm-folder-details"/);
  for (const id of ["home-pillar-s","home-pillar-k","home-pillar-o","home-pillar-l"]) assert.ok(source.includes(id));
});
test("homepage motion system supports scroll reveal, hover and reduced motion", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(source, /\.home-reveal/);
  assert.match(styles, /\.home-reveal\.is-visible/);
  assert.match(styles, /@keyframes home-card-jelly/);
  assert.match(styles, /\.home-pillar-folder:hover/);
  assert.match(styles, /\.home-product-folder:hover/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
});
test("homepage sections have dedicated responsive layouts", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /@media\(max-width:850px\)[\s\S]*\.home-story-grid/);
  assert.match(styles, /@media\(max-width:600px\)[\s\S]*\.home-method-track/);
  assert.match(styles, /@media\(max-width:380px\)[\s\S]*\.home-pillar-trigger/);
});

test("tariff selection synchronizes cards, request form and comparison matrix", () => {
  assert.match(source, /function setupTariffSelection\(\)/);
  assert.match(source, /dataset\.tariffPlan/);
  assert.match(source, /tariff-selected-status/);
  assert.match(source, /data-plan-col/);
  assert.match(source, /setupTariffSelection\(\)/);
});
test("tariff sections and comparison rows reveal progressively with accessible motion fallback", () => {
  assert.match(source, /tariff-revealed/);
  assert.match(source, /IntersectionObserver/);
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.comparison-section:not\(\.tariff-revealed\)/);
  assert.match(styles, /\.tariff-card-3d\.is-selected/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
  assert.match(styles, /:root\[data-theme="dark"\] \.tariff-request/);
});

test("tariff builder exposes only seven CRM-enforced modules and can export a license request", () => {
  for (const id of ["engineering", "engineering_plans", "finance", "order_radar", "production", "reports", "web_browser"]) {
    assert.ok(source.includes('id:"' + id + '"') || source.includes('id: "' + id + '"'));
  }
  assert.match(source, /data-feature-toggle=/);
  assert.match(source, /function tariffBuilder\(\)/);
  assert.match(source, /function createTariffLicenseRequest\(form\)/);
  assert.match(source, /SKOL_LICENSE_REQUEST/);
  assert.match(source, /downloadTariffLicenseRequest/);
  assert.match(source, /function applyTariffConfig\(config\)/);
  assert.match(source, /loadTariffConfig\(\)/);
  assert.doesNotMatch(source, /advanced_analytics/);
});

test("public tariff config follows the strict CRM schema and keeps unapproved prices blank", () => {
  const config = JSON.parse(readFileSync(new URL("../public/skol-tariff-config.json", import.meta.url), "utf8"));
  assert.equal(config.format, "SKOL_TARIFF_CONFIG");
  assert.equal(config.schemaVersion, 1);
  assert.equal(config.catalogVersion, 1);
  assert.equal(config.product, "SKOL_CRM");
  assert.deepEqual(config.plans.map(plan => plan.id), ["START", "PRO", "BUSINESS"]);
  assert.ok(config.plans.every(plan => plan.price === null));
  assert.deepEqual(config.plans[1].features, ["engineering", "finance", "production", "reports"]);
  assert.deepEqual(config.plans[2].features, ["engineering", "engineering_plans", "finance", "order_radar", "production", "reports", "web_browser"]);
});

test("tariff route waits for validated configuration before rendering the page", () => {
  assert.match(source, /async function boot\(\)/);
  assert.match(source, /if\(route==="tariffs"\)await loadTariffConfig\(\)/);
  assert.match(source, /SKOL boot failed/);
  assert.match(source, /tariff-builder/);
});

 
test("download and activation routes keep their page renderers", () => {
  assert.match(source, /function download\(\)/);
  assert.match(source, /function activation\(\)/);
  assert.match(source, /route==="download"\?download\(\):route==="activation"\?activation\(\)/);
  assert.match(source, /const VERSION = "1\.25\.0"/);
});

test("mobile navigation exposes its controlled panel and accurate expanded label", () => {
  assert.match(source, /aria-controls="mobile-menu"/);
  assert.match(source, /<div class="mobile-menu" id="mobile-menu">/);
  assert.match(source, /aria-label",open\?"Закрыть меню":"Открыть меню"/);
  assert.match(source, /event\.key==="Escape"/);
  assert.match(source, /menu\.contains\(event\.target\)\|\|mobile\.contains\(event\.target\)/);
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.menu-toggle:focus-visible/);
  assert.match(styles, /\.mobile-menu a:focus-visible/);
});

test("tariff request downloads retain the object URL until the browser can start the download", () => {
  assert.match(source, /link\.click\(\);[\s\S]*link\.remove\(\);[\s\S]*window\.setTimeout\(\(\)=>URL\.revokeObjectURL\(url\),1000\)/);
});

 
test("homepage product mockup uses the same version constant as the download page", () => {
  assert.ok(source.includes("DESKTOP '+VERSION+'"));
  assert.doesNotMatch(source, /DESKTOP 1\.24/);
});

 
test("business edition copy matches the published license feature matrix", () => {
  assert.ok(source.includes("PRO + инженерные планы, радар заказов и встроенный браузер."));
  assert.doesNotMatch(source, /расширенная аналитика/);
  assert.ok(source.includes("Что нового<br><em>в версии 1.24.0.</em>"));
  assert.ok(source.includes("LATEST NOTES"));
  assert.doesNotMatch(source, /LATEST IN SOURCE/);
});

 
test("contact form text uses real line breaks and reports clipboard failures accurately", () => {
  assert.match(source, /\.join\("\\n"\)/);
  assert.match(source, /message\+="\\n\\nJSON-КОНФИГУРАЦИЯ ДЛЯ LICENSE MANAGER\\n"/);
  assert.match(source, /const copied=await copyText\(message\)/);
  assert.match(source, /Не удалось скопировать текст автоматически/);
  assert.match(source, /async function copyText\(text\)[\s\S]*return copied/);
});

test("page transitions do not impose a fixed delay when reduced motion is enabled", () => {
  assert.match(source, /const reducedMotion=window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches/);
  assert.match(source, /if\(curtain&&!reducedMotion\)/);
  assert.match(source, /setTimeout\(\(\)=>location\.assign\(next\.href\),420\)/);
});

 
test("dark theme typography and keyboard focus retain shared tokens", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.eyebrow\{[^}]*color:var\(--muted-2\)/);
  assert.match(styles, /\.section-kicker\{[^}]*color:var\(--muted-2\)/);
  assert.match(styles, /:focus-visible/);
});

 
test("tariff comparison matrix can shrink inside narrow mobile viewports", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.comparison-section \.comparison-row,\.comparison-section \.comparison-head\{grid-template-columns:minmax\(0,1\.7fr\) repeat\(3,minmax\(35px,\.6fr\)\);gap:4px;padding:13px 8px\}/);
  assert.doesNotMatch(styles, /\.comparison-section \.comparison-row,\.comparison-section \.comparison-head\{grid-template-columns:minmax\(125px,1\.7fr\)/);
});

 
test("in-page scrolling respects reduced motion", () => {
  assert.equal((source.match(/scrollIntoView\(\{behavior:window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches\?"auto":"smooth"/g) || []).length, 2);
  assert.doesNotMatch(source, /scrollIntoView\(\{behavior:"smooth"\}\)/);
});

 
test("dark theme page metadata uses readable color tokens", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.form-hint\{margin:0;color:var\(--muted-2\)/);
  assert.match(styles, /\.release-card ul\{display:grid;gap:8px;padding-left:18px;color:var\(--muted\)/);
});

 
test("public tariff text is escaped and bounded before HTML rendering", () => {
  assert.match(source, /function escapeHtml\(value\)/);
  assert.match(source, /description\.length>240/);
  assert.match(source, /escapeHtml\(p\.desc\)/);
  assert.match(source, /escapeHtml\(p\.note\)/);
  assert.match(source, /escapeHtml\(plan\.name\)/);
});

 
test("demo controls expose pressed state and feedback toast is announced", () => {
  assert.match(source, /aria-pressed="true" aria-controls="demo-content"/);
  assert.match(source, /aria-pressed="false" aria-controls="demo-content"/);
  assert.match(source, /x\.setAttribute\("aria-pressed",String\(active\)\)/);
  assert.match(source, /aria-live","polite"/);
});

 
test("catalogue and homepage label styles are theme-aware", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.ok(styles.includes(".catalog-list-head>span{color:var(--muted-2)"));
  assert.ok(styles.includes(".capability-card-top{display:flex;justify-content:space-between;color:var(--muted-2)"));
  assert.ok(styles.includes(".release-heading>span{color:var(--muted-2)"));
  assert.ok(styles.includes(".home-method-step>small{display:block;margin-top:29px;color:var(--muted-2)"));
});

test("dark theme keeps activation, folder and tariff text readable on dark surfaces", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.activation-cta\{[^}]*background:var\(--surface-soft\)/);
  assert.match(styles, /\.folder-cover-copy \.eyebrow\{[^}]*color:var\(--muted\)/);
  assert.match(styles, /\.home-folder-kicker\{[^}]*color:var\(--muted\)/);
  assert.match(styles, /\.home-folder-tags i\{[^}]*color:var\(--muted\)/);
  assert.match(styles, /\.folder-art-caption\{[^}]*color:var\(--muted\)/);
  assert.match(styles, /\.home-folder-art-label\{[^}]*color:var\(--muted\)/);
  assert.match(styles, /:root\[data-theme="dark"\] \.folder-tab-state\{color:#8fc58c\}/);
  assert.match(styles, /:root\[data-theme="dark"\] \.home-live-state\{color:#8fc58c\}/);
  assert.match(styles, /\.tariff-hero-meta\{[^}]*color:var\(--muted\)/);
  assert.match(styles, /\.tariff-form label\{color:var\(--ink\)\}/);
  assert.match(styles, /:root\[data-theme="dark"\] \.tariff-form input/);
  assert.match(styles, /:root\[data-theme="dark"\] \.tariff-form input::placeholder/);
});

test("catalogue folder grids allow their text and artwork columns to shrink", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.folder-cover\{[^}]*grid-template-columns:minmax\(0,\.82fr\) minmax\(0,1\.18fr\)/);
  assert.match(styles, /\.folder-cover-copy\{[^}]*min-width:0/);
  assert.match(styles, /\.folder-cover-art\{[^}]*min-width:0/);
  assert.match(styles, /\.folder-reveal-inner\{[^}]*grid-template-columns:minmax\(0,1\.15fr\) minmax\(0,1fr\) auto/);
  assert.match(styles, /@media\(max-width:850px\)[\s\S]*\.folder-cover\{grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
});
