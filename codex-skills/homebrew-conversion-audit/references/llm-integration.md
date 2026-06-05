# LLM Integration

The default repair mode is **in-conversation repair**.

This means:
- the scripts generate a repair prompt
- the current Codex conversation reads that prompt and produces a patch
- the patch is then fed back into the audit workflow for merge and revalidation

The local scripts do **not** directly call an external model by default.

## Default Workflow

1. Run the converter and checker.
2. If repair is needed, generate a repair prompt.
3. Have the current Codex conversation produce JSON with this shape:

```json
{
  "patch": {...},
  "manual_review": [...],
  "confidence": 0.0
}
```

4. Feed that JSON back into `runEntityAudit(...)` as `llmRawResult` or normalized `llmResult`.
5. Revalidate and inspect the final report.

## Result File Convention

When using the collection builder, you can also save Codex repair results as files and let the CLI auto-merge them on the next run.

Use this naming convention:
- `<title>.monster.result.json`
- `<title>.spell.result.json`
- `<title>.item.result.json`

The title part is sanitized to match the local helper logic, so spaces and punctuation may become underscores. For example:
- `False_Hydra.monster.result.json`
- `Sending.spell.result.json`
- `Wand_of_Smiles.item.result.json`

If `build-collection-from-plan-cli.js` is run with `--llm-result-dir` or `--repair-dir`, it will:
- look for matching result files for failed entities
- normalize the `patch`
- validate the repaired entity
- auto-merge valid repaired entities back into the collection draft

## CLI Example

```text
node codex-skills/homebrew-conversion-audit/scripts/audit-file-cli.js \
  --input ./sample.txt \
  --kind monster \
  --source MM \
  --page 166 \
  --mode txt \
  --output ./result.json \
  --report ./report.md \
  --repair-prompt ./repair-prompt.txt
```

This writes a prompt file you can hand back to the current Codex conversation.

For collection assembly, a common follow-up is:

```text
node codex-skills/homebrew-conversion-audit/scripts/homebrew-conversion-cli.js build-collection \
  --input ./module.docx \
  --entity-plan ./module.plan.json \
  --output ./module.collection.json \
  --repair-dir ./repairs \
  --llm-result-dir ./repairs
```

This allows repaired `monster`, `spell`, and `item` results to be picked up automatically.

## Notes

- The repair prompt is the bridge between the deterministic scripts and the current Codex conversation.
- Repair should remain a fallback path, not the default parser.
- If you later want an external model caller, add it as an optional wrapper instead of making it the primary path.
