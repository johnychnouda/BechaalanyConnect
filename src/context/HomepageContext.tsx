import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { fetchHomePageData } from "@/services/api.service";
import { HomepageDataType } from "@/types/HomeData.type";

// Types for /home API response


export type HomepageContextType = {
    homepageData: HomepageDataType | null;
    setHomepageData: React.Dispatch<React.SetStateAction<HomepageDataType | null>>;
    /** Non-null when the /home fetch failed. index.tsx renders an error state
     *  instead of spinning on <PageLoader /> forever. */
    homepageError: string | null;
};

const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

export const HomepageProvider = ({ children }: { children: ReactNode }) => {
    const [homepageData, setHomepageData] = useState<HomepageDataType | null>(null);
    const [homepageError, setHomepageError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!router.locale) return;
        setHomepageError(null);
        fetchHomePageData(router.locale)
            .then(setHomepageData)
            .catch((err) => {
                console.error('Error fetching homepage data:', err);
                setHomepageError('homepage_load_failed');
            });
    }, [router.locale]);

    return (
        <HomepageContext.Provider value={{ homepageData, setHomepageData, homepageError }}>
            {children}
        </HomepageContext.Provider>
    );
};

export const useHomepageContext = () => {
    const context = useContext(HomepageContext);
    if (!context) {
        throw new Error("useHomepageContext must be used within a HomepageProvider");
    }
    return context;
};
