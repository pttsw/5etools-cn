---
name: homebrew-translation-worker
description: Claim exactly one queued homebrew JSON translation, process it in an isolated Git worktree with the 5etools-json-translate workflow, and register a validated commit for serial integration. Use for scheduled or concurrent automatic homebrew translation workers.
---

# Homebrew Translation Worker

Act as one queue worker. Do not choose a file manually and do not process more than one file per invocation.

Locate the installed `5etools-json-translate` skill and read its `SKILL.md` plus `references/automated-worker.md`. Run its `scripts/homebrew_translation_queue.py claim --worker-id <stable-run-id>`. If it returns `EMPTY_QUEUE`, report that outcome and stop successfully.

For a successful lease:

1. Export `HOMEBREW_EN_ROOT` from the claim's source root and `HOMEBREW_ZH_ROOT` as the returned isolated target root.
2. Use `$5etools-json-translate` in homebrew mode on the exact returned source path. The analyser establishes translation scope, but every candidate translation still requires contextual verification.
3. Renew the lease around long translator, independent-review, build, and test stages.
4. Stage and commit only the selected translated JSON or its intentional rename. Never commit `_generated` output.
5. Write the required structured result and call `complete`. A successful worker ends in queue state `ready`, not `merged`.

On any incomplete run, call `fail` before exiting. Mark the task blocked only when retrying cannot resolve the condition without human judgment. Never run `integrate-next`; integration is a separate serial responsibility.
