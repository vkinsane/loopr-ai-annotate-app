# Architecture

Flow: **Landing → How it works → Capture → Preview & quality → Annotate → Summary**

## Folder structure (by file type)

```
src/
├─ main.jsx                    # ThemeProvider + CssBaseline
├─ App.jsx                     # screen history, photo, quality, annotations reducer; picks the screen
├─ theme.js                    # MUI themes (light + dark camera), shared styles
├─ screens/
│  ├─ LandingScreen.jsx
│  ├─ HowItWorksScreen.jsx     # camera permission before Capture
│  ├─ CaptureScreen.jsx
│  ├─ CameraErrorScreen.jsx
│  ├─ PreviewScreen.jsx
│  ├─ AnnotateScreen.jsx
│  ├─ SummaryScreen.jsx        # read-only result + download
│  └─ __tests__/
├─ components/
│  ├─ StatusBadge/             # ✓ / ! / ✕ — used on 3 screens
│  ├─ LiveQualityChips/        # resolution, brightness, sharpness chips
│  ├─ AnnotationCanvas/        # photo + boxes + pointer gestures
│  ├─ AnnotationList/
│  ├─ QualityChecks/           # check rows: Preview (full), Annotate (compact)
│  ├─ ZoomViewer/              # full-screen pinch / scroll / drag zoom
│  ├─ PhotoWithBoxes/          # read-only photo + boxes (Summary)
│  ├─ ChoosePhotoButton/       # file picker fallback when there's no camera
│  ├─ HeroDemo/                # landing animation
│  ├─ ConfirmDialog/           # asks before work is lost
│  └─ __tests__/
├─ hooks/
│  ├─ useCamera.js             # stream + capturePhoto
│  ├─ useTorch.js
│  ├─ useLiveQuality.js
│  ├─ usePhotoQuality.js       # brightness + sharpness of the captured photo
│  ├─ useCameraPermission.js   # ask once on How it works
│  ├─ useScreenHistory.js      # current screen, in step with browser Back / Forward
│  ├─ index.js                # re-exports, for one-line imports
│  └─ __tests__/
└─ utils/
   ├─ cameraErrors.js          # pure
   ├─ quality.js               # pure: thresholds, measures, grades, banner text
   ├─ image.js                 # canvas: blob/video → small grey pixel array
   ├─ geometry.js              # pure
   ├─ annotations.js           # pure reducer
   ├─ exportPhoto.js           # canvas: photo + boxes → JPEG blob
   ├─ index.js                 # re-exports, for one-line imports
   └─ __tests__/
e2e/flow.spec.js               # one Playwright test, fake camera
```

## UI and theming
- **Material UI** (`@mui/material` + Emotion) for components; styled with the `sx` prop and theme values.
- **Imports:** one line per package (`import { Box, Chip } from '@mui/material'`). The production build tree-shakes unused components and icons; bundle size was unchanged when we switched.
- **Themes** in `theme.js`: light app theme plus a dark camera theme; `CssBaseline` provides the reset.
- **Design tokens live only in `theme.js`.** Style files use theme paths (`'primary.main'`, `'brand.lime'`, `typography: 'h1'`), never hex values.
  - Palette follows loopr.ai's public site: indigo `#3c4fc9` (actions), carbon `#05091c` (camera), lime `#cefe6f` (accent, other boxes). No Loopr logo or artwork.
  - Type scale: h1 22 · h2 17 · subtitle1 16 · body1 15 · body2 14 · caption 13 · overline 12 (uppercase labels).
  - Radius: 6px controls (`shape.borderRadius`), 16px cards (`CARD_RADIUS`). Spacing: MUI's 8px unit, 0.5 steps for 4px.
  - Shared component styles are theme overrides (large buttons, focus ring, alert titles), not repeated per screen.
- **Fonts:** Outfit (headings, buttons) and DM Sans (body), from Google Fonts in `index.html`. Fall back to `system-ui`.
- **AnnotationCanvas is custom**: MUI has no drawing tools, and this logic is a core evaluation point.
  - Boxes are stored in photo pixels and drawn as % of the frame, so they stay aligned at any size.
  - Boxes are HTML elements, not SVG: real text labels, fixed 44 px corner touch targets, free hit-testing.

## Rules
- `utils/` has no React. Everything except `image.js` is pure.
- `hooks/` wrap browser APIs with React lifecycle and cleanup.
- `components/` only for UI used in 2+ places or complex enough to test alone.
- One folder per component: `StatusBadge/StatusBadge.jsx` + `StatusBadge.styles.js`.
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
