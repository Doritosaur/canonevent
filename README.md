# Canon Event

A personal decision memory. Speak about a decision you made, review the transcript, and keep it. Later, ask your
past self a question and get an answer drawn only from your own memories. It runs on iOS, Android and the web
(Expo + React Native). The server side is [`../memory-backend`](../memory-backend).

## What it does

- **Record.** Talk for as long as you like. A take with no audible speech is rejected on the device and never sent anywhere.
- **Review.** The speech is transcribed (Sarvam) and structured into *what happened / what you were thinking / what you learned*, with a title, category and tags. You can edit before saving.
- **Save.** Saving stores the text first, so it is searchable at once, and uploads the recording last.
- **Ask.** Ask by voice. The answer cites only your own memories and links to them. Recent questions are kept and reopen exactly as they were answered.
- **Update.** Record how a decision turned out; it is added to that memory.
- **Insights.** Per-category and per-month counts, and the patterns your memories were analysed for.
- **Your data.** Delete one entry (with Undo) or everything: memories, recordings and questions.

## Run it

Needs Node.js (developed on 24) and the backend running (see [`../memory-backend/README.md`](../memory-backend/README.md); `scripts/dev.ps1` starts all of it).

```sh
npm install
cp .env.example .env      # then fill in the two Supabase values
npx expo start            # press w for web, a for Android, i for iOS
```

Environment (`.env`, git-ignored). The app stops at startup with a clear message if the first two are missing.

| Variable | |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Android emulator `http://10.0.2.2:54321`, a physical device `http://<your LAN IP>:54321`, iOS simulator or web `http://127.0.0.1:54321` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | The anon / publishable key from `supabase status`. **Never the service-role key**: `EXPO_PUBLIC_` values are bundled into the app. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Optional. Without a web client ID, **development builds** sign in with a built-in dev account (`dev@canonevent.local`, created on first use). Release builds never use it. |

Restart the dev server after changing `.env`.

### Platform notes

- **Web:** open it at `http://localhost:8081`, not `127.0.0.1`. The audio bucket's CORS policy must list that exact origin. Recordings are browser blobs that only live until the page reloads, so audio that is saved but not yet uploaded is lost on a reload.
- **Google sign-in** uses a native module, so it needs a development build (`npx expo run:ios` / `run:android`, or EAS) rather than Expo Go.
- A physical device must be able to reach your machine on the LAN address you put in `EXPO_PUBLIC_SUPABASE_URL`.

## Commands

```sh
npm run typecheck     # tsc --noEmit
npm run lint          # expo lint
```

`lefthook` runs both on staged files before each commit (lint with zero warnings allowed). Run both before declaring work done.

## How it fits together

```
record ──► transcribe ──► structure ──► review ──► save ──► (outbox) ──► server
 device    Sarvam, via     LLM, via       you can     local      text first,
 checks    the API,        the API        edit        entry      audio last
           nothing stored
```

- **Nothing reaches the server before Save.** Audio is sent for transcription and discarded. Discarding a draft needs no server call.
- **Saves survive failures.** A saved memory goes into a persisted outbox and is retried (on launch, on sync, every 30 s) until it lands, including the audio upload. Retrying is safe: every step is idempotent by the memory's id.
- **Deletes are durable too.** A delete waits 10 s so Undo works, is queued on the device, and is retried until the server confirms, so closing the app can't bring a memory back.
- **Search and processing** (chunking, embeddings) happen on the server. A memory whose processing failed is retried automatically at sync.
- **Playback** uses the local file when it exists, otherwise streams the stored recording from a short-lived link.

## Layout

```
src/
  app/             Expo Router screens: (tabs)/ for Home, Ask, Insights, Profile; record, processing,
                   review, saved, answer, update, updated, entry/[id], onboarding, edit-profile
  components/ui/   Design-system pieces (Button, Card, Text, Toast, ...)
  components/lore/ App-specific pieces (EntryCard, AudioBar, RecorderPanel, ...)
  lib/             api.ts (the only place that talks to the backend), supabase.ts, googleAuth.ts,
                   recording.ts (empty-take checks), audioFiles.ts, navigation.ts, format.ts
  services/ai.ts   Recording, question and update pipelines built on lib/api
  state/lore.ts    The zustand store: entries, outbox, pending deletes, profile (persisted to AsyncStorage)
  hooks/           useRecorder and small UI hooks
  theme/           Palette (light and dark), typography, spacing
```

Conventions are in [`AGENTS.md`](AGENTS.md). In short: Expo Router for all navigation, install packages with
`npx expo install`, and read the versioned Expo docs before using an Expo API, since they change between SDKs.

## Known limits

- Transcription jobs live in the inference service's memory, so a restart mid-transcription shows "Try again".
- A recording abandoned mid-processing (app killed) leaves its file on the device.
- If the LLM is down at review time, the memory is saved with placeholder fields and the server fills them in afterwards; the review screen can't edit the category or title.
- Asking is voice-only.

## License

See [`LICENSE`](LICENSE).
