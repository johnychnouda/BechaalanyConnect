import Category from "@/components/categories/category";
import HomePageHeader from "@/components/home-page/home-page-header";
import Product from "@/components/products/product";
import PageGrid from "@/components/ui/page-grid";
import PageLayout from "@/components/ui/page-layout";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/categories.service";
import { getProducts } from "@/services/products.service";
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
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // Get featured products (first 4)
  const featuredProducts = products.slice(0, 4);
  // Get latest products (last 4)
  const latestProducts = products.slice(-4);

  if (!homepageData) {
    return <PageLoader />;
  }

  return (
    <PageLayout className={`flex flex-col min-h-screen gap-16 pb-32`}>
      <HomePageHeader />
      <section className="flex flex-col gap-20 px-6 md:px-12">
        <PageGrid
          items={categories}
          label="CATEGORIES"
          renderItem={(item) => <Category key={item.id} category={item} />}
          viewMoreHref="/categories"
        />
        <PageGrid
          items={featuredProducts}
          label="FEATURED PRODUCTS"
          renderItem={(item) => <Product key={item.id} product={item} />}
        />
        <PageGrid
          items={latestProducts}
          label="LATEST PRODUCTS"
          renderItem={(item) => <Product key={item.id} product={item} />}
        />
      </section>
    </PageLayout>
  );
}
