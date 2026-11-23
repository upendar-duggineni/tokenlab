import React from 'react';
import { Clipboard, Trash2 } from 'lucide-react';
export default function PromptInput({ text, onChange, onClear, onPasteSample }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return <section className="prompt-panel panel">
    <div className="panel-heading"><div><span className="eyebrow">YOUR INPUT</span><h2>Prompt workspace</h2></div><div className="inline-actions"><button className="icon-button" onClick={onPasteSample} title="Use sample prompt"><Clipboard size={16}/> Sample</button><button className="icon-button" onClick={onClear} title="Clear prompt"><Trash2 size={16}/> Clear</button></div></div>
    <textarea value={text} onChange={(e) => onChange(e.target.value)} maxLength={100000} placeholder="Paste your prompt, write a message, or test a long instruction…" aria-label="Prompt text" />
    <div className="input-footer"><span>{words.toLocaleString()} words</span><span>{text.length.toLocaleString()} / 100,000 characters</span></div>
  </section>;
}
