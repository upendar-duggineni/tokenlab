import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rateLimit from 'express-rate-limit';
import tokenRoutes from './routes/tokenRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../client/dist');

app.disable('x-powered-by');
app.use(express.json({ limit: '300kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many requests. Please wait a minute and try again.' } }));
app.use('/api', tokenRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Production: serve the built React app from the same Render Web Service.
app.use(express.static(clientDist));
app.get(/.*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

app.listen(PORT, () => {
  // Do not print keys, request bodies, or user prompts to the console.
  console.log(`TokenLab server listening on port ${PORT}`);
});
