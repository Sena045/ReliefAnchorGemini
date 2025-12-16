import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/',
    define: {
      // Safely replace process.env.API_KEY with the string value, fallback to the provided key if undefined
      'process.env.API_KEY': JSON.stringify(env.API_KEY || 'AIzaSyB_bK7lttHB6BD7OnR94I8e27ejV_z8dh0')
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