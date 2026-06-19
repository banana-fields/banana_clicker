const SAVE_KEY = "bananaClickerSave";
const LEGACY_SAVE_KEY = "bananaEmpireSave";
const SOUND_KEY = "bananaClickerSound";
const PLAYER_ID_KEY = "bananaClickerPlayerId";
const PLAYER_NAME_KEY = "bananaClickerPlayerName";

let audioCtx = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "off";
let gameStarted = false;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playTone(freq, duration, type = "sine", volume = 0.12, delay = 0) {
  if (!soundEnabled || !audioCtx) return;

  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

function playClickSound() {
  playTone(320 + Math.random() * 80, 0.07, "square", 0.06);
  playTone(520 + Math.random() * 60, 0.05, "sine", 0.04);
}

function playBuySound() {
  playTone(523, 0.1, "square", 0.1);
  playTone(659, 0.1, "square", 0.09, 0.07);
  playTone(784, 0.14, "square", 0.08, 0.14);
}

function playAchievementSound() {
  [523, 659, 784, 1047].forEach((f, i) => playTone(f, 0.22, "triangle", 0.11, i * 0.09));
}

function playGoldenSound() {
  playTone(880, 0.12, "sine", 0.12);
  playTone(1320, 0.18, "sine", 0.09, 0.08);
  playTone(1760, 0.2, "sine", 0.06, 0.16);
}

function playStartSound() {
  [392, 494, 587, 784].forEach((f, i) => playTone(f, 0.28, "triangle", 0.1, i * 0.07));
}

function playSaveSound() {
  playTone(440, 0.08, "sine", 0.08);
  playTone(554, 0.12, "sine", 0.07, 0.06);
}

function playPrestigeSound() {
  [392, 494, 587, 784, 988, 1175].forEach((f, i) => playTone(f, 0.35, "triangle", 0.12, i * 0.1));
  setTimeout(() => playTone(1568, 0.5, "sine", 0.1), 550);
}

const PRESTIGE_MIN_EARNED = 250000;
const PRESTIGE_BONUS_PER_POINT = 0.08;

function updateSoundButton() {
  const btn = document.getElementById("sound-btn");
  if (btn) {
    btn.textContent = soundEnabled ? "🔊 Sons" : "🔇 Sons";
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");
  updateSoundButton();
  if (soundEnabled) {
    initAudio();
    playTone(523, 0.1, "sine", 0.08);
  }
}

const BUILDINGS = [
  { id: "cursor", name: "Singe aide", icon: "🐒", desc: "Un singe qui cueille des bananes.", baseCost: 25, baseBps: 0.1, costMult: 1.18 },
  { id: "bananier", name: "Bananier", icon: "🌴", desc: "Produit des bananes en continu.", baseCost: 80, baseBps: 0.8, costMult: 1.18 },
  { id: "plantation", name: "Plantation", icon: "🏝️", desc: "Des hectares de bananiers.", baseCost: 500, baseBps: 6, costMult: 1.18 },
  { id: "camion", name: "Camion", icon: "🚚", desc: "Transporte les bananes vers les marchés.", baseCost: 2800, baseBps: 40, costMult: 1.18 },
  { id: "usine", name: "Usine", icon: "🏭", desc: "Transforme tout en purée de banane.", baseCost: 15000, baseBps: 220, costMult: 1.18 },
  { id: "port", name: "Port", icon: "🚢", desc: "Export mondial de bananes.", baseCost: 85000, baseBps: 1200, costMult: 1.18 },
  { id: "empire", name: "Empire Banane", icon: "👑", desc: "Contrôle l'économie mondiale de la banane.", baseCost: 500000, baseBps: 7000, costMult: 1.18 },
  { id: "temple", name: "Temple Banane", icon: "🛕", desc: "Les dieux bénissent tes récoltes.", baseCost: 3500000, baseBps: 45000, costMult: 1.18 },
  { id: "observatoire", name: "Observatoire Banane", icon: "🔭", desc: "Repère les constellations de bananes mûres.", baseCost: 85000000, baseBps: 900000, costMult: 1.22 },
  { id: "lune", name: "Lune Banane", icon: "🌙", desc: "Une base lunaire où la gravité aide les récoltes.", baseCost: 4200000000, baseBps: 42000000, costMult: 1.25 },
  { id: "portail", name: "Portail Koko", icon: "🌀", desc: "Vole des bananes dans les dimensions de Gros Koko.", baseCost: 350000000000, baseBps: 2500000000, costMult: 1.28 },
];

const BASE_UPGRADES = [
  { id: "click2", name: "Pouces musclés", icon: "💪", desc: "Double la puissance de clic.", cost: 200, type: "click", mult: 2, req: () => state.totalEarned >= 100 },
  { id: "click5", name: "Gants banane", icon: "🧤", desc: "×5 puissance de clic.", cost: 5000, type: "click", mult: 5, req: () => state.totalEarned >= 5000 },
  { id: "click10", name: "Banane dorée", icon: "✨", desc: "×10 puissance de clic.", cost: 150000, type: "click", mult: 10, req: () => state.totalEarned >= 150000 },
  { id: "global2", name: "Révolution banane", icon: "🍌", desc: "Toute production ×2.", cost: 300000, type: "global", mult: 2, req: () => state.totalEarned >= 500000 },
  { id: "global5", name: "Ère de la banane", icon: "🌟", desc: "Toute production ×3.", cost: 5000000, type: "global", mult: 3, req: () => state.totalEarned >= 5000000 },
];

const BUILDING_UPGRADE_TIERS = [
  { count: 5, mult: 2, costMult: 25, label: "Cadence", icon: "⚙️" },
  { count: 15, mult: 2.5, costMult: 120, label: "Optimisation", icon: "🧪" },
  { count: 35, mult: 3.5, costMult: 900, label: "Maîtrise", icon: "📈" },
  { count: 75, mult: 5, costMult: 8000, label: "Industrialisation", icon: "🏗️" },
];

const UPGRADES = [
  ...BASE_UPGRADES,
  ...BUILDINGS.flatMap((building) =>
    BUILDING_UPGRADE_TIERS.map((tier) => ({
      id: `${building.id}${tier.count}`,
      name: `${tier.label} ${building.name}`,
      icon: tier.icon,
      desc: `${building.name} ×${tier.mult} production à ${tier.count} unités.`,
      cost: Math.floor(building.baseCost * tier.costMult),
      type: "building",
      buildingId: building.id,
      mult: tier.mult,
      req: () => getBuildingCount(building.id) >= tier.count,
    }))
  ),
];

const PRESTIGE_TREE = [
  { id: "roots", name: "Racines stellaires", icon: "🌱", cost: 1, max: 5, value: 0.1, parents: [], desc: "+10% production globale par rang." },
  { id: "clickPath", name: "Doigts légendaires", icon: "👆", cost: 2, max: 5, value: 0.35, parents: ["roots"], desc: "+35% puissance de clic par rang." },
  { id: "idlePath", name: "Plantations sacrées", icon: "🌴", cost: 2, max: 5, value: 0.18, parents: ["roots"], desc: "+18% production passive par rang." },
  { id: "cheapStart", name: "Logistique agile", icon: "📦", cost: 3, max: 4, value: 0.05, parents: ["roots"], desc: "-5% coût des bâtiments par rang." },
  { id: "goldLuck", name: "Aimant doré", icon: "🌟", cost: 3, max: 4, value: 0.25, parents: ["clickPath"], desc: "+25% chance de banane dorée par rang." },
  { id: "goldPower", name: "Alchimie dorée", icon: "✨", cost: 4, max: 4, value: 0.25, parents: ["goldLuck"], desc: "+25% puissance des bananes dorées par rang." },
  { id: "bulkWisdom", name: "Sagesse de masse", icon: "🧠", cost: 4, max: 3, value: 0.08, parents: ["idlePath"], desc: "+8% production globale par tranche de 25 bâtiments." },
  { id: "templeEcho", name: "Écho du Temple", icon: "🛕", cost: 6, max: 3, value: 0.35, parents: ["idlePath", "cheapStart"], desc: "+35% production des tiers Empire et Temple par rang." },
  { id: "frenzyMaster", name: "Danse frénétique", icon: "⚡", cost: 8, max: 2, value: 0.3, parents: ["goldPower", "bulkWisdom"], desc: "+30% durée des bonus temporaires par rang." },
  { id: "ascendantClan", name: "Clan ascendant", icon: "👑", cost: 12, max: 1, value: 1, parents: ["templeEcho", "frenzyMaster"], desc: "Débloque une vraie accélération de mid-game : +75% production globale." },
];

const GOLDEN_VARIANTS = [
  { id: "burst", label: "Banane jackpot", icon: "🌟🍌", weight: 45, desc: "Bonus instantané massif." },
  { id: "productionFrenzy", label: "Fièvre des plantations", icon: "🔥🍌", weight: 25, desc: "Production passive ×5 temporairement." },
  { id: "clickFrenzy", label: "Doigts turbo", icon: "⚡🍌", weight: 20, desc: "Clics ×15 temporairement." },
  { id: "discount", label: "Marché doré", icon: "💰🍌", weight: 10, desc: "Coûts des bâtiments réduits temporairement." },
];

const ACHIEVEMENTS = [
  { id: "first", name: "Première banane", icon: "🍌", desc: "Collecter ta première banane.", check: () => state.lifetimeEarned >= 1 },
  { id: "hundred", name: "Centurion", icon: "💯", desc: "100 bananes au total.", check: () => state.lifetimeEarned >= 100 },
  { id: "thousand", name: "Mille bananes", icon: "🎯", desc: "1 000 bananes au total.", check: () => state.lifetimeEarned >= 1000 },
  { id: "million", name: "Millionnaire banane", icon: "💰", desc: "1 million de bananes.", check: () => state.lifetimeEarned >= 1000000 },
  { id: "clicker", name: "Clic maniaque", icon: "👆", desc: "1 000 clics.", check: () => state.lifetimeClicks >= 1000 },
  { id: "singe10", name: "Armée de singes", icon: "🐒", desc: "10 singes aides.", check: () => getBuildingCount("cursor") >= 10 },
  { id: "golden", name: "Chasseur doré", icon: "🌟", desc: "Cliquer une banane dorée.", check: () => state.goldenClicked >= 1 },
  { id: "empire", name: "Empereur", icon: "👑", desc: "Acheter l'Empire Banane.", check: () => getBuildingCount("empire") >= 1 },
  { id: "prestige1", name: "Réincarnation", icon: "⭐", desc: "Prestiger pour la première fois.", check: () => state.prestigeCount >= 1 },
  { id: "prestige5", name: "Vétéran banane", icon: "🌠", desc: "Atteindre 5 points de prestige.", check: () => state.prestigePoints >= 5 },
  { id: "story", name: "Rebelle", icon: "📖", desc: "Voir la première cutscene.", check: () => state.seenCutscenes.length >= 1 },
];

const CUTSCENES = [
  {
    id: "prologue",
    title: "La dernière banane du matin",
    emoji: "🍌🌴",
    image: "images/cutscenes/01-prologue.png",
    lines: [
      { speaker: "Kiki", text: "Encore une matinée… une banane, une seule. Les gorilles prennent tout le reste." },
      { speaker: "Kiki", text: "Mais si je commence petit… peut-être qu'un jour les singes mangeront à leur faim." },
      { speaker: "Kiki", text: "Allez. Une banane. Puis une autre. C'est ça, mon plan." },
    ],
  },
  {
    id: "ally",
    title: "Premier allié",
    emoji: "🐒🐒",
    image: "images/cutscenes/02-ally.png",
    lines: [
      { speaker: "Bongo", text: "Hé ! Tu cliques comme un fou. Tu montes une révolution ou tu fais du sport ?" },
      { speaker: "Kiki", text: "Les deux. Tu veux rejoindre le clan ?" },
      { speaker: "Bongo", text: "Gratuit ? … OK. Mais je prends 10 % des bananes." },
      { speaker: "Kiki", text: "5 %." },
      { speaker: "Bongo", text: "Deal. Chef." },
    ],
  },
  {
    id: "plantation",
    title: "Terres interdites",
    emoji: "🏝️👷",
    image: "images/cutscenes/03-plantation.png",
    lines: [
      { speaker: "Kiki", text: "Cinq bananiers. On ne se cache plus." },
      { speaker: "Bongo", text: "Au loin… l'usine Banana Factory. Les humains bossent sans voir qu'on repousse les limites." },
      { speaker: "Kiki", text: "Ils font leur stage, on fait notre révolution. Chacun son combat." },
      { speaker: "Bongo", text: "Les gorilles vont remarquer." },
    ],
  },
  {
    id: "convoy",
    title: "Le convoi des gorilles",
    emoji: "🚚🦍",
    image: "images/cutscenes/04-convoy.png",
    lines: [
      { speaker: "Gros Koko", text: "Qui ose transporter des bananes dans MON secteur ?" },
      { speaker: "Bongo", text: "C'est Gros Koko… le gorille qui pense que la gravité lui obéit." },
      { speaker: "Kiki", text: "On ne recule pas. Le camion roule pour le clan." },
      { speaker: "Gros Koko", text: "Tu vas regretter, petit singe." },
    ],
  },
  {
    id: "factory",
    title: "L'usine et les humains",
    emoji: "🏭👷",
    image: "images/cutscenes/05-factory.png",
    lines: [
      { speaker: "Kiki", text: "Une usine à purée. On ne fait plus que cueillir — on transforme." },
      { speaker: "Bongo", text: "Les humains de l'usine font « convoyeur, machine à peler »… nous on fait « liberté »." },
      { speaker: "Kiki", text: "Ils ne savent pas qu'on existe. Mieux vaut ainsi." },
      { speaker: "Bongo", text: "Koko a doublé ses gorilles. Il a peur." },
    ],
  },
  {
    id: "duel",
    title: "Le gorille en chef",
    emoji: "👑🦍",
    image: "images/cutscenes/06-duel.png",
    lines: [
      { speaker: "Gros Koko", text: "Tu contrôles l'économie banane ? Ridicule. Je contrôle les gorilles." },
      { speaker: "Kiki", text: "Et bientôt, les singes contrôleront leur vie." },
      { speaker: "Gros Koko", text: "Je vais écraser ton empire. Comme une banane trop mûre." },
      { speaker: "Kiki", text: "On verra qui glisse en premier." },
      { speaker: "Gros Koko", text: "… Qu'est-ce que ça veut dire ?" },
      { speaker: "Kiki", text: "Tu comprendras." },
    ],
  },
  {
    id: "banana-slip",
    title: "La banane du destin",
    emoji: "🦍🍌💥",
    image: "images/cutscenes/07-banana-slip.png",
    lines: [
      { speaker: "Gros Koko", text: "PERSONNE NE PRIE LE TEMPLE BANANE !" },
      { speaker: "Bongo", text: "Koko ! Regarde tes pieds !" },
      { speaker: "Gros Koko", text: "Quoi ? Une ban— AAAAAH !" },
      { speaker: "Bongo", text: "… Chef. C'était magnifique." },
      { speaker: "Kiki", text: "La gravité est neutre. Elle choisit toujours le gorille le plus arrogant." },
      { speaker: "Gros Koko", text: "Je… je ne glisse pas. C'est… un plongeon tactique." },
      { speaker: "Tous les singes", text: "LIBERTÉ !" },
    ],
  },
  {
    id: "revolution",
    title: "La révolution banane",
    emoji: "⭐🎉🍌",
    image: "images/cutscenes/08-revolution.png",
    lines: [
      { speaker: "Mama Banane", text: "Tu as recommencé. Pas parce que tu as échoué — parce que tu es devenu une légende." },
      { speaker: "Kiki", text: "Chaque prestige, le clan est plus fort. Koko est encore dans la boue, probablement." },
      { speaker: "Bongo", text: "Il dit qu'il « médite sur la banane »." },
      { speaker: "Kiki", text: "Les singes sont libres. Les humains bossent. Les gorilles… glissent." },
      { speaker: "Kiki", text: "La révolution banane continue." },
    ],
  },
];

const state = {
  bananas: 0,
  totalEarned: 0,
  lifetimeEarned: 0,
  totalClicks: 0,
  lifetimeClicks: 0,
  goldenClicked: 0,
  buildings: {},
  upgrades: [],
  achievements: [],
  clickMult: 1,
  globalMult: 1,
  buildingMults: {},
  prestigePoints: 0,
  prestigeSpent: 0,
  prestigeTree: {},
  prestigeCount: 0,
  seenCutscenes: [],
};

BUILDINGS.forEach((b) => {
  state.buildings[b.id] = 0;
  state.buildingMults[b.id] = 1;
});

let goldenVisible = false;
let goldenTimeout = null;
let currentGoldenVariant = null;
let activeTimedEffects = [];
let lastSave = 0;
let lastShopUpdate = 0;
let cutsceneActive = false;
let currentCutscene = null;
let cutsceneLineIndex = 0;
const pendingCutscenes = [];

const welcomeScreenEl = document.getElementById("welcome-screen");
const gameScreenEl = document.getElementById("game-screen");
const welcomeContinueEl = document.getElementById("welcome-continue");
const bananaBtn = document.getElementById("banana-btn");
const bananaCountEl = document.getElementById("banana-count");
const bpsDisplayEl = document.getElementById("bps-display");
const ppcDisplayEl = document.getElementById("ppc-display");
const clickCountEl = document.getElementById("click-count");
const prestigeDisplayEl = document.getElementById("prestige-display");
const prestigePanelEl = document.getElementById("prestige-panel");
const goldenBananaEl = document.getElementById("golden-banana");
const buildingsListEl = document.getElementById("buildings-list");
const upgradesListEl = document.getElementById("upgrades-list");
const achievementsListEl = document.getElementById("achievements-list");
const cutsceneOverlayEl = document.getElementById("cutscene-overlay");
const cutsceneImageEl = document.getElementById("cutscene-image");
const cutsceneFallbackEl = document.getElementById("cutscene-fallback");
const cutsceneTitleEl = document.getElementById("cutscene-title");
const cutsceneLineEl = document.getElementById("cutscene-line");
const cutsceneNextEl = document.getElementById("cutscene-next");
const cutsceneSkipEl = document.getElementById("cutscene-skip");

function getBuildingCount(id) {
  return state.buildings[id] || 0;
}

function buildingCost(building, count) {
  return Math.floor(building.baseCost * Math.pow(building.costMult, count) * getBuildingCostMultiplier());
}

function formatNumber(n) {
  if (n < 1000) {
    const hasFraction = Math.abs(n % 1) > 0.0001;
    if (!hasFraction) {
      return Math.floor(n).toLocaleString("fr-FR");
    }
    return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  if (n < 1000000) {
    const v = n / 1000;
    return v.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + "K";
  }
  if (n < 1000000000) {
    const v = n / 1000000;
    return v.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + "M";
  }
  if (n < 1000000000000) {
    const v = n / 1000000000;
    return v.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + "B";
  }
  const v = n / 1000000000000;
  return v.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + "T";
}

function getPrestigeNodeLevel(id) {
  return state.prestigeTree[id] || 0;
}

function getPrestigeNode(id) {
  return PRESTIGE_TREE.find((node) => node.id === id);
}

function getAvailablePrestigePoints() {
  return Math.max(0, state.prestigePoints - state.prestigeSpent);
}

function getPrestigeNodeBonus(id) {
  const node = getPrestigeNode(id);
  if (!node) return 0;
  return getPrestigeNodeLevel(id) * node.value;
}

function canUnlockPrestigeNode(node) {
  if (getPrestigeNodeLevel(node.id) >= node.max) return false;
  if (getAvailablePrestigePoints() < node.cost) return false;
  return node.parents.every((parentId) => getPrestigeNodeLevel(parentId) > 0);
}

function getActiveEffect(id) {
  const now = Date.now();
  activeTimedEffects = activeTimedEffects.filter((effect) => effect.expiresAt > now);
  return activeTimedEffects.find((effect) => effect.id === id);
}

function getTimedMultiplier(id) {
  const effect = getActiveEffect(id);
  return effect ? effect.mult : 1;
}

function getGoldenPowerMultiplier() {
  return 1 + getPrestigeNodeBonus("goldPower");
}

function getGoldenDurationMultiplier() {
  return 1 + getPrestigeNodeBonus("frenzyMaster");
}

function getGoldenSpawnMultiplier() {
  return 1 + getPrestigeNodeBonus("goldLuck");
}

function getBuildingCostMultiplier() {
  const prestigeDiscount = Math.min(0.5, getPrestigeNodeBonus("cheapStart"));
  const timedDiscount = getActiveEffect("discount") ? 0.75 : 1;
  return Math.max(0.35, (1 - prestigeDiscount) * timedDiscount);
}

function getBulkWisdomMultiplier() {
  const levelBonus = getPrestigeNodeBonus("bulkWisdom");
  if (levelBonus <= 0) return 1;
  const totalBuildings = BUILDINGS.reduce((sum, building) => sum + getBuildingCount(building.id), 0);
  return 1 + Math.floor(totalBuildings / 25) * levelBonus;
}

function getLateTierMultiplier(buildingId) {
  if (buildingId !== "empire" && buildingId !== "temple") return 1;
  return 1 + getPrestigeNodeBonus("templeEcho");
}

function getPrestigeMultiplier() {
  const base = 1 + state.prestigePoints * PRESTIGE_BONUS_PER_POINT;
  const tree = 1 + getPrestigeNodeBonus("roots") + (getPrestigeNodeLevel("ascendantClan") > 0 ? 0.75 : 0);
  return base * tree * getBulkWisdomMultiplier();
}

function getPrestigeGainFromEarned(earned) {
  if (earned < PRESTIGE_MIN_EARNED) return 0;
  return Math.floor(Math.sqrt(earned / PRESTIGE_MIN_EARNED));
}

function getBuildingBps(building) {
  const count = getBuildingCount(building.id);
  const mult = state.buildingMults[building.id] || 1;
  return count * building.baseBps * mult * state.globalMult * getPrestigeMultiplier() * (1 + getPrestigeNodeBonus("idlePath")) * getLateTierMultiplier(building.id) * getTimedMultiplier("productionFrenzy");
}

function getTotalBps() {
  return BUILDINGS.reduce((sum, b) => sum + getBuildingBps(b), 0);
}

function getClickPower() {
  const cursor = BUILDINGS.find((b) => b.id === "cursor");
  const count = getBuildingCount("cursor");
  const mult = state.buildingMults[cursor.id] || 1;
  const cursorContribution = count * cursor.baseBps * mult * 0.5;
  return Math.max(1, Math.floor((1 + cursorContribution) * state.clickMult * state.globalMult * getPrestigeMultiplier() * (1 + getPrestigeNodeBonus("clickPath")) * getTimedMultiplier("clickFrenzy")));
}

function addBananas(amount) {
  state.bananas += amount;
  state.totalEarned += amount;
  state.lifetimeEarned += amount;
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

function addTimedEffect(id, label, mult, durationSeconds) {
  const duration = Math.round(durationSeconds * getGoldenDurationMultiplier());
  activeTimedEffects = activeTimedEffects.filter((effect) => effect.id !== id);
  activeTimedEffects.push({
    id,
    label,
    mult,
    expiresAt: Date.now() + duration * 1000,
  });
  showToast(`${label} actif (${duration}s)`);
}

function onBananaClick(e) {
  if (!gameStarted || cutsceneActive) return;

  const power = getClickPower();
  addBananas(power);
  state.totalClicks++;
  state.lifetimeClicks++;
  playClickSound();

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

  const variant = currentGoldenVariant || GOLDEN_VARIANTS[0];
  const power = getGoldenPowerMultiplier();
  let bonus = 0;

  if (variant.id === "burst") {
    bonus = Math.max(100, (getTotalBps() * 45 + getClickPower() * 75) * power);
    addBananas(bonus);
  } else if (variant.id === "productionFrenzy") {
    addTimedEffect("productionFrenzy", "Fièvre des plantations ×5", 5 * power, 30);
  } else if (variant.id === "clickFrenzy") {
    addTimedEffect("clickFrenzy", "Doigts turbo ×15", 15 * power, 20);
  } else if (variant.id === "discount") {
    addTimedEffect("discount", "Marché doré -25% coûts", 1, 25);
  }

  state.goldenClicked++;

  goldenVisible = false;
  currentGoldenVariant = null;
  goldenBananaEl.classList.add("hidden");
  clearTimeout(goldenTimeout);

  playGoldenSound();
  showFloatText(e.clientX, e.clientY, bonus > 0 ? "+" + formatNumber(bonus) + " 🌟" : variant.label);
  spawnFallingBananas(e.clientX);
  if (bonus > 0) {
    showToast(`${variant.label} ! +${formatNumber(bonus)}`);
  }
  updateUI();
}

function maybeSpawnGolden() {
  if (goldenVisible) return;
  if (Math.random() < 0.008 * getGoldenSpawnMultiplier()) spawnGolden();
}

function spawnGolden() {
  currentGoldenVariant = pickGoldenVariant();
  goldenVisible = true;
  const zone = document.querySelector(".click-zone");
  const rect = zone.getBoundingClientRect();
  const x = 40 + Math.random() * (rect.width - 120);
  const y = 60 + Math.random() * (rect.height - 140);
  goldenBananaEl.style.left = x + "px";
  goldenBananaEl.style.top = y + "px";
  goldenBananaEl.textContent = currentGoldenVariant.icon;
  goldenBananaEl.title = `${currentGoldenVariant.label} — ${currentGoldenVariant.desc}`;
  goldenBananaEl.classList.remove("hidden");

  goldenTimeout = setTimeout(() => {
    goldenVisible = false;
    currentGoldenVariant = null;
    goldenBananaEl.classList.add("hidden");
  }, 8000);
}

function pickGoldenVariant() {
  const totalWeight = GOLDEN_VARIANTS.reduce((sum, variant) => sum + variant.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const variant of GOLDEN_VARIANTS) {
    roll -= variant.weight;
    if (roll <= 0) return variant;
  }
  return GOLDEN_VARIANTS[0];
}

function buyBuilding(buildingId, quantity = 1) {
  const building = BUILDINGS.find((b) => b.id === buildingId);
  let count = getBuildingCount(buildingId);
  let bought = 0;
  let totalCost = 0;

  while (bought < quantity) {
    const cost = buildingCost(building, count);
    if (state.bananas < cost) break;
    state.bananas -= cost;
    totalCost += cost;
    count += 1;
    bought += 1;
  }

  if (bought <= 0) return;

  state.buildings[buildingId] = count;
  playBuySound();
  showToast(`${building.name} ×${bought} acheté${bought > 1 ? "s" : ""} (${formatNumber(totalCost)} 🍌)`);
  checkCutsceneTriggers("building", buildingId);
  updateUI();
}

function buyMaxBuilding(buildingId) {
  buyBuilding(buildingId, Number.POSITIVE_INFINITY);
}

function buyAllAffordableBuildings() {
  let bought = 0;
  const ordered = [...BUILDINGS].reverse();

  let keepBuying = true;
  while (keepBuying) {
    keepBuying = false;
    for (const building of ordered) {
      const count = getBuildingCount(building.id);
      const cost = buildingCost(building, count);
      if (state.bananas >= cost) {
        state.bananas -= cost;
        state.buildings[building.id] = count + 1;
        bought += 1;
        keepBuying = true;
        checkCutsceneTriggers("building", building.id);
      }
    }
  }

  if (bought <= 0) {
    showToast("Aucun bâtiment abordable.");
    return;
  }

  playBuySound();
  showToast(`Achat groupé : ${bought} bâtiment${bought > 1 ? "s" : ""}`);
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

  playBuySound();
  showToast("Amélioration : " + upgrade.name);
  updateUI();
}

function buyAllAffordableUpgrades() {
  const affordable = UPGRADES
    .filter((upgrade) => upgrade.req() && !state.upgrades.includes(upgrade.id) && state.bananas >= upgrade.cost)
    .sort((a, b) => a.cost - b.cost);

  let bought = 0;
  affordable.forEach((upgrade) => {
    if (state.bananas < upgrade.cost || state.upgrades.includes(upgrade.id)) return;
    state.bananas -= upgrade.cost;
    state.upgrades.push(upgrade.id);
    if (upgrade.type === "click") {
      state.clickMult *= upgrade.mult;
    } else if (upgrade.type === "building") {
      state.buildingMults[upgrade.buildingId] *= upgrade.mult;
    } else if (upgrade.type === "global") {
      state.globalMult *= upgrade.mult;
    }
    bought += 1;
  });

  if (bought <= 0) {
    showToast("Aucune amélioration abordable.");
    return;
  }

  playBuySound();
  showToast(`Améliorations achetées : ${bought}`);
  updateUI();
}

function checkAchievements() {
  ACHIEVEMENTS.forEach((ach) => {
    if (!state.achievements.includes(ach.id) && ach.check()) {
      state.achievements.push(ach.id);
      playAchievementSound();
      showToast("🏆 Trophée : " + ach.name);
    }
  });
}

function renderBuildings() {
  const actions = `
    <div class="building-actions">
      <button type="button" id="buy-all-buildings-btn" class="mini-action-btn">Acheter tout abordable</button>
    </div>
  `;

  buildingsListEl.innerHTML = actions + BUILDINGS.map((b) => {
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
          <button type="button" class="mini-action-btn buy-max-btn" data-buy-max="${b.id}" ${canBuy ? "" : "disabled"}>Max</button>
        </div>
      </div>
    `;
  }).join("");

  buildingsListEl.querySelectorAll(".shop-item:not(.disabled)").forEach((el) => {
    el.addEventListener("click", () => buyBuilding(el.dataset.building));
  });

  document.getElementById("buy-all-buildings-btn")?.addEventListener("click", buyAllAffordableBuildings);
  buildingsListEl.querySelectorAll("[data-buy-max]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!btn.disabled) buyMaxBuilding(btn.dataset.buyMax);
    });
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

  if (available.length > 0) {
    html += `
      <div class="building-actions">
        <button type="button" id="buy-all-upgrades-btn" class="mini-action-btn">Acheter toutes dispo</button>
      </div>
    `;
  }

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
  document.getElementById("buy-all-upgrades-btn")?.addEventListener("click", buyAllAffordableUpgrades);
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

function renderPrestige() {
  if (!prestigePanelEl) return;

  const gain = getPrestigeGainFromEarned(state.totalEarned);
  const mult = getPrestigeMultiplier();
  const bonusPct = Math.round((mult - 1) * 100);
  const nextBase = 1 + (state.prestigePoints + gain) * PRESTIGE_BONUS_PER_POINT;
  const currentBase = 1 + state.prestigePoints * PRESTIGE_BONUS_PER_POINT;
  const nextMult = currentBase > 0 ? mult * (nextBase / currentBase) : mult;
  const nextBonusPct = Math.round((nextMult - 1) * 100);
  const canPrestige = gain > 0;
  const availablePoints = getAvailablePrestigePoints();
  const treeHtml = PRESTIGE_TREE.map((node) => {
    const level = getPrestigeNodeLevel(node.id);
    const maxed = level >= node.max;
    const canBuy = canUnlockPrestigeNode(node);
    const lockedByParent = !node.parents.every((parentId) => getPrestigeNodeLevel(parentId) > 0);
    const parentText = node.parents.length > 0
      ? `Requiert : ${node.parents.map((parentId) => getPrestigeNode(parentId)?.name || parentId).join(", ")}`
      : "Racine de l'arbre";
    return `
      <div class="prestige-node ${maxed ? "maxed" : ""} ${canBuy ? "available" : "locked"}">
        <div class="prestige-node-icon">${node.icon}</div>
        <div class="prestige-node-info">
          <div class="prestige-node-name">${node.name}</div>
          <div class="prestige-node-desc">${node.desc}</div>
          <div class="prestige-node-req">${lockedByParent ? parentText : `Rang ${level}/${node.max}`}</div>
        </div>
        <button type="button" class="prestige-node-btn" data-prestige-node="${node.id}" ${canBuy ? "" : "disabled"}>
          ${maxed ? "MAX" : `${node.cost} ⭐`}
        </button>
      </div>
    `;
  }).join("");

  prestigePanelEl.innerHTML = `
    <div class="prestige-hero">
      <div class="prestige-hero-icon">⭐</div>
      <div class="prestige-hero-title">Bonus de prestige</div>
      <div class="prestige-hero-mult">×${mult.toFixed(2)} (+${bonusPct}%)</div>
    </div>
    <div class="prestige-stats">
      <div class="prestige-stat">
        <span class="prestige-stat-label">Points</span>
        <span class="prestige-stat-value">${availablePoints}/${state.prestigePoints} ⭐</span>
      </div>
      <div class="prestige-stat">
        <span class="prestige-stat-label">Investis</span>
        <span class="prestige-stat-value">${state.prestigeSpent} ⭐</span>
      </div>
      <div class="prestige-stat">
        <span class="prestige-stat-label">Prestiges</span>
        <span class="prestige-stat-value">${state.prestigeCount}</span>
      </div>
      <div class="prestige-stat">
        <span class="prestige-stat-label">Cette run</span>
        <span class="prestige-stat-value">${formatNumber(state.totalEarned)}</span>
      </div>
      <div class="prestige-stat">
        <span class="prestige-stat-label">Gain si prestige</span>
        <span class="prestige-stat-value">+${gain} ⭐</span>
      </div>
    </div>
    <p class="prestige-desc">
      Prestiger efface ta run (bananes, plantations, améliorations) mais garde tes trophées, points et arbre de prestige.
      Chaque point donne +${Math.round(PRESTIGE_BONUS_PER_POINT * 100)}% de base, puis l'arbre ajoute des choix permanents.
      Minimum : ${formatNumber(PRESTIGE_MIN_EARNED)} bananes gagnées cette run.
    </p>
    <button type="button" id="prestige-btn" class="prestige-btn ${canPrestige ? "ready" : "disabled"}" ${canPrestige ? "" : "disabled"}>
      ${canPrestige ? `⭐ PRESTIGER (+${gain} pt → +${nextBonusPct}%)` : "🔒 Pas assez de bananes cette run"}
    </button>
    <div class="prestige-tree">
      <div class="prestige-tree-title">Arbre de prestige</div>
      <p class="prestige-tree-help">Les premiers rangs sont accessibles, les branches hautes coûtent cher : choisis une spécialisation.</p>
      ${treeHtml}
    </div>
    <p class="prestige-warning">Le bouton Reset efface tout, y compris le prestige.</p>
  `;

  const btn = document.getElementById("prestige-btn");
  if (btn && canPrestige) {
    btn.addEventListener("click", doPrestige);
  }

  prestigePanelEl.querySelectorAll("[data-prestige-node]").forEach((btn) => {
    btn.addEventListener("click", () => buyPrestigeNode(btn.dataset.prestigeNode));
  });
}

function buyPrestigeNode(nodeId) {
  const node = getPrestigeNode(nodeId);
  if (!node || !canUnlockPrestigeNode(node)) return;

  state.prestigeTree[nodeId] = getPrestigeNodeLevel(nodeId) + 1;
  state.prestigeSpent += node.cost;
  playBuySound();
  showToast(`Prestige : ${node.name} rang ${state.prestigeTree[nodeId]}/${node.max}`);
  updateUI();
  persistSave();
}

function queueCutscene(id) {
  if (state.seenCutscenes.includes(id)) return;
  if (pendingCutscenes.includes(id)) return;
  pendingCutscenes.push(id);
  if (!cutsceneActive) {
    playNextCutscene();
  }
}

function playNextCutscene() {
  if (pendingCutscenes.length === 0) {
    cutsceneActive = false;
    currentCutscene = null;
    return;
  }

  const id = pendingCutscenes.shift();
  if (state.seenCutscenes.includes(id)) {
    playNextCutscene();
    return;
  }

  const scene = CUTSCENES.find((c) => c.id === id);
  if (!scene) {
    playNextCutscene();
    return;
  }

  currentCutscene = scene;
  cutsceneLineIndex = 0;
  cutsceneActive = true;

  cutsceneOverlayEl.classList.remove("hidden");
  cutsceneOverlayEl.setAttribute("aria-hidden", "false");
  cutsceneTitleEl.textContent = scene.title;

  cutsceneImageEl.hidden = true;
  cutsceneImageEl.src = scene.image;
  cutsceneImageEl.onload = () => {
    cutsceneImageEl.hidden = false;
    cutsceneFallbackEl.style.display = "none";
  };
  cutsceneImageEl.onerror = () => {
    cutsceneImageEl.hidden = true;
    cutsceneFallbackEl.style.display = "flex";
    cutsceneFallbackEl.textContent = scene.emoji;
  };
  cutsceneFallbackEl.style.display = "flex";
  cutsceneFallbackEl.textContent = scene.emoji;

  updateCutsceneLine();
}

function updateCutsceneLine() {
  if (!currentCutscene) return;

  const line = currentCutscene.lines[cutsceneLineIndex];
  const isLast = cutsceneLineIndex >= currentCutscene.lines.length - 1;
  cutsceneLineEl.innerHTML = "<strong>" + line.speaker + "</strong>" + line.text;
  cutsceneNextEl.textContent = isLast ? "Terminer" : "Continuer";
}

function finishCutscene() {
  if (currentCutscene && !state.seenCutscenes.includes(currentCutscene.id)) {
    state.seenCutscenes.push(currentCutscene.id);
    checkAchievements();
    persistSave();
  }

  cutsceneOverlayEl.classList.add("hidden");
  cutsceneOverlayEl.setAttribute("aria-hidden", "true");
  currentCutscene = null;
  cutsceneLineIndex = 0;

  setTimeout(() => playNextCutscene(), 300);
}

function skipCutscene() {
  finishCutscene();
}

function nextCutsceneLine() {
  if (!currentCutscene) return;
  cutsceneLineIndex += 1;
  if (cutsceneLineIndex >= currentCutscene.lines.length) {
    finishCutscene();
  } else {
    updateCutsceneLine();
  }
}

function checkCutsceneTriggers(source, buildingId) {
  if (source === "start") {
    queueCutscene("prologue");
    return;
  }

  if (source === "building") {
    if (buildingId === "cursor" && getBuildingCount("cursor") === 1) {
      queueCutscene("ally");
    }
    if (buildingId === "bananier" && getBuildingCount("bananier") >= 5) {
      queueCutscene("plantation");
    }
    if (buildingId === "camion" && getBuildingCount("camion") === 1) {
      queueCutscene("convoy");
    }
    if (buildingId === "usine" && getBuildingCount("usine") === 1) {
      queueCutscene("factory");
    }
    if (buildingId === "empire" && getBuildingCount("empire") === 1) {
      queueCutscene("duel");
    }
    if (buildingId === "temple" && getBuildingCount("temple") === 1) {
      queueCutscene("banana-slip");
    }
  }

  if (source === "prestige" && state.prestigeCount === 1) {
    queueCutscene("revolution");
  }
}

function persistSave() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(buildSaveData()));
}

function resetRunState() {
  state.bananas = 0;
  state.totalEarned = 0;
  state.totalClicks = 0;
  state.goldenClicked = 0;
  state.upgrades = [];
  state.clickMult = 1;
  state.globalMult = 1;
  activeTimedEffects = [];
  BUILDINGS.forEach((b) => {
    state.buildings[b.id] = 0;
    state.buildingMults[b.id] = 1;
  });
  goldenVisible = false;
  currentGoldenVariant = null;
  goldenBananaEl.classList.add("hidden");
  clearTimeout(goldenTimeout);
}

function doPrestige() {
  const gain = getPrestigeGainFromEarned(state.totalEarned);
  if (gain <= 0) return;

  const newMult = 1 + (state.prestigePoints + gain) * PRESTIGE_BONUS_PER_POINT;
  const msg =
    `Prestiger et gagner ${gain} point(s) de prestige ?\n\n` +
    `Tu perds : bananes, plantations, améliorations.\n` +
    `Tu gardes : trophées, points de prestige.\n\n` +
    `Nouveau bonus : ×${newMult.toFixed(2)} production`;

  if (!confirm(msg)) return;

  state.prestigePoints += gain;
  state.prestigeCount += 1;
  resetRunState();
  checkAchievements();
  playPrestigeSound();
  showToast(`⭐ Prestige ! +${gain} pt — ×${getPrestigeMultiplier().toFixed(2)} prod`);
  checkCutsceneTriggers("prestige");
  updateUI();
  saveGame();
}

function buildSaveData() {
  return {
    bananas: state.bananas,
    totalEarned: state.totalEarned,
    lifetimeEarned: state.lifetimeEarned,
    totalClicks: state.totalClicks,
    lifetimeClicks: state.lifetimeClicks,
    goldenClicked: state.goldenClicked,
    buildings: state.buildings,
    upgrades: state.upgrades,
    achievements: state.achievements,
    clickMult: state.clickMult,
    globalMult: state.globalMult,
    buildingMults: state.buildingMults,
    prestigePoints: state.prestigePoints,
    prestigeSpent: state.prestigeSpent,
    prestigeTree: state.prestigeTree,
    prestigeCount: state.prestigeCount,
    seenCutscenes: state.seenCutscenes,
  };
}

function updateUI() {
  bananaCountEl.textContent = formatNumber(state.bananas);
  bpsDisplayEl.textContent = formatNumber(getTotalBps());
  ppcDisplayEl.textContent = formatNumber(getClickPower());
  if (clickCountEl) clickCountEl.textContent = formatNumber(state.totalClicks);
  if (prestigeDisplayEl) {
    prestigeDisplayEl.textContent = "⭐ " + state.prestigePoints + " (×" + getPrestigeMultiplier().toFixed(2) + ")";
  }

  renderBuildings();
  renderUpgrades();
  renderAchievements();
  renderPrestige();
}

function saveGame() {
  persistSave();
  playSaveSound();
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
    state.lifetimeEarned = data.lifetimeEarned || data.totalEarned || 0;
    state.totalClicks = data.totalClicks || 0;
    state.lifetimeClicks = data.lifetimeClicks || data.totalClicks || 0;
    state.goldenClicked = data.goldenClicked || 0;
    state.upgrades = data.upgrades || [];
    state.achievements = data.achievements || [];
    state.clickMult = data.clickMult || 1;
    state.globalMult = data.globalMult || 1;
    state.prestigePoints = data.prestigePoints || 0;
    state.prestigeSpent = data.prestigeSpent || 0;
    state.prestigeTree = data.prestigeTree || {};
    state.prestigeCount = data.prestigeCount || 0;
    state.seenCutscenes = data.seenCutscenes || [];
    state.prestigeSpent = Math.min(state.prestigeSpent, state.prestigePoints);

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
  if (!confirm("Effacer TOUTE ta progression (y compris le prestige) ?")) return;

  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

function hasSavedProgress() {
  return state.totalEarned > 0 || state.totalClicks > 0 || state.bananas > 0 || state.prestigePoints > 0;
}

function updateWelcomeContinue() {
  if (!welcomeContinueEl) return;
  if (hasSavedProgress()) {
    let msg = "Progression trouvée : " + formatNumber(state.bananas) + " bananes · " + formatNumber(state.totalClicks) + " clics";
    if (state.prestigePoints > 0) {
      msg += " · ⭐ " + state.prestigePoints + " prestige";
    }
    welcomeContinueEl.textContent = msg;
    welcomeContinueEl.classList.remove("hidden");
  } else {
    welcomeContinueEl.classList.add("hidden");
  }
}

function startGame() {
  initAudio();
  playStartSound();
  gameStarted = true;

  welcomeScreenEl.classList.add("fade-out");
  gameScreenEl.classList.remove("hidden");

  setTimeout(() => {
    welcomeScreenEl.style.display = "none";
  }, 650);

  updateUI();
  setTimeout(() => checkCutsceneTriggers("start"), 900);
}

document.getElementById("play-btn").addEventListener("click", startGame);

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
document.getElementById("sound-btn").addEventListener("click", toggleSound);

cutsceneNextEl.addEventListener("click", nextCutsceneLine);
cutsceneSkipEl.addEventListener("click", skipCutscene);
cutsceneOverlayEl.addEventListener("click", (e) => {
  if (e.target === cutsceneOverlayEl) skipCutscene();
});

loadGame();
updateWelcomeContinue();
updateSoundButton();

let accumulator = 0;
let lastTick = performance.now();

function gameLoop(now) {
  const delta = (now - lastTick) / 1000;
  lastTick = now;
  accumulator += delta;

  if (!gameStarted) {
    requestAnimationFrame(gameLoop);
    return;
  }

  if (accumulator >= 0.1) {
    const bps = getTotalBps();
    if (bps > 0) {
      addBananas(bps * accumulator);
    }
    accumulator = 0;
    bananaCountEl.textContent = formatNumber(state.bananas);
    bpsDisplayEl.textContent = formatNumber(getTotalBps());
    ppcDisplayEl.textContent = formatNumber(getClickPower());

    const nowMs = Date.now();
    if (nowMs - lastShopUpdate > 1000) {
      renderBuildings();
      renderUpgrades();
      renderPrestige();
      lastShopUpdate = nowMs;
    }
    if (nowMs - lastSave > 10000) {
      persistSave();
      lastSave = nowMs;
    }
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

setInterval(() => {
  if (!gameStarted || goldenVisible || Math.random() >= Math.min(0.45, 0.15 * getGoldenSpawnMultiplier())) return;
  spawnGolden();
}, 30000);

// ─── Leaderboard ────────────────────────────────────────────────────────────

const leaderboardListEl = document.getElementById("leaderboard-list");

function getOrCreatePlayerId() {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

function renderLeaderboard(entries) {
  if (!leaderboardListEl) return;
  if (!entries || entries.length === 0) {
    leaderboardListEl.innerHTML = '<p class="leaderboard-empty">Aucun score enregistré.</p>';
    return;
  }
  leaderboardListEl.innerHTML = entries
    .map((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      const prestige = entry.prestigePoints > 0 ? ` · ⭐ ${entry.prestigePoints}` : "";
      return `
        <div class="shop-item leaderboard-row">
          <div class="leaderboard-rank">${medal}</div>
          <div class="item-info">
            <div class="item-name">${escapeHtml(entry.name)}</div>
            <div class="item-desc">${formatNumber(entry.score)} bananes${prestige}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function fetchLeaderboard() {
  if (!leaderboardListEl) return;
  leaderboardListEl.innerHTML = '<p class="leaderboard-empty">Chargement…</p>';
  try {
    const res = await fetch("/api/leaderboard");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderLeaderboard(data.entries);
  } catch {
    leaderboardListEl.innerHTML = '<p class="leaderboard-empty">Impossible de charger le classement.</p>';
  }
}

async function submitLeaderboardScore() {
  const score = Math.floor(state.lifetimeEarned);
  if (score <= 0) {
    showToast("Aucun score à envoyer !");
    return;
  }
  let name = localStorage.getItem(PLAYER_NAME_KEY);
  if (!name) {
    name = prompt("Entre ton pseudo pour le classement (max 32 caractères) :");
    if (!name || name.trim().length === 0) return;
    name = name.trim();
    localStorage.setItem(PLAYER_NAME_KEY, name);
  }

  try {
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: getOrCreatePlayerId(),
        name,
        score,
        lifetimeClicks: Math.floor(state.lifetimeClicks),
        prestigePoints: Math.floor(state.prestigePoints),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
    showToast("Score envoyé ! 🍌");
    fetchLeaderboard();
  } catch (err) {
    showToast("Erreur : " + err.message);
  }
}

document.getElementById("leaderboard-submit-btn")?.addEventListener("click", submitLeaderboardScore);
document.getElementById("leaderboard-refresh-btn")?.addEventListener("click", fetchLeaderboard);

document.querySelectorAll(".tab").forEach((tab) => {
  if (tab.dataset.tab === "leaderboard") {
    tab.addEventListener("click", fetchLeaderboard);
  }
});

