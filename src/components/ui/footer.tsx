import React from "react";
import { useState } from "react";

export default function Footer() {
  const [year] = useState(new Date().getFullYear());
  return (
    <footer className="bg-app-red flex items-center justify-center text-app-white font-bold text-[11px] sm:text-[13px] md:text-base py-2 px-2 sm:px-4 whitespace-nowrap w-full max-w-full overflow-x-auto">
      © {year} Bechaalany Connect. All rights reserved.
    </footer>
  );
}
