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

  /*
   * Keep <html lang/dir> in sync with the active locale.
   *
   * _document.tsx sets them for the SERVER-rendered first paint, but it never runs
   * again. Switching language is a client-side router.push (see
   * components/general/language-theme-switcher.tsx), so without this the document
   * kept dir="ltr" lang="en" while showing Arabic until a hard refresh — which
   * inerted EVERY `rtl:` Tailwind variant (tailwind.config.js registers them as
   * `[dir="rtl"] &`), the Arabic font swap in globals.css (`html[dir='rtl'] body`),
   * and therefore the whole header/layout mirroring.
   */
  useEffect(() => {
    const activeLocale = nextRouter.locale || 'en';
    document.documentElement.lang = activeLocale;
    document.documentElement.dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
  }, [nextRouter.locale]);

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
                                {/*
                                  * next/font hands back CSS variables, and they were
                                  * declared ONLY on the <main> className below. But
                                  * globals.css consumes them on `body`
                                  * (`body { @apply font-sans }` → font-family:
                                  * var(--font-inter), …), and custom properties inherit
                                  * downwards, never up from a child. So at body level the
                                  * var was undefined, the whole declaration was invalid at
                                  * computed-value time, and every page in BOTH locales
                                  * rendered in the browser's default serif — Arabic never
                                  * reached Noto Sans Arabic at all.
                                  *
                                  * Declaring them at :root fixes it for `body`, for the
                                  * `html[dir='rtl'] body` Arabic swap, and for the toast
                                  * container, which renders outside <main>. Server-rendered,
                                  * so there is no flash of the fallback font.
                                  *
                                  * (next/font cannot be imported in _document.tsx — Next
                                  * rejects font loaders there — which is why this is here
                                  * rather than as a className on <Html>.)
                                  */}
                                <style jsx global>{`
                                  :root {
                                    --font-inter: ${inter.style.fontFamily};
                                    --font-arabic: ${notoSansArabic.style.fontFamily};
                                  }
                                `}</style>
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
                                {/* dir lives on <html>: _document.tsx emits it for the
                                    SSR first paint and the effect above keeps it
                                    correct across client-side locale switches. That
                                    covers the toast container and every fixed modal —
                                    all of which render outside this element and used
                                    to stay left-to-right in Arabic.

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
