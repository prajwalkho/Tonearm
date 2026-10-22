# Tonearm — Future Improvements

**Updated:** 15 October 2026  
**Purpose:** A practical, traceable guide to improvements for the next Tonearm releases. This document distinguishes implemented changes from future proposals. Proposed items should be reviewed before they are expanded into new product behavior.

## Product direction

Keep Tonearm a lightweight static music player. Improve confidence in the song catalog, playback, keyboard access, playlist portability, and mobile usability before considering a framework or server. `Songs/` remains the source of truth; the generated manifest remains the browser's catalog. The browser cannot watch a deployed folder at runtime, so new or removed songs become visible after the manifest is regenerated and the updated site is deployed.

## Implemented in this improvement pass

| ID | Improvement | What changed | How to confirm |
| --- | --- | --- | --- |
| FI-01 | Keyboard song-row activation | Song rows now receive keyboard focus and Enter/Space starts that row's song. A visible focus ring is shown. Nested buttons and links retain their own actions. | Tab to a song row, press Enter or Space, then verify the selected song is shown in the player. |
| FI-02 | Static catalog and asset release gate | The existing verifier now checks exact-case paths for active playlist artwork, brand logo, director artwork, and favicon in addition to manifest parity and song files. A GitHub Actions workflow runs it on pushes and pull requests. | Review the “Catalog and asset check” workflow; a missing file or case mismatch should fail its job. |
| FI-03 | Actual app player verification | Added a dependency-free, same-origin audit page that embeds Tonearm, observes its real media element and app UI, records song-row and keyboard selection, Play/Pause, seek, Next/Previous, volume, shuffle/repeat state, audio errors, script errors, and unhandled rejections, and exports results as JSON. The static gate also checks that its page and script are present, and CI parses the script. | Serve the project root, open `scripts/app-player-check.html`, start recording, then operate the embedded player. This recorder has not been run in a browser as part of this change. |

These changes do not add a backend, dependency, or change the Tonearm visual identity. The workflow checks catalog/filesystem consistency. The app audit page records real user-driven app behavior but is not unattended automation and does not replace cross-browser or deployed-site testing.

## Recommended future work

Priorities refer to release risk: **P0** blocks a reliable release, **P1** improves core confidence, **P2** improves usability, **P3** is optional polish. Effort estimates are relative, not calendar estimates.

| ID | Priority | Improvement | Current evidence / gap | Proposed outcome | Effort | Dependency | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FI-04 | P0 | Deployed-site smoke check | Static file checks cannot prove that the hosted site serves the whole catalog correctly. | Add a release checklist against the deployed URL, including deep-link refresh, audio requests, image requests, console, and playback. | Low | Deployment URL and browser access. | Evidence is recorded per release; zero missing local requests or unhandled app errors. |
| FI-05 | P1 | Playback status and recovery | Playback behavior is source-inspected, but loading/error/race recovery has not been exercised end-to-end. | Use the app audit page and, if failures are found, improve loading feedback, stale-event protection, missing-file recovery, queue edges, shuffle, and repeat behavior. | Medium | FI-03 and agreed queue edge rules. | Each critical player test passes; a failed song does not block playing another available song. |
| FI-06 | P1 | Playlist backup reliability | Permanent playlists are stored per origin in browser `localStorage`; JSON export/import exists. | Test invalid backups, duplicate IDs, storage disabled/quota limits, browser profile changes, and refresh behavior; improve messages where needed. | Medium | Agree exact lifetime of a browser session and import conflict rules. | Valid backup round-trip preserves user playlist data; invalid input cannot corrupt saved playlists; storage failures are explained. |
| FI-07 | P1 | Accessibility audit | Song rows are now keyboard-operable; the rest of the app still needs a keyboard/screen-reader review. | Verify player controls, dialogs, dynamic status, focus restoration, contrast, range input labels, and reduced-motion behavior. | Medium | Screen reader and browser/viewport matrix. | No keyboard trap; focus is visible; controls have names/states; dialogs return focus; reduced motion removes nonessential motion. |
| FI-08 | P2 | Song metadata and duration quality | Catalog metadata is generated from tags or filenames; some audio formats rely on browser metadata for duration. | Inventory missing/incorrect tags and compare generated durations with browser metadata before changing metadata policy. | Medium | A reviewed per-song exception/metadata format. | Every catalog item has a useful title, artist, stable ID, valid relative path, and verified duration or a clearly handled unknown value. |
| FI-09 | P2 | Mobile and responsive verification | CSS contains desktop, tablet, and mobile breakpoints but has not been checked on actual target devices in this study. | Test touch targets, player controls, row actions, safe areas, zoom, overflow, and orientation at the documented viewport sizes. | Low | Test device/emulator matrix. | No horizontal overflow or obscured controls at agreed sizes; core player and playlist actions remain usable. |
| FI-10 | P2 | Search and mood discovery accuracy | Search and generated mood membership are based on current matching rules; classifications may not express a listener's intent. | Gather real search examples and review mood matches; promote stable, human-reviewed mood tags instead of expanding heuristics blindly. | Medium | Song owner review of classification rules. | Approved examples return expected results; unavailable IDs never appear; playlist artwork remains fixed. |
| FI-11 | P3 | Artwork payload optimization | Several supplied artwork images are large. | Measure actual load impact first, then create optimized derivatives only if needed while preserving supplied originals and visual consistency. | Medium | Deployed network/performance baseline and asset licensing/quality decision. | Measured transfer or decode improvement without visible quality loss or altered artwork assignments. |
| FI-12 | P3 | Incremental code modularization | Application logic/styles are concentrated in `index.html`. | Extract only repeated or independently testable modules after UI behavior is covered. Keep `index.html` as the deployment entry point. | High | FI-03 and a stable build/check process. | No feature regression; root entry still deploys statically; modularity demonstrably improves review/testing. |
| FI-13 | Future decision | Cross-device playlist sync | There is no server/database; local permanent playlists are browser/origin scoped. | Only design a service if the owner confirms that syncing across devices is a product requirement. | High | Explicit product approval, privacy/security design, hosting and operating plan. | A separately reviewed SRS and threat/privacy assessment exist before implementation. |

## Suggested implementation sequence

1. Use the catalog and exact-case asset gate already added in this pass.
2. Use the new app-level recorder against the actual UI; agree on supported browsers and queue boundary behavior before selecting any unattended automation runner.
3. Run a deployed-site smoke check and record findings before claiming production playback support.
4. Test playlist export/import and storage failure behavior; update wording and recovery only where tests expose problems.
5. Complete accessibility and responsive reviews using real target devices or documented emulators.
6. Review metadata, search/mood accuracy, and image payloads with evidence before changing data or artwork.
7. Consider modularization or server-side sync only when demonstrated requirements justify the added complexity.

## Release evidence checklist

- [ ] GitHub catalog and asset workflow passes for the release commit.
- [ ] `Songs/` and `songs-manifest.js` are in sync; no unsupported or missing song path is published.
- [ ] All per-track browser checks and actual player UI checks have named results; unrun checks remain marked untested.
- [ ] Permanent curated playlists, user playlist persistence, temporary behavior, and export/import are checked.
- [ ] Keyboard/accessibility and responsive checks are recorded for agreed browser/device combinations.
- [ ] Deployed URL refreshes and all local audio/artwork requests succeed; console observations are recorded.
- [ ] Any exception has an owner-approved disposition and a linked issue.

## Related project documents

- [System study](SYSTEM_STUDY.md) — current evidence and findings.
- [System design](SYSTEM_DESIGN.md) — existing architecture and data boundaries.
- [SRS](SRS.md) — proposed and traceable requirements.
- [Improvement backlog](IMPROVEMENT_BACKLOG.md) — actionable work items.
- [Roadmap](IMPROVEMENT_ROADMAP.md) — phase and dependency view.
- [Test plan](TEST_PLAN.md) — scenario steps and execution status.
- [Traceability matrix](TRACEABILITY_MATRIX.md) — requirements-to-evidence map.
