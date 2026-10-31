import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {

  const env = loadEnv(mode, process.cwd(), '')

  if (command === 'build' && !env.VITE_ROOT_API) {
    throw new Error(
      'VITE_ROOT_API is not set. Add it to frontend/.env or set it as an ' +
        'environment variable on your host, e.g. VITE_ROOT_API=http://localhost:3000'
    )
  }
  if (command === 'build') {
    console.log(`Building with VITE_ROOT_API = ${env.VITE_ROOT_API}`)
  }

  return {
    plugins: [vue()],

    base: '/',
    resolve: {
      alias: {
        // fileURLToPath works on Windows, macOS and Linux
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    // `npm run preview` serves dist/. 
    preview: {
      port: 5173,
      strictPort: true
    }
  }
})

