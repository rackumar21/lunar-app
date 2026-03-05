import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useLogs(user) {
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
      console.error('Error fetching logs:', error)
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
      console.error('Error saving log:', error)
    }
  }

  return { logs, loading, saveLog }
}
