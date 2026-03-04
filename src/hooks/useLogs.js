import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useLogs() {
  const [logs, setLogs] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')

    if (error) {
      console.error('Error fetching logs:', error)
    } else {
      // Supabase returns an array of rows. We convert it to an object
      // keyed by date — { "2025-02-26": { mood, pain, ... } }
      // because that's the shape the rest of the app expects.
      const logsObj = {}
      data.forEach(row => {
        logsObj[row.date] = {
          mood: row.mood,
          pain: row.pain,
          flow: row.flow,
          symptoms: row.symptoms || [],
          note: row.note || '',
        }
      })
      setLogs(logsObj)
    }

    setLoading(false)
  }

  const saveLog = async (date, log) => {
    // Update the UI immediately without waiting for Supabase.
    // This is called an "optimistic update" — we assume it'll succeed.
    // If it fails, we log the error but don't roll back (good enough for now).
    setLogs(prev => ({ ...prev, [date]: log }))

    const { error } = await supabase
      .from('daily_logs')
      .upsert(
        { date, mood: log.mood, pain: log.pain, flow: log.flow, symptoms: log.symptoms, note: log.note },
        { onConflict: 'date' } // if a log for this date already exists, update it
      )

    if (error) {
      console.error('Error saving log:', error)
    }
  }

  return { logs, loading, saveLog }
}
