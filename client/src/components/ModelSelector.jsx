import React from 'react';
import { Check, Sparkles } from 'lucide-react';

export default function ModelSelector({ models, selected, onToggle }) {
  return <div className="model-list">
    {models.map((model) => {
      const active = selected.includes(model.id);
      return <button type="button" key={model.id} onClick={() => onToggle(model.id)} className={`model-option ${active ? 'selected' : ''}`} aria-pressed={active}>
        <span className={`model-check ${active ? 'checked' : ''}`}>{active && <Check size={13}/>}</span>
        <span className="model-icon"><Sparkles size={16}/></span>
        <span className="model-copy"><strong>{model.name}</strong><small>{model.description}</small></span>
      </button>;
    })}
  </div>;
}
