import React, { useState, useRef, useEffect } from "react";

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Was mouse-only (options were <div onClick>, not real controls) with no
  // Escape handling — same gap the product page's amount dropdown had.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex justify-between items-center border border-app-red rounded-full px-4 py-2 bg-transparent text-app-black dark:text-white"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "text-app-red" : "text-app-black dark:text-white"}>
          {value || placeholder}
        </span>
        <svg className="w-5 h-5 text-app-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div role="listbox" className="absolute left-0 right-0 mt-2 bg-white dark:bg-background-dark border border-app-red rounded-[12px] z-10 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              className="w-full text-left rtl:text-right px-4 py-2 text-app-red cursor-pointer hover:bg-app-red/10"
              onClick={() => {
                onChange(opt);
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
