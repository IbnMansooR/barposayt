import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// figma:asset/ importlarini src/assets ga yo'naltiradi
function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Lokal dev uchun ham xuddi Vercel'dagi API yadrosini ishlatadi (Supabase)
function barpoApi() {
  return {
    name: 'barpo-api',
    async configureServer(server: any) {
      const { handleApi } = await import('./server/api-core.mjs')
      const { parseMultipart } = await import('./server/multipart.mjs')
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()
        try {
          const ct = req.headers['content-type'] || ''
          const method = (req.method || 'GET').toUpperCase()
          if ((method === 'POST' || method === 'PUT') && ct.includes('multipart/form-data')) {
            const { fields, file } = await parseMultipart(req)
            req._fields = fields
            req._file = file
          }
          await handleApi(req, res)
        } catch (e: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ ok: false, error: e?.message || 'Server xatosi' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // .env / .env.local dan Supabase kalitlarini Node process.env ga yuklaymiz.
  // __dirname (config papkasi) dan o'qiymiz — preview/launch cwd boshqa bo'lsa ham topiladi.
  const env = loadEnv(mode, __dirname, '')
  if (env.SUPABASE_URL) process.env.SUPABASE_URL = env.SUPABASE_URL
  if (env.SUPABASE_SERVICE_KEY) process.env.SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY

  return {
    plugins: [
      figmaAssetResolver(),
      barpoApi(),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
