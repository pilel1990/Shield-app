import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, DEMO_MODE } from '../constants/config'

let supabaseClient = null

if (!DEMO_MODE && SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  })
}

export const supabase = supabaseClient

// Subscribe to realtime changes
export const subscribeToTable = (table, filter, callback) => {
  if (!supabase) return () => {}

  const channel = supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table, filter }, callback)
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export const subscribeToMission = (missionId, callback) => {
  if (!supabase) return () => {}

  const channel = supabase
    .channel(`mission-${missionId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'missions',
      filter: `id=eq.${missionId}`,
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `mission_id=eq.${missionId}`,
    }, callback)
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export const subscribeToAgentStatus = (callback) => {
  if (!supabase) return () => {}

  const channel = supabase
    .channel('agents-availability')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'agents',
      filter: 'available=eq.true',
    }, callback)
    .subscribe()

  return () => supabase.removeChannel(channel)
}
