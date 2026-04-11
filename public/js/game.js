const DEFAULT_CSV = "public/data.csv";
const DEFAULT_IDX = "public/data_index.json";
const MAX_MISTAKES = 4;
const PALETTE_HEX = ["#f9df6d", "#a0c35a", "#6aaFe6", "#ba81c5"];
const PALETTE_TEXT = ["#3a2d00", "#ffffff", "#ffffff", "#ffffff"];
const MOBILE_MQ = window.matchMedia("(max-width: 640px)");

let dataIndex = null;
let catKey = "category";
let categoryCache = {};
let csvText = null;
let allRows = [];
let categories = [];
let selectedCategory = "";
let puzzle = [];
let tiles = [];
let selected = new Set();
let solved = [];
let mistakes = 0;
let gameOver = false;

function parseCSVLine(line) {
  const cols = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === "," && !inQ) {
      cols.push(cur.trim()); cur = "";
    } else {
      cur += ch;
    }
  }
  cols.push(cur.trim());
  return cols;
}

function parseCSV(text) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n").filter(l => l.trim());
  if (lines.length < 2)
    throw new Error("CSV has no data rows.");
  const headers = parseCSVLine(lines[0]).map(
    h => h.toLowerCase().replace(/^"|"$/g, "")
  );
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length < 5)
      continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    rows.push(row);
  }
  return rows;
}

function normalizeRows(csvRows) {
  return csvRows
    .map(r => ({
      categories: (r[catKey] || "")
        .split("|")
        .map(c => c.trim())
        .filter(Boolean),
      concept: (r["concept"] || "").trim(),
      elements: [
        r["element_1"] || "",
        r["element_2"] || "",
        r["element_3"] || "",
        r["element_4"] || ""
      ].map(s => s.trim()),
    }))
    .filter(r => r.categories.length && r.concept && r.elements.every(e => e));
}

async function loadIndex() {
  const resp = await fetch(DEFAULT_IDX);
  if (!resp.ok)
    throw new Error(`Could not load index: HTTP ${resp.status}`);
  dataIndex = await resp.json();
  catKey = dataIndex.catKey || "category";
  categories = Object.keys(dataIndex.categories).sort();
}

async function loadCategoryRows(cat) {
  if (categoryCache[cat]) {
    allRows = categoryCache[cat];
    return;
  }

  if (!csvText) {
    const resp = await fetch(DEFAULT_CSV);
    if (!resp.ok)
      throw new Error(`CSV fetch failed: HTTP ${resp.status}`);
    csvText = await resp.text();
  }

  const allParsed = normalizeRows(parseCSV(csvText));
  allParsed.forEach(row => {
    row.categories.forEach(c => {
      if (!categoryCache[c]) categoryCache[c] = [];
      categoryCache[c].push(row);
    });
  });

  allRows = categoryCache[cat] || [];
}

(async function autoLoad() {
  try {
    await loadIndex();
    initGame();
  } catch (e) {
    console.error(e);
  }
})();

function initGame() {
  loadStats();
  loadDarkMode();
  document.getElementById("app").style.display = "flex";
  buildCategoryList();

  const saved = (getCookie("cc_category") || "").replaceAll("_", " ");
  selectedCategory = (saved && categories.includes(saved))
    ? saved : categories[0];
  activateCategoryButton(selectedCategory);

  loadCategoryRows(selectedCategory).then(() => generatePuzzle());
}

function buildCategoryList() {
  const list = document.getElementById("categoryList");
  list.innerHTML = "";

  if (MOBILE_MQ.matches) {
    const sel = document.createElement("select");
    sel.className = "category-select";
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = opt.textContent = cat;
      sel.appendChild(opt);
    });
    sel.onchange = e => selectCategory(e.target.value);
    list.appendChild(sel);
  } else {
    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "category-btn";
      btn.textContent = btn.dataset.cat = cat;
      btn.onclick = () => selectCategory(cat);
      list.appendChild(btn);
    });
  }
}

function activateCategoryButton(cat) {
  document.querySelectorAll(".category-btn").forEach(
    b => b.classList.toggle("active", b.dataset.cat === cat)
  );
  const sel = document.querySelector(".category-select");
  if (sel) sel.value = cat;
}

function selectCategory(cat) {
  selectedCategory = cat;
  setCookie("cc_category", cat.replaceAll(" ", "_"), 365);
  activateCategoryButton(cat);
  loadCategoryRows(cat).then(() => generatePuzzle());
}

function shuffle() {
  generatePuzzle();
}

function generatePuzzle() {
  selected.clear();
  solved = [];
  mistakes = 0;
  gameOver = false;
  document.getElementById("solvedRows").innerHTML = "";
  document.getElementById("resultOverlay").style.display = "none";
  updateMistakeDots();

  const pool = allRows.filter(r => r.categories.includes(selectedCategory));
  if (pool.length < 4) {
    document.getElementById("grid").innerHTML = "";
    return;
  }

  let picks;
  const MAX_SAMPLE_ATTEMPTS = 50;
  for (let attempt = 0; attempt < MAX_SAMPLE_ATTEMPTS; attempt++) {
    picks = sampleN(pool, 4);
    const seen = new Set();
    let clash = false;
    for (const row of picks) {
      for (const el of row.elements) {
        if (seen.has(el)) {
          clash = true;
          break;
        }
        seen.add(el);
      }
      if (clash)
        break;
    }
    if (!clash)
      break;
  }

  const colorOrder = shuffleArray([0, 1, 2, 3]);
  puzzle = picks.map((row, i) => ({
    concept: row.concept,
    elements: row.elements,
    colorIdx: colorOrder[i],
  }));

  const allTiles = [];
  puzzle.forEach((p, conceptIdx) => {
    p.elements.forEach(text =>
      allTiles.push({ text, conceptIdx, id: uniqueId() })
    );
  });
  tiles = shuffleArray(allTiles);

  renderGrid();
  updateControls();
}

function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  tiles.forEach(tile => {
    if (solved.includes(tile.conceptIdx))
      return;
    const el = document.createElement("div");
    el.className = "tile";
    el.id = "tile-" + tile.id;
    el.textContent = tile.text;
    el.onclick = () => toggleTile(tile.id);
    grid.appendChild(el);
  });
}

function addSolvedRow(conceptIdx) {
  const p = puzzle[conceptIdx];
  const row = document.createElement("div");
  row.className = "solved-row";
  row.style.background = PALETTE_HEX[p.colorIdx];
  row.style.color = PALETTE_TEXT[p.colorIdx];
  row.style.height = `${document.getElementsByClassName("tile")[0].offsetHeight}px`;
  row.innerHTML = `
    <div>
      <div class="concept-name">${escapeHTML(p.concept)}</div>
      <div class="elements-list">${p.elements.map(escapeHTML).join(" · ")}</div>
    </div>
  `;
  document.getElementById("solvedRows").appendChild(row);
}

function toggleTile(id) {
  if (gameOver || solved.includes(tileById(id).conceptIdx))
    return;
  if (selected.has(id)) {
    selected.delete(id);
    document.getElementById("tile-" + id).classList.remove("selected");
  } else {
    if (selected.size >= 4)
      return;
    selected.add(id);
    document.getElementById("tile-" + id).classList.add("selected");
  }
  updateControls();
}

function deselectAll() {
  selected.forEach(id => {
    const el = document.getElementById("tile-" + id);
    if (el)
      el.classList.remove("selected");
  });
  selected.clear();
  updateControls();
}

function submitGuess() {
  setMessage("");
  if (selected.size !== 4 || gameOver)
    return;

  const ids = [...selected];
  const conceptIdxs = ids.map(id => tileById(id).conceptIdx);

  if (conceptIdxs.every(c => c === conceptIdxs[0])) {
    const conceptIdx = conceptIdxs[0];

    ids.forEach(id => {
      const el = document.getElementById("tile-" + id);
      if (el) {
        el.classList.add("solved");
        el.style.background = PALETTE_HEX[puzzle[conceptIdx].colorIdx];
      }
    });
    solved.push(conceptIdx);
    selected.clear();

    setTimeout(() => {
      addSolvedRow(conceptIdx);
      renderGrid();
      updateControls();
      if (solved.length === 4) {
        gameOver = true;
        recordResult(true);
        setTimeout(() => showResult(true), 300);
      }
    }, 400);

  } else {
    const counts = {};
    conceptIdxs.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
    const maxMatch = Math.max(...Object.values(counts));

    mistakes++;
    updateMistakeDots();

    ids.forEach(id => {
      const el = document.getElementById("tile-" + id);
      if (!el)
        return;
      el.classList.remove("shake");
      void el.offsetWidth;
      el.classList.add("shake");
      el.addEventListener(
        "animationend", () => el.classList.remove("shake"), { once: true }
      );
    });

    setMessage(maxMatch === 3 ? "one away..." : "");

    if (mistakes >= MAX_MISTAKES) {
      gameOver = true;
      recordResult(false);
      setTimeout(() => showResult(false), 600);
    }
  }
}
