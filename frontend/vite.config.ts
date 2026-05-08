import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  // `loadEnv` reads from `.env*` files only. Hosts like Vercel inject env vars
  // directly into `process.env` during build, so we fall back to `process.env`.
  const env = loadEnv(mode, '.', '');
  const geminiApiKey =
    env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': 'http://localhost:3000',
        '/storage': 'http://localhost:3000',
      },
    },
    preview: {
      proxy: {
        '/api': 'http://localhost:3000',
        '/storage': 'http://localhost:3000',
      },
    },
  };
});
