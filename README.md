# Tonearm Music Player

Tonearm is a responsive, static music library and player for tracks directed by Prajwal Khot using AI technology. It runs in the browser and does not require an application server, account, database, framework, or third-party music API.

# Tonearm Music Player

Welcome to Tonearm, your personal music listening experience. Explore your favorite songs, organize playlists, and discover music to match your mood. From relaxing and romantic tracks to devotional music, Tonearm brings your listening experience together in one place.

Open Tonearm and find the music that fits your moment.

https://tonearm.vercel.app/

## Start here

- [System study](SYSTEM_STUDY.md) explains what the checked-out project currently does and what could not be verified.
- [System design](SYSTEM_DESIGN.md) shows the static architecture, data flow, storage boundaries, and deployment model.
- [Software Requirements Specification](SRS.md) proposes testable requirements for the next improvement phase. All new requirements are proposals pending review.
- [UI/UX specification](UI_UX_SPECIFICATION.md) maps the current navigation and describes a restrained responsive design direction.
- [Improvement backlog](IMPROVEMENT_BACKLOG.md) prioritizes work and traces each item to requirements and acceptance criteria.
- [Improvement roadmap](IMPROVEMENT_ROADMAP.md) groups work into review, verification, reliability, UX, and release phases.
- [Future improvements](FUTURE_IMPROVEMENTS.md) separates implemented upgrades from proposed next steps and release evidence.
- [Traceability matrix](TRACEABILITY_MATRIX.md) links requirements to source evidence, backlog items, tests, and evidence status.
- [Test plan](TEST_PLAN.md) provides manual, automated, accessibility, and regression checks.
- [Changelog](CHANGELOG.md) records the documentation study.

## Run locally

Open `index.html` directly, or serve the repository root using any static file server. Serving over `http://localhost` is recommended when checking browser storage and media behavior, since storage rules for `file://` URLs vary by browser.

## Project contents

| Path | Purpose |
| --- | --- |
| `index.html` | Single-page application, markup, styles, route rendering, player, and playlist behavior |
| `songs-manifest.js` | Generated browser catalog loaded by `index.html` |
| `Songs/` | Source audio files; checked-out project contains 68 files (65 MP3, 3 M4A) |
| `Photos/` | Tonearm logo and supplied playlist artwork |
| `assets/` | Artist artwork and vector/legacy playlist artwork |
| `scripts/song-catalog.mjs` | Scans supported audio files and derives metadata and durations |
| `scripts/generate-song-manifest.mjs` | Regenerates the static song manifest |
| `scripts/verify-catalog.mjs` | Checks the generated manifest against the source audio folder |
| `.github/workflows/catalog-check.yml` | Runs catalog, exact-case active artwork/logo, app-check assets, and audit-script syntax checks on pushes and pull requests |
| `scripts/playback-check.html` | Browser audio smoke check for all manifest tracks |
| `scripts/app-player-check.html` and `scripts/app-player-check.js` | Same-origin interactive recorder for the actual app's player controls and visible state |
| `Tonearm – Music Player.html` | Redirect for an earlier entry point |
| `vercel.json` | Static deployment configuration for publishing the repository root |

There is no `package.json` or installed application dependency in the repository. The catalog scripts use Node.js built-ins and do not need a package install.

Song rows can be focused with the keyboard; Enter or Space starts the focused row. The catalog check also verifies exact-case paths for active playlist art, the brand logo, director art, and favicon. GitHub Actions runs this release check automatically. It does not verify browser playback or the deployed site; see [FUTURE_IMPROVEMENTS.md](FUTURE_IMPROVEMENTS.md) and [TEST_PLAN.md](TEST_PLAN.md).

## Update the catalog

`Songs/` is the source of truth for Popular. A static browser cannot watch the deployed server's folder after page load. After adding or removing audio files, regenerate and commit the manifest, then deploy the updated repository:

```sh
node scripts/generate-song-manifest.mjs
node scripts/verify-catalog.mjs
```

The generator creates stable numeric IDs from filenames; reads embedded title/album values where supported; credits tracks to Prajwal Khot; derives titles from filenames when needed; records durations for MP3, M4A, and WAV; and preserves existing `addedAt` timestamps for songs already cataloged. Renaming a file creates a new ID. The browser filters saved song references against the current manifest on launch.

## Player and playlists

The player uses the browser's `HTMLAudioElement`. It supports Play/Pause, Next/Previous, seek, volume/mute, shuffle, repeat, queue, liked songs, and recently played. The current player implementation and exact edge cases should be exercised using the test plan; the included audio smoke page is not a substitute for an end-to-end app test.

The application includes five protected curated playlists (Krishna Kanhaiya, Jai Sri Ram, Jai Hanuman, Ganesha, Romantic), Popular, eight generated mood mixes, and user-created playlists. Permanent user playlists are saved in browser `localStorage` for the current origin and can be exported/imported as JSON. Temporary playlists use `sessionStorage`; temporary song additions are in-memory and disappear on refresh. These browser storage mechanisms do not synchronize between devices or browser profiles.

## Verify playback

For a browser-level file check, serve the repository root and open `scripts/playback-check.html`. Start **Run checks for all songs**. The page tries to load, seek, briefly play/pause, and set volume for every manifest entry. It checks the browser's audio support for each file, but does not drive the application's own controls, playlist flows, or visual state. Use [TEST_PLAN.md](TEST_PLAN.md) for the full proposed release test.

For app-level manual verification, serve the repository root and open `scripts/app-player-check.html`. Start recording, then interact with the embedded Tonearm app: select songs and use Play/Pause, Seek, Next/Previous, Volume, Shuffle, and Repeat. The recorder checks observed browser audio/player state and can export a JSON report. The page needs same-origin HTTP access; opening it through `file://` may prevent the parent from inspecting the embedded app. It is an interactive verification aid, not unattended browser automation and not a substitute for cross-browser/deployed-site testing.

## Deploy

The current `vercel.json` sets no build step and publishes `.`. Deploy from the repository root and include `index.html`, `songs-manifest.js`, all of `Songs/`, `Photos/`, and `assets/`. The live Vercel site could not be inspected by the available web reader during this study, so the deployed result remains unverified here.

## Project credits

The player promotes `https://youtube.com/@pk_lord`. The project describes its catalog as music directed by Prajwal Khot and created using AI technology.
