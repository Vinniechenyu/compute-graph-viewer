# Training Topology 2.5D Sample Spec

Status: draft for the next visual iteration

This document defines the target behavior and visual rules for
`training-topology-sample.html`. The current implementation is a prototype and
should not be treated as the final visual direction.

## Goal

Build a fixed 2.5D topology sample for accelerator-card training placement.
The first production-quality version only needs to visualize:

- Card-internal structure at a schematic level.
- Card-to-card links inside one 8-card node.
- Node-to-node links between the sampled nodes.
- Training overlays that can later map `rank -> card`, TP, PP, DP, and
  collective paths.

The page is a sample for future large-model training visualization. It should
communicate real topology relationships first, then visual polish.

## Current Problems

The latest prototype is not acceptable for the next iteration for these
reasons:

- The scene still reads as four vertical stacks of floating slabs, not as
  hardware nodes with cards and fabric.
- The floor plane consumes too much visual area, so the topology looks small and
  underpowered.
- The copied clay card style works in a single-card lab but loses definition
  when repeated 32 times.
- Light mode has low structural contrast; dark mode is more readable but still
  makes the card body look like a generic block.
- Rack and node cages are present but do not add enough semantic value. They
  should become quieter or be replaced by node-local planes.
- HCCS, UB, RoCE, and training overlays are visually close in hierarchy. The
  viewer needs clearer priority between card body, card-internal paths,
  node-local fabric, and cross-node paths.

## Sample Scope

Use a 32-card sample for the first usable page:

- 4 nodes.
- 8 cards per node.
- 2 cards per row, 4 rows per node.
- Each node is treated as one card-local fabric domain.
- Cross-node links show the same slot across nodes and selected training paths.

This is small enough to inspect card and link semantics, while still leaving a
clear path toward 4096-card training data.

## Non-Goals

Do not implement these in the first spec pass:

- Full 4096-card rendering.
- Real cabinet / switch cabinet layout.
- Drag rotate / orbit controls.
- Detailed board-level electronics.
- Performance charts, utilization heatmaps, or timeline playback.
- Exact private hardware mechanical geometry.

## View And Camera

The page must use a fixed orthographic 2.5D view.

Required camera behavior:

- Use orthographic projection only.
- No user drag rotation.
- No perspective distortion.
- Use a stable axonometric angle close to equal X/Z visibility.
- Default composition should fill 65-75% of the canvas width with topology, not
  floor.
- Node labels must remain readable at the default viewport.

Recommended starting camera:

```ts
position = [7.5, 6.2, 7.5]
lookAt = [0, 1.5, 0]
zoom = 82
```

The exact values should be tuned from screenshots, not guessed from code.

## Layout Model

Represent each 8-card node as a compact hardware tray, not a tall rack.

Node rules:

- Node footprint: shallow rectangular tray in X/Z.
- Card placement: two columns by four rows.
- Cards should sit on a node-local base plane with small Y offsets only.
- Avoid making each node read like a tower.
- Keep the four nodes close enough that cross-node links are visible without
  long empty runs.

Preferred 2x2 node arrangement:

```ts
nodePositions = [
  [-2.8, 0, -1.7],
  [ 2.8, 0, -1.7],
  [-2.8, 0,  1.7],
  [ 2.8, 0,  1.7],
]
```

## Card Rendering

Do not directly reuse the single-card render lab output without adapting it for
dense topology.

Card requirements:

- The card should read as a flat accelerator board with a visible top face,
  edge rim, main package, and ports.
- White-model / clay styling can remain the base direction, but dense-scene
  readability matters more than matching the lab exactly.
- Each card needs a clear silhouette at 32-card scale.
- Selected and hovered states should affect outline and local links, not repaint
  the entire object unless the selection must be obvious.
- Card internal detail should be sparse: package, port area, and one or two
  schematic lanes are enough.

Recommended next card style:

- Body: light clay or dark clay fill depending on scene theme.
- Outline: strong enough to separate overlapping cards.
- Main package: slightly raised, lower contrast than outline.
- Ports: small colored ticks on the edge where links originate.
- Internal UB/HBM schematic: two restrained short lanes, visible only when the
  card is selected or hovered.

## Light And Dark Mode

Light and dark are not just page themes. They are scene render modes.

Both modes must control:

- Canvas background.
- Floor / tray material.
- Grid contrast.
- Card clay fill.
- Card outline color.
- Node frame opacity.
- Floating legend / hover card colors.

Light mode target:

- Background: light gray, not pure white.
- Floor grid: low contrast.
- Cards: white clay with medium gray outlines.
- Links: slightly darker than in dark mode for legibility.

Dark mode target:

- Background: near black neutral.
- Floor grid: visible but quiet.
- Cards: dark clay with brighter outlines.
- Links: semantic colors can stay saturated, but inactive links should be
  subdued.

## Interconnect Layers

The scene needs a strict visual hierarchy.

Layer priority from lowest to highest:

1. Floor grid / tray base.
2. Node boundary or tray outline.
3. Card bodies.
4. Card internal schematic lines.
5. Node-local card-to-card fabric.
6. Cross-node links.
7. Selected / hovered path.

Recommended semantics:

- Card-internal schematic: cyan, thin, only visible on active card or active
  node.
- Node-local card-to-card fabric: cyan or blue, medium opacity.
- Same-slot cross-node replica path: violet, dashed.
- Pipeline / RoCE path: green, higher elevation than node-local links.
- Tensor group path: amber, local to one node or paired cards.

Inactive links should be present but quiet. Active links should be selected by
opacity and width, not by adding many extra colors.

## Interaction

Required interactions:

- Hover card: show card label and reveal card-internal schematic.
- Click card: persist selection and show its node-local peers.
- Click empty canvas: clear selection.
- Toggle overlay: physical, tensor, pipeline.
- Toggle render theme: light, dark.

Not required:

- Orbit controls.
- Dragging nodes.
- Multi-select.
- Search / rank lookup.

## UI Shell

Use PTO design system pieces for non-canvas UI.

Mapping:

- Header / toolbar: PTO toolbar tokens.
- Overlay switch: PTO segmented control.
- Light / dark switch: PTO segmented control.
- Sample metadata: PTO stat chip.
- Legend: PTO card / inspector pattern.
- Right rail: PTO inspector section pattern.
- Canvas topology colors and Three.js materials: data-viz exception.

Do not create a new private button, card, chip, or panel style for this module.

## Acceptance Criteria

A screenshot of the default state should satisfy all of the following:

- The view clearly reads as fixed orthographic 2.5D.
- The 32 cards are identifiable without zooming.
- Each 8-card node reads as a compact tray/domain, not a rack tower.
- The floor and outer frames do not dominate the scene.
- Light and dark modes look intentionally different and both remain legible.
- The selected card's local fabric and same-slot cross-node path are obvious.
- The scene has no overlapping UI text, clipped labels, or unreadable legend.
- Card-internal details are visible when active but do not clutter inactive
  cards.

## Implementation Plan

1. Replace vertical card stacks with tray-based node geometry.
2. Create a dense-scene card component derived from the clay style but optimized
   for repeated topology use.
3. Move UB/card-internal lanes into active-card rendering instead of drawing
   them on every card.
4. Re-tune the orthographic camera with screenshot checks at desktop width.
5. Reduce rack cage opacity or remove cage boxes in favor of tray outlines.
6. Keep Light/Dark as a first-class `sceneTheme` input.
7. Verify with production build and browser preview before adding training data.

## Data Contract Direction

Future training data should enter the view through a small topology contract:

```ts
interface TrainingTopologySample {
  nodes: TrainingNode[];
  cards: TrainingCard[];
  links: TrainingLink[];
  overlays: TrainingOverlay[];
}
```

Minimum required fields:

- `node.id`
- `node.position`
- `card.id`
- `card.nodeId`
- `card.slot`
- `card.position`
- `link.sourceCardId`
- `link.targetCardId`
- `link.kind`
- `overlay.kind`
- `overlay.cardIds`

This keeps physical topology separate from training placement overlays.

