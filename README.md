# Tonearm – Music Player

A responsive static music player for songs directed by Prajwal Khot using AI technology.

## Deploy

The project is ready to publish from its repository root. The Vercel configuration disables build and install commands and serves `.` as the output directory. Netlify and GitHub Pages can also publish the root directory as a static site.

Include `index.html`, `songs-manifest.js`, the complete `Songs/` directory, `assets/playlists/`, `assets/artists/`, `Photos/TONEARM logo.png`, and `Tonearm – Music Player.html` (kept as a redirect for existing links). All song and artwork URLs are relative to the site root; no local machine paths or runtime API are used.

## Updating songs

`Songs/` is the source of truth for Popular. When adding or removing supported audio files, regenerate and commit the manifest before deploying:

```sh
node scripts/generate-song-manifest.mjs
```

The manifest generator scans the folder, creates stable IDs from filenames, derives readable titles, and ignores duplicate names. A static browser cannot watch the server's folder after page load, so a new deployment uses the latest committed manifest. Refreshing or redeploying after a folder change will show the updated catalog.

Song `addedAt` values are recorded the first time a filename appears in the generated manifest and preserved on later regenerations. User playlist creation times are saved with the playlist; built-in playlist dates are saved locally when the app first initializes. Dates are displayed in each viewer's local format and time zone. Existing songs and playlists without historical dates receive a one-time catalog/migration timestamp because their original add time is not available.

Supported extensions: MP3, M4A, AAC, OGG/OGA, WAV, Opus, and FLAC, subject to browser codec support. The site includes built-in cover artwork and credits tracks to Prajwal Khot.

## Playlists

Popular is generated from the song manifest. Krishna Kanhaiya, Jai Sri Ram, Jai Hanuman, Ganesha, and Romantic keep their curated starter selections and protected names. Hanuman and Ganesha devotional tracks and clearly romantic titles are seeded into their matching permanent playlists; other new songs appear in Popular and can be added to any playlist. Keep the filename lists in `CURATED_PLAYLISTS` aligned with the theme selections in `index.html` when expanding those curated mixes. Playlist additions and user-created playlist contents are stored as song IDs, not copied song records. On each launch, the app filters playlist, liked-song, and recent-play references against the current manifest. Removing a song from `Songs/`, regenerating the manifest, and redeploying therefore clears that song from every playlist without deleting the playlists. Playlist names, artwork, and permanent protections remain independent of song changes.

New user playlists can be permanent or temporary. Permanent playlists are saved in the browser's local storage for that device and site address, including through refreshes, browser restarts, and redeployments at the same address. Temporary playlists are held in session storage and disappear when their browser tab/session ends. Both types remain editable while available.

The built-in mood mixes (Romantic & Love, Peaceful & Relaxing, Energetic & Powerful, Devotional & Spiritual, Emotional & Heartfelt, Calm & Late Night, Happy & Positive, and Trending & Popular) are permanent, read-only generated playlists. They reference the current catalog by song ID and are recalculated from filenames, titles, and curated devotional/romantic seeds on every page load. Update the `MOOD_PLAYLISTS` rules in `index.html` when new naming patterns need categorization; regenerate `songs-manifest.js` after changing `Songs/`. Trending & Popular shows the 12 most recently added catalog tracks, while Popular continues to contain the complete Songs/ catalog. Each mood playlist has a fixed artwork asset in `assets/playlists/`.

Each song added to a playlist can independently be added permanently or temporarily. Permanent additions are stored with the playlist; temporary additions remain in memory only and disappear on refresh. A permanent addition to a temporary playlist promotes that playlist to permanent so the saved song has a playlist to remain in. Playlist rows label each song's membership type.

Permanent playlists use the supplied square artwork, optimized as high-quality JPEGs in `assets/playlists/`, independent of their current song list. The original PNGs remain in `Photos/`. This keeps artwork stable as the catalog changes and across static deployments.

## Local preview

Open `index.html` directly, or serve the repository root with any static file server. No framework, external package, or backend is required.
