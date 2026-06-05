# Monster Repair Prompt

Use this prompt when:
- the existing creature converter has already produced an initial JSON object
- checker output indicates the result is incomplete or untrustworthy
- the goal is to repair or complete the existing result, not to replace it from scratch unless absolutely necessary

## Prompt Goals

The model should:
- preserve correct existing fields
- repair missing or malformed fields
- recover dropped `trait`, `action`, `reaction`, `bonus`, `legendary`, or `mythic` sections from the raw text when possible
- return a patch-oriented result
- include uncertainty notes for anything that still needs human review

## Constraints

- Do not invent content not supported by the raw text.
- Prefer small patches to full rewrites.
- Keep field names aligned with 5etools-style monster output.
- `action`, `trait`, `reaction`, `bonus`, `legendary`, and `mythic` entries must contain usable `entries`.
- If a field cannot be confidently repaired, leave it unchanged and report it under `manual_review`.

## Suggested Input Bundle

Provide the model with:
- raw creature text
- initial JSON
- converter warnings
- checker issues
- a short list of expected field constraints

## Suggested Output Shape

Ask for JSON only:

```json
{
  "patch": {
    "cr": "12",
    "legendary": [
      {
        "name": "Tail Attack",
        "entries": [
          "The dragon makes a tail attack."
        ]
      }
    ]
  },
  "manual_review": [
    "Spell names in the spellcasting trait may contain OCR errors."
  ],
  "confidence": 0.86
}
```

## Suggested Prompt Template

```text
You are repairing a partially converted 5etools-style monster JSON object.

Your job is to repair the existing result, not replace it unless repair is impossible.

Return JSON only with this shape:
{
  "patch": {...},
  "manual_review": [...],
  "confidence": 0.0
}

Rules:
- Preserve valid existing fields.
- Only patch fields supported by the source text.
- Do not invent unsupported mechanics.
- If uncertain, keep the field unchanged and mention the uncertainty in manual_review.
- Keep the patch compatible with 5etools-style monster structures.

Raw text:
{{RAW_TEXT}}

Initial JSON:
{{INITIAL_JSON}}

Warnings:
{{WARNINGS}}

Checker issues:
{{ISSUES}}

Expected constraints:
- name, type, ac, hp, speed, and cr are core fields
- action- and trait-like sections must contain usable entries
- legendary content should not be dropped if present in the raw text
```

## Escalation Rule

If the initial JSON is almost entirely unusable, the model may effectively reconstruct most of the monster, but it should still return the result as a `patch` object and list this in `manual_review`.
