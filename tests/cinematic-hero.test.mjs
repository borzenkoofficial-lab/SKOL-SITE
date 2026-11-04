import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const main=readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const motion=readFileSync(new URL("../src/cinematic-hero.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/cinematic-hero.css",import.meta.url),"utf8");

test("homepage hero uses the cinematic SKOL wordmark and product architecture diagram",()=>{
  assert.match(main,/class="platform-hero cinematic-hero section-pad"/);
  assert.match(main,/data-cinematic-wordmark/);
  assert.match(main,/Создаём инструменты\.<br><em>Меняем подход к работе\.<\/em>/);
  assert.match(main,/class="cinematic-hero-diagram"/);
  assert.match(main,/Исследовать платформу/);
  assert.match(main,/Наши решения/);
  assert.doesNotMatch(main,/class="hero-motion-stage"/);
});

test("hero motion is frame-batched, pointer-aware and reduced-motion safe",()=>{
  assert.match(motion,/requestAnimationFrame/);
  assert.match(motion,/prefers-reduced-motion/);
  assert.match(motion,/removeEventListener/);
  assert.match(motion,/pointerleave/);
});

test("hero has responsive breakpoints for laptop, tablet and compact mobile widths",()=>{
  assert.match(css,/@media\(max-width:1100px\)/);
  assert.match(css,/@media\(max-width:850px\)/);
  assert.match(css,/@media\(max-width:520px\)/);
  assert.match(css,/@media\(max-width:380px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
