"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImagesFieldProps = {
  initialImages?: string[];
};

type UploadState = "idle" | "uploading" | "error";

export function ProductImagesField({ initialImages = [] }: ProductImagesFieldProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [status, setStatus] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setStatus("uploading");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "Unable to upload image.");
      }

      setImages((prev) => [...prev, result.url as string]);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected error while uploading. Please try again.",
      );
    } finally {
      // reset input so the same file can be chosen again if needed
      event.target.value = "";
    }
  };

  const handleRemove = (url: string) => {
    setImages((prev) => prev.filter((item) => item !== url));
  };

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="images"
        value={images.join("\n")}
        data-testid="product-images-hidden-input"
      />
      <label className="block text-sm font-semibold text-[#40111f]" htmlFor="product-image-upload">
        Product images
      </label>
      <p className="text-xs text-neutral-500">
        Upload high-resolution JPG or PNG files. Uploaded images will be hosted on Vercel Blob and shared publicly.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#f6b2c5]/70 px-4 py-2 text-sm font-semibold text-[#8a2040] transition hover:border-[#8a2040] hover:text-[#6f1731]">
          <input
            id="product-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          {status === "uploading" ? "Uploading…" : "Upload image"}
        </label>
        {status === "error" ? (
          <span className="text-xs font-semibold text-red-600">{errorMessage}</span>
        ) : null}
      </div>
      {images.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {images.map((url) => (
            <li
              key={url}
              className="flex items-center gap-3 rounded-xl border border-[#f6b2c5]/70 bg-white/70 p-3"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#f6b2c5]/60">
                <Image
                  src={url}
                  alt="Product image"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-xs text-neutral-600">
                <p className="line-clamp-2 break-all">{url}</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="rounded-full border border-[#f6b2c5]/70 px-3 py-1 text-xs font-semibold text-[#8a2040] transition hover:border-[#8a2040]"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-neutral-500">No images uploaded yet.</p>
      )}
    </div>
  );
}

