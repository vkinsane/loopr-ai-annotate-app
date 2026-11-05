import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev only: lets an ngrok HTTPS tunnel reach the dev server for phone testing.
  server: { allowedHosts: ['.ngrok-free.app'] },
})
