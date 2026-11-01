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
