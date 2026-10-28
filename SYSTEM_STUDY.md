# Tonearm Music Player — Existing-System Study

**Study date:** 15 October 2026 (Asia/Calcutta)  
**Scope:** Checked-out project at the repository root and the supplied live website URL.  
**Status:** Source review completed; deployed-site inspection unavailable. This document describes evidence, not an assumption that the hosted application has been tested.

## 1. Executive summary

Tonearm is a single-page, static music player. The browser reads a generated JavaScript catalog, loads audio files from `Songs/`, renders routes from the URL hash, and keeps preferences and playlists in browser storage. No server-side account or cross-device synchronization is present in the checked-out code.

The project already has substantial functionality: library/search/navigation, built-in and generated playlists, playlist editing, liked/recent lists, queue, and a fixed bottom player. Catalog scripts are present to update and validate the song manifest. The immediate engineering opportunity is primarily verification and maintainability: the app is concentrated in one large HTML file, browser-level end-to-end tests are not automated, and local browser storage can be mistaken for portable cloud persistence.

The website at `https://tonearm.vercel.app/` was attempted with the available web reader but returned “URL is not accessible”; a search also found no indexed result. No live page snapshot was attached. Therefore visual, network, console, and playback behavior of the deployed site are **unknown** in this study.

## 2. Evidence labels

- **Verified source fact:** directly read from a project file or enumerated file.
- **Observed artifact:** visible in an image or text provided in the conversation; it may reflect an earlier build.
- **Code-based risk:** a concern inferred from implementation; not claimed as a reproduced runtime bug.
- **Assumption / proposal:** a planning choice requiring owner confirmation.
- **Unknown:** not measurable from the available source or inspection surface.

## 3. Product purpose, users, and scope

### Purpose

Provide a browsable music collection focused on tracks directed by Prajwal Khot using AI technology. Users can discover and play tracks, keep favorites, revisit recent tracks, and organize songs into playlists.

### Users

1. **Listener:** browses the home/library, searches, plays tracks, adjusts playback, and uses likes/recent history.
2. **Playlist curator:** creates, renames, deletes, imports/exports, and edits user playlists; chooses permanent or temporary storage.
3. **Catalog maintainer:** adds/removes audio files, runs the manifest generator and verifier, and deploys the updated static site.

There is no authentication or server-defined role system. “Curator” and “maintainer” are workflow descriptions, not accounts in the application.

### In scope

- Static music discovery and playback.
- Built-in, mood, and user-created playlists.
- Local browser persistence and playlist JSON import/export.
- Static deployment from the repository root.

### Out of scope in the checked-out implementation

- Cloud accounts, remote playlist synchronization, payment, recommendations based on a user profile, or a backend API.
- Runtime filesystem watching of the deployed `Songs/` folder.

## 4. Verified project structure and technology

| Evidence | Verified fact |
| --- | --- |
| `index.html` | Contains the page shell, CSS, route/view functions, catalog loading, storage logic, player, and event handlers. The page uses browser-native JavaScript and HTML; no framework is referenced. |
| `songs-manifest.js` | Loaded as a classic script before the main inline script. It assigns `window.TONEARM_SONGS`. |
| `Songs/` | Current checkout contains 78 audio files: 74 `.mp3` and 4 `.m4a` (331,969,689 bytes, about 317 MiB). The original 15 October study observed 68 files; 10 later files have since been added and cataloged. |
| `Photos/` | Contains the Tonearm logo and supplied square-themed covers for the devotional, romantic, popular, and mood playlists. Several PNG covers are roughly 1.8–2.7 MB each. |
| `assets/` | Contains an SVG artist portrait, mood SVGs, and older JPG playlist art. The current mapping in `index.html` chooses the `Photos/` art for most playlists and an SVG for Trending & Popular. |
| `scripts/song-catalog.mjs` | Node.js built-in modules scan supported audio files, read MP3/M4A metadata, derive title and duration, and assign stable IDs. Artist credit is normalized to Prajwal Khot in the generated catalog. |
| `scripts/generate-song-manifest.mjs` | Writes the generated manifest and preserves prior add timestamps by song ID. |
| `scripts/verify-catalog.mjs` | Compares manifest entries with `Songs/`, IDs, metadata, durations for supported parser formats, and file existence. |
| `scripts/playback-check.html` | A browser-only smoke-test page loads every catalog track and attempts metadata load, seek, short playback/pause, and volume change. It does not drive the actual Tonearm player UI. |
| `vercel.json` | Configures no build output transformation and publishes the root directory (`.`). |
| Repository root | No `package.json` was found. There is no app dependency install/build pipeline in the checked-out project. |

Supported catalog extensions in code include MP3, M4A, AAC, OGG/OGA, WAV, Opus, and FLAC. Actual playback depends on browser codec support. The current catalog contains only MP3 and M4A.

## 5. Pages, navigation, and workflows

The application is routed by URL hash; no separate HTML page is created for each view.

| Route pattern | Page / purpose | Main workflow |
| --- | --- | --- |
| `#/` | Home: featured Tonearm album, recently played cards, album/artist cards, playlists, Popular songs | Start an album, playlist, or track; continue a recent track |
| `#/search` | Live search over songs, artists, album, and playlist names plus mood terms | Type a query; choose a result |
| `#/library` | User library, playlist actions, all songs | Manage playlists, export/import a backup, browse all tracks |
| `#/playlist/:id` | Playlist detail, artwork, song list, play/shuffle, protected/rename/delete controls | Play a playlist, add songs, manage eligible user playlists |
| `#/artist/:id` | Director page and track list | Play tracks by the project’s credited director |
| `#/album/:id` | Album detail and track list | Play album or select a track |
| `#/liked` | Liked songs | Play and manage favorites |
| `#/recent` | Recently played songs | Replay a recent track |
| `#/queue` | Current and upcoming queue | Inspect and remove queued items |

The side navigation shows Home, Search, Library, Liked songs, Recently played, and playlists. At widths at or below 700 CSS pixels, the sidebar is replaced by bottom navigation; the main view and player are reorganized for mobile.

### Typical listener journey

1. Open Home or Search.
2. Select a song, album, or playlist.
3. The fixed player displays current track state and offers playback controls.
4. Like a track, add it to a playlist or queue, or revisit it from Recently played.

### Typical catalog-update journey

1. Add or remove supported files in `Songs/`.
2. Run `node scripts/generate-song-manifest.mjs`.
3. Run `node scripts/verify-catalog.mjs`.
4. Deploy the repository root with the generated manifest and complete audio folder.
5. Reload the site; Popular is rebuilt from the manifest and unavailable song IDs are filtered from stored references.

### Typical playlist journey

1. Create a user playlist and select Permanent or Temporary.
2. From a track’s Add menu, choose a playlist and Permanent Add or Temporary Add.
3. Permanent data is stored in `localStorage`; temporary playlist objects are in `sessionStorage`; temporary song additions are in page memory.
4. Export/import permanent user playlists to move them manually between browser profiles/devices.

## 6. Data flow and persistence

```text
Songs/ files
    │ offline/deployment-time scan
    ▼
song-catalog.mjs ──► generate-song-manifest.mjs ──► songs-manifest.js
                                                        │ loaded at page startup
                                                        ▼
                                                  TRACKS / ID maps
                                                    │         │
                                  playlists by song IDs     HTMLAudioElement
                                                    │         │
                                                    ▼         ▼
                                          hash-routed UI     fixed player
```

- Popular is derived as all catalog IDs in the current manifest.
- Curated starter selections are filename lists in `CURATED_PLAYLISTS` in `index.html`; additions are stored as IDs.
- Mood playlists are derived from title/filename regular expressions and curated seeds at app startup.
- Custom playlist records store song IDs, not copied song objects.
- Local permanent data is under `tonearm-music-v3` in `localStorage`; temporary playlist definitions use `tonearm-temporary-playlists-v1` in `sessionStorage`; temporary song additions are held in runtime state.
- At launch, saved IDs are filtered through the current manifest, so removed catalog items should not remain as selectable tracks after refresh.
- There is no server database, account, or cross-device sync. A permanent playlist is permanent for that browser storage location, not a cloud-synced backup.

## 7. Current-state audit

Severity is a planning estimate: **P0 critical**, **P1 high**, **P2 medium**, **P3 low**. Findings below include code-evidenced design limits and risks; they are not all reproduced runtime defects.

| ID | Finding and evidence | Impact / severity | Reproduction or verification | Recommended fix |
| --- | --- | --- | --- | --- |
| FIND-01 | The deployed URL could not be opened with the available web reader; no live page was attached. | Hosted behavior is unverified; **P1 release gate** for any release claim. | Open the supplied URL in a supported browser and inspect pages, console, network, and audio. Not completed here. | Run the acceptance test plan against the live deployment and record browser/device/build. |
| FIND-02 | `Songs/` is scanned offline; browser loads `songs-manifest.js`. README documents regenerate-and-redeploy. | Adding/removing files alone does not update an already deployed site; **P1 expectation risk**. | Add a file without regenerating/deploying: static client has no directory API/watch endpoint. | Keep the manifest workflow explicit; make verification a release gate/CI step. |
| FIND-03 | Permanent playlists and preferences are in origin-scoped `localStorage`; permanent playlists can be exported/imported manually. | Data is not shared between devices, browser profiles, or changed origins; browser-data clearing can remove it. **P1 data portability**. | Create playlist, open another browser/profile or clear site data. | Keep export/import, clearly explain scope, consider downloadable backups; only add server sync if product needs it. |
| FIND-04 | The app is concentrated in `index.html` with inline CSS and JavaScript; no package/test framework is present. | Changes are harder to isolate, review, unit test, and onboard contributors to; **P2 maintainability**. | Inspect root and file boundaries. | First split documentation and tests; modularize incrementally only when repeated edits justify it. |
| FIND-05 | The raw audio smoke page does not drive app controls. A same-origin interactive recorder now observes actual app controls, media state, visible track state, and browser errors; it is user-driven and is not an unattended/cross-browser suite. | Unperformed actions and other browsers remain unverified; **P1 test coverage**. | Run `scripts/app-player-check.html`, export its results, then separately compare with per-track smoke checks and the browser matrix. | Use the recorder now; add unattended automation after selecting supported browsers and a reproducible runner. |
| FIND-06 | Artwork PNGs include many 1.8–2.7 MB images; images use async/lazy loading in playlist-cover rendering. | Initial/network payload and scrolling on mobile may be heavier than necessary; **P2 performance candidate**. | Inspect asset sizes and use browser Network/Lighthouse on deployed page. | Measure first; consider responsive WebP/AVIF derivatives while preserving approved original artwork. |
| FIND-07 | Initially the row was pointer-only. The improvement pass added a focusable group row, Enter/Space activation, and a visible focus outline while leaving child controls independent. | This source-level gap is addressed; browser/screen-reader behavior still needs testing. **P2 verification item**. | Tab to a row, press Enter and Space, then verify the selected track and child button/link behavior in supported browsers. | Implemented in `index.html`; run UX-01/02 and actual player regression before release. |
| FIND-08 | Playlist song mix membership relies on filename/title regexes and curated filename lists in `index.html`. | Ambiguous titles may be categorized incorrectly; new curated selections need code edits; **P2 discoverability/maintenance**. | Add a deliberately ambiguous title and review mood/curated membership. | Move explicit classifications to a documented manifest field or reviewed mapping; treat automatic mood matches as suggestions. |
| FIND-09 | Most playlist covers use large supplied PNGs; Trending & Popular uses `assets/playlists/mood-trending.svg`; older similar JPG/SVG assets remain under `assets/playlists/`. | Asset source-of-truth is not obvious; duplicates can lead to accidental inconsistency; **P3 maintenance**. | Compare `PLAYLIST_ARTWORK` with asset inventory. | Document active artwork map and identify legacy assets before deleting anything. |
| FIND-10 | Catalog verifier asserts file/manifest parity and duration only for MP3/M4A/WAV; browser smoke test is the codec check. | Static checks do not prove codec playback in target browsers; **P2 compatibility**. | Run browser smoke across supported browsers/devices and check M4A specifically. | Keep browser codec tests in release workflow and publish supported-browser matrix. |
| FIND-11 | Playlist “permanent” labels mean local browser persistence; UI/README do state browser and address/device scope. | The term can still be confused with cross-device or deployment-independent server storage; **P2 expectation risk**. | Ask a first-time user what “permanent” means after seeing the label. | Retain explicit “this browser/site address” text, add export prompt/help. |
| FIND-12 | The HTML uses a font family name (`Inter`) with system fallbacks; no font asset/dependency is checked in. | Typography varies depending on whether the system font is installed; **P3 visual consistency**. | Inspect computed font on clean Windows/macOS/Linux browser. | Decide whether system fallback variation is acceptable; self-host only if licensing and transfer size are acceptable. |
| FIND-13 | `V.library()` shows playlist actions and all tracks but no sorting/filter controls; search does not provide a sort mode. | A growing catalog may be slower to browse; **P3 optional discovery improvement**. | Inspect Library and Search controls in source/live UI. | Confirm users need sorting/filtering and which fields; add only approved options with tests. |

## 8. Observations, assumptions, and unknowns

### Checks executed during this documentation pass

- `node scripts/verify-catalog.mjs` passed on 28 October 2026: 78 entries, unique IDs, metadata/durations present, and all referenced audio files present. All 13 active playlist artwork files and the brand/artist/favicon paths also pass exact-case checks.
- `node scripts/generate-song-manifest.mjs` was run on 28 October 2026 to add 10 files that were present in `Songs/` but absent from the prior manifest; existing IDs and `addedAt` dates were preserved.
- The supplied live website URL was retried with the web inspection tool and remained inaccessible. No claim is made about current production visuals, console, network, or playback.
- No application interaction, accessibility audit, performance measurement, or cross-browser test was run in this pass.

### Observed artifact

Earlier supplied browser screenshots depict the dark Tonearm interface, fixed player, album/playlist artwork, song rows, artist view, and devotional playlist list. They are reference captures, not proof of the current deployed state.

### Assumptions for the proposed specification

- The project should remain static-first and preserve its existing visual identity.
- The credited director and current audio collection remain the content baseline.
- Cloud synchronization is not required unless the owner confirms it.
- Browser targets should include current Chromium, Firefox, and Safari-family browsers.

### Unknowns requiring owner or live-site confirmation

- Whether the supplied live URL currently serves the same commit as this checkout.
- Actual console/network errors, first-load performance, and playback behavior on supported devices.
- Target browser versions, minimum supported viewport, and assistive-technology combinations.
- Exact licensing, provenance, and metadata accuracy for each audio/artwork file.
- Whether “permanent” is intentionally browser-local or should eventually mean account/cloud persistence.
- Expected behavior of Previous at the first track, Next at the last track, shuffle queue order, and repeat modes from a product perspective.
- Whether `file://` direct-open support is a requirement or merely a local convenience.
