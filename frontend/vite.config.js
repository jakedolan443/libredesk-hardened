import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import path from 'path'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

export default defineConfig(() => {
  const appPath = 'apps/main'

  const apiTarget = process.env.LD_API_TARGET || 'http://127.0.0.1:9000'
  const wsTarget = process.env.LD_WS_TARGET || 'ws://127.0.0.1:9000'
  const mainPort = process.env.LD_DEV_PORT ? Number(process.env.LD_DEV_PORT) : 8000

  // Include the mailbox application and shared components.
  const tailwindConfig = require('./tailwind.config.cjs')
  const scopedContent = ['./apps/main/src/**/*.{js,ts,vue}', './shared-ui/**/*.{js,ts,vue}']

  return {
    base: '/',
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern'
        }
      },
      postcss: {
        plugins: [tailwind({ ...tailwindConfig, content: scopedContent }), autoprefixer()]
      }
    },
    root: path.resolve(__dirname, appPath),
    publicDir: path.resolve(__dirname, 'public'),
    // Keep the Vite cache with the frontend dependencies.
    cacheDir: path.resolve(__dirname, 'node_modules/.vite-main'),
    server: {
      cors: { origin: '*' },
      // Allow shared-ui imports in development.
      fs: {
        allow: [path.resolve(__dirname)]
      },
      port: mainPort,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        },

        '/static': {
          target: apiTarget,
          changeOrigin: true
        },
        '/logout': {
          target: apiTarget,
          changeOrigin: true
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true
        },
        '/ws': {
          target: wsTarget,
          ws: true,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: path.resolve(__dirname, 'dist/main'),
      emptyOutDir: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            radix: ['radix-vue', 'reka-ui'],
            icons: ['lucide-vue-next', '@radix-icons/vue'],
            utils: ['@vueuse/core', 'clsx', 'tailwind-merge', 'class-variance-authority'],
            forms: ['vee-validate', '@vee-validate/zod', 'zod'],
            misc: ['axios', 'date-fns', 'mitt', 'qs', 'vue-i18n'],
            // Mail editor and settings chunks.
            editor: [
              '@tiptap/vue-3',
              '@tiptap/starter-kit',
              '@tiptap/extension-image',
              '@tiptap/extension-link',
              '@tiptap/extension-placeholder',
              '@tiptap/extension-table',
              '@tiptap/extension-table-cell',
              '@tiptap/extension-table-header',
              '@tiptap/extension-table-row'
            ],
            codemirror: [
              'codemirror',
              '@codemirror/lang-html',
              '@codemirror/lang-javascript',
              '@codemirror/theme-one-dark'
            ],
            table: ['@tanstack/vue-table']
          }
        }
      }
    },
    plugins: [vue()],
    // Include shared-ui tests outside the application root.
    test: {
      dir: path.resolve(__dirname)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, `${appPath}/src`),
        '@main': path.resolve(__dirname, 'apps/main/src'),
        '@shared-ui': path.resolve(__dirname, 'shared-ui')
      }
    }
  }
})
