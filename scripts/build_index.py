#!/usr/bin/env python3
"""
Maps each category name to a list of inclusive row ranges
[{start, end}, ...] covering the rows that belong to that category.

Author(s):
    Michael Yao @michael-s-yao

Licensed under the MIT License. Copyright Michael Yao 2026.
"""
import csv
import json
from pathlib import Path
from typing import Any, Dict, Final, List, Tuple, Union


def main():
    REPO_ROOT: Final[Path] = Path(__file__).parent.parent

    CSV_PATH: Final[Path] = REPO_ROOT / "public" / "data.csv"

    IDX_PATH: Final[Path] = REPO_ROOT / "public" / "data_index.json"

    if not CSV_PATH.exists():
        exit()
    build_index(*read_header(CSV_PATH), CSV_PATH, IDX_PATH)


def build_index(
    header_line: str,
    fieldnames: list[str],
    csv_path: Union[Path, str],
    savepath: Union[Path, str]
) -> None:
    """
    Builds the index file.
    Input:
        header_line: the string header line.
        fieldnames: a list of the field names.
        csv_path: the path to the CSV file.
        savepath: the JSON file path to save the index to.
    Returns:
        None.
    """
    categories: Dict[str, List[Dict[str, Any]]] = {}

    cat_key = fieldnames[0].strip().strip('"').lower()

    with open(str(csv_path), "rb") as f:
        # Skip the header line.
        f.readline()

        while True:
            pos = f.tell()
            line = f.readline()
            if not line:
                break
            if not line.strip():
                continue

            cat_field = parse_first_field(line)
            if not cat_field:
                continue

            end = f.tell() - 1

            for cat in cat_field.split("|"):
                cat = cat.strip()
                if not cat:
                    continue
                if cat not in categories:
                    categories[cat] = []
                categories[cat].append({"start": pos, "end": end})

    index = {
        "catKey": cat_key,
        "header": header_line,
        "categories": categories,
    }
    Path(savepath).write_text(json.dumps(index, indent=2), encoding="utf-8")


def read_header(csv_path: Union[Path, str]) -> Tuple[str, List[str]]:
    """
    Returns (header_line, fieldnames) from an input CSV.
    Input:
        csv_path: the path to the CSV file.
    Returns:
        The header line and fieldnames from the input CSV file.
    """
    with open(str(csv_path), newline="", encoding="utf-8-sig") as f:
        fieldnames = next(csv.reader(f))
    return ",".join(fieldnames), fieldnames


def parse_first_field(line_bytes: bytes) -> str:
    """
    Returns the first CSV field from a raw bytes line.
    Input:
        line_bytes: the input line of raw bytes.
    Returns:
        The first CSV field in the line.
    """
    line = line_bytes.decode("utf-8", errors="replace").lstrip("\ufeff")
    if line.startswith('"'):
        i = 1
        while i < len(line):
            if line[i] == '"':
                if i + 1 < len(line) and line[i + 1] == '"':
                    i += 2
                else:
                    break
            i += 1
        return line[1:i].replace('""', '"').strip()
    return line.split(",")[0].strip()


if __name__ == "__main__":
    main()
