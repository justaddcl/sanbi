# Chord Chart Glossary

This glossary defines the shared terms for Sanbi chord chart persistence, API,
editor, import, and export work.

## Primary Chart

The single editable structured chord chart stored for a song. It is first-party
Sanbi song content and is the source of truth for rendering, editing,
transposition, and exports. In v1, a song has at most one primary chart.

## Source Key

The musical key the primary chart is authored in or imported as. Chord anchors
and number notation are interpreted relative to this key unless a workflow
explicitly says otherwise.

## Target Key

The key a user wants to view, print, or export the chart in. The target key is an
output setting for transposition and does not replace the source key stored on
the primary chart.

## Chord Anchor

A structured chord placement attached to a position in chart content. An anchor
records where a chord belongs relative to a lyric, section, or line position so
Sanbi can render and transpose the chart without relying on fixed-width spacing.

## Chord-Only Line

A chart line that contains chords without lyric text. It represents musical
content such as intros, instrumental sections, turnarounds, or tags where the
player needs chords but there are no sung words on that line.

## Raw Import Text

The unstructured text captured during an import before Sanbi normalizes it into
the primary chart. Raw import text may be retained only for recovery, audit, or
debugging. It is not the editable chart model and should not be used as the
rendering source when structured chart content exists.

## Number Notation

A chord representation that uses scale degrees relative to the source key,
instead of absolute chord names. Number notation lets the same chart describe
harmonic movement independent of the final target key.

## Capo Metadata

Optional information about how a chart should be played with a capo, such as
capo position or display preference. This term names the metadata boundary only;
v1 docs do not define capo-shape conversion rules or OCR behavior.

## Generated PDF

An output file rendered from the primary chart for printing, sharing, or
download. Generated PDFs are not stored by Sanbi in v1.

## Original Uploaded PDF

A source file a user provides for import. Original uploaded PDFs are not stored
by Sanbi in v1.

## External Song Resource

An existing Sanbi song resource that points to an external URL associated with a
song. External resources remain separate from chord charts and do not become the
primary chart.
