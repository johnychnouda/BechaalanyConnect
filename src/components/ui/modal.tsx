import clsx from "clsx";
import React, { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/40 p-4",
        className,
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className={clsx(
          "relative w-full max-w-[400px] bg-white rounded-[20px] border border-[#E73828] p-4 sm:p-6 md:p-8 flex flex-col items-center shadow-lg overflow-y-auto max-h-[90vh]",
          className
        )}
        ref={modalRef}
        tabIndex={0}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[#E73828] text-xl hover:scale-110 transition-transform"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;