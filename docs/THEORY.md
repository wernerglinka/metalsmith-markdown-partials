# Theory of Operation

This document explains how `metalsmith-markdown-partials` works and why it is
built the way it is. The README covers usage; this covers design.

## Problem

Long-form Markdown pages often repeat the same blocks of content (shared
callouts, boilerplate sections, reused prose). Markdown itself has no include
mechanism, so that content gets copy-pasted and drifts out of sync. This
plugin adds a marker syntax that pulls a separate partial Markdown file into a
page before the Markdown is rendered to HTML.

## Approach

A page places a marker of the form `{#md "partial-name.md" #}` wherever a
partial should be inserted. Partials live in their own library directory
(configured with `libraryPath`) inside the source tree. Processing has two
phases:

1. **Collect** (`getMarkdownIncludes`). Walk every source file whose name ends
   with `fileSuffix` and does not live in the partials library. For each
   include marker found, resolve the referenced partial by key
   (`<libraryName>/<markerFileName>`) and record the marker text together with
   the partial's contents. A marker whose partial is not found is logged and
   skipped rather than treated as fatal, because a missing partial is a
   localized authoring error. A `Set` keyed by `file:marker` prevents the same
   marker in the same file from being queued twice.
2. **Resolve** (`resolveMarkdownIncludes`). Replace each recorded marker in its
   file's contents with the partial's contents.

After collection, every file that belongs to the partials library is deleted
from the Metalsmith files object so the partials themselves are not emitted as
standalone pages.

## Why the suffix and library-name checks matter

`fileSuffix` exists because the meaningful extension depends on the rest of the
pipeline: a raw `.md` page, or `.md.njk` when metalsmith-in-place or
metalsmith-layouts run a templating pass. The plugin must match whatever the
page files are actually named at this point in the build. The
`!file.startsWith(libraryName)` check keeps the plugin from trying to process
the partials themselves, which also live under the source tree.

## Ordering

Because the plugin operates on raw Markdown contents (partials are Markdown,
not HTML), it must run **before** the Markdown-to-HTML step. Running it after
would splice Markdown into already-generated HTML, which the HTML renderer
would not process.

## Invariants and failure modes

- **Marker replacement is literal.** Replacement matches the exact marker
  string, so a partial name uniquely identifies its marker.
- **Buffer contents.** Files are read via `contents.toString()`; the collector
  skips any file whose `contents` is not a Buffer, guarding against malformed
  entries.
- **Errors propagate.** The plugin body is wrapped in try/catch and routes any
  throw to `done(err)` via `setImmediate`, so a failure fails the build rather
  than silently emitting an unresolved marker.
- **Partials are removed from output.** Every file under the library directory
  is deleted from `files` after collection, so partials never ship as pages.
- **No option mutation across runs.** Options are normalized into a fresh
  object per invocation via `{ ...defaults, ...options }`.
