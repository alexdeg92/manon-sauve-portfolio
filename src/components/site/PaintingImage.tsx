"use client";

import Image from "next/image";
import { isRemoteImage } from "@/lib/mobile";

interface PaintingImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}

/** Fills its positioned parent. Blob-hosted uploads bypass the optimiser. */
export default function PaintingImage({ src, alt, sizes, priority }: PaintingImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isRemoteImage(src)}
      className="object-cover"
    />
  );
}
