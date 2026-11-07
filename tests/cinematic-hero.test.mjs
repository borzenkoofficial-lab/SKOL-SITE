import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main=readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const motion=readFileSync(new URL("../src/cinematic-hero.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/cinematic-hero.css",import.meta.url),"utf8");
const shared=readFileSync(new URL("../src/architectural-system.css",import.meta.url),"utf8");

test("homepage hero uses the architectural SKOL wordmark and linked system diagram",()=>{
  assert.match(main,/class="platform-hero cinematic-hero section-pad"/);
  assert.match(main,/data-cinematic-wordmark/);
  assert.match(main,/Программные продукты\.<br><em>Связанные процессы\.<\/em>/);
  assert.match(main,/class="cinematic-hero-diagram"/);
  assert.match(main,/role="group"/);
  assert.match(main,/Открыть каталог/);
  assert.match(main,/Наши решения/);
  assert.doesNotMatch(main,/hero-monitor|hero-motion-stage/);
});

test("hero motion is frame-batched, pointer-aware and reduced-motion safe",()=>{
  assert.match(motion,/requestAnimationFrame/);
  assert.match(motion,/prefers-reduced-motion/);
  assert.match(motion,/removeEventListener/);
  assert.match(motion,/pointerleave/);
  assert.match(main,/\["cinematic hero",initCinematicHero\]/);
});

test("hero and shared design system support responsive breakpoints and both themes",()=>{
  for(const breakpoint of ["1100","850","520","380"]) assert.ok(css.includes("max-width:"+breakpoint+"px"));
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/:root\[data-theme="dark"\]/);
  assert.match(shared,/:root\[data-theme="dark"\]/);
  assert.match(shared,/\.site-header/);
  assert.match(shared,/\.inner-hero/);
});

test("download release status remains live and accurately describes missing installers",()=>{
  assert.match(main,/function setupReleaseStatus\(\)/);
  assert.match(main,/GitHub Releases недоступен/);
  assert.match(main,/установочные файлы к нему не прикреплены/);
  assert.match(main,/\["release status",setupReleaseStatus\]/);
});
