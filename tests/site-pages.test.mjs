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
  assert.match(source, /setupTheme\(\);setupCatalogFolders\(\);setupMotion\(\)/);
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
test("license page no longer renders animated particle canvas", () => {
  assert.match(source, /function setupParticles\(\)\{\}/);
  assert.match(source, /key-visual-plate/);
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
