# Translation consistency subagent review

Use this gate after every batch that adds, changes, or removes translatable target content, including Chinese prose, names, tag display text, and numbers or game-mechanical text embedded in translated fields. The reviewer is an independent checker, not a second editor. Every round reviews the complete cumulative translation scope since the task began, not only the latest patch.

## Start a fresh reviewer

Spawn one fresh subagent for each review round. Give it only the raw review inputs and these instructions; do not include the main agent's intended answer, translation rationale, suspected mistakes, or proposed fixes.

Provide:

- the selected `data-bak/**/*.json` source path;
- the mapped `data/**/*.json` target path;
- the exact English Git diff that defines scope;
- the exact target diff/status captured before the task's first edit, as the user-owned baseline;
- the current target diff, with the cumulative task translation changes distinguished from that baseline;
- all user-supplied reference paths;
- `references/localization-rules.md`;
- for a bestiary source, `references/bestiary-xmm-style.md` and the XMM lookup command;
- the terminology lookup command in `scripts/lookup_reference.py`.

Retain the task-start baseline for every review round. Comparing that baseline with the current target state is authoritative for separating pre-existing user work from cumulative task changes; do not claim that ordinary `git diff` alone isolates the latest round.

If a repeated issue has already received a binding adjudication under the rules below, also provide the adjudication's exact location, chosen translation, controlling raw evidence or user decision, and evidence-priority reason. Do not provide unrelated translation rationale or suspected findings.

The reviewer may read repository files and run read-only searches or lookup commands. It must not edit any file, run formatters, run builds/tests, update terminology stores, or expand the translation scope.

## Review task

Ask the reviewer to check every cumulative translatable change in the current task scope, including additions, replacements, and deletions, for:

1. meaning omitted, added, weakened, strengthened, or incorrectly removed relative to the current English source;
2. inconsistent names or fixed terms compared with user references, the corresponding historical target, or applicable terminology candidates, using the skill's evidence priority;
3. inconsistent repeated translations inside the same target;
4. mistranslated 5etools tags, display text, source suffixes, `ENG_name`, numbers, dice, distances, target counts, timing, recharge/usage counts, damage types, conditions, or action economy;
5. for `data-bak/bestiary/`, disagreement with repeated mechanically equivalent XMM usage, excluding obvious XMM copy, numeric, or duplication errors;
6. untranslated English that should be Chinese, or Chinese applied to a machine identifier that should remain unchanged.
7. ASCII straight quotes used as quotation punctuation in newly translated or revised Chinese natural-language text; require `“……”`, with nested quotations written as `‘……’`, while leaving JSON syntax and literal machine content unchanged.

Require full-phrase terminology queries for material names and rules terms. A lookup hit is evidence, not proof: the reviewer must account for category, source, conflict flags, user references, and local context.

Do not report subjective stylistic preferences without reference or terminology evidence. Do not ask for changes outside the English semantic delta.

## Required response

The reviewer returns exactly one of these outcomes:

```text
PASS
Checked: <brief scope summary>
Evidence: <references and lookup sources actually checked>
Adjudications honored: <none, or stable locations>
```

or:

```text
CHANGES_REQUIRED

1. Location: <JSON pointer or stable entity/field path>
   English: <relevant source text>
   Current Chinese: <current translation>
   Recommended Chinese: <specific correction, when evidence supports one>
   Evidence: <reference path, terminology candidate/source, historical target, or XMM example>
   Reason: <precise inconsistency>
   Confidence: high|medium
```

Every finding must identify a stable location and concrete evidence. The reviewer should omit low-confidence speculation; genuine reference conflicts may be listed separately as `CONFLICT` with both sources and no forced recommendation.

## Main-agent handling

The main agent owns all edits.

1. Verify each finding against the live source, target, and cited evidence.
2. Apply findings supported by the evidence. Do not mechanically accept a recommendation that changes game mechanics or violates a higher-priority user reference.
3. Record a concise reason for rejecting any finding so it is not silently ignored.
4. Any accepted correction starts a new translation round; spawn a different fresh reviewer after reparsing JSON.
5. The gate passes only when the latest reviewer returns `PASS`, honors any supplied binding adjudications, and leaves no unresolved high-confidence finding.

If the same disputed finding repeats after two review rounds, perform one direct adjudication using the cited raw evidence. If the evidence is genuinely ambiguous and the choice materially affects terminology, ask the user; otherwise choose the highest-priority supported translation. Record the location, chosen translation, controlling evidence, and priority reason as a binding adjudication. Supply that narrow record to later reviewers; they must not re-raise the same wording unless new contradictory raw evidence appears or the adjudicated text changes game mechanics. The latest reviewer must still return `PASS` for all remaining content and confirm that it honored the adjudication. Record adjudications in the handoff; do not loop indefinitely.

If a reviewer fails or times out, retry once with a fresh subagent. If no reviewer can complete, do not silently substitute a main-agent self-review or claim the gate passed; report that the required independent review could not be completed.
