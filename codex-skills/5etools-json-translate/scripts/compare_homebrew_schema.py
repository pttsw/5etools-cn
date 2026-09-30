#!/usr/bin/env python3
"""Compare per-file homebrew schema errors between an English source and Chinese target."""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

VALIDATOR = Path("/data/5etools-mirror-2.github.io/codex-skills/homebrew-conversion-audit/scripts/validate-homebrew-json-cli.js")


def extract_errors(output: str):
    decoder = json.JSONDecoder()
    errors = []
    for index, char in enumerate(output):
        if char != "[":
            continue
        try:
            value, _ = decoder.raw_decode(output[index:])
        except json.JSONDecodeError:
            continue
        if isinstance(value, list) and value and all(isinstance(item, dict) and "instancePath" in item for item in value):
            errors.extend(value)
    return errors


def signature(error):
    return tuple(error.get(key) for key in ("instancePath", "schemaPath", "keyword", "message"))


def validate(path: Path, homebrew_dir: Path):
    completed = subprocess.run(
        ["node", str(VALIDATOR), "--file", str(path), "--homebrew-dir", str(homebrew_dir)],
        text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False,
    )
    return {"exit_code": completed.returncode, "errors": extract_errors(completed.stdout), "output": completed.stdout}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    parser.add_argument("--homebrew-dir", type=Path, default=Path("/data/homebrew"))
    args = parser.parse_args()

    source = validate(args.source.resolve(), args.homebrew_dir.resolve())
    target = validate(args.target.resolve(), args.homebrew_dir.resolve())
    source_signatures = {signature(error) for error in source["errors"]}
    new_errors = [error for error in target["errors"] if signature(error) not in source_signatures]
    source_tool_failed = source["exit_code"] != 0 and not source["errors"]
    target_tool_failed = target["exit_code"] != 0 and not target["errors"]
    passed = not source_tool_failed and not target_tool_failed and (
        target["exit_code"] == 0 or (bool(source["errors"]) and bool(target["errors"]) and not new_errors)
    )
    report = {
        "passed": passed,
        "source_exit_code": source["exit_code"],
        "target_exit_code": target["exit_code"],
        "source_tool_failed": source_tool_failed,
        "target_tool_failed": target_tool_failed,
        "source_errors": source["errors"],
        "target_errors": target["errors"],
        "new_target_errors": new_errors,
    }
    if source_tool_failed:
        report["source_validator_output"] = source["output"]
    if target_tool_failed:
        report["target_validator_output"] = target["output"]
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
