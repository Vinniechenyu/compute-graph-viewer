import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UbFabricReferenceView } from './view/UbFabricReferenceView';
import './ub-fabric-reference.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UbFabricReferenceView />
  </StrictMode>,
);
