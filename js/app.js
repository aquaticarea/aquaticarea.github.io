/**
 * AquaticArea Core Engine (js/app.js)
 * - WebGL/Canvas Caustics & CO2 Pearling
 * - Three.js 3D Rimless Tank Volume Calculator
 * - Dynamic JSON Store & WhatsApp Checkout (+91 7978733900)
 */

const WHATSAPP_NUMBER = "917978733900";
let cart = JSON.parse(localStorage.getItem("aquaticarea_cart") || "[]");
let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  initUnderwaterCaustics();
  loadProducts();
  updateCartUI();
  init3DTankCalculator();
});

/* =========================================================
   1. REALISTIC UNDERWATER CAUSTICS & O2 PEARLING SHADER
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

  // Create sunbeam light rays piercing the water surface
  for (let i = 0; i < 7; i++) {
    rays.push({
      x: Math.random() * width,
      width: 90 + Math.random() * 160,
      angle: 0.15 + Math.random() * 0.12,
      speed: 0.0004 + Math.random() * 0.0006,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Create oxygen pearling micro-bubbles rising from plants
  for (let i = 0; i < 45; i++) {
    bubbles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 2.4,
      vy: 0.35 + Math.random() * 0.85,
      wobble: Math.random() * Math.PI * 2,
      alpha: 0.15 + Math.random() * 0.45
    });
  }

  function animate(time) {
    ctx.clearRect(0, 0, width, height);

    // Render Refracted Sunbeams
    rays.forEach((ray) => {
      const sway = Math.sin(time * ray.speed + ray.phase) * 70;
      const grad = ctx.createLinearGradient(ray.x + sway, 0, ray.x + sway + height * ray.angle, height * 0.85);
      grad.addColorStop(0, "rgba(0, 242, 254, 0.07)");
      grad.addColorStop(0.5, "rgba(16, 185, 129, 0.03)");
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

    // Render Rising Pearling Bubbles
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
   2. DYNAMIC PRODUCT CATALOG & WHATSAPP CART ENGINE
   ========================================================= */
const FALLBACK_PRODUCTS = [
  {
    id: "discus-rt",
    name: "Red Turquoise Discus (Show Grade)",
    category: "fish",
    priceINR: 2400,
    size: "3.5 - 4.0 Inch",
    params: "28-30°C | pH 6.2-6.8 | TDS 80-150",
    stock: "In Stock (Quarantined 14 Days)",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=85",
    featured: true,
    description: "High-body Symphysodon aequifasciatus with vibrant electric blue striations over deep crimson base."
  },
  {
    id: "betta-hm",
    name: "Halfmoon Plakat Betta (Avatar Copper)",
    category: "fish",
    priceINR: 1250,
    size: "Adult Show Male",
    params: "25-27°C | pH 6.5-7.2 | Low Flow",
    stock: "Limited Stock",
    image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=85",
    featured: true,
    description: "Metallic turquoise-scale Plakat with crisp 180-degree caudal spread."
  },
  {
    id: "shrimp-bloody-mary",
    name: "Bloody Mary Neocaridina Shrimp (Colony of 10)",
    category: "shrimp",
    priceINR: 1100,
    size: "1.2 - 1.8 cm Juveniles",
    params: "20-25°C | pH 6.8-7.6 | TDS 160-220",
    stock: "Tank-Bred Colony",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85",
    featured: true,
    description: "Deep wine-red translucent tissue coloration bred in planted tanks."
  },
  {
    id: "plant-buce",
    name: "Bucephalandra 'Kedagang' Clump on Lava Rock",
    category: "plants",
    priceINR: 650,
    size: "10+ Rhizome Heads",
    params: "Low-Med Light | CO2 Optional | Epiphyte",
    stock: "100% Submerged Grown",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=85",
    featured: true,
    description: "Dark plum-green ruffled leaves sprinkled with metallic silver pearling pores."
  }
];

async function loadProducts() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  try {
    const res = await fetch("data/products.json");
    allProducts = res.ok ? await res.json() : FALLBACK_PRODUCTS;
  } catch (e) {
    allProducts = FALLBACK_PRODUCTS;
  }

  renderProductGrid(allProducts, container);
}

function renderProductGrid(items, container) {
  container.innerHTML = items.map(item => `
    <div class="driftwood-box flex flex-col justify-between">
      <div>
        <div class="relative h-56 overflow-hidden">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
          <span class="absolute top-3 left-3 bg-emerald-950/90 border border-emerald-400/40 text-emerald-300 text-xs font-mono-tech px-2.5 py-1 rounded-full">
            ${item.stock}
          </span>
          <span class="absolute bottom-2 right-2 bg-slate-950/85 text-cyan-300 text-xs font-mono-tech px-2.5 py-1 rounded border border-cyan-500/30">
            ${item.size}
          </span>
        </div>
        <div class="p-5">
          <div class="text-xs font-mono-tech text-amber-300/90 mb-1">${item.params}</div>
          <h3 class="text-lg font-bold text-white mb-2">${item.name}</h3>
          <p class="text-sm text-slate-300 leading-relaxed mb-4">${item.description}</p>
        </div>
      </div>
      <div class="px-5 pb-5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <span class="text-xs text-slate-400 block">Live Specimen Price</span>
          <span class="text-xl font-bold text-cyan-300">₹${item.priceINR.toLocaleString('en-IN')}</span>
        </div>
        <div class="flex gap-2">
          <button onclick="addToCart('${item.id}')" class="px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 text-xs font-semibold transition">
            + Add Cart
          </button>
          <button onclick="instantWhatsAppBuy('${item.id}')" class="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition flex items-center gap-1">
            WhatsApp Buy
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

window.filterCategory = function(category) {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;
  const filtered = category === "all" ? allProducts : allProducts.filter(p => p.category === category);
  renderProductGrid(filtered, container);
};

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
  const countEl = document.getElementById("cart-count-badge");
  const listEl = document.getElementById("cart-items-list");
  const totalEl = document.getElementById("cart-total-inr");

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (countEl) countEl.textContent = totalCount;

  if (!listEl || !totalEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = `<p class="text-slate-400 text-sm text-center py-8">Your aquarium basket is empty. Add fish, shrimp, or tissue-culture plants.</p>`;
    totalEl.textContent = "₹0";
    return;
  }

  let totalINR = 0;
  listEl.innerHTML = cart.map(item => {
    const lineTotal = item.priceINR * item.qty;
    totalINR += lineTotal;
    return `
      <div class="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
        <div>
          <h4 class="text-sm font-semibold text-white">${item.name}</h4>
          <span class="text-xs text-cyan-300 font-mono-tech">₹${item.priceINR} × ${item.qty} = ₹${lineTotal}</span>
        </div>
        <button onclick="removeFromCart('${item.id}')" class="text-rose-400 hover:text-rose-300 text-xs px-2 py-1">Remove</button>
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
  const msg = `Hello *AquaticArea*! 🌿🐠\nI would like to order:\n• *${item.name}* (${item.size}) — ₹${item.priceINR}\n\nPlease share live video/stock availability and shipping details.`;
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

  const msg = `Hello *AquaticArea*! 🌿🦐\nI want to place an order from your website:\n\n${lines}\n\n*Estimated Total: ₹${total.toLocaleString('en-IN')}*\n\nMy Delivery Pin Code: `;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
};

/* =========================================================
   3. INTERACTIVE 3D RIMLESS AQUARIUM CALCULATOR (THREE.JS)
   ========================================================= */
let threeScene, threeCamera, threeRenderer, tankGroup;

window.toggleCalculatorModal = function(show) {
  const modal = document.getElementById("calc-modal");
  if (!modal) return;
  if (show) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    updateTankCalculations();
  } else {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
};

function init3DTankCalculator() {
  const container = document.getElementById("three-tank-viewport");
  if (!container || typeof THREE === "undefined") return;

  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 1000);
  threeCamera.position.set(4.2, 2.8, 4.8);
  threeCamera.lookAt(0, 0, 0);

  threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  threeRenderer.setSize(container.clientWidth, container.clientHeight);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(threeRenderer.domElement);

  const ambient = new THREE.AmbientLight(0xdbeafe, 1.3);
  threeScene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.8);
  dirLight.position.set(5, 8, 4);
  threeScene.add(dirLight);

  tankGroup = new THREE.Group();
  threeScene.add(tankGroup);

  build3DTankMesh(90, 45, 45, 6);

  function animate3D() {
    requestAnimationFrame(animate3D);
    if (tankGroup) {
      tankGroup.rotation.y += 0.0045;
    }
    threeRenderer.render(threeScene, threeCamera);
  }
  animate3D();
}

function build3DTankMesh(L, W, H, soilCm) {
  if (!tankGroup) return;
  while (tankGroup.children.length > 0) {
    tankGroup.remove(tankGroup.children[0]);
  }

  // Normalize dimensions for 3D viewport
  const scale = 2.6 / Math.max(L, W, H);
  const bL = L * scale;
  const bW = W * scale;
  const bH = H * scale;
  const sH = Math.max(0.08, (soilCm / H) * bH);

  // 1. Opti-White Rimless Glass Box
  const glassGeo = new THREE.BoxGeometry(bL, bH, bW);
  const edges = new THREE.EdgesGeometry(glassGeo);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xa5f3fc, linewidth: 2 });
  const wireframe = new THREE.LineSegments(edges, lineMat);
  tankGroup.add(wireframe);

  // 2. Water Volume Body
  const waterH = bH * 0.88 - sH;
  if (waterH > 0.05) {
    const waterGeo = new THREE.BoxGeometry(bL * 0.98, waterH, bW * 0.98);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.6
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -bH / 2 + sH + waterH / 2;
    tankGroup.add(waterMesh);
  }

  // 3. Active Aquasoil Substrate Layer
  const soilGeo = new THREE.BoxGeometry(bL * 0.98, sH, bW * 0.98);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x291811, roughness: 0.9 });
  const soilMesh = new THREE.Mesh(soilGeo, soilMat);
  soilMesh.position.y = -bH / 2 + sH / 2;
  tankGroup.add(soilMesh);
}

window.updateTankCalculations = function() {
  const L = parseFloat(document.getElementById("calc-L")?.value || 90);
  const W = parseFloat(document.getElementById("calc-W")?.value || 45);
  const H = parseFloat(document.getElementById("calc-H")?.value || 45);
  const soilDepth = parseFloat(document.getElementById("calc-soil")?.value || 6);

  const grossLitres = (L * W * H) / 1000;
  const netLitres = grossLitres * 0.85; // 15% displacement for driftwood, rock & glass
  const usGallons = netLitres * 0.264172;
  const soilLitres = (L * W * soilDepth) / 1000;
  const filterLPH = Math.round(netLitres * 7); // 7x turnover for planted aquariums
  const heaterWatts = Math.round(netLitres * 1.25);

  document.getElementById("res-gross").textContent = `${grossLitres.toFixed(1)} L`;
  document.getElementById("res-net").textContent = `${netLitres.toFixed(1)} L (${usGallons.toFixed(1)} Gal)`;
  document.getElementById("res-soil").textContent = `${soilLitres.toFixed(1)} Litres (~${Math.ceil(soilLitres / 9)} × 9L Bags)`;
  document.getElementById("res-filter").textContent = `${filterLPH} L/hr Canister`;
  document.getElementById("res-heater").textContent = `${heaterWatts}W Titanium Heater`;

  build3DTankMesh(L, W, H, soilDepth);
};

window.sendTankSpecWhatsApp = function() {
  const L = document.getElementById("calc-L")?.value || 90;
  const W = document.getElementById("calc-W")?.value || 45;
  const H = document.getElementById("calc-H")?.value || 45;
  const net = document.getElementById("res-net")?.textContent || "";
  const soil = document.getElementById("res-soil")?.textContent || "";

  const msg = `Hello *AquaticArea*! 🌿📐\nI calculated my planted tank specs on your website:\n• *Dimensions:* ${L}cm × ${W}cm × ${H}cm\n• *Net Water Volume:* ${net}\n• *Aquasoil Needed:* ${soil}\n\nPlease suggest suitable plants, driftwood hardscape, and fish stocking for this setup!`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
};
