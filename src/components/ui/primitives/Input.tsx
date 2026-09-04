import clsx from "clsx";
import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

/**
 * The shared text-input primitive. Before this there were 39 hand-styled
 * `<input>`s (plus 1 `<textarea>`) across 7 react-hook-form files, each
 * re-declaring `border border-[#E73828] rounded-full px-4 py-2 ... focus:ring-2
 * focus:ring-[#E73828]` and none of them wired to `aria-invalid`.
 *
 * Plain forwardRef so `{...register('field', rules)}` from react-hook-form
 * spreads onto it exactly like a native `<input>` — no behavior change for
 * existing form logic, only the markup/classes move here. Pair with
 * `FormField` for the label/hint/error chrome.
 */

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const fieldClasses =
  "w-full border rounded-full px-4 py-2 text-base bg-transparent text-app-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={clsx(
        fieldClasses,
        invalid
          ? "border-red-500 focus:ring-red-500"
          : "border-app-red focus:ring-app-red",
        className
      )}
      {...props}
    />
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={clsx(
        fieldClasses,
        "rounded-2xl",
        invalid
          ? "border-red-500 focus:ring-red-500"
          : "border-app-red focus:ring-app-red",
        className
      )}
      {...props}
    />
  );
});

export default Input;
