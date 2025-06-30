import { useGlobalContext } from "@/context/GlobalContext";
import React from "react";
import { useState } from "react";

export default function Footer() {
  const [year] = useState(new Date().getFullYear());
  const { generalData } = useGlobalContext();
  return (
    <footer className="bg-app-red flex items-center justify-center text-app-white font-bold text-[clamp(10px,2vw,16px)] py-[clamp(0.5rem,1vw,0.75rem)] px-[clamp(0.5rem,2vw,1rem)] whitespace-nowrap w-full max-w-[1400px] mx-auto">
      {generalData?.settings.footer_copyright}
    </footer>
  );
}
