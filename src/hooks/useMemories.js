import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export function useMemories(user, onError) {
  const [memories, setMemories] = useState([])

  useEffect(() => {
    if (user) fetchMemories()
    else setMemories([])
  }, [user])

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from('user_memories')
      .select('memory')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch memories', { userId: user.id, error: error.message })
    } else {
      setMemories(data.map(r => r.memory))
    }
  }

  const addMemories = async (newFacts) => {
    if (!newFacts?.length) return
    const added = newFacts.filter(f => !memories.some(m => m.toLowerCase() === f.toLowerCase()))
    if (!added.length) return

    setMemories(prev => [...prev, ...added])
    const { error } = await supabase
      .from('user_memories')
      .insert(added.map(memory => ({ user_id: user.id, memory })))

    if (error) {
      logger.error('Failed to save memories', { userId: user.id, error: error.message })
      onError?.("Couldn't save to memory.")
      fetchMemories()
    }
  }

  return { memories, addMemories }
}
