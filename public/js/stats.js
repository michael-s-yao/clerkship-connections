let statsPlayed = 0;
let statsSolved = 0;

function loadStats() {
  try {
    const raw = getCookie("cc_stats");
    if (raw) {
      const obj = JSON.parse(raw);
      statsPlayed = Number(obj.played) || 0;
      statsSolved = Number(obj.won) || 0;
    }
  } catch (_) {}
  renderStats();
}

function saveStats() {
  setCookie(
    "cc_stats", JSON.stringify({ played: statsPlayed, won: statsSolved }), 365
  );
}

function recordResult(won) {
  statsPlayed++;
  if (won)
    statsSolved++;
  saveStats();
  renderStats();
}

function renderStats() {
  const pct = statsPlayed > 0
    ? Math.round((statsSolved / statsPlayed) * 100) + "%"
    : "—";
  document.getElementById("statSolved").textContent = statsSolved;
  document.getElementById("statAccuracy").textContent = pct;
}
