# Architecture

Flow: **Capture → Preview & quality → Annotate**

## Folder structure (by file type)

```
src/
├─ main.tsx                    # ThemeProvider + CssBaseline
├─ App.tsx                     # step: capture | preview | annotate
├─ theme.ts                    # MUI theme: colours, font, radius
├─ types.ts                    # Photo, Annotation, CameraError, QualityCheck
├─ media.d.ts                  # ImageCapture + torch types missing from lib.dom
├─ screens/
│  ├─ CaptureScreen.tsx
│  ├─ PreviewScreen.tsx
│  ├─ AnnotateScreen.tsx
│  ├─ CameraErrorScreen.tsx
│  └─ __tests__/
├─ components/
│  ├─ StatusBadge.tsx          # ✓ / ! / ✕ — used on 3 screens
│  ├─ AnnotationCanvas.tsx     # photo + SVG boxes + gestures
│  ├─ DefectList.tsx
│  └─ __tests__/
├─ hooks/
│  ├─ useCamera.ts             # stream + capturePhoto
│  ├─ useTorch.ts
│  ├─ useLiveQuality.ts
│  └─ __tests__/
└─ utils/
   ├─ cameraErrors.ts          # pure
   ├─ quality.ts               # pure: thresholds, brightness, sharpness, grade
   ├─ image.ts                 # canvas: blob/video → small grey pixel array
   ├─ geometry.ts              # pure
   ├─ annotations.ts           # pure reducer
   └─ __tests__/
e2e/flow.spec.ts               # one Playwright test, fake camera
```

## UI and theming
- **Material UI** (`@mui/material` + Emotion) for components; styled with the `sx` prop and theme values.
- **Icons** from `@mui/icons-material`, imported one per file (`@mui/icons-material/FlashlightOn`) so only used icons are bundled.
- **One theme** in `theme.ts`; `CssBaseline` provides the reset and background.
- **Inter** loaded from Google Fonts in `index.html` (no npm package). Falls back to `system-ui` if the network blocks it.
- **AnnotationCanvas stays custom SVG**: MUI has no drawing tools, and this logic is a core evaluation point.

## Rules
- `utils/` has no React. Everything except `image.ts` is pure.
- `hooks/` wrap browser APIs with React lifecycle and cleanup.
- `components/` only for UI used in 2+ places or complex enough to test alone.
- `screens/` combine hooks, state and components.
- Tests in a `__tests__/` folder next to the code they test.
- Files are created when we build them, never as empty stubs.

## Code principles
- **Readable:** clear names, small single-job functions, early returns, named constants, comments explain *why*.
- **Simple:** KISS, YAGNI; small duplication beats the wrong abstraction.
- **Separated:** UI in components/screens, browser APIs in hooks, logic in pure `utils/`.
- **SOLID, React-style:** one reason to change per file; small typed props; hooks hide browser APIs behind small interfaces.
- **Reliable:** validate at boundaries (camera and browser APIs); never swallow errors; immutable state; test behaviour.
- **Maintainable:** small commits, delete dead code, record decisions and trade-offs here.

## Why by file type
- Familiar; clear layers: `utils` → `hooks` → `components` → `screens`.
- Trade-off: one feature spans folders; clear names keep it traceable.
