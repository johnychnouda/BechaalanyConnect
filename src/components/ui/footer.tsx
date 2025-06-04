import React from "react";
import { useState } from "react";

export default function Footer() {
  const [year] = useState(new Date().getFullYear());
  return (
    <footer className="bg-app-red flex items-center justify-center text-app-white font-bold text-[14px] py-2">
      © {year} Bechaalany Connect. All rights reserved.
    </footer>
  );
}
