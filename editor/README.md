# Editor modules

- `connections.js` owns attached relationship geometry, endpoint validation, duplication, and deletion.
- `edits.js` finalizes edits by synchronizing relationships, reopening linked claim reviews, and validating portable serialization. It also centers inserted objects inside the current artboard.
- `storage.js` retains the legacy autosave key, a previous valid save, protected recovery data, and conflict detection. Storage access is injected for failure tests.

Canvas events and history orchestration currently remain in `src/app.js`. Document validation and SVG serialization belong to the core layer. See `docs/trial-readiness.md` for recovery semantics and test commands.
