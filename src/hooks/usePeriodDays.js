import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePeriodDays() {
  const [periodDays, setPeriodDays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPeriodDays()
  }, [])

  const fetchPeriodDays = async () => {
    const { data, error } = await supabase
      .from('period_days')
      .select('date')

    if (error) {
      console.error('Error fetching period days:', error)
    } else {
      setPeriodDays(data.map(row => row.date))
    }

    setLoading(false)
  }

  const addPeriodDay = async (date) => {
    // Optimistic update
    setPeriodDays(prev => [...prev, date])

    const { error } = await supabase
      .from('period_days')
      .upsert({ date }, { onConflict: 'date' })

    if (error) {
      console.error('Error adding period day:', error)
    }
  }

  const removePeriodDay = async (date) => {
    // Optimistic update
    setPeriodDays(prev => prev.filter(d => d !== date))

    const { error } = await supabase
      .from('period_days')
      .delete()
      .eq('date', date)

    if (error) {
      console.error('Error removing period day:', error)
    }
  }

  return { periodDays, loading, addPeriodDay, removePeriodDay }
}
