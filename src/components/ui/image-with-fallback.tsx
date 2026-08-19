import React, { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { LogoIcon } from "@/assets/icons/logo.icon";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  /** Wrapper/placeholder sizing. The parent must be `relative` when `fill` is set. */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
  loading?: "lazy" | "eager";
  priority?: boolean;
  /** Tailwind padding for the placeholder logo. */
  placeholderClassName?: string;
};

/**
 * Product/category image with the site's logo placeholder.
 *
 * Two distinct cases both land on the placeholder:
 *   - no image at all (supplier-imported rows have none until an admin uploads one
 *     on the CMS page — the API now returns `full_path.image === null` for those)
 *   - an image that fails to load (a supplier URL behind hotlink protection, or a
 *     stale path), which the falsy check alone cannot catch — hence `onError`.
 */
export default function ImageWithFallback({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  quality,
  loading = "lazy",
  priority,
  placeholderClassName = "p-6",
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  // Cards are recycled across locale switches and list re-renders, so a new src
  // must clear a previous failure or the placeholder would stick.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center w-full h-full bg-slate-200",
          className
        )}
      >
        <LogoIcon
          className={clsx("w-full h-full object-contain", placeholderClassName)}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      quality={quality}
      loading={priority ? undefined : loading}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
