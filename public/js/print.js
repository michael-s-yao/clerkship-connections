function buildPrintContainer() {
  let container = document.getElementById("print-container");
  if (container)
    container.remove();

  container = document.createElement("div");
  container.id = "print-container";

  buildUnsolvedBoardForPrint(container);
  buildSolvedBoardForPrint(container);
}

function buildUnsolvedBoardForPrint(container) {
  const unsolved = document.createElement("div");
  unsolved.className = "print-page";

  const title = document.createElement("div");
  title.className = "print-title";
  title.textContent = "clerkship connections";
  unsolved.appendChild(title);

  if (selectedCategory) {
    const sub = document.createElement("div");
    sub.className = "print-subtitle";
    sub.textContent = selectedCategory;
    unsolved.appendChild(sub);
  }

  const grid = document.createElement("div");
  grid.className = "print-grid";
  tiles.forEach(tile => {
    const cell = document.createElement("div");
    cell.className = "print-tile";
    cell.textContent = tile.text;
    grid.appendChild(cell);
  });
  unsolved.appendChild(grid);
  container.appendChild(unsolved);
}

function buildSolvedBoardForPrint(container) {
  const solved = document.createElement("div");
  solved.className = "print-page print-page-break";

  const title = document.createElement("div");
  title.className = "print-title";
  title.textContent = "Answer Key";
  solved.appendChild(title);

  if (selectedCategory) {
    const sub = document.createElement("div");
    sub.className = "print-subtitle";
    sub.textContent = selectedCategory;
    solved.appendChild(sub);
  }

  const answerGrid = document.createElement("div");
  answerGrid.className = "print-answer-grid";

  const sortedPuzzle = [...puzzle].sort((a, b) => a.colorIdx - b.colorIdx);
  sortedPuzzle.forEach(p => {
    const row = document.createElement("div");
    row.className = "print-answer-row";
    row.style.background = PALETTE_HEX[p.colorIdx];
    row.style.color = PALETTE_TEXT[p.colorIdx];

    const concept = document.createElement("div");
    concept.className = "print-concept";
    concept.textContent = p.concept;

    const elements = document.createElement("div");
    elements.className = "print-elements";
    elements.textContent = p.elements.join(" \u00b7 ");

    row.appendChild(concept);
    row.appendChild(elements);
    answerGrid.appendChild(row);
  });

  solved.appendChild(answerGrid);
  container.appendChild(solved);

  document.body.appendChild(container);
}

function cleanPrintContainer() {
  const container = document.getElementById("print-container");
  if (container)
    container.remove();
}

window.addEventListener("beforeprint", function () {
  if (puzzle && puzzle.length > 0) {
    buildPrintContainer();
  }
});

window.addEventListener("afterprint", function () {
  cleanPrintContainer();
});
