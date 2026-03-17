'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
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

  try {
    await prisma.watchlist.create({
      data: {
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
        title,
        poster_path: posterPath,
      },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

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

  try {
    await prisma.watchlist.deleteMany({
      where: {
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
      },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}

export async function getWatchlist() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  return prisma.watchlist.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  })
}

export async function isInWatchlist(
  mediaId: number,
  mediaType: 'movie' | 'show'
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const item = await prisma.watchlist.findFirst({
    where: {
      user_id: user.id,
      media_id: mediaId,
      media_type: mediaType,
    },
    select: { id: true },
  })

  return !!item
}
