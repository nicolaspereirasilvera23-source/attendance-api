import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['svc.png', 'icons/*.png'],
      manifest: {
        name: 'Suarez Voley Club - Asistencias',
        short_name: 'SVC CheckIn',
        description: 'Control de asistencia y gestion del Suarez Voley Club',
        theme_color: '#1E3A8A',
        background_color: '#121212',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/check-in',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precachea todos los assets del build (Cache First por defecto)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            // Lista de jugadores: StaleWhileRevalidate + IndexedDB fallback (Dexie)
            urlPattern: /\/jugadores/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-players-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
            },
          },
        ],
      },
    }),
  ],
})
