# No-AI target bootstrap

Use this procedure only when the mapped Chinese target is absent or the strict structure comparison exits `1`.

## Generate the candidate

Resolve the selected source to an absolute path under:

```text
/data/5etools-mirror-2.github.io/data-bak/
```

Its generated candidate is expected at the same relative path under:

```text
/data/5e-translator/output/
```

From the translator repository, run exactly the selected source file:

```bash
cd /data/5e-translator
python3 main.py translate --en=/absolute/path/to/data-bak/path.json --no-ai
```

`main.py` selects its project virtual environment automatically. `--no-ai` uses known database translations, keeps database misses in English, and may translate known tag values. It is a structural bootstrap, not a completed translation.

The command also writes `.en` and `.jobs` sidecars. They belong to the translator output cache; do not copy or edit them into the 5etools repository.

Require all of the following before using the generated JSON:

1. The command exits successfully.
2. The expected candidate exists and was produced or updated by this invocation; do not silently reuse an unexplained stale output.
3. The candidate parses as JSON.
4. A strict comparison of the English source against the candidate exits `0`:

   ```bash
   python3 <skill-dir>/scripts/compare_json_structure.py \
     /absolute/path/to/data-bak/path.json \
     /data/5e-translator/output/path.json
   ```

If generation fails or the candidate still has structural errors, report the exact failure and diagnose it. Do not fall back to copying the English source directly into `data/`.

## Apply the candidate safely

### Missing target

Install the validated candidate at the corresponding `data/` path, preserving repository formatting conventions. Record the new target in `git status`, parse it again, and run the strict source/target structure comparison. Then treat every remaining English fallback string in the target as translation work.

### Existing target with structural errors

Do not replace it wholesale. Use the comparison report, stable identities such as `source`, `id`, `name`/`ENG_name`, and the generated candidate to align objects and arrays. Apply only the structural delta:

- add source-required keys or array elements from the candidate;
- remove source-deleted structure only when it belongs to the selected English semantic delta;
- restore changed non-text scalar values and JSON value types;
- preserve established Chinese strings, localized display keys, `ENG_name`, `translator`, and unrelated user edits;
- translate newly added text later through the normal terminology and review workflow.

After each repair, parse the target and rerun strict comparison. Continue only after it exits `0`. If alignment is ambiguous enough that preserving existing translations cannot be guaranteed, stop and ask the user rather than overwriting the target.
