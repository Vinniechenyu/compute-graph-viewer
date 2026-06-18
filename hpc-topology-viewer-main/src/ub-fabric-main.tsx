import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UbFabricView } from './view/UbFabricView';
import './ub-fabric.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UbFabricView />
  </StrictMode>,
);
