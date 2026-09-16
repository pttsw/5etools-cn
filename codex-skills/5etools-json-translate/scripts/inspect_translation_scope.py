#!/usr/bin/env python3
"""Validate one data-bak translation scope and print a JSON manifest."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import subprocess
import sys


def fail(message: str) -> None:
    raise SystemExit(message)


def find_repo_root(start: Path) -> Path:
    current = start.resolve()
    for candidate in (current, *current.parents):
        if (candidate / "package.json").is_file() and (candidate / "data-bak").is_dir() and (candidate / "data").is_dir():
            return candidate
    fail("Could not find a repository root containing package.json, data-bak/, and data/.")


def contained(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def run_git(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=repo,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="One English JSON file under data-bak/")
    parser.add_argument("--reference", action="append", default=[], help="Optional reference file or directory")
    parser.add_argument("--repo", help="Repository root; defaults to searching upward from cwd")
    args = parser.parse_args()

    repo = Path(args.repo).expanduser().resolve() if args.repo else find_repo_root(Path.cwd())
    source_input = Path(args.source).expanduser()
    source = (repo / source_input).resolve() if not source_input.is_absolute() else source_input.resolve()
    source_root = (repo / "data-bak").resolve()
    if not contained(source, source_root):
        fail(f"Source must be inside {source_root}")
    if not source.is_file() or source.suffix.lower() != ".json":
        fail("Source must be an existing .json file.")

    try:
        json.loads(source.read_text(encoding="utf-8-sig"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        fail(f"Source is not valid UTF-8 JSON: {exc}")

    relative_inside_data = source.relative_to(source_root)
    source_relative = source.relative_to(repo)
    target = repo / "data" / relative_inside_data

    references = []
    for value in args.reference:
        item = Path(value).expanduser()
        item = (repo / item).resolve() if not item.is_absolute() else item.resolve()
        if not item.exists():
            fail(f"Reference does not exist: {item}")
        references.append(str(item))

    tracked_result = run_git(repo, "ls-files", "--error-unmatch", "--", source_relative.as_posix())
    tracked = tracked_result.returncode == 0
    if tracked:
        diff_result = run_git(repo, "diff", "--no-ext-diff", "--unified=5", "HEAD", "--", source_relative.as_posix())
        if diff_result.returncode != 0:
            fail(diff_result.stderr.strip() or "git diff failed")
        diff = diff_result.stdout
        change_kind = "modified" if diff else "unchanged"
    else:
        diff_result = run_git(repo, "diff", "--no-index", "--no-ext-diff", "--unified=5", "/dev/null", str(source))
        if diff_result.returncode not in (0, 1):
            fail(diff_result.stderr.strip() or "git diff --no-index failed")
        diff = diff_result.stdout
        change_kind = "untracked"

    manifest = {
        "repo_root": str(repo),
        "source": str(source),
        "source_relative": source_relative.as_posix(),
        "target": str(target),
        "target_relative": target.relative_to(repo).as_posix(),
        "target_exists": target.is_file(),
        "source_tracked": tracked,
        "change_kind": change_kind,
        "references": references,
        "diff": diff,
    }
    json.dump(manifest, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
