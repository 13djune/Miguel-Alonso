import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely handle circular references in JSON.stringify (for AI Studio error overlay)
const originalStringify = JSON.stringify;
JSON.stringify = function(value, replacer, space) {
  const seen = new WeakSet();
  const safeReplacer = (key: string, val: any) => {
    if (typeof val === 'object' && val !== null) {
      if (seen.has(val)) {
        return '[Circular]';
      }
      seen.add(val);
    }
    return typeof replacer === 'function' ? replacer(key, val) : val;
  };
  try {
    return originalStringify(value, replacer || safeReplacer, space);
  } catch (e) {
    return originalStringify(value, safeReplacer, space);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
