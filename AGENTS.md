# Portfolio — Scroll Study

## Project and publication

- Current authorization (2026-11-14): the user explicitly released the local-preview hold and requested synchronization and publication at the shorter GitHub Pages address https://xuke916.github.io/. Publish checked accumulated website changes to the renamed repository. Future explicit preview-only requests still take precedence.

- Edit the existing website in `dist/`. Preserve its design, content, fluid animation, scroll timeline, keyboard/touch behavior, and hash routes unless the user requests changes.
- GitHub repository: `https://github.com/Xuke916/xuke916.github.io`.
- Canonical branch: `main`. Use the `github` remote for this repository. Do not force-push or overwrite unrelated changes.
- GitHub Pages target: `https://xuke916.github.io/`. Check `docs/PUBLISHING.md` for actual activation status.
- Original Sites project: `appgprj_6ae9bb5f35c481918485f9d904ba247f`; retain its existing audience and source workflow when updating that copy.
- The user has explicitly requested that future website edits in this chat be checked, synchronized to this same GitHub repository, and published by default. Do not ask again for routine commits, pushes, or publication within that scope.
- If the user says “只预览” or requests preview-only work, keep changes local. Do not push `main`, dispatch deployment, or publish to Sites until the user confirms.
- Run `pnpm check` before pushing. Inspect only the intended changed files. A passing local check alone is not deployment success: wait for the GitHub Actions workflow, inspect failures, and verify the returned live URL.
- Keep Pages URLs and assets relative to the repository subdirectory. Continue using hash routes so deep links can be shared/refreshed without server rewrites.
- Never commit credentials, original résumés/documents, reference recordings, private files, dependency caches, or local tooling. Do not add personal contact details from source documents unless explicitly requested.
- Record workflow or repository changes in `README.md` and `docs/PUBLISHING.md`. Do not claim a deployment succeeded if the account/Pages setup or workflow is still blocked.
