import Category from "@/components/categories/category";
import HomePageHeader from "@/components/home-page/home-page-header";
import Product from "@/components/products/product";
import PageGrid from "@/components/ui/page-grid";
import PageLayout from "@/components/ui/page-layout";
import { HomepageProvider, useHomepageContext } from "@/context/HomepageContext";
import PageLoader from "@/components/ui/PageLoader";

export default function Home() {

  return (
    <HomepageProvider>
      <HomeContent />
    </HomepageProvider>
  );
}

function HomeContent() {
  const { homepageData } = useHomepageContext();
  const bannerSwiper = homepageData?.bannerSwiper || [];
  const homepageSettings = homepageData?.homepageSettings ;
  const categories = homepageData?.categories || [];
  const featuredProducts = homepageSettings?.featured_products || [];
  const latestProducts = homepageData?.latest_products || [];


  if (!homepageData) {
    return <PageLoader />;
  }

  return (
    <PageLayout className={`flex flex-col min-h-screen gap-16 pb-32`}>
      <HomePageHeader bannerSwiper={bannerSwiper} homepageSettings={homepageSettings} />
      <section className="flex flex-col gap-20 px-6 md:px-12">
        <PageGrid
          items={categories}
          label={homepageSettings?.categories_section_title}
          renderItem={(item) => <Category key={item.id} category={item} />}
          viewMoreHref="/categories"
        />
        <PageGrid
          items={featuredProducts}
          label={homepageData.homepageSettings.featured_products_section_title}
          renderItem={(item) => <Product key={item.id} product={item} />}
        />
        <PageGrid
          items={latestProducts}
          label={homepageData.homepageSettings.latest_products_section_title}
          renderItem={(item) => <Product key={item.id} product={item} />}
        />
      </section>
    </PageLayout>
  );
}
