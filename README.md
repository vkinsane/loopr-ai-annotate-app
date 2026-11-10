# <img src="docs/logo.svg" alt="" width="32" height="32" align="absmiddle"> Loopr Annotate

Loopr Annotate is a web application for visual inspection. It captures high-resolution photos, evaluates their quality in real time, and supports precise annotation with labelled boxes.

**Live app:** [Open Loopr Annotate](https://painfully-legal-viper.ngrok-free.app/).

**Flow:** Landing → Before you start (camera permission) → Capture → Preview & quality → Annotate → Summary

<details open>
<summary><strong>Installation</strong></summary>

**Requirements:** Node.js 22.12+, npm, Git.

```bash
git clone https://github.com/vkinsane/loopr-ai-annotate-app.git
cd loopr-ai-annotate-app
npm install
npm run dev
```

</details>

<details>
<summary><strong>Features</strong></summary>

- **Capture**
  - Live rear-camera preview at the highest resolution the device offers.
  - Live chips for resolution, brightness and sharpness, with a hint line ("Too dark, so turn on the torch.").
  - Rule-of-thirds grid, and a level that says how to hold the phone ("Turn left 6°", "Hold flat: 12° off", "Level").
  - Exposure − / +, torch toggle and a camera list, each shown only when the device supports it.
  - "Choose a photo" from the device, even when the camera works.
  - Clear screens for blocked, missing, busy and unsupported cameras, with Try again and "Choose a photo instead".
  - The camera is released while the page is hidden (tab switch, app in background, screen locked).
- **Preview & quality**
  - Resolution, file size, brightness and sharpness, each graded Good / Warning / Poor, with advice ("Photo is too dark and blurry").
  - Edit: turn left or right, flip and crop.
  - Full-screen zoom: pinch or scroll (up to 8×), drag to move, double-tap.
  - Annotating a photo that isn't good asks first, with Retake offered.
- **Annotate**
  - Drag on the photo to draw a box; drag a box to move it; drag a corner to resize it.
  - Name, select and delete boxes from the list. Zoom while annotating; the hand button moves the photo.
  - Boxes stay on the same pixels at any screen size or rotation.
- **Summary**: the photo with its boxes, a photo name, and a download of the photo with boxes and labels drawn on it.
- **Navigation**: in-app Back buttons move between steps. From the camera on, the browser's Back and Forward ask before starting over.
- **Choose a photo**: only JPEG, PNG, WebP or HEIC, checked from the file's first bytes, not its name; not empty; up to 30 MB.

</details>

<details>
<summary><strong>Technical notes</strong></summary>

### Image capture
- **Constraints:** `facingMode: 'environment'`, `width/height: { ideal: 4096×3072 }`.
  - `ideal` never rejects, unlike `exact` or `min`, so every camera opens at its best size.
  - 4:3 matches most phone sensors, so the browser doesn't crop to 16:9.
  - A camera picked from the list is opened by `deviceId` instead.
- **Capture:** `ImageCapture.takePhoto()` where available (Chromium, Android), for full sensor resolution. Otherwise, including on iPhone, the full-size video frame is drawn to a canvas and saved as JPEG (quality 0.92).
- **Live view:**
  - Computers: the preview frame has the camera's aspect ratio, so what you see is what is captured.
  - Phones held upright: the view fills the screen, so its sides are cropped a little.
  - Phones held sideways: the whole view is shown, as tall as the screen.
- **Torch and exposure:**
  - Both are changed with one helper, `applyCameraSetting`. It sends back the current constraints with the change, because `applyConstraints` replaces all of them.
  - Their state is read from `getSettings()` on every render, never stored, so the buttons show the real hardware state.
- **Level:** `devicemotion` gravity, turned into screen axes, gives roll (horizon turn) and pitch (tilt from upright).
  - Readings are limited to one per animation frame.
  - iPhone needs a tap before it shares motion, so a "Show level" button appears on touch screens until the first reading.
- **Releasing the camera:** tracks are stopped when the screen unmounts and while the page is hidden.

### Quality assessment
- **Where it runs:** live on the camera view every 250 ms, and once on the saved photo. Both use a 320 px wide grey copy, so they are fast and give the same scores on any device.
- **Brightness:** the mean luma (Rec. 601), 0–255.
- **Sharpness:** the variance of a 3×3 Laplacian filter. Sharp edges give large values, blur gives small ones.
- **Thresholds** (`utils/quality.js`). These are starting values set from test photos, not tuned across many devices:

| Check | Good | Warning | Poor |
|---|---|---|---|
| Resolution | ≥ 8 MP | 2–8 MP | < 2 MP |
| File size | ≥ 500 KB | 150–500 KB | < 150 KB |
| Brightness (shown as %) | 70–190 | 40–70 or 190–220 | < 40 or > 220 |
| Sharpness | ≥ 60 | 20–60 | < 20 |

- **Result:** the worst grade wins. The banner names every problem and joins the advice ("add more light and hold the camera steady").
- **Poor photos warn but never block.** Retake becomes the main button, and Annotate asks first.

### Annotation
- **Boxes are stored in photo pixels and drawn as percentages of the photo frame.** A box at `left: 25%` stays on the same pixels at any size, rotation or zoom.
- **HTML elements, not SVG or canvas:** real text labels, and 44 px corner touch targets that keep their size while zoomed.
- **One gesture, read from where it starts:** a corner resizes, a box moves, and empty photo draws. Boxes below a minimum size are ignored, so a tap doesn't make one.
- **Pure helpers** in `utils/geometry.js` (from points, move, resize, clamp) and a pure reducer in `utils/annotations.js` hold all box logic.
- **Download:** the full-size photo is drawn to a canvas with the boxes and labels, at line widths scaled to the photo, then saved as JPEG.
- **Photo edits** (turn, flip, crop) make a new JPEG and measure quality again. Boxes are cleared after a warning, because they would no longer match.

</details>

<details>
<summary><strong>Technical decisions</strong></summary>

- **React + Vite, plain JavaScript.** It keeps the setup small for a one-week task. Data shapes are written in JSDoc comments instead of types.
- **MUI** for accessible building blocks (dialogs, menus, focus handling) and one theme. Every colour is a theme token; styles sit in a `Name.styles.js` file beside each component.
- **State:**
  - `App` owns the photo, its quality, its name and the boxes (`useReducer`), so moving between steps keeps them.
  - Each device feature has its own hook: `useCamera`, `useTorch`, `useExposure`, `useDeviceTilt`, `useCameraList`, `useLiveQuality`.
  - Screens get data and callbacks as props.
- **No router:** `useScreenHistory` keeps the current step in step with the browser's history. Six steps don't need URLs.
- **One layout rule:** `COMPACT` in `theme.js` covers phones and tablets held either way, and small windows.
  - Compact screens show the photo full size, with the details on a panel over it.
  - Computers show a sidebar.
- **Code splitting:** Annotate, Summary, the zoom viewer and the photo editor load only when needed. Annotate and Summary are fetched early, while Preview is shown.
- **Pure logic in `utils/`:** geometry, grading, tilt, validation and error messages have no React in them, so they are tested without a browser.
- **Few dependencies:** only `react-zoom-pan-pinch` beyond React and MUI.

</details>

<details>
<summary><strong>Trade-offs</strong></summary>

- **Video frame instead of a full photo on iPhone:** iPhone Safari has no `ImageCapture`, so its photos are the size of the video stream (often 4032 × 3024, sometimes less), not the full sensor.
- **Cropped live view on phones held upright:** filling the screen looks better than black bars, but the photo shows a little more at the sides than the screen.
- **File size as a check:** a weak proxy for detail, because JPEG compression also changes it. It is shown, but it never blocks.
- **Edits clear the boxes:** keeping them through a crop or turn would need box transforms. A warning is simpler and safe.
- **Browser Back starts over** once the camera has opened. That prevents half-finished states, but it loses the work after a warning.
- **No storage:** nothing is saved or uploaded, so a reload loses the work. This keeps photos private.

</details>

<details>
<summary><strong>What could be better</strong></summary>

- **Real-device testing:** the level, exposure, camera switching and iPhone photo orientation were tested with simulated sensors and cameras only.
- **Quality:** thresholds tuned from real photos on several phones, and a check for glare.
- **Annotation:** undo and redo, keyboard moving and resizing of boxes, and keeping boxes through a crop or turn.
- **Saving work:** keep the photo and boxes in IndexedDB, so a reload or a browser Back doesn't lose them.
- **Types:** TypeScript or PropTypes for the main data shapes.

</details>

<details>
<summary><strong>Folder structure</strong></summary>

```
src/
├─ main.jsx                    # ThemeProvider + CssBaseline
├─ App.jsx                     # steps, photo, quality, boxes reducer; picks the screen
├─ theme.js                    # MUI themes (light + dark camera), COMPACT rule, shared styles
├─ screens/                    # Landing, BeforeYouStart, Capture, CameraError, Preview, Annotate, Summary
├─ components/
│  ├─ AnnotationCanvas/        # photo + boxes + pointer gestures + zoom
│  ├─ AnnotationList/          # name, select, delete; read-only on Summary
│  ├─ PhotoWithBoxes/          # read-only photo + boxes (Summary)
│  ├─ PhotoEditor/             # turn, flip, crop
│  ├─ ZoomViewer/              # full-screen zoom
│  ├─ DetailsOverlay/          # panel over the photo on compact screens
│  ├─ QualityChecks/, StatusBadge/, LiveQualityChips/
│  ├─ LevelIndicator/, ExposureControl/, CameraMenu/
│  ├─ ChoosePhotoButton/, ConfirmDialog/, BackButton/
│  ├─ ScreenLayout/, ScreenLoader/, ScrollThumb/, DrawHint/, HeroDemo/
├─ hooks/                      # useCamera, useCameraList, useCameraPermission, useTorch, useExposure,
│                              # useCropDrag, useDeviceTilt, useLiveQuality, usePhotoQuality, useScreenHistory
└─ utils/                      # pure logic: geometry, annotations, quality, camera (tilt), validation,
                               # cameraErrors, format; canvas: image (grey copy, edits), exportPhoto
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
<summary><strong>Testing and documentation</strong></summary>

**Documentation:** this README, plus comments in the code that explain why something is done, not what it does. Most components, hooks and helpers start with a short description of what it takes and returns.

**To run the tests,** install the test browser once:

```bash
npx playwright install chromium
npm run test:e2e  # builds the app, then runs all tests
```

The tests run in the Chromium browser with a simulated camera, on the final build of the app.

| Area | What is checked |
|---|---|
| Logic | <ul><li>Box position and size calculations</li><li>Adding, changing and deleting boxes</li><li>The exact limits between Good, Warning and Poor</li><li>Which names and files are accepted</li><li>The right message for each camera error</li><li>These tests run without opening a browser</li></ul> |
| Main flows | <ul><li>From the camera or a chosen photo through to download: correct file name, full image size, boxes and labels on the photo</li><li>Browser Back and Forward: they ask after the camera, and Start over keeps nothing</li><li>A weak photo asks before Annotate</li><li>Reloading the page</li><li>Every warning shown before work is lost</li><li>Finishing with no boxes</li></ul> |
| Annotation | <ul><li>Boxes land on the right part of the photo, whichever way they are drawn</li><li>Boxes stay inside the photo</li><li>Very small boxes are ignored</li><li>Moving a box</li><li>Resizing a box from each corner</li><li>Boxes stay in place when the screen size or orientation changes</li><li>Zooming and moving the photo do not create boxes</li><li>Drawing while zoomed in</li><li>Deleting a box with the keyboard</li><li>Drawing with one finger; two fingers do not draw a box</li></ul> |
| Photo quality | <ul><li>Good, dark, bright, blurry and low-resolution photos</li><li>The advice shown for each problem</li><li>The main button changes for a poor photo</li><li>Damaged photos are reported</li><li>Portrait and rotated photos</li><li>PNG and WebP photos</li></ul> |
| Names and files | <ul><li>Annotation and photo names: allowed characters, pasted text, length limits, other languages, repeated names, extra spaces</li><li>Files that are refused: not a photo, empty, or over 30 MB</li></ul> |
| Camera tools | <ul><li>Exposure steps, limits and failures; hidden when not supported</li><li>The level: hidden with no sensor, the advice for each tilt, and the tap iPhone needs first</li><li>Choosing another camera from the list</li><li>Choosing a photo on the camera screen</li></ul> |
| Photo editing | <ul><li>Turning swaps width and height</li><li>Cropping keeps the chosen part</li><li>Flip and Reset</li><li>Editing with boxes asks first, then clears them</li></ul> |
| Camera | <ul><li>Permission allowed, denied, slow to answer, or allowed on an earlier visit</li><li>No camera, camera busy, page not secure, or camera stopping during use</li><li>Trying again after an error</li><li>The camera is released when the page is hidden or the user leaves the screen</li><li>Torch on, off, failed and not available</li><li>Capture still works where full-resolution photos are not available</li><li>A photo that fails to capture</li><li>The camera open in two tabs</li></ul> |
| Failure handling | <ul><li>A screen that is slow or fails to download</li><li>Losing the internet after the app has loaded</li><li>A failed photo download, then trying again</li><li>No errors during a full run</li></ul> |
| Screen sizes | <ul><li>From small phones (320 × 568) to desktops (1440 × 900), phones and tablets held sideways, and 200% browser zoom: no page scrolling, and every button can be reached</li><li>Scroll bars appear only when content does not fit</li><li>Phones and tablets, either way up, show the details over the photo</li><li>A long annotation list scrolls in its own box</li><li>The tap size of every button on phones</li></ul> |
| Accessibility | <ul><li>Automatic accessibility checks on all 6 screens and a dialog</li><li>Starting the flow with the keyboard</li><li>The keyboard stays inside an open dialog, and Escape closes it</li><li>Renaming and deleting boxes with the keyboard</li><li>Opening the info tips with the keyboard</li><li>Animations stop when the user asks for less motion</li></ul> |

</details>
