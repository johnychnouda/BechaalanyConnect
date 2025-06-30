import { LogoIcon } from '../../assets/icons/logo.icon';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <LogoIcon className="w-32 h-10" />
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