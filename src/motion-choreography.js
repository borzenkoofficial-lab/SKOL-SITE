const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export function initMotionChoreography(root = document) {
  const board = root.querySelector(".home-story-board");
  if (!board || board.dataset.choreographyReady === "true") return;
  board.dataset.choreographyReady = "true";

  const flow = board.querySelector(".home-story-flow");
  if (!flow) return;

  const reducedQuery = window.matchMedia(REDUCED);
  const finePointerQuery = window.matchMedia(FINE_POINTER);
  if (reducedQuery.matches) return;

  board.classList.add("story-choreography-ready");
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let scrollDepth = 0;

  const render = () => {
    flow.style.setProperty("--story-tilt-x", pointerY.toFixed(2) + "deg");
    flow.style.setProperty("--story-tilt-y", pointerX.toFixed(2) + "deg");
    flow.style.setProperty("--story-camera-y", scrollDepth.toFixed(1) + "px");
    frame = 0;
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(render);
  };

  const updateScroll = () => {
    const rect = board.getBoundingClientRect();
    const viewport = Math.max(1, window.innerHeight);
    const centerOffset = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    scrollDepth = Math.max(-1, Math.min(1, centerOffset)) * -7;
    schedule();
  };

  const onPointerMove = (event) => {
    if (!finePointerQuery.matches || event.pointerType === "touch") return;
    const rect = board.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    pointerX = x * 2.4;
    pointerY = y * -2.0;
    schedule();
  };

  const resetPointer = () => {
    pointerX = 0;
    pointerY = 0;
    schedule();
  };

  board.addEventListener("pointermove", onPointerMove, { passive: true });
  board.addEventListener("pointerleave", resetPointer, { passive: true });
  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll, { passive: true });
  updateScroll();

  const onMotionPreferenceChange = (event) => {
    if (!event.matches) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pointerX = 0;
    pointerY = 0;
    scrollDepth = 0;
    flow.style.removeProperty("--story-tilt-x");
    flow.style.removeProperty("--story-tilt-y");
    flow.style.removeProperty("--story-camera-y");
    board.classList.remove("story-choreography-ready");
    board.removeEventListener("pointermove", onPointerMove);
    board.removeEventListener("pointerleave", resetPointer);
    window.removeEventListener("scroll", updateScroll);
    window.removeEventListener("resize", updateScroll);
  };
  reducedQuery.addEventListener?.("change", onMotionPreferenceChange);
}
