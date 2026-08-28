"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

const managedMediaPattern =
  /^\/media\/([A-Za-z0-9_-]{12,80})\/(?:640|1280|1920)\.webp$/;

const mediaLoader: ImageLoader = ({ src, width }) => {
  const match = managedMediaPattern.exec(src);
  if (!match) return src;
  const variant = width <= 640 ? 640 : width <= 1280 ? 1280 : 1920;
  return `/media/${match[1]}/${variant}.webp`;
};

type MediaImageProps = Omit<ImageProps, "loader" | "unoptimized">;

export function MediaImage({ src, alt, ...props }: MediaImageProps) {
  const source = typeof src === "string" ? src : "";
  const isManagedMedia = managedMediaPattern.test(source);
  const isLegacyMedia = source.startsWith("/media/") && !isManagedMedia;

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      loader={isManagedMedia ? mediaLoader : undefined}
      unoptimized={isLegacyMedia}
    />
  );
}
