"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";

type Props = {
  initialUsername: string | null;
  initialBio: string | null;
  initialAvatarUrl: string | null;
};

export default function ProfileEditForm({
  initialUsername,
  initialBio,
  initialAvatarUrl,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [bio, setBio] = useState(initialBio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setError("");
    startTransition(async () => {
      const result = await updateProfile(username, bio, avatarUrl);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
      }
    });
  };

  const handleCancel = () => {
    setUsername(initialUsername ?? "");
    setBio(initialBio ?? "");
    setAvatarUrl(initialAvatarUrl ?? "");
    setError("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="px-5 py-2 border border-white/30 text-white font-roboto-slab text-sm rounded-md hover:border-white/60 transition-colors"
      >
        Edit Profile
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Avatar preview */}
      {avatarUrl && (
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt="Avatar preview"
            className="w-12 h-12 rounded-full object-cover border border-white/20"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-white/40 text-xs font-roboto-slab">Preview</span>
        </div>
      )}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full bg-[#2a2a2a] border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/50 font-roboto-slab"
      />

      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        className="w-full bg-[#2a2a2a] border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/50 font-roboto-slab resize-none"
      />

      <input
        type="text"
        placeholder="Avatar URL (https://...)"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        className="w-full bg-[#2a2a2a] border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/50 font-roboto-slab"
      />

      {error && (
        <p className="text-red-400 text-sm font-roboto-slab">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-5 py-2 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold font-roboto-slab text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="px-5 py-2 border border-white/30 text-white font-roboto-slab text-sm rounded-md hover:border-white/60 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
