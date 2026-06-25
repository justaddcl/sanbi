# ADR 0001: Chord Chart Source of Truth

Status: Accepted

Date: June 25, 2026

## Context

Sanbi songs currently hold first-party song metadata such as name, preferred
key, notes, tags, set history, and external resources. Chord charts add another
piece of song content that users need to edit, transpose, import, and export
inside Sanbi.

The first chord chart implementation needs a stable source model before storage,
API, editor, import, and export work begins. The model should support structured
editing and transposition without treating a rendered file or loosely spaced text
as the canonical record.

## Decision

Sanbi stores one primary editable structured chord chart per song.

The primary chart is first-party song content, owned by the song's organization
and edited in Sanbi. It stores chart structure, musical metadata, and chord
placement in an application-readable shape. Rendered files and imported source
materials are not the source of truth.

Generated PDFs are output-only. They may be produced from the primary chart for
printing, sharing, or download, but Sanbi does not store generated PDFs in v1.

Original uploaded PDFs are not stored in v1. If an import flow extracts text
from a source file, Sanbi may retain raw import text only as recovery and debug
context for that chart. Raw import text is not editable chart content and must
not be used as the rendering source when structured chart data exists.

Existing external song resources remain separate from chord charts. Song
resources continue to represent external links associated with a song. They do
not replace the primary chart and are not promoted into chord chart source data.

## Alternatives Rejected

### Store Uploaded PDFs as the Primary Chart

Uploaded PDFs preserve the user's source artifact, but they do not give Sanbi a
reliable editable structure for chord placement, transposition, key metadata, or
future chart rendering. Treating PDFs as primary content would make editing and
export behavior depend on document extraction instead of a first-party model.

### Store Generated PDFs as Canonical Content

Generated PDFs are useful artifacts, but they are snapshots of a chart at a
point in time. Making them canonical would duplicate state, complicate edits, and
force later features to reverse-engineer structure from output.

### Store Spacing-Only Chord Text as Canonical Content

Plain chord-over-lyric text is easy to paste, but spacing is fragile across
fonts, screen sizes, export formats, and transposition. Sanbi can import from
text, but the canonical chart needs structured anchors and metadata rather than
depending on column alignment.

### Use Existing Song Resources for Chord Charts

Resources already model external URLs for a song. Chord charts need
organization-owned editable content, not only a pointer to a third-party page or
file. Keeping the concepts separate preserves current resource behavior and
keeps chart APIs focused on first-party chart data.

## Consequences

- Chart persistence and APIs should enforce at most one primary chart per song.
- Importers should normalize imported material into structured chart content.
- Exporters should render from structured chart content, not from raw import
  text or a previously generated file.
- Raw import text, if retained, is for audit, troubleshooting, and recovery.
- OCR and capo-shape behavior are intentionally not specified here; future ADRs
  or implementation tickets should define those details when needed.
