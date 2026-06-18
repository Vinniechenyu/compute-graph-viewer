import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base is set for project-pages hosting (https://<user>.github.io/hpc-topology-viewer/).
// Override with VITE_BASE=/ for root hosting or local preview.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/hpc-topology-viewer/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        cardLab: resolve(__dirname, 'card-style-lab.html'),
        main: resolve(__dirname, 'index.html'),
        renderStyle: resolve(__dirname, 'render-style-test.html'),
        sample: resolve(__dirname, 'training-topology-sample.html'),
        ubFabric: resolve(__dirname, 'ub-fabric.html'),
        ubFabricReference: resolve(__dirname, 'ub-fabric-reference.html'),
      },
    },
  },
});
