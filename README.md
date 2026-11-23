# TokenLab — Multi-Provider Token Counter

TokenLab lets a user paste a prompt, select an LLM provider and model, and view the prompt's token count.

## Providers

- **Anthropic Claude:** Uses Anthropic's official `POST /v1/messages/count_tokens` API.
- **Google Gemini:** Uses Google's `models/{model}:countTokens` API.
- **OpenAI:** Uses `js-tiktoken` locally with the model's tokenizer encoding. OpenAI does not expose a standalone official token-count endpoint. This is a text-only tokenizer count, not an exact API billing count for a full chat request.

API keys are entered in the UI, sent only in request headers for providers that require them, and are not stored in a database, local storage, or server logs. OpenAI's local tokenizer does not need an API key; the optional OpenAI key field is not sent or used.

## Folder structure

```text
tokenlab/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── PromptInput.jsx
│   │   │   ├── ModelSelector.jsx
│   │   │   └── TokenResults.jsx
│   │   │ ├── App.jsx
│   │   │ ├── main.jsx
│   │   │ └── styles.css
│   │   ├── index.html
│   │   └── package.json
├── server/                 # Express backend
│   ├── controllers/tokenController.js
│   ├── routes/tokenRoutes.js
│   └── server.js
├── package.json
├── render.yaml
├── .env.example
└── .gitignore
```

## Prerequisites

- Node.js 20+ (recommended)
- npm
- API key for Anthropic or Google Gemini if using those providers

## Install locally

From the root `tokenlab` folder:

```bash
npm install
npm --prefix client install
```

## Run in development

```bash
npm run dev
```

- React/Vite: http://localhost:5173
- Express API: http://localhost:3001
- Health check: http://localhost:3001/api/health

Vite forwards `/api` requests to the Express backend during local development.

## Build and run production locally

```bash
npm run build
npm start
```

Then open http://localhost:3001.

## User workflow

1. Pick a provider from the Provider dropdown.
2. Enter that provider's API key (Anthropic and Gemini require it; OpenAI local counting does not).
3. Paste or type a prompt.
4. Select a model from the model dropdown.
5. Click **Count tokens**.
6. Review the visible token count and its counting source.

## Deployment to Render

This repository includes `render.yaml` for a single Render Web Service.

1. Push this folder to a GitHub repository.
2. In Render, select **New → Blueprint** and connect the repository.
3. Render reads `render.yaml`, installs dependencies, builds the client, and starts Express.
4. Open the Render service URL after deployment completes.

The production Express server serves the compiled React app from `client/dist` and API routes from `/api`.

## API key security

- Keys are not hardcoded.
- Keys are not saved to local storage or a database.
- Keys are sent as request headers only for the current count request.
- Request payloads and headers containing keys are not logged.
- Use only a deployment you trust; a public server operator could change the server code to collect keys.
- OpenAI tokenizer mode runs locally on the server and does not call OpenAI's API.

## Notes and limitations

- Provider model identifiers can change or be retired; update model IDs in `client/src/App.jsx` and the allowlist/labels in `server/controllers/tokenController.js` when providers change their catalogs.
- Token counts for provider APIs may include provider-specific text formatting overhead.
- OpenAI tokenizer counts are text-only, tokenizer-based counts and do not account for all chat-message/API overhead.
- This app counts input tokens only. It does not generate model responses.
