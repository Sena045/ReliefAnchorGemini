import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: '/',
    define: {
      // Safely replace process.env.API_KEY with the string value from environment.
      // We default to empty string so the app can detect missing keys at runtime and instruct the user.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
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