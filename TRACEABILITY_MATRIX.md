# Tonearm Music Player — Requirements Traceability Matrix

**Version:** 0.1 proposal · **Date:** 15 October 2026  
**Status:** Source mapping is based on code inspection. Test status is **Not tested** unless a real executed result is recorded below. The available catalog verification is a limited static check, not a full application test.

## Status definitions

- **Source verified:** corresponding implementation is visible in the checked-out code; runtime behavior is not thereby proven.
- **Partial:** some behavior exists, but the full proposed requirement is absent or needs runtime validation.
- **Gap / proposed:** the proposed behavior is not fully present in the inspected source.
- **Not tested:** no execution evidence for the linked test case in this study.

## Functional requirement traceability

| Requirement | Source component / evidence | Related test cases | Implementation status | Test status |
| --- | --- | --- | --- | --- |
| FR-001 | `catalogFromManifest`, `TRACK_BY_ID`, `TRACK_BY_FILE` in `index.html` | CAT-01, CAT-05 | Source verified | Not tested in this study |
| FR-002 | `builtInPlaylists()` creates Popular from `TRACKS.map(track => track.id)` | CAT-01, CAT-03, CAT-04 | Source verified | Not tested in this study |
| FR-003 | `scripts/song-catalog.mjs`, `scripts/generate-song-manifest.mjs`, `scripts/verify-catalog.mjs` | CAT-01–CAT-05 | Source verified | CAT-01 was previously recorded as passing on 13 Oct 2026; rerun for release |
| FR-004 | Manifest mapping, `trackRow()`, `playerHTML()` | CAT-03, AUD-01 | Partial: title/credit/date are source-rendered; runtime image/player state not tested | Not tested |
| FR-005 | `trackRow()` click delegation, focusable group semantics, Enter/Space activation, explicit title play button | AUD-01, AUD-02, UX-01 | Implemented in source; child actions remain separate | Not browser-tested |
| FR-006 | `P`, `playerHTML()`, action map `A`, `syncPlayer()`; app-level recorder observes actual media/control state | AUD-03–AUD-08, AUD-11–13 | Source verified for controls; recorder implemented | Not browser-tested |
| FR-007 | Range input `#sk`, `P.seek()`, `aria-valuetext` | AUD-04 | Source verified | Not tested |
| FR-008 | `P.start()` request counter, audio source assignment, `syncPlayer()` | AUD-09 | Partial: promise race guard exists; complete event race behavior unverified | Not tested |
| FR-009 | Audio `error` listener and `toast()` | AUD-10 | Partial: generic audio error response exists; recovery/accessibility behavior unverified | Not tested |
| FR-010 | `P.next()`, `P.prev()`, shuffle/repeat state | AUD-06–AUD-08, AUD-11 | Source verified; edge semantics need product confirmation | Not tested |
| FR-011 | `CURATED_PLAYLISTS`, `isPermanentPlaylist()`, `renpl`, `delpl`, playlist artwork mapping | PL-01, PL-02, PL-07 | Source verified | Not tested |
| FR-012 | `playlistForm()`, rename/delete actions, `addPlaylistSong()` | PL-03–PL-08 | Source verified | Not tested |
| FR-013 | `persist()`, `STORE_KEY`, user playlist import/export | PL-03, PL-09, REL-03 | Source verified for same-origin storage; portability is manual | Not tested |
| FR-014 | `sessionStorage` playlist key and `S.temporaryAdds` | PL-04–PL-06 | Partial: implementation exists; exact browser session lifecycle needs confirmation | Not tested |
| FR-015 | `validIds()`, playlist filtering, manifest-based catalog startup | CAT-04, PL-07 | Partial: filters on current page startup; no live filesystem watcher by design | Not tested |
| FR-016 | `MOOD_PLAYLISTS`, `moodPlaylistTracks()` | PL-10 | Source verified for regex/seed generation; classification accuracy not assessed | Not tested |
| FR-017 | `V.results()` | NAV-02, NAV-03 | Source verified for current fields; normalization/filter proposal remains open | Not tested |
| FR-018 | `PLAYLIST_ARTWORK`, `playlistCover()`, delegated image error fallback | CAT-06 | Source verified for mapping/fallback logic | Not tested |
| FR-019 | `exportPlaylists()`, `importPlaylists()` | PL-09, REL-03 | Source verified | Not tested |
| FR-020 | `youtubePromo()` exact link and `rel="noopener noreferrer"` | REL-01 | Source verified | Not tested |
| FR-021 | CSS breakpoints and mobile bottom navigation | UX-04, UX-05 | Source verified for responsive rules; visual fit not tested | Not tested |
| FR-022 | `prefers-reduced-motion` styles and visualizer guard | UX-03 | Source verified | Not tested |
| FR-023 | No library sort/filter controls found in `V.library()` | NAV-04 | Proposed gap; pending owner decision | Not tested; optional |

## Non-functional requirement traceability

| Requirement | Implementation/evidence | Test cases / measurement | Status | Test status |
| --- | --- | --- | --- | --- |
| NFR-001 | Large media/art assets are present; lazy image rendering is coded | DEP-02 plus network/Lighthouse baseline | Not measured | Not tested |
| NFR-002 | `P.start()` loading state and browser audio promise | AUD-03, AUD-09; measure elapsed time | Partial | Not tested |
| NFR-003 | Catalog verifier checks manifest parity, selected durations, and exact-case active artwork/logo/artist/favicon paths; GitHub workflow runs it on pushes and pull requests | CAT-01, CAT-05, REL-01 | Static release gate implemented; no console E2E gate | CAT-01 passed 15 Oct 2026 including 13 active playlist artwork files and brand assets; runtime cases not tested |
| NFR-004 | No automated browser matrix found in repository | AUD-12, DEP-01 | Gap / proposed | Not tested |
| NFR-005 | Labels, focus styles, range text, reduced-motion handling exist in source | UX-01–UX-05 | Partial: source features exist; WCAG conformance unverified | Not tested |
| NFR-006 | CSS breakpoints at 1024, 700, and 390 px | UX-04, UX-05 | Partial: rules exist; viewport rendering unverified | Not tested |
| NFR-007 | Versioned JSON export/import with validation/filtering | PL-09, REL-03 | Source verified | Not tested |
| NFR-008 | Small dependency-free catalog scripts; UI concentrated in one file | CAT-02, code review | Partial: workflow is documented; maintainability target not measured | Not tested |
| NFR-009 | No backend identified; playlist data held in browser storage; outbound YouTube link exists | DEP-02, REL-01, REL-03 | Source verified for local storage design; runtime network not inspected | Not tested |
| NFR-010 | `vercel.json` publishes root with no build command | DEP-01, DEP-02, REL-04 | Source verified; deployed hosting not verified | Not tested |

## Audit finding traceability

| Audit finding | Requirements affected | Backlog item(s) | Test evidence needed |
| --- | --- | --- | --- |
| FIND-01 live deployment unavailable | NFR-003, NFR-004, NFR-010 | BL-13 | DEP-01, DEP-02 on deployed URL |
| FIND-02 static manifest update | FR-001–FR-003, FR-015 | BL-01 | CAT-01–CAT-05 |
| FIND-03 origin-scoped storage | FR-013–FR-014, FR-019, NFR-007/NFR-009 | BL-04, BL-12 | PL-03/04/09, REL-02/03 |
| FIND-04 one-file app | NFR-008 | BL-15 | Baseline regression + maintainability review |
| FIND-05 no app-level playback suite | FR-005–FR-010, NFR-003 | BL-02/03; interactive recorder added, unattended suite remains a gap | AUD-01–AUD-13 |
| FIND-06 large artwork candidates | FR-018, NFR-001 | BL-08/11 | CAT-06, DEP-02 |
| FIND-07 row keyboard parity | FR-005, NFR-005 | BL-10; source fix implemented | AUD-01/02, UX-01/02 |
| FIND-08 regex mood rules | FR-016 | BL-07 | PL-10 |
| FIND-09 asset source ambiguity | FR-018, NFR-008 | BL-11 | CAT-06 |
| FIND-10 codec checks | FR-001/009, NFR-004 | BL-02/13 | AUD-10/12, DEP-02 |
| FIND-11 “permanent” expectations | FR-013/014, NFR-007 | BL-04 | PL-03/04, REL-03 |
| FIND-12 font availability | UI specification, NFR-004/006 | BL-09 | UX-04 across browser matrix |
| FIND-13 library sorting/filtering absent | FR-023 | BL-06 | NAV-04 after owner approves fields |

## Completion rules

1. A source-verified status is not a test pass.
2. Update a test status only with an execution record including date/time zone, build/deployment, browser, and outcome.
3. Mark a requirement **Accepted** only after owner review; mark **Implemented** only when code evidence exists; mark **Verified** only after linked acceptance tests pass.
4. A failed or blocked case must link to a defect or explain the external blocker.
