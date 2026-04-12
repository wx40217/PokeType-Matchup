const TYPES = [
  ["normal", "一般", "#a8a79f", "assets/types/normal.png"],
  ["fighting", "格斗", "#d56723", "assets/types/fighting.png"],
  ["flying", "飞行", "#6f93ff", "assets/types/flying.png"],
  ["poison", "毒", "#9f47d2", "assets/types/poison.png"],
  ["ground", "地面", "#c8a14d", "assets/types/ground.png"],
  ["rock", "岩石", "#b49b3d", "assets/types/rock.png"],
  ["bug", "虫", "#8fa51a", "assets/types/bug.png"],
  ["ghost", "幽灵", "#6453a3", "assets/types/ghost.png"],
  ["steel", "钢", "#8a8aa4", "assets/types/steel.png"],
  ["fire", "火", "#ee8130", "assets/types/fire.png"],
  ["water", "水", "#6390f0", "assets/types/water.png"],
  ["grass", "草", "#7ac74c", "assets/types/grass.png"],
  ["electric", "电", "#f7d02c", "assets/types/electric.png"],
  ["psychic", "超能力", "#f95587", "assets/types/psychic.png"],
  ["ice", "冰", "#96d9d6", "assets/types/ice.png"],
  ["dragon", "龙", "#6f35fc", "assets/types/dragon.png"],
  ["dark", "恶", "#705746", "assets/types/dark.png"],
  ["fairy", "妖精", "#d685ad", "assets/types/fairy.png"],
].map(([key, label, color, icon]) => ({ key, label, color, icon }));

const CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fighting: {
    normal: 2,
    flying: 0.5,
    poison: 0.5,
    rock: 2,
    bug: 0.5,
    ghost: 0,
    steel: 2,
    psychic: 0.5,
    ice: 2,
    dark: 2,
    fairy: 0.5,
  },
  flying: { fighting: 2, rock: 0.5, bug: 2, steel: 0.5, grass: 2, electric: 0.5 },
  poison: { poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, grass: 2, fairy: 2 },
  ground: { flying: 0, poison: 2, rock: 2, bug: 0.5, steel: 2, fire: 2, grass: 0.5, electric: 2 },
  rock: { fighting: 0.5, flying: 2, ground: 0.5, bug: 2, steel: 0.5, fire: 2, ice: 2 },
  bug: {
    fighting: 0.5,
    flying: 0.5,
    poison: 0.5,
    ghost: 0.5,
    steel: 0.5,
    fire: 0.5,
    grass: 2,
    psychic: 2,
    dark: 2,
    fairy: 0.5,
  },
  ghost: { normal: 0, ghost: 2, psychic: 2, dark: 0.5 },
  steel: { rock: 2, steel: 0.5, fire: 0.5, water: 0.5, electric: 0.5, ice: 2, fairy: 2 },
  fire: { rock: 0.5, bug: 2, steel: 2, fire: 0.5, water: 0.5, grass: 2, ice: 2, dragon: 0.5 },
  water: { ground: 2, rock: 2, fire: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  grass: {
    flying: 0.5,
    poison: 0.5,
    ground: 2,
    rock: 2,
    bug: 0.5,
    steel: 0.5,
    fire: 0.5,
    water: 2,
    grass: 0.5,
    dragon: 0.5,
  },
  electric: { flying: 2, ground: 0, water: 2, grass: 0.5, electric: 0.5, dragon: 0.5 },
  psychic: { fighting: 2, poison: 2, steel: 0.5, psychic: 0.5, dark: 0 },
  ice: { flying: 2, ground: 2, steel: 0.5, fire: 0.5, water: 0.5, grass: 2, ice: 0.5, dragon: 2 },
  dragon: { steel: 0.5, dragon: 2, fairy: 0 },
  dark: { fighting: 0.5, ghost: 2, psychic: 2, dark: 0.5, fairy: 0.5 },
  fairy: { fighting: 2, poison: 0.5, steel: 0.5, fire: 0.5, dragon: 2, dark: 2, bug: 0.5 },
};

const RESULT_ORDER = [4, 2, 1, 0.5, 0.25, 0];
const ATTACK_FOCUS_ORDER = [4, 2, 0];
const THEME_KEY = "poke-type-theme";
const THEME_MODES = new Set(["system", "light", "dark"]);
const themeQuery = typeof window.matchMedia === "function"
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

const state = {
  mode: "defense",
  selected: [],
  themeMode: getThemeMode(),
  theme: "light",
  neutralHidden: true,
  focusOnly: true,
};

state.theme = resolveTheme(state.themeMode);

const els = {
  grid: document.getElementById("type-grid"),
  selectionTitle: document.getElementById("selection-title"),
  selectionHelper: document.getElementById("selection-helper"),
  selectionLimit: document.getElementById("selection-limit"),
  resultsTitle: document.getElementById("results-title"),
  resultsHelper: document.getElementById("results-helper"),
  resultsPanel: document.getElementById("results-panel"),
  statusMessage: document.getElementById("status-message"),
  reset: document.getElementById("reset-button"),
  neutralToggle: document.getElementById("neutral-toggle"),
  focusToggle: document.getElementById("focus-toggle"),
  modeButtons: [...document.querySelectorAll(".mode-button")],
  themeButtons: [...document.querySelectorAll(".theme-button")],
};

let typeButtons = [];

function readStoredThemeMode() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return THEME_MODES.has(value) ? value : null;
  } catch {
    return null;
  }
}

function getThemeMode() {
  return readStoredThemeMode() ?? "system";
}

function resolveTheme(themeMode) {
  if (themeMode === "light" || themeMode === "dark") {
    return themeMode;
  }

  return themeQuery?.matches ? "dark" : "light";
}

function applyTheme(themeMode, persist = true) {
  state.themeMode = THEME_MODES.has(themeMode) ? themeMode : "system";
  state.theme = resolveTheme(state.themeMode);

  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.themeMode = state.themeMode;

  els.themeButtons.forEach((button) => {
    const active = button.dataset.themeMode === state.themeMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  if (!persist) {
    return;
  }

  try {
    localStorage.setItem(THEME_KEY, state.themeMode);
  } catch {
    // Ignore storage errors and keep the theme in memory for this session.
  }
}

const findType = (key) => TYPES.find((type) => type.key === key);

function getContrastText(hex) {
  const luminance = (value) => {
    const intValue = parseInt(value.slice(1), 16);
    const rgb = [intValue >> 16 & 255, intValue >> 8 & 255, intValue & 255].map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const contrast = (first, second) => {
    const a = luminance(first);
    const b = luminance(second);
    const light = Math.max(a, b);
    const dark = Math.min(a, b);
    return (light + 0.05) / (dark + 0.05);
  };

  const darkText = "#231f18";
  const lightText = "#fffaf2";
  return contrast(hex, darkText) >= contrast(hex, lightText) ? darkText : lightText;
}

const effectFor = (attacker, defender) => CHART[attacker][defender] ?? 1;
const combinedEffect = (attacker, defenders) => defenders.reduce((value, defender) => value * effectFor(attacker, defender), 1);

function formatMultiplier(value) {
  if (value === 0.25) {
    return "1/4";
  }

  if (value === 0.5) {
    return "1/2";
  }

  return `${value}x`;
}

function multiplierMarkup(value) {
  if (value === 0.25 || value === 0.5) {
    return `<span class="fraction" aria-label="${formatMultiplier(value)} 倍"><span class="fraction__top">1</span><span class="fraction__bar"></span><span class="fraction__bottom">${value === 0.25 ? 4 : 2}</span></span>`;
  }

  return `<span class="multiplier-text">${formatMultiplier(value)}</span>`;
}

function multiplierLabel(value) {
  if (state.mode === "defense") {
    if (value === 4) return "最危险";
    if (value === 2) return "需要留意";
    if (value === 1) return "正常伤害";
    if (value === 0.5) return "有抗性";
    if (value === 0.25) return "强抗";
    return "完全免疫";
  }

  if (value === 4) return "最值得看";
  if (value === 2) return "稳定克制";
  if (value === 1) return "常规伤害";
  if (value === 0.5) return "效果一般";
  if (value === 0.25) return "不太推荐";
  return "完全无效";
}

function singleChip(key) {
  const type = findType(key);
  return `<span class="result-chip" style="background:${type.color};color:${getContrastText(type.color)};">${type.label}</span>`;
}

function dualChip(keys) {
  if (keys.length < 2) {
    return singleChip(keys[0]);
  }

  return `<span class="combo-chip">${keys
    .map((key) => {
      const type = findType(key);
      return `<span class="combo-chip__part" style="background:${type.color};color:${getContrastText(type.color)};">${type.label}</span>`;
    })
    .join("")}</span>`;
}

function selectionHint() {
  if (state.mode === "defense") {
    return "最多选 2 个属性";
  }

  return state.focusOnly
    ? "先看最值得注意的 4x、2x 和 0x 倍率，需要时再展开全部。"
    : "选 1 个攻击属性，查看它对单属性和双属性目标的完整倍率。";
}

function createTypeButton(type) {
  const button = document.createElement("button");
  const name = document.createElement("span");
  const iconWrap = document.createElement("span");
  const icon = document.createElement("img");

  button.className = "type-button";
  button.type = "button";
  button.dataset.type = type.key;
  button.style.setProperty("--type-button-color", type.color);
  button.style.setProperty("--type-button-text", getContrastText(type.color));

  name.className = "type-button__name";
  name.textContent = type.label;

  iconWrap.className = "type-button__icon";
  iconWrap.setAttribute("aria-hidden", "true");

  icon.src = type.icon;
  icon.alt = "";
  icon.decoding = "async";

  iconWrap.append(icon);
  button.append(name, iconWrap);
  return button;
}

function renderTypeGrid() {
  const fragment = document.createDocumentFragment();
  typeButtons = TYPES.map((type) => {
    const button = createTypeButton(type);
    fragment.append(button);
    return button;
  });

  els.grid.replaceChildren(fragment);
  syncTypeButtons();
}

function syncTypeButtons() {
  typeButtons.forEach((button) => {
    const selected = state.selected.includes(button.dataset.type);
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function visibleMultipliers() {
  if (state.mode === "attack" && state.focusOnly) {
    return ATTACK_FOCUS_ORDER;
  }

  return RESULT_ORDER.filter((value) => !state.neutralHidden || value !== 1);
}

function renderMeta() {
  const maxSelection = state.mode === "defense" ? 2 : 1;

  els.selectionTitle.textContent = state.mode === "defense" ? "选择防守属性" : "选择攻击属性";
  els.selectionHelper.textContent = selectionHint();
  els.selectionLimit.textContent = `已选 ${state.selected.length} / ${maxSelection}`;
  els.resultsHelper.textContent = "";

  els.modeButtons.forEach((button) => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const showFocusToggle = state.mode === "attack";
  els.focusToggle.hidden = !showFocusToggle;
  els.focusToggle.classList.toggle("is-active", state.focusOnly);
  els.focusToggle.setAttribute("aria-pressed", state.focusOnly ? "true" : "false");
  els.focusToggle.textContent = `重点倍率：${state.focusOnly ? "精简" : "全部"}`;

  const showNeutralToggle = state.mode === "defense" || !state.focusOnly;
  els.neutralToggle.hidden = !showNeutralToggle;
  els.neutralToggle.classList.toggle("is-active", state.neutralHidden);
  els.neutralToggle.setAttribute("aria-pressed", state.neutralHidden ? "true" : "false");
  els.neutralToggle.textContent = `1x：${state.neutralHidden ? "隐藏" : "显示"}`;
}

function buildDefenseBuckets() {
  const buckets = new Map(RESULT_ORDER.map((value) => [value, []]));
  TYPES.forEach((type) => buckets.get(combinedEffect(type.key, state.selected)).push(type.key));
  return buckets;
}

function buildAttackBuckets() {
  const buckets = new Map(RESULT_ORDER.map((value) => [value, { single: [], dual: [] }]));
  const attacker = state.selected[0];

  TYPES.forEach((type) => buckets.get(combinedEffect(attacker, [type.key])).single.push(type.key));

  for (let i = 0; i < TYPES.length; i += 1) {
    for (let j = i + 1; j < TYPES.length; j += 1) {
      const pair = [TYPES[i].key, TYPES[j].key];
      buckets.get(combinedEffect(attacker, pair)).dual.push(pair);
    }
  }

  return buckets;
}

const resultRow = (label, caption, body) => `
  <section class="result-row">
    <div class="result-row__head">
      <span class="multiplier-badge">${label}</span>
      ${caption ? `<span class="multiplier-note">${caption}</span>` : ""}
    </div>
    <div class="result-row__body">${body}</div>
  </section>
`;

function renderEmpty() {
  els.resultsTitle.textContent = "等待选择";
  els.resultsHelper.textContent = "";
  els.resultsPanel.innerHTML = `
    <div class="empty-state" role="status">
      <p class="empty-state__title">先选属性，再看结果</p>
    </div>
  `;
}

function renderDefenseResults() {
  const chosen = state.selected.map((key) => findType(key).label).join(" / ");
  const buckets = buildDefenseBuckets();

  els.resultsTitle.textContent = `防守方：${chosen}`;
  els.resultsPanel.innerHTML = visibleMultipliers()
    .map((value) => {
      const items = buckets.get(value);
      return items.length
        ? resultRow(multiplierMarkup(value), multiplierLabel(value), `<div class="chips-wrap">${items.map(singleChip).join("")}</div>`)
        : "";
    })
    .join("");
}

function renderAttackResults() {
  const attacker = findType(state.selected[0]).label;
  const buckets = buildAttackBuckets();

  els.resultsTitle.textContent = `攻击方：${attacker}`;
  els.resultsPanel.innerHTML = visibleMultipliers()
    .map((value) => {
      const group = buckets.get(value);
      if (!group.single.length && !group.dual.length) {
        return "";
      }

      const blocks = [];
      if (group.single.length) {
        blocks.push(`<div class="subgroup"><p class="subgroup__title">单属性 · ${group.single.length}</p><div class="chips-wrap">${group.single.map(singleChip).join("")}</div></div>`);
      }

      if (group.dual.length) {
        blocks.push(`<div class="subgroup"><p class="subgroup__title">双属性 · ${group.dual.length}</p><div class="chips-wrap">${group.dual.map(dualChip).join("")}</div></div>`);
      }

      return resultRow(multiplierMarkup(value), multiplierLabel(value), blocks.join(""));
    })
    .join("");
}

function renderResults() {
  if (!state.selected.length) {
    renderEmpty();
    return;
  }

  if (state.mode === "defense") {
    renderDefenseResults();
    return;
  }

  renderAttackResults();
}

function announce() {
  const side = state.mode === "defense" ? "防守方" : "攻击方";

  if (!state.selected.length) {
    els.statusMessage.textContent = `${side}未选择，${selectionHint()}`;
    return;
  }

  const selection = state.selected.map((key) => findType(key).label).join(" / ");
  const density = state.mode === "attack" ? `，重点倍率${state.focusOnly ? "精简" : "全部"}` : "";
  const neutralState = state.mode === "attack" && state.focusOnly ? "" : `，1x${state.neutralHidden ? "隐藏" : "显示"}`;
  els.statusMessage.textContent = `${side}：${selection}${density}${neutralState}`;
}

function render() {
  renderMeta();
  syncTypeButtons();
  renderResults();
  announce();
}

function pickType(key) {
  if (state.mode === "defense") {
    if (state.selected.includes(key)) {
      state.selected = state.selected.filter((item) => item !== key);
    } else if (state.selected.length < 2) {
      state.selected = [...state.selected, key];
    } else {
      state.selected = [key];
    }
  } else {
    state.selected = state.selected[0] === key ? [] : [key];
  }

  render();
}

els.grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-type]");
  if (button) {
    pickType(button.dataset.type);
  }
});

els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state.mode !== button.dataset.mode) {
      state.mode = button.dataset.mode;
      state.selected = [];
      render();
    }
  });
});

els.themeButtons.forEach((button) => {
  button.addEventListener("click", () => applyTheme(button.dataset.themeMode));
});

els.focusToggle.addEventListener("click", () => {
  state.focusOnly = !state.focusOnly;
  render();
});

els.neutralToggle.addEventListener("click", () => {
  state.neutralHidden = !state.neutralHidden;
  render();
});

els.reset.addEventListener("click", () => {
  state.selected = [];
  render();
});

const handleSystemThemeChange = () => {
  if (state.themeMode === "system") {
    applyTheme("system", false);
  }
};

if (themeQuery) {
  if (typeof themeQuery.addEventListener === "function") {
    themeQuery.addEventListener("change", handleSystemThemeChange);
  } else if (typeof themeQuery.addListener === "function") {
    themeQuery.addListener(handleSystemThemeChange);
  }
}

renderTypeGrid();
applyTheme(state.themeMode, false);
render();

