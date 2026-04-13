function updateControls() {
  const n = selected.size;
  document.getElementById("deselectBtn").disabled = n === 0;
  document.getElementById("submitBtn").disabled = n !== 4;
}

function updateMistakeDots() {
  for (let i = 0; i < 4; i++)
    document.getElementById("dot" + i).classList.toggle("used", i < mistakes);
}

function setMessage(msg) {
  document.getElementById("message").textContent = msg || "\u00a0";
}

function showResult(won) {
  const remaining = MAX_MISTAKES - mistakes;
  const pct = statsPlayed > 0
    ? Math.round((statsSolved / statsPlayed) * 100) + "%"
    : "-";

  document.getElementById("resultEmoji").textContent = won ? "🎉" : "😔";
  document.getElementById("resultTitle").textContent = won
    ? "Solved it!"
    : "Better luck next time";
  document.getElementById("resultMsg").textContent = won
    ? `Completed with ${remaining} mistake${remaining === 1 ? "" : "s"} remaining!`
    : "You used all " + MAX_MISTAKES + " mistakes.\nUnsolved: " +
      puzzle.filter((_, i) => !solved.includes(i)).map(p => p.concept).join(", ");

  document.getElementById("rsSolved").textContent = statsSolved;
  document.getElementById("rsPlayed").textContent = statsPlayed;
  document.getElementById("rsAccuracy").textContent = pct;
  document.getElementById("resultOverlay").style.display = "flex";
}

function closeResult() {
  document.getElementById("resultOverlay").style.display = "none";
}

let _idCounter = 0;

function uniqueId() {
  return ++_idCounter;
}

function tileById(id) {
  return tiles.find(t => t.id === id);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sampleN(arr, n) {
  return shuffleArray(arr).slice(0, n);
}

function escapeHTML(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sharePuzzle() {
  const uuid = puzzleToUUID(selectedCategory, puzzle.map(p => p.concept));
  const url = new URL(location.href);
  url.searchParams.set("uuid", uuid);

  const btn = document.getElementById("sharePuzzleBtn");

  const onCopied = () => {
    const prev = btn.textContent;
    btn.textContent = "link copied!";
    setTimeout(() => { btn.textContent = prev; }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url.toString()).then(onCopied).catch(() => {
      _fallbackCopy(url.toString(), onCopied);
    });
  } else {
    _fallbackCopy(url.toString(), onCopied);
  }
}

function _fallbackCopy(text, onSuccess) {
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand("copy");
    onSuccess();
  } catch {
    prompt("Copy this link to share the puzzle:", text);
  }
  document.body.removeChild(el);
}

loadDarkMode();
