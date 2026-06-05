# Input Formats

This workflow accepts:
- `raw text`
- `md`
- `docx`
- `doc`
- `pdf`
- partially converted `json`

The goal of extraction is not to fully parse the content. The extractor should preserve enough structure for later splitting, converter selection, validation, and repair.

After extraction, the splitter should treat the document as potentially containing:
- one primary document-level entity such as an `adventure`-like text body
- zero or more embedded standalone entities such as `monster`, `item`, or `spell`

Standalone entities should be detected as early as possible, before collection assembly, because they may appear anywhere in the source document rather than only in appendices.

## Normalized Document Shape

Preferred extracted shape:

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

## Format Rules

### Raw Text

- Treat each non-empty line or paragraph as text input.
- Preserve obvious blank-line paragraph boundaries.
- Do light whitespace cleanup only.

### Markdown

- Preserve headings, paragraphs, list items, code fences, and tables where practical.
- Do not flatten headings or list items into plain paragraphs too early.

### DOCX

Preserve as much structure as is practical:
- heading levels
- paragraphs
- bullet/numbered list items
- tables
- inline emphasis when it likely signals subheaders

DOCX is usually the highest-quality rich-text input.

Current implementation note:
- extraction uses `unzip` to read `word/document.xml` and `word/styles.xml`
- heading and list detection is best-effort, not perfect OOXML reconstruction

### DOC

- Prefer converting to a more parseable intermediate form before normalization.
- Record reduced confidence in `meta.extract_quality` if structure is degraded.
- Current implementation does not extract `.doc` directly; convert to `.docx` or plain text first.

### PDF

Distinguish between:
- text PDFs
- scan/OCR PDFs

For PDF extraction, preserve:
- page boundaries
- column ordering when detectable
- table-like regions
- OCR confidence when available

If page or OCR ordering is unreliable, note it in `meta`.

Current implementation note:
- PDF extraction is not implemented in the current environment unless an external extractor is added separately.

### JSON

If the input is already JSON:
- detect whether it is final output, partial output, or collection-shaped
- skip converter parsing when appropriate
- still run validation and repair if requested

## Extraction Quality

Use `meta.extract_quality` to signal trust level:
- `high`
- `medium`
- `low`

Lower extraction quality should make later validation stricter and make manual review notes more likely.
