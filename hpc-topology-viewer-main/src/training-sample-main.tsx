import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TrainingSampleView } from './view/TrainingSampleView';
import './training-topology.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TrainingSampleView />
  </StrictMode>,
);
