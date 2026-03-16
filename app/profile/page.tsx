import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/actions/profile";
import ProfileEditForm from "./ProfileEditForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const result = await getProfile();
  const profile = result?.profile ?? null;

  const displayName = profile?.username || user.email?.split("@")[0] || "User";
  const initial = displayName[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#1c1c1c] px-8 lg:px-16 py-10">
      <div className="max-w-2xl">
        {/* Avatar */}
        <div className="mb-6">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#4ade80] flex items-center justify-center">
              <span className="text-black text-3xl font-bold font-roboto-slab">
                {initial}
              </span>
            </div>
          )}
        </div>

        {/* Name & email */}
        <h1 className="text-white text-3xl md:text-4xl font-roboto-slab font-bold uppercase mb-1">
          {displayName}
        </h1>
        <p className="text-white/40 font-roboto-serif text-sm mb-4">
          {user.email}
        </p>

        {/* Bio */}
        <p className="text-white/70 font-roboto-serif text-base mb-8 leading-relaxed">
          {profile?.bio || (
            <span className="text-white/30 italic">No bio yet.</span>
          )}
        </p>

        {/* Edit form */}
        <ProfileEditForm
          initialUsername={profile?.username ?? null}
          initialBio={profile?.bio ?? null}
          initialAvatarUrl={profile?.avatar_url ?? null}
        />
      </div>
    </div>
  );
}
