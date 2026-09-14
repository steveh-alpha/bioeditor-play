# Component library

`library.js` retains the original catalog and glyphs and combines the expanded biology/structure catalogs. `biology.js` contains original prototype schematics; `structures.js` defines bounded parametric generators; `catalog.js` supplies category and alias search. Scientific review is pending. See `docs/biology-library.md` and `docs/ip-and-licensing.md` for contributor and release requirements.

`immunoglobulins.js` adds independently versioned human/mouse antibody domains, assemblies and fragments. Species and subclass labels are identity metadata, not inferred functional equivalence. The prior `antibody.js` renderer remains frozen.

`therapeutics.js` adds the antibody/engager, ADC, cell-therapy and RIPTAC packs at revision `0.5.0`. Ordered, named modules are the persisted Edit-parts API for these IDs; retain them when adding future versions. Existing component renderers remain frozen. See `docs/therapeutic-packs.md`.

`viruses.js` adds 32 Virus & VLP particle, cargo, state and badge components at revision `0.6.0`. Named modules and their order are versioned; legacy virus, phage and targeted-LV artwork remains frozen. See `docs/virus-vlp-pack.md`.

`dna.js` provides the independently versioned 0.3.2 DNA schematic with continuous cubic backbones and alternating foreground crossings. The prior DNA renderers and editable leaf order remain frozen for saved figures; the configurable `dna-helix` structure is separate and unchanged.
