let _uuidIdx = null;

function initUUIDIndex(idx) {
  _uuidIdx = idx;
}

function puzzleToUUID(category, concepts) {
  if (!_uuidIdx)
    return null;

  const catOrd = _uuidIdx.categories.indexOf(category);
  if (catOrd < 0)
    return null;

  const cOrds = concepts.map(c => _uuidIdx.concepts.indexOf(c));
  if (cOrds.some(i => i < 0))
    return null;

  cOrds.sort((a, b) => a - b);

  const h = [
    catOrd.toString(16).padStart(2, "0"),
    cOrds[0].toString(16).padStart(6, "0"),
    cOrds[1].toString(16).padStart(6, "0"),
    cOrds[2].toString(16).padStart(6, "0"),
    cOrds[3].toString(16).padStart(6, "0"),
    "000000",
  ].join("");

  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function lookupByUUID(uuid, rows) {
  if (!_uuidIdx)
    return null;

  const hex = uuid.replace(/-/g, "");
  if (hex.length !== 32)
    return null;

  if (hex.slice(26) !== "000000")
    return null;

  const catOrd = parseInt(hex.slice(0, 2), 16);
  const cOrds = [
    parseInt(hex.slice(2, 8), 16),
    parseInt(hex.slice(8, 14), 16),
    parseInt(hex.slice(14, 20), 16),
    parseInt(hex.slice(20, 26), 16),
  ];

  const category = _uuidIdx.categories[catOrd];
  if (!category) return null;

  const conceptNames = cOrds.map(i => _uuidIdx.concepts[i]);
  if (conceptNames.some(c => !c))
    return null;

  const conceptSet = new Set(conceptNames);
  if (conceptSet.size !== 4)
    return null;

  const matchedRows = rows.filter(
    r => r.categories.includes(category) && conceptSet.has(r.concept)
  );
  if (matchedRows.length !== 4)
    return null;

  return { category, rows: matchedRows };
}
