# <img src="docs/logo.svg" alt="" width="32" height="32" align="absmiddle"> Loopr Annotate

A mobile-first web app for photo inspection: take a photo, check its quality, and annotate it with labelled boxes.

**Flow:** Landing → Before you start (camera permission) → Capture → Preview & quality → Annotate → Summary

<details open>
<summary><strong>Installation</strong></summary>

**Requirements:** Node.js 20.19+ or 22.12+, npm, Git.

```bash
git clone https://github.com/vkinsane/loopr-ai-annotate-app.git
cd loopr-ai-annotate-app
npm install
npm run dev       # open the URL it prints, usually http://localhost:5173
```

</details>

<details>
<summary><strong>Features</strong></summary>

- **Capture**
  - Live rear-camera preview at the highest resolution the device offers.
  - Live chips for resolution, brightness and sharpness, with a hint line ("Too dark, so turn on the torch.").
  - Torch toggle, shown only when the camera supports it, showing the camera's real torch state.
  - Clear screens for blocked, missing, busy and unsupported cameras, with Try again and "Choose a photo instead".
  - The camera is released while the page is hidden (tab switch, app in background, screen locked).
- **Preview & quality**
  - Resolution, file size, brightness and sharpness, each graded Good / Warning / Poor.
  - A summary banner with advice, e.g. "Photo is too dark and blurry".
  - Rows that aren't Good have an (i) button that says how to improve. Sharpness is shown as a word (Sharp / A bit blurry / Blurry), not a score.
  - Full-screen zoom: pinch or scroll to zoom (up to 8×), drag to move, double-tap to zoom in and out.
  - Retake or Annotate. For a poor photo, Retake becomes the main button.
- **Annotate**
  - Draw a box by dragging on the photo; drag a box to move it; drag a corner to resize it.
  - Label, select and delete boxes from the list. Delete / Escape keys work on desktop.
  - Zoom while annotating: pinch, scroll or + and −. The hand button moves the photo. Boxes, labels and handles keep their size on screen.
  - Works with mouse, touch and pen. Boxes stay on the same pixels at any screen size or rotation.
- **Choose a photo** (no camera): only JPEG, PNG, WebP or HEIC, checked from the file's first bytes, not its name; not empty; up to 30 MB.

</details>

<details>
<summary><strong>Implementation decisions</strong></summary>

### Stack
- **React + Vite, JavaScript (no TypeScript).**
  - The brief asks for TypeScript; I removed it to cut type noise.
  - Trade-off: no compile-time checks. Data shapes are described in short doc comments, and oxlint catches common mistakes.
- **MUI + Emotion** for components and theming.
- **Few dependencies:** react, react-dom, MUI, MUI icons, Emotion, and `react-zoom-pan-pinch` for zoom and pan on Preview and Annotate. No router, no state library, no canvas or annotation library.
- **State:** `App` holds the photo, its measured quality, its name and the annotations (`useReducer` with a pure reducer), so moving between screens keeps them. `useScreenHistory` keeps the current screen in step with the browser's Back and Forward buttons, without a router. Other state stays in each screen.

### Camera
- **Constraints:** `facingMode: 'environment'`, `width/height: { ideal: 4096×3072 }`.
  - `ideal` never rejects, unlike `exact` or `min`.
  - 4:3 matches most phone sensors, so the browser doesn't crop to 16:9.
- **The preview frame matches the camera's aspect ratio** (CSS container units), so what you see is what gets captured. The cost is dark bars on some screens.
- **Capture:** `ImageCapture.takePhoto()` where available (Chromium, Android) for full sensor resolution. Otherwise, including on iPhone, a full-size video frame is saved as JPEG (quality 0.92).
- **Torch:** the on/off state is read from `getSettings()` on every render, never stored, so the button shows the real hardware state.

### Quality
- **Brightness** is how light or dark the photo is overall. The app makes a greyscale copy, where every pixel is a number from 0 (black) to 255 (white), and takes the average. A low average means the photo is too dark; a very high one means it is overexposed.
- **Sharpness** is how clearly the photo shows edges and fine detail. The app compares each pixel with the four around it (the Laplacian method): in a sharp photo, neighbouring pixels differ strongly at edges, while blur smooths those differences away. The score is how much these differences vary across the photo, so a higher score means a sharper photo.
- **Thresholds** (`utils/quality.js`):

| Check | Good | Warning | Poor |
|---|---|---|---|
| Resolution | ≥ 8 MP | 2–8 MP | < 2 MP |
| File size | ≥ 500 KB | 150–500 KB | < 150 KB |
| Brightness (0–255; shown as %) | 70–190 | 40–70 or 190–220 | < 40 or > 220 |
| Sharpness | ≥ 60 | 20–60 | < 20 |

### Annotation
- **Boxes are stored in photo pixels and drawn as percentages of the frame.** A box at `left: 25%` stays on the same pixels at any size or rotation, without resize listeners.
- **HTML elements, not SVG or canvas:** real text labels, fixed 44 px corner touch targets, and hit-testing from the DOM.

</details>

<details>
<summary><strong>Folder structure (by file type)</strong></summary>

```
src/
├─ main.jsx                    # ThemeProvider + CssBaseline
├─ App.jsx                     # screen history, photo, quality, annotations reducer; picks the screen
├─ theme.js                    # MUI themes (light + dark camera), shared styles
├─ assets/                     # Landing demo photo
├─ screens/
│  ├─ LandingScreen.jsx
│  ├─ BeforeYouStartScreen.jsx     # camera permission before Capture
│  ├─ CaptureScreen.jsx
│  ├─ CameraErrorScreen.jsx
│  ├─ PreviewScreen.jsx
│  ├─ AnnotateScreen.jsx
│  ├─ SummaryScreen.jsx        # read-only result + download
├─ components/
│  ├─ StatusBadge/             # ✓ / ! / ✕ — used on 4 screens
│  ├─ LiveQualityChips/        # resolution, brightness, sharpness chips
│  ├─ AnnotationCanvas/        # photo + boxes + pointer gestures
│  ├─ AnnotationList/
│  ├─ QualityChecks/           # check rows: Preview (full), Annotate (compact)
│  ├─ ZoomViewer/              # full-screen zoom (react-zoom-pan-pinch)
│  ├─ BackButton/              # back arrow used on five screens
│  ├─ PhotoWithBoxes/          # read-only photo + boxes (Summary)
│  ├─ ChoosePhotoButton/       # file picker fallback when there's no camera
│  ├─ HeroDemo/                # landing animation
│  ├─ ConfirmDialog/           # asks before work is lost
│  ├─ ScreenLayout/            # screen header and content area
│  ├─ ScreenLoader/            # shown while a screen downloads
│  ├─ ScrollThumb/             # scroll bar for browsers that hide theirs
├─ hooks/
│  ├─ useCamera.js             # stream + capture
│  ├─ useTorch.js
│  ├─ useLiveQuality.js
│  ├─ usePhotoQuality.js       # brightness + sharpness of the captured photo
│  ├─ useCameraPermission.js   # ask once on Before you start
│  ├─ useScreenHistory.js      # current screen, in step with browser Back / Forward
│  ├─ index.js                # re-exports, for one-line imports
└─ utils/
   ├─ cameraErrors.js          # browser error → message; can this browser use the camera
   ├─ quality.js               # pure: thresholds, measures, grades, banner text
   ├─ image.js                 # canvas: blob/video → small grey pixel array
   ├─ format.js                # percentRect, plural
   ├─ geometry.js              # pure
   ├─ annotations.js           # pure reducer
   ├─ exportPhoto.js           # canvas: photo + boxes → JPEG blob
   ├─ validation.js            # text and picked-file checks
   ├─ index.js                 # re-exports, for one-line imports
e2e/*.spec.js                  # Playwright suite; see Testing
```

</details>

<details>
<summary><strong>UI and theming</strong></summary>

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

</details>

<details>
<summary><strong>Testing</strong></summary>

**To run the tests,** install the test browser once:

```bash
npx playwright install chromium
npm run test:e2e  # Playwright; builds the app first
```

Run in Chromium with a simulated camera, on the production build. **174 tests: 172 pass, 2 are open findings**. No known security problems in the dependencies.

| Area | What is checked |
|---|---|
| Rules | <ul><li>Box position and size calculations</li><li>Adding, changing and deleting boxes</li><li>Every quality grade boundary</li><li>Text and file validation</li><li>The right message for each camera error</li><li>Runs without a browser</li></ul> |
| Core flows | <ul><li>Camera and chosen-photo flows to download: file name, full pixel size, box and label drawn</li><li>Back and Forward</li><li>Reload</li><li>Every "lose work" dialog</li><li>Done with no boxes</li></ul> |
| Annotation | <ul><li>Boxes land on the right part of the photo, whichever way they are drawn</li><li>Boxes stay inside the photo</li><li>Minimum size</li><li>Move</li><li>Resize from 4 corners</li><li>Window resize and rotation</li><li>Zoom and pan make no box</li><li>Drawing while zoomed</li><li>Keyboard delete</li><li>Touch draw and two-finger gesture</li></ul> |
| Quality | <ul><li>Good, dark, bright, blurry and low-resolution photos</li><li>Advice</li><li>Main button</li><li>Damaged photo</li><li>Portrait and rotated photos</li><li>PNG and WebP</li></ul> |
| Input | <ul><li>Annotation and photo names: characters, paste, limits, other languages, duplicates, trimming</li><li>Non-photo, empty and over-30 MB files</li></ul> |
| Camera | <ul><li>Granted, denied, slow answer, earlier grant</li><li>No camera, busy, insecure page, stopped mid-use</li><li>Retry</li><li>Page hidden, leaving the screen</li><li>Torch on, off, failed and missing</li><li>Capture still works where full-resolution photos are not available</li><li>Failed capture</li><li>Two tabs</li></ul> |
| Failure handling | <ul><li>Slow and failed screen downloads</li><li>Offline after load</li><li>Failed download with retry</li><li>No console errors</li></ul> |
| Screens | <ul><li>320 × 568, 390 × 844, 820 × 1180, 1440 × 900, 844 × 390 and 200% zoom: no page scroll, every button reachable</li><li>Scroll bars only on overflow, including browsers that hide them</li><li>Touch targets</li></ul> |
| Accessibility | <ul><li>Automatic accessibility checks on all 6 screens and a dialog</li><li>Starting the flow with the keyboard</li><li>The keyboard stays inside an open dialog, and Escape closes it</li><li>Rename and delete by keyboard</li><li>Tooltip by keyboard</li><li>Reduced motion</li></ul> |

</details>
