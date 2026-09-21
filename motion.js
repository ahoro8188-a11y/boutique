const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function injectMotionChrome() {
  if (document.querySelector("[data-progress]")) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="preloader" data-preloader>
      <p class="preloader-mark">Wren &amp; Co.</p>
      <p class="preloader-count" data-loader-count>00</p>
    </div>
    <div class="scroll-progress" data-progress></div>
    <div class="cursor" data-cursor hidden>
      <span class="cursor-dot"></span>
      <span class="cursor-ring"></span>
    </div>
  `;
  document.body.prepend(...wrap.children);
}

function runPreloader() {
  const loader = document.querySelector("[data-preloader]");
  const count = document.querySelector("[data-loader-count]");
  if (!loader) {
    document.body.classList.add("is-ready");
    return Promise.resolve();
  }
  if (reduceMotion) {
    loader.remove();
    document.body.classList.add("is-ready");
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - (1 - t) ** 3;
      if (count) count.textContent = String(Math.round(eased * 100)).padStart(2, "0");
      if (t < 1) requestAnimationFrame(tick);
      else {
        loader.classList.add("is-done");
        document.body.classList.add("is-ready");
        setTimeout(() => loader.remove(), 700);
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

function splitHeadings() {
  document.querySelectorAll("[data-split]").forEach((el) => {
    if (el.dataset.splitDone) return;
    const parts = el.textContent.split(/(\s+)/);
    el.innerHTML = parts.map((part) => {
      if (!part.trim()) return part;
      return `<span class="split-word"><span class="split-inner">${part}</span></span>`;
    }).join("");
    el.dataset.splitDone = "true";
  });
}

function initCursor() {
  const cursor = document.querySelector("[data-cursor]");
  if (!cursor || !isFinePointer || reduceMotion) return;
  cursor.hidden = false;
  document.body.classList.add("has-cursor");
  const dot = cursor.querySelector(".cursor-dot");
  const ring = cursor.querySelector(".cursor-ring");
  let x = 0, y = 0, rx = 0, ry = 0;
  window.addEventListener("pointermove", (event) => {
    x = event.clientX;
    y = event.clientY;
    dot.style.transform = `translate(${x}px, ${y}px)`;
  }, { passive: true });
  const loop = () => {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener("pointerover", (event) => {
    const hot = event.target.closest("a, button, .product-card, .horizon-slide");
    cursor.classList.toggle("is-hot", Boolean(hot));
  });
}

function initMagnetic() {
  if (!isFinePointer || reduceMotion) return;
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const r = el.getBoundingClientRect();
      const dx = event.clientX - (r.left + r.width / 2);
      const dy = event.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

function initMasks() {
  const masks = document.querySelectorAll("[data-mask]");
  if (!masks.length) return;
  if (reduceMotion) {
    masks.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.28 });
  masks.forEach((el) => io.observe(el));
}

function initCounters() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      io.unobserve(el);
      if (reduceMotion) {
        el.textContent = String(target);
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const t = clamp((now - start) / 1400, 0, 1);
        const eased = 1 - (1 - t) ** 3;
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  nums.forEach((el) => io.observe(el));
}

function initScrollScene() {
  const progress = document.querySelector("[data-progress]");
  const nav = document.querySelector(".site-nav");
  const announce = document.querySelector(".announce-bar");
  const parallax = [...document.querySelectorAll("[data-parallax]")];
  const horizon = document.querySelector("[data-horizon]");
  const track = horizon?.querySelector(".horizon-track");
  let lastY = 0;

  const scene = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && max > 0) progress.style.transform = `scaleX(${y / max})`;

    if (nav && !reduceMotion) {
      const hide = y > lastY && y > 80;
      nav.classList.toggle("is-hidden", hide);
      announce?.classList.toggle("is-hidden", hide);
    }
    lastY = y;

    if (!reduceMotion) {
      parallax.forEach((el) => {
        const speed = Number(el.dataset.parallax) || 0.2;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        const img = el.tagName === "IMG" ? el : el.querySelector("img");
        if (img) img.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
      });
    }

    if (horizon && track && window.innerWidth > 980 && !reduceMotion) {
      const rect = horizon.getBoundingClientRect();
      const total = horizon.offsetHeight - window.innerHeight;
      const scrolled = clamp(-rect.top, 0, total);
      const p = total ? scrolled / total : 0;
      const maxX = track.scrollWidth - window.innerWidth + 80;
      track.style.transform = `translate3d(${-maxX * p}px, 0, 0)`;
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      scene();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", scene);
  scene();
}

document.addEventListener("DOMContentLoaded", () => {
  injectMotionChrome();
  splitHeadings();
  initCursor();
  initMagnetic();
  initMasks();
  initCounters();
  initScrollScene();
  runPreloader();
});
