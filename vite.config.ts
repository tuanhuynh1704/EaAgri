import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Changes on every push/deploy; AuthContext signs everyone out when it changes
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(
      process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now()),
    ),
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: false,
    allowedHosts: true,
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
