import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: 'worthit.localhost',
      clientPort: 443,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          // UI framework core (includes framer-motion since HeroUI depends on it)
          'heroui-core': ['@heroui/system', '@heroui/theme', 'framer-motion'],
          // HeroUI main components (split from core to enable better caching)
          'heroui-components': ['@heroui/react'],
          // Form handling
          'react-hook-form': ['react-hook-form'],
          // i18n
          'i18n': ['i18next', 'react-i18next'],
          // Additional utilities
          'utils': ['next-themes', 'lucide-react'],
        },
      },
    },
  },
})
