# Loopr Annotate

A mobile-first web app for photo inspection: take a photo, check its quality, and annotate it with labelled boxes.

**Flow:** Landing → Before you start (camera permission) → Capture → Preview & quality → Annotate → Summary

<details open>
<summary><strong>Installation</strong></summary>

**Requirements:** Node.js 20.19+ or 22.12+, npm, Git. No accounts or environment variables are needed.

```bash
git clone https://github.com/vkinsane/loopr-ai-annotate-app.git
cd loopr-ai-annotate-app
npm install
npm run dev       # open the URL it prints, usually http://localhost:5173
```

**To run the tests,** install the test browser once:

```bash
npx playwright install chromium
npm run test:e2e  # Playwright; builds the app first
```

</details>

<details>
<summary><strong>Development</strong></summary>

```bash
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint      # oxlint
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
  - Photo quality is shown beside the photo on tablet and desktop.
  - **Name checks** (`utils/validation.js`): up to 40 characters; only letters (any language), numbers, spaces and `- _ . , ( )`. Typed and pasted text is cleaned at once, with a short note saying why. Extra spaces are removed, an empty name goes back to the old one, and a repeated name gets a warning.
- **Choose a photo** (no camera): only JPEG, PNG, WebP or HEIC, checked from the file's first bytes, not its name; not empty; up to 30 MB.
- **No page scroll on Annotate and Summary:** the photo shrinks to fit and the annotation list scrolls inside its card.
- **Summary**
  - The photo with all boxes, the annotation count, the quality grade, and each box's size.
  - **Download photo:** a full-resolution JPEG with the boxes and labels drawn on (canvas). Nothing is uploaded.
  - Back to Annotate keeps the boxes. "Take new photo" asks once more if the photo wasn't downloaded.

</details>

<details>
<summary><strong>Implementation decisions</strong></summary>

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
  - Tracks are stopped on unmount and when the page is hidden.

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

### Code conventions
- Folders by file type: `screens/`, `components/`, `hooks/` (browser APIs and lifecycle), `utils/` (pure logic).
- No component file over 250 lines. Styles live in a `*.styles.js` file next to each component.
- See [ARCHITECTURE.md](ARCHITECTURE.md) for the full structure and rules.

</details>

<details>
<summary><strong>Known limitations</strong></summary>

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

</details>

<details>
<summary><strong>Automated tests</strong></summary>

Playwright 1.65, Chromium with a fake camera, against the production build. **174 tests: 172 pass, 2 are open findings** (below). `npm audit`: 0 vulnerabilities.

| Area | What is checked |
|---|---|
| Rules | <ul><li>Box geometry</li><li>Box reducer</li><li>Every quality grade boundary</li><li>Text and file validation</li><li>Camera error mapping</li><li>Runs without a browser</li></ul> |
| Core flows | <ul><li>Camera and chosen-photo flows to download: file name, full pixel size, box and label drawn</li><li>Back and Forward</li><li>Reload</li><li>Every "lose work" dialog</li><li>Done with no boxes</li></ul> |
| Annotation | <ul><li>Photo-pixel accuracy in 4 drag directions</li><li>Clamping</li><li>Minimum size</li><li>Move</li><li>Resize from 4 corners</li><li>Window resize and rotation</li><li>Zoom and pan make no box</li><li>Drawing while zoomed</li><li>Keyboard delete</li><li>Touch draw and two-finger gesture</li></ul> |
| Quality | <ul><li>Generated good, dark, bright, blurry and low-resolution photos</li><li>Advice</li><li>Main button</li><li>Damaged photo</li><li>Portrait and EXIF rotation</li><li>PNG and WebP</li></ul> |
| Input | <ul><li>Annotation and photo names: characters, paste, limits, other languages, duplicates, trimming</li><li>Non-photo, empty and over-30 MB files</li></ul> |
| Camera | <ul><li>Granted, denied, slow answer, earlier grant</li><li>No camera, busy, insecure page, stopped mid-use</li><li>Retry</li><li>Page hidden, leaving the screen</li><li>Torch on, off, failed and missing</li><li>ImageCapture fallback</li><li>Failed capture</li><li>Two tabs</li></ul> |
| Failure handling | <ul><li>Slow and failed screen downloads</li><li>Offline after load</li><li>Failed download with retry</li><li>No console errors</li></ul> |
| Screens | <ul><li>320 × 568, 390 × 844, 820 × 1180, 1440 × 900, 844 × 390 and 200% zoom: no page scroll, every button reachable</li><li>Scroll bars only on overflow, including browsers that hide them</li><li>Touch targets</li></ul> |
| Accessibility | <ul><li>axe WCAG 2.1 AA on all 6 screens and a dialog</li><li>Keyboard start</li><li>Dialog focus trap and Escape</li><li>Rename and delete by keyboard</li><li>Tooltip by keyboard</li><li>Reduced motion</li></ul> |
| Privacy | <ul><li>Markup in names never runs</li><li>Only GET requests, so the photo is not sent</li><li>No storage or cookies</li><li>Names not logged</li></ul> |
| Performance | <ul><li>First-load and lazy-chunk size budgets</li><li>Layout shift under 0.01</li><li>40 boxes</li><li>A 27 MP photo at full size</li></ul> |

**Open findings** (written as expected failures, so each one reports when it is fixed):
- A failed download of a lazy screen, for example on a bad network, leaves a blank page. There is no error boundary.
- Under 44 px on a phone: "Choose a photo instead" link (20 px high), New photo (32), zoom tools (40).

**Not applicable:** login, sessions, CSRF, API errors, server-side validation and multi-user load, because the app has no backend.

</details>
