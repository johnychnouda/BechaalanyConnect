import React, { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { LogoIcon } from "@/assets/icons/logo.icon";
import { LogoWhiteIcon } from "@/assets/icons/logo-white.icon";
import { useAppTheme } from "@/hooks/use-app-theme";

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
  const { theme } = useAppTheme();

  // Cards are recycled across locale switches and list re-renders, so a new src
  // must clear a previous failure or the placeholder would stick.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    // LogoIcon's wordmark is solid black (`fill="#070707"`, no theme
    // awareness) — on the dark-mode placeholder background added above,
    // that made every missing-image placeholder across the whole catalog
    // (any card, the product page's main image, related products) render as
    // a near-invisible logo. LogoWhiteIcon is the pre-built white variant,
    // same viewBox — already used this way for the real CMS logo in
    // header.tsx.
    const Logo = theme === "dark" ? LogoWhiteIcon : LogoIcon;
    return (
      <div
        className={clsx(
          "flex items-center justify-center w-full h-full bg-slate-200 dark:bg-gray-700",
          className
        )}
      >
        <Logo
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
