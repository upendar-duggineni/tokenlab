
import { encodingForModel, getEncoding } from 'js-tiktoken';

const MODEL_LABELS = {};

function safeProviderError(status, provider) {
  if (status === 400) return `${provider}: Invalid request.`;
  if (status === 401) return `${provider}: Invalid API key.`;
  if (status === 403) return `${provider}: API access denied.`;
  if (status === 404) return `${provider}: Endpoint or model not found.`;
  if (status === 429) return `${provider}: Rate limit or quota exceeded.`;
  if (status >= 500) return `${provider}: Provider server error.`;
  return `${provider}: Request failed (${status}).`;
}

// -----------------------------
// Anthropic model catalog
// -----------------------------
export async function listAnthropicModels(req, res) {
  const apiKey = req.get('x-provider-api-key')?.trim();

  if (!apiKey) {
    return res.status(400).json({
      error: 'Enter your Anthropic API key first.'
    });
  }

  try {
    let allModels = [];
    let afterId = null;

    // Fetch catalog pages
    while (true) {
      const url = new URL('https://api.anthropic.com/v1/models');
      url.searchParams.set('limit', '100');

      if (afterId) {
        url.searchParams.set('after_id', afterId);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return res.status(response.status).json({
          error:
            data.error?.message ||
            safeProviderError(response.status, 'Anthropic')
        });
      }

      allModels.push(...(data.data || []));

      if (!data.has_more || !data.data?.length) {
        break;
      }

      afterId = data.data[data.data.length - 1].id;

      if (!afterId) break;
    }

    const models = allModels.map((m) => ({
      id: m.id,
      name: m.display_name || m.id,
      description: `Anthropic model · ${m.id}`
    }));

    return res.json({ models });
  } catch (error) {
    console.error('Anthropic model catalog request failed.');

    return res.status(500).json({
      error: 'Unable to load Anthropic models. Please try again.'
    });
  }
}

// -----------------------------
// Google Gemini model catalog
// -----------------------------
export async function listGoogleModels(req, res) {
  const apiKey = req.get('x-provider-api-key')?.trim();

  if (!apiKey) {
    return res.status(400).json({
      error: 'Enter your Gemini API key first.'
    });
  }

  try {
    let allModels = [];
    let pageToken = null;

    while (true) {
      const url = new URL(
        'https://generativelanguage.googleapis.com/v1beta/models'
      );

      url.searchParams.set('pageSize', '100');

      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey
        }
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return res.status(response.status).json({
          error:
            data.error?.message ||
            safeProviderError(response.status, 'Google Gemini')
        });
      }

      allModels.push(...(data.models || []));

      pageToken = data.nextPageToken;

      if (!pageToken) break;
    }

    // Keep models that support the official token-count method
    const models = allModels
  .filter((m) =>
    m.supportedGenerationMethods?.includes('generateContent')
  )
  // Exclude the restricted older Flash model that is failing
  .filter((m) => {
    const id = m.name.replace(/^models\//, '');
    return id !== 'gemini-2.5-flash';
  })
  .map((m) => ({
    id: m.name.replace(/^models\//, ''),
    name: m.displayName || m.name.replace(/^models\//, ''),
    description: m.description || 'Gemini model',
    inputTokenLimit: m.inputTokenLimit,
    outputTokenLimit: m.outputTokenLimit
  }))
  // Put the newer Flash model first when available
  .sort((a, b) => {
    if (a.id === 'gemini-3.8-flash') return -1;
    if (b.id === 'gemini-3.8-flash') return 1;
    return a.name.localeCompare(b.name);
  });
    // Remove duplicates
    const uniqueModels = [
      ...new Map(models.map((m) => [m.id, m])).values()
    ];

    return res.json({ models: uniqueModels });
  } catch (error) {
    console.error('Gemini model catalog request failed.');

    return res.status(500).json({
      error: 'Unable to load Gemini models. Please try again.'
    });
  }
}

// -----------------------------
// OpenAI model catalog
// -----------------------------
export async function listOpenAIModels(req, res) {
  const apiKey = req.get('x-provider-api-key')?.trim();

  if (!apiKey) {
    return res.status(400).json({
      error: 'Enter your OpenAI API key to load models.'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.error?.message ||
          safeProviderError(response.status, 'OpenAI')
      });
    }

    const models = (data.data || [])
      .map((m) => ({
        id: m.id,
        name: m.id,
        description: 'OpenAI model · Local tokenizer estimate'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.json({ models });
  } catch (error) {
    console.error('OpenAI model catalog request failed.');

    return res.status(500).json({
      error: 'Unable to load OpenAI models. Please try again.'
    });
  }
}

// -----------------------------
// Anthropic official token count
// -----------------------------
async function countAnthropicTokens({ apiKey, model, text }) {
  const response = await fetch(
    'https://api.anthropic.com/v1/messages/count_tokens',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: text
          }
        ]
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
      safeProviderError(response.status, 'Anthropic')
    );
  }

  return {
    inputTokens: data.input_tokens,
    source: 'Anthropic official Token Counting API'
  };
}

// -----------------------------
// Gemini official token count
// -----------------------------
async function countGemini(text, model, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:countTokens`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text }]
          }
        ]
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
      safeProviderError(response.status, 'Google Gemini')
    );
  }

  return {
    inputTokens: data.totalTokens,
    source: 'Google Gemini official countTokens API'
  };
}

// -----------------------------
// OpenAI local token counter
// -----------------------------
function countOpenAI(text, model) {
  let encoding;

  try {
    encoding = encodingForModel(model);
  } catch {
    // Fall back to a broad encoding for unrecognized/newer models
    encoding = getEncoding('o200k_base');
  }

  try {
    const tokens = encoding.encode(text);

    return {
      inputTokens: tokens.length,
      source: 'Local tiktoken estimate (text only)'
    };
  } finally {
    encoding.free?.();
  }
}

// -----------------------------
// Main token-count controller
// -----------------------------
export async function countTokens(req, res) {
  const provider = req.get('x-provider');
  const apiKey = req.get('x-provider-api-key')?.trim();

  const { text, model } = req.body || {};

  if (!['anthropic', 'google', 'openai'].includes(provider)) {
    return res.status(400).json({
      error: 'Unsupported provider.'
    });
  }

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      error: 'Text is required.'
    });
  }

  if (text.length > 100000) {
    return res.status(400).json({
      error: 'Text is too long. Maximum is 100,000 characters.'
    });
  }

  if (!model || typeof model !== 'string') {
    return res.status(400).json({
      error: 'Please select a model.'
    });
  }

  if (provider !== 'openai' && !apiKey) {
    return res.status(400).json({
      error: 'API key is required.'
    });
  }

  try {
    let result;

    if (provider === 'anthropic') {
      result = await countAnthropicTokens({
        apiKey,
        model,
        text
      });
    } else if (provider === 'google') {
      result = await countGemini(text, model, apiKey);
    } else {
      result = countOpenAI(text, model);
    }

    return res.json({
      results: [
        {
          provider,
          model,
          modelName: MODEL_LABELS[model] || model,
          inputTokens: result.inputTokens,
          source: result.source
        }
      ]
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Token counting failed.'
    });
  }
}
