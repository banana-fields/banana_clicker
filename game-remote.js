const SAVE_KEY = "bananaClickerSave";
const LEGACY_SAVE_KEY = "bananaEmpireSave";

const BUILDINGS = [
  { id: "cursor", name: "Singe aide", icon: "🐒", desc: "Un singe qui cueille des bananes.", baseCost: 15, baseBps: 0.1, costMult: 1.15 },
  { id: "bananier", name: "Bananier", icon: "🌴", desc: "Produit des bananes en continu.", baseCost: 50, baseBps: 1, costMult: 1.15 },
  { id: "plantation", name: "Plantation", icon: "🏝️", desc: "Des hectares de bananiers.", baseCost: 300, baseBps: 8, costMult: 1.15 },
  { id: "camion", name: "Camion", icon: "🚚", desc: "Transporte les bananes vers les marchés.", baseCost: 1500, baseBps: 45, costMult: 1.15 },
  { id: "usine", name: "Usine", icon: "🏭", desc: "Transforme tout en purée de banane.", baseCost: 8000, baseBps: 250, costMult: 1.15 },
  { id: "port", name: "Port", icon: "🚢", desc: "Export mondial de bananes.", baseCost: 45000, baseBps: 1400, costMult: 1.15 },
  { id: "empire", name: "Empire Banane", icon: "👑", desc: "Contrôle l'économie mondiale de la banane.", baseCost: 250000, baseBps: 8000, costMult: 1.15 },
  { id: "temple", name: "Temple Banane", icon: "🛕", desc: "Les dieux bénissent tes récoltes.", baseCost: 1500000, baseBps: 50000, costMult: 1.15 },
];

const UPGRADES = [
  { id: "click2", name: "Pouces musclés", icon: "💪", desc: "Double la puissance de clic.", cost: 100, type: "click", mult: 2, req: () => state.totalEarned >= 50 },
  { id: "click5", name: "Gants banane", icon: "🧤", desc: "×5 puissance de clic.", cost: 2000, type: "click", mult: 5, req: () => state.totalEarned >= 1000 },
  { id: "click10", name: "Banane dorée", icon: "✨", desc: "×10 puissance de clic.", cost: 50000, type: "click", mult: 10, req: () => state.totalEarned >= 50000 },
  { id: "bananier2", name: "Engrais miracle", icon: "🧪", desc: "Bananier ×2 production.", cost: 500, type: "building", buildingId: "bananier", mult: 2, req: () => getBuildingCount("bananier") >= 10 },
  { id: "plantation2", name: "Irrigation", icon: "💧", desc: "Plantation ×2 production.", cost: 5000, type: "building", buildingId: "plantation", mult: 2, req: () => getBuildingCount("plantation") >= 10 },
  { id: "global2", name: "Révolution banane", icon: "🍌", desc: "Toute production ×2.", cost: 100000, type: "global", mult: 2, req: () => state.totalEarned >= 100000 },
  { id: "global5", name: "Ère de la banane", icon: "🌟", desc: "Toute production ×3.", cost: 1000000, type: "global", mult: 3, req: () => state.totalEarned >= 1000000 },
];

const ACHIEVEMENTS = [
  { id: "first", name: "Première banane", icon: "🍌", desc: "Collecter ta première banane.", check: () => state.totalEarned >= 1 },
  { id: "hundred", name: "Centurion", icon: "💯", desc: "100 bananes au total.", check: () => state.totalEarned >= 100 },
  { id: "thousand", name: "Mille bananes", icon: "🎯", desc: "1 000 bananes au total.", check: () => state.totalEarned >= 1000 },
  { id: "million", name: "Millionnaire banane", icon: "💰", desc: "1 million de bananes.", check: () => state.totalEarned >= 1000000 },
  { id: "clicker", name: "Clic maniaque", icon: "👆", desc: "1 000 clics.", check: () => state.totalClicks >= 1000 },
  { id: "singe10", name: "Armée de singes", icon: "🐒", desc: "10 singes aides.", check: () => getBuildingCount("cursor") >= 10 },
  { id: "golden", name: "Chasseur doré", icon: "🌟", desc: "Cliquer une banane dorée.", check: () => state.goldenClicked >= 1 },
  { id: "empire", name: "Empereur", icon: "👑", desc: "Acheter l'Empire Banane.", check: () => getBuildingCount("empire") >= 1 },
];

const state = {
  bananas: 0,
  totalEarned: 0,
  totalClicks: 0,
  goldenClicked: 0,
  buildings: {},
  upgrades: [],
  achievements: [],
  clickMult: 1,
  globalMult: 1,
  buildingMults: {},
};

BUILDINGS.forEach((b) => {
  state.buildings[b.id] = 0;
  state.buildingMults[b.id] = 1;
});

let goldenVisible = false;
let goldenTimeout = null;
let lastSave = 0;
let lastShopUpdate = 0;

const bananaBtn = document.getElementById("banana-btn");
const bananaCountEl = document.getElementById("banana-count");
const bpsDisplayEl = document.getElementById("bps-display");
const ppcDisplayEl = document.getElementById("ppc-display");
const goldenBananaEl = document.getElementById("golden-banana");
const buildingsListEl = document.getElementById("buildings-list");
const upgradesListEl = document.getElementById("upgrades-list");
const achievementsListEl = document.getElementById("achievements-list");

function getBuildingCount(id) {
  return state.buildings[id] || 0;
}

function buildingCost(building, count) {
  return Math.floor(building.baseCost * Math.pow(building.costMult, count));
}

function formatNumber(n) {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1000000) return (n / 1000).toFixed(2).replace(/\.?0+$/, "") + "K";
  if (n < 1000000000) return (n / 1000000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n < 1000000000000) return (n / 1000000000).toFixed(2).replace(/\.?0+$/, "") + "B";
  return (n / 1000000000000).toFixed(2).replace(/\.?0+$/, "") + "T";
}

function getBuildingBps(building) {
  const count = getBuildingCount(building.id);
  const mult = state.buildingMults[building.id] || 1;
  return count * building.baseBps * mult * state.globalMult;
}

function getTotalBps() {
  return BUILDINGS.reduce((sum, b) => sum + getBuildingBps(b), 0);
}

function getClickPower() {
  const cursorBps = getBuildingBps(BUILDINGS.find((b) => b.id === "cursor"));
  return Math.max(1, Math.floor((1 + cursorBps * 0.5) * state.clickMult * state.globalMult));
}

function addBananas(amount) {
  state.bananas += amount;
  state.totalEarned += amount;
  checkAchievements();
}

function showFloatText(x, y, text) {
  const el = document.createElement("div");
  el.className = "float-text";
  el.textContent = text;
  el.style.left = x + "px";
  el.style.top = y + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function spawnFallingBananas(clickX) {
  const container = document.getElementById("banana-rain");
  const count = 7 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "falling-banana";
    el.textContent = "🍌";

    const spread = window.innerWidth * 0.55;
    const x = clickX
      ? clickX + (Math.random() - 0.5) * spread
      : Math.random() * window.innerWidth;
    const clampedX = Math.max(10, Math.min(window.innerWidth - 60, x));

    el.style.left = clampedX + "px";
    el.style.fontSize = (48 + Math.random() * 52) + "px";
    el.style.animationDuration = (2.2 + Math.random() * 1.8) + "s";
    el.style.animationDelay = Math.random() * 0.35 + "s";

    container.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

function onBananaClick(e) {
  const power = getClickPower();
  addBananas(power);
  state.totalClicks++;

  bananaBtn.classList.add("pulse");
  setTimeout(() => bananaBtn.classList.remove("pulse"), 200);

  const x = e.clientX || (bananaBtn.offsetLeft + 100);
  const y = e.clientY || (bananaBtn.offsetTop + 100);
  showFloatText(x - 20, y - 30, "+" + formatNumber(power));
  spawnFallingBananas(x);

  updateUI();
  maybeSpawnGolden();
}

function onGoldenClick(e) {
  if (!goldenVisible) return;
  e.stopPropagation();

  const bonus = Math.max(100, getTotalBps() * 30 + getClickPower() * 50);
  addBananas(bonus);
  state.goldenClicked++;

  goldenVisible = false;
  goldenBananaEl.classList.add("hidden");
  clearTimeout(goldenTimeout);

  showFloatText(e.clientX, e.clientY, "+" + formatNumber(bonus) + " 🌟");
  spawnFallingBananas(e.clientX);
  showToast("Banane dorée ! +" + formatNumber(bonus));
  updateUI();
}

function maybeSpawnGolden() {
  if (goldenVisible) return;
  if (Math.random() < 0.008) spawnGolden();
}

function spawnGolden() {
  goldenVisible = true;
  const zone = document.querySelector(".click-zone");
  const rect = zone.getBoundingClientRect();
  const x = 40 + Math.random() * (rect.width - 120);
  const y = 60 + Math.random() * (rect.height - 140);
  goldenBananaEl.style.left = x + "px";
  goldenBananaEl.style.top = y + "px";
  goldenBananaEl.classList.remove("hidden");

  goldenTimeout = setTimeout(() => {
    goldenVisible = false;
    goldenBananaEl.classList.add("hidden");
  }, 8000);
}

function buyBuilding(buildingId) {
  const building = BUILDINGS.find((b) => b.id === buildingId);
  const count = getBuildingCount(buildingId);
  const cost = buildingCost(building, count);

  if (state.bananas < cost) return;

  state.bananas -= cost;
  state.buildings[buildingId] = count + 1;
  showToast(building.name + " acheté !");
  updateUI();
}

function buyUpgrade(upgradeId) {
  const upgrade = UPGRADES.find((u) => u.id === upgradeId);
  if (state.upgrades.includes(upgradeId)) return;
  if (!upgrade.req()) return;
  if (state.bananas < upgrade.cost) return;

  state.bananas -= upgrade.cost;
  state.upgrades.push(upgradeId);

  if (upgrade.type === "click") {
    state.clickMult *= upgrade.mult;
  } else if (upgrade.type === "building") {
    state.buildingMults[upgrade.buildingId] *= upgrade.mult;
  } else if (upgrade.type === "global") {
    state.globalMult *= upgrade.mult;
  }

  showToast("Amélioration : " + upgrade.name);
  updateUI();
}

function checkAchievements() {
  ACHIEVEMENTS.forEach((ach) => {
    if (!state.achievements.includes(ach.id) && ach.check()) {
      state.achievements.push(ach.id);
      showToast("🏆 Trophée : " + ach.name);
    }
  });
}

function renderBuildings() {
  buildingsListEl.innerHTML = BUILDINGS.map((b) => {
    const count = getBuildingCount(b.id);
    const cost = buildingCost(b, count);
    const bps = getBuildingBps(b);
    const canBuy = state.bananas >= cost;
    return `
      <div class="shop-item ${canBuy ? "" : "disabled"}" data-building="${b.id}">
        <div class="item-icon">${b.icon}</div>
        <div class="item-info">
          <div class="item-name">${b.name}</div>
          <div class="item-desc">${b.desc}</div>
        </div>
        <div class="item-meta">
          <div class="item-cost">🍌 ${formatNumber(cost)}</div>
          <div class="item-count">${count} · +${formatNumber(bps)}/s</div>
        </div>
      </div>
    `;
  }).join("");

  buildingsListEl.querySelectorAll(".shop-item:not(.disabled)").forEach((el) => {
    el.addEventListener("click", () => buyBuilding(el.dataset.building));
  });
}

function renderUpgrades() {
  const available = UPGRADES.filter((u) => u.req() && !state.upgrades.includes(u.id));

  if (available.length === 0 && state.upgrades.length === UPGRADES.length) {
    upgradesListEl.innerHTML = "<p class='panel-desc'>Toutes les améliorations sont achetées !</p>";
    return;
  }

  const locked = UPGRADES.filter((u) => !u.req() && !state.upgrades.includes(u.id));
  const owned = UPGRADES.filter((u) => state.upgrades.includes(u.id));

  let html = "";

  available.forEach((u) => {
    const canBuy = state.bananas >= u.cost;
    html += `
      <div class="shop-item ${canBuy ? "" : "disabled"}" data-upgrade="${u.id}">
        <div class="item-icon">${u.icon}</div>
        <div class="item-info">
          <div class="item-name">${u.name}</div>
          <div class="item-desc">${u.desc}</div>
        </div>
        <div class="item-meta">
          <div class="item-cost">🍌 ${formatNumber(u.cost)}</div>
        </div>
      </div>
    `;
  });

  owned.forEach((u) => {
    html += `
      <div class="shop-item owned">
        <div class="item-icon">${u.icon}</div>
        <div class="item-info">
          <div class="item-name">${u.name}</div>
          <div class="item-desc">Acheté ✓</div>
        </div>
      </div>
    `;
  });

  locked.slice(0, 3).forEach((u) => {
    html += `
      <div class="shop-item disabled">
        <div class="item-icon">🔒</div>
        <div class="item-info">
          <div class="item-name">${u.name}</div>
          <div class="item-desc">??? (pas encore débloqué)</div>
        </div>
      </div>
    `;
  });

  upgradesListEl.innerHTML = html;

  upgradesListEl.querySelectorAll("[data-upgrade]").forEach((el) => {
    if (!el.classList.contains("disabled")) {
      el.addEventListener("click", () => buyUpgrade(el.dataset.upgrade));
    }
  });
}

function renderAchievements() {
  achievementsListEl.innerHTML = ACHIEVEMENTS.map((ach) => {
    const unlocked = state.achievements.includes(ach.id);
    return `
      <div class="shop-item achievement ${unlocked ? "unlocked" : "locked"}">
        <div class="item-icon">${unlocked ? ach.icon : "🔒"}</div>
        <div class="item-info">
          <div class="item-name">${unlocked ? ach.name : "???"}</div>
          <div class="item-desc">${unlocked ? ach.desc : "Trophée secret"}</div>
        </div>
        ${unlocked ? '<div class="item-meta"><div class="item-count">✓</div></div>' : ""}
      </div>
    `;
  }).join("");
}

function updateUI() {
  bananaCountEl.textContent = formatNumber(state.bananas);
  bpsDisplayEl.textContent = formatNumber(getTotalBps());
  ppcDisplayEl.textContent = formatNumber(getClickPower());

  renderBuildings();
  renderUpgrades();
  renderAchievements();
}

function saveGame() {
  const data = {
    bananas: state.bananas,
    totalEarned: state.totalEarned,
    totalClicks: state.totalClicks,
    goldenClicked: state.goldenClicked,
    buildings: state.buildings,
    upgrades: state.upgrades,
    achievements: state.achievements,
    clickMult: state.clickMult,
    globalMult: state.globalMult,
    buildingMults: state.buildingMults,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  showToast("Sauvegarde !");
}

function loadGame() {
  let raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    raw = localStorage.getItem(LEGACY_SAVE_KEY);
    if (raw) localStorage.setItem(SAVE_KEY, raw);
  }
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    state.bananas = data.bananas || 0;
    state.totalEarned = data.totalEarned || 0;
    state.totalClicks = data.totalClicks || 0;
    state.goldenClicked = data.goldenClicked || 0;
    state.upgrades = data.upgrades || [];
    state.achievements = data.achievements || [];
    state.clickMult = data.clickMult || 1;
    state.globalMult = data.globalMult || 1;

    if (data.buildings) {
      Object.assign(state.buildings, data.buildings);
    }
    if (data.buildingMults) {
      Object.assign(state.buildingMults, data.buildingMults);
    }
  } catch {
    localStorage.removeItem(SAVE_KEY);
  }
}

function resetGame() {
  if (!confirm("Effacer toute ta progression ?")) return;

  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
  });
});

bananaBtn.addEventListener("click", onBananaClick);
goldenBananaEl.addEventListener("click", onGoldenClick);
document.getElementById("save-btn").addEventListener("click", saveGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);

loadGame();
updateUI();

let accumulator = 0;
let lastTick = performance.now();

function gameLoop(now) {
  const delta = (now - lastTick) / 1000;
  lastTick = now;
  accumulator += delta;

  if (accumulator >= 0.1) {
    const bps = getTotalBps();
    if (bps > 0) {
      addBananas(bps * accumulator);
    }
    accumulator = 0;
    bananaCountEl.textContent = formatNumber(state.bananas);
    bpsDisplayEl.textContent = formatNumber(getTotalBps());

    const nowMs = Date.now();
    if (nowMs - lastShopUpdate > 1000) {
      renderBuildings();
      renderUpgrades();
      lastShopUpdate = nowMs;
    }
    if (nowMs - lastSave > 10000) {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        bananas: state.bananas,
        totalEarned: state.totalEarned,
        totalClicks: state.totalClicks,
        goldenClicked: state.goldenClicked,
        buildings: state.buildings,
        upgrades: state.upgrades,
        achievements: state.achievements,
        clickMult: state.clickMult,
        globalMult: state.globalMult,
        buildingMults: state.buildingMults,
      }));
      lastSave = nowMs;
    }
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

setInterval(() => {
  if (!goldenVisible && Math.random() < 0.15) spawnGolden();
}, 30000);

