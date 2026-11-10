import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../src/crm-scroll-showcase.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/crm-scroll-showcase.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");

test("homepage mounts the scroll-led CRM product experience", () => {
  assert.match(main, /initCrmScrollShowcase/);
  assert.match(source, /hero\.insertAdjacentHTML\("afterend",crmScreen\(\)\)/);
  assert.match(source, /crm-scroll-showcase/);
});

test("CRM showcase contains five distinct business workflow screens", () => {
  for (const token of ['data-crm-view="overview"', 'data-crm-view="leads"', 'data-crm-view="objects"', 'data-crm-view="estimate"', 'data-crm-view="radar"', "Обзор бизнеса", "Заявки", "Объекты", "Производство и ПИ", "Радар заказов"]) {
    assert.ok(source.includes(token), token);
  }
});

test("scroll progress drives all five stages and respects reduced motion", () => {
  assert.match(source, /crm-scroll-progress/);
  assert.match(source, /data-crm-progress/);
  assert.match(source, /Math\.min\(4,Math\.floor\(progress\*5\)\)/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /prefers-reduced-motion/);
});

test("CRM preview uses responsive light and lime interface styling", () => {
  assert.match(styles, /--lime:#b7ed32/);
  assert.match(styles, /@media\(max-width:760px\)/);
  assert.match(styles, /crm-app-cost-row/);
  assert.match(styles, /crm-app-radar-summary/);
  assert.match(styles, /prefers-reduced-motion/);
});
