---
name: 5etools-json-translate
description: Translate the Git diff of one user-specified English JSON file under data-bak into its corresponding Chinese JSON under data, with preflight target bootstrapping, existing translations, optional references, terminology lookup, independent subagent consistency review, JSON structure comparison, and repository build/data-test validation. Use for incremental 5etools data localization; do not use for arbitrary documents or non-JSON source files.
---

# 5etools JSON Incremental Translation

Work on exactly one `data-bak/**/*.json` file named by the user. Treat its Git diff as the translation scope and write the result to the same relative path under `data/`.

## Establish the scope

If the user has not named the English JSON file, ask for that path before editing. Resolve helper paths relative to this `SKILL.md`.

Run:

```bash
python3 <skill-dir>/scripts/inspect_translation_scope.py <data-bak/path.json> \
  [--reference <path>]...
```

The helper rejects paths outside `data-bak`, maps the target path, validates optional references, and reports the `HEAD`-to-working-tree diff. For an untracked source, the whole file is new scope. If a tracked source has no diff, report that there is nothing to translate and stop.

Before editing, read all of:

- the reported source diff;
- the complete current English source, so changed fragments are interpreted in context;
- the corresponding `data/` target when it exists, as the primary style and continuity reference;
- every optional reference path supplied by the user.

Also record `git status --short` and any pre-existing diff of the mapped target before editing. Those changes belong to the user; preserve them and apply the translation on top.

## Preflight the Chinese target

Do this before translating any text.

If the mapped `data/` target exists, run a strict source/target structure comparison without a baseline:

```bash
python3 <skill-dir>/scripts/compare_json_structure.py <data-bak/path.json>
```

Exit code `0` means the target is structurally ready. Exit code `1` means the target is missing or structurally inconsistent; read and follow [references/no-ai-bootstrap.md](references/no-ai-bootstrap.md) to generate a no-AI structural candidate and initialize or repair the target. Exit code `2` is a parse, path, or tool failure: diagnose it instead of treating it as a structural mismatch.

When the target does not exist, skip the initial comparison and follow the same no-AI bootstrap reference. For an existing target, the generated candidate is a structural reference only: never replace the whole target or discard established Chinese text. Patch missing, moved, or type-changed structure into the target while preserving valid translations and pre-existing user changes.

After bootstrapping or repairing, parse the target and rerun the strict comparison until it exits `0`. Do not begin manual translation with unresolved structural errors.

Once the preflight passes, capture the clean task-start structural baseline in a temporary file:

```bash
STRUCTURE_BASELINE=$(mktemp)
python3 <skill-dir>/scripts/compare_json_structure.py <data-bak/path.json> \
  --capture-baseline "$STRUCTURE_BASELINE"
```

Keep `STRUCTURE_BASELINE` for the final structure gate. It makes the gate reject structural drift introduced during translation. If the captured report unexpectedly contains errors, return to preflight instead of accepting them as baseline.

Read [references/localization-rules.md](references/localization-rules.md) before translating.

Mandatory typography constraint: Chinese natural-language translations must use Chinese quotation marks `“……”`; use `‘……’` for a quotation nested inside them. Do not use ASCII straight quotes as Chinese prose punctuation. This applies only to human-readable translated text—never mechanically replace JSON syntax delimiters, 5etools tag grammar, code, formulas, IDs, URLs, or other literal machine content.

If the selected source is under `data-bak/bestiary/`, also read [references/bestiary-xmm-style.md](references/bestiary-xmm-style.md). Treat the aligned pair `data-bak/bestiary/bestiary-xmm.json` and `data/bestiary/bestiary-xmm.json` as the primary corpus for monster rules wording, especially traits, attacks, saves, conditions, movement, spellcasting, reactions, and legendary actions. For a phrase not covered by the summary, search aligned examples with:

```bash
python3 <skill-dir>/scripts/lookup_bestiary_xmm.py "saving throws against spells" \
  [--section trait] [--limit 10]
```

## Apply the semantic delta

Use the pre-change English version from `git show HEAD:<source-path>`, the current English file, and the current Chinese target to distinguish additions, edits, moves, and deletions. Match entities by stable identity such as `source`, original English `name`/`ENG_name`, IDs, and structural location; do not assume array indexes remained stable.

- Existing target: preserve established Chinese content outside the English semantic delta. Mirror structural/non-text changes and translate only added or changed translatable content. Remove target content only when the source diff removed its semantic counterpart.
- New source or initially missing target: start from the validated no-AI candidate installed during preflight, preserve its structure, and translate the full file. English fallback text in that candidate is untranslated work, not an acceptable final translation.
- Never replace an existing Chinese target wholesale with the English source.
- Do not edit any second translation file merely because it is related. Cross-file expansion requires the user's choice described under validation.

Use `apply_patch` for edits. Preserve the file's indentation and key-order conventions. Reparse JSON after every substantial patch.

## Query terminology and entities

Query ambiguous names, D&D terms, and cross-referenced entities as complete phrases. Batch up to ten related phrases:

```bash
/data/5e-translator/.venv/bin/python <skill-dir>/scripts/lookup_reference.py translations \
  "Fireball" "saving throw" --category spell --limit 5 \
  [--reference <txt-or-md-path>]...

/data/5e-translator/.venv/bin/python <skill-dir>/scripts/lookup_reference.py entities \
  "Fireball" --entity-type spell --limit 2 \
  [--reference <txt-or-md-path>]...
```

This wrapper reuses `/data/5e-translator/app/core/agent/tools.py`: translation candidates rank the term table, session references, the 5E 不全书, then run-local terms; entity lookup ranks session references before complete 不全书 pages. Reference ingestion supports UTF-8 text/Markdown. Read JSON and other user references directly even when the wrapper cannot ingest them.

Treat lookup output as evidence, not an automatic replacement. Prefer, in order: the corresponding target's established usage for the same entity, explicit user references, high-ranked terminology evidence, and consistent surrounding repository usage. Resolve conflicts by context and note material uncertainty in the handoff.

For files under `data-bak/bestiary/`, repeated, mechanically matching `bestiary-xmm.json` usage outranks generic terminology evidence. Do not copy an XMM sentence when its numbers, creature identity, target count, timing, or tags differ from the current English text.

## Independent consistency review

After every translation round parses successfully, start a fresh subagent to perform a read-only consistency review before continuing to build/test validation. A translation round is any batch that adds, changes, or removes translatable target content, including Chinese prose, names, tag display text, and numbers or game-mechanical text embedded in translated fields. Read and follow [references/subagent-review.md](references/subagent-review.md).

The subagent must independently compare the changed translation against the English semantic delta, the corresponding historical target, every user-supplied reference, and terminology lookup results. For bestiary files it must also apply the XMM rules and aligned corpus. It reports evidence-backed findings to the main agent and must not edit files.

The main agent verifies each finding, applies supported corrections, and then starts another fresh subagent review because those corrections form a new translation round. Continue until a reviewer returns `PASS` with no actionable inconsistency. Do not run `npm run build` or `npm run test:data` until this review gate passes.

## Validate and repair

Record `git status --short` before validation so pre-existing user changes are not mistaken for this task's output and are never reverted.

1. Parse the edited target as JSON.
2. Inspect the target diff and confirm changes correspond only to the source semantic delta.
3. Complete the independent consistency-review gate.
4. From the repository root, run `npm run build`.
5. Fix target-caused build failures. If a repair creates a translation round, immediately parse the target and complete a fresh consistency-review cycle; after it passes, restart required validation from `npm run build`.
6. Before the final data test, run the JSON structure gate:

   ```bash
   python3 <skill-dir>/scripts/compare_json_structure.py <data-bak/path.json> \
     --baseline-report "$STRUCTURE_BASELINE"
   ```

   It recursively checks object keys, array lengths, JSON value types, non-text scalar values, and `ENG_name` identity anchors. It permits localized-only `ENG_name`/`translator` fields and the translated display keys used under `containerCapacity.item`; use repeatable `--allow-extra-key` or `--translated-key-path` only after verifying another repository convention requires it. Inspect warnings as well as failures. Fix every new error caused by the selected target, then rerun the gate until it passes. Do not silently exempt an accidental mismatch. If a structure repair changes translatable content, treat it as a new translation round, run a fresh subagent review, and restart at `npm run build`.
7. Run `npm run test:data` only after the build and structure gate both pass.
8. Fix target-caused test failures. If a repair creates a translation round, immediately parse and review it; after the gate passes, rerun `npm run build`, the JSON structure gate, and `npm run test:data` as the final confirmation. For a purely structural repair, rerun the structure gate before both required npm commands when practical.

Any build/structure/test result obtained before a later translation round is stale and cannot be reported as final. Purely structural or generated-file changes do not create a translation round, but they do invalidate the earlier structure result.

Build and tests may expose or generate unrelated changes. Do not revert, format, translate, or otherwise modify pre-existing user work. Only make directly necessary changes to the selected target unless the user explicitly expands scope.

### Missing-link boundary

When a failure is a missing hyperlink/entity reference caused by another English file having new content with no corresponding Chinese translation:

1. Prove the selected target's tag syntax and translated reference are correct.
2. Map each missing entity to the specific `data-bak/**/*.json` source file and expected `data/**/*.json` target. Group duplicate errors.
3. Present the concrete file list and ask whether the user wants those files translated next.
4. Do not translate them, weaken the link, copy English into `data`, or suppress the test before the user answers.

For unrelated baseline failures, report the command and concise evidence; do not broaden the edit.

## Handoff

Report the selected source and target, whether no-AI bootstrap was used and how its candidate affected the target, what portion of the source diff was localized, how many subagent review rounds ran and their final result, terminology/reference decisions worth reviewing, the JSON structure gate outcome, and the exact outcome of `npm run build` and `npm run test:data`. If missing-link dependencies remain, list their mapped files and the pending user decision.
