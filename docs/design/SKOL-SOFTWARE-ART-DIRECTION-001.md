# SKOL SOFTWARE — Art Direction 001

**Status:** approved direction / implementation brief  
**Direction:** B — Experimental Industrial  
**Motion intensity:** High, functional  
**Base:** `main` snapshot; isolated branch only  
**Production constraint:** do not merge or change production during concept and prototype work.

## 1. Product positioning

SKOL SOFTWARE is a product platform for practical business software. It presents available products, explains their real capabilities and constraints, helps visitors evaluate a product, and routes qualified interest to a manager or a supported download.

The first featured product is SKOL CRM. The website must not imply that planned products, integrations, automation, cloud sync, or capabilities exist unless verified in the CRM source.

**Core message:** Complex operations. Under control.  
**Supporting message:** Software tools for managing clients, projects, operations, and business economics.

## 2. Art direction: Experimental Industrial

A visual system combining Swiss editorial composition, industrial information design, technical diagrams, and cinematic interface motion.

### Visual principles
- Editorial asymmetry: strong left alignment, deliberate imbalance, large negative space.
- Typographic hierarchy: oversized grotesk headlines; compact mono labels, indices, metadata, and technical annotations.
- Graphic language: coordinate marks, measurement lines, modular grids, node connections, registration marks, section numbers, and restrained diagrammatic forms.
- Product proof: real application screenshots and accurately recreated interface fragments; no fictional dashboard screens.
- Surfaces: matte white/off-white fields, graphite panels, thin rules, subtle paper-like tonal changes. Glass only as a rare functional accent.
- Lime is a signal color for active state, focus, selected modules, and calls to action—not a page-wide background.
- No decorative 3D objects in the hero, no random gradients, no neon, no generic SaaS card wall, no stock-photo filler.

### Brand tokens
- Canvas: `#FFFFFF`
- Soft surface: `#F2F4F1`
- Graphite: `#20242A`
- Secondary text: `#66706A`
- Lime: `#A8E500`
- Lime hover: `#8FC500`
- Rule: `rgba(32,36,42,.16)`

These are concept tokens. Confirm against the current approved CRM brand assets before final implementation.

### Typography
- Display: modern grotesk with a broad family and variable weights.
- Body: neutral sans, optimized for long-form product explanations.
- Technical labels: monospaced family for indices, version labels, dimensions, and metadata.
- Avoid mixing more than two type families plus a mono utility face.
- Use fluid type scales with clamped values; keep body text readable on narrow screens.

## 3. Homepage art direction / content sequence

### Global navigation
Left: SKOL wordmark and SOFTWARE descriptor.  
Center/right: Products, Platform, Pricing, Support.  
Primary action: “Discuss a product”.  
Mobile: compact menu with clear focus and escape handling.

### 01 — Hero / system statement
Eyebrow: SOFTWARE / SYSTEMS / 001  
Headline: “Сложные процессы. Под контролем.”  
Subline: “Программные инструменты для управления работой, проектами и экономикой бизнеса.”  
Actions: “Исследовать продукты” and “О платформе”.

Visual: a 2D operational system diagram built from a strict grid, nodes, connector lines, index marks, and a small active lime node. The diagram should communicate structure, not pretend to be a live product feature. No 3D model, monitor mockup, particles, or decorative glow.

### 02 — Product system
Section label: 02 / PRODUCT SYSTEM  
Headline: “Инструменты для реальной работы.”  
Featured product: SKOL CRM, marked available only if the current release/download state confirms it.  
Use a verified screenshot of the actual CRM. If none is available, use a clearly labelled interface crop from the real application—not a fabricated dashboard.

### 03 — Operational model
A three-part editorial explanation:
- Information — clients, requests, objects, and work context.
- Control — tasks, stages, responsibilities, and operational visibility.
- Economics — estimates, budgets, costs, and reporting where supported by the actual CRM edition.

Avoid promises of automatic synchronization or cloud infrastructure unless verified.

### 04 — Product detail preview
A close-up of the actual CRM UI with numbered annotations. Each annotation must map to a real screen or documented feature. Use a restrained scroll reveal and one deliberate image mask transition.

### 05 — Platform principles
Local-first where accurate, transparent limitations, versioned product delivery, and practical support. Explain the actual Windows/Electron/SQLite model and internet-dependent features honestly.

### 06 — Final conversion
Headline: “Найдём решение для ваших процессов.”  
Action: manager contact / product inquiry. Do not imply online payment or automatic key issuance if not implemented.

### Footer
Product navigation, support, contacts, version/release links, legal links, and company information only when verified.

## 4. Motion direction

High motion intensity means choreographed, responsive motion—not continuous animation.

- Hero: headline mask reveal (450–650 ms), diagram line draw (600–900 ms), node activation (180–240 ms).
- Scroll reveals: 420–650 ms, stagger 50–80 ms; trigger once unless a deliberate scrub interaction is justified.
- Magnetic CTA: restrained pointer displacement, maximum 5–7 px, disabled for touch and reduced motion.
- Product media: clipped reveal and subtle 1–1.015 scale; no perspective tilt that harms readability.
- Navigation: 160–220 ms active indicator.
- Route transitions: 300–450 ms opacity/transform; preserve browser navigation semantics.
- Use GSAP only for timelines/scroll orchestration where needed. Prefer CSS transitions for simple states.
- Use `transform` and `opacity`; avoid animating layout properties and continuous large-area blur.
- Respect `prefers-reduced-motion`, keyboard navigation, and touch input.

## 5. Responsive behavior

- 1440+: editorial two-column hero, diagram occupies the right half.
- 1024: reduce diagram density and headline scale.
- 768: stack hero; diagram becomes a compact horizontal/vertical schematic.
- 390 and 320: one-column layout, no horizontal overflow, hide nonessential coordinate labels, maintain minimum 44 px interactive targets.
- No essential information may exist only on hover.

## 6. Accessibility and performance

- Semantic landmarks and heading order.
- Visible keyboard focus; all controls operable without pointer.
- Contrast checked for graphite, secondary text, lime, and button states.
- Reduced-motion mode disables nonessential movement and pointer tracking.
- Reserve image dimensions to prevent layout shift.
- Lazy-load below-the-fold imagery; use responsive image formats.
- Avoid loading Three.js unless an approved section genuinely needs it.
- Target stable Core Web Vitals; verify with Lighthouse/real browser rather than assuming.

## 7. Content truth rules

- Product claims must map to verified CRM features and edition gates.
- Do not claim cloud sync, multi-device real-time collaboration, automatic lead discovery, automatic payments, remote offline-license revocation, or guaranteed completeness of search sources unless the current implementation proves it.
- Tariffs and license feature IDs must be sourced from the CRM repository's authoritative `EDITION_FEATURES` matrix.
- Price remains “по запросу” unless an approved price is supplied.
- Download availability and version must come from an actual release artifact, not package.json alone.

## 8. Acceptance criteria

1. The page reads as a distinctive software brand, not a generic SaaS template.
2. Hero is typographically dominant and diagrammatic, with no decorative 3D model.
3. Real CRM interface is used and accurately represented.
4. All page sections work at 320, 390, 768, 1024, and 1440 px.
5. No clipping, overlap, horizontal overflow, or unexpected layout shift.
6. Motion is smooth, purposeful, and disabled appropriately for reduced motion.
7. All links, CTAs, and navigation work.
8. No unverified product claims or invented prices.
9. `npm run check` and `npm run build` pass.
10. Production domain and `main` remain unchanged until explicit acceptance and merge approval.
