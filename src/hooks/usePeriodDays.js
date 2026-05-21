import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export function usePeriodDays(user, onError) {
  const [periodDays, setPeriodDays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchPeriodDays()
  }, [user])

  const fetchPeriodDays = async () => {
    const { data, error } = await supabase
      .from('period_days')
      .select('date')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to fetch period days', { userId: user.id, error: error.message })
      onError?.("Couldn't load your cycle data. Check your connection.")
    } else {
      setPeriodDays([...new Set(data.map(row => row.date))])
    }

    setLoading(false)
  }

  const addPeriodDay = async (date) => {
    setPeriodDays(prev => [...prev, date])

    const { error } = await supabase
      .from('period_days')
      .upsert({ user_id: user.id, date }, { onConflict: 'user_id,date', ignoreDuplicates: true })

    if (error) {
      logger.error('Failed to add period day', { userId: user.id, date, error: error.message })
      onError?.("Couldn't save. Check your connection.")
    }
  }

  const removePeriodDay = async (date) => {
    setPeriodDays(prev => prev.filter(d => d !== date))

    const { error } = await supabase
      .from('period_days')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date)

    if (error) {
      logger.error('Failed to remove period day', { userId: user.id, date, error: error.message })
      onError?.("Couldn't save. Check your connection.")
    }
  }

  const batchAddPeriodDays = async (dates) => {
    if (dates.length === 0) return true
    setPeriodDays(prev => [...new Set([...prev, ...dates])])

    // Delete first to avoid unique constraint conflicts, then insert clean
    await supabase.from('period_days').delete().eq('user_id', user.id).in('date', dates)

    const rows = dates.map(date => ({ user_id: user.id, date }))
    const { error } = await supabase.from('period_days').insert(rows)

    if (error) {
      logger.error('Failed to batch add period days', { userId: user.id, dates, error: error.message, code: error.code })
      console.error('[usePeriodDays] batchAdd error:', error)
      onError?.(`Couldn't save period history (${error.code || error.message}). Try again.`)
      fetchPeriodDays()
      return false
    }
    return true
  }

  const batchRemovePeriodDays = async (dates) => {
    if (dates.length === 0) return true
    setPeriodDays(prev => prev.filter(d => !dates.includes(d)))
    const { error } = await supabase
      .from('period_days')
      .delete()
      .eq('user_id', user.id)
      .in('date', dates)
    if (error) {
      logger.error('Failed to batch remove period days', { userId: user.id, error: error.message })
      onError?.("Couldn't save. Check your connection.")
      fetchPeriodDays()
      return false
    }
    return true
  }

  return { periodDays, loading, addPeriodDay, removePeriodDay, batchAddPeriodDays, batchRemovePeriodDays }
}
