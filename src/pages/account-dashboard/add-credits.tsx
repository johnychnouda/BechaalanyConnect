import DashboardLayout from "@/components/ui/dashboard-layout";
import React from "react";
import { useRouter } from "next/router";
import BackButton from "@/components/ui/back-button";

const creditOptions = [
  {
    name: "Whish",
    image: "/wish-logo.png", // Replace with actual image path
    bg: "bg-[#F82B5A]",
    method: "whish",
  },
  {
    name: "OMT",
    image: "/omt-logo.png", // Replace with actual image path
    bg: "bg-[#FFD600]",
    method: "omt",
  },
  {
    name: "Tether",
    image: "/tether-logo.png", // Replace with actual image path
    bg: "bg-[#2CA07A]",
    method: "usdt",
  },
];

export default function AddCredits() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="w-fit">
          <BackButton href="/account-dashboard" />
        </div>
        <div className="text-[#E73828] text-[36px] font-semibold font-['Roboto'] leading-[42px] uppercase mb-8 mt-0 tracking-tight">ADD CREDITS</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {creditOptions.map(option => (
            <button
              key={option.name}
              type="button"
              onClick={() => router.push(`/account-dashboard/add-credits/${option.method}`)}
              className={`flex items-center justify-center rounded-[32px] h-[220px] w-full transition-all duration-200 focus:outline-none ${option.bg} hover:ring-4 hover:ring-[#E73828] hover:ring-opacity-60 hover:scale-105`}
            >
              <img
                src={option.image}
                alt={option.name}
                className="h-full w-full object-contain p-8"
              />
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 