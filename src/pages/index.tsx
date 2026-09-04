import Category from "@/components/categories/category";
import HomePageHeader from "@/components/home-page/home-page-header";
import Product from "@/components/products/product";
import PageGrid from "@/components/ui/page-grid";
import PageLayout from "@/components/ui/page-layout";
import { HomepageProvider, useHomepageContext } from "@/context/HomepageContext";
import PageLoader from "@/components/ui/PageLoader";
import SeoHead from "@/components/ui/SeoHead";
import { useRouter } from "next/router";

export default function Home() {

  return (
    <HomepageProvider>
      <HomeContent />
    </HomepageProvider>
  );
}

function HomeContent() {
  const { homepageData, homepageError } = useHomepageContext();
  const { locale } = useRouter();
  const bannerSwiper = homepageData?.bannerSwiper || [];
  const homepageSettings = homepageData?.homepageSettings;
  const categories = homepageData?.categories || [];
  const featuredProducts = homepageSettings?.featured_products || [];
  const latestProducts = homepageData?.latest_products || [];


  if (homepageError) {
    return (
      <PageLayout className="flex flex-col min-h-screen items-center justify-center gap-4 px-4 text-center">
        <p className="text-app-red font-medium">
          {locale === 'ar' ? 'تعذر تحميل الصفحة الرئيسية.' : 'We could not load the homepage.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-lg bg-app-red text-white font-medium hover:opacity-90 transition-opacity"
        >
          {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
        </button>
      </PageLayout>
    );
  }

  if (!homepageData) {
    return <PageLoader />;
  }

  return (
    <PageLayout className={`flex flex-col min-h-screen gap-16 pb-32`}>
      <SeoHead seo={homepageData?.seo} />
      {/* The homepage had no <h1> at all — the hero banner's rotating title
          (below) is CMS content inside a Swiper carousel, which keeps every
          slide in the DOM, so making the visible slide title an <h1> would
          put several <h1>s on the page at once as slides cycle. A single
          screen-reader-only one, stable regardless of which slide is
          showing, is the safer fix — no visual change. */}
      <h1 className="sr-only">
        {locale === 'ar' ? 'بيشعلاني كونكت' : 'Bechaalany Connect'}
      </h1>
      <HomePageHeader bannerSwiper={bannerSwiper} homepageSettings={homepageSettings} />
      <section className="flex flex-col gap-20 px-6 md:px-12">
        {/* Categories */}
        {categories.length > 0 && (
          <PageGrid
            items={categories}
            label={homepageSettings?.categories_section_title}
            renderItem={(item) => <Category key={item.id} category={item} />}
            viewMoreHref="/categories"
          />
        )}
        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <PageGrid
            items={featuredProducts}
            label={homepageSettings?.featured_products_section_title}
            renderItem={(item) => <Product key={item.id} product={item} />}
          />
        )}
        {/* Latest Products */}
        {latestProducts.length > 0 && (
          <PageGrid
            items={latestProducts}
            label={homepageSettings?.latest_products_section_title}
            renderItem={(item) => <Product key={item.id} product={item} />}
          />
        )}
      </section>
    </PageLayout>
  );
}
