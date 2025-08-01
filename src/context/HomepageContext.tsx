import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { fetchHomePageData } from "@/services/api.service";
import { HomepageDataType } from "@/types/HomeData.type";

// Types for /home API response


export type HomepageContextType = {
    homepageData: HomepageDataType | null;
    setHomepageData: React.Dispatch<React.SetStateAction<HomepageDataType | null>>;
};

const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

export const HomepageProvider = ({ children }: { children: ReactNode }) => {
    const [homepageData, setHomepageData] = useState<HomepageDataType | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!router.locale) return;
        fetchHomePageData(router.locale).then(setHomepageData);
    }, [router.locale]);

    return (
        <HomepageContext.Provider value={{ homepageData, setHomepageData }}>
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
