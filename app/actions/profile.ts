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
  displayName: string,
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
        display_name: displayName || null,
        username: username || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      },
      create: {
        id: user.id,
        display_name: displayName || null,
        username: username || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      },
    })
  } catch (e: unknown) {
    const isPrismaUniqueViolation =
      e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2002'
    if (isPrismaUniqueViolation) {
      return { error: 'That username is already taken.' }
    }
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'No file provided' }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Only JPEG, PNG, WebP, or GIF images are allowed.' }
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Photo must be under 2 MB.' }
  }

  const path = `${user.id}/avatar.jpg`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: 'image/jpeg' })

  if (uploadError) return { error: uploadError.message }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)

  return { url: `${data.publicUrl}?v=${Date.now()}` }
}
