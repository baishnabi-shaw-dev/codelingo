# CodeLingo Translator

CodeLingo is a browser-based code translation and optimization tool with an OpenAI-backed translation API.

The frontend now uses the API as the only translation path. That keeps the output aligned with the selected target language and translation style instead of silently falling back to deterministic placeholder translation.

## Supported Target Languages

- Python
- JavaScript
- TypeScript
- Java
- Kotlin
- C
- C++
- C#
- Go
- PHP
- Ruby
- Swift
- Rust
- Dart
- R

## Setup

1. Install Node.js 18 or newer.
2. Create `api.properties`.
3. Set `OPENAI_API_KEY`.
4. Optionally set `OPENAI_BASE_URL` and `OPENAI_MODEL`.
5. Start the app:

```bash
npm start
```

If port `3000` is already in use, the server automatically tries the next available local port.

For local development with auto-restart, use:

```bash
npm run dev
```

6. Open:

```text
http://localhost:3000
```

## Live Server

If you open `index.html` with VS Code Live Server on port `5500`, the frontend automatically calls:

```text
http://localhost:3000/api/translate
```

Keep `npm start` running in another terminal.

The backend also accepts `.env` as a fallback, but `api.properties` is the primary config file now.

If your key starts with `gsk_`, the server will automatically use Groq's OpenAI-compatible base URL. Otherwise it defaults to OpenAI's API URL.

## API

`POST /api/translate`

The backend sends the source code, detected language, target language, style, and options to OpenAI with a strict translation contract. The response includes:

- detected language
- required dependencies
- compatibility notes
- complete translated code

## Important

No translation system can guarantee perfect equivalence for every language pair, but this project now routes all translation through the API so the result is model-generated rather than rule-generated.

## Structure

- `index.html`: UI shell and layout
- `styles.css`: visual design
- `app.js`: frontend state, detection, and API client
- `server.js`: HTTP server, static file hosting, and translation endpoint
- `translation-contract.js`: shared backend translation prompt and schema
