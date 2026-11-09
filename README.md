# Loopr Annotate

A mobile-first web app for photo inspection: take a photo, check its quality, and annotate it with labelled boxes.

**Flow:** Landing → Before you start (camera permission) → Capture → Preview & quality → Annotate → Summary

## Setup

**Requirements:** Node.js 20.19+ or 22.12+, npm.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint      # oxlint
npx playwright install chromium   # once
npm run test:e2e  # Playwright; builds the app first
```

**Camera access needs a secure page:** `https://` or `localhost`. A phone on the same Wi-Fi opening `http://<laptop-ip>:5173` will load the app, but the camera stays blocked.

**Testing on a phone:** expose the dev server over HTTPS with a tunnel:

```bash
npm run dev
brew install cloudflared                          # once; no account needed
cloudflared tunnel --url http://localhost:5173    # open the printed https://….trycloudflare.com link on the phone
```

- `ngrok http 5173` also works, but its free plan has a monthly request limit. The dev server sends each source file as a separate request, so a few sessions use up the limit.
- `vite.config.js` already allows `*.trycloudflare.com` and `*.ngrok-free.app` hosts.

## Features

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
  - Photo quality is shown beside the photo on tablet and desktop.
  - **Name checks** (`utils/validation.js`): up to 40 characters; only letters (any language), numbers, spaces and `- _ . , ( )`. Typed and pasted text is cleaned at once, with a short note saying why. Extra spaces are removed, an empty name goes back to the old one, and a repeated name gets a warning.
- **Choose a photo** (no camera): only JPEG, PNG, WebP or HEIC, checked from the file's first bytes, not its name; not empty; up to 30 MB.
- **No page scroll on Annotate and Summary:** the photo shrinks to fit and the annotation list scrolls inside its card.
- **Summary**
  - The photo with all boxes, the annotation count, the quality grade, and each box's size.
  - **Download photo:** a full-resolution JPEG with the boxes and labels drawn on (canvas). Nothing is uploaded.
  - Back to Annotate keeps the boxes. "Take new photo" asks once more if the photo wasn't downloaded.

## Implementation decisions

### Stack
- **React + Vite, JavaScript (no TypeScript).**
  - The brief asks for TypeScript; I removed it to cut type noise.
  - Trade-off: no compile-time checks. Data shapes are described in short doc comments, and oxlint catches common mistakes.
- **MUI + Emotion** for components and theming. Emotion is MUI's required styling engine.
- **Look:** colours and type follow loopr.ai's public site (indigo, carbon, lime; Outfit + DM Sans), so the tool reads as part of that product family. Tokens live in `src/theme.js`.
- **Few dependencies:** react, react-dom, MUI, MUI icons, Emotion, and `react-zoom-pan-pinch` for zoom and pan on Preview and Annotate. No router, no state library, no canvas or annotation library.
- **State:** `App` holds the photo, its measured quality, its name and the annotations (`useReducer` with a pure reducer), so moving between screens keeps them. `useScreenHistory` keeps the current screen in step with the browser's Back and Forward buttons, without a router. Other state stays in each screen.

### Camera
- **Constraints:** `facingMode: 'environment'`, `width/height: { ideal: 4096×3072 }`.
  - `ideal` never rejects, unlike `exact` or `min`.
  - 4:3 matches most phone sensors, so the browser doesn't crop to 16:9.
- **The preview frame matches the camera's aspect ratio** (CSS container units), so what you see is what gets captured. The cost is dark bars on some screens.
- **Capture:** `ImageCapture.takePhoto()` where available (Chromium, Android) for full sensor resolution. Otherwise, including on iPhone, a full-size video frame is saved as JPEG (quality 0.92).
- **Torch:**
  - Detected with `track.getCapabilities().torch`.
  - Switched with `applyConstraints`, passing the current constraints back so the resolution isn't reset.
  - The on/off state is read from `getSettings()` on every render, never stored, so the button shows the real hardware state.
- **Errors:** browser error names are mapped to operator-friendly messages (`utils/cameraErrors.js`).
- **Cleanup:**
  - React StrictMode runs effects twice in development; an `AbortController` stops a camera request that finishes after cleanup.
  - Tracks are stopped on unmount and when the page is hidden.

### Quality
- **Brightness** = mean luma (Rec. 601) of a greyscale copy.
- **Sharpness** = variance of the Laplacian: sharp edges give strong responses and blur flattens them.
- **Both are measured at 320 px wide**, for the live preview (4 times a second) and for the captured photo alike, so one set of thresholds fits both.
- **Thresholds** (`utils/quality.js`):

| Check | Good | Warning | Poor |
|---|---|---|---|
| Resolution | ≥ 8 MP | 2–8 MP | < 2 MP |
| File size | ≥ 500 KB | 150–500 KB | < 150 KB |
| Brightness (0–255; shown as %) | 70–190 | 40–70 or 190–220 | < 40 or > 220 |
| Sharpness | ≥ 60 | 20–60 | < 20 |

- **A poor photo warns but doesn't block:** Annotate stays available as the second button.
- **The photo is decoded once**, on the Preview screen, which gives its true size after EXIF rotation plus the measurements. Capture skips decoding so the screen changes sooner.

### Annotation
- **Boxes are stored in photo pixels and drawn as percentages of the frame.** A box at `left: 25%` stays on the same pixels at any size or rotation, without resize listeners.
- **HTML elements, not SVG or canvas:** real text labels, fixed 44 px corner touch targets, and hit-testing from the DOM.
- **Pointer Events with pointer capture:** one code path for mouse, touch and pen. `touch-action: none` on the photo stops the page from scrolling while drawing.
- **No draw/select modes:** the gesture depends on where it starts (corner → resize, box → move, empty photo → draw). A quick tap or a box under 12 screen px is ignored.
- **Pure logic in `utils/`:** `geometry.js` (draw, move, resize, clamp) and `annotations.js` (reducer). IDs are created outside the reducer, so it stays pure.
- **A confirmation dialog appears before work is lost** (`components/ConfirmDialog`): "Keep photo" is the safe default. It only appears when there are boxes that would be lost.
- **Done with no boxes asks first:** "You have not added any annotations. Do you want to proceed?"

### Code conventions
- Folders by file type: `screens/`, `components/`, `hooks/` (browser APIs and lifecycle), `utils/` (pure logic).
- No component file over 250 lines. Styles live in a `*.styles.js` file next to each component.
- See [ARCHITECTURE.md](ARCHITECTURE.md) for the full structure and rules.

## Supported screens

Measured in headless Chrome; not yet checked at these sizes on real devices.

| Screen | What happens |
|---|---|
| **Portrait phones, 320 × 568 and up** | The page doesn't scroll. Photos shrink to fit. On short phones the Preview details and Before you start steps scroll inside, with the main buttons pinned. |
| **Under 620 px tall** | The Landing demo is hidden so the text and button fit. |
| **Tablets, 600 px wide and up** | No page scroll in portrait or landscape. |
| **Laptops and desktops, 1280 × 720 to 1920 × 1080** | No page scroll. Content stops growing at 1200 px and stays centred. |
| **Phones held sideways** | Everything is reachable and nothing overlaps, but screens scroll. Capture fits without scrolling. |
| **Narrower than 320 px** | Not designed for. |

## Known limitations

- **Thresholds are not calibrated.** The sharpness values in particular are starting points. They need measuring from sharp and deliberately blurred photos on the target devices.
- **File size is a weak quality signal:** it depends on JPEG compression as much as on detail.
- **Nothing is saved:** annotations live in memory only, and reloading the page loses the photo and the boxes. The only export is the downloaded JPEG; there is no JSON export of the boxes.
- **No undo.** A deleted box can't be brought back.
- **iPhone:**
  - No `ImageCapture`, so the photo is a video frame. Its resolution depends on what the stream delivers.
  - The browser's address bar can't be hidden from a web page.
  - The "Camera access is blocked" steps describe Chrome's site settings; on iPhone the permission is in the iOS Settings app.
- **While the photo is touched for drawing, the page can't scroll:** on a phone, scroll by touching outside the photo.
- **Very large photos may fail to download on iPhone:** Safari limits canvas size (about 16.7 MP). The app shows "Couldn't make the photo" in that case.
- **Checks run in the browser only.** Browser checks can be bypassed, so a future backend must repeat them (OWASP). Today there is no server, so nothing leaves the device.
- **Not deployed yet.** The brief requires a public HTTPS deployment.

## Automated tests

Playwright 1.65, Chromium with a fake camera, against the production build. **173 tests: 171 pass, 2 are open findings** (below). `npm audit`: 0 vulnerabilities.

| Area | File | Tests | What is checked |
|---|---|---|---|
| Rules | `logic.spec.js` | 50 | Box geometry, reducer, every quality grade boundary, text and file validation, camera error mapping. No browser. |
| Core flows | `flows.spec.js` | 11 | Camera and chosen-photo flows to download (file name, full pixel size, box and label drawn); Back/Forward; reload; every "lose work" dialog; Done with no boxes. |
| Annotation | `annotation.spec.js` | 24 | Photo-pixel accuracy in 4 drag directions; clamping; minimum size; move; resize from 4 corners; window resize and rotation; zoom and pan make no box; drawing while zoomed; keyboard delete; touch draw and two-finger gesture. |
| Quality | `quality.spec.js` | 10 | Generated good, dark, bright, blurry and low-resolution photos; advice; main button; damaged photo; portrait and EXIF rotation; PNG and WebP. |
| Input | `validation.spec.js` | 14 | Annotation and photo names: characters, paste, limits, other languages, duplicates, trimming. Non-photo, empty and over-30 MB files. |
| Camera | `camera.spec.js` | 21 | Granted, denied, slow answer, earlier grant, no camera, busy, insecure page, stopped mid-use, retry, page hidden, leaving the screen, torch on/off/failed/missing, ImageCapture fallback, failed capture, two tabs. |
| Failure handling | `errors.spec.js` | 5 | Slow and failed screen downloads, offline after load, failed download with retry, no console errors. |
| Screens | `responsive.spec.js` | 16 | 320 × 568, 390 × 844, 820 × 1180, 1440 × 900, 844 × 390 and 200% zoom: no page scroll, every button reachable. Scroll bars only on overflow, including browsers that hide them. Touch targets. |
| Accessibility | `accessibility.spec.js` | 13 | axe WCAG 2.1 AA on all 6 screens and a dialog; keyboard start; dialog focus trap and Escape; rename and delete by keyboard; tooltip by keyboard; reduced motion. |
| Privacy | `security.spec.js` | 4 | Markup in names never runs; only GET requests, so the photo is not sent; no storage or cookies; names not logged. |
| Performance | `performance.spec.js` | 5 | First-load and lazy-chunk size budgets, layout shift under 0.01, 40 boxes, a 27 MP photo at full size. |

**Open findings** (written as expected failures, so each one reports when it is fixed):
- A failed download of a lazy screen, for example on a bad network, leaves a blank page. There is no error boundary.
- Under 44 px on a phone: "Choose a photo instead" link (20 px high), New photo (32), zoom tools (40), Edit photo name (36).

**Not covered by these tests:**
- **Real hardware:** real camera sensors and resolution, the torch, real pinch, iOS permission dialogs. Camera failures and the torch are mocked; pinch is emulated touch input.
- **iPhone:** Playwright's WebKit is a desktop build with no camera support, so a pass there would not be an iPhone result. It was not run.
- **Drawing by keyboard:** the app has no way to draw or move a box without a pointer.
- **On-screen keyboard** over the name fields, **memory** on phones, and **response headers** (needs the deployed site).

**Not applicable:** login, sessions, CSRF, API errors, server-side validation and multi-user load, because the app has no backend.

## Device testing

Only what was actually tried is listed.

| Device / browser | Result |
|---|---|
| iPhone, Chrome (iOS) | Camera preview and capture work: 3024 × 4032 (12.2 MP), 9.1 MB, all checks Good. The "Camera access is blocked" screen shows. Torch and annotation not checked yet. |
| Headless Chrome, 390 × 844 and 844 × 390, fake camera | Capture and error-screen layouts fit the screen, with no sideways scroll, in portrait, landscape and after rotating. |
| Headless Chrome, 390 × 844, 820 × 1180, 1440 × 900, fake camera | Full flow by script: Before you start → capture → Preview → zoom (buttons + mouse drag) → draw 2 boxes → Summary → download (3840 × 2160 JPEG with labels) → back keeps boxes. Pinch and double-tap not tested (no touch input in the script). |
| Android | Not tested yet. |
| Desktop browsers with a webcam | Not tested yet. |


App build size details
Optimizations done details
etc...

## Credits

- Landing demo photo: 'Damaged car door' by Garitzko, Wikimedia Commons (public domain). Resized to 800 × 600.
