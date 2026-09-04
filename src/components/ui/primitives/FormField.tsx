import React, { useId, isValidElement, cloneElement } from "react";
import clsx from "clsx";

/**
 * Label + hint + error chrome around a single form control, with the
 * accessibility wiring that did not exist anywhere in the codebase before:
 * an id shared between the label and control, `aria-invalid` set on the
 * control whenever `error` is present, and `aria-describedby` pointing at the
 * hint/error text (rendered with `role="alert"` so screen readers announce it
 * when it appears, matching the react-hook-form error already being tracked
 * per-field — this only adds the missing plumbing).
 *
 * `children` is expected to be a single form control (Input/Textarea/select);
 * it's cloned to inject `id` / `aria-invalid` / `aria-describedby` rather than
 * asking every call site to pass them manually — but only when that child is
 * actually one of those (a component, not a raw host element). A field with
 * an inline show/hide-password button wraps its Input in a plain `<div>`;
 * cloning onto THAT landed `invalid={false}` — a boolean — directly on a DOM
 * div as a non-standard attribute, which React both renders wrong and warns
 * about. In that shape the wrapper is rendered as-is and the caller wires
 * aria-invalid/aria-describedby on the real control itself instead.
 */

interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, hint, error, required, className, children }: FormFieldProps) {
  const generatedId = useId();
  const describedBy = error ? `${generatedId}-error` : hint ? `${generatedId}-hint` : undefined;

  // Our own components (Input/Textarea) are forwardRef-wrapped, so `type` is
  // an object; a raw JSX host tag like `<div>` has a string `type`.
  const isCloneableControl = isValidElement(children) && typeof children.type !== "string";

  const control = isCloneableControl
    ? cloneElement(children as React.ReactElement<any>, {
        id: (children as React.ReactElement<any>).props.id ?? generatedId,
        invalid: Boolean(error),
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={isCloneableControl ? (children as React.ReactElement<any>).props.id ?? generatedId : generatedId}
          className="text-sm font-semibold text-app-black dark:text-white rtl:text-right"
        >
          {label}
          {required && <span className="text-app-red ml-1 rtl:mr-1 rtl:ml-0">*</span>}
        </label>
      )}
      {control}
      {error ? (
        <p id={`${generatedId}-error`} role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${generatedId}-hint`} className="text-xs text-neutral-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default FormField;
