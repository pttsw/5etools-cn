# No-AI target bootstrap

Use this procedure only when the mapped Chinese target is absent or the strict structure comparison exits `1`.

## Generate the candidate

Resolve the selected source to an absolute path under the active mode's source root:

```text
/data/5etools-mirror-2.github.io/data-bak/
/data/homebrew-en/                 # homebrew mode
```

In 5et mode, its generated candidate is expected at the same relative path under:

```text
/data/5e-translator/output/
```

In homebrew mode the translator localizes the resource-name portion of the output filename. Locate the newly produced JSON in the corresponding output subdirectory by its unchanged author prefix and stable `_meta.sources[].json` identity; require exactly one match. Do not assume the English filename remains present.

From the translator repository, run exactly the selected source file:

```bash
cd /data/5e-translator
python3 main.py translate --en=/absolute/path/to/source.json --no-ai [--mode homebrew]
```

The `--mode homebrew` argument is mandatory for a source under `/data/homebrew-en/`; omit it only in 5et mode.

`main.py` selects its project virtual environment automatically. `--no-ai` uses known database translations; database misses may remain English or appear as `{!@ ...}` placeholders. It is a structural bootstrap, not a completed translation.

The command also writes `.en` and `.jobs` sidecars. They belong to the translator output cache; do not copy or edit them into the 5etools repository.

Require all of the following before using the generated JSON:

1. The command exits successfully.
2. The expected candidate (including the translator-renamed file in homebrew mode) exists and was produced or updated by this invocation; do not silently reuse an unexplained stale output.
3. The candidate parses as JSON.
4. The deterministic repair/validation gate below succeeds.
5. A strict comparison of the English source against the repaired candidate exits `0`:

   ```bash
   python3 <skill-dir>/scripts/compare_json_structure.py \
    /absolute/path/to/source.json \
    /path/to/repaired-candidate.json [--mode homebrew]
   ```

If generation fails or the candidate still has structural errors, report the exact failure and diagnose it. Do not fall back to copying the English source directly into `data/`.

Always pass the generated candidate through the deterministic repair/validation gate into a separate file:

```bash
python3 <skill-dir>/scripts/repair_bootstrap_candidate.py \
  <source.json> <candidate.json> <repaired-candidate.json> \
  [--jobs <candidate.json.jobs>]
```

The gate restores source structure and non-text scalars while retaining candidate strings and localized-only `ENG_name`/`translator`. It also turns source-mappable `{!@ ...}` placeholders back into their English source text and reports the corresponding `.jobs` entries as `pending_translation_jobs`; these normal misses are subsequent translation work, not structural failure. Unmappable placeholders remain fatal. This covers drift such as a removed `$schema`, changed non-text metadata, missing source keys, or array truncation. Compare the repaired file structurally before installation. Never repair an existing Chinese target with this script; it is only for a newly generated candidate.

## Apply the candidate safely

### Missing target

Install the validated candidate at the corresponding target root, preserving repository formatting conventions. In homebrew mode, follow `homebrew-workflow.md` to resolve the localized filename, retain the source filename's author prefix, and install it as `<作者>; <中文资源名>.json` under `/data/homebrew/`; translate `_meta.sources[].full` only when the analyser and its meaning require it. Pass the explicit final target path to later structure comparisons. Record the new target in `git status`, parse it again, and run the strict source/target structure comparison. Then treat every pending analyser job in the target as translation work.

### Existing target with structural errors

Do not replace it wholesale. Use the comparison report, stable identities such as `source`, `id`, `name`/`ENG_name`, and the generated candidate to align objects and arrays. Apply only the structural delta:

- add source-required keys or array elements from the candidate;
- remove source-deleted structure only when it belongs to the selected English semantic delta;
- restore changed non-text scalar values and JSON value types;
- preserve established Chinese strings, localized display keys, `ENG_name`, `translator`, and unrelated user edits;
- translate newly added text later through the normal terminology and review workflow.

After each repair, parse the target and rerun strict comparison. Continue only after it exits `0`. If alignment is ambiguous enough that preserving existing translations cannot be guaranteed, stop and ask the user rather than overwriting the target.
