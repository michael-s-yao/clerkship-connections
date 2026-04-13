#!/usr/bin/env python3
"""
Generates/updates the stable registry of category and concept names.

Author(s):
    Michael Yao @michael-s-yao

Licensed under the MIT License. Copyright Michael Yao 2026.
"""
import csv
import json
from pathlib import Path
from typing import Final, List, Set


def main():
    REPO_ROOT: Final[Path] = Path(__file__).parent.parent
    CSV_PATH: Final[Path] = REPO_ROOT / "public" / "data.csv"
    OUT_PATH: Final[Path] = REPO_ROOT / "public" / "uuid_index.json"

    if not CSV_PATH.exists():
        print(f"Error: {CSV_PATH} not found.")
        return 1

    if OUT_PATH.exists():
        existing = json.loads(OUT_PATH.read_text(encoding="utf-8"))
        categories: List[str] = existing.get("categories", [])
        concepts: List[str] = existing.get("concepts", [])
    else:
        categories = []
        concepts = []

    csv_categories: Set[str] = set()
    csv_concepts: Set[str] = set()

    with open(str(CSV_PATH), newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        headers = [h.strip().lower() for h in next(reader)]
        cat_col = 0
        concept_col = headers.index("concept") if "concept" in headers else 1

        for row in reader:
            if len(row) <= max(cat_col, concept_col):
                continue
            for cat in row[cat_col].split("|"):
                cat = cat.strip()
                if cat:
                    csv_categories.add(cat)
            concept = row[concept_col].strip()
            if concept:
                csv_concepts.add(concept)

    cat_set = set(categories)
    for cat in sorted(csv_categories - cat_set):
        categories.append(cat)

    concept_set = set(concepts)
    for concept in sorted(csv_concepts - concept_set):
        concepts.append(concept)

    OUT_PATH.write_text(
        json.dumps({"categories": categories, "concepts": concepts}, indent=2),
        encoding="utf-8",
    )

    return 0


if __name__ == "__main__":
    main()
