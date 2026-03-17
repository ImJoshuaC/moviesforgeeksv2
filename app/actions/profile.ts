'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  return { user, profile }
}

export async function updateProfile(
  username: string,
  bio: string,
  avatarUrl: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  try {
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        username: username || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      },
      create: {
        id: user.id,
        username: username || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      },
    })
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

  revalidatePath('/profile')
  return { success: true }
}
