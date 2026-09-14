# Editor modules

- `connections.js` owns attached relationship geometry, endpoint validation, duplication, and deletion.
- `clipboard.js` handles validated, portable selection snapshots and native copy/paste events. Internal relationships follow copied endpoints; partial relationships become free arrows. Clipboard text contains editable objects and artwork attribution, not figure-level evidence or artboard settings.
- `edits.js` finalizes edits by synchronizing relationships, reopening linked claim reviews, and validating portable serialization. It also centers inserted objects inside the current artboard.
- `workspaces.js` creates and lists separate local figures addressed by the workspace URL parameter. Each has its own autosave, backup, and conflict detection. The original workspace keeps the legacy storage key.
- `storage.js` retains the legacy autosave key, a previous valid save, protected recovery data, and conflict detection. Storage access is injected for failure tests.

Canvas events and history orchestration currently remain in `src/app.js`. Document validation and SVG serialization belong to the core layer. See `docs/trial-readiness.md` for recovery semantics and test commands.
