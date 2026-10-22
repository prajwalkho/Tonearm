# Tonearm Music Player — Software Requirements Specification

**Version:** 0.1 proposal  
**Date:** 15 October 2026  
**Approval status:** Every requirement in this document is **Proposed** until reviewed and confirmed by the product owner. It does not authorize source changes by itself.

## 1. Introduction

### 1.1 Purpose

Define a testable target for improving Tonearm while preserving its static-site architecture and existing features. This SRS is intended for the project owner, beginner developers, designers, and testers.

### 1.2 Scope

Tonearm is a browser-based music player for a static catalog of project-owned or project-authorized tracks. The system shall support catalog discovery, search, playback, built-in and user playlists, favorites, recent history, queue, playlist backup, and static deployment. Backend accounts and synchronization are outside the proposed initial scope.

### 1.3 Definitions

| Term | Meaning |
| --- | --- |
| Catalog / library | Available tracks represented by the generated manifest and corresponding audio files. |
| Manifest | `songs-manifest.js`, generated from `Songs/`, loaded by the page at startup. |
| Permanent playlist | User playlist saved in browser storage for the current site origin; not cloud-synced. |
| Temporary playlist | Playlist whose definition is stored for the current browser tab/session according to current implementation. |
| Permanent add | Song reference retained in permanent playlist storage. |
| Temporary add | Runtime-only song reference removed on page refresh. |
| Curated playlist | Protected built-in playlist with a fixed name and hand-selected starter tracks. |
| Mood playlist | Built-in read-only playlist derived from catalog terms and fixed seed lists. |
| Origin | Scheme + host + port tuple, such as a particular Vercel domain. Browser storage is scoped to it. |

## 2. Product overview

### 2.1 Product context

Tonearm is a static, single-page web application. The app reads relative asset/audio paths; it has no application backend. A catalog maintainer regenerates the manifest when files change. Browser APIs used by the app include `HTMLAudioElement`, `localStorage`, `sessionStorage`, hash navigation, `dialog`, and file download/upload for playlist backups.

### 2.2 User classes

- **Listener:** discovers, searches, and plays music.
- **Playlist curator:** organizes available music into playlists and manages personal library data.
- **Catalog maintainer:** updates files/manifest and publishes a static deployment.

### 2.3 Operating environment

- Modern desktop, tablet, and mobile browsers.
- Static hosting such as Vercel, Netlify, or GitHub Pages.
- The app must be served with `index.html`, `songs-manifest.js`, all referenced artwork, and `Songs/` at the expected relative locations.
- Codec support is determined by the browser and device.

## 3. Functional requirements

All requirements below are proposals. “Shall” describes a candidate acceptance condition, not an approved implementation change.

| ID | Proposed requirement |
| --- | --- |
| FR-001 | The system shall load the generated song manifest on startup and expose only entries whose IDs, filenames, and supported extensions pass validation. |
| FR-002 | Popular shall contain exactly one reference for every available catalog song and no reference to a song absent from the manifest. |
| FR-003 | A catalog maintainer shall be able to regenerate the manifest from `Songs/` without manually editing Popular or duplicating song objects in playlists. |
| FR-004 | Each displayed song shall show its title, credited director/artist, artwork treatment, duration when known, and added date when known. |
| FR-005 | Selecting a song row, cover, or explicit Play control shall start that song and update the current player state. Clicking a nested Like/Add/link control shall perform only that control’s action. |
| FR-006 | The player shall provide Play/Pause, Next, Previous, seek, volume/mute, shuffle, repeat, queue access, and Like controls. State and accessible labels shall reflect the active mode and song. |
| FR-007 | The seek control shall report current time and duration, accept pointer and keyboard seeking, and avoid seeking outside the valid track range. |
| FR-008 | On a song switch, the system shall stop the prior source, load the selected source, update title/credit/artwork/duration, and ignore stale asynchronous results from older playback requests. |
| FR-009 | On load or playback failure, the system shall stop the failed state, show a non-blocking explanation, retain usable controls, and allow the user to choose another track. |
| FR-010 | Next, Previous, shuffle, repeat-one, and repeat-all shall operate only on available IDs in the active queue. End-of-queue behavior shall match the product-approved mode rules. |
| FR-011 | The five protected curated playlists—Krishna Kanhaiya, Jai Sri Ram, Jai Hanuman, Ganesha, and Romantic—shall retain their names, fixed artwork, and surviving curated tracks across catalog refreshes. |
| FR-012 | Users shall be able to create, rename, delete, play, and edit user-created playlists, subject to the selected permanent or temporary storage behavior. |
| FR-013 | Permanent playlist records and permanent song additions shall survive refresh and browser restart for the same site origin, subject to browser storage availability. The UI shall not imply cross-device sync. |
| FR-014 | Temporary playlist records shall disappear according to the approved session rule; temporary song additions shall disappear on refresh if that remains the selected product rule. |
| FR-015 | After an updated manifest is deployed and the page is reloaded, the application shall filter removed or invalid song IDs from likes, recents, queue, curated additions, and user playlist references. Static runtime filesystem watching is not required. |
| FR-016 | The eight mood playlists shall derive membership from documented rules and the current catalog; duplicate references shall not be displayed. |
| FR-017 | Search shall return available songs, artists, albums, and playlists and shall not return removed tracks. Search normalization and supported fields shall be documented. |
| FR-018 | Playlist covers shall use a fixed mapping to approved artwork assets, preserve a square crop with `object-fit: cover`, and show a graceful fallback if an image fails. |
| FR-019 | Users shall be able to export permanent user playlists to a versioned JSON backup and import valid backups while filtering unavailable song IDs and rejecting malformed or oversized input. |
| FR-020 | The system shall retain the YouTube promotion to `https://youtube.com/@pk_lord` as a clearly labeled outbound link that opens a new tab safely. |
| FR-021 | The interface shall preserve navigation and music controls at narrow screen sizes without horizontal overflow or obscured player actions. |
| FR-022 | The system shall use reduced-motion preferences to suppress nonessential animation and shall not use animation as the only indicator of playback state. |
| FR-023 | If approved by the owner, the library shall offer a small set of explicit sort/filter choices (for example title, newest addition, or playlist/theme) without silently changing saved playlist order. This is an optional proposed feature, not a claim about current behavior. |

### 3.1 Requirement rationale, priority, dependency, and acceptance register

Priorities are proposals: P0 = release blocker, P1 = high value, P2 = important, P3 = optional. Acceptance references are defined in `TEST_PLAN.md`; all remain untested unless that file records an execution result.

| ID | Rationale | Priority | Dependencies | Proposed measurable acceptance |
| --- | --- | --- | --- | --- |
| FR-001 | Invalid records can create broken rows or unsafe paths. | P0 | Manifest schema and supported extensions | CAT-01 and CAT-05 pass; invalid paths/IDs are not rendered. |
| FR-002 | Popular must reflect the available catalog without duplication. | P0 | FR-001 | After CAT-03/04, Popular has exactly one row per manifest ID and no extra ID. |
| FR-003 | Maintainers need a repeatable folder-to-deploy workflow. | P0 | Node.js and static deployment workflow | CAT-02/03/04 pass; no manual Popular list update is needed. |
| FR-004 | Track identity and dates help listeners choose and trust content. | P2 | Catalog metadata/artwork policy | CAT-03 and AUD-01 show title, credit, duration/date when available and a stable fallback when unavailable. |
| FR-005 | Large row hit targets improve song selection while preserving action controls. | P1 | FR-006; event-target rules | AUD-01/02 pass for row, cover, title, and nested controls. |
| FR-006 | Familiar controls make the player usable without external help. | P0 | Browser audio/codec support | AUD-03–08 and AUD-11 pass; AUD-12 passes the full UI sequence for every catalog track in the primary supported browser. |
| FR-007 | Accurate seek feedback is needed for long tracks. | P1 | FR-006 and duration metadata | AUD-04 passes pointer and keyboard seeking without an out-of-range time. |
| FR-008 | Rapid song changes must not let an old request replace the current UI. | P0 | FR-006; browser media event model | AUD-09 passes repeated A→B switch trials with B remaining current and audible. |
| FR-009 | Recoverable errors prevent one bad file from blocking listening. | P1 | FR-008 and status announcement | AUD-10 shows one actionable error, leaves controls usable, and permits next-song playback. |
| FR-010 | Queue/mode rules must never choose an unavailable ID. | P1 | FR-001, FR-006; owner decision on boundaries | AUD-06–08/11 pass at first/last item, one-item queue, and each repeat mode. |
| FR-011 | Existing curated collections and names are user-facing product content. | P1 | Catalog ID mapping and approved cover map | PL-01/02/07 show all five names/art and no rename/delete path. |
| FR-012 | Users need to organize their own collections. | P1 | FR-013/014 storage decision | PL-03–08 pass create, edit, rename, delete, and play behavior. |
| FR-013 | Permanent playlists should survive ordinary return visits without implying cloud sync. | P1 | Browser storage access; origin policy | PL-03 and REL-03 retain data after refresh/restart on same origin; a second origin remains isolated. |
| FR-014 | Temporary options need predictable lifetime and visible status. | P1 | Owner confirms session-close/restore semantics | PL-04–06 pass for approved session rule; refresh behavior of temporary additions matches the label. |
| FR-015 | Removed files must not leave unplayable stored references after catalog refresh. | P0 | FR-001–003; static deploy reload | PL-07 passes after regenerated manifest is deployed and reloaded; no in-page filesystem watcher is implied. |
| FR-016 | Mood discovery is useful only if membership is explainable and deduplicated. | P2 | Reviewed classification policy | PL-10 matches approved fixture memberships with no duplicate IDs. |
| FR-017 | Search is the quickest path for a large collection. | P1 | FR-001 and search-field definition | NAV-02/03 return only available results, preserve typing, and show a clear empty state. |
| FR-018 | Fixed artwork makes playlist identity recognizable across views. | P2 | Approved asset map and static paths | CAT-06 shows the correct asset or fallback at all mapped locations with no broken layout. |
| FR-019 | Browser-local permanent data needs a user-controlled transfer path. | P1 | Versioned JSON schema and validation | PL-09 round-trips valid data; malformed, oversized, duplicate, and missing-ID cases do not corrupt existing playlists. |
| FR-020 | The channel is an explicit project promotion destination. | P3 | Approved URL | REL-01 confirms the exact URL and safe new-tab attributes in source/browser. |
| FR-021 | Users must reach songs/player actions on phones and tablets. | P1 | Agreed viewport matrix | UX-04/05 pass at 360/390/768/1024/1440 px with no unintended horizontal scroll or hidden primary action. |
| FR-022 | Motion preferences and non-color state support comfort and access. | P1 | Browser reduced-motion support | UX-03 passes with reduced motion enabled; playback state remains understandable without animation. |
| FR-023 | Sorting helps listeners navigate a larger catalog, but the desired order/filter fields are not yet confirmed. | P3 | Owner selects supported fields and default order | NAV-04 passes for each approved sort/filter; switching back restores the documented default and never changes saved playlist membership/order. |

## 4. Non-functional requirements

Proposed measurable targets; confirm or revise them before implementation.

| ID | Proposed acceptance criterion |
| --- | --- |
| NFR-001 Performance | On a representative mid-range device and broadband connection, initial HTML/manifest transfer should be ≤ 1.5 MB compressed, excluding user-triggered audio; first interactive paint should be ≤ 3 seconds at the 75th percentile. Measure before optimization. |
| NFR-002 Audio response | For a cached/local test track, player UI shall show loading within 100 ms and settle to playing/error within 5 seconds on the agreed test network; browser autoplay restrictions must be surfaced rather than bypassed. |
| NFR-003 Reliability | Every catalog path shall resolve on a case-sensitive static host; catalog verification shall pass before release. No unhandled player promise rejection or application console error is acceptable in the regression suite. |
| NFR-004 Compatibility | Pass the agreed test matrix on current stable Chrome/Edge, Firefox, and Safari (macOS/iOS), with actual codecs tested per device. Exact versions to be agreed per release. |
| NFR-005 Accessibility | Meet WCAG 2.2 AA for implemented flows: keyboard access, focus visibility, labels/names, contrast, reduced motion, and screen-reader status updates. Validate with automated scans plus manual keyboard/screen-reader checks. |
| NFR-006 Responsive layout | At 360, 390, 768, 1024, and 1440 CSS pixels, no unintended horizontal page scroll; essential navigation, song selection, and player controls remain visible/reachable. |
| NFR-007 Data portability | Playlist import/export shall be versioned; export shall include only user playlist data and available song IDs, not audio files or unrelated browser data. |
| NFR-008 Maintainability | New catalog tracks shall require adding the file and regenerating the manifest. No playlist should store duplicate full song objects. Catalog logic and UX behavior shall have documented checks. |
| NFR-009 Privacy | No user listening history, preferences, or playlist data shall be sent to a remote server in the static-only release. Disclose local storage scope. |
| NFR-010 Deployment | A clean root deployment shall serve the entry page and all referenced manifest/audio/art assets without a build or package installation step. |

### 4.1 Non-functional rationale and verification register

| ID | Rationale | Priority | Dependencies | Proposed measurable acceptance |
| --- | --- | --- | --- | --- |
| NFR-001 | Artwork and audio can dominate transfer size, especially on mobile. | P2 | Deployed baseline, representative device/network | DEP-02 records transfer; if target is exceeded, a measured optimization plan is approved before changing artwork. |
| NFR-002 | Clear feedback reduces repeated clicks and perceived failure. | P1 | Browser policy and local test environment | AUD-03/AUD-09 time from activation to playing/error is measured; P75 ≤5 s on agreed environment; loading feedback begins ≤100 ms. |
| NFR-003 | Broken paths and unhandled failures directly interrupt playback. | P0 | Release catalog and browser console capture | CAT-01 passes; REL-01 finds zero app errors/unhandled rejections and no missing local media requests. |
| NFR-004 | Static audio codecs and browser APIs vary across platforms. | P1 | Target browser/device list | AUD-12 and DEP-01 pass on every agreed browser/device; exact version is recorded. |
| NFR-005 | Keyboard and assistive-technology access is needed for inclusive use. | P1 | Manual test expertise and selected assistive technology | UX-01/02/04 pass; automated scan has zero critical/serious violations; manual criteria are recorded. |
| NFR-006 | Fixed player and multi-column rows can overflow at narrow widths. | P1 | Agreed viewport sizes | UX-04/05 pass at all five target widths and 200% zoom with no lost primary action. |
| NFR-007 | Local storage cannot synchronize by itself. | P1 | JSON format/version policy | PL-09/REL-03 transfer a user playlist between two origins with all available IDs and no audio data. |
| NFR-008 | A beginner/maintainer needs a safe way to update catalog content. | P2 | Documentation and lint/tool ownership | CAT-02–05 pass; a new song is added by file + generation only for Popular; playlist IDs remain references. |
| NFR-009 | Listening history and personal playlists are private user data. | P1 | Network inspection and privacy decision | REL-01 shows no requests containing playlist/liked/recent data; UI explains storage scope. |
| NFR-010 | Root static publishing is a project constraint and keeps operation simple. | P0 | Hosting configuration | DEP-01/02 pass on a clean deployment with no build/install step and all referenced files return successfully. |

## 5. Interface requirements

### 5.1 User interface

The dark Tonearm theme, artwork-led playlist cards, sidebar/mobile navigation, search, lists, dialogs, and fixed player are to be retained. The UI/UX specification defines proposed refinements; no wholesale visual redesign is required.

### 5.2 External interfaces

- **Audio:** browser-native audio element; relative URL `Songs/<encoded filename>`.
- **Catalog:** classic JavaScript file setting `window.TONEARM_SONGS`.
- **Storage:** browser `localStorage` and `sessionStorage` on the active origin.
- **Backup:** user-selected JSON import; generated JSON download export.
- **YouTube:** external link to the project channel; no embedded account/API integration is required.
- **Hosting:** static-file server; no backend endpoint.

## 6. Data model and business rules

### 6.1 Song record (manifest)

```text
Song = {
  id: integer,            // stable hash derived from filename
  file: string,           // basename under Songs/
  title: string,
  artist: string,          // Tonearm project credit
  album: string,
  durationSeconds: number | null,
  addedAt: ISO-8601 string | null
}
```

### 6.2 Playlist record

```text
Playlist = {
  id: string,
  name: string,
  createdAt: ISO-8601 string | null,
  tracks: integer[],      // references Song.id
  storage: permanent | temporary,
  kind: curated | mood | popular | user
}
```

Temporary song additions may be represented separately from permanent playlist `tracks`; the app shall make their status clear and shall filter every reference against the current song catalog.

### 6.3 Business rules

1. `Songs/` is the catalog source of truth after manifest generation; static runtime synchronization occurs on deployment/refresh, not by filesystem watching.
2. Song IDs are filename-derived; a rename is a new identity unless an approved migration map is introduced.
3. Popular is the complete catalog, unique by song ID.
4. Playlist membership references catalog IDs; unavailable IDs are never rendered as playable.
5. The five curated playlists are protected from rename/delete; mood mixes are generated/read-only; Popular is generated/read-only.
6. Permanent browser data belongs to the current origin and profile. Export/import is the transfer mechanism; it is not automatic synchronization.
7. The exact boundary between “browser restart” and “session end” for temporary playlists requires product-owner confirmation because browser session restoration behavior differs.

## 7. Error handling and edge cases

- Missing or invalid manifest: display a recoverable empty/error state; do not emit broken track rows.
- Missing audio file or unsupported codec: show track-specific error; allow another song to play.
- Rapid song switches: stale `play()` completion/error events must not overwrite the newest selected song.
- Zero/unknown duration: disable seek until metadata is available; do not show invalid time values.
- Queue becomes empty or current ID disappears: stop safely and clear current-song state.
- Storage unavailable/quota exceeded: keep current-session interaction usable and explain that changes may not persist.
- Malformed import, unsupported version, duplicate playlist, missing IDs, or file > 1 MB: reject or filter predictably and report counts without corrupting existing data.
- Artwork unavailable: keep layout dimensions and show a neutral branded fallback.
- Empty search, empty playlist, no mood matches, and invalid route: present an actionable empty state.
- Browser blocks autoplay: preserve the selected track and invite a direct Play action.

## 8. Security and accessibility

### Security/privacy (proposed)

- Escape user-controlled text before rendering into HTML; validate playlist IDs and imported data.
- Treat imported JSON as untrusted; cap file size and item counts; accept only expected fields and types.
- Keep external links `rel="noopener noreferrer"` when opened in a new tab.
- Avoid remote upload/telemetry of playlist, liked, or recent data in a static-only build.
- Do not use absolute local paths or expose local machine directories in deployed HTML/manifest.

### Accessibility (proposed)

- Every icon-only control has an accurate accessible name and current state.
- Search, playback, seek, volume, dialogs, and playlist actions are keyboard operable.
- Song-row pointer behavior has an equivalent keyboard-accessible control, without nested interactive semantics.
- Focus order is logical and focus remains visible after route/dialog changes.
- Current track, loading/error, like state, and playback mode are conveyed beyond color/animation.
- Contrast meets WCAG 2.2 AA; zoom/reflow and reduced-motion behavior are checked.

## 9. Acceptance criteria and scenarios

Release acceptance shall require the applicable cases in `TEST_PLAN.md`, including:

- New supported file → regenerate → verify → deploy → appears exactly once in Popular and is playable.
- Removed file → regenerate → verify → deploy → absent from Popular, search, playlists, likes, recents, and queue references.
- Play, pause, seek, volume, next, previous, shuffle, repeat, queue, and UI synchronization work on every file in the catalog/browser matrix.
- All five protected playlists retain name and artwork and cannot be renamed/deleted through the UI.
- Permanent and temporary playlist/add behavior matches the approved session/storage rules.
- Search and playlist editing continue after refresh; malformed import cannot corrupt existing records.
- Responsive and accessibility checks pass at target viewports and agreed assistive technologies.

## 10. Assumptions, dependencies, and future scope

### Assumptions

- Static hosting remains the preferred architecture.
- The complete song and image collection is authorized for deployment.
- Current local storage semantics are acceptable for the first approved iteration.
- Project credit remains Prajwal Khot; track-specific artist overrides would require explicit metadata policy.

### Dependencies

- Node.js for catalog generation/verification.
- A static host that serves nested folders and URL-encoded filenames correctly.
- Browser/device codec support for audio formats.
- Owner-provided, approved artwork and metadata.

### Future scope (not baseline)

- Cross-device playlist sync would require a backend/authentication or an external sync provider and introduces privacy, security, and operating costs.
- Search normalization, optional sorting/filtering (FR-023), explicit mood tags, and automated browser tests can be added without a backend.
- A build step may be justified for asset optimization or manifest generation at deploy time, but should remain minimal and retain root static deployment.
