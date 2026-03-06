import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export function useLogs(user, onError) {
  const [logs, setLogs] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchLogs()
  }, [user])

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to fetch logs', { userId: user.id, error: error.message })
      onError?.("Couldn't load your logs. Check your connection.")
    } else {
      const logsObj = {}
      data.forEach(row => {
        logsObj[row.date] = {
          mood: row.mood,
          pain: row.pain,
          flow: row.flow,
          symptoms: row.symptoms || [],
          note: row.note || '',
          weight: row.weight || null,
        }
      })
      setLogs(logsObj)
    }

    setLoading(false)
  }

  const saveLog = async (date, log) => {
    setLogs(prev => ({ ...prev, [date]: log }))

    const { error } = await supabase
      .from('daily_logs')
      .upsert(
        { user_id: user.id, date, mood: log.mood, pain: log.pain, flow: log.flow, symptoms: log.symptoms, note: log.note, weight: log.weight },
        { onConflict: 'date' }
      )

    if (error) {
      logger.error('Failed to save log', { userId: user.id, date, error: error.message })
      onError?.("Couldn't save your log. Check your connection.")
    }
  }

  return { logs, loading, saveLog }
}
