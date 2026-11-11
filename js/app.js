/**
 * AquaticArea Core Engine (js/app.js)
 * - 3D Nature Aquarium & Interactive Hero Controls
 * - 3D Rimless Tank Customizer & Hardware Telemetry
 * - Procedural Audio Ambience Toggle
 * - Smart Categorized Product Catalog & WhatsApp Checkout (+91 7978733900)
 */

const WHATSAPP_NUMBER = "917978733900";
let cart = JSON.parse(localStorage.getItem("aquaticarea_cart") || "[]");
let allProducts = [];
let currentCategoryFilter = "all";
let currentSearchQuery = "";
let currentHardscapePreset = "ryuboku";

// Verified Local Category Fallback Images
const CATEGORY_FALLBACK_IMAGES = {
  fish: [
    "images/products/discus-rt.jpg",
    "images/products/betta-avatar.jpg",
    "images/products/tetra-cardinal.jpg"
  ],
  shrimp: [
    "images/products/shrimp-bloody-mary.jpg",
    "images/products/shrimp-blue-dream.jpg"
  ],
  plants: [
    "images/products/rotala-wallichii.jpg",
    "images/products/ludwigia-repens.jpg"
  ],
  gear: [
    "images/products/sunsun-ybf-600-hang-on-aquarium-filter.jpg"
  ]
};

const FEATURED_SHOWCASE_PRODUCTS = [
  {
    id: "discus-rt",
    name: "Red Turquoise Discus (Show Grade)",
    category: "fish",
    priceINR: 2400,
    size: "3.5 - 4.0 Inch",
    params: "28-30°C | pH 6.2-6.8 | TDS 80-150",
    stock: "Quarantined 14 Days",
    image: "images/products/discus-rt.jpg",
    fallbackImage: "images/habitat-fish.jpg",
    description: "High-body Symphysodon aequifasciatus with vibrant electric blue striations over deep crimson base."
  },
  {
    id: "betta-avatar",
    name: "Halfmoon Plakat Betta (Avatar Copper)",
    category: "fish",
    priceINR: 1250,
    size: "Adult Show Male",
    params: "25-27°C | pH 6.5-7.2 | Low Flow",
    stock: "Limited Stock",
    image: "images/products/betta-avatar.jpg",
    fallbackImage: "images/habitat-fish.jpg",
    description: "Metallic turquoise-scale Plakat with crisp 180-degree caudal spread and bold mask."
  },
  {
    id: "shrimp-bloody-mary",
    name: "Bloody Mary Neocaridina Shrimp (Colony of 10)",
    category: "shrimp",
    priceINR: 1100,
    size: "1.2 - 1.8 cm Juveniles",
    params: "20-25°C | pH 6.8-7.6 | TDS 160-220",
    stock: "Tank-Bred Colony",
    image: "images/products/shrimp-bloody-mary.jpg",
    fallbackImage: "images/habitat-shrimp.jpg",
    description: "Deep wine-red translucent tissue coloration bred and acclimated in planted community tanks."
  },
  {
    id: "shrimp-blue-dream",
    name: "Blue Dream Dwarf Shrimp (Colony of 10)",
    category: "shrimp",
    priceINR: 1150,
    size: "1.2 - 1.6 cm Juveniles",
    params: "21-25°C | pH 7.0-7.5 | TDS 180-240",
    stock: "Active Biofilm Grazers",
    image: "images/products/shrimp-blue-dream.jpg",
    fallbackImage: "images/habitat-shrimp.jpg",
    description: "High-grade sapphire blue shell coloration with clean legs, voracious diatom clean-up crew."
  },
  {
    id: "plant-buce-kedagang",
    name: "Bucephalandra 'Kedagang' on Lava Rock",
    category: "plants",
    priceINR: 650,
    size: "10+ Rhizome Heads",
    params: "Low-Med Light | CO2 Optional | Epiphyte",
    stock: "100% Submerged Form",
    image: "images/products/plant-buce-kedagang.jpg",
    fallbackImage: "images/products/rotala-wallichii.jpg",
    description: "Dark plum-green ruffled leaves sprinkled with metallic iridescent pearling pores."
  },
  {
    id: "plant-monte-carlo",
    name: "Micranthemum 'Monte Carlo' (In-Vitro Cup)",
    category: "plants",
    priceINR: 350,
    size: "Tissue Culture Cup (100% Snail Free)",
    params: "Med-High Light | CO2 Recommended | Carpet",
    stock: "Sterile Tissue Culture",
    image: "images/products/plant-monte-carlo.jpg",
    fallbackImage: "images/products/micranthemum-monte-carlo.jpg",
    description: "Vibrant compact creeping aquatic carpet plant. Creates thick emerald lawns on active aquasoil."
  },
  {
    id: "discus-blue-diamond",
    name: "Blue Diamond Discus (High Body)",
    category: "fish",
    priceINR: 2800,
    size: "3.5 - 4.0 Inch",
    params: "28-30°C | pH 6.0-6.8 | Soft Water",
    stock: "Quarantined 14 Days",
    image: "images/products/discus-blue-diamond.jpg",
    fallbackImage: "images/habitat-fish.jpg",
    description: "Solid cobalt blue coloration without stress bars. Hand-selected for circular high-body silhouette."
  },
  {
    id: "tetra-cardinal-school",
    name: "Cardinal Tetra (School of 12)",
    category: "fish",
    priceINR: 850,
    size: "2.5 - 3.0 cm",
    params: "24-28°C | pH 5.5-7.0 | Community",
    stock: "Schooling Conditioned",
    image: "images/products/tetra-cardinal.jpg",
    fallbackImage: "images/habitat-fish.jpg",
    description: "Full-length iridescent neon blue and crimson red stripes. Perfect peaceful dithers for planted Discus tanks."
  },
  {
    id: "shrimp-crystal-red",
    name: "Crystal Red Caridina Shrimp (S+ Grade, 5 Pack)",
    category: "shrimp",
    priceINR: 1450,
    size: "1.2 - 1.5 cm",
    params: "21-24°C | pH 6.2-6.6 | TDS 110-140",
    stock: "Selective Line Bred",
    image: "images/products/shrimp-crs.jpg",
    fallbackImage: "images/habitat-shrimp.jpg",
    description: "High-contrast snow white and ruby red banding bred in remineralized RO soft water."
  },
  {
    id: "plant-anubias-nana-petite",
    name: "Anubias Nana Petite on Lava Stone",
    category: "plants",
    priceINR: 480,
    size: "Mounted on 3\" Rock",
    params: "Low-Med Light | Easy Care | Hardscape",
    stock: "Root Established",
    image: "images/products/plant-anubias-petite.jpg",
    fallbackImage: "images/products/rotala-wallichii.jpg",
    description: "Miniature dark green leathery foliage that anchors easily to driftwood and porous aquascape rock."
  },
  {
    id: "plant-rotala-hra",
    name: "Rotala rotundifolia 'H'Ra' (Bunch)",
    category: "plants",
    priceINR: 280,
    size: "15+ Stems",
    params: "High Light | High Iron | Background",
    stock: "Submerged Cultured",
    image: "images/products/plant-rotala-hra.jpg",
    fallbackImage: "images/products/ludwigia-repens.jpg",
    description: "Famous Vietnam stem plant with narrow curling leaves that turn intense fiery orange-red under RGB lighting."
  },
  {
    id: "corydoras-sterbai",
    name: "Sterbai Corydoras Catfish (Trio)",
    category: "fish",
    priceINR: 950,
    size: "3.0 - 3.5 cm",
    params: "26-30°C | Sand Substrate | Peaceful",
    stock: "Quarantined Active",
    image: "images/products/corydoras-sterbai.jpg",
    fallbackImage: "images/habitat-fish.jpg",
    description: "White spotted chocolate body with radiant bright orange pectoral fins. Discus temperature tolerant."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  initUnderwaterCaustics();
  const initialCat = new URLSearchParams(window.location.search).get("cat");
  if (initialCat && ["fish", "shrimp", "plants"].includes(initialCat)) {
    currentCategoryFilter = initialCat;
    const catBtns = document.querySelectorAll(".cat-filter-btn");
    catBtns.forEach(btn => {
      const oc = btn.getAttribute("onclick") || "";
      const isMatch = oc.includes(`'${initialCat}'`);
      btn.classList.toggle("bg-cyan-500/30", isMatch);
      btn.classList.toggle("border-cyan-400", isMatch);
      btn.classList.toggle("text-cyan-200", isMatch);
      btn.classList.toggle("font-bold", isMatch);
      btn.classList.toggle("bg-slate-900", !isMatch);
      btn.classList.toggle("border-slate-800", !isMatch);
      btn.classList.toggle("text-slate-300", !isMatch);
    });
  }
  loadProducts();
  updateCartUI();
  setup3DTankStudio();
  if (document.getElementById("studio-3d-section")) {
    updateTankCalculations();
  }
  if (typeof window.switchHeroMode === "function") {
    window.switchHeroMode("video");
  }
});

/* =========================================================
   1. UNDERWATER CAUSTICS & BACKGROUND PEARLING
   ========================================================= */
function initUnderwaterCaustics() {
  const canvas = document.getElementById("caustic-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width, height;
  const bubbles = [];
  const rays = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < 7; i++) {
    rays.push({
      x: Math.random() * width,
      width: 100 + Math.random() * 180,
      angle: 0.14 + Math.random() * 0.12,
      speed: 0.0004 + Math.random() * 0.0006,
      phase: Math.random() * Math.PI * 2
    });
  }

  for (let i = 0; i < 40; i++) {
    bubbles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 2.2,
      vy: 0.35 + Math.random() * 0.75,
      wobble: Math.random() * Math.PI * 2,
      alpha: 0.15 + Math.random() * 0.4
    });
  }

  function animate(time) {
    ctx.clearRect(0, 0, width, height);

    rays.forEach((ray) => {
      const sway = Math.sin(time * ray.speed + ray.phase) * 65;
      const grad = ctx.createLinearGradient(ray.x + sway, 0, ray.x + sway + height * ray.angle, height * 0.85);
      grad.addColorStop(0, "rgba(0, 242, 254, 0.06)");
      grad.addColorStop(0.5, "rgba(16, 185, 129, 0.025)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ray.x + sway - ray.width / 2, 0);
      ctx.lineTo(ray.x + sway + ray.width / 2, 0);
      ctx.lineTo(ray.x + sway + height * ray.angle + ray.width, height);
      ctx.lineTo(ray.x + sway + height * ray.angle - ray.width, height);
      ctx.closePath();
      ctx.fill();
    });

    bubbles.forEach((b) => {
      b.y -= b.vy;
      b.wobble += 0.03;
      const bx = b.x + Math.sin(b.wobble) * 0.7;

      if (b.y < -10) {
        b.y = height + 10;
        b.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(165, 243, 252, ${b.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* =========================================================
   2. PROCEDURAL SOUND AMBIENCE TOGGLE (Web Audio API)
   ========================================================= */
window.toggleAquaticSound = function() {
  if (!window.Aquatic3D || !window.Aquatic3D.audioEngine) return;
  const isPlaying = window.Aquatic3D.audioEngine.toggle();
  
  const buttons = document.querySelectorAll(".audio-toggle-btn");
  buttons.forEach(btn => {
    if (isPlaying) {
      btn.innerHTML = `
        <span class="sound-playing-wave"><span></span><span></span><span></span></span>
        <span class="text-cyan-300">Ambience ON</span>
      `;
      btn.classList.add("border-cyan-400", "bg-cyan-500/20");
    } else {
      btn.innerHTML = `<span>🔇</span> <span>Sound: Muted</span>`;
      btn.classList.remove("border-cyan-400", "bg-cyan-500/20");
    }
  });
};

/* =========================================================
   3. HERO & FEED-DISCUS 3D INTERACTIVE CONTROLS
   ========================================================= */
function updateButtonGroupActive(selector, activeEl) {
  if (!activeEl) return;
  document.querySelectorAll(selector).forEach(b => b.classList.remove("active"));
  activeEl.classList.add("active");
}

window.setHeroLight = function(mode, el) {
  if (window.Aquatic3D?.heroTank) window.Aquatic3D.heroTank.setLightingMode(mode);
  if (window.Aquatic3D?.feedTank) window.Aquatic3D.feedTank.setLightingMode(mode);
  updateButtonGroupActive(".hero-light-btn", el);
};

window.setHeroView = function(view, el) {
  if (window.Aquatic3D?.heroTank) window.Aquatic3D.heroTank.setViewMode(view);
  if (window.Aquatic3D?.feedTank) window.Aquatic3D.feedTank.setViewMode(view);
  updateButtonGroupActive(".hero-view-btn", el);
};

window.setFeedLight = function(mode, el) {
  if (window.Aquatic3D?.feedTank) window.Aquatic3D.feedTank.setLightingMode(mode);
  updateButtonGroupActive(".feed-light-btn", el);
};

window.setFeedView = function(view, el) {
  if (window.Aquatic3D?.feedTank) window.Aquatic3D.feedTank.setViewMode(view);
  updateButtonGroupActive(".feed-view-btn", el);
};

window.switchHeroMode = function(mode) {
  const video = document.getElementById("hero-aquarium-video");
  const tank3d = document.getElementById("hero-3d-aquarium");
  const btnVideo = document.getElementById("btn-mode-video");
  const btn3d = document.getElementById("btn-mode-3d");

  if (mode === "video") {
    if (tank3d) {
      tank3d.style.transition = "opacity 0.5s ease";
      tank3d.style.opacity = "0";
      tank3d.style.pointerEvents = "none";
    }
    if (video) {
      video.style.opacity = "1";
      video.play().catch(() => {});
    }
    if (btnVideo) {
      btnVideo.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/30 border border-cyan-400 text-cyan-200 transition shadow";
    }
    if (btn3d) {
      btn3d.className = "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-cyan-200 transition";
    }
  } else {
    if (tank3d) {
      if (window.Aquatic3D && !window.Aquatic3D.heroTank && window.Aquatic3D.HeroAquariumManager) {
        window.Aquatic3D.heroTank = new window.Aquatic3D.HeroAquariumManager("hero-3d-aquarium");
      }
      tank3d.style.transition = "opacity 0.5s ease";
      tank3d.style.opacity = "1";
      tank3d.style.pointerEvents = "auto";
    }
    if (btnVideo) {
      btnVideo.className = "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-cyan-200 transition";
    }
    if (btn3d) {
      btn3d.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/30 border border-cyan-400 text-cyan-200 transition shadow";
    }
  }
};

window.feedDiscusSection = function() {
  if (window.Aquatic3D?.feedTank) {
    window.Aquatic3D.feedTank.dropFood(8);
  }
};

window.feedHeroFish = function() {
  const feedSec = document.getElementById("feed-discus-section");
  if (feedSec && window.Aquatic3D?.feedTank) {
    feedSec.scrollIntoView({ behavior: "smooth", block: "center" });
    window.Aquatic3D.feedTank.dropFood(8);
    return;
  }
  window.switchHeroMode("3d");
  if (window.Aquatic3D && window.Aquatic3D.heroTank) {
    window.Aquatic3D.heroTank.dropFood(7);
  }
};

/* =========================================================
   4. DYNAMIC PRODUCT CATALOG WITH SMART FALLBACKS & SEARCH
   ========================================================= */
const PRODUCTS_PER_PAGE = 12;
let currentProductPage = 1;

async function loadProducts() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  // Immediate synchronous render of signature showcase products to avoid any blank flicker
  allProducts = [...FEATURED_SHOWCASE_PRODUCTS];
  renderFilteredProducts();

  try {
    const res = await fetch("data/products.json");
    if (res.ok) {
      const data = await res.json();
      allProducts = data && data.length > 0 ? normalizeProducts(data) : FEATURED_SHOWCASE_PRODUCTS;
      renderFilteredProducts();
    }
  } catch (e) {
    // Already rendered FEATURED_SHOWCASE_PRODUCTS
  }
}

function normalizeProducts(items) {
  // Prepend our signature high-resolution featured showcase items first
  const combined = [...FEATURED_SHOWCASE_PRODUCTS];
  const existingIds = new Set(FEATURED_SHOWCASE_PRODUCTS.map(p => p.id));

  items.forEach((item, index) => {
    if (!existingIds.has(item.id)) {
      // Normalize category
      let cat = "plants";
      const c = (item.category || "").toLowerCase();
      if (c.includes("fish")) cat = "fish";
      else if (c.includes("shrimp") || c.includes("caridina")) cat = "shrimp";
      else if (c.includes("food") || c.includes("accessories")) cat = "gear";

      // Select fallback image based on category
      const fallbacks = CATEGORY_FALLBACK_IMAGES[cat] || CATEGORY_FALLBACK_IMAGES.plants;
      const fallbackImg = fallbacks[index % fallbacks.length];

      combined.push({
        ...item,
        category: cat,
        image: item.image || fallbackImg,
        fallbackImage: fallbackImg
      });
    }
  });

  return combined;
}

function renderFilteredProducts() {
  const container = document.getElementById("featured-products-grid");
  const paginationContainer = document.getElementById("products-pagination");
  if (!container) return;

  let filtered = allProducts;
  if (currentCategoryFilter !== "all") {
    filtered = filtered.filter(p => p.category === currentCategoryFilter);
  }
  if (currentSearchQuery.trim()) {
    const q = currentSearchQuery.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE) || 1;

  // Ensure current page is valid
  if (currentProductPage > totalPages) currentProductPage = totalPages;
  if (currentProductPage < 1) currentProductPage = 1;

  if (totalItems === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400">
        <div class="text-4xl mb-3">🐠</div>
        <p class="text-base font-semibold text-white">No livestock or aquatic flora found matching "${currentSearchQuery}".</p>
        <p class="text-xs text-slate-400 mt-1">Try another category or WhatsApp us directly (+91 7978733900) for custom stock sourcing.</p>
      </div>
    `;
    if (paginationContainer) paginationContainer.innerHTML = "";
    return;
  }

  // Slice exactly 12 items for the current page
  const startIndex = (currentProductPage - 1) * PRODUCTS_PER_PAGE;
  const displayItems = filtered.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  container.innerHTML = displayItems.map(item => `
    <div class="product-wood-card group">
      <!-- Clean Full-Bleed Specimen Photo (No inner wood frame) -->
      <div class="product-photo-box">
        <img 
          src="${item.image}" 
          onerror="this.onerror=null; this.src='${item.fallbackImage || CATEGORY_FALLBACK_IMAGES.plants[0]}';" 
          alt="${item.name}" 
          class="product-specimen-photo"
        />
        <span class="absolute top-3 left-3 z-30 bg-emerald-950/90 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono-tech px-2 py-0.5 rounded-full shadow">
          ${item.stock || "In Stock"}
        </span>
        <span class="absolute bottom-2.5 right-2.5 z-30 bg-slate-950/90 text-cyan-300 text-[9px] font-mono-tech px-1.5 py-0.5 rounded border border-cyan-500/30">
          ${item.size || "Standard"}
        </span>
      </div>

      <!-- Product Details -->
      <div class="product-card-body">
        <div class="text-[10px] font-mono-tech text-cyan-400 uppercase tracking-wider mb-1 truncate">${item.params || "Freshwater Conditioned"}</div>
        <h3 class="text-sm sm:text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-cyan-300 transition-colors">${item.name}</h3>
        <p class="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">${item.description || "Premium aquarium specimen conditioned for optimal health."}</p>
      </div>

      <!-- Action Footer: Completely unobstructed & legible -->
      <div class="product-card-footer">
        <div>
          <span class="text-[9px] uppercase font-mono-tech text-slate-400 block leading-none">Specimen</span>
          <span class="text-base sm:text-lg font-bold text-cyan-300 leading-tight">₹${(item.priceINR || 0).toLocaleString('en-IN')}</span>
        </div>
        <div class="flex gap-1.5 shrink-0">
          <button onclick="addToCart('${item.id}')" class="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-800/80 border border-cyan-400/40 text-cyan-200 text-xs font-semibold transition shadow" title="Add to Basket">
            🛒 +
          </button>
          <button onclick="instantWhatsAppBuy('${item.id}')" class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-lg shadow-emerald-500/25">
            <span>💬</span> WhatsApp Buy
          </button>
        </div>
      </div>
    </div>
  `).join("");

  // Render centered pagination immediately below the 12 items
  renderPagination(totalItems, currentProductPage, totalPages);
}

/* =========================================================
   CENTERED PAGINATION ENGINE (EXACTLY 12 ITEMS PER PAGE)
   ========================================================= */
function renderPagination(totalItems, page, totalPages) {
  const container = document.getElementById("products-pagination");
  if (!container) return;

  if (totalItems === 0) {
    container.innerHTML = "";
    return;
  }

  const startItem = (page - 1) * PRODUCTS_PER_PAGE + 1;
  const endItem = Math.min(page * PRODUCTS_PER_PAGE, totalItems);

  // Generate page numbers with intelligent ellipsis window
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");
    if (!pages.includes(totalPages)) pages.push(totalPages);
  }

  const pageButtonsHtml = pages.map(p => {
    if (p === "...") {
      return `<span class="px-2 py-1 text-xs text-slate-500 font-mono-tech select-none">...</span>`;
    }
    const isActive = p === page;
    if (isActive) {
      return `
        <button 
          disabled 
          class="min-w-[36px] h-9 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 cursor-default">
          ${p}
        </button>
      `;
    }
    return `
      <button 
        onclick="goToProductPage(${p})" 
        class="min-w-[36px] h-9 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 font-semibold text-xs transition shadow-sm">
        ${p}
      </button>
    `;
  }).join("");

  const prevDisabled = page === 1;
  const nextDisabled = page === totalPages;

  container.innerHTML = `
    <div class="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
      <!-- Previous Page Button -->
      <button 
        onclick="goToProductPage(${page - 1})" 
        ${prevDisabled ? "disabled" : ""} 
        class="h-9 px-3.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
          prevDisabled 
            ? "border-slate-800/50 text-slate-600 cursor-not-allowed bg-slate-950/40" 
            : "border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-200 shadow"
        }">
        <span>←</span> <span>Prev</span>
      </button>

      <!-- Clickable Page Numbers -->
      <div class="flex items-center gap-1">
        ${pageButtonsHtml}
      </div>

      <!-- Next Page Button -->
      <button 
        onclick="goToProductPage(${page + 1})" 
        ${nextDisabled ? "disabled" : ""} 
        class="h-9 px-3.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
          nextDisabled 
            ? "border-slate-800/50 text-slate-600 cursor-not-allowed bg-slate-950/40" 
            : "border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-200 shadow"
        }">
        <span>Next</span> <span>→</span>
      </button>
    </div>

    <!-- Centered Status Counter -->
    <div class="text-[11px] font-mono-tech text-slate-400 mt-1">
      Showing <span class="text-cyan-300 font-bold">${startItem}–${endItem}</span> of <span class="text-white font-bold">${totalItems}</span> live specimens
    </div>
  `;
}

window.goToProductPage = function(page) {
  currentProductPage = page;
  renderFilteredProducts();
  const el = document.getElementById("featured-products-grid");
  if (el) {
    const yOffset = -90;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

window.filterCategory = function(category, btn) {
  currentCategoryFilter = category;
  currentProductPage = 1; // Reset to page 1 on filter
  if (btn) {
    document.querySelectorAll(".cat-filter-btn").forEach(b => {
      b.classList.remove("bg-cyan-500/30", "border-cyan-400", "text-cyan-200");
      b.classList.add("bg-slate-900", "border-slate-800", "text-slate-300");
    });
    btn.classList.add("bg-cyan-500/30", "border-cyan-400", "text-cyan-200");
  }
  renderFilteredProducts();
};

window.handleProductSearch = function(query) {
  currentSearchQuery = query;
  currentProductPage = 1; // Reset to page 1 on search
  renderFilteredProducts();
};

/* =========================================================
   5. CART & WHATSAPP CHECKOUT ENGINE
   ========================================================= */
window.addToCart = function(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  localStorage.setItem("aquaticarea_cart", JSON.stringify(cart));
  updateCartUI();
  toggleCartDrawer(true);
};

window.removeFromCart = function(id) {
  cart = cart.filter(c => c.id !== id);
  localStorage.setItem("aquaticarea_cart", JSON.stringify(cart));
  updateCartUI();
};

function updateCartUI() {
  const countEls = document.querySelectorAll("#cart-count-badge");
  const listEl = document.getElementById("cart-items-list");
  const totalEl = document.getElementById("cart-total-inr");

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  countEls.forEach(el => el.textContent = totalCount);

  if (!listEl || !totalEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = `<p class="text-slate-400 text-xs sm:text-sm text-center py-8">Your aquarium basket is empty. Add fish, shrimp, or tissue-culture flora.</p>`;
    totalEl.textContent = "₹0";
    return;
  }

  let totalINR = 0;
  listEl.innerHTML = cart.map(item => {
    const lineTotal = item.priceINR * item.qty;
    totalINR += lineTotal;
    return `
      <div class="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <div class="space-y-0.5">
          <h4 class="text-xs sm:text-sm font-semibold text-white leading-tight">${item.name}</h4>
          <span class="text-[11px] text-cyan-300 font-mono-tech">₹${item.priceINR} × ${item.qty} = ₹${lineTotal}</span>
        </div>
        <button onclick="removeFromCart('${item.id}')" class="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 font-bold">✕</button>
      </div>
    `;
  }).join("");

  totalEl.textContent = `₹${totalINR.toLocaleString('en-IN')}`;
}

window.toggleCartDrawer = function(forceOpen) {
  const drawer = document.getElementById("cart-drawer");
  if (!drawer) return;
  if (forceOpen === true) drawer.classList.remove("translate-x-full");
  else if (forceOpen === false) drawer.classList.add("translate-x-full");
  else drawer.classList.toggle("translate-x-full");
};

window.instantWhatsAppBuy = function(id) {
  const item = allProducts.find(p => p.id === id);
  if (!item) return;
  const msg = `Hello *AquaticArea*! 🌿🐠\nI would like to order:\n• *${item.name}* (${item.size || "Standard"}) — ₹${item.priceINR}\n\nPlease share live video/stock availability and all-India courier shipping details.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
};

window.checkoutCartWhatsApp = function() {
  if (cart.length === 0) return;
  let total = 0;
  const lines = cart.map((c, i) => {
    const sub = c.priceINR * c.qty;
    total += sub;
    return `${i + 1}. *${c.name}* (Qty: ${c.qty}) - ₹${sub}`;
  }).join("\n");

  const msg = `Hello *AquaticArea*! 🌿🦐\nI want to place an order from your website:\n\n${lines}\n\n*Estimated Total: ₹${total.toLocaleString('en-IN')}*\n\nMy Delivery City & Pin Code: `;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
};

/* =========================================================
   6. 3D CUSTOM TANK STUDIO & CALCULATOR (THREE.JS)
   ========================================================= */
window.toggleCalculatorModal = function(show) {
  const modal = document.getElementById("calc-modal");
  if (!modal) {
    const inlineStudio = document.getElementById("studio-3d-section");
    if (inlineStudio && show) {
      inlineStudio.scrollIntoView({ behavior: "smooth", block: "start" });
      updateTankCalculations();
    }
    return;
  }
  if (show) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    updateTankCalculations();
  } else {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
};

window.setHardscapeStyle = function(style, btn) {
  currentHardscapePreset = style;
  if (btn) {
    document.querySelectorAll(".hardscape-style-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }
  updateTankCalculations();
};

function setup3DTankStudio() {
  // Sync slider inputs with text labels
  ['L', 'W', 'H', 'soil'].forEach(id => {
    const slider = document.getElementById(`calc-${id}`);
    const label = document.getElementById(`val-${id}`);
    if (slider && label) {
      slider.addEventListener('input', () => {
        label.textContent = `${slider.value} cm`;
        updateTankCalculations();
      });
    }
  });
}

window.updateTankCalculations = function() {
  const L = parseFloat(document.getElementById("calc-L")?.value || 90);
  const W = parseFloat(document.getElementById("calc-W")?.value || 45);
  const H = parseFloat(document.getElementById("calc-H")?.value || 45);
  const soilDepth = parseFloat(document.getElementById("calc-soil")?.value || 6);

  // Volumetric math
  const grossLitres = (L * W * H) / 1000;
  const netLitres = grossLitres * 0.85; // 15% displacement for hardscape & glass
  const usGallons = netLitres * 0.264172;
  const soilLitres = (L * W * soilDepth) / 1000;
  const filterLPH = Math.round(netLitres * 7); // 7x planted tank turnover
  const heaterWatts = Math.round(netLitres * 1.25);
  const co2BPS = (netLitres / 40).toFixed(1); // CO2 bubbles/sec estimate
  const ledWatts = Math.round(netLitres * 0.45); // Planted LED Watts
  const totalWeightKg = Math.round(netLitres + (soilLitres * 1.2) + (grossLitres * 0.25));

  // Update DOM labels
  const setEl = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setEl("res-gross", `${grossLitres.toFixed(1)} L`);
  setEl("res-net", `${netLitres.toFixed(1)} L (${usGallons.toFixed(1)} Gal)`);
  setEl("res-soil", `${soilLitres.toFixed(1)} L (~${Math.ceil(soilLitres / 9)} × 9L Bags)`);
  setEl("res-filter", `${filterLPH} L/hr Canister`);
  setEl("res-heater", `${heaterWatts}W Titanium`);
  setEl("res-co2", `~${co2BPS} Bubbles/Sec`);
  setEl("res-led", `${ledWatts}W Full-Spectrum LED`);
  setEl("res-weight", `~${totalWeightKg} kg (${Math.round(totalWeightKg * 2.20462)} lbs)`);

  // Update 3D Model in Studio
  if (window.Aquatic3D && window.Aquatic3D.calcTank) {
    window.Aquatic3D.calcTank.rebuild(L, W, H, soilDepth, currentHardscapePreset);
  }
};

window.sendTankSpecWhatsApp = function() {
  const L = document.getElementById("calc-L")?.value || 90;
  const W = document.getElementById("calc-W")?.value || 45;
  const H = document.getElementById("calc-H")?.value || 45;
  const net = document.getElementById("res-net")?.textContent || "";
  const soil = document.getElementById("res-soil")?.textContent || "";
  const filter = document.getElementById("res-filter")?.textContent || "";
  const weight = document.getElementById("res-weight")?.textContent || "";

  const msg = `Hello *AquaticArea*! 🌿📐\nI calculated my custom planted aquarium on your website:\n• *Tank Dimensions:* ${L}cm L × ${W}cm W × ${H}cm H\n• *Net Water Volume:* ${net}\n• *Substrate Required:* ${soil}\n• *Filter Recommendation:* ${filter}\n• *Filled Weight:* ${weight}\n• *Hardscape Theme:* ${currentHardscapePreset.toUpperCase()}\n\nPlease quote me for Opti-White rimless tank glass, spiderwood/stones, and suitable plants!`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
};
