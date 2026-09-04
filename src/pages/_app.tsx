/* eslint-disable @typescript-eslint/no-explicit-any */
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { NextIntlClientProvider } from "next-intl";
import { useMemo, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import clsx from "clsx";
import TopBanner from "@/components/ui/top-banner";
import Header from "@/components/ui/header";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import Footer from "@/components/ui/footer";
import GlobalState from "@/utils/GlobalState";
import VerificationPendingBanner from "@/components/ui/verification-pending-banner";
import { AuthProvider } from '@/context/AuthContext';
import FallbackTheme from "@/components/ui/fallback-theme";
import { GlobalProvider } from "@/context/GlobalContext";
import CreditNotificationProvider from "@/components/providers/CreditNotificationProvider";
import { useRouter } from 'next/router';
import PageLoader from '@/components/ui/PageLoader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clearSessionTokens, hasMultipleSessionTokens, logSessionTokens } from '@/utils/clear-session-tokens';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { inter, notoSansArabic } from "@/lib/fonts";
import ErrorBoundary from "@/components/ui/error-boundary";



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
    <SessionProvider
      session={pageProps.session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <QueryClientProvider client={queryClient}>
      <GlobalProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true} storageKey="theme" disableTransitionOnChange={false}>
          <AuthProvider>
            <CreditNotificationProvider>
              <GlobalState.Provider value={globalStateValue}>
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
                                {/* Nothing in the app let a keyboard user jump past the
                                    header/nav straight to content — every page required
                                    tabbing through the same burger/logo/theme/nav/search
                                    chain first. Visually hidden until focused. */}
                                <a
                                  href="#main-content"
                                  className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-app-red focus:text-white focus:px-4 focus:py-2 focus:rounded-full"
                                >
                                  {isRTL ? 'تخطَّ إلى المحتوى' : 'Skip to content'}
                                </a>
                                {/* dir now lives on <html> (see _document.tsx), so it
                                    also covers the toast container and every fixed
                                    modal — all of which render outside this element
                                    and used to stay left-to-right in Arabic.

                                    The two font CSS variables (src/lib/fonts.ts) live
                                    here too: fontFamily.sans / .arabic in
                                    tailwind.config.js reference them, and globals.css
                                    switches which one `body` uses based on the `dir`
                                    attribute already set on <html>. */}
                                <main className={clsx("min-h-screen flex flex-col", inter.variable, notoSansArabic.variable)}>
                                  <VerificationPendingBanner />
                                  <TopBanner>
                                    <Header>
                                      <div id="main-content" className="flex-grow">
                                        {/* Keyed by path so a route change remounts the boundary —
                                            otherwise, once tripped on one page, it would keep
                                            showing the fallback after navigating to a working one. */}
                                        <ErrorBoundary key={router.asPath} locale={router.locale}>
                                          <Component {...pageProps} />
                                        </ErrorBoundary>
                                      </div>
                                    </Header>
                                  </TopBanner>
                                  {/* WhatsApp Floating Button */}
                                  {/* if language is arabic, the button should be on the left 3rem and on small screens 2rem */}
                                  <WhatsAppButton className="fixed bottom-20 right-6 left-auto rtl:left-6 rtl:right-auto md:right-12 md:left-auto rtl:md:left-12 rtl:md:right-auto lg:bottom-3" />
                                  {/* Footer */}
                                  <Footer />
                                </main>
                                {/* Global Toast Container.
                                    `rtl` was hardcoded to false, so Arabic toasts
                                    were laid out left-to-right even though they were
                                    positioned top-left. */}
                                <ToastContainer
                                  position={isRTL ? 'top-left' : 'top-right'}
                                  autoClose={3000}
                                  hideProgressBar={false}
                                  newestOnTop={false}
                                  closeOnClick
                                  rtl={isRTL}
                                  pauseOnFocusLoss
                                  pauseOnHover
                                  theme={"colored"}
                                />
                                <SpeedInsights />

                              </NextIntlClientProvider>
            </GlobalState.Provider>
            </CreditNotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </GlobalProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
