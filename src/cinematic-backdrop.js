const REDUCED = "(prefers-reduced-motion: reduce)";
const COARSE = "(pointer: coarse)";
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function initCinematicBackdrop(root = document) {
  const body = root.body || root.querySelector("body");
  const app = root.querySelector("#app");
  if (!body || !app || body.dataset.cinematicBackdrop === "true") return;
  body.dataset.cinematicBackdrop = "true";

  const canvas = document.createElement("canvas");
  canvas.className = "skol-cinematic-backdrop";
  canvas.setAttribute("aria-hidden", "true");
  body.insertBefore(canvas, body.firstChild);

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) { canvas.remove(); return; }

  const reduced = window.matchMedia(REDUCED);
  const coarse = window.matchMedia(COARSE);
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const state = {
    width: 1, height: 1, dpr: 1, pointerX: .5, pointerY: .42,
    targetX: .5, targetY: .42, scroll: 0, targetScroll: 0,
    time: 0, frame: 0, visible: true, ripples: [], particles: [],
    last: 0, disposed: false
  };

  const createParticles = () => {
    const count = Math.round(clamp(state.width * state.height / 19000, 28, coarse.matches ? 34 : 76));
    state.particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * state.width, y: Math.random() * state.height,
      radius: .55 + Math.random() * 1.25, phase: Math.random() * Math.PI * 2,
      speed: .12 + Math.random() * .24, drift: .12 + Math.random() * .32,
      link: index % 3 === 0
    }));
  };

  const resize = () => {
    state.width = Math.max(1, window.innerWidth);
    state.height = Math.max(1, window.innerHeight);
    state.dpr = Math.min(window.devicePixelRatio || 1, coarse.matches ? 1 : 1.35);
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = state.width + "px";
    canvas.style.height = state.height + "px";
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    createParticles();
    draw(0);
  };

  const draw = (delta) => {
    const { width, height } = state;
    ctx.clearRect(0, 0, width, height);
    state.pointerX += (state.targetX - state.pointerX) * .055;
    state.pointerY += (state.targetY - state.pointerY) * .055;
    state.scroll += (state.targetScroll - state.scroll) * .045;
    const px = state.pointerX * width;
    const py = state.pointerY * height;
    const drift = state.scroll * .00022;

    // Broad, soft light sources — the composition follows the pointer subtly.
    const glow = ctx.createRadialGradient(px, py, 0, px, py, Math.max(width, height) * .62);
    glow.addColorStop(0, "rgba(231,105,48,.19)");
    glow.addColorStop(.28, "rgba(195,124,82,.085)");
    glow.addColorStop(1, "rgba(195,124,82,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const ambientX = width * (.78 + Math.sin(state.time * .00012) * .055);
    const ambientY = height * (.28 + Math.cos(state.time * .0001) * .06) - state.scroll * .035;
    const ambient = ctx.createRadialGradient(ambientX, ambientY, 0, ambientX, ambientY, Math.max(width, height) * .48);
    ambient.addColorStop(0, "rgba(225,151,104,.12)");
    ambient.addColorStop(1, "rgba(225,151,104,0)");
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, width, height);

    // Architectural coordinate grid with a restrained perspective fade.
    const spacing = coarse.matches ? 58 : 46;
    ctx.save();
    ctx.translate((px - width / 2) * .012, -state.scroll * .09);
    ctx.lineWidth = 1;
    for (let x = (width % spacing) - spacing; x < width + spacing; x += spacing) {
      const fade = 1 - Math.abs(x - width / 2) / (width * .72);
      ctx.strokeStyle = "rgba(132,112,94," + (Math.max(0, fade) * .085) + ")";
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = ((height % spacing) - spacing + (state.scroll * .12 % spacing)); y < height + spacing; y += spacing) {
      const fade = 1 - Math.abs(y - height / 2) / (height * .82);
      ctx.strokeStyle = "rgba(132,112,94," + (Math.max(0, fade) * .065) + ")";
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.restore();

    // Floating dust and faint links, with pointer influence.
    const points = state.particles;
    points.forEach((particle, index) => {
      const wave = Math.sin(state.time * .00035 * particle.speed + particle.phase);
      const x = particle.x + wave * 12 + (state.pointerX - .5) * particle.drift * 28;
      const y = particle.y + Math.cos(state.time * .00028 * particle.speed + particle.phase) * 10
        - drift * (particle.y + 30) + (state.pointerY - .5) * particle.drift * 18;
      const dx = x - px, dy = y - py;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const proximity = clamp(1 - distance / 260, 0, 1);
      const alpha = .2 + proximity * .48;
      ctx.fillStyle = "rgba(211,112,66," + alpha + ")";
      ctx.beginPath(); ctx.arc(x, y, particle.radius + proximity * .7, 0, Math.PI * 2); ctx.fill();

      if (particle.link && index % 2 === 0) {
        const next = points[(index + 7) % points.length];
        const nx = next.x + Math.sin(state.time * .0002 + next.phase) * 10;
        const ny = next.y + Math.cos(state.time * .0002 + next.phase) * 10 - drift * (next.y + 20);
        const distance2 = Math.hypot(nx - x, ny - y);
        if (distance2 < 190) {
          ctx.strokeStyle = "rgba(178,123,91," + ((1 - distance2 / 190) * .14) + ")";
          ctx.lineWidth = .7;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
        }
      }
    });

    // Click/tap ripples expand and dissolve in place.
    state.ripples = state.ripples.filter(ripple => ripple.life < 1);
    state.ripples.forEach(ripple => {
      ripple.life += delta / 1050;
      const progress = clamp(ripple.life, 0, 1);
      const radius = 12 + progress * Math.min(width, height) * .22;
      ctx.strokeStyle = "rgba(226,112,59," + ((1 - progress) * .38) + ")";
      ctx.lineWidth = 1.2 - progress * .55;
      ctx.beginPath(); ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(226,112,59," + ((1 - progress) * .17) + ")";
      ctx.beginPath(); ctx.arc(ripple.x, ripple.y, radius * .72, 0, Math.PI * 2); ctx.stroke();
    });
  };

  const tick = (now) => {
    if (state.disposed || !state.visible) { state.frame = 0; return; }
    const delta = state.last ? Math.min(40, now - state.last) : 16;
    state.last = now;
    state.time = now;
    draw(delta);
    const moving = !reduced.matches || state.ripples.length > 0
      || Math.abs(state.targetX - state.pointerX) > .002
      || Math.abs(state.targetY - state.pointerY) > .002
      || Math.abs(state.targetScroll - state.scroll) > .5;
    if (moving) state.frame = requestAnimationFrame(tick);
    else state.frame = 0;
  };

  const schedule = () => {
    if (state.frame || state.disposed || !state.visible) return;
    state.frame = requestAnimationFrame(tick);
  };

  const onPointerMove = (event) => {
    if (!finePointer.matches || event.pointerType === "touch") return;
    state.targetX = clamp(event.clientX / state.width, 0, 1);
    state.targetY = clamp(event.clientY / state.height, 0, 1);
    schedule();
  };
  const onPointerLeave = () => { state.targetX = .5; state.targetY = .42; schedule(); };
  const onScroll = () => { state.targetScroll = window.scrollY || 0; schedule(); };
  const onPress = (event) => {
    if (event.target.closest("input, textarea, select, [contenteditable='true']")) return;
    state.ripples.push({ x: event.clientX, y: event.clientY, life: 0 });
    if (state.ripples.length > 5) state.ripples.shift();
    schedule();
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  root.addEventListener("pointerdown", onPress, { passive: true });

  const visibility = new IntersectionObserver(entries => {
    state.visible = entries.some(entry => entry.isIntersecting);
    if (state.visible) schedule();
    else { if (state.frame) cancelAnimationFrame(state.frame); state.frame = 0; }
  });
  visibility.observe(app);

  const cleanup = () => {
    state.disposed = true;
    if (state.frame) cancelAnimationFrame(state.frame);
    visibility.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", resize);
    root.removeEventListener("pointerdown", onPress);
  };
  window.addEventListener("pagehide", cleanup, { once: true });
  reduced.addEventListener?.("change", () => { if (!reduced.matches) schedule(); });
  resize();
  schedule();
}
