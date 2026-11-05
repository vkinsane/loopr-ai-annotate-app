# Architecture

Flow: **Capture → Preview & quality → Annotate**

## Folder structure (by file type)

```
src/
├─ main.jsx                    # ThemeProvider + CssBaseline
├─ App.jsx                     # step: capture | preview | annotate
├─ theme.js                    # MUI themes (light + dark camera), shared styles
├─ screens/
│  ├─ CaptureScreen.jsx
│  ├─ PreviewScreen.jsx
│  ├─ AnnotateScreen.jsx
│  ├─ CameraErrorScreen.jsx
│  └─ __tests__/
├─ components/
│  ├─ StatusBadge.jsx          # ✓ / ! / ✕ — used on 3 screens
│  ├─ AnnotationCanvas.jsx     # photo + SVG boxes + gestures
│  ├─ DefectList.jsx
│  └─ __tests__/
├─ hooks/
│  ├─ useCamera.js             # stream + capturePhoto
│  ├─ useTorch.js
│  ├─ useLiveQuality.js
│  └─ __tests__/
└─ utils/
   ├─ cameraErrors.js          # pure
   ├─ quality.js               # pure: thresholds, brightness, sharpness, grade
   ├─ image.js                 # canvas: blob/video → small grey pixel array
   ├─ geometry.js              # pure
   ├─ annotations.js           # pure reducer
   └─ __tests__/
e2e/flow.spec.js               # one Playwright test, fake camera
```

## UI and theming
- **Material UI** (`@mui/material` + Emotion) for components; styled with the `sx` prop and theme values.
- **Icons** from `@mui/icons-material`, imported one per file (`@mui/icons-material/FlashlightOn`) so only used icons are bundled.
- **Themes** in `theme.js`: light app theme plus a dark camera theme; `CssBaseline` provides the reset.
- **Inter** loaded from Google Fonts in `index.html` (no npm package). Falls back to `system-ui` if the network blocks it.
- **AnnotationCanvas stays custom SVG**: MUI has no drawing tools, and this logic is a core evaluation point.

## Rules
- `utils/` has no React. Everything except `image.js` is pure.
- `hooks/` wrap browser APIs with React lifecycle and cleanup.
- `components/` only for UI used in 2+ places or complex enough to test alone.
- `screens/` combine hooks, state and components.
- Tests in a `__tests__/` folder next to the code they test.
- Files are created when we build them, never as empty stubs.

## Language
- **JavaScript (JSX), no TypeScript:** chosen to cut type noise. Trade-off: no compile-time checks, so data shapes are described in short doc comments and oxlint catches common mistakes.

## Code principles
- **Readable:** clear names, small single-job functions, early returns, named constants, comments explain *why*.
- **Simple:** KISS, YAGNI; small duplication beats the wrong abstraction.
- **Separated:** UI in components/screens, browser APIs in hooks, logic in pure `utils/`.
- **SOLID, React-style:** one reason to change per file; small focused props; hooks hide browser APIs behind small interfaces.
- **Reliable:** validate at boundaries (camera and browser APIs); never swallow errors; immutable state; test behaviour.
- **Maintainable:** small commits, delete dead code, record decisions and trade-offs here.

## Why by file type
- Familiar; clear layers: `utils` → `hooks` → `components` → `screens`.
- Trade-off: one feature spans folders; clear names keep it traceable.
