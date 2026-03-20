/**
 * Application Entry Point
 * Initializes React root element with StrictMode and loads global styles.
 * All styling (CSS variables, reset, and global styles) are imported here.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/global.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in index.html');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);