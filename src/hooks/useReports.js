import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export function useReports(user, onError) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchReports()
    else { setReports([]); setLoading(false) }
  }, [user])

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      logger.error('Failed to fetch reports', { userId: user.id, error: error.message })
      onError?.("Couldn't load your reports. Check your connection.")
    } else {
      setReports(data || [])
    }

    setLoading(false)
  }

  const saveReport = async ({ title, date, category, markers, flagCount }) => {
    const row = {
      user_id: user.id,
      title,
      date,
      category: category || null,
      markers: markers || [],
      flag_count: flagCount ?? 0,
    }

    const { data, error } = await supabase
      .from('reports')
      .insert(row)
      .select()
      .single()

    if (error) {
      logger.error('Failed to save report', { userId: user.id, error: error.message })
      onError?.("Couldn't save the report. Check your connection.")
      return null
    }

    setReports(prev => [data, ...prev])
    return data
  }

  const deleteReport = async (id) => {
    setReports(prev => prev.filter(r => r.id !== id))
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) {
      logger.error('Failed to delete report', { userId: user.id, id, error: error.message })
      onError?.("Couldn't delete the report. Check your connection.")
      fetchReports() // re-fetch to restore if delete failed
    }
  }

  return { reports, saveReport, deleteReport, loading }
}
