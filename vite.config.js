import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import Anthropic from '@anthropic-ai/sdk'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [
    react(),
    {
      name: 'api-routes',
      configureServer(server) {
        server.middlewares.use('/api/ask', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method not allowed')
            return
          }

          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const { question, context } = JSON.parse(body)
              const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
              const systemPrompt = buildSystemPrompt(context)
              const message = await client.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 1024,
                system: systemPrompt,
                messages: [{ role: 'user', content: question }],
              })
              const answer = message.content[0]?.text || 'No response.'
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ answer }))
            } catch (err) {
              console.error('API error:', err.message)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
        })
      }
    }
  ],
  }
})

function buildSystemPrompt(context) {
  const {
    userName, today, cycleDay, predictedCycleLength,
    daysUntilNextPeriod, nextPeriodDate, isOnPeriod,
    recentPeriods, recentLogs, hormoneReports,
  } = context || {}

  return `You are Lunar, a personal health companion for ${userName || 'this user'}. You have access to their real cycle and health data. Answer questions clearly, warmly, and concisely. Use plain English. Never be alarmist — you are supportive, not diagnostic. Always suggest consulting a doctor for medical decisions.

TODAY'S DATE: ${today}

CURRENT CYCLE:
- Cycle day: ${cycleDay ?? 'Unknown — no period logged yet'}
- Predicted cycle length: ${predictedCycleLength} days
- Currently on period: ${isOnPeriod ? 'Yes' : 'No'}
- Days until next period: ${daysUntilNextPeriod ?? 'Unknown'}
- Next period predicted: ${nextPeriodDate ?? 'Unknown'}

PERIOD HISTORY (most recent first):
${recentPeriods?.length > 0
  ? recentPeriods.map(p => `- ${p.label}${p.cycleLength ? ` — cycle ${p.cycleLength}d` : ''}${p.periodLength ? `, period ${p.periodLength}d` : ''}`).join('\n')
  : '- No period history logged yet'}

RECENT DAILY LOGS (last 30 days):
${recentLogs?.length > 0
  ? recentLogs.map(l => {
      const parts = []
      if (l.mood) parts.push(`mood: ${l.mood}`)
      if (l.pain > 0) parts.push(`pain: ${l.pain}/4`)
      if (l.flow) parts.push(`flow: ${l.flow}`)
      if (l.symptoms?.length > 0) parts.push(`symptoms: ${l.symptoms.join(', ')}`)
      if (l.note) parts.push(`note: "${l.note}"`)
      return `- ${l.date}: ${parts.join(', ')}`
    }).join('\n')
  : '- No logs recorded yet'}

HORMONE REPORTS:
${hormoneReports?.length > 0
  ? hormoneReports.map(r =>
      `${r.title}:\n` + r.markers.map(m => `  - ${m.name}: ${m.value} ${m.unit} (${m.status})`).join('\n')
    ).join('\n')
  : '- No hormone reports uploaded yet'}

Answer based only on the data above. If data is missing, say so honestly. Keep responses under 200 words unless the question genuinely needs more detail.`
}
