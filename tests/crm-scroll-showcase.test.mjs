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

test("CRM showcase contains distinct overview, leads and object screens", () => {
  for (const token of ['data-crm-view="overview"', 'data-crm-view="leads"', 'data-crm-view="objects"', "Обзор бизнеса", "Заявки", "Объекты"]) {
    assert.ok(source.includes(token), token);
  }
});

test("scroll progress drives the stage and active CRM screen", () => {
  assert.match(source, /crm-scroll-progress/);
  assert.match(source, /data-crm-progress/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /prefers-reduced-motion/);
});

test("CRM preview uses responsive light and lime interface styling", () => {
  assert.match(styles, /--lime:#b7ed32/);
  assert.match(styles, /@media\(max-width:760px\)/);
  assert.match(styles, /prefers-reduced-motion/);
});
