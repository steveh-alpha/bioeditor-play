# bioeditor-play

Static GitHub Pages deployment of [BioEditor](https://github.com/steveh-alpha/BioEditor). The existing workflow publishes this repository's root on every push to `main`.

- Public homepage: https://bioeditor.vaelise.com/ — Cloudflare serves `marketing/index.html`.
- Gated editor: https://editor.vaelise.com/ — Cloudflare Access remains unchanged. The Pages root `index.html` preserves the editor shell; `editor.html` is also available.
- Public homepage resources and illustration gallery live under `marketing/releases/<SOURCE_SHA>/`. Marketing URLs point to that prefix and editor links point to the gated hostname.
- Editor JavaScript, CSS, asset modules, and templates at the Pages root are byte-for-byte source build files. The obsolete gzip loader has been removed.
- `SOURCE_SHA` identifies the exact source commit. `BUILD_MANIFEST.json` contains SHA-256 hashes for every source build file and documents the hosting adaptations.

To publish: run the source repo's locked install, checks, and build, then run `node scripts/publish.mjs /absolute/path/to/BioEditor` here. Review, commit, and push to `main`; wait for the Pages workflow and verify both hostnames plus origin asset hashes. Preserve `.github/` and `.nojekyll`.
