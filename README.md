# TokenLab – Multi-LLM Token Counter

A web-based token counting tool that helps you estimate or calculate token usage across multiple AI providers using their respective models.

## 🚀 Live Demo

**Try TokenLab here:**  
https://tokenlab.onrender.com/

## ✨ Features

- **Multi-provider support** – Supports OpenAI, Anthropic Claude, and Google Gemini.
- **Dynamic model selection** – Fetches available models from provider APIs using your API key.
- **Token counting**
  - Anthropic Claude – Official token counting API.
  - Google Gemini – Token counting API.
  - OpenAI – Local token counting using `js-tiktoken`.
- **API key based access** – Users supply their own API keys.
- **Simple interface** – Enter text, choose a provider and model, and view token results.
- **Responsive frontend** – Built with React and Vite.
- **Backend API** – Node.js and Express.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Vite | Frontend development and build |
| Node.js | Backend runtime |
| Express.js | Backend API |
| js-tiktoken | OpenAI token estimation |
| Anthropic API | Claude token counting |
| Gemini API | Gemini token counting |
| Render | Cloud deployment |

## 🧠 Supported Providers

### OpenAI
- Dynamic model listing through the OpenAI API.
- Local token counting with `js-tiktoken`.
- Token counts are estimates and may not exactly match all API processing or billing token counts.

### Anthropic Claude
- Dynamic model listing.
- Uses Anthropic's token counting API.

### Google Gemini
- Dynamic model listing.
- Uses Google's token counting endpoint.

## 📦 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/upendar-duggineni/tokenlab.git
cd tokenlab
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
npm --prefix client install
```

### 4. Configure environment variables

Create a `.env` file based on `.env.example` if required by the backend.

Do not commit API keys or your `.env` file.

### 5. Start the application

```bash
npm run dev
```

## 🌐 Deployment

TokenLab is deployed using **Render**.

**Live application:** https://tokenlab.onrender.com/

The deployment uses the `render.yaml` configuration file for build, start, and health-check settings.

## 🔐 Security

- API keys are supplied by users.
- API keys should not be committed to GitHub.
- Environment secrets should be kept out of source control.
- Never expose private API keys in logs or frontend source code.

## 📂 Project Structure

```text
tokenlab/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ModelSelector.jsx
│       │   ├── PromptInput.jsx
│       │   └── TokenResults.jsx
│       ├── App.jsx
│       └── styles.css
├── server/
│   ├── controllers/
│   │   └── tokenController.js
│   ├── routes/
│   │   └── tokenRoutes.js
│   └── server.js
├── package.json
├── render.yaml
└── README.md
```

## 👨‍💻 Author

**Upendar Duggineni**

GitHub: https://github.com/upendar-duggineni

---

*TokenLab – Simplifying token analysis across AI models.*
