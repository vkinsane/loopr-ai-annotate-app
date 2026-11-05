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
│  ├─ LiveQualityChips.jsx     # resolution, brightness, sharpness chips
│  ├─ AnnotationCanvas.jsx     # photo + SVG boxes + gestures
│  ├─ DefectList.jsx
│  └─ __tests__/
├─ hooks/
│  ├─ useCamera.js             # stream + capturePhoto
│  ├─ useTorch.js
│  ├─ useLiveQuality.js
│  ├─ usePhotoQuality.js       # brightness + sharpness of the captured photo
│  ├─ index.js                # re-exports, for one-line imports
│  └─ __tests__/
└─ utils/
   ├─ cameraErrors.js          # pure
   ├─ quality.js               # pure: thresholds, measures, grades, banner text
   ├─ image.js                 # canvas: blob/video → small grey pixel array
   ├─ geometry.js              # pure
   ├─ annotations.js           # pure reducer
   ├─ index.js                 # re-exports, for one-line imports
   └─ __tests__/
e2e/flow.spec.js               # one Playwright test, fake camera
```

## UI and theming
- **Material UI** (`@mui/material` + Emotion) for components; styled with the `sx` prop and theme values.
- **Imports:** one line per package (`import { Box, Chip } from '@mui/material'`). The production build tree-shakes unused components and icons; bundle size was unchanged when we switched.
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
- No component file over 250 lines; split out a component or pure util when it grows.
- A private helper used in only one place is inlined. Exported `utils/` functions stay separate (pure, testable).
- One import line per module or folder: `import { useCamera, useTorch } from '../hooks'`.
- Comments only where the code can't say it: browser quirks, uncalibrated values, data shapes.
- Styles live in a `*.styles.js` file next to their component (`export const styles = { … }`); JSX uses `sx={styles.root}`. State-dependent styles are functions: `sx={styles.torch(on)}`.

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
