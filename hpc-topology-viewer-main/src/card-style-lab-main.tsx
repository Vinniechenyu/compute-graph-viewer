import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CardStyleLabView } from './view/CardStyleLabView';
import './card-style-lab.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CardStyleLabView />
  </StrictMode>,
);
