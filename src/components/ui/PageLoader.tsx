import { useEffect, useState } from 'react';
import { LogoIcon } from '../../assets/icons/logo.icon';
import { LogoWhiteIcon } from '../../assets/icons/logo-white.icon';

export default function PageLoader() {
  // `next-themes` doesn't resolve the real theme until mounted; default to
  // the light logo so there's no flash on first paint (matches header.tsx's
  // own light/dark logo swap, which gates the same way).
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-background-dark z-50">
      {/*
        LogoIcon's wordmark is solid `fill="#070707"` on ~20 of its paths —
        hardcoded black with no theme awareness. Only two paths carry the
        `.logo-path-1`/`.logo-path-2` classes below (a separate animated
        "drawing" accent layered over the static wordmark); overriding just
        their stroke color, which is what this used to do, left the solid
        black letters themselves untouched — invisible against the dark
        background this component already switches to. LogoWhiteIcon is the
        pre-built white-fill variant (same viewBox/props), already used this
        way for the real CMS logo in header.tsx; using it here for the
        wordmark loses the draw-in animation in dark mode only, but a static
        visible logo beats an animated invisible one.
      */}
      {isDark ? <LogoWhiteIcon className="w-32 h-10" /> : <LogoIcon className="w-32 h-10" />}
      <style jsx global>{`
        .logo-path-1, .logo-path-2 {
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }
        .logo-path-1 {
          stroke: #070707;
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: path-draw-1 2.2s cubic-bezier(0.77,0,0.18,1) infinite;
        }
        .logo-path-2 {
          stroke: #E73828;
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: path-draw-2 2.2s cubic-bezier(0.77,0,0.18,1) infinite;
          animation-delay: 1.1s;
        }
        @keyframes path-draw-1 {
          0% { stroke-dashoffset: 600; opacity: 0.2; }
          10% { opacity: 1; }
          60% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.2; }
        }
        @keyframes path-draw-2 {
          0% { stroke-dashoffset: 600; opacity: 0.2; }
          10% { opacity: 1; }
          60% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
