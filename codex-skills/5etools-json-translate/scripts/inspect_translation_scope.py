#!/usr/bin/env python3
"""Validate one 5etools or homebrew translation scope and print a JSON manifest."""

from __future__ import annotations

import argparse
import json
import os
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


def homebrew_identity(path: Path) -> set[str]:
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, UnicodeError, json.JSONDecodeError):
        return set()
    sources = data.get("_meta", {}).get("sources", []) if isinstance(data, dict) else []
    return {
        item["json"]
        for item in sources
        if isinstance(item, dict) and isinstance(item.get("json"), str)
    }


def resolve_homebrew_target(source: Path, relative: Path, target_root: Path) -> Path:
    """Find a renamed target by stable source IDs, falling back to the English filename."""
    directory = target_root / relative.parent
    source_ids = homebrew_identity(source)
    if directory.is_dir() and source_ids:
        matches = [
            candidate
            for candidate in directory.glob("*.json")
            if homebrew_identity(candidate) & source_ids
        ]
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            fail("Multiple homebrew targets share the source identity: " + ", ".join(map(str, matches)))
    return directory / source.name


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
    parser.add_argument("source", help="One English JSON file")
    parser.add_argument("--mode", choices=("5et", "homebrew"), default="5et")
    parser.add_argument("--reference", action="append", default=[], help="Optional reference file or directory")
    parser.add_argument("--repo", help="Repository root; defaults to searching upward from cwd")
    parser.add_argument("--source-root", type=Path, help="Override the homebrew English root")
    parser.add_argument("--target-root", type=Path, help="Override the homebrew Chinese root/worktree")
    args = parser.parse_args()

    homebrew_source_root = (args.source_root or Path(os.environ.get("HOMEBREW_EN_ROOT", "/data/homebrew-en"))).expanduser().resolve()
    homebrew_target_root = (args.target_root or Path(os.environ.get("HOMEBREW_ZH_ROOT", "/data/homebrew"))).expanduser().resolve()
    repo = (
        homebrew_source_root
        if args.mode == "homebrew" and not args.repo
        else Path(args.repo).expanduser().resolve() if args.repo else find_repo_root(Path.cwd())
    )
    source_input = Path(args.source).expanduser()
    source = (repo / source_input).resolve() if not source_input.is_absolute() else source_input.resolve()
    source_root = homebrew_source_root if args.mode == "homebrew" else (repo / "data-bak").resolve()
    target_root = homebrew_target_root if args.mode == "homebrew" else (repo / "data").resolve()
    if not contained(source, source_root):
        fail(f"Source must be inside {source_root}")
    if not source.is_file() or source.suffix.lower() != ".json":
        fail("Source must be an existing .json file.")

    try:
        json.loads(source.read_text(encoding="utf-8-sig"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        fail(f"Source is not valid UTF-8 JSON: {exc}")

    relative_inside_data = source.relative_to(source_root)
    source_relative = source.relative_to(source_root if args.mode == "homebrew" else repo)
    target = (
        resolve_homebrew_target(source, relative_inside_data, target_root)
        if args.mode == "homebrew"
        else target_root / relative_inside_data
    )

    references = []
    for value in args.reference:
        item = Path(value).expanduser()
        item = (Path.cwd() / item).resolve() if not item.is_absolute() else item.resolve()
        if not item.exists():
            fail(f"Reference does not exist: {item}")
        references.append(str(item))

    git_root = source_root if args.mode == "homebrew" else repo
    tracked_result = run_git(git_root, "ls-files", "--error-unmatch", "--", source_relative.as_posix())
    tracked = tracked_result.returncode == 0
    if tracked:
        diff_result = run_git(git_root, "diff", "--no-ext-diff", "--unified=5", "HEAD", "--", source_relative.as_posix())
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
        "mode": args.mode,
        "source_root": str(source_root),
        "target_root": str(target_root),
        "source": str(source),
        "source_relative": source_relative.as_posix(),
        "target": str(target),
        "target_relative": target.relative_to(target_root if args.mode == "homebrew" else repo).as_posix(),
        "target_exists": target.is_file(),
        "source_tracked": tracked,
        "change_kind": change_kind,
        "translation_scope": "diff" if change_kind == "modified" else "full",
        "references": references,
        "diff": diff,
    }
    json.dump(manifest, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
