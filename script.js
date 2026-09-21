const PRODUCTS = [
  {
    id: "bagru-kurta",
    name: "Bagru Booti Kurta",
    price: 4800,
    category: "tops",
    badge: "New",
    image: "https://images.unsplash.com/photo-1603252109360-909baaf261c7?w=700&q=80",
    blurb: "Hand-block printed in Sanganer on washed cotton. Meant for warm afternoons and courtyard evenings."
  },
  {
    id: "ikat-skirt",
    name: "Pochampally Ikat Skirt",
    price: 6200,
    category: "bottoms",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=700&q=80",
    blurb: "A fluid midi in Telangana ikat, with a hidden waist and a warp that will not repeat."
  },
  {
    id: "temple-set",
    name: "Temple Necklace Set",
    price: 3400,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=700&q=80",
    blurb: "Two warm-gold temple chains, meant to live on together."
  },
  {
    id: "jhola",
    name: "Market Jhola",
    price: 2800,
    category: "bags",
    badge: "Limited",
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=700&q=80",
    blurb: "Woven jute with leather handles. Made for bazaar mornings."
  },
  {
    id: "chikan-kurta",
    name: "Lucknow Chikankari Kurta",
    price: 5600,
    compare: 7200,
    category: "tops",
    badge: "Archive",
    image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=700&q=80",
    blurb: "White-on-white chikankari on cotton mul. Last sizes from summer."
  },
  {
    id: "palazzo",
    name: "Indigo Palazzo",
    price: 3900,
    category: "bottoms",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=700&q=80",
    blurb: "Full-leg indigo cotton with a tailored waist. Softens with every wash."
  },
  {
    id: "lac-pins",
    name: "Jaipur Lac Pin Set",
    price: 980,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=700&q=80",
    blurb: "A pair of lacquer pins, poured in small batches in the old city."
  },
  {
    id: "kolhapuri-tote",
    name: "Kolhapuri Tote",
    price: 4200,
    category: "bags",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80",
    blurb: "Hand-woven leather with a quiet silhouette and room for the day."
  }
];

const CART_KEY = "wren-bag";
const WISH_KEY = "wren-wish";

const money = (n) => `₹${n.toLocaleString("en-IN")}`;

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const getCart = () => read(CART_KEY, []);
const getWish = () => read(WISH_KEY, []);

const findProduct = (id) => PRODUCTS.find((item) => item.id === id);

function toast(message) {
  const el = document.querySelector("[data-toast]");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("is-on"), 2200);
}

function setOverlayOpen(open) {
  document.body.classList.toggle("modal-open", open);
  const overlay = document.querySelector("[data-overlay]");
  if (overlay) overlay.classList.toggle("is-open", open);
}

function closeAllPanels() {
  document.querySelectorAll(".search-panel, .cart-drawer, .product-modal").forEach((el) => {
    el.classList.remove("is-open");
  });
  setOverlayOpen(false);
}

function cartCount() {
  return getCart().reduce((sum, line) => sum + line.qty, 0);
}

function renderBagCount() {
  const count = cartCount();
  document.querySelectorAll("[data-bag-count]").forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
}

function addToCart(id, qty = 1) {
  const product = findProduct(id);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find((line) => line.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id, qty });
  write(CART_KEY, cart);
  renderBagCount();
  renderCart();
      toast(`${product.name} added to your jhola`);
}

function setQty(id, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter((line) => line.id !== id);
  else {
    const line = cart.find((item) => item.id === id);
    if (line) line.qty = qty;
  }
  write(CART_KEY, cart);
  renderBagCount();
  renderCart();
}

function toggleWish(id) {
  const wish = getWish();
  const next = wish.includes(id) ? wish.filter((item) => item !== id) : [...wish, id];
  write(WISH_KEY, next);
  document.querySelectorAll(`[data-wish="${id}"]`).forEach((btn) => {
    btn.classList.toggle("is-on", next.includes(id));
    btn.setAttribute("aria-pressed", next.includes(id));
  });
  toast(next.includes(id) ? "Saved to wishlist" : "Removed from wishlist");
}

function productCard(product) {
  const wished = getWish().includes(product.id);
  const price = product.compare
    ? `<p class="price"><span class="compare">${money(product.compare)}</span>${money(product.price)}</p>`
    : `<p class="price">${money(product.price)}</p>`;
  return `
    <article class="product-card" data-category="${product.category}" data-id="${product.id}">
      <div class="product-photo">
        <img src="${product.image}" alt="${product.name}">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="wish-btn ${wished ? "is-on" : ""}" type="button" data-wish="${product.id}" aria-label="Save ${product.name}" aria-pressed="${wished}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7.5a3.8 3.8 0 0 1 7 3.3C19 15.6 12 20 12 20z"/></svg>
        </button>
        <div class="product-actions">
          <button class="btn" type="button" data-quick="${product.id}">Quick look</button>
          <button class="btn" type="button" data-add="${product.id}">Add</button>
        </div>
      </div>
      <h3>${product.name}</h3>
      ${price}
    </article>
  `;
}

function renderGrids() {
  document.querySelectorAll("[data-product-grid]").forEach((grid) => {
    const list = grid.dataset.productGrid === "home" ? PRODUCTS.slice(0, 4) : PRODUCTS;
    grid.innerHTML = list.map(productCard).join("");
  });
  const count = document.getElementById("resultCount");
  if (count) count.textContent = String(document.querySelectorAll("#productGrid .product-card:not(.hidden)").length);
}

function renderCart() {
  const mount = document.querySelector("[data-cart-items]");
  if (!mount) return;
  const cart = getCart();
  if (!cart.length) {
    mount.innerHTML = `<p class="cart-empty">Your jhola is empty. The new edit is waiting.</p>`;
  } else {
    mount.innerHTML = cart.map((line) => {
      const product = findProduct(line.id);
      if (!product) return "";
      return `
        <div class="cart-line">
          <img src="${product.image}" alt="">
          <div>
            <h3>${product.name}</h3>
            <p class="price">${money(product.price)}</p>
            <div class="qty-row">
              <button type="button" data-qty="${product.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
              <span>${line.qty}</span>
              <button type="button" data-qty="${product.id}" data-delta="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="close-btn" type="button" data-remove="${product.id}" aria-label="Remove">×</button>
        </div>
      `;
    }).join("");
  }
  const subtotal = cart.reduce((sum, line) => {
    const product = findProduct(line.id);
    return sum + (product ? product.price * line.qty : 0);
  }, 0);
  const subtotalEl = document.querySelector("[data-subtotal]");
  if (subtotalEl) subtotalEl.textContent = money(subtotal);
  const note = document.querySelector("[data-shipping-note]");
  if (note) {
    note.textContent = subtotal >= 4999
      ? "Free shipping applied."
      : `Add ${money(Math.max(0, 4999 - subtotal))} for free shipping.`;
  }
}

function openCart() {
  closeAllPanels();
  renderCart();
  document.querySelector("[data-cart]")?.classList.add("is-open");
  setOverlayOpen(true);
}

function openSearch() {
  closeAllPanels();
  document.querySelector("[data-search]")?.classList.add("is-open");
  setOverlayOpen(true);
  const input = document.getElementById("searchInput");
  if (input) {
    input.value = "";
    input.focus();
    renderSearch("");
  }
}

function renderSearch(query) {
  const mount = document.querySelector("[data-search-results]");
  if (!mount) return;
  const q = query.trim().toLowerCase();
  const hits = PRODUCTS.filter((item) =>
    !q || `${item.name} ${item.category} ${item.blurb}`.toLowerCase().includes(q)
  ).slice(0, 6);
  mount.innerHTML = hits.length
    ? hits.map((item) => `
        <button class="search-hit" type="button" data-open-product="${item.id}">
          <img src="${item.image}" alt="">
          <span><strong>${item.name}</strong>${money(item.price)}</span>
        </button>
      `).join("")
    : `<p class="cart-empty">No pieces match that search.</p>`;
}

function openProduct(id) {
  const product = findProduct(id);
  const modal = document.querySelector("[data-modal]");
  if (!product || !modal) return;
  document.querySelector("[data-search]")?.classList.remove("is-open");
  modal.querySelector("[data-modal-image]").src = product.image;
  modal.querySelector("[data-modal-image]").alt = product.name;
  modal.querySelector("[data-modal-name]").textContent = product.name;
  modal.querySelector("[data-modal-price]").textContent = money(product.price);
  modal.querySelector("[data-modal-blurb]").textContent = product.blurb;
  modal.querySelector("[data-modal-add]").dataset.add = product.id;
  modal.classList.add("is-open");
  setOverlayOpen(true);
}

function applyFilter(filter) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.filter === filter));
  document.querySelectorAll("#productGrid .product-card").forEach((card) => {
    const match = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("hidden", !match);
  });
  const count = document.getElementById("resultCount");
  if (count) count.textContent = String(document.querySelectorAll("#productGrid .product-card:not(.hidden)").length);
}

function injectChrome() {
  if (document.querySelector("[data-overlay]")) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="overlay" data-overlay></div>
    <div class="search-panel" data-search role="dialog" aria-label="Search">
      <div class="search-bar">
        <input id="searchInput" type="text" placeholder="Search the collection" autocomplete="off">
        <button class="close-btn" type="button" data-close aria-label="Close search">×</button>
      </div>
      <div class="search-results" data-search-results></div>
    </div>
    <aside class="cart-drawer" data-cart role="dialog" aria-label="Your bag">
      <div class="drawer-head">
        <h2>Your bag</h2>
        <button class="close-btn" type="button" data-close aria-label="Close bag">×</button>
      </div>
      <div class="cart-items" data-cart-items></div>
      <div class="cart-foot">
        <div class="subtotal"><span>Subtotal</span><strong data-subtotal>$0</strong></div>
        <p class="cart-note" data-shipping-note></p>
        <button class="btn btn-primary" type="button" data-checkout>Checkout</button>
      </div>
    </aside>
    <div class="product-modal" data-modal role="dialog" aria-label="Product">
      <div class="modal-head">
        <h2>Quick look</h2>
        <button class="close-btn" type="button" data-close aria-label="Close">×</button>
      </div>
      <div class="modal-body">
        <img data-modal-image alt="">
        <div class="modal-copy">
          <h3 data-modal-name></h3>
          <p class="price" data-modal-price></p>
          <p data-modal-blurb></p>
          <button class="btn btn-primary" type="button" data-modal-add>Add to bag</button>
        </div>
      </div>
    </div>
    <div class="toast" data-toast role="status"></div>
  `;
  document.body.append(...wrap.children);
}

function initNav() {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (!navToggle || !navLinks) return;
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initReveal() {
  const revealTargets = document.querySelectorAll(
    ".feature-text, .wavy-banner, .category-strip, .split-sale, .arrivals-teaser, .lookbook, .press-strip, .newsletter, .shop-page, .about-story, .values, .mini-cta, .contact-page, .statement, .stats, .sticky-story-copy"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  injectChrome();
  initNav();
  renderGrids();
  renderBagCount();
  renderCart();
  initReveal();

  const params = new URLSearchParams(location.search);
  const initialFilter = params.get("filter") || "all";
  if (document.getElementById("productGrid")) applyFilter(initialFilter);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });

  document.body.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    if (!target) return;
    const add = target.closest("[data-add], [data-modal-add]");
    if (add?.dataset.add || add?.dataset.modalAdd) {
      addToCart(add.dataset.add || add.dataset.modalAdd);
      document.querySelector("[data-modal]")?.classList.remove("is-open");
      openCart();
      return;
    }
    const wish = event.target.closest("[data-wish]");
    if (wish) {
      toggleWish(wish.dataset.wish);
      return;
    }
    const quick = event.target.closest("[data-quick], [data-open-product]");
    if (quick) {
      openProduct(quick.dataset.quick || quick.dataset.openProduct);
      return;
    }
    if (event.target.closest("[data-open-cart]")) {
      openCart();
      return;
    }
    if (event.target.closest("[data-open-search]")) {
      openSearch();
      return;
    }
    if (event.target.closest("[data-close], [data-overlay]")) {
      closeAllPanels();
      return;
    }
    const qty = event.target.closest("[data-qty]");
    if (qty) {
      const line = getCart().find((item) => item.id === qty.dataset.qty);
      setQty(qty.dataset.qty, (line?.qty || 1) + Number(qty.dataset.delta));
      return;
    }
    const remove = event.target.closest("[data-remove]");
    if (remove) {
      setQty(remove.dataset.remove, 0);
      return;
    }
    if (event.target.closest("[data-checkout]")) {
      if (!getCart().length) {
        toast("Your jhola is empty");
        return;
      }
      write(CART_KEY, []);
      renderBagCount();
      renderCart();
      closeAllPanels();
      toast("Order received — we'll confirm on WhatsApp shortly");
    }
  });

  document.getElementById("searchInput")?.addEventListener("input", (event) => {
    renderSearch(event.target.value);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllPanels();
  });

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const note = document.getElementById("formNote");
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      note.textContent = "Shukriya. The house will reply within a day.";
      contactForm.reset();
    });
  }

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    const note = document.getElementById("newsletterNote");
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      note.textContent = "You are on the list — pehle aap.";
      newsletterForm.reset();
    });
  }
});
