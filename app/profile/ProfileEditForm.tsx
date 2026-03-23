"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProfile, uploadAvatar } from "@/app/actions/profile";
import AvatarCropModal from "./AvatarCropModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  initialDisplayName: string | null;
  initialUsername: string | null;
  initialBio: string | null;
  initialAvatarUrl: string | null;
};

export default function ProfileEditForm({
  initialDisplayName,
  initialUsername,
  initialBio,
  initialAvatarUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [username, setUsername] = useState(initialUsername ?? "");
  const [bio, setBio] = useState(initialBio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Photo must be under 2 MB.");
      e.target.value = "";
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Only JPEG, PNG, WebP, or GIF images are allowed.");
      e.target.value = "";
      return;
    }

    setError("");
    setPendingFileName(file.name);
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropConfirm = (blob: Blob) => {
    const croppedFile = new File([blob], pendingFileName || "avatar.jpg", { type: "image/jpeg" });
    setAvatarFile(croppedFile);
    setAvatarPreview(URL.createObjectURL(croppedFile));
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    setError("");
    startTransition(async () => {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadResult = await uploadAvatar(formData);
        if (uploadResult.error) {
          setError(uploadResult.error);
          return;
        }
        finalAvatarUrl = uploadResult.url ?? avatarUrl;
        setAvatarUrl(finalAvatarUrl);
      }

      const result = await updateProfile(displayName, username, bio, finalAvatarUrl);
      if (result?.error) {
        setError(result.error);
      } else {
        setAvatarFile(null);
        setAvatarPreview(finalAvatarUrl);
        setOpen(false);
        window.dispatchEvent(new CustomEvent("profile:updated", { detail: { avatarUrl: finalAvatarUrl } }));
        router.refresh();
      }
    });
  };

  const handleCancel = () => {
    setDisplayName(initialDisplayName ?? "");
    setUsername(initialUsername ?? "");
    setBio(initialBio ?? "");
    setAvatarUrl(initialAvatarUrl ?? "");
    setAvatarPreview(initialAvatarUrl ?? "");
    setAvatarFile(null);
    setError("");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2 border border-white/30 text-white font-roboto-slab text-sm rounded-md hover:border-white/60 transition-colors"
      >
        Edit Profile
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
        <DialogContent
          showCloseButton={false}
          className="bg-[#1c1c1c] border border-white/20 text-white max-w-lg p-0 overflow-hidden **:data-[slot=dialog-overlay]:bg-black/70"
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-white/10">
            <DialogTitle className="font-roboto-slab text-lg uppercase tracking-wide">
              Edit Profile
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={72}
                  height={72}
                  className="w-18 h-18 rounded-full object-cover border-2 border-white/20 shrink-0"
                  unoptimized={avatarPreview.startsWith("blob:")}
                />
              ) : (
                <div className="w-18 h-18 rounded-full bg-[#4ade80] flex items-center justify-center shrink-0">
                  <span className="text-black text-2xl font-bold font-roboto-slab">
                    {(displayName || username || "U")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 border border-white/30 text-white font-roboto-slab text-xs rounded-md hover:border-white/60 transition-colors w-fit"
                >
                  Upload photo
                </button>
                {avatarFile && (
                  <span className="text-white/40 text-xs font-roboto-slab truncate max-w-[180px]">
                    {avatarFile.name}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Display name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 font-roboto-slab text-xs uppercase tracking-wide">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/50 font-roboto-slab transition-colors"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 font-roboto-slab text-xs uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-roboto-slab select-none">
                  @
                </span>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="w-full bg-[#2a2a2a] border border-white/20 rounded-md pl-8 pr-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/50 font-roboto-slab transition-colors"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 font-roboto-slab text-xs uppercase tracking-wide">
                Bio
              </label>
              <div className="relative">
                <textarea
                  placeholder="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={4}
                  className="w-full bg-[#2a2a2a] border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/50 font-roboto-slab resize-none transition-colors"
                />
                <span className={`absolute bottom-2.5 right-3 text-xs font-roboto-slab ${bio.length >= 160 ? "text-red-400" : "text-white/30"}`}>
                  {bio.length}/160
                </span>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-roboto-slab">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-5 py-2 border border-white/30 text-white font-roboto-slab text-sm rounded-md hover:border-white/60 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-5 py-2 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold font-roboto-slab text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
