---
name: homebrew-conversion-audit
description: Use when converting user-supplied homebrew files into 5etools-style JSON or collection JSON, especially when the input may be doc, docx, raw text, markdown, or pdf, and when the existing converter should run first but may need schema-aware checking and in-conversation Codex repair.
---

# Homebrew Conversion Audit

Use this skill when:
- the user wants to convert `doc`, `docx`, `raw text`, `md`, `pdf`, or partially converted JSON into 5etools-style output
- the existing converter should be treated as the first-pass parser
- the output may be a single entity such as a `monster` or a multi-entity collection payload
- warnings, schema mismatches, dropped sections, or malformed structures may require repair by the current Codex conversation

Do not treat the LLM as the default parser. Run the existing converter first unless the input is already structured JSON which only needs validation or repair.

## Workflow

1. Extract the input into normalized document blocks.
2. Prepare an entity bundle for the current Codex conversation.
3. Let Codex identify entity boundaries and types when possible.
4. Split the document into entity candidates using the Codex plan, or fall back to script heuristics if no plan is available.
5. Treat every standalone `spell`, `item`, and `monster` found in the source as a required separate entity.
6. Choose the existing converter and mode (`txt` or `md`) for each candidate.
7. Run the converter and collect:
   - initial JSON
   - warnings
   - raw extracted text used for parsing
8. Identify required target metadata which is missing from the source text and cannot be safely inferred.
9. Ask the user for required user-owned metadata before final output, rather than inventing fallback values.
10. Validate the initial JSON using both:
   - schema checks
   - semantic checks
11. If validation passes, emit the initial JSON and a short report.
12. If validation fails, generate a repair prompt using:
   - the original text
   - the initial JSON
   - warnings
   - validation issues
   - schema-aware constraints
13. Have the current Codex conversation return a repair patch.
14. Merge the repair patch into the initial JSON.
15. Revalidate.
16. Replace embedded source text sections for converted `spell`, `item`, and `monster` blocks with 5etools references/statblocks where appropriate.
17. If converted `spell`, `item`, or `monster` entities are present, emit a collection JSON containing the adventure plus those top-level entities.
18. If a local homebrew validation repo is available, run an external brew-schema validation pass against the emitted JSON.
19. After validation passes, publish the final JSON into the 5etools project `homebrew/` directory using the filename format `作者名; 书名.json`.
20. Add the published filename to `homebrew/index.json`.
21. Emit:
   - final JSON
   - repair report
   - manual review notes if any uncertainty remains

## Operating Rules

- Prefer repair patches over full regeneration.
- Preserve valid converter output whenever possible.
- Use formal schema validation as a hard gate, but do not rely on schema validation alone.
- When available, prefer an external downstream validation pass in a real homebrew repo after local schema/semantic validation succeeds.
- Do not invent required metadata such as `published`, `storyline`, source `version`, release date, author, or converted-by fields when the source does not provide them.
- If required metadata is missing, stop and ask the user for the exact values to use before emitting final JSON.
- Do not leave standalone `spell`, `item`, or `monster` content only as adventure/body text. These must become top-level homebrew entities.
- If any required `spell`, `item`, or `monster` cannot be converted or repaired, stop before final build/publish and report the repair prompt or manual-review blocker.
- Treat dropped sections, missing core fields, and high-risk warnings as stronger failure signals than cosmetic warnings.
- Record which fields were changed during repair.
- If the repaired output still fails validation, return the best partial result plus a clear manual-review report instead of pretending the conversion succeeded.

## Input Formats

The workflow should support:
- `raw text`
- `md`
- `docx`
- `doc`
- `pdf`

Preferred normalization model:

```json
{
  "source_file": "example.docx",
  "format": "docx",
  "blocks": [
    {"type": "heading", "level": 1, "text": "Ancient Dragon"},
    {"type": "paragraph", "text": "Huge dragon, chaotic evil"},
    {"type": "list_item", "text": "Legendary Resistance (3/Day). ..."},
    {"type": "table", "rows": [["STR", "DEX", "CON", "INT", "WIS", "CHA"]]}
  ],
  "meta": {
    "extract_quality": "high"
  }
}
```

Keep document structure where possible. Do not flatten tables, lists, or headings earlier than necessary.

## Entity Strategy

Entity splitting should happen before LLM repair. Prefer Codex-driven entity identification over pure script heuristics. Candidate kinds may include:
- `monster`
- `spell`
- `item`
- `race`
- `feat`
- `background`
- `language`
- `reward`
- `deity`
- `subclass`
- `subclassFeature`
- `table`
- `entries`
- `unknown`

For the current implementation:
- `monster`, `spell`, and `item` have converter-check-repair support and are mandatory split entities when present
- `feat`, `background`, `language`, `reward`, `race`, `deity`, and `subclass` currently benefit most from reference-linking/statblock post-processing rather than dedicated converter pipelines
- `monster` is still the deepest path and should be treated as the most mature flow

## References

Read these only when needed:
- For input extraction guidance: `references/input-formats.md`
- For Codex-driven entity splitting: `references/entity-splitting.md`
- For checker logic: `references/checker-rules.md`
- For monster repair prompting: `references/prompt-monster-repair.md`
- For in-conversation repair flow: `references/llm-integration.md`

If later variants are added, keep additional entity-specific prompts and notes in `references/` rather than expanding this file.

## Expected Scripts

The following scripts are expected for a full implementation:
- `scripts/extract-input.js`
- `scripts/prepare-entity-bundle.js`
- `scripts/split-entities.js`
- `scripts/run-converter-check.js`
- `scripts/run-converter-creature-node.js`
- `scripts/validate-entity.js`
- `scripts/build-repair-prompt.js`
- `scripts/normalize-llm-result.js`
- `scripts/generate-report.js`
- `scripts/run-entity-audit.js`
- `scripts/audit-file-cli.js`
- `scripts/homebrew-conversion-cli.js`
- `scripts/merge-llm-patch.js`
- `scripts/build-collection.js`
- `scripts/build-collection-from-plan-cli.js`
- `scripts/validate-homebrew-json-cli.js`
- `scripts/validate-homebrew-json-shim.mjs`
- `scripts/publish-homebrew-cli.js`
- optionally, a helper which invokes an external homebrew validator such as `test-json-brew`

These scripts do not need to exist yet for this draft skill. If they are missing, implement the minimum necessary logic locally in the repo or create the scripts as part of the task.

## CLI Pattern

When using the local CLI flow, prefer the unified wrapper:
1. Run `homebrew-conversion-cli.js bundle --entity-bundle <path> ...` to export a Codex-facing entity bundle.
2. Have the current Codex conversation return an `entityPlan`.
3. Save that plan as JSON.
4. Run `homebrew-conversion-cli.js audit --entity-plan <path> ...` and optionally choose an entity with:
   - `--entity-index`
   - `--entity-role`
   - `--entity-kind`
5. Run `homebrew-conversion-cli.js build-collection --entity-plan <path> --output <path> ...` to build a draft collection.
6. If an entity needed repair, save the Codex repair result as `<title>.<kind>.result.json` in the repair directory, or pass `--llm-result-dir` when re-running the collection builder so it can auto-merge validated LLM results.

For adventure documents, prefer `build-adventure-collection-cli.js` as the end-to-end entry point. It extracts the adventure, detects embedded `monster`, `spell`, and `item` blocks, converts them as required top-level entities, replaces their source text in `adventureData` with schema-valid statblock references, and emits a collection JSON when any such entities are present.

Use the entity-plan `build-collection` flow when automatic fallback boundaries are ambiguous, when Codex needs to explicitly classify many mixed entity types, or when a converted entity requires an LLM repair result before final build.

For adventure collection output, collect user-confirmed values for target-required metadata before the final build:
- `--published <YYYY-MM-DD>`
- `--storyline <text>`
- `--version <x.y.z>`

If the source text does not contain these values, ask the user. Do not silently default to today's date, the adventure title, or `1.0.0`.

## External Brew Validation

If `/data/homebrew` (or another compatible homebrew repo) is available, run a final schema test on the emitted JSON.

For Chinese 5etools output, prefer the skill wrapper:

```bash
node scripts/validate-homebrew-json-cli.js --file /absolute/path/to/output.json --homebrew-dir /data/homebrew
```

This wrapper dynamically applies Chinese 5etools schema extensions at validation time. For example, it allows `adventure[].ENG_name` without editing `/data/homebrew/node_modules/5etools-utils/schema/brew/adventures.json`.

For plain upstream validation without Chinese extensions, run:

```bash
cd /data/homebrew
npm run test:json -- /absolute/path/to/output.json
```

Notes:
- This validator can test a single file directly; the full `npm run test` chain is not required for per-file conversion checks.
- In the current `5etools-utils` implementation, `test-json-brew` may fetch remote schemas referenced by the local brew schema set.
- Node's built-in `fetch` may not use `HTTP_PROXY`/`HTTPS_PROXY`; the skill wrapper routes these schema fetches through `curl`, which does use the configured proxy in this environment.
- In sandboxed or offline environments, this step may require network approval or may need to be reported as skipped due to schema-fetch failure.
- Treat this as a downstream compatibility gate in addition to the local converter/checker validation, not a replacement for the earlier audit steps.

## Publish To 5etools Homebrew

After schema validation passes, publish the final JSON into the 5etools project `homebrew/` directory:

```bash
node scripts/publish-homebrew-cli.js --input /absolute/path/to/output.json --homebrew-dir /data/5etools-mirror-2.github.io/homebrew --author "作者名" --title "书名"
```

This writes:
- `homebrew/作者名; 书名.json`
- `homebrew/index.json`

If replacing a temporary/generated filename, pass `--replace-filename <old-file.json>` so `homebrew/index.json` stops importing the old draft name.
