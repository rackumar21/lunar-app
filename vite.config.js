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
        server.middlewares.use('/api/extract', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405; res.end('Method not allowed'); return
          }
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const { fileBase64, mediaType, cyclePhase } = JSON.parse(body)
              if (!fileBase64 || !mediaType) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'fileBase64 and mediaType are required' }))
                return
              }
              const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
              const contentBlock = mediaType === 'application/pdf'
                ? { type: 'document', source: { type: 'base64', media_type: mediaType, data: fileBase64 } }
                : { type: 'image', source: { type: 'base64', media_type: mediaType, data: fileBase64 } }
              const phaseContext = cyclePhase && cyclePhase !== 'Not sure'
                ? `The patient was in the ${cyclePhase} phase of their menstrual cycle when this test was taken. Use phase-specific reference ranges for hormone tests — these vary significantly by cycle phase. If the PDF does not provide a reference range, apply standard clinical reference ranges for the ${cyclePhase} phase.`
                : `Use standard clinical reference ranges. If no range is provided in the PDF, apply typical reference ranges as a reasonable default.`
              const message = await client.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 16384,
                messages: [{
                  role: 'user',
                  content: [
                    contentBlock,
                    { type: 'text', text: `You are a medical lab report parser. Extract all test results from this document.\n\n${phaseContext}\n\nIMPORTANT: Dates in Indian lab reports are in DD/MM/YYYY or DD/MM/YY format. Convert to YYYY-MM-DD when returning.\n\nExtract every individual test result — ignore section heading rows that have no numeric result.\n\nSKIP these — do not include them in output:\n- Urine microscopy fields (pus cells, epithelial cells, casts, crystals, bacteria)\n- Calculated ratios (e.g. albumin/globulin ratio, LDL/HDL ratio)\n- Duplicate rows that are sub-components already captured by a parent test\n\nReturn ONLY a JSON object, nothing else:\n{"date":"YYYY-MM-DD or null","markers":[{"name":"...","value":"...","unit":"...","low":number|null,"high":number|null,"status":"normal"|"low"|"high"|null}]}\n\nRules:\n- value: numeric result as a string\n- low/high: from the reference range column as numbers, null if not printed\n- status: compare value to printed range only — "normal", "low", or "high". null if no range printed.\n\nIf no lab results found, return: {"date":null,"markers":[]}` }
                  ]
                }]
              })
              const raw = message.content[0]?.text || '{}'
              console.log('[extract] Claude raw response:', raw.slice(0, 500))
              let markers = [], reportDate = null
              try {
                // Strip markdown fences, then find the outermost {...} block
                const stripped = raw.replace(/```json\n?|```/g, '').trim()
                const jsonStart = stripped.indexOf('{')
                const jsonEnd = stripped.lastIndexOf('}')
                const jsonStr = jsonStart >= 0 && jsonEnd > jsonStart
                  ? stripped.slice(jsonStart, jsonEnd + 1)
                  : stripped
                const parsed = JSON.parse(jsonStr)
                if (Array.isArray(parsed)) { markers = parsed }
                else { markers = Array.isArray(parsed.markers) ? parsed.markers : []; reportDate = parsed.date || null }
              } catch (e) {
                console.error('[extract] JSON parse failed:', e.message)
                markers = []
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ markers, reportDate }))
            } catch (err) {
              console.error('Extract API error:', err.message)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to read the report. Please try again.' }))
            }
          })
        })

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
