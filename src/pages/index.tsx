import Category from "@/components/categories/category";
import HomePageHeader from "@/components/home-page/home-page-header";
import Product from "@/components/products/product";
import PageGrid from "@/components/ui/page-grid";
import PageLayout from "@/components/ui/page-layout";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/categories.service";
import { getProducts } from "@/services/products.service";

export default function Home() {
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // Get featured products (first 5)
  const featuredProducts = products.slice(0, 5);
  // Get latest products (last 5)
  const latestProducts = products.slice(-5);

  return (
    <PageLayout className={`flex flex-col min-h-screen gap-16 pb-32`}>
      <HomePageHeader />
      <section className="flex flex-col gap-20 px-12">
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
          viewMoreHref="/products/featured"
        />
        <PageGrid
          items={latestProducts}
          label="LATEST PRODUCTS"
          renderItem={(item) => <Product key={item.id} product={item} />}
          viewMoreHref="/products/latest"
        />
      </section>
    </PageLayout>
  );
}
