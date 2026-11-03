const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export function initMotionSystem(root = document) {
  if (root.documentElement?.dataset.motionSystemReady === "true") return;
  if (root.documentElement) root.documentElement.dataset.motionSystemReady = "true";

  const reduced = window.matchMedia(REDUCED).matches;
  const finePointer = window.matchMedia(FINE_POINTER).matches;

  const revealTargets = root.querySelectorAll(
    ".contact-grid, .footer-top, .footer-bottom, .comparison-table, .tariff-intro-row, .builder-controls, .builder-summary, .home-story-board, .home-product-folder, .home-pillar-folder, .home-product-footnote"
  );

  // Staggered kinetic typography: preserve the original text and accessibility tree.
  root.querySelectorAll(".skol-expansion > span").forEach((line, index) => {
    line.classList.add("motion-type-line");
    line.style.setProperty("--motion-line-index", String(index));
  });

  // Scroll-linked depth is applied with the independent CSS translate property,
  // so existing transforms (3D hero, card hover and page transitions) remain intact.
  const depthTargets = root.querySelectorAll(".hero-background-grid, .home-story-orbit, .tariff-builder-backdrop");
  let scrollFrame = 0;
  const updateDepth = () => {
    const viewport = window.innerHeight || 1;
    depthTargets.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const offset = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - viewport / 2) / viewport));
      element.style.setProperty("--motion-scroll-y", (offset * -22).toFixed(1) + "px");
    });
    scrollFrame = 0;
  };
  if (depthTargets.length && !reduced) {
    updateDepth();
    window.addEventListener("scroll", () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(updateDepth);
    }, { passive: true });
  }

  if (!reduced && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("motion-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    revealTargets.forEach((element) => {
      if (element.classList.contains("is-visible") || element.classList.contains("tariff-revealed")) return;
      element.classList.add("motion-reveal");
      observer.observe(element);
    });
  }

  if (!finePointer || reduced) return;

  const surfaces = root.querySelectorAll(
    ".button, .builder-preset, .builder-module, .folder-trigger, .home-folder-trigger, .home-pillar-trigger, .activation-step, .release-card, .side-card, .metric-card, .demo-panel, .home-product-folder, .home-pillar-folder, .home-story-board, .tariff-card"
  );

  surfaces.forEach((surface) => {
    if (surface.dataset.motionSurface === "true") return;
    surface.dataset.motionSurface = "true";
    surface.classList.add("motion-surface");

    const spotlight = document.createElement("span");
    spotlight.className = "motion-spotlight";
    spotlight.setAttribute("aria-hidden", "true");
    surface.appendChild(spotlight);

    let frame = 0;
    surface.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        surface.style.setProperty("--motion-x", (x * 100).toFixed(1) + "%");
        surface.style.setProperty("--motion-y", (y * 100).toFixed(1) + "%");
        surface.classList.add("motion-hovering");
        frame = 0;
      });
    }, { passive: true });

    surface.addEventListener("pointerleave", () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      surface.classList.remove("motion-hovering");
      surface.style.setProperty("--motion-x", "50%");
      surface.style.setProperty("--motion-y", "50%");
      if (surface.classList.contains("motion-magnetic")) {
        surface.style.setProperty("--motion-magnet-x", "0px");
        surface.style.setProperty("--motion-magnet-y", "0px");
      }
    }, { passive: true });

    if (surface.matches(".button")) {
      surface.classList.add("motion-magnetic");
      surface.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const rect = surface.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        surface.style.setProperty("--motion-magnet-x", (x * 5).toFixed(1) + "px");
        surface.style.setProperty("--motion-magnet-y", (y * 4).toFixed(1) + "px");
      }, { passive: true });
    }
  });
}
