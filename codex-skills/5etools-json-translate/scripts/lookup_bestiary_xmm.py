#!/usr/bin/env python3
"""Search aligned English/Chinese XMM monster entries for translation examples."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys


SECTIONS = ("trait", "action", "bonus", "reaction", "legendary", "mythic", "spellcasting")


def find_repo_root(start: Path) -> Path:
    current = start.resolve()
    for candidate in (current, *current.parents):
        if (candidate / "data-bak/bestiary/bestiary-xmm.json").is_file() and (
            candidate / "data/bestiary/bestiary-xmm.json"
        ).is_file():
            return candidate
    raise SystemExit("Could not find aligned data-bak/data bestiary-xmm.json files.")


def load_monsters(path: Path) -> list[dict]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise SystemExit(f"Could not read {path}: {exc}") from exc
    monsters = payload.get("monster")
    if not isinstance(monsters, list):
        raise SystemExit(f"Expected a monster array in {path}")
    return monsters


def item_identity(item: object) -> str | None:
    if not isinstance(item, dict):
        return None
    value = item.get("ENG_name") or item.get("name")
    return value if isinstance(value, str) else None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query", help="Case-insensitive English substring")
    parser.add_argument("--section", choices=SECTIONS, help="Restrict to one monster entry section")
    parser.add_argument("--limit", type=int, default=10, help="Maximum results (1-100)")
    parser.add_argument("--repo", help="Repository root; defaults to searching upward from cwd")
    args = parser.parse_args()
    if not args.query.strip():
        raise SystemExit("Query must not be empty.")
    if not 1 <= args.limit <= 100:
        raise SystemExit("--limit must be between 1 and 100.")

    repo = Path(args.repo).expanduser().resolve() if args.repo else find_repo_root(Path.cwd())
    english = load_monsters(repo / "data-bak/bestiary/bestiary-xmm.json")
    chinese = load_monsters(repo / "data/bestiary/bestiary-xmm.json")
    chinese_by_identity = {
        (monster.get("ENG_name") or monster.get("name"), monster.get("source")): monster
        for monster in chinese
        if isinstance(monster, dict)
    }

    needle = args.query.casefold()
    sections = (args.section,) if args.section else SECTIONS
    results: list[dict] = []
    for monster in english:
        if not isinstance(monster, dict):
            continue
        translated = chinese_by_identity.get((monster.get("name"), monster.get("source")))
        if not translated:
            continue
        for section in sections:
            source_items = monster.get(section) or []
            target_items = translated.get(section) or []
            if not isinstance(source_items, list) or not isinstance(target_items, list):
                continue
            targets_by_name = {item_identity(item): item for item in target_items if item_identity(item)}
            for index, source_item in enumerate(source_items):
                source_text = json.dumps(source_item, ensure_ascii=False)
                if needle not in source_text.casefold():
                    continue
                target_item = targets_by_name.get(item_identity(source_item))
                if target_item is None and index < len(target_items):
                    target_item = target_items[index]
                results.append(
                    {
                        "monster_en": monster.get("name"),
                        "monster_cn": translated.get("name"),
                        "source": monster.get("source"),
                        "section": section,
                        "entry_en": source_item,
                        "entry_cn": target_item,
                    }
                )
                if len(results) >= args.limit:
                    break
            if len(results) >= args.limit:
                break
        if len(results) >= args.limit:
            break

    json.dump(
        {"query": args.query, "section": args.section, "count": len(results), "results": results},
        sys.stdout,
        ensure_ascii=False,
        indent=2,
    )
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
