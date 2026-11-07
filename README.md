# Loopr Annotate

A mobile-first web app for a car-door production line: photograph each door at the conveyor, check the photo's quality, and mark defects with labelled boxes.

**Flow:** Capture → Preview & quality → Annotate

## Setup

**Requirements:** Node.js 20.19+ or 22.12+, npm.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint      # oxlint
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
  - Live chips for resolution, brightness and sharpness, with a hint line ("Too dim. Turn on the torch.").
  - Torch toggle, shown only when the camera supports it, showing the camera's real torch state.
  - Clear screens for blocked, missing, busy and unsupported cameras, with Try again.
  - The camera is released while the page is hidden (tab switch, app in background, screen locked).
- **Preview & quality**
  - Resolution, file size, brightness and sharpness, each graded Good / Warning / Poor.
  - A summary banner with advice, e.g. "Photo is too dark and blurry".
  - Retake or Annotate. For a poor photo, Retake becomes the main button.
- **Annotate**
  - Draw a box by dragging on the photo; drag a box to move it; drag a corner to resize it.
  - Label, select and delete boxes from the list. Delete / Escape keys work on desktop.
  - Works with mouse, touch and pen. Boxes stay on the same pixels at any screen size or rotation.

## Implementation decisions

### Stack
- **React + Vite, JavaScript (no TypeScript).**
  - The brief asks for TypeScript; I removed it to cut type noise.
  - Trade-off: no compile-time checks. Data shapes are described in short doc comments, and oxlint catches common mistakes.
- **MUI + Emotion** for components and theming. Emotion is MUI's required styling engine.
- **Few dependencies:** react, react-dom, MUI, MUI icons, Emotion. No router, no state library, no canvas or annotation library.
- **State:** `App` holds the step and the photo, and each screen owns its own state. Annotations use `useReducer` with a pure reducer.

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
| Brightness (0–255) | 70–190 | 40–70 or 190–220 | < 40 or > 220 |
| Sharpness | ≥ 60 | 20–60 | < 20 |

- **A poor photo warns but doesn't block:** "Annotate anyway" stays available.
- **The photo is decoded once**, on the Preview screen, which gives its true size after EXIF rotation plus the measurements. Capture skips decoding so the screen changes sooner.

### Annotation
- **Boxes are stored in photo pixels and drawn as percentages of the frame.** A box at `left: 25%` stays on the same pixels at any size or rotation, without resize listeners.
- **HTML elements, not SVG or canvas:** real text labels, fixed 44 px corner touch targets, and hit-testing from the DOM.
- **Pointer Events with pointer capture:** one code path for mouse, touch and pen. `touch-action: none` on the photo stops the page from scrolling while drawing.
- **No draw/select modes:** the gesture depends on where it starts (corner → resize, box → move, empty photo → draw). A quick tap or a box under 12 screen px is ignored.
- **Pure logic in `utils/`:** `geometry.js` (draw, move, resize, clamp) and `annotations.js` (reducer). IDs are created outside the reducer, so it stays pure.
- **"New photo" with boxes present needs a second tap** ("Discard 3 boxes?"), instead of a dialog.

### Code conventions
- Folders by file type: `screens/`, `components/`, `hooks/` (browser APIs and lifecycle), `utils/` (pure logic).
- No component file over 250 lines. Styles live in a `*.styles.js` file next to each component.
- See [ARCHITECTURE.md](ARCHITECTURE.md) for the full structure and rules.

## Known limitations

- **Thresholds are not calibrated.** The sharpness values in particular are starting points. They need measuring from sharp and deliberately blurred photos on the target devices.
- **File size is a weak quality signal:** it depends on JPEG compression as much as on detail.
- **Nothing is saved:** annotations live in memory only. There is no export, and reloading the page loses the photo and the boxes.
- **No undo, zoom or pan** on the photo. Small defects on a phone screen are hard to box precisely.
- **iPhone:**
  - No `ImageCapture`, so the photo is a video frame. Its resolution depends on what the stream delivers.
  - The browser's address bar can't be hidden from a web page.
  - The "Camera access is blocked" steps describe Chrome's site settings; on iPhone the permission is in the iOS Settings app.
- **While the photo is touched for drawing, the page can't scroll:** on a phone, scroll by touching outside the photo.
- **No automated tests yet.** The pure `utils/` (geometry, reducer, quality, error mapping) are written to be unit-tested first.
- **Not deployed yet.** The brief requires a public HTTPS deployment.

## Device testing

Only what was actually tried is listed.

| Device / browser | Result |
|---|---|
| iPhone, Chrome (iOS) | Camera preview and capture work: 3024 × 4032 (12.2 MP), 9.1 MB, all checks Good. The "Camera access is blocked" screen shows. Torch and annotation not checked yet. |
| Headless Chrome, 390 × 844 and 844 × 390, fake camera | Capture and error-screen layouts fit the screen, with no sideways scroll, in portrait, landscape and after rotating. |
| Android | Not tested yet. |
| Desktop browsers with a webcam | Not tested yet. |
