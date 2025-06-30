/* eslint-disable @typescript-eslint/no-explicit-any */
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { NextIntlClientProvider } from "next-intl";
import { useMemo, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TopBanner from "@/components/ui/top-banner";
import Header from "@/components/ui/header";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import Footer from "@/components/ui/footer";
import GlobalState from "@/utils/GlobalState";
import { AuthProvider } from '@/context/AuthContext';
import FallbackTheme from "@/components/ui/fallback-theme";
import StyledComponentsRegistry from '@/lib/registry';
import { GlobalProvider } from "@/context/GlobalContext";
import { useRouter } from 'next/router';
import PageLoader from '@/components/ui/PageLoader';

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

  const nextRouter = useRouter();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    nextRouter.events.on('routeChangeStart', handleStart);
    nextRouter.events.on('routeChangeComplete', handleStop);
    nextRouter.events.on('routeChangeError', handleStop);

    return () => {
      nextRouter.events.off('routeChangeStart', handleStart);
      nextRouter.events.off('routeChangeComplete', handleStop);
      nextRouter.events.off('routeChangeError', handleStop);
    };
  }, [nextRouter]);

  // Prevent scrolling when loader is active or not hydrated
  useEffect(() => {
    if (loading) {
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
  }, [loading]);

  return (
    <StyledComponentsRegistry>
      <GlobalProvider>
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
                  {loading && <PageLoader />}
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
                    <WhatsAppButton style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 40 }} />
                    {/* Footer */}
                    <Footer />
                  </main>
                </NextIntlClientProvider>
              </QueryClientProvider>
            </GlobalState.Provider>
          </AuthProvider>
        </ThemeProvider>
      </GlobalProvider>
    </StyledComponentsRegistry>
  );
}
