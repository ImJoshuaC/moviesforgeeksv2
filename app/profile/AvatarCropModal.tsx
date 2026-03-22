"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

type Props = {
  imageSrc: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
};

async function getCroppedImg(src: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/jpeg", 0.9);
  });
}

export default function AvatarCropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onConfirm(blob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="flex flex-col gap-4 bg-[#1c1c1c] border border-white/20 rounded-xl p-5 w-[340px]">
        <p className="text-white font-roboto-slab text-sm font-semibold">Adjust photo</p>

        {/* Crop area */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-xs font-roboto-slab select-none">−</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#4ade80]"
          />
          <span className="text-white/50 text-xs font-roboto-slab select-none">+</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApply}
            className="flex-1 py-2 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold font-roboto-slab text-sm rounded-md transition-colors"
          >
            Apply
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-white/30 text-white font-roboto-slab text-sm rounded-md hover:border-white/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
