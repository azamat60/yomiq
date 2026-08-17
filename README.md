# Yomiq

Photo-based calorie counter. A mobile PWA: photograph your plate — OpenAI identifies the dishes, portion weight, and macros, and the entry lands in your daily diary.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000. The key is only ever read on the server — `/api/*` is served directly by the Vite dev server, no `vercel dev` needed.

### Testing voice input from a phone

`getUserMedia` needs a secure context. `localhost` counts; `http://192.168.x.x:3000` does not — there `navigator.mediaDevices` is `undefined` and the microphone can never work (the app says so explicitly instead of blaming permissions). For LAN testing, drop real certs into `certs/` and dev serves over https automatically:

```bash
brew install mkcert && mkcert -install
mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 192.168.1.5
```

Install mkcert's root CA on the phone too (AirDrop `$(mkcert -CAROOT)/rootCA.pem`, then Settings → General → About → Certificate Trust Settings). `certs/` is gitignored, and without it dev falls back to http. A self-signed cert would be less setup but stops the service worker from registering, which breaks PWA testing — the thing you are most likely trying to test.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | dev server + `/api/*` on localhost:3000 |
| `npm run build` | type-check and production build into `dist/` |
| `npm run ts` | type-check only |
| `npm run preview` | preview the built `dist/` locally |

## How it's built

**Data lives on the device.** IndexedDB via Dexie, all access goes through `src/db/repository.ts`. Screens don't know Dexie exists, so cloud sync can be added later without rewriting the UI. Reactivity comes from `useLiveQuery`: inserting an entry redraws the diary on its own.

**Macros are stored per 100 grams**, not as a portion total. Users almost always adjust the weight ("not 250, make it 180"), and storing per-100g lets the slider recompute instantly without another model call. Portion totals are derived (`portionMacros` in `src/shared/lib/nutrition.ts`).

**The OpenAI key only ever lives on the server.** Functions in `api/` are Web-standard handlers (`export async function POST(request: Request)`), executed identically by Vercel in production and by the `devApiRoutes` plugin in `vite.config.ts` locally. The variable is named `OPENAI_API_KEY` with no `VITE_` prefix — with that prefix, Vite would bake it into the client bundle.

**Photos are compressed client-side** to 1024 px on the long side (`src/shared/lib/image.ts`). A phone original is 3–8 MB, and base64 inflates that by another third, while Vercel's request body limit is 4.5 MB. It also cuts the vision-token bill.

**The camera opens via `<input type="file" capture="environment">`,** not `getUserMedia`: the latter is historically unreliable in a standalone PWA on iOS, while a file input opens the native camera and works everywhere. The gallery is a *second*, separate input without the `capture` attribute — the attribute cannot be toggled at runtime without losing the reliable camera path, so the photo button opens the camera and the preview screen offers the library.

**Adding food is one composer sheet, not a menu of modes.** `ComposerSheet` is a chat-style surface: photo button, "what did you eat?" field, and microphone in a pinned bar, with Recent/Favorites above it for one-tap re-logging. Barcode and manual macro entry are header icons. Everything else is a step pushed onto `captureStack` in `src/shared/store/app.ts` — a discriminated union, because a step carries a payload (the picked `File`, the chosen `Favorite`) that would otherwise have to be prop-drilled. The stack is what gives every screen a back chevron, and it is mirrored onto `history` so Android's back gesture steps through the flow instead of leaving the app. The backdrop, the drag-to-dismiss gesture, and Escape leave the flow; only the chevron goes back one step.

**Photos get a preview step** before analysis — retake, swap to the library, and add a hint ("fried in 2 tbsp of oil") that goes to `/api/analyze` as `hint` and measurably improves the estimate.

**The microphone is held for a short idle window after a recording, not released immediately.** Tearing the stream down after every recording means a fresh `getUserMedia` on the next tap, which is a permission prompt *per recording* wherever the grant is only session-scoped. A live track also keeps the OS recording indicator lit, so the window is short (30 s, or 10 s when the grant is not known to be persistent) and backgrounding, closing the sheet, or `pagehide` all release immediately.

**On iOS, a home-screen PWA re-asks for the microphone every cold launch.** WebKit does not persist `getUserMedia` grants for standalone web apps — the same constraint that keeps the camera on a file input. There is no app-side fix; `MicDeniedNotice` says so plainly and offers the text field instead.

**Barcode lookup calls Open Food Facts straight from the device** (`src/shared/api/barcode.ts`), not through a serverless proxy. Open Food Facts rate-limits product lookups to 15/min *per IP*; routing every user through a handful of shared Vercel egress IPs trips that limit collectively, and the API returns 503 for everyone. Calling from the device makes the quota per user instead. The data is public and keyless, so direct calls expose nothing. Browsers cannot set `User-Agent`, so the app identifies itself via `X-User-Agent`, which Open Food Facts reads as a fallback.

Coverage is strongest for European and packaged goods and thinner elsewhere — treat it as a fast path for scannable products, not a replacement for photo/text/voice recognition.

**The coach never lets the model invent a number.** Every statistic — calorie spread, snack share, eating window, rapid-succession clusters, trigger foods — is computed locally in `src/features/coach/metrics.ts` and sent to `/api/coach` as facts. The model replies with a typed block list (`CoachBlock` in `src/db/types.ts`), not prose and not HTML: it chooses which visuals to show and writes the text, while chart blocks carry only a series key and are drawn from the app's own `CoachStats`. Rendering model-authored HTML would mean an XSS surface, a broken theme, and layout that drifts on a phone; a fixed block vocabulary gives the same expressiveness with none of that. Model output is clamped in `src/shared/api/coach.ts` before it reaches the UI or IndexedDB, the same way `normalize()` guards the analysis endpoint.

Reports and their follow-up chat are stored in the `insights` table, so they open instantly and offline. The route is stateless: each chat turn resends the ~4 KB fact blob plus the last few turns flattened to text.

## Models

Set in `api/_shared.ts`, overridable via env:

- `OPENAI_MODEL` — photo and text analysis, defaults to `gpt-5.6-terra`. Portion-estimate accuracy is the product, so this isn't the cheapest tier; `gpt-5.6-luna` is an order of magnitude cheaper.
- `OPENAI_TRANSCRIBE_MODEL` — speech recognition, defaults to `gpt-transcribe`.
- `OPENAI_COACH_MODEL` — the diet coach, defaults to `OPENAI_MODEL`.

Voice input is a two-step flow: `MediaRecorder` → `/api/transcribe` → text → `/api/analyze` in text mode. The same endpoint and JSON schema serve photo, text, and voice.

**The SPA rewrite deliberately excludes anything file-shaped.** `vercel.json` falls back to `index.html` only for extensionless route paths. A catch-all rewrite looks harmless until a deploy renames the hashed chunks: a page left open across the deploy requests the old filename, the rewrite answers with `index.html` at status 200, and the browser rejects it with `'text/html' is not a valid JavaScript MIME type`, taking the whole router down. Missing files must 404 honestly. `lazyChunk` in `src/shared/lib/` then catches the rejected import and reloads once to pick up the new build.

## Deploying to Vercel

1. Push the repo and import the project into Vercel — it will be detected as a Vite app.
2. In the project settings, set: `OPENAI_API_KEY`, `APP_ACCESS_CODE`, and optionally `OPENAI_MODEL`.
3. **Make sure to set `APP_ACCESS_CODE`.** Without it, `/api/analyze` and `/api/coach` are open to the whole internet and anyone can burn through your key. The code is entered once in the app: Profile → "Recognition access code". An IP-based limit also applies — `RATE_LIMIT_PER_MINUTE`, defaulting to 20 requests per minute.

## Deliberately out of scope for the MVP

Water and body-weight tracking, recipes, cross-device sync, fibre as a fifth macro. The data model and repository layer are designed so each of these can be added independently, without rewriting existing screens.

Fibre is the one the coach actually misses: `Macros` is `{kcal, protein, fat, carbs}` end to end — database, analysis schema, targets, editors — so satiety is discussed through energy density and protein instead. Adding it means a fifth field everywhere plus a migration for existing entries.
