import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe-guard Node.prototype.removeChild and insertBefore against React 19 removeChild desync
if (typeof Node !== 'undefined' && Node.prototype) {
  const origRemove = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child: any) {
    if (child && child.parentNode !== this) {
      if (child.parentNode) {
        return origRemove.call(child.parentNode, child);
      }
      return child;
    }
    return origRemove.call(this, child);
  };

  const origInsert = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode: any, refNode: any) {
    if (refNode && refNode.parentNode !== this) {
      if (refNode.parentNode) {
        return origInsert.call(refNode.parentNode, newNode, refNode);
      }
      return this.appendChild(newNode);
    }
    return origInsert.call(this, newNode, refNode);
  };
}

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

// Suppress known development warnings when unmounting sub-roots during render/commit phase
const originalConsoleError = console.error;
console.error = function (...args: any[]) {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Attempted to synchronously unmount a root while React was already rendering') ||
     args[0].includes('You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

declare global {
  interface Window {
    __react_root?: any;
  }
}

const rootElement = document.getElementById('root')!;
let root = window.__react_root;
if (!root) {
  root = createRoot(rootElement);
  window.__react_root = root;
}

// Defer synchronous unmounting on all React roots to prevent race conditions in React 19
const rootProto = Object.getPrototypeOf(root);
if (rootProto && typeof rootProto.unmount === 'function' && !rootProto.__unmountPatched) {
  const origUnmount = rootProto.unmount;
  rootProto.unmount = function (...args: any[]) {
    setTimeout(() => {
      try {
        origUnmount.apply(this, args);
      } catch (e) {
        // Suppress errors if container node was already detached
      }
    }, 0);
  };
  rootProto.__unmountPatched = true;
}

root.render(<App />);
