import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export function useReports(user, onError) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  // Custom drag order — array of report IDs. null = use default date sort.
  const [reportOrder, setReportOrder] = useState(null)

  useEffect(() => {
    if (user) {
      fetchReports()
      const saved = localStorage.getItem(`lunar_report_order_${user.id}`)
      if (saved) setReportOrder(JSON.parse(saved))
    } else {
      setReports([])
      setReportOrder(null)
      setLoading(false)
    }
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

    // Put new report at the front of the custom order too
    setReports(prev => [data, ...prev])
    setReportOrder(prev => prev ? [data.id, ...prev] : null)
    return data
  }

  const deleteReport = async (id) => {
    setReports(prev => prev.filter(r => r.id !== id))
    setReportOrder(prev => prev ? prev.filter(oid => oid !== id) : null)
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) {
      logger.error('Failed to delete report', { userId: user.id, id, error: error.message })
      onError?.("Couldn't delete the report. Check your connection.")
      fetchReports()
    }
  }

  const reorderReports = (newIds) => {
    setReportOrder(newIds)
    localStorage.setItem(`lunar_report_order_${user.id}`, JSON.stringify(newIds))
  }

  // Apply order: custom drag order if set, otherwise newest date first
  const orderedReports = useMemo(() => {
    if (!reportOrder) {
      return [...reports].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    }
    return [...reports].sort((a, b) => {
      const ai = reportOrder.indexOf(a.id)
      const bi = reportOrder.indexOf(b.id)
      if (ai === -1 && bi === -1) return (b.date || '').localeCompare(a.date || '')
      if (ai === -1) return -1  // new reports float to top
      if (bi === -1) return 1
      return ai - bi
    })
  }, [reports, reportOrder])

  return { reports: orderedReports, saveReport, deleteReport, loading, reorderReports }
}
