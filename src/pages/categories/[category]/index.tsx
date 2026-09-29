import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import BackButton from "@/components/ui/back-button";
import ComingSoon from "@/components/ui/coming-soon";
import Breadcrumb from "@/components/ui/breadcrumb";
import Card from "@/components/ui/card";
import Error from "next/error";
import { useGlobalContext } from "@/context/GlobalContext";
import { fetchSubCategoriesData } from "@/services/api.service";
import CardSkeleton from "@/components/ui/card-skeleton";
import SeoHead from "@/components/ui/SeoHead";
import { useLanguage } from "@/hooks/use-language";
import { ErrorState } from "@/components/ui/primitives/ErrorState";

interface SubCategory {
  id: number;
  slug: string;
  title: string;
  full_path: {
    image: string | null;
  }
}

// A product from a subcategory flagged `show_products_in_category` — listed
// here on the category page, since that subcategory is not a storefront level.
interface CategoryProduct {
  id: number;
  slug: string;
  name: string;
  full_path: {
    image: string | null;
  };
  subcategory: {
    slug: string;
  };
}

type CategoryItem =
  | { kind: 'subcategory'; item: SubCategory }
  | { kind: 'product'; item: CategoryProduct };

const SubCategoryCard = ({ category, parentSlug }: { category: SubCategory; parentSlug: string }) => {
  const subcategorySlug = category.slug;
  return (
    <Card
      id={category.id.toString()}
      title={category.title}
      image={category.full_path.image}
      type="category"
      href={`/categories/${parentSlug}/${subcategorySlug}`}
    />
  );
};

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const { generalData } = useGlobalContext();
  const { locale } = useLanguage();
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (!router.locale || !category) return;
    setIsLoading(true);
    setError(null);

    fetchSubCategoriesData(router.locale, category as string)
      .then((data) => {
        if (data && typeof data === 'object') {
          setSubCategories(data.subcategories || []);
          setProducts(data.products || []);
          setCurrentCategory(data.category || '');
        }
        else {
          console.error('SubCategories data is invalid:', data);
          setSubCategories([]);
          setProducts([]);
          setCurrentCategory('');
          setError(locale === 'ar' ? 'تم استلام بيانات بتنسيق غير صالح' : 'Invalid data format received');
        }
      })
      .catch((error) => {
        console.error('Error fetching category:', error);
        setSubCategories([]);
        setProducts([]);
        setCurrentCategory('');
        setError(locale === 'ar' ? 'تعذر تحميل الفئة' : 'Failed to load this category');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router.locale, category, locale]);


  // Sync page from query param
  useEffect(() => {
    const pageParam = router.query.page;
    const raw = Array.isArray(pageParam) ? pageParam[0] : pageParam;
    const parsed = raw ? parseInt(raw as string, 10) : 1;
    setCurrentPage(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
  }, [router.query.page]);

  // Subcategories first, then the products listed directly on this category.
  const items = useMemo<CategoryItem[]>(() => [
    ...subCategories.map((item) => ({ kind: 'subcategory' as const, item })),
    ...products.map((item) => ({ kind: 'product' as const, item })),
  ], [subCategories, products]);

  // Clamp current page when data changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [items, currentPage, itemsPerPage]);

  // If no category or categories, show 404 - MUST BE AFTER ALL HOOKS
  if (!category || !category.length) {
    return <Error statusCode={404} />;
  }

  const hasContent = items.length > 0;
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: target }
      },
      undefined,
      { shallow: true, scroll: true }
    );
  };

  const breadcrumbItems = [
    { label: generalData?.settings?.homepage_label || '', href: '/' },
    { label: generalData?.settings?.categories_label || '', href: '/categories' },
    { label: currentCategory || (category as string) || '' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <SeoHead seo={{
        title: `${currentCategory || (category as string)} - Bechaalany Connect`,
        description: `Browse category ${currentCategory || category}`,
        og: {
          title: `${currentCategory || (category as string)} - Bechaalany Connect`,
          description: `Browse category ${currentCategory || category}`,
          image: generalData?.settings?.full_path?.logo || undefined,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/categories/${category}`,
          type: 'website',
        },
        canonical_url: `${process.env.NEXT_PUBLIC_SITE_URL}/categories/${category}`,
        meta_robots: 'index, follow',
        keywords: `${currentCategory || (category as string)} - Bechaalany Connect`,
      }} />
      <Breadcrumb items={breadcrumbItems} />
      <BackButton href="/categories" className="mb-4" label={generalData?.settings.back_button_label || ''} />
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        /* A genuine fetch failure and "this category has no subcategories yet"
           are different things and must not look the same — `error` used to
           be set here but never rendered, so an outage fell through to the
           `hasContent` check below and rendered <ComingSoon>, telling the
           customer the category was an upcoming release instead of down. */
        <ErrorState
          message={error}
          onRetry={() => router.reload()}
          retryLabel={locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
        />
      ) : hasContent ? (
        <div>
          <h1 className="text-2xl font-bold mb-6 text-app-black dark:text-app-red">{currentCategory}</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedItems.map((entry) => entry.kind === 'subcategory' ? (
              <SubCategoryCard
                key={`subcategory-${entry.item.id}`}
                category={entry.item}
                parentSlug={category as string}
              />
            ) : (
              <Card
                key={`product-${entry.item.id}`}
                id={entry.item.id.toString()}
                title={entry.item.name}
                image={entry.item.full_path.image}
                type="product"
                href={`/categories/${category}/${entry.item.subcategory.slug}/${entry.item.slug}`}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-full border border-app-red ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-app-red hover:text-white'} text-app-black dark:text-white`}
              >
                {locale === 'ar' ? 'السابق' : 'Prev'}
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 rounded-full border ${pageNum === currentPage ? 'bg-app-red text-white border-app-red' : 'border-app-red text-app-black dark:text-white hover:bg-app-red hover:text-white'}`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-full border border-app-red ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-app-red hover:text-white'} text-app-black dark:text-white`}
              >
                {locale === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <ComingSoon title={currentCategory || (category as string)} />
      )}
    </div>
  );
} 