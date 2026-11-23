import React from 'react';
import { CheckCircle2, AlertCircle, LoaderCircle } from 'lucide-react';
export default function TokenResults({ results, loading, error }) {
  if (loading) return <div className="results-state"><LoaderCircle className="spin" size={24}/><strong>Counting tokens…</strong><span>Calling the selected provider or tokenizer.</span></div>;
  if (error) return <div className="results-state error-state"><AlertCircle size={23}/><strong>Unable to count tokens</strong><span>{error}</span></div>;
  if (!results?.length) return <div className="results-state"><div className="empty-icon">⌗</div><strong>Your results will appear here</strong><span>Enter text, choose a provider and model, then count tokens.</span></div>;
  return <div className="results-grid">{results.map((result) => <article className="result-card" key={result.modelId}>
    <div className="result-top"><span className="status-dot"/><span>{result.modelName}</span><CheckCircle2 size={16}/></div>
    <div className="result-count">{result.inputTokens.toLocaleString()}</div><div className="result-label">input tokens</div>
    {result.source && <p className="result-note">{result.source}</p>}
  </article>)}</div>;
}
