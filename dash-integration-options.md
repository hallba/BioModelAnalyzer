# BMA Canvas in Python/Dash: Integration Options

**Goal:** Embed a read-only, explorable view of BMA models (render variables, relationships, containers; pan/zoom; click to inspect) in a Python/Dash dashboard. No editing required.

---

## Current Canvas Architecture

The BMA web client canvas is a **custom SVG + HTML Canvas hybrid**:

- **Core library:** [InteractiveDataDisplay](https://github.com/microsoft/InteractiveDataDisplay) (Microsoft Research) handles pan/zoom/gestures
- **Component model:** jQuery widgets (`BMA.drawingsurface` in `src/bma.package/script/widgets/drawingsurface.ts`)
- **Rendering:** Layered SVG plots with custom Path2D geometry for each element type (see `src/bma.package/script/rendering/`)
- **Interactivity:** RxJS event streams
- **No built-in read-only mode** — editing is assumed throughout the presenter layer

### Element Types and Visual Styles

| Element | File | Visual |
|---------|------|--------|
| Default variable | `rendering/DefaultRenderInfo.ts` | Custom pill/rounded shape, magenta (`#f6c`) |
| Constant variable | `rendering/ConstantRenderInfo.ts` | Hexagonal, gray (`#CCC`) |
| Membrane receptor | `rendering/MembranaRenderInfo.ts` | Rotatable, blue (`#09c`) |
| Container (cell) | `rendering/ContainerRenderInfo.ts` | Nested ellipses, inner 106×123.5px |
| Activator edge | `rendering/RenderHelper.ts` | Bezier curve with arrow (`→`) |
| Inhibitor edge | `rendering/RenderHelper.ts` | Bezier curve with flat head (`⊣`) |

### Model JSON Format

```json
{
  "Model": {
    "Name": "string",
    "Variables": [
      { "Id": 1, "Name": "string", "Type": "Default|Constant|MembraneReceptor",
        "RangeFrom": 0, "RangeTo": 2, "Formula": "max(var(3),var(1))-var(5)" }
    ],
    "Relationships": [
      { "Id": 1, "FromVariable": 1, "ToVariable": 2, "Type": "Activator|Inhibitor" }
    ]
  },
  "Layout": {
    "Variables": [
      { "Id": 1, "PositionX": 500, "PositionY": 280, "Type": "Default",
        "ContainerId": null, "Angle": 0 }
    ],
    "Containers": [
      { "Id": 1, "Name": "Cell", "Size": 1, "PositionX": 250, "PositionY": 140 }
    ]
  }
}
```

Sample model files in `src/bma.package/data/` (e.g. `Firing_neuron_2_cells.json`).

---

## Option A: `dash-cytoscape` (recommended)

[dash-cytoscape](https://dash.plotly.com/cytoscape) is the standard Plotly/Dash network graph component. It maps naturally to the BMA model format.

### Mapping

| BMA concept | Cytoscape equivalent |
|-------------|---------------------|
| `Variable` | Node (class = type → custom style) |
| `Relationship` | Edge (class = Activator/Inhibitor → arrow style) |
| `Container` | Compound/parent node |
| `PositionX/Y` from Layout | Preset positions (`position: {x, y}`) |

### What to build

1. **Python converter**: `bma_json_to_cytoscape(model_json) -> list[dict]`
   - Variables → `{'data': {'id': ..., 'label': ..., 'formula': ..., 'range': ...}, 'position': {...}, 'classes': 'Default'}`
   - Containers → parent nodes with `{'data': {'id': 'c1', 'label': 'Cell'}, 'classes': 'Container'}`
   - Variables inside containers → set `'parent': 'c1'` on the node data
   - Relationships → `{'data': {'source': ..., 'target': ..., 'type': 'Activator'}}`

2. **Cytoscape stylesheet**: Approximate BMA visual style
   - Node shapes: `roundrectangle` for Default, `hexagon` for Constant, `ellipse` for MembraneReceptor
   - OR: use `background-image` with SVG data URIs extracted from the existing `*RenderInfo.ts` files for pixel-faithful shapes
   - Edge arrows: `triangle` for Activator, `tee` for Inhibitor

3. **Dash layout**: Click a node → sidebar panel shows `Name`, `Formula`, `Range`

### Key dependencies

```
pip install dash dash-cytoscape
```

### Effort estimate

- Converter function: ~50 lines Python
- Stylesheet approximation: ~1–2 hours
- Pixel-faithful shapes (SVG data URIs): additional ~2–3 hours

### SVG shape sources (for pixel-faithful rendering)

The exact Path2D geometry for each node type lives in:
- `src/bma.package/script/rendering/DefaultRenderInfo.ts` — two paths: fill geometry + stroke geometry
- `src/bma.package/script/rendering/ConstantRenderInfo.ts`
- `src/bma.package/script/rendering/MembranaRenderInfo.ts`
- `src/bma.package/script/rendering/ContainerRenderInfo.ts`
- Constants (sizes, colours): `src/bma.package/script/rendering/renderingconstants.ts`

These can be extracted and embedded as SVG `data:` URIs in the Cytoscape stylesheet's `background-image` property.

---

## Option B: Wrap existing BMA canvas as a Dash custom component

Build a Plotly Dash custom component (React-based) that wraps the compiled `bma.package` JS.

### What to build

1. Use `dash-component-boilerplate` (cookiecutter template) to scaffold a React component
2. In the React component, inject the compiled `bma.package` bundle and the InteractiveDataDisplay JS into the page
3. Mount the jQuery `drawingsurface` widget inside a `ref`-attached DOM node
4. Disable editing: override/nullify the relevant command handlers in `DesignSurfacePresenter` — specifically all `AddElement*`, `DeleteSelected`, `PasteModel` etc. commands (see `src/bma.package/script/presenters/presenters.ts`)
5. Expose `model` as a React/Dash prop; pass it to the widget on update

### Bundle contents needed

- `bma.package` compiled output (JS + CSS)
- InteractiveDataDisplay (`src/bma.package/js/`)
- jQuery 2.1.4 + jQuery UI 1.11.4
- RxJS lite

### Effort estimate

High. The jQuery↔React bridge is non-trivial, and suppressing edit mode requires understanding the full command/event flow through `presenters.ts`.

### Advantage

Pixel-perfect rendering, identical to the BMA web app. If visual fidelity is critical (e.g. for publications or matched branding), this is the only option that guarantees it without reimplementing the renderers.

---

## Option C: Iframe embedding BmaLinuxApi

Run BmaLinuxApi (Docker container, port 8020) alongside the Dash app. Embed via `html.Iframe`.

```python
html.Iframe(src="http://localhost:8020/tool.html?model=...", style={"width": "100%", "height": "600px"})
```

### Limitations

- Requires BmaLinuxApi container running at all times
- Cross-origin iframe restrictions limit Dash ↔ canvas communication (postMessage workaround possible but complex)
- Full editing toolbar visible; no clean read-only presentation
- Model selection / parameter passing would need URL query string or postMessage protocol

### Advantage

Zero reimplementation. All rendering, pan/zoom, and analysis features immediately available.

---

## Decision Criteria

| | Option A (cytoscape) | Option B (custom component) | Option C (iframe) |
|--|--|--|--|
| Effort | Low | High | Near zero |
| Visual fidelity | Approximate (improvable) | Exact | Exact |
| Dash integration | Full (callbacks, state) | Full | Limited |
| Maintenance | Low | High | Low |
| Read-only ease | Built-in | Requires disabling edits | No |
| Dependencies | pip only | npm + Dash build toolchain | Docker |

**Recommended starting point:** Option A. If visual fidelity later becomes a requirement, layer in the SVG shape data URIs from the existing `*RenderInfo.ts` files before considering Option B.

---

## Next Steps (if implementing Option A)

1. Write `bma_to_cytoscape.py` converter (Variables + Containers + Relationships → cytoscape elements)
2. Define Cytoscape stylesheet (node colours/shapes, edge arrow types)
3. Wire up click callback: selected node ID → fetch variable details → display panel
4. Test with `src/bma.package/data/Firing_neuron_2_cells.json`
5. Optionally: extract SVG paths from `*RenderInfo.ts` and embed as `background-image` data URIs for accurate shapes

## Next Steps (if implementing Option B)

1. Scaffold with `dash-component-boilerplate`
2. Identify and list all editing commands to suppress in `src/bma.package/script/presenters/presenters.ts`
3. Build jQuery widget bridge in React `useEffect`
4. Test with sample model JSON
