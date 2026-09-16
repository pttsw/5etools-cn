#!/usr/bin/env python3
"""CLI wrapper around 5e-translator's read-only reference tools."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--translator-root",
        default=os.environ.get("FIVE_E_TRANSLATOR_ROOT", "/data/5e-translator"),
        help="Path to the 5e-translator checkout",
    )
    subparsers = parser.add_subparsers(dest="mode", required=True)

    translations = subparsers.add_parser("translations", help="Look up English-to-Chinese translation candidates")
    translations.add_argument("queries", nargs="+")
    translations.add_argument("--category")
    translations.add_argument("--entity-id")
    translations.add_argument("--limit", type=int, default=5)
    translations.add_argument("--reference", action="append", default=[], help="UTF-8 text/Markdown reference path")

    entities = subparsers.add_parser("entities", help="Look up complete entity references")
    entities.add_argument("queries", nargs="+")
    entities.add_argument("--entity-type")
    entities.add_argument("--limit", type=int, default=3)
    entities.add_argument("--reference", action="append", default=[], help="UTF-8 text/Markdown reference path")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    root = Path(args.translator_root).expanduser().resolve()
    if not (root / "app/core/agent/tools.py").is_file():
        raise SystemExit(f"5e-translator tools not found under: {root}")

    os.chdir(root)
    sys.path.insert(0, str(root))
    from app.core.agent.reference_tools import ReferenceTools
    from app.core.agent.tools import ToolRegistry

    references = ReferenceTools()
    reference_reports = []
    for raw_path in args.reference:
        path = Path(raw_path).expanduser().resolve()
        if not path.exists():
            raise SystemExit(f"Reference does not exist: {path}")
        reference_reports.append(references.store.load_path(str(path), [path.parent]))

    registry = ToolRegistry(references)
    if args.mode == "translations":
        result = references.lookup_translations(
            args.queries,
            category=args.category,
            entity_id=args.entity_id,
            limit_per_term=args.limit,
        )
    else:
        result = references.lookup_entities(
            args.queries,
            entity_type=args.entity_type,
            limit_per_name=args.limit,
        )

    payload = {
        "tool": "lookup_translations" if args.mode == "translations" else "lookup_entities",
        "reference_reports": reference_reports,
        "result": result,
        "available_tools": [schema["function"]["name"] for schema in registry.get_tools_schemas()],
    }
    json.dump(payload, sys.stdout, ensure_ascii=False, indent=2, default=str)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
