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
