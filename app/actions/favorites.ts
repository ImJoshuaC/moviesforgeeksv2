'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addToFavorites(
  mediaId: number,
  mediaType: 'movie' | 'show',
  title: string,
  posterPath: string,
  releaseYear?: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  try {
    await prisma.favorite.create({
      data: {
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
        title,
        poster_path: posterPath,
        release_year: releaseYear ?? null,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[addToFavorites]', msg)
    return { error: msg }
  }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}

export async function removeFromFavorites(
  mediaId: number,
  mediaType: 'movie' | 'show'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  try {
    await prisma.favorite.deleteMany({
      where: { user_id: user.id, media_id: mediaId, media_type: mediaType },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[removeFromFavorites]', msg)
    return { error: msg }
  }

  revalidatePath(`/${mediaType === 'movie' ? 'films' : 'shows'}/${mediaId}`)
  return { success: true }
}

export async function getFavorites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  return prisma.favorite.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  })
}

export async function isFavorite(
  mediaId: number,
  mediaType: 'movie' | 'show'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const item = await prisma.favorite.findFirst({
    where: { user_id: user.id, media_id: mediaId, media_type: mediaType },
    select: { id: true },
  })

  return !!item
}
