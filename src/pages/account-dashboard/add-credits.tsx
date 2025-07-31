import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BackButton from "@/components/ui/back-button";
import { fetchCreditTypes } from "@/services/api.service";
import { CreditsType } from "@/types/CreeditsDataTyype";



export default function AddCredits() {
  const router = useRouter();

  const getCreditTypes = async () => {
    const response = await fetchCreditTypes(router.locale as string);
    return response.credits_types;
  };

  const [creditTypes, setCreditTypes] = useState<CreditsType[]>([]);

  useEffect(() => {
    getCreditTypes().then(setCreditTypes);
  }, [router.locale]);



  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3">
        <div className="w-fit">
          <BackButton href="/account-dashboard" />
        </div>
        <div className="text-[#E73828] text-[clamp(24px,5vw,36px)] font-semibold font-['Roboto'] leading-[clamp(28px,6vw,42px)] uppercase tracking-tight">ADD CREDITS</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full max-w-2xl mx-1 justify-center">
          {creditTypes.map(option => (
            <button
              key={option.title}
              type="button"
              onClick={() => router.push(`/account-dashboard/add-credits/${option.slug}`)}
              className={`flex items-center justify-center rounded-[32px] h-[clamp(120px,15vw,220px)] w-[clamp(200px,25vw,300px)] mx-auto transition-all duration-200 focus:outline-none hover:scale-105`}
            >
              <img
                src={option.full_path.image}
                alt={option.title}
                className="h-full w-full object-contain p-2 sm:p-3 md:p-4"
              />
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 