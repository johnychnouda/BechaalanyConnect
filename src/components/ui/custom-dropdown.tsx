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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        className="w-full flex justify-between items-center border border-[#E73828] rounded-full px-4 py-2 bg-transparent text-black focus:outline-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "text-[#E73828]" : "text-black"}>
          {value || placeholder}
        </span>
        <svg className="w-5 h-5 text-[#E73828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E73828] rounded-[12px] z-10">
          {options.map((opt) => (
            <div
              key={opt}
              className="px-4 py-2 text-[#E73828] cursor-pointer hover:bg-[#ffeaea] rounded-[12px]"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown; 