import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main=readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const motion=readFileSync(new URL("../src/cinematic-hero.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/cinematic-hero.css",import.meta.url),"utf8");
const shared=readFileSync(new URL("../src/architectural-system.css",import.meta.url),"utf8");

test("homepage hero uses the architectural SKOL wordmark and linked system diagram",()=>{
  for(const token of [
    'class="platform-hero cinematic-hero section-pad"',
    "data-cinematic-wordmark",
    "Программные продукты.<br><em>Связанные процессы.</em>",
    'class="cinematic-hero-diagram"',
    'role="group"',
    "Открыть каталог",
    "Наши решения"
  ]) assert.ok(main.includes(token),"Missing hero token: "+token);
  assert.ok(!main.includes("hero-monitor"));
  assert.ok(!main.includes("hero-motion-stage"));
});

test("hero motion is frame-batched, pointer-aware and reduced-motion safe",()=>{
  for(const token of ["requestAnimationFrame","prefers-reduced-motion","removeEventListener","pointerleave"]) assert.ok(motion.includes(token));
  assert.ok(main.includes('["cinematic hero",initCinematicHero]'));
});

test("hero and shared design system support responsive breakpoints and both themes",()=>{
  for(const breakpoint of ["1100","850","760","520","380"]) assert.ok(shared.includes("max-width:"+breakpoint+"px"));
  assert.ok(shared.includes("prefers-reduced-motion:reduce"));
  assert.ok(css.includes(':root[data-theme="dark"]'));
  assert.ok(shared.includes(':root[data-theme="dark"]'));\n  assert.ok(shared.includes(":root[data-theme=\"dark\"] .inner-hero h1"));
  assert.ok(shared.includes(".site-header"));
  assert.ok(shared.includes(".inner-hero"));
});

test("download release status remains live and accurately describes missing installers",()=>{
  for(const token of [
    "function setupReleaseStatus()",
    "GitHub Releases недоступен",
    "установочные файлы к нему не прикреплены",
    '["release status",setupReleaseStatus]',
    'id="release-status" role="status"',
    "Версия исходного кода сама по себе не означает",
    "Проверьте релиз"
  ]) assert.ok(main.includes(token),"Missing release-status token: "+token);
});
