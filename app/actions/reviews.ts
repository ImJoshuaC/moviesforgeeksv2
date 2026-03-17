'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
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

  try {
    await prisma.review.upsert({
      where: {
        user_id_media_id_media_type: {
          user_id: user.id,
          media_id: mediaId,
          media_type: mediaType,
        },
      },
      update: { rating, body },
      create: {
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
        rating,
        body,
      },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}

export async function getReviews(
  mediaId: number,
  mediaType: 'movie' | 'show'
) {
  return prisma.review.findMany({
    where: { media_id: mediaId, media_type: mediaType },
    orderBy: { created_at: 'desc' },
  })
}

export async function getUserReview(
  mediaId: number,
  mediaType: 'movie' | 'show'
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return prisma.review.findUnique({
    where: {
      user_id_media_id_media_type: {
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
      },
    },
  })
}

export async function deleteReview(reviewId: string, mediaId: number, mediaType: 'movie' | 'show') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  try {
    await prisma.review.deleteMany({
      where: {
        id: reviewId,

        user_id: user.id,
      },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}
