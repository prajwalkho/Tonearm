# Changelog

Changes are documented newest first.

## 2026-10-15 — Reliability and accessibility improvement

- Made song rows keyboard focusable and playable with Enter or Space, with a visible focus indicator. Existing nested buttons and links retain their separate actions.
- Extended `scripts/verify-catalog.mjs` to check exact-case paths for active playlist artwork, brand logo, director artwork, and favicon, in addition to the song manifest and files.
- Added a GitHub Actions catalog/static-asset check for pushes and pull requests.
- Added `FUTURE_IMPROVEMENTS.md` with implemented work, proposed improvements, sequencing, dependencies, and release evidence criteria.
- Added a no-dependency, same-origin app-player interaction recorder with JSON export and visible observed results; CI also checks its local assets and JavaScript syntax.
- No backend, dependency, or visual redesign was introduced.

## 2026-10-15 — Expanded analysis and traceability package

- Added a fact-based existing-system study, including the limitation that the supplied live website could not be accessed with the available web inspector.
- Added a proposed SRS, system design, phased roadmap, and requirement traceability matrix; all new requirements remain unapproved until reviewed.
- Added UX specification, prioritized improvement backlog, and test plan with explicit test evidence status rules.
- Updated README to serve as the project/documentation entry point and explain the existing static workflow.
- No song manifest, audio, or artwork files were changed.
