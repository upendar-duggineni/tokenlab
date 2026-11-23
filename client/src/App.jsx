
import React, { useMemo, useState } from 'react';
import {
  KeyRound,
  ArrowUpRight,
  ShieldCheck,
  Layers3,
  Hash,
  Zap,
  ExternalLink,
  LockKeyhole,
  ChevronDown
} from 'lucide-react';

import PromptInput from './components/PromptInput.jsx';
import TokenResults from './components/TokenResults.jsx';

const PROVIDERS = {
  anthropic: {
    name: 'Anthropic Claude',
    keyLabel: 'Anthropic API key',
    placeholder: 'sk-ant-…',
    requiredKey: true,
    docs: 'https://docs.anthropic.com/en/docs/build-with-claude/token-counting',
    endpoint: '/api/anthropic-models'
  },

  google: {
    name: 'Google Gemini',
    keyLabel: 'Gemini API key',
    placeholder: 'AIza…',
    requiredKey: true,
    docs: 'https://ai.google.dev/gemini-api/docs/tokens',
    endpoint: '/api/google-models'
  },

  openai: {
    name: 'OpenAI',
    keyLabel: 'OpenAI API key',
    placeholder: 'sk-…',
    requiredKey: true,
    docs: 'https://platform.openai.com/docs/api-reference/models/list',
    endpoint: '/api/openai-models'
  }
};

const SAMPLE = `You are a helpful assistant. Analyze the following request carefully, provide a clear answer, and use concise headings and bullet points where they improve readability. If the request contains assumptions, identify them before answering.`;

export default function App() {
  const [provider, setProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [text, setText] = useState('');
  const [model, setModel] = useState('');

  // Dynamically loaded models for all providers
  const [modelsByProvider, setModelsByProvider] = useState({
    anthropic: [],
    google: [],
    openai: []
  });

  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState('');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentProvider = PROVIDERS[provider];
  const activeModels = modelsByProvider[provider];

  const currentModel =
    activeModels.find((m) => m.id === model) ??
    activeModels[0];

  const total = useMemo(
    () =>
      results.reduce(
        (sum, r) => sum + (r.inputTokens || 0),
        0
      ),
    [results]
  );

  function changeProvider(nextProvider) {
    setProvider(nextProvider);
    setModel('');
    setResults([]);
    setError('');
    setModelsError('');
    setApiKey('');
    setShowKey(false);
  }

  // Load models dynamically from the selected provider
  async function loadModels() {
    if (!apiKey.trim()) {
      setModelsError(`Enter your ${currentProvider.name} API key first.`);
      return;
    }

    setModelsLoading(true);
    setModelsError('');
    setError('');
    setModel('');
    setResults([]);

    // Clear previous catalog for this provider before reloading
    setModelsByProvider((previous) => ({
      ...previous,
      [provider]: []
    }));

    try {
      const response = await fetch(currentProvider.endpoint, {
        method: 'GET',
        headers: {
          'x-provider-api-key': apiKey.trim()
        }
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to load models (${response.status}).`
        );
      }

      const availableModels = data.models || [];

      setModelsByProvider((previous) => ({
        ...previous,
        [provider]: availableModels
      }));

      if (availableModels.length > 0) {
        setModel(availableModels[0].id);
      } else {
        setModelsError(
          'No available models were returned for this API key.'
        );
      }
    } catch (err) {
      setModelsError(
        err.message || 'Unable to load models. Please try again.'
      );
    } finally {
      setModelsLoading(false);
    }
  }

  async function countTokens() {
    if (provider !== 'openai' && !apiKey.trim()) {
      setError(
        `Enter your ${currentProvider.name} API key to count tokens.`
      );
      return;
    }

    if (!model) {
      setError('Load the available models and select a model first.');
      return;
    }

    if (!text.trim()) {
      setError('Enter some text before counting.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-provider': provider
      };

      if (apiKey.trim()) {
        headers['x-provider-api-key'] = apiKey.trim();
      }

      const response = await fetch('/api/count-tokens', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text,
          model
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed (${response.status})`
        );
      }

      setResults(data.results || []);
    } catch (err) {
      setError(
        err.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Hash size={20} />
          </div>

          <span>
            token<span className="brand-accent">lab</span>
          </span>

          <span className="product-pill">
            MULTI-LLM TOKEN ANALYZER
          </span>
        </div>

        <div className="topbar-right">
          <span className="secure-tag">
            <ShieldCheck size={14} />
            BYOK · Private
          </span>

          <a
            href={currentProvider.docs}
            target="_blank"
            rel="noreferrer"
            className="docs-link"
          >
            API Docs <ExternalLink size={13} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-kicker">
            <span className="hero-kicker-dot" />
            TOKEN INTELLIGENCE
          </div>

          <h1>
            Know your prompt.
            <br />
            <span>Count every token.</span>
          </h1>

          <p>
            Enter any prompt, choose an LLM model, and see the token count
            using provider APIs or a model-aware tokenizer.
          </p>

          <div className="hero-stats">
            <div>
              <Layers3 size={15} />
              <span>Model selection</span>
            </div>

            <div>
              <Zap size={15} />
              <span>Instant counts</span>
            </div>

            <div>
              <LockKeyhole size={15} />
              <span>Key not stored</span>
            </div>
          </div>
        </section>

        <div className="workspace">
          <div className="left-column">
            {/* Provider and API key */}
            <section className="api-panel panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">PROVIDER</span>
                  <h2>Choose your AI provider</h2>
                </div>

                <span className="key-badge">
                  <Layers3 size={13} />
                  Multi-provider
                </span>
              </div>

              <label className="select-label" htmlFor="provider-select">
                LLM Provider
              </label>

              <div className="select-wrap">
                <select
                  id="provider-select"
                  value={provider}
                  onChange={(e) => changeProvider(e.target.value)}
                >
                  {Object.entries(PROVIDERS).map(([id, p]) => (
                    <option value={id} key={id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <ChevronDown size={16} />
              </div>

              {/* API Key */}
              <div className="panel-heading key-heading">
                <div>
                  <span className="eyebrow">AUTHENTICATION</span>
                  <h2>{currentProvider.keyLabel}</h2>
                </div>

                <span className="key-badge">
                  <KeyRound size={13} />
                  Required to load models
                </span>
              </div>

              <div className="key-input-wrap">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    const newKey = e.target.value;

                    setApiKey(newKey);
                    setError('');
                    setModelsError('');

                    // Clear models when the API key changes
                    setModelsByProvider((previous) => ({
                      ...previous,
                      [provider]: []
                    }));

                    setModel('');
                    setResults([]);
                  }}
                  placeholder={currentProvider.placeholder}
                  autoComplete="off"
                  spellCheck="false"
                />

                <button
                  type="button"
                  className="show-key"
                  onClick={() => setShowKey((v) => !v)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="key-help">
                <ShieldCheck size={14} />

                <span>
                  API key is used to retrieve models and count tokens.
                  It is not saved to disk or logged by TokenLab.
                </span>
              </div>
            </section>

            {/* Prompt input */}
            <PromptInput
              text={text}
              onChange={(v) => {
                setText(v);
                setError('');
              }}
              onClear={() => {
                setText('');
                setResults([]);
                setError('');
              }}
              onPasteSample={() => {
                setText(SAMPLE);
                setResults([]);
                setError('');
              }}
            />

            {/* Dynamic model selection */}
            <section className="models-panel panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">TOKENIZER TARGET</span>
                  <h2>Select model</h2>
                </div>
              </div>

              {/* Load models button */}
              <button
                type="button"
                className="count-button"
                onClick={loadModels}
                disabled={modelsLoading || !apiKey.trim()}
              >
                <span>
                  {modelsLoading
                    ? 'Loading available models…'
                    : 'Load available models'}
                </span>
                <ArrowUpRight size={18} />
              </button>

              {/* Model loading error */}
              {modelsError && (
                <p className="error-message">{modelsError}</p>
              )}

              <label className="select-label" htmlFor="model-select">
                Model
              </label>

              <div className="select-wrap">
                <select
                  id="model-select"
                  value={model}
                  disabled={activeModels.length === 0}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setResults([]);
                    setError('');
                  }}
                >
                  {activeModels.length === 0 && (
                    <option value="">
                      Load models first
                    </option>
                  )}

                  {activeModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <ChevronDown size={16} />
              </div>

              <div className="selected-model-description">
                {currentModel?.description || ''}
              </div>

              {currentModel?.inputTokenLimit && (
                <div className="selected-model-description">
                  Input limit: {currentModel.inputTokenLimit.toLocaleString()} tokens
                </div>
              )}

              {currentModel?.outputTokenLimit && (
                <div className="selected-model-description">
                  Output limit: {currentModel.outputTokenLimit.toLocaleString()} tokens
                </div>
              )}

              <p className="models-footnote">
                {provider === 'anthropic'
                  ? 'Models are retrieved from the Anthropic API. Token counts use the official counting endpoint.'
                  : provider === 'google'
                    ? 'Models are retrieved from the Google Gemini API. Token counts use the official countTokens endpoint.'
                    : 'Models are retrieved from OpenAI. Token counts use a local tiktoken estimate, not API billing tokens.'}
              </p>
            </section>

            {/* Count tokens button */}
            <button
              className="count-button"
              onClick={countTokens}
              disabled={loading}
            >
              <span>
                {loading ? 'Counting…' : 'Count tokens'}
              </span>
              <ArrowUpRight size={18} />
            </button>
          </div>

          {/* Results */}
          <div className="right-column">
            <section className="results-panel panel">
              <div className="panel-heading results-heading">
                <div>
                  <span className="eyebrow">OUTPUT</span>
                  <h2>Token results</h2>
                </div>

                <span className="live-badge">
                  <span />
                  LIVE
                </span>
              </div>

              {results.length > 0 && !loading && !error && (
                <div className="summary-bar">
                  <div>
                    <span>Selected model</span>
                    <strong>{results.length}</strong>
                  </div>

                  <div>
                    <span>Token count</span>
                    <strong>{total.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              <TokenResults
                results={results}
                loading={loading}
                error={error}
              />
            </section>

            {/* Privacy information */}
            <section className="info-panel panel">
              <div className="info-icon">
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>Your key stays yours</strong>
                <p>
                  Provider keys are sent to the app backend only when needed.
                  The app does not persist them. Use this only on deployments
                  you trust.
                </p>
              </div>
            </section>

            {/* Token accuracy information */}
            <section className="info-panel note-panel">
              <div className="info-icon purple">
                <Hash size={17} />
              </div>

              <div>
                <strong>Tokenizer accuracy</strong>
                <p>
                  Anthropic and Gemini use provider token-count APIs.
                  OpenAI counts use a local tokenizer estimate for text-only
                  input, not API billing tokens for complete chat messages.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer>
        <span>
          TokenLab <span className="footer-sep">/</span>
          Multi-provider prompt transparency
        </span>

        <span>
          Token count source varies by provider
          <a
            href={currentProvider.docs}
            target="_blank"
            rel="noreferrer"
          >
            Learn more <ExternalLink size={12} />
          </a>
        </span>
      </footer>
    </div>
  );
}
