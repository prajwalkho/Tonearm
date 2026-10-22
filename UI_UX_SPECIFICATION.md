# Tonearm Music Player — UI/UX Specification

**Version:** 0.1 proposal · **Date:** 15 October 2026  
The deployed page could not be inspected in this study. This specification is based on the checked-out `index.html` and earlier supplied screenshots. Proposed changes require review before implementation.

## 1. Experience principles

1. Keep music selection and playback obvious; use artwork to add character, not decoration for its own sake.
2. Keep the fixed player consistent across routes and responsive layouts.
3. Explain persistence in ordinary words: “saved in this browser” vs “for this session.”
4. Preserve playlist names, fixed covers, and protected controls.
5. Prefer stable, immediate interactions; show loading/error state when audio takes time.
6. Provide a keyboard and screen-reader equivalent for every important pointer action.

## 2. Sitemap

```text
Tonearm
├── Home (#/)
│   ├── Featured album
│   ├── Jump back in
│   ├── Albums / Artist
│   ├── Your playlists
│   └── Popular songs
├── Search (#/search)
│   ├── Songs
│   ├── Artists
│   ├── Albums
│   └── Playlists
├── Library (#/library)
│   ├── Liked songs
│   ├── Recently played
│   ├── Playlist management + JSON backup
│   └── All songs
├── Playlist (#/playlist/:id)
├── Artist (#/artist/:id)
├── Album (#/album/:id)
├── Queue (#/queue)
├── Liked songs (#/liked)
└── Recently played (#/recent)
```

The global footer of the main content currently contains a YouTube promotion and brand footer.

## 3. User journeys

### Find and play a song

Home/Search → enter a query or browse Popular → activate title/cover/row Play → player shows selected artwork/title/director → use Play/Pause, seek, Next/Previous, volume, and modes.

### Curate a playlist

Library → New playlist → choose a name and Permanent or Temporary → browse a song → Add → select playlist → choose Permanent Add or Temporary Add → verify membership label and remove only an eligible temporary addition.

### Update the catalog

Maintainer adds/removes audio → regenerates manifest → verifies parity and paths → deploys complete root → listener refreshes → Popular and all playlist references reflect the new catalog.

### Move a playlist

Library → Export playlists → transfer JSON through the user’s chosen method → destination browser/site origin → Import playlists → report imported/skipped/unavailable song counts.

## 4. Screen-by-screen layout recommendations

### Home

- **Desktop:** persistent left navigation; main scroll area; compact featured album region; recent cards; playlists and Popular rows; fixed player anchored below.
- **Tablet:** narrow icon sidebar; maintain the same track-row information with reduced secondary columns.
- **Mobile:** no sidebar; small Tonearm header; two-column browse cards where space allows; bottom navigation; compact player above navigation; keep song title and Play/Pause reachable.
- Keep one primary page heading and avoid competing hero content. Empty recently played state should invite browsing.

### Search

- Keep search input near the top and retain query while results render.
- Group matches under Songs, Artists, Albums, Playlists; provide an explicit no-results message.
- On mobile, preserve title and primary action; hide only nonessential secondary columns.
- Proposed enhancement: add optional filter chips (Songs/Playlists/Albums) only if user research shows mixed results are confusing.

### Library

- Separate library actions (create/import/export) from playlists and tracks.
- Show clear playlist type and song count; retain fixed artwork.
- Explain that permanent data is stored in this browser, and that export/import moves a copy.
- Avoid styling local browser persistence as cloud backup.

### Playlist detail

- Artwork and title establish identity; metadata shows count, created/added date, and type.
- Primary actions: Play and Shuffle. Protected playlists show “Permanent · Protected” with no rename/delete. User playlists expose Rename/Delete. Mood mixes explain auto-curation.
- Song list retains title, credit, duration, membership badge, and allowed controls.
- Empty state gives the next action (“Find songs” or add a matching catalog track).

### Player / queue

- Desktop: current track at left, transport and seek centered, queue/volume at right; current controls stay reachable.
- Tablet: preserve transport prominence; simplify/hide noncritical labels only if accessible names remain.
- Mobile: current song and primary transport share the top row; seek spans the next row; bottom nav remains separate.
- Queue page clearly distinguishes current song and upcoming tracks. Removing a queue item must not accidentally play it.

### Dialogs

- Playlist creation should clearly state browser/session storage scope before save.
- Add-song dialog should distinguish Permanent Add and Temporary Add and disclose refresh behavior.
- Import errors must be actionable and must not silently replace existing playlists.
- Native dialog must support Escape, focus entry, and focus return.

## 5. Component inventory

| Component | Responsibility | Existing evidence |
| --- | --- | --- |
| App shell / sidebar | Navigation, brand, playlist links | `nav`, `shell()` |
| Mobile navigation | Core route links at small widths | `#bn`, `shell()` |
| Page router | Hash route to view rendering | `route()`, `V` |
| Track row | Track metadata, play, like, add/remove, duration | `trackRow()` |
| Track card/cover | Discovery card, theme artwork/equalizer treatment | `tCover()`, card helpers |
| Playlist card/header | Fixed playlist artwork, count/date/type/actions | `playlistCover()`, `plCard()`, `head()` |
| Search results | Search songs/artists/albums/playlists | `V.search()`, `V.results()` |
| Player | HTML audio state, seek, volume, modes, visualization | `P`, `playerHTML()`, `syncPlayer()` |
| Dialogs | Create, rename, add-song, import interactions | `openDlg()`, forms, add dialogs |
| Toast/status | Brief success/error announcements | `toast()` |
| YouTube promotion/footer | Channel promotion and brand context | `youtubePromo()`, `brandFooter()` |
| Catalog toolchain | Build-time catalog and check | `scripts/*.mjs` |

## 6. Visual and interaction rules

- **Color:** current dark charcoal surfaces with restrained mint accent. Keep semantic colors for like, error, temporary/permanent status distinct and sufficiently contrasted.
- **Typography:** current system/Inter fallback stack; use consistent body, heading, metadata, and tabular time scales.
- **Spacing:** align shell, cards, rows, and player to a small repeated spacing scale; avoid adding new gradients/glows.
- **Artwork:** use fixed playlist-to-asset mappings, square geometry, `object-fit: cover`, async decoding, and no random assignment. Keep one consistent fallback ratio.
- **Motion:** short hover/focus feedback; playback equalizer only when active; honor `prefers-reduced-motion` and avoid layout shifts.
- **Active state:** identify current track with a visual marker and accessible state/text, not color alone.
- **Pointer target:** maintain at least 44×44 CSS px for primary mobile controls where practical; ensure dense song-row actions remain separable.

## 7. Responsive behavior

Source breakpoints currently include 1024 px, 700 px, and 390 px. Proposed validation widths are 360, 390, 768, 1024, and 1440 px.

| Width class | Layout behavior |
| --- | --- |
| ≥1025 px | Full sidebar and multi-column song rows; fixed player uses three functional zones. |
| 701–1024 px | Compact icon sidebar; moderate card density; hide volume slider only if another reachable volume interaction exists. |
| ≤700 px | Bottom navigation, no sidebar, one-column player arrangement, condensed song row; maintain core controls. |
| ≤390 px | Two-column cards; text truncation; avoid clipping dialog actions/player controls. |

These are design targets, not proof the current build meets them.

## 8. Accessibility and usability checklist

- Visible focus indicator on every link/button/range/dialog action.
- Clear accessible labels for icon-only player controls and changing repeat/shuffle states.
- Seek and volume ranges report current values; keyboard arrows and Home/End behavior validated.
- Song selection from a row/cover has a keyboard equivalent; interactive child controls do not bubble into playback.
- Routes place focus sensibly on the main heading after navigation, without stealing focus during live search.
- Toasts announce outcome; playback errors are announced and actionable.
- Status is not conveyed only via artwork animation, mint color, or waveform.
- At 200% zoom, content reflows without loss of key actions.
- Check contrast and motion with reduced-motion enabled.

## 9. Data-flow view

```text
Maintainer: Songs/ ─► catalog scan ─► generated manifest ─► static deployment
                                               │
                                               ▼
Browser startup ─► validated Song records ─► Popular + ID-based playlist references
                                               │
                            search / rows / cards / queue / player
                                               │
                       localStorage + sessionStorage + runtime Audio element
```

The browser cannot inspect the host folder. Runtime folder watching is explicitly not part of this static architecture.
