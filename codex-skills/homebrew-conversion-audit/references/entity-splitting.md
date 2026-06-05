# Entity Splitting

Prefer letting the current Codex conversation identify entity boundaries and types from extracted document blocks.

## Why

Rule-based splitting is brittle when:
- stat blocks appear in the middle of narrative text
- documents mix adventure prose with monster, item, spell, or table content
- headings and typography vary across user-supplied Word and PDF files
- the same entity type appears in multiple layout styles

## Preferred Flow

1. Use `extract-input.js` to normalize the source into `blocks`.
2. Use `prepare-entity-bundle.js` to package:
   - block summaries
   - heading index
   - source metadata
   - expected entity-plan shape
3. Have the current Codex conversation return an `entityPlan`.
4. Pass that `entityPlan` to `split-entities.js`.
5. Only use script-side fallback detection when no Codex plan is available.

`monster`, `spell`, and `item` are mandatory split entities when they appear as standalone reference content. Do not leave their full statblocks or rules blocks only inside adventure prose, appendices, or generic entries. If they are found while building an adventure, the final output should be a collection containing the adventure plus those top-level entities.

Current script-side fallback can conservatively detect:
- `monster` sections with multiple statblock signals
- `spell` sections with casting-time/range/components/duration structure
- `item` sections with rarity/type/attunement structure

Fallback detection should be treated as a safety net, not the preferred classification source.

## Preferred Kind Labels

When returning an `entityPlan`, prefer these `kind` values when they fit:
- `adventureDocument`
- `monster`
- `spell`
- `item`
- `feat`
- `background`
- `language`
- `reward`
- `race`
- `deity`
- `subclass`
- `table`
- `unknown`

Use `unknown` rather than guessing when a block is not clearly independently convertible.

## Expected Entity Plan

```json
{
  "entities": [
    {
      "kind": "adventureDocument",
      "title": "Silent Elegy",
      "startBlock": 0,
      "endBlock": 120,
      "role": "document",
      "confidence": 0.96
    },
    {
      "kind": "monster",
      "title": "False Hydra",
      "startBlock": 121,
      "endBlock": 129,
      "role": "embedded",
      "confidence": 0.99
    },
    {
      "kind": "spell",
      "title": "Sending",
      "startBlock": 130,
      "endBlock": 136,
      "role": "embedded",
      "confidence": 0.92
    },
    {
      "kind": "item",
      "title": "Two-way Mirror",
      "startBlock": 137,
      "endBlock": 142,
      "role": "embedded",
      "confidence": 0.9
    }
  ],
  "notes": [
    "The monster is embedded in the appendix, but should be converted separately."
  ]
}
```

## Boundaries

- Use block indexes, not character offsets.
- Prefer conservative boundaries.
- Include the heading block for standalone entities whenever possible.
- If several standalone `monster`, `spell`, or `item` blocks are packed into one extracted paragraph/block, split them into separate entity candidates before final build. Replace the packed raw text in `adventureData` with schema-valid references/statblock entries, and do not accept a final collection which only preserves them as raw paragraph text.
- Do not split ordinary narrative subsections into standalone entities unless they are independently convertible.
- Mentions such as "the villain uses the Fireball spell" or "the room contains a Bag of Holding" do not need standalone conversion unless the source includes the actual spell/item/monster rules block.
- For `feat`, `background`, `language`, `reward`, `race`, `deity`, and `subclass`, prefer splitting only when the section is clearly a self-contained reference block rather than ordinary discussion of that entity.
