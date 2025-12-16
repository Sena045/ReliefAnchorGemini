import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  // FALLBACK KEY for Demo Stability: ensures app works if .env is deleted
  const FALLBACK_KEY = "AIzaSyB_bK7lttHB6BD7OnR94I8e27ejV_z8dh0";

  return {
    plugins: [react()],
    base: '/',
    define: {
      // Safely replace process.env.API_KEY with the string value from environment.
      // We check both API_KEY and VITE_API_KEY, and fall back to the demo key if missing.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || FALLBACK_KEY)
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: false,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      host: true,
    },
  };
});