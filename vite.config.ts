import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '9002'),
    host: process.env.VITE_HOST || 'localhost',
    open: false, // Don't auto-open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Enable for debugging if needed
    rollupOptions: {
      output: {
        // This is to solve the jspdf issue
        manualChunks: (id) => {
          if (id.includes('jspdf')) {
            return 'jspdf';
          }
        },
      },
    },
  },
});