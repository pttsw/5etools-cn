# Automated homebrew worker

Use this reference only when a scheduler or worker supplies a queue lease.

The queue coordinator is `scripts/homebrew_translation_queue.py`. Its SQLite database defaults to `/data/homebrew-translation-state/queue.sqlite3`; override it with `--database` for testing or a separate deployment. The English root, Chinese repository, state directory, and worktree root can be overridden with `HOMEBREW_EN_ROOT`, `HOMEBREW_ZH_REPO`, `HOMEBREW_TRANSLATION_STATE_DIR`, and `HOMEBREW_WORKTREE_ROOT`.

## Lease contract

Claim exactly one file:

```bash
python3 <skill-dir>/scripts/homebrew_translation_queue.py claim \
  --worker-id "$WORKER_ID"
```

Exit code `3` with `EMPTY_QUEUE` is a successful no-work outcome. A successful claim returns `lease_id`, the absolute English `source`, its hash, and an isolated `target_root`/`worktree`. Export:

```bash
export HOMEBREW_EN_ROOT=/data/homebrew-en
export HOMEBREW_ZH_ROOT=<target_root-from-claim>
```

Translate only the claimed source. Never claim a second task in the same run. Renew the lease before and after translator, review, build, or test operations that may take several minutes:

By default, claiming is refused while the shared Chinese repository has non-generated uncommitted changes. Commit or otherwise resolve that work first. Do not use `--allow-dirty-base` in scheduled production runs; it exists only for deliberately isolated testing.

```bash
python3 <skill-dir>/scripts/homebrew_translation_queue.py heartbeat \
  --lease-id "$LEASE_ID"
```

If work cannot finish, call `fail` with a concise actionable reason. Use `--blocked` for identity collisions, ambiguous filenames, or other conditions that require human judgment; ordinary transient failures remain retryable.

## Commit and completion

The isolated worktree may contain generated index changes after build. Stage and commit only the selected translated JSON path or its intentional rename; do not commit `_generated` files. Create a result JSON containing:

```json
{
  "source_hash": "<hash from claim>",
  "target": "relative/path/to/<作者>; <中文资源名>.json",
  "commit_sha": "<worktree HEAD>",
  "analyser": {"jobs": 0, "actionable": 0, "residual": 0, "unresolved_paths": 0},
  "review": {"rounds": 1, "result": "PASS"},
  "validation": {
    "json": "PASS",
    "structure": "PASS",
    "schema": "PASS",
    "build": "PASS",
    "tests": "PASS"
  }
}
```

Use actual counts and results. Then register the work:

```bash
python3 <skill-dir>/scripts/homebrew_translation_queue.py complete \
  --lease-id "$LEASE_ID" --result /path/to/result.json
```

Completion rejects expired/replaced leases, changed sources, missing targets, commits outside the selected category, and incomplete validation. It marks the task `ready`; it does not alter the shared Chinese repository. A separate serial integration process runs `integrate-next` only when the shared repository has no non-generated uncommitted changes; generated index changes are ignored and preserved.

## Scheduler cycle

A scheduler should run `sync`, then `reclaim-expired`, then start the configured number of workers. It may start workers concurrently because claims are atomic and each claim receives a separate Git worktree. Run one serial integration process for `ready` tasks. `integrate-next` refuses to operate when the shared Chinese repository has any uncommitted changes.
