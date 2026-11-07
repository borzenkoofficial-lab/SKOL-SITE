import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizePublicTariffConfig } from "../src/tariff-config.js";
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
  assert.match(styles, /--canvas:#ffffff/);
  assert.match(styles, /prefers-reduced-motion/);
});
test("SKOL brand palette is white and lime across document, controls and both themes", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(html, /name="theme-color" content="#ffffff"/);
  assert.match(styles, /--canvas:#ffffff/);
  assert.match(styles, /--accent:#a8e500/);
  assert.match(styles, /--accent-strong:#8fc500/);
  assert.match(styles, /--accent:#b8ff00/);
  assert.match(styles, /--ink:#202b3b/);
  assert.ok(!styles.includes("#ef6a21") && !styles.includes("#dc5510") && !styles.includes("rgba(239,106,33"));
  assert.match(source, /dark\?"#0b1019":"#ffffff"/);
});

test("theme control is initialized and has an accessible label", () => {
  assert.match(source, /aria-label="Включить тёмную тему"/);
  assert.match(source, /const setupTasks=\[/);
  for (const setup of ["theme","catalog folders","home interactions","motion","demo","forms","tariff motion","tariff selection"]) {
    assert.ok(source.includes('["' + setup + '",setup'));
  assert.ok(source.includes('["motion system",()=>initMotionSystem(document)]'));
  }
});

test("architectural editorial visual system is present across SKOL", () => {
  const styles = readFileSync(new URL("../src/cinematic-hero.css", import.meta.url), "utf8");
  const shared = readFileSync(new URL("../src/architectural-system.css", import.meta.url), "utf8");
  assert.match(source, /class="platform-hero cinematic-hero section-pad"/);
  assert.match(source, /data-cinematic-wordmark/);
  assert.match(source, /diagram-module/);
  assert.match(styles, /\.cinematic-hero/);
  assert.match(styles, /#a8e500/);
  assert.match(shared, /\.site-header/);
  assert.match(shared, /\.inner-hero/);
  assert.match(shared, /prefers-reduced-motion:reduce/);
});
test("homepage uses the dedicated cinematic motion controller and tariff motion remains scoped", () => {
  assert.match(source, /initCinematicHero/);
  assert.doesNotMatch(source, /function setupParticles\(\)/);
  assert.match(source, /function setupTariffMotion\(\)/);
  assert.match(source, /tariff-particle-field/);
  assert.match(source, /key-visual-plate/);
  const motion = readFileSync(new URL("../src/cinematic-hero.js", import.meta.url), "utf8");
  assert.match(motion, /requestAnimationFrame/);
  assert.match(motion, /prefers-reduced-motion/);
  assert.match(motion, /pointerleave/);
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

test("SKOL brand acronym is expanded in the cinematic homepage wordmark", () => {
  assert.match(source, /Система координации операций и логики/);
  assert.match(source, /data-cinematic-wordmark/);
  for (const letter of ['data-letter="С">С</span>','data-letter="К">К</span>','data-letter="О">О</span>','data-letter="Л">Л</span>']) {
    assert.ok(source.includes(letter), "Missing wordmark letter: " + letter);
  }
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
  assert.match(styles, /box-shadow:0 0 8px rgba\(168,229,0/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
});

test("cinematic hero diagram is responsive, accessible and free of the old 3D dashboard mockup", () => {
  const heroStyles = readFileSync(new URL("../src/cinematic-hero.css", import.meta.url), "utf8");
  assert.match(source, /cinematic-hero-diagram/);
  assert.match(source, /diagram-module/);
  assert.doesNotMatch(source, /hero-monitor/);
  assert.match(heroStyles, /@media\(max-width:520px\)/);
  assert.match(heroStyles, /prefers-reduced-motion:reduce/);
  assert.match(heroStyles, /\.cinematic-hero-diagram/);
});