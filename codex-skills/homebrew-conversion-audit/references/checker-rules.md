# Checker Rules

Use checker rules after the existing converter produces an initial JSON object.

The checker has two layers:
- schema checks
- semantic checks

Schema checks determine whether the JSON is structurally valid.
Semantic checks determine whether the conversion is likely correct enough to trust.

## Severity

Use these severities:
- `error`: output is not trustworthy; LLM repair should run
- `warn`: output may be usable, but review or conditional repair is needed
- `info`: low-risk note; do not trigger repair by itself

## General Rules

Trigger `error` if any of the following are true:
- the JSON cannot be parsed
- schema validation fails
- the entity is missing required identifying fields such as `name` or `source` when they should exist
- the converter produced no meaningful body content for a non-empty input
- a top-level section was obviously dropped

Trigger `warn` if any of the following are true:
- the structure is valid but contains suspicious empty arrays or empty `entries`
- source/page/title metadata is incomplete but recoverable
- warnings indicate partial manual conversion may still be needed

## Warning Classification

Treat these warning patterns as high-risk:
- `无法自动转换`
- `requires manual conversion`
- `内容因无法识别分类而丢弃`
- `请检查CR`
- `转换AC`
- `属性值格式错误`

Treat these warning patterns as medium-risk:
- tagging failures where the base text still exists
- passive or initiative formats which may still be manually understandable
- missing optional metadata

High-risk warnings should usually trigger `error` if they affect a core field or a dropped content block.

## Monster MVP Rules

For `monster`, trigger `error` if any of the following are true:
- missing `name`
- missing `type`
- missing `ac`
- missing `hp`
- missing `speed`
- missing `cr`
- fewer than six ability scores are present unless the creature explicitly uses `special` ability values
- raw text contains `Actions`, `动作`, `Traits`, `特质`, `Legendary Actions`, or `传奇动作`, but the corresponding output section is missing
- any action, trait, reaction, bonus action, legendary action, or mythic action has empty or missing `entries`
- output contains obviously malformed mixed structures, such as a header object with no usable body

For `monster`, trigger `warn` if any of the following are true:
- `languages` is absent even though the block likely contains language text
- `senses` exists but `passive` is absent and the raw text likely includes passive perception
- the converter preserved suspicious untranslated raw fragments in key fields
- spellcasting content exists but parsing or tagging looks partial

## Spell MVP Rules

For `spell`, trigger `error` if any of the following are true:
- missing `name`
- missing `level`
- missing `school`
- missing `time`
- missing `range`
- missing `duration`
- missing or empty `entries`
- `level` is present but not an integer

For `spell`, trigger `warn` if any of the following are true:
- raw text contains `At Higher Levels`, `升环施法`, or `升环施法效应`, but output is missing `entriesHigherLevel`
- raw text contains `Components`, `法术成分`, or `成分`, but output is missing `components`
- the base structure exists but class lists or ritual markers look partially preserved as raw text

## Item MVP Rules

For `item`, trigger `error` if any of the following are true:
- missing `name`
- missing or empty `entries`

For `item`, trigger `warn` if any of the following are true:
- the output has no obvious classification fields such as `type`, `rarity`, `wondrous`, `staff`, or `itemGroup`
- raw text says `requires attunement`, but output is missing `reqAttune`
- the converter preserved suspicious raw rarity/type fragments in the tagline

## Collection-Oriented Rules

When assembling collection-style output, additionally check:
- entities are grouped under the correct top-level array
- referenced features actually exist
- `_meta.sources` contains any new source identifiers used by emitted entities
- there are no duplicate `(name, source)` pairs in the same top-level entity array

If collection assembly fails but individual entities are valid, do not discard the entities. Emit valid entities plus a collection assembly report.

## Repair Trigger Policy

Recommended policy:
- any `error` => run LLM repair
- only `warn` => run LLM repair if the warning affects core fields, dropped sections, or collection references
- only `info` => do not run repair

## Output Shape

Recommended checker output:

```json
{
  "ok": false,
  "needsLlm": true,
  "issues": [
    {
      "code": "MISSING_CR",
      "severity": "error",
      "field": "cr",
      "message": "Creature is missing CR"
    }
  ]
}
```
