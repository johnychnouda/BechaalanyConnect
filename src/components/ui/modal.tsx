import clsx from "clsx";
import React, { ReactNode, useEffect, useId, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Applied to the panel only — previously this landed on both the backdrop
   *  and the panel because they shared one `className` prop. */
  className?: string;
  disableBackdropClose?: boolean;
  /** Renders an <h2> inside the panel and wires aria-labelledby to it. */
  title?: string;
  closeLabel?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Rewritten in place rather than adding a second modal component — three
 * consumers already exist (pending-approval, join-whatsapp, verify-email) and
 * Phase 3's purchase-confirmation modal is a fourth.
 *
 * What changed and why:
 * - Real focus trap. The old "Focus trap" comment only called
 *   `modalRef.current.focus()` once on open — Tab could still walk out to the
 *   page behind the backdrop. Tab/Shift+Tab now cycle within the panel.
 * - Focus restore. The element that opened the modal now gets focus back on
 *   close, instead of focus silently landing on <body>.
 * - Body scroll lock while open.
 * - `aria-labelledby` via the new optional `title` prop.
 * - `className` now only affects the panel — it used to also land on the
 *   fixed-position backdrop, which happened to be harmless only because no
 *   existing caller passed one.
 * - Panel now uses the light/dark background tokens instead of a hardcoded
 *   `bg-white`, so it no longer turns into a white card floating in a dark
 *   page.
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  disableBackdropClose = false,
  title,
  closeLabel = "Close",
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Open: remember the trigger, move focus into the panel, lock scroll.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusable ?? panel)?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  // Escape to close + real Tab-cycling focus trap.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableBackdropClose) {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, disableBackdropClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/40 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? titleId : undefined}
      tabIndex={-1}
      onClick={disableBackdropClose ? undefined : onClose}
    >
      <div
        className={clsx(
          "relative w-full max-w-[400px] bg-background-light dark:bg-background-dark rounded-modal border border-app-red p-4 sm:p-6 md:p-8 flex flex-col items-center shadow-lg overflow-y-auto max-h-[90vh]",
          className
        )}
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 rtl:right-auto rtl:left-2 sm:top-4 sm:right-4 rtl:sm:right-auto rtl:sm:left-4 text-app-red text-xl hover:scale-110 transition-transform rounded-full"
          aria-label={closeLabel}
          onClick={onClose}
          type="button"
        >
          &times;
        </button>
        {title && (
          <h2 id={titleId} className="text-3xl font-extrabold text-app-red text-center mb-1 tracking-tight">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
