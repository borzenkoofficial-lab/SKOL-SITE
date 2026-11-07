# SKOL SOFTWARE — Technical Implementation Plan 001

**Target branch:** design/skol-experimental-industrial-2026-11  
**Base snapshot:** main at d64f0a16aa64607f65dd844b6287431e71f3258d  
**Production:** untouched; no merge, domain, or Vercel production-setting changes in this phase.

## 1. Current repository baseline

The current project is a small Vite static site:
- src/main.js is approximately 106 KB and currently owns most page rendering and interaction.
- src/styles.css is approximately 194 KB and contains the bulk of visual styling.
- Motion code is split across several files: cinematic backdrop, motion choreography, motion scenes, motion system, and WebGL scene.
- Tariff configuration logic exists separately in src/tariff-config.js.
- Automated checks run through npm run check; production build through npm run build.
- Existing README documents product pages and the CRM repository as the source of truth for feature gates.

This baseline is important: do not start by replacing the whole application or adding a new framework. First isolate presentation from business rules and remove redundant motion layers only after dependency tracing.

## 2. Proposed target architecture

Keep Vite + vanilla JavaScript for the first delivery unless a measured requirement proves React is necessary. A framework migration would add scope and risk without improving the initial static product catalogue.

Proposed gradual structure:

    src/
      app/
        bootstrap.js
        router.js
      components/
        header/
        footer/
        buttons/
        product-card/
        section-label/
        diagram/
      pages/
        home/
        catalog/
        product-crm/
        platform/
        pricing/
        support/
        download/
        activation/
      features/
        license-configurator/
        release-status/
        contact/
      data/
        products.js
        navigation.js
      motion/
        reveal.js
        magnetic.js
        hero-diagram.js
        route-transition.js
      styles/
        tokens.css
        reset.css
        typography.css
        layout.css
        components.css
        pages/
          home.css
          product.css
          pricing.css
      integrations/
        license-manager.js
        github-releases.js
      main.js
      styles.css
    tests/
      ...

This is a target map, not a requirement to move every file in one commit. Use incremental extraction and preserve current route behavior.

## 3. Architecture boundaries

### Presentation
Owns semantic markup, responsive layout, visual states, and animations. Must not calculate license entitlements or invent product data.

### Product content
A data layer for product name, availability, screenshots, verified capabilities, operating system requirements, and links. Each claim should include a source reference in code comments or documentation.

### License configurator
Preserve the current configuration schema and validation behavior. Treat public/skol-tariff-config.json and the authoritative CRM EDITION_FEATURES matrix as data contracts. Never derive new feature IDs from marketing copy.

### Release status
Show a downloadable build only when a real GitHub Release asset exists and artifact metadata is available. Source version alone is not proof of a published installer.

### Contact
Use only approved, verified contact destinations. Do not ship placeholder mail addresses or invented contact data. Keep inquiry submission behind an explicitly configured endpoint or a clearly labelled external contact method.

## 4. Motion implementation strategy

- CSS transitions for hover, focus, active indicators, and simple reveals.
- A small IntersectionObserver utility for one-time section reveals.
- GSAP only if timeline sequencing or scroll orchestration materially improves the result.
- No Three.js in the initial homepage. The hero uses a lightweight SVG/HTML 2D system diagram.
- Pointer tracking must be optional, clamped, and disabled on touch/reduced-motion.
- Avoid permanent blur layers, large animated filters, and layout-affecting animation.
- One motion owner per element. Do not initialize multiple legacy motion systems on the same target.

## 5. Data and content contracts

Before product-page implementation:
1. Read the current CRM source branch and confirm the real feature matrix.
2. Confirm actual installer release/tag and asset URL.
3. Confirm Windows support and local data-storage statements.
4. Confirm license activation and offline limitations.
5. Confirm which capabilities are included in START, PRO, BUSINESS, and whether any feature is currently unavailable.
6. Keep price as “по запросу” unless a price is approved.

No invented reviews, customer logos, case studies, user counts, performance metrics, security certifications, or cloud capabilities.

## 6. SEO and delivery

- Unique title/description per route.
- Canonical URLs only for approved production domain; preview URLs must not become canonical.
- Open Graph metadata and favicon.
- Sitemap and robots policy reviewed before production.
- Image assets in AVIF/WebP with width/height or aspect-ratio reservation.
- Lazy loading for below-fold images.
- No large JS dependency for decorative effects.

## 7. Test plan

### Automated
- npm run check
- npm run build
- Unit tests for product data, route mapping, tariff schema, and release status.
- Regression tests for existing route IDs, anchors, and license request schema.

### Browser / visual
Capture desktop 1440×900, tablet 768×1024, mobile 390×844, and narrow mobile 320×720.
Check:
- no horizontal overflow;
- no clipping or overlap;
- all buttons and links work;
- keyboard focus is visible;
- reduced-motion mode is correct;
- no console errors;
- no broken assets;
- no unexpected layout shift;
- product screenshots are authentic.

### Performance
Measure Lighthouse and Core Web Vitals on the preview. Do not claim a score before measurement. Prioritize LCP, CLS, INP, image payload, and JS execution.

## 8. Branch and deployment safety

- All work remains on design/skol-experimental-industrial-2026-11.
- Do not merge to main.
- Do not modify Vercel production project settings, production domains, environment variables, or deployment aliases.
- Preview deployment is acceptable only if it is automatically created for this branch and does not change production.
- If preview is blocked by Vercel authentication or plan limits, report that explicitly; do not substitute an unverified URL.
- Open a draft PR only after the first integrated implementation and automated checks are ready.
- Production release requires separate explicit approval after visual QA.

## 9. Delivery gates

**Gate A — Design:** approve art direction and homepage structure.  
**Gate B — Prototype:** standalone homepage concept reviewed on desktop and mobile.  
**Gate C — Integration:** implement approved design into actual routes without breaking tariff/license contracts.  
**Gate D — QA:** automated tests, build, browser checks, accessibility, and performance evidence.  
**Gate E — Release:** draft PR review, merge approval, then separately authorized production deployment.
