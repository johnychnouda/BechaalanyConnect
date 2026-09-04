import PageLoader from '@/components/ui/PageLoader'
import Document, { DocumentContext, Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        // Carried through so render() can put the real locale on <html>.
        locale: ctx.locale || ctx.defaultLocale || 'en',
        styles: [initialProps.styles, sheet.getStyleElement()],
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    /*
     * lang and dir belong on <html>, not on a wrapper div.
     *
     * This was hardcoded `<Html lang="en">` and `dir` was applied only to the <main>
     * element in _app.tsx. Everything rendered OUTSIDE that element therefore stayed
     * left-to-right in Arabic — the toast container and every `fixed inset-0` modal,
     * including the KYC and pending-approval dialogs. Screen readers also announced
     * the entire Arabic site as English.
     *
     * Setting it here fixes all of them at once, and is what makes the `rtl:` Tailwind
     * variant (tailwind.config.js) able to work at all, since it keys off
     * [dir="rtl"] on an ancestor.
     *
     * `this.props.locale` is populated by Next from the active i18n locale.
     */
    const locale = (this.props as any).locale || 'en';
    const isRtl = locale === 'ar';

    return (
      <Html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
        <Head>
          {/*
            Fonts are no longer loaded here — next/font (src/lib/fonts.ts) self-hosts
            Inter + Noto Sans Arabic and injects them via CSS variables on <main> in
            _app.tsx, so there is no render-blocking Google Fonts request and no
            separate preconnect to manage.
          */}
          <meta name="vercel-toolbar" content="false" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
