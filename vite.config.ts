import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import dotenv from 'dotenv'
dotenv.config()

function getNiicAuthHeaders() {
  const token = process.env.ACCES_TOKEN || process.env.ACCESS_TOKEN || ''
  const refreshToken = process.env.REFRESH_TOKEN || ''
  const cookieParts = [
    token ? `niic_access_token=${token}` : '',
    refreshToken ? `niic_refresh_token=${refreshToken}` : '',
  ].filter(Boolean)

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
  }

  if (cookieParts.length > 0) {
    headers['Cookie'] = cookieParts.join('; ')
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

function customVotingApiPlugin() {
  return {
    name: 'custom-voting-api-plugin',
    configureServer(server: any) {
      let inMemoryResults: any[] | null = null
      let lastKnownVotes = -1
      let lastKnownRank = -1

      // Background realtime poller: Queries NIIC every 3 seconds with cookies
      const pollNiicLive = async () => {
        try {
          const res = await fetch(
            'https://nttu.startup.niic.vn/api/voting/4bb9fde6-c30c-4211-87e0-41b101fdf578/results',
            { headers: getNiicAuthHeaders() }
          )
          if (res.ok) {
            const list = await res.json()
            if (Array.isArray(list)) {
              inMemoryResults = list
              const eaagriItem = list.find(
                (x: any) =>
                  x.submissionId === '1848f999-465c-4334-b8a5-f85691d2805b' ||
                  x.title?.includes('EaAgri')
              )
              if (eaagriItem) {
                if (eaagriItem.votes !== lastKnownVotes || (eaagriItem.rank ?? 1) !== lastKnownRank) {
                  lastKnownVotes = eaagriItem.votes
                  lastKnownRank = eaagriItem.rank ?? 1
                  console.log(
                    `\x1b[32m[EaAgri Realtime NIIC] ⚡ Đã nhận vote mới nhất từ web NTTU: ${eaagriItem.votes} votes (Hạng ${lastKnownRank})\x1b[0m`
                  )
                  // Broadcast instant WebSocket update to browser (pure data, zero page reload)
                  server.ws.send({
                    type: 'custom',
                    event: 'eaagri:vote-updated',
                    data: {
                      votes: eaagriItem.votes,
                      rank: lastKnownRank,
                    },
                  })
                }
              }
            }
          }
        } catch {}
      }

      // Start polling immediately and every 3 seconds
      pollNiicLive()
      const pollInterval = setInterval(pollNiicLive, 3000)
      server.httpServer?.on('close', () => clearInterval(pollInterval))

      server.middlewares.use('/api/voting-results', async (req: any, res: any, next: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        if (req.method === 'OPTIONS') {
          res.statusCode = 200
          res.end()
          return
        }

        // Accept POST request to save new JSON directly from Postman or web if needed
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              if (!Array.isArray(parsed)) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.end(JSON.stringify({ success: false, error: 'Dữ liệu gửi lên phải là một mảng JSON các bài thi (Array)' }))
                return
              }
              inMemoryResults = parsed
              
              const eaagriItem = parsed.find(
                (x: any) =>
                  x.submissionId === '1848f999-465c-4334-b8a5-f85691d2805b' ||
                  x.title?.includes('EaAgri'),
              )

              if (eaagriItem) {
                lastKnownVotes = eaagriItem.votes
                lastKnownRank = eaagriItem.rank ?? 1
                server.ws.send({
                  type: 'custom',
                  event: 'eaagri:vote-updated',
                  data: {
                    votes: eaagriItem.votes,
                    rank: lastKnownRank,
                  },
                })
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(
                JSON.stringify({
                  success: true,
                  count: parsed.length,
                  message: 'Web EaAgri đã nhận thành công toàn bộ dữ liệu bảng xếp hạng và đã cập nhật realtime!',
                  eaagri: eaagriItem,
                })
              )
            } catch (err: any) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ success: false, error: 'JSON không hợp lệ: ' + err.message }))
            }
          })
          return
        }

        // Handle GET request: Return inMemoryResults if available or fetch from NIIC
        if (req.method === 'GET') {
          if (inMemoryResults) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
            res.setHeader('Pragma', 'no-cache')
            res.end(JSON.stringify(inMemoryResults))
            return
          }

          try {
            const upstreamRes = await fetch(
              'https://nttu.startup.niic.vn/api/voting/4bb9fde6-c30c-4211-87e0-41b101fdf578/results',
              { headers: getNiicAuthHeaders() }
            )
            if (upstreamRes.ok) {
              const liveData = (await upstreamRes.json()) as any[]
              inMemoryResults = liveData
              const eaagriItem = Array.isArray(liveData)
                ? liveData.find(
                    (x: any) =>
                      x.submissionId === '1848f999-465c-4334-b8a5-f85691d2805b' ||
                      x.title?.includes('EaAgri')
                  )
                : null

              if (eaagriItem) {
                lastKnownVotes = eaagriItem.votes
                lastKnownRank = eaagriItem.rank ?? 1
              }

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
              res.setHeader('Pragma', 'no-cache')
              res.end(JSON.stringify(liveData))
              return
            }
          } catch (err: any) {
            if (inMemoryResults) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
              res.end(JSON.stringify(inMemoryResults))
              return
            }
          }
        }

        next()
      })
    },
  }
}

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
    proxy: {
      '/api/voting-results': {
        target: 'https://nttu.startup.niic.vn',
        changeOrigin: true,
        secure: false,
        rewrite: () => '/api/voting/4bb9fde6-c30c-4211-87e0-41b101fdf578/results',
      },
    },
  },
  plugins: [
    customVotingApiPlugin(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})

