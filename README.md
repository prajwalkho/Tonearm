# Tonearm

A responsive, single-page music player for songs directed by Prajwal Khot using AI technology.

## Run locally

Open `index.html` in a modern browser. Keep the `Songs` folder beside it; the player loads MP3s from that folder using relative URLs.

## Deploy

This is a static site. There is no package installation, build command, or server-side configuration.

1. Publish the repository root as the site root.
2. Leave the build command empty and use `.` as the publish/output directory if your host asks for one.
3. Include `index.html` and the complete `Songs/` folder in the deployment.

The original `Tonearm – Music Player.html` filename redirects to `index.html` for existing links. The player and all 13 songs are in `index.html` and `Songs/`.

## Credits and assets

Song titles come from the supplied filenames. The project identifies Prajwal Khot as director and credits AI technology. The supplied MP3s do not include standard artist or album-art tags, so the player uses its built-in stylized covers and collection presentation.
