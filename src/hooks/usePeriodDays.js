import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePeriodDays(user) {
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
      console.error('Error fetching period days:', error)
    } else {
      setPeriodDays(data.map(row => row.date))
    }

    setLoading(false)
  }

  const addPeriodDay = async (date) => {
    setPeriodDays(prev => [...prev, date])

    const { error } = await supabase
      .from('period_days')
      .upsert({ user_id: user.id, date }, { onConflict: 'date' })

    if (error) {
      console.error('Error adding period day:', error)
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
      console.error('Error removing period day:', error)
    }
  }

  const batchAddPeriodDays = async (dates) => {
    setPeriodDays(prev => [...new Set([...prev, ...dates])])

    const rows = dates.map(date => ({ user_id: user.id, date }))
    const { error } = await supabase
      .from('period_days')
      .upsert(rows, { onConflict: 'date' })

    if (error) {
      console.error('Error batch adding period days:', error)
    }
  }

  return { periodDays, loading, addPeriodDay, removePeriodDay, batchAddPeriodDays }
}
