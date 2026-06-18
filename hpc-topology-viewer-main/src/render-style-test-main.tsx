import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RenderStyleTestView } from './view/RenderStyleTestView';
import './render-style-test.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RenderStyleTestView />
  </StrictMode>,
);
