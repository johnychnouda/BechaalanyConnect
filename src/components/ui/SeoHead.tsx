'use client';

import Head from 'next/head';
import { useRouter } from 'next/router';

type OpenGraph = {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  url?: string | null;
  type?: string | null;
};

type SeoData = {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  canonical_url?: string | null;
  og?: OpenGraph | null;
  meta_robots?: string | null; // e.g., "index,follow"
};

export default function SeoHead({ seo }: { seo?: SeoData | null }) {
  const router = useRouter();
  const title = seo?.title || 'Bechaalany Connect';
  const description = seo?.description || '';
  const keywords = seo?.keywords || '';
  const siteUrlEnv = process.env.NEXT_PUBLIC_SITE_URL || '';
  const currentPath = router?.asPath || '/';
  const derivedAbsoluteUrl = siteUrlEnv ? new URL(currentPath, siteUrlEnv).toString() : '';
  const canonicalUrl = seo?.canonical_url || derivedAbsoluteUrl;
  const robots = seo?.meta_robots || 'index,follow';
  const og = seo?.og || {};
  const siteUrl = (og as any)?.url || derivedAbsoluteUrl || siteUrlEnv || '';
  const imageFromSeo = (seo as any)?.full_path?.image || (seo as any)?.image || undefined;
  const ogImage = (og as any)?.image || imageFromSeo;
  const ogTitle = (og as any)?.title || title;
  const ogDescription = (og as any)?.description || description;

  return (
    <Head>
      {title && <title>{title}</title>}
      {title && <meta name="title" content={title} />}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {robots && <meta name="robots" content={robots} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={(og as any)?.type || 'website'} />
      {siteUrl && <meta property="og:url" content={siteUrl} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}        

      {/* Twitter cards (basic) */}
      <meta property="twitter:card" content="summary_large_image" />
      {siteUrl && <meta property="twitter:url" content={siteUrl} />}
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Head>
  );
}


