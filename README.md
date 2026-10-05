# Tonearm

A responsive, single-page music player for songs directed by Prajwal Khot using AI technology.

## Run locally

For live folder synchronization, use Node.js 18 or newer and run `npm run dev`. Open `http://127.0.0.1:4173`. The local server scans `Songs/` on each library check; the open player refreshes its catalog every three seconds. Added and deleted songs appear without restarting the server or reloading the page.

You can also open `index.html` directly. That mode uses the generated `songs-manifest.js` snapshot and continues to play the catalog it contains. A browser opened directly from disk cannot watch the folder; run `npm run build` after changing `Songs/`, then reload the page.

## Deploy

The deployed site is static; the included Node.js scripts generate the song manifest during build.

1. Run `npm run build` before deploying. It scans `Songs/` and regenerates `songs-manifest.js`.
2. Publish the repository root as the site root; leave the build command empty if the manifest has already been generated, or use `npm run build` as the build command.
3. Include `index.html`, `songs-manifest.js`, the complete `Songs/` folder, and the original redirect page in the deployment.

A static host serves the manifest snapshot. When songs change after deployment, rebuild and redeploy. Continuous synchronization on a hosted site requires a server/API with access to the live `Songs/` directory; `npm run dev` provides that API locally.

The original `Tonearm – Music Player.html` filename redirects to `index.html` for existing links. The player and all 14 currently supplied songs are in `index.html` and `Songs/`.

## Permanent playlists

The player seeds four curated playlists on every launch: Krishna Kanhaiya, Jai Sri Ram, Jai Hanuman, and Ganesha. Their names and song selections are protected from edits and deletion. A fifth protected **Popular** playlist is rebuilt from the current song catalog. Playlists created in the app remain editable and are saved in the browser; removed tracks are pruned from saved playlists.

## Credits and assets

Song titles come from the supplied filenames, with underscores and dashes converted to spaces. The project identifies Prajwal Khot as director and credits AI technology. The supplied audio files do not include standard artist or album-art tags, so the player uses its built-in stylized covers and collection presentation. Supported extensions are MP3, M4A, AAC, OGG/OGA, WAV, Opus, and FLAC (subject to browser codec support).
