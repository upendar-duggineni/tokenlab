import { Router } from 'express';

import {
  countTokens,
  listGoogleModels,
  listAnthropicModels,
  listOpenAIModels
} from '../controllers/tokenController.js';

const router = Router();

router.post('/count-tokens', countTokens);

// Dynamic model catalog endpoints
router.get('/google-models', listGoogleModels);
router.get('/anthropic-models', listAnthropicModels);
router.get('/openai-models', listOpenAIModels);

export default router;