'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToWatchlist(
  mediaId: number,
  mediaType: 'movie' | 'show',
  title: string,
  posterPath: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { error } = await supabase.from('watchlist').insert({
    user_id: user.id,
    media_id: mediaId,
    media_type: mediaType,
    title,
    poster_path: posterPath,
  })

  if (error) return { error: error.message }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}

export async function removeFromWatchlist(
  mediaId: number,
  mediaType: 'movie' | 'show'
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)

  if (error) return { error: error.message }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}

export async function getWatchlist() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('watchlist')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function isInWatchlist(
  mediaId: number,
  mediaType: 'movie' | 'show'
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .single()

  return !!data
}
