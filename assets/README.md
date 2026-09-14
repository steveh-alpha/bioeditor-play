# Component library

`library.js` retains the original catalog and glyphs and combines the expanded biology/structure catalogs. `biology.js` contains original prototype schematics; `structures.js` defines bounded parametric generators; `catalog.js` supplies category and alias search. Scientific review is pending. See `docs/biology-library.md` and `docs/ip-and-licensing.md` for contributor and release requirements.

`immunoglobulins.js` adds independently versioned human/mouse antibody domains, assemblies and fragments. Species and subclass labels are identity metadata, not inferred functional equivalence. The prior `antibody.js` renderer remains frozen.

`therapeutics.js` adds the antibody/engager, ADC, cell-therapy and RIPTAC packs at revision `0.5.0`. Ordered, named modules are the persisted Edit-parts API for these IDs; retain them when adding future versions. Existing component renderers remain frozen. See `docs/therapeutic-packs.md`.
