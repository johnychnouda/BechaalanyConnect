/* eslint-disable @typescript-eslint/no-explicit-any */
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TopBanner from "@/components/ui/top-banner";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import WhatsAppButton from "@/components/ui/whatsapp-button";
// import axiosConfig from "@/utils/axiosConfig";
// import axios from 'axios';
import GlobalState from "@/utils/GlobalState";
import { AuthProvider } from '@/context/AuthContext';

export default function App({
  Component,
  pageProps,
  router,
  messages,
  generalData,
  locale,
}: AppProps & { messages: any } & { generalData: any } & { locale: string }) {
  const [queryClient] = useState(() => new QueryClient());
  const isRTL = router.locale === "ar";

  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalState.Provider value={{
          generalData,locale
        }}>
          <QueryClientProvider client={queryClient}>
            <NextIntlClientProvider
              locale={router.locale}
              timeZone="Asia/Beirut"
              messages={messages}
            >
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
                <Footer />
                {/* WhatsApp Floating Button */}
                <WhatsAppButton style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }} />
              </main>
            </NextIntlClientProvider>
          </QueryClientProvider>
        </GlobalState.Provider>
      </AuthProvider>
    </ThemeProvider>
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
