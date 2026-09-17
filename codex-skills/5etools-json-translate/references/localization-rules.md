# 5etools Chinese JSON localization rules

## Preserve data semantics

- Never translate JSON keys, schema discriminators, source abbreviations, IDs, URLs, filenames, dice expressions, numeric formulas, or other machine identifiers unless the existing Chinese counterpart proves that field is localized.
- Keep booleans, numbers, `null`, array/object shape, and tag grammar unchanged.
- In 5etools tags such as `{@spell ...}` or `{@item ...}`, preserve the tag type, delimiters, pipe-field count, source code, and other routing metadata. Translate the entity text or display segment according to existing Chinese data so the resulting link resolves.
- Preserve `_copy`, `_mod`, UID components, lookup keys, and reference structure. Translate a referenced name only when the corresponding Chinese dataset uses translated names in that position.

## Names and prose

- Follow the selected target's conventions. This repository normally keeps the original English name in `ENG_name` when a localized object name is stored in `name`; do not add parallel English fields that surrounding objects do not use.
- Reuse established names exactly, including punctuation, source suffixes, capitalization of source codes, and chosen transliterations.
- Translate prose naturally into Simplified Chinese while preserving rules meaning, defined-term distinctions, measurements, conditions, action economy, dice notation, and explicit exceptions.
- In every newly translated or revised Chinese natural-language string, use Chinese double quotation marks `“……”`. For a quotation nested inside double quotation marks, use Chinese single quotation marks `‘……’`. Do not use ASCII straight double or single quotes as Chinese prose quotation marks, even when the English source or surrounding legacy translation does so.
- The Chinese-quotation rule applies to human-readable prose, dialogue, localized names, headings, captions, and display text. It does not change JSON's ASCII syntax delimiters or literal content inside 5etools tag grammar, code, commands, formulas, dice expressions, IDs, source codes, URLs, filenames, or other machine-readable tokens. Do not perform a blind whole-file quote replacement.
- Do not silently omit repeated sentences, examples, table cells, captions, footnotes, or nested entries that are in scope.
- Keep proper nouns untranslated only when references and repository usage support that choice.

## Incremental alignment

- A line diff is evidence of source change, not necessarily a one-to-one target line map. Reconstruct the semantic change from the old English object and current English object.
- Case-only changes to machine references may require structural mirroring rather than prose translation.
- When an English entity changed but its established Chinese text also contains deliberate local additions, merge the new meaning without erasing those additions unless they contradict the new source.
- For moved but unchanged entities, move the Chinese counterpart without retranslating it.
- For deleted entities or fields, remove only the matched Chinese counterpart.

## Evidence and uncertainty

- Query full phrases. Do not split a multiword rules term unless separately investigating its components.
- A high lookup score is a ranking signal, not certainty. Check entity category, source, context, and conflicts.
- If references disagree, prefer explicit user-provided material and the same entity's established target usage; document a consequential unresolved choice.
