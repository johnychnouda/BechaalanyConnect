/* eslint-disable @typescript-eslint/no-explicit-any */
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { NextIntlClientProvider } from "next-intl";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TopBanner from "@/components/ui/top-banner";
import Header from "@/components/ui/header";
import WhatsAppButton from "@/components/ui/whatsapp-button";
// import axiosConfig from "@/utils/axiosConfig";
// import axios from 'axios';
import GlobalState from "@/utils/GlobalState";
import { AuthProvider } from '@/context/AuthContext';
import FallbackTheme from "@/components/ui/fallback-theme";
import StyledComponentsRegistry from '@/lib/registry';

export default function App({
  Component,
  pageProps,
  router,
  messages,
  generalData,
  locale,
}: AppProps & { messages: any } & { generalData: any } & { locale: string }) {
  // Memoize QueryClient to prevent unnecessary re-renders
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }), []);

  const isRTL = router.locale === "ar";

  // Memoize global state value
  const globalStateValue = useMemo(() => ({
    generalData,
    locale
  }), [generalData, locale]);

  return (
    <StyledComponentsRegistry>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true} storageKey="theme" disableTransitionOnChange={false}>
        <AuthProvider>
          <GlobalState.Provider value={globalStateValue}>
            <QueryClientProvider client={queryClient}>
              <NextIntlClientProvider
                locale={router.locale}
                timeZone="Asia/Beirut"
                messages={messages || {}}
                onError={(error) => {
                  if (error.code !== 'MISSING_MESSAGE') {
                    console.error(error);
                  }
                }}
              >
                <FallbackTheme />
                <main
                  className={`min-h-screen flex flex-col ${isRTL ? "rtl" : "ltr"}`}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <TopBanner>
                    <Header>
                      <div className="flex-grow">
                        <Component {...pageProps} />
                      </div>
                    </Header>
                  </TopBanner>
                  {/* WhatsApp Floating Button */}
                  <WhatsAppButton style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }} />
                </main>
              </NextIntlClientProvider>
            </QueryClientProvider>
          </GlobalState.Provider>
        </AuthProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}

// import { NextPageContext } from "next";

// App.getInitialProps = async ({ ctx }: { ctx: NextPageContext }) => {
//   const locale = ctx.locale || 'en';
//   axiosConfig(locale);
//   const generalData = await axios.get('/general')

//   return {
//     generalData: generalData.data,
//     locale,
//   }
// }
