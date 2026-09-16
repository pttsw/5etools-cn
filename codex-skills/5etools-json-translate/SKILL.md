---
name: 5etools-json-translate
description: Translate the Git diff of one user-specified English JSON file under data-bak into its corresponding Chinese JSON under data, using existing translations, optional references, terminology lookup, and repository build/data-test validation. Use for incremental 5etools data localization; do not use for arbitrary documents or non-JSON source files.
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

Read [references/localization-rules.md](references/localization-rules.md) before translating.

If the selected source is under `data-bak/bestiary/`, also read [references/bestiary-xmm-style.md](references/bestiary-xmm-style.md). Treat the aligned pair `data-bak/bestiary/bestiary-xmm.json` and `data/bestiary/bestiary-xmm.json` as the primary corpus for monster rules wording, especially traits, attacks, saves, conditions, movement, spellcasting, reactions, and legendary actions. For a phrase not covered by the summary, search aligned examples with:

```bash
python3 <skill-dir>/scripts/lookup_bestiary_xmm.py "saving throws against spells" \
  [--section trait] [--limit 10]
```

## Apply the semantic delta

Use the pre-change English version from `git show HEAD:<source-path>`, the current English file, and the current Chinese target to distinguish additions, edits, moves, and deletions. Match entities by stable identity such as `source`, original English `name`/`ENG_name`, IDs, and structural location; do not assume array indexes remained stable.

- Existing target: preserve established Chinese content outside the English semantic delta. Mirror structural/non-text changes and translate only added or changed translatable content. Remove target content only when the source diff removed its semantic counterpart.
- New source or missing target: create the corresponding `data/` file, preserve the JSON structure, and translate the full file.
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

## Validate and repair

Record `git status --short` before validation so pre-existing user changes are not mistaken for this task's output and are never reverted.

1. Parse the edited target as JSON.
2. Inspect the target diff and confirm changes correspond only to the source semantic delta.
3. From the repository root, run `npm run build`.
4. Fix target-caused failures and rerun `npm run build` until it passes or an out-of-scope dependency is proven.
5. Run `npm run test:data`.
6. Fix target-caused failures and rerun the failing command, then rerun both required commands for final confirmation when practical.

Build and tests may expose or generate unrelated changes. Do not revert, format, translate, or otherwise modify pre-existing user work. Only make directly necessary changes to the selected target unless the user explicitly expands scope.

### Missing-link boundary

When a failure is a missing hyperlink/entity reference caused by another English file having new content with no corresponding Chinese translation:

1. Prove the selected target's tag syntax and translated reference are correct.
2. Map each missing entity to the specific `data-bak/**/*.json` source file and expected `data/**/*.json` target. Group duplicate errors.
3. Present the concrete file list and ask whether the user wants those files translated next.
4. Do not translate them, weaken the link, copy English into `data`, or suppress the test before the user answers.

For unrelated baseline failures, report the command and concise evidence; do not broaden the edit.

## Handoff

Report the selected source and target, what portion of the source diff was localized, terminology/reference decisions worth reviewing, and the exact outcome of `npm run build` and `npm run test:data`. If missing-link dependencies remain, list their mapped files and the pending user decision.
