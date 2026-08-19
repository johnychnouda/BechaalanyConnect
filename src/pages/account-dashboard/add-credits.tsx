import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BackButton from "@/components/ui/back-button";
import { fetchCreditTypes } from "@/services/api.service";
import { CreditsType } from "@/types/CreeditsDataTyype";
import Image from "next/image";
import Link from "next/link";
import { useGlobalContext } from "@/context/GlobalContext";
import { toMessage } from "@/utils/error-message";



export default function AddCredits() {
  const router = useRouter();
  const { generalData, dashboardSettings } = useGlobalContext();
  const getCreditTypes = async () => {
    const response = await fetchCreditTypes(router.locale as string);
    return response.credits_types;
  };

  const [creditTypes, setCreditTypes] = useState<CreditsType[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!router.locale) return;
    setIsLoading(true);
    setLoadError(null);
    getCreditTypes()
      .then(setCreditTypes)
      .catch((err) => {
        console.error('Error fetching credit types:', err);
        setLoadError(toMessage(err, router.locale));
      })
      .finally(() => setIsLoading(false));
  }, [router.locale]);



  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3">
        <div className="w-fit">
          <BackButton label={generalData?.settings?.back_button_label} />
        </div>
        <div className="text-[#E73828] text-[clamp(24px,5vw,36px)] font-semibold font-['Roboto'] leading-[clamp(28px,6vw,42px)] uppercase tracking-tight">{dashboardSettings?.dashboard_page_settings?.add_credits_page_title}</div>
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]"></div>
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
            <p className="text-app-red font-medium">{loadError}</p>
            <button
              onClick={() => router.reload()}
              className="px-6 py-3 rounded-lg bg-app-red text-white font-medium hover:opacity-90 transition-opacity"
            >
              {router.locale === 'en' ? 'Try again' : 'إعادة المحاولة'}
            </button>
          </div>
        )}
        {!isLoading && !loadError && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mx-1 justify-center">
            {creditTypes.map(option => (
              <div
                key={option.title}
              >
                <Link
                 href={`/account-dashboard/add-credits/${option.slug}`}
                 className="relative flex items-center justify-center rounded-[32px] h-[clamp(120px,15vw,220px)] w-full mx-auto transition-all duration-200 focus:outline-none hover:scale-105 cursor-pointer"
                >
                  <Image
                    src={option.full_path.image}
                    alt={option.title}
                    className="object-contain"
                    fill
                  />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}