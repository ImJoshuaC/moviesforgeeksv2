'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(
  mediaId: number,
  mediaType: 'movie' | 'show',
  rating: number,
  body: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // upsert = insert if not exists, update if already reviewed
  const { error } = await supabase.from('reviews').upsert({
    user_id: user.id,
    media_id: mediaId,
    media_type: mediaType,
    rating,
    body,
  }, {
    onConflict: 'user_id,media_id,media_type',
  })

  if (error) return { error: error.message }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}

export async function getReviews(
  mediaId: number,
  mediaType: 'movie' | 'show'
) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getUserReview(
  mediaId: number,
  mediaType: 'movie' | 'show'
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .single()

  return data ?? null
}

export async function deleteReview(reviewId: string, mediaId: number, mediaType: 'movie' | 'show') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}
