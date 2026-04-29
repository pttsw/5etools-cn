#!/usr/bin/env python3

import json
from pathlib import Path


HOMEBREW_DIR = Path(__file__).resolve().parent
INDEX_PATH = HOMEBREW_DIR / "index.json"


def main():
	with INDEX_PATH.open("r", encoding="utf-8") as f:
		index = json.load(f)

	to_import = sorted(
		path.name
		for path in HOMEBREW_DIR.glob("*.json")
		if path.name != INDEX_PATH.name
	)

	index["toImport"] = to_import

	with INDEX_PATH.open("w", encoding="utf-8") as f:
		json.dump(index, f, ensure_ascii=False, indent="\t")
		f.write("\n")

	print(f"Updated {INDEX_PATH} with {len(to_import)} file(s).")


if __name__ == "__main__":
	main()
