# Scan & Help

A mobile-first camera scanner that explains what it sees and tells you what to do next. Point it at an injury, a letter, a medicine label, a plant, a bill or almost anything and Gemini vision returns a clear result: what is visible, what to do, warning signs, and confidence.

It is a **static PWA** — no backend. Deploy it to Cloudflare Pages, open it on a phone, and add it to the home screen.

## What it can do

| Mode | What you get |
| --- | --- |
| **Smart scan** | Detects what the photo shows and picks the right kind of help automatically |
| **Injury / skin** | What is visibly apparent, safe first-aid steps, red flags, urgency level |
| **Text & reading** | Verbatim transcription, plain-language explanation, action points |
| **Document** | Letters, bills, forms: who sent it, dates, amounts, deadlines, checklist |
| **Medicine label** | Name, strength, directions, warnings, expiry — with a strong "confirm with a pharmacist" guard |
| **Object / plant / food** | Identification, useful facts, toxicity and safety warnings |

Every result includes:

- **Urgency banner** — emergency / urgent / soon / self-care / unknown
- **What I can see** — visible findings only, no invented details
- **What to do** — numbered, practical next steps
- **Get help urgently if** — red flags (shown first for injuries and medicine)
- **Text found** — full transcription for documents and labels
- **Confidence** — high / medium / low, with honesty about blurry photos
- **Follow-up chat** — ask questions about the scan you just took
- **History** — last 40 scans saved privately in the browser, searchable
- **Copy / share** — send a plain-text summary anywhere

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build      # type-check + static build into dist/
npm run preview    # http://localhost:4175
```

Camera access works on `localhost`. On a phone over the LAN, camera requires HTTPS — use the Cloudflare deployment or a tunnel.

## Set up AI (one minute)

1. Open the app → **Settings**.
2. Create a free key at <https://aistudio.google.com/apikey>.
3. Paste the key, keep `gemini-3.6-flash`, press **Save settings**, then **Test connection**.
4. Optional: press **Find models** to list every Gemini model the key can use.

The key is stored in `localStorage` in this browser only. It is sent directly to Google's OpenAI-compatible endpoint (`generativelanguage.googleapis.com`). There is no Scan & Help server and no analytics. Do not configure a key on a shared computer.

Without a key, the app still works as an offline text scanner: local Tesseract OCR reads text on the device and saves it to history. Injury, object and medicine modes need AI vision.

## Deploy to Cloudflare Pages

### Option A — Wrangler (fastest)

```bash
npm install
npx wrangler login
npm run deploy
```

`npm run deploy` builds the app and uploads `dist/` to a Pages project named `scan-and-help`. The first run creates the project and prints the public URL. Subsequent runs publish a new deployment.

If you want a different project name, edit the `deploy` script in `package.json` and `wrangler.toml`.

### Option B — Git integration

1. Push this folder to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Deploy. Every push to the branch publishes automatically.

### Cloudflare settings included

- `public/_headers` sets `Permissions-Policy: camera=(self)`, `nosniff`, frame and referrer protection.
- `public/manifest.webmanifest` + `public/sw.js` make it installable and offline-capable after the first visit.
- The service worker caches the app shell and hashed assets at runtime; API calls and Tesseract CDN downloads are never cached.

## Safety and limits

- **Not a medical device.** Injury and medicine results are general information, not diagnosis or prescription. Emergency symptoms → call your local emergency number.
- **Plants, mushrooms and wild food** are never identified with certainty. Do not eat anything based on a photo.
- **AI can misread text.** Check names, amounts, dates and deadlines against the original.
- Photos are downscaled in the browser before upload. Results and thumbnails stay in `localStorage`; clearing site data removes them.
- The offline text fallback downloads Tesseract.js from jsDelivr/unpkg the first time it is used. It runs in your browser. If you keep a Gemini key configured on this device, only use the fallback if you trust that CDN.
- Animal bites, deep or gaping wounds, uncontrolled bleeding, confusion, breathing trouble and eye injuries always need professional care.

## Project layout

```
src/
  App.tsx                 tab shell, install prompt, history state
  screens/ScanScreen.tsx  camera, upload, paste, scan flow, follow-up chat
  screens/HistoryScreen.tsx
  screens/SettingsScreen.tsx
  components/ResultCard.tsx
  components/Icon.tsx
  components/Toast.tsx
  lib/ai.ts               Gemini client, prompts, JSON parsing, thumbnails
  lib/ocr.ts              offline Tesseract fallback
  lib/history.ts          local history (max 40)
  lib/useAI.ts            live AI settings state
  types.ts                scan modes, result types, disclaimers
public/
  manifest.webmanifest, sw.js, icons, _headers
```

Built with React 18 + TypeScript + Vite. No UI framework, no backend, no database.
