/* eslint-disable @typescript-eslint/no-explicit-any */
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { NextIntlClientProvider } from "next-intl";
import { useMemo, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clearSessionTokens, hasMultipleSessionTokens, logSessionTokens } from '@/utils/clear-session-tokens';



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

  // Development-only session token cleanup
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Check for multiple session tokens on mount
      if (hasMultipleSessionTokens()) {
        console.warn('Multiple session tokens detected. Clearing them...');
        logSessionTokens();
        clearSessionTokens();
      }
    }
  }, []);

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
      <SessionProvider 
        session={pageProps.session}
        refetchInterval={0}
        refetchOnWindowFocus={false}
      >
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
                                    {/* if language is arabic, the button should be on the left 3rem and on small screens 2rem */}
                                    <WhatsAppButton className="fixed bottom-3 right-6 left-auto rtl:left-6 rtl:right-auto md:right-12 md:left-auto rtl:md:left-12 rtl:md:right-auto" />
                                    {/* Footer */}
                                    <Footer />
                                  </main>
                                  {/* Global Toast Container */}
                                  <ToastContainer
                                    position={isRTL ? 'top-left' : 'top-right'}
                                    autoClose={3000}
                                    hideProgressBar={false}
                                    newestOnTop={false}
                                    closeOnClick
                                    rtl={false}
                                    pauseOnFocusLoss
                                    pauseOnHover
                                    theme={"colored"}
                                  />

                                </NextIntlClientProvider>
                </QueryClientProvider>
              </GlobalState.Provider>
            </AuthProvider>
          </ThemeProvider>
        </GlobalProvider>
      </SessionProvider>
    </StyledComponentsRegistry>
  );
}
