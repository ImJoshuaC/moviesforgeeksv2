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

  let review;
  try {
    review = await prisma.review.create({
      data: {
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
        rating,
        body,
      },
      include: { profile: true },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true, review }
}

export async function updateReview(
  reviewId: string,
  mediaId: number,
  mediaType: 'movie' | 'show',
  rating: number,
  body: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  try {
    await prisma.review.updateMany({
      where: { id: reviewId, user_id: user.id },
      data: { rating, body },
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
    include: { profile: true, votes: true },
  })
}

export async function voteOnReview(reviewId: string, value: 1 | -1) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const existing = await prisma.reviewVote.findUnique({
    where: { review_id_user_id: { review_id: reviewId, user_id: user.id } },
  })

  if (existing?.value === value) {
    await prisma.reviewVote.delete({
      where: { review_id_user_id: { review_id: reviewId, user_id: user.id } },
    })
    return { success: true }
  }

  await prisma.reviewVote.upsert({
    where: { review_id_user_id: { review_id: reviewId, user_id: user.id } },
    create: { review_id: reviewId, user_id: user.id, value },
    update: { value },
  })

  return { success: true }
}

export async function deleteReview(reviewId: string, mediaId: number, mediaType: 'movie' | 'show') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  try {
    await prisma.review.deleteMany({
      where: { id: reviewId, user_id: user.id },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}
