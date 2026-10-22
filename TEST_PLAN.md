# Tonearm Music Player — Test Plan

**Version:** 0.1 proposal · **Date:** 15 October 2026  
This plan is a proposed release checklist. The live deployment and full browser interactions were not exercised during the system study.

## 1. Test objectives

- Confirm catalog and audio paths match the deployed files.
- Verify actual Tonearm UI playback controls and synchronized current-song state.
- Protect curated playlists and validate permanent/temporary persistence.
- Confirm search, route, artwork, responsive, accessibility, and deployment behavior.
- Detect console/network failures on real target browsers before release.

## 2. Scope and test levels

| Level | Included |
| --- | --- |
| Static/catalog | Manifest shape, metadata, unique IDs/files, durations, case-sensitive paths, asset references. |
| Browser audio smoke | Each catalog file’s decode/load, metadata duration, seek, brief play/pause, volume. Existing `scripts/playback-check.html` partially covers this. |
| Application integration | Real UI selection, player state, queue, playlist, search, storage, and route integration. |
| Accessibility/responsive | Keyboard, screen reader, focus, contrast, zoom, reduced motion, viewports. |
| Production deployment | Static root, refresh/deep route, all assets/audio, console/network. |

## 3. Environment and test data

- **Catalog baseline:** checkout manifest and all files under `Songs/` (currently 68 audio files: 65 MP3 and 3 M4A; re-count at test time).
- **Browsers proposed:** current stable Chrome/Edge, Firefox, macOS Safari, iOS Safari; exact version numbers recorded per run.
- **Viewports proposed:** 360×800, 390×844, 768×1024, 1024×768, 1440×900; desktop zoom 100% and 200%.
- **Storage states:** fresh profile, existing profile, blocked storage/quota simulation, session tab refresh/close, second profile/origin.
- **Catalog fixtures:** one new supported MP3 with ordinary filename, one filename containing spaces/ampersand/Unicode, one duplicate-title file with a distinct filename, and one removed track.
- Use copies or a disposable test branch for add/remove fixtures; do not delete production audio during testing.

### Shared preconditions

- **CAT/DEP:** use a disposable checkout or local preview, Node.js installed, and a complete generated manifest; never mutate the only copy of the song library.
- **AUD:** page is served from the intended origin, browser audio is enabled, and a human/browser gesture can start playback; use at least two known files in different codecs for sequence tests.
- **PL/NAV:** app and manifest load; use a fresh browser profile for create/delete/import tests and a separate profile for persistence checks.
- **UX:** viewport/device and assistive technology are recorded; use the production-like build and approved sample account state (no login exists in this project).
- **REL:** capture console and network logs from a clean load; do not include personal browser data in the evidence record.

Precondition labels in the execution register refer to these group definitions. **APP** means a clean app page and manifest have loaded; combinations such as **CAT + live static host** mean both named conditions apply.

## 4. Test cases

### A. Catalog and deployment

| ID | Scenario / steps | Expected result |
| --- | --- | --- |
| CAT-01 | Run `node scripts/verify-catalog.mjs` on release tree or inspect the GitHub Actions catalog job. | Pass; manifest count matches source folder; no duplicate file/ID; every song and active playlist artwork, logo, artist image, favicon, and app-check page/script exists with exact case. |
| CAT-02 | Generate manifest twice without changing files. | Stable IDs and existing `addedAt` values remain unchanged. |
| CAT-03 | Add a fixture MP3; regenerate and verify. | Exactly one new entry; title/artist/album/duration populated; valid relative path; stable ID on second generation. |
| CAT-04 | Remove fixture; regenerate and verify. | Entry disappears; manifest count and folder count match. |
| CAT-05 | Test spaces, ampersand, parentheses, and Unicode filename. | URL encodes safely and resolves on case-sensitive static host. |
| CAT-06 | Remove an image in a disposable preview or simulate load failure. | Playlist layout remains stable and fallback is shown; no uncaught console error. |
| DEP-01 | Deploy root; open `/`, refresh, directly open `/#/playlist/p1`, search route and artist route. | App loads and route remains valid after refresh; no path depends on local machine directories. |
| DEP-02 | Inspect network requests for a representative route. | HTML, manifest, active artwork, and audio requests resolve; no unexpected backend/API dependency. |

### B. Playback controls — run against actual app UI

| ID | Scenario / steps | Expected result |
| --- | --- | --- |
| AUD-01 | Select a song by title, cover, and non-control area of its row. | Each selection starts that song; player title/credit/cover and active row update. |
| AUD-02 | Click Like, Add, album link, artist link, and remove control within a row. | Only the selected action runs; row click does not also change the current song. |
| AUD-03 | Play then Pause then Play. | Audio starts, pauses, resumes from the same position; UI state matches. |
| AUD-04 | Drag/keyboard seek to ~25%, ~75%, then near end. | Time/progress updates; playback resumes from target; values remain within duration. |
| AUD-05 | Move volume to 0%, 50%, 100%; toggle mute/unmute. | Audio volume/mute state and accessible value labels match UI. |
| AUD-06 | Next and Previous within a playlist, including previous after >3 seconds. | Next/previous selects expected queue item; Previous first restarts current item after threshold. |
| AUD-07 | At first/last queue item, test Next/Previous with repeat off/all/one. | Behavior matches product-approved edge rules and never selects an unavailable ID. |
| AUD-08 | Enable shuffle with at least 3 tracks; play through several changes. | Only current queue tracks are selected; no infinite loop for one-track queue. |
| AUD-09 | Rapidly choose A then B while A is loading. | B remains selected/playing; A’s late promise/event cannot overwrite B’s UI. |
| AUD-10 | Play a missing/unsupported fixture or block its request. | Non-blocking actionable error appears; controls recover; another song can play. |
| AUD-11 | Let a track reach its end under each repeat setting. | Auto-advance/repeat behavior matches approved rule; current time resets appropriately. |
| AUD-12 | In the primary supported browser, repeat the app-level sequence for each catalog track: select it from a full-catalog queue with shuffle off and repeat-all on; Play → Pause → Play → seek → Next → Previous → change Volume; verify visible current title/cover/active row after each switch. Record the track filename and result. Separately run `scripts/playback-check.html` for browser decode coverage. | All 68 songs individually pass the actual UI sequence, all player/UI state stays synchronized, and every file passes browser load/seek/play/pause/volume smoke; failures are listed by filename. |
| AUD-13 | Serve the root and open `scripts/app-player-check.html`; start recording and use the embedded app to select songs, play/pause, seek, change volume, use Next/Previous, toggle shuffle/repeat, and exercise a keyboard-focused row. Export the report. | Report records the actual selected track and observed audio/UI result for each exercised interaction; errors and unhandled rejections are included. Actions not exercised remain untested; this recorder does not certify unattended or cross-browser coverage. |

**Important distinction:** the included `scripts/playback-check.html` tests a separate `Audio` object. It does not prove the Tonearm Play/Pause, Next/Previous, queue, UI, or error logic works. Record those as separate integration results.

### C. Playlists and catalog synchronization

| ID | Scenario / steps | Expected result |
| --- | --- | --- |
| PL-01 | Open each permanent curated playlist. | Names, fixed cover, surviving curated IDs and play action remain correct. |
| PL-02 | Attempt rename/delete on curated, mood, and Popular playlists. | Protected/generated playlists cannot be renamed or deleted. |
| PL-03 | Create Permanent Playlist, add a Permanent Add, refresh/restart browser. | Playlist and song remain for same origin/profile; status label stays clear. |
| PL-04 | Create Temporary Playlist and Temporary Add, refresh and close/reopen tab. | Outcomes match explicitly approved browser session semantics; no stale entry appears. |
| PL-05 | Add a song permanently and temporarily; try duplicate add. | No duplicate ID; each status is accurate; permanent and temporary actions remain distinct. |
| PL-06 | Remove temporary addition; try removing permanent addition. | Temporary item disappears; protected permanent item cannot be removed from its row. |
| PL-07 | Add a test catalog song to playlists; remove it from Songs, regenerate, deploy, refresh. | Song is absent from library, Popular, search, likes, recents, queue, all curated/user/mood playlists; playlist records themselves remain. |
| PL-08 | Rename/delete a user playlist and navigate back/refresh. | New name persists or deleted playlist is absent; no built-in playlist is affected. |
| PL-09 | Export and re-import; test duplicate, missing IDs, malformed JSON, >1 MB file. | Valid records import once; unavailable IDs filtered; malformed/oversized input rejected; existing data remains unchanged. |
| PL-10 | Add a new song whose title matches multiple mood rules. | Membership follows documented reviewed rules; no duplicate rows; no unwanted permanent playlist mutation. |

### D. Search and navigation

| ID | Scenario / steps | Expected result |
| --- | --- | --- |
| NAV-01 | Navigate every listed hash route; use browser back/forward. | Correct view and selected nav state render; invalid route shows recovery link. |
| NAV-02 | Search exact title, partial title, credited director, album, playlist, mood keyword, Hindi title, and no-match query. | Results match documented fields; no removed track is returned; empty state is understandable. |
| NAV-03 | Type quickly while search results update. | No lost query, focus jump, console exception, or visible page reset. |
| NAV-04 | If sorting/filtering is approved, change each offered option and reset to default. | Results reflect the chosen order/filter; no song is added/removed from saved playlists and default ordering is documented. |

### E. Accessibility and responsive behavior

| ID | Scenario / steps | Expected result |
| --- | --- | --- |
| UX-01 | Complete browse/play/playlist flows using keyboard only; focus a song row and activate it with Enter and Space. | Every action is reachable, focus visible, no trap; Enter/Space on a focused row selects that song; child links and buttons perform only their own actions. |
| UX-02 | Inspect with screen reader (NVDA + Firefox/Chrome; VoiceOver + Safari). | Controls, range values, current track, loading/errors, playlist types, and dialog names are announced meaningfully. |
| UX-03 | Enable reduced motion and play/change songs. | Nonessential animation stops; active/play state remains understandable. |
| UX-04 | Check color contrast, 200% zoom, text enlargement, and 360–1440 viewport matrix. | WCAG AA targets and no content/control loss; no unintended horizontal scrolling. |
| UX-05 | Use touch targets on mobile; open dialogs and operate player. | No overlapping or too-small critical actions; bottom navigation does not obscure seek or player. |

### F. Privacy, reliability, and release

| ID | Scenario / steps | Expected result |
| --- | --- | --- |
| REL-01 | Inspect console and network during all critical flows. | No app errors, unhandled rejections, missing asset/audio requests, or unexplained remote data transmission. |
| REL-02 | Disable browser storage or simulate quota failure. | App remains usable in memory and clearly reports persistence failure. |
| REL-03 | Check a browser profile with saved playlists then a clean profile and another origin. | Storage isolation is expected and clearly communicated; JSON export/import works between them. |
| REL-04 | Inspect static deployment config and output tree. | Build/install is not required; complete `Songs/`, manifest, `Photos/`, `assets/`, entry HTML included. |

## 5. Regression checklist

- [ ] Home, search, library, artist, album, playlist, queue, liked, recent routes.
- [ ] All 68 files remain present and appear once; all media paths resolve.
- [ ] Popular contains exactly the manifest tracks.
- [ ] Krishna Kanhaiya, Jai Sri Ram, Jai Hanuman, Ganesha, Romantic preserved and protected.
- [ ] Eight mood mixes have correct fixed artwork and generated membership.
- [ ] Create/rename/delete/play user playlist; permanent/temporary behavior.
- [ ] Like, recent, queue, import/export, unavailable ID filtering.
- [ ] Player controls, active song title/credit/cover, progress, volume, shuffle/repeat.
- [ ] YouTube link remains exact and opens safely in a new tab.
- [ ] Desktop/tablet/mobile, keyboard, screen reader, zoom, reduced motion.
- [ ] No console errors, broken images, missing audio, or unexpected external calls.
- [ ] Static hosting root and deep-link refresh work.

## 6. Execution register

The scenario tables above contain the steps and expected results. The traceability matrix links each case to SRS requirement IDs. The register below records actual result and status per case. Initial state is **Not tested**, except where a current execution is explicitly recorded.

| Test case | Requirement(s) | Preconditions | Actual result | Status |
| --- | --- | --- | --- | --- |
| CAT-01 | FR-001, FR-002, NFR-003 | CAT | Passed 15 Oct 2026: 68 songs, unique IDs, metadata and durations, all files present; 13 active playlist artwork files and brand/artist/favicon paths pass exact-case checks. GitHub-hosted workflow run not yet observed. | Pass (local) |
| CAT-02 | FR-003, NFR-008 | CAT | Not run. | Not tested |
| CAT-03 | FR-002–FR-004 | CAT | Not run. | Not tested |
| CAT-04 | FR-002, FR-003, FR-015 | CAT | Not run. | Not tested |
| CAT-05 | FR-001, FR-003, NFR-003 | CAT | Not run. | Not tested |
| CAT-06 | FR-018 | CAT | Not run. | Not tested |
| DEP-01 | FR-021, NFR-010 | CAT + live static host | Not run; live site could not be accessed by the web inspection tool. | Not tested |
| DEP-02 | FR-018, FR-020, NFR-001, NFR-003, NFR-009/010 | CAT + live static host | Not run; production network was not inspected. | Not tested |
| AUD-01 | FR-004/005 | AUD | Not run. | Not tested |
| AUD-02 | FR-005/006 | AUD | Not run. | Not tested |
| AUD-03 | FR-006, NFR-002 | AUD | Not run. | Not tested |
| AUD-04 | FR-006/007 | AUD | Not run. | Not tested |
| AUD-05 | FR-006 | AUD | Not run. | Not tested |
| AUD-06 | FR-006/010 | AUD | Not run. | Not tested |
| AUD-07 | FR-010 | AUD + approved edge rules | Not run. | Not tested |
| AUD-08 | FR-010 | AUD | Not run. | Not tested |
| AUD-09 | FR-008, NFR-002 | AUD | Not run. | Not tested |
| AUD-10 | FR-009 | AUD | Not run. | Not tested |
| AUD-11 | FR-010 | AUD + approved edge rules | Not run. | Not tested |
| AUD-12 | FR-006, NFR-004 | AUD + primary supported browser | Not run; neither the app-level per-song sequence nor isolated browser smoke page was executed. | Not tested |
| AUD-13 | FR-005–010, NFR-003/004/005 | AUD + served same-origin app | Not run; interactive recorder added, but browser behavior and exported report not exercised. | Not tested |
| PL-01 | FR-011 | PL | Not run. | Not tested |
| PL-02 | FR-011 | PL | Not run. | Not tested |
| PL-03 | FR-012/013 | PL | Not run. | Not tested |
| PL-04 | FR-014 | PL + approved session rule | Not run. | Not tested |
| PL-05 | FR-014 | PL | Not run. | Not tested |
| PL-06 | FR-014 | PL | Not run. | Not tested |
| PL-07 | FR-011/015 | PL + disposable catalog fixture | Not run. | Not tested |
| PL-08 | FR-012 | PL | Not run. | Not tested |
| PL-09 | FR-019, NFR-007 | PL + valid/invalid JSON fixtures | Not run. | Not tested |
| PL-10 | FR-016 | PL + approved mood rules | Not run. | Not tested |
| NAV-01 | FR-021 | APP | Not run. | Not tested |
| NAV-02 | FR-017 | APP | Not run. | Not tested |
| NAV-03 | FR-017 | APP | Not run. | Not tested |
| NAV-04 | FR-023 | APP + approved sort/filter options | Not run; feature is proposed and not present in the current interface. | Not tested |
| UX-01 | FR-005/006/022, NFR-005 | UX + keyboard only | Not run. | Not tested |
| UX-02 | FR-006/009, NFR-005 | UX + selected screen reader | Not run. | Not tested |
| UX-03 | FR-022, NFR-005 | UX + reduced motion enabled | Not run. | Not tested |
| UX-04 | FR-021, NFR-005/006 | UX + viewport/zoom matrix | Not run. | Not tested |
| UX-05 | FR-021, NFR-006 | UX + touch device or emulator | Not run. | Not tested |
| REL-01 | FR-009/020, NFR-003/009 | REL + clean browser profile | Not run. | Not tested |
| REL-02 | FR-013, NFR-003 | REL + storage disabled/quota fixture | Not run. | Not tested |
| REL-03 | FR-013/019, NFR-007/009 | REL + two browser profiles/origins | Not run. | Not tested |
| REL-04 | FR-001/003, NFR-010 | CAT + deployment artifact | Not run. | Not tested |

## 7. Release evidence template

Record: commit/deployment URL, date/time and timezone, browser/version/device, viewport, catalog count, test IDs passed/failed/not-run, console/network observations, audio codec failures, and links to defect records. Do not describe a not-run test as passed.
