# Worldview map exploration

Open /prototypes/worldview-map?v=2 for Prism. The picker now contains Baseline (1) and Prism (2); left/right arrows switch and R remounts. The old ?v=5 Prism link still works.

Prism has been promoted to the landing page and single-subject result map. This comparison route retains the original Baseline; its Prism entry now imports the production component. Shared palette tokens live in `components/worldview/prism-theme.css`, the exportable SVG field in `components/worldview/prism-field.tsx`, and the landing implementation in `components/landing/prism.tsx`.

Prism uses all 43 saved portraits, exact edge-to-edge coordinates and a color field. Hover or keyboard focus on a portrait or the original people grid dims the other map portraits. Both link directly to persona results. There is no persistent selection, inspector, or searchable directory. Doom and Bloom sit outside the left and right edges, aligned to the horizontal axis. Baseline is unchanged. Keynote, Precision and Atlas implementations were removed.

The concept images below are historical design references generated with the built-in image generation tool. Their invented positions are not used in the implementation.

## Image generation prompts

### Keynote

Use case: ui-mockup. Create a high-fidelity desktop website concept for Doom or Bloom, an AI worldview map. Direction: Keynote, inspired by the radical simplicity of an Apple product keynote. Warm white background, enormous beautifully kerned black headline "How will AI change the world?", generous whitespace. Wide Cartesian scatterplot with a very subtle pale coral to pale mint background wash, no box border, hairline cross axes. Horizontal labels "Doom" on left and "Bloom" on right. Vertical labels "Civilizational change" above and "Incremental change" below, completely outside plotting area. Forty tiny precise dots concentrated toward top, only three circular black and white portraits highlighted with short name labels, no crowded portrait cloud, no decorative elements. Under plot a single elegant person selector strip and small text "Simulated worldviews". At top a minimal small Doom or Bloom wordmark. A quiet black pill CTA "Find your place". Publication-level typography, extraordinarily clear visual hierarchy. Flat front-on web design, not a device mockup. 1536x1024 landscape.

### Prism

Use case: ui-mockup. High-end experimental web UI for "Doom or Bloom". Direction Prism: Swiss editorial meets a luminous physical color study. Full front-on desktop webpage, bone-white margins, huge black title "A world of possible futures." Small subtitle "Where do you land?" Central wide rectangular Cartesian map, four softly blending luminous corners: burnt coral upper left, vivid chartreuse upper right, pale lavender lower left, icy mint lower right. Flat beautiful subtle grain-free color, no 3D, no decoration. Thin dark central cross axes. Forty tiny dark dots clustered in upper third; just one selected dot has an outlined ring, all other dots tiny. Labels OUTSIDE the map: "Civilizational change" centered above, "Incremental change" below, "Doom" left and "Bloom" right. Beneath the plot one selected person inspector with small circular monochrome portrait, name "Dario Amodei", caption "Explore this simulated worldview", and restrained button. Huge whitespace, exquisite typographic hierarchy, visually striking but extremely simple. No legends, no cards, no random elements, no arrow glyphs. 1536x1024 landscape.

## Validation

TypeScript and scoped lint passed. Browser inspection verified the two-variant picker, all portraits, original people grid, horizontal axis labels and focus dimming.
