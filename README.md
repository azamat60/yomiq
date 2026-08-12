# Yomiq

Photo-based calorie counter. A mobile PWA: photograph your plate — OpenAI identifies the dishes, portion weight, and macros, and the entry lands in your daily diary.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000. The key is only ever read on the server — `/api/*` is served directly by the Vite dev server, no `vercel dev` needed.

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

**The camera opens via `<input type="file" capture="environment">`,** not `getUserMedia`: the latter is historically unreliable in a standalone PWA on iOS, while a file input opens the native camera and works everywhere.

**Barcode lookup calls Open Food Facts straight from the device** (`src/shared/api/barcode.ts`), not through a serverless proxy. Open Food Facts rate-limits product lookups to 15/min *per IP*; routing every user through a handful of shared Vercel egress IPs trips that limit collectively, and the API returns 503 for everyone. Calling from the device makes the quota per user instead. The data is public and keyless, so direct calls expose nothing. Browsers cannot set `User-Agent`, so the app identifies itself via `X-User-Agent`, which Open Food Facts reads as a fallback.

Coverage is strongest for European and packaged goods and thinner elsewhere — treat it as a fast path for scannable products, not a replacement for photo/text/voice recognition.

## Models

Set in `api/_shared.ts`, overridable via env:

- `OPENAI_MODEL` — photo and text analysis, defaults to `gpt-5.6-terra`. Portion-estimate accuracy is the product, so this isn't the cheapest tier; `gpt-5.6-luna` is an order of magnitude cheaper.
- `OPENAI_TRANSCRIBE_MODEL` — speech recognition, defaults to `gpt-transcribe`.

Voice input is a two-step flow: `MediaRecorder` → `/api/transcribe` → text → `/api/analyze` in text mode. The same endpoint and JSON schema serve photo, text, and voice.

## Deploying to Vercel

1. Push the repo and import the project into Vercel — it will be detected as a Vite app.
2. In the project settings, set: `OPENAI_API_KEY`, `APP_ACCESS_CODE`, and optionally `OPENAI_MODEL`.
3. **Make sure to set `APP_ACCESS_CODE`.** Without it, `/api/analyze` is open to the whole internet and anyone can burn through your key. The code is entered once in the app: Profile → "Recognition access code". An IP-based limit also applies — `RATE_LIMIT_PER_MINUTE`, defaulting to 20 requests per minute.

## Deliberately out of scope for the MVP

Weekly/monthly stats, water and body-weight tracking, recipes, cross-device sync. The data model and repository layer are designed so each of these can be added independently, without rewriting existing screens.
