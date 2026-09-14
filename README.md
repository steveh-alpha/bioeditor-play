# bioeditor-play

Internal BioEditor static deploy for Vaelise testing.

- **Source SHA:** `6e99026b72ddc5c94cd8b5896eb95fc8499eb6b9` (virus/VLP packs)
- **Custom domain (CNAME):** `bioeditor.vaelise.com`
- **Gate:** Cloudflare Access email OTP allowlist only (no shared password overlay)
- **GitHub Pages URL:** https://steveh-alpha.github.io/bioeditor-play/

## Deploy status (2026-09-14)

Scaffold + partial asset tree pushed. **Still missing from `main` (required for a working app):**

- `app.js`, `style.css`, `core.js`
- `assets/library.js`, `assets/viruses.js`, `assets/biology.js`, `assets/technical.js`, `assets/therapeutics.js`
- replace `assets/immunoglobulins.js` PLACEHOLDER with real content
- `templates/antibodies.js`, `templates/diagrams.js`, `templates/therapeutics.js`, `templates/viruses.js`

Local built tree ready at box path `/workspace/bioeditor-play-dist/` (synced from BioEditor HEAD build).

## Enable Pages (if Actions workflow is not enough)

```bash
gh api -X POST repos/steveh-alpha/bioeditor-play/pages -f build_type=legacy -f source[branch]=main -f source[path]=/
```

Or approve the `github-pages` environment for `.github/workflows/pages.yml`.

## DNS (Porkbun — for Elon)

`CNAME` record: `bioeditor` → `steveh-alpha.github.io`
