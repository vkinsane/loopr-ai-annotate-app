# <img src="docs/logo.svg" alt="" width="32" height="32" align="absmiddle"> Loopr Annotate

Loopr Annotate is a web application for visual inspection. It captures high-resolution photos, evaluates their quality in real time, and supports precise annotation with labelled boxes.

**Flow:** Landing → Before you start (camera permission) → Capture → Preview & quality → Annotate → Summary

<details open>
<summary><strong>Installation</strong></summary>

**Requirements:** Node.js 22.12+, npm, Git.

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
  - Full-screen zoom: pinch or scroll to zoom (up to 8×), drag to move, double-tap to zoom in and out.
  - Retake or Annotate. For a poor photo, Retake becomes the main button.
- **Annotate**
  - Draw a box by dragging on the photo; drag a box to move it; drag a corner to resize it.
  - Label, select and delete boxes from the list.
  - Zoom while annotating: pinch, scroll or + and −. The hand button moves the photo. Boxes, labels and handles keep their size on screen.
  - Boxes stay on the same pixels at any screen size or rotation.
- **Choose a photo** (no camera): only JPEG, PNG, WebP or HEIC, checked from the file's first bytes, not its name; not empty; up to 30 MB.

</details>

<details>
<summary><strong>Implementation decisions</strong></summary>

### Stack
- **React + Vite, JavaScript (no TypeScript).**
- **State:** `App` holds the photo, its measured quality, its name and the annotations (`useReducer` with a pure reducer), so moving between screens keeps them. `useScreenHistory` keeps the current screen in step with the browser's Back and Forward buttons, without a router. Other state stays in each screen.

### Camera
- **Constraints:** `facingMode: 'environment'`, `width/height: { ideal: 4096×3072 }`.
  - `ideal` never rejects, unlike `exact` or `min`.
  - 4:3 matches most phone sensors, so the browser doesn't crop to 16:9.
- **The preview frame matches the camera's aspect ratio** (CSS container units), so what you see is what gets captured. The cost is dark bars on some screens.
- **Capture:** `ImageCapture.takePhoto()` where available (Chromium, Android) for full sensor resolution. Otherwise, including on iPhone, a full-size video frame is saved as JPEG (quality 0.92).
- **Torch:** the on/off state is read from `getSettings()` on every render, never stored, so the button shows the real hardware state.

### Quality
- **Brightness** is how light or dark the photo is overall.
- **Sharpness** is how clearly the photo shows edges and fine detail.
- **Thresholds** (`utils/quality.js`):

| Check | Good | Warning | Poor |
|---|---|---|---|
| Resolution | ≥ 8 MP | 2–8 MP | < 2 MP |
| File size | ≥ 500 KB | 150–500 KB | < 150 KB |
| Brightness (shown as %) | 70–190 | 40–70 or 190–220 | < 40 or > 220 |
| Sharpness | ≥ 60 | 20–60 | < 20 |

### Annotation
- **Boxes are stored in photo pixels and drawn as percentages of the frame.** A box at `left: 25%` stays on the same pixels at any size or rotation.
- **HTML elements, not SVG or canvas:** real text labels and fixed 44 px corner touch targets.

</details>

<details>
<summary><strong>Folder structure</strong></summary>

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
<summary><strong>External libraries used</strong></summary>

**In the app**

| Library | Used for |
|---|---|
| `react`, `react-dom` | User interface |
| `@mui/material`, `@mui/icons-material` | Components, theming and icons |
| `@emotion/react`, `@emotion/styled` | Styling engine for MUI |
| `react-zoom-pan-pinch` | Zoom and pan on Preview and Annotate |

**For development and testing**

| Library | Used for |
|---|---|
| `vite`, `@vitejs/plugin-react` | Dev server and production build |
| `oxlint` | Linting |
| `@playwright/test` | Automated browser tests |
| `@axe-core/playwright` | Automatic accessibility checks |

</details>

<details>
<summary><strong>Testing</strong></summary>

**To run the tests,** install the test browser once:

```bash
npx playwright install chromium
npm run test:e2e  # builds the app, then runs all tests
```

The tests run in the Chromium browser with a simulated camera, on the final build of the app.

| Area | What is checked |
|---|---|
| Logic | <ul><li>Box position and size calculations</li><li>Adding, changing and deleting boxes</li><li>The exact limits between Good, Warning and Poor</li><li>Which names and files are accepted</li><li>The right message for each camera error</li><li>These tests run without opening a browser</li></ul> |
| Main flows | <ul><li>From the camera or a chosen photo through to download: correct file name, full image size, boxes and labels on the photo</li><li>Browser Back and Forward buttons</li><li>Reloading the page</li><li>Every warning shown before work is lost</li><li>Finishing with no boxes</li></ul> |
| Annotation | <ul><li>Boxes land on the right part of the photo, whichever way they are drawn</li><li>Boxes stay inside the photo</li><li>Very small boxes are ignored</li><li>Moving a box</li><li>Resizing a box from each corner</li><li>Boxes stay in place when the screen size or orientation changes</li><li>Zooming and moving the photo do not create boxes</li><li>Drawing while zoomed in</li><li>Deleting a box with the keyboard</li><li>Drawing with one finger; two fingers do not draw a box</li></ul> |
| Photo quality | <ul><li>Good, dark, bright, blurry and low-resolution photos</li><li>The advice shown for each problem</li><li>The main button changes for a poor photo</li><li>Damaged photos are reported</li><li>Portrait and rotated photos</li><li>PNG and WebP photos</li></ul> |
| Names and files | <ul><li>Annotation and photo names: allowed characters, pasted text, length limits, other languages, repeated names, extra spaces</li><li>Files that are refused: not a photo, empty, or over 30 MB</li></ul> |
| Camera | <ul><li>Permission allowed, denied, slow to answer, or allowed on an earlier visit</li><li>No camera, camera busy, page not secure, or camera stopping during use</li><li>Trying again after an error</li><li>The camera is released when the page is hidden or the user leaves the screen</li><li>Torch on, off, failed and not available</li><li>Capture still works where full-resolution photos are not available</li><li>A photo that fails to capture</li><li>The camera open in two tabs</li></ul> |
| Failure handling | <ul><li>A screen that is slow or fails to download</li><li>Losing the internet after the app has loaded</li><li>A failed photo download, then trying again</li><li>No errors during a full run</li></ul> |
| Screen sizes | <ul><li>From small phones (320 × 568) to desktops (1440 × 900), phones held sideways, and 200% browser zoom: no page scrolling, and every button can be reached</li><li>Scroll bars appear only when content does not fit</li><li>The tap size of every button on phones</li></ul> |
| Accessibility | <ul><li>Automatic accessibility checks on all 6 screens and a dialog</li><li>Starting the flow with the keyboard</li><li>The keyboard stays inside an open dialog, and Escape closes it</li><li>Renaming and deleting boxes with the keyboard</li><li>Opening the info tips with the keyboard</li><li>Animations stop when the user asks for less motion</li></ul> |

</details>
