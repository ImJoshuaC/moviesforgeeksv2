'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTopFilms(mediaType: 'movie' | 'show') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  return prisma.topFilm.findMany({
    where: { user_id: user.id, media_type: mediaType },
    orderBy: { position: 'asc' },
  })
}

export async function setTopFilm(
  mediaType: 'movie' | 'show',
  position: number,
  mediaId: number,
  title: string,
  posterPath: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  if (position < 1 || position > 5) return { error: 'Invalid position' }

  try {
    await prisma.topFilm.upsert({
      where: { user_id_media_type_position: { user_id: user.id, media_type: mediaType, position } },
      update: { media_id: mediaId, title, poster_path: posterPath },
      create: { user_id: user.id, media_id: mediaId, media_type: mediaType, title, poster_path: posterPath, position },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function removeTopFilm(mediaType: 'movie' | 'show', position: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  try {
    await prisma.topFilm.deleteMany({
      where: { user_id: user.id, media_type: mediaType, position },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

  revalidatePath('/profile')
  return { success: true }
}
