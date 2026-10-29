# Changelog

Changes are documented newest first.

## 2026-10-29 — Added the latest Songs folder tracks

- Regenerated the manifest with the 17 newly added source files, bringing the catalog to 111 unique tracks.
- Added a content-hash check so two byte-identical audio copies remain in `Songs/` but appear only once in Popular and the library.
- Cleaned the new mythological/rap track titles and added Krishna and Hanuman tracks to their matching permanent playlists; expanded devotional, energetic, heartfelt, and positive mood matching.
- Added expected-title checks for the new catalog metadata.

## 2026-10-28 — Added the remaining Songs folder tracks

- Regenerated the manifest with 18 previously unlisted audio files, bringing the library to 96 songs with stable IDs, deployment-safe encoded paths, and recorded durations.
- Cleaned the new tracks' display titles while preserving their original filenames and audio assets.
- Added matching devotional tracks to the existing Krishna Kanhaiya, Jai Sri Ram, and Jai Hanuman permanent playlists and expanded mood matching for new mythological rap tracks.
- Added catalog title assertions for the new metadata overrides.

## 2026-10-28 — Refined discovery and player presentation

- Refined the dark interface with clearer hierarchy, calmer surfaces, more consistent spacing, and restrained teal interactions while retaining Tonearm's existing identity.
- Added mood-led discovery on Home and Search, including quick-search chips and richer matching across track metadata and mood terms.
- Improved responsive player controls, song-row states, and focus/hover feedback while preserving existing playback and playlist actions.
- Added reduced-motion support for the updated transitions.

## 2026-10-28 — Added a library refresh control

- Added a clearly labeled **Refresh library** button to desktop navigation and a matching accessible refresh icon beside the Tonearm logo on mobile.
- The control reloads the current static site build so the page reads the latest deployed song manifest; it does not claim to monitor the local filesystem.

## 2026-10-28 — Cleaned song display titles

- Added maintainable filename-specific metadata overrides for imported files whose tags or filenames contained download-site noise, redundant movie labels, or inconsistent capitalization.
- Corrected display titles including **Bhaktambar**, **Hanuman Aura**, **Hanuman Chalisa**, **Lakshya**, **Shiv Tandav Stotram**, **Unstoppable**, and **Ziddi Dil**; corrected matching album labels where their embedded values were download-site names.
- Added Knowledge of Krishna and Hanuman Aura to their matching permanent devotional playlists; both are also included in Devotional & Spiritual.
- Kept audio filenames and stable IDs unchanged. Added verifier assertions for the corrected titles.
- Regenerated the manifest and verified all 78 current files. Playback behavior was not tested in a browser.

## 2026-10-28 — Added the remaining Songs folder tracks

- Regenerated `songs-manifest.js` from the current `Songs/` folder and added 10 previously unlisted files; Popular now contains all 78 available audio files.
- Added Hanuman Chalisa to the protected Jai Hanuman playlist and devotional mood mix.
- Added Shiv Tandav Stotram and Bhaktambar to Devotional & Spiritual; added Aashayein, Kar Har Maidaan Fateh, Lakshya, Unstoppable, and Ziddi Dil to Energetic & Powerful and Happy & Positive.
- Preserved existing track IDs and addition timestamps; the manifest generator derived stable IDs, filename-based titles where tags were unavailable, and durations.
- The two files named with Android storage paths remain available in Popular; their actual titles cannot be inferred reliably from the filenames.
- Catalog and exact-case artwork/brand checks pass for 78 files. Browser playback was not run in this change.

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
