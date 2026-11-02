import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import BackButton from '@/components/ui/back-button';
import ComingSoon from '@/components/ui/coming-soon';
import Breadcrumb from '@/components/ui/breadcrumb';
import Card from '@/components/ui/card';
import Error from 'next/error';
import { useGlobalContext } from '@/context/GlobalContext';
import { fetchSubCategoriesData } from '@/services/api.service';
import CardSkeleton from '@/components/ui/card-skeleton';
import SeoHead from '@/components/ui/SeoHead';
import { useLanguage } from '@/hooks/use-language';
import { ErrorState } from '@/components/ui/primitives/ErrorState';
import { EmptyState } from '@/components/ui/primitives/EmptyState';
import { Input } from '@/components/ui/primitives/Input';
import Pagination from '@/components/ui/pagination';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useListSearchPagination } from '@/hooks/use-list-search-pagination';

interface SubCategory {
  id: number;
  slug: string;
  title: string;
  full_path: {
    image: string | null;
  };
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

const SubCategoryCard = ({
  category,
  parentSlug,
}: {
  category: SubCategory;
  parentSlug: string;
}) => {
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

  useEffect(() => {
    if (!router.locale || !category) return;
    setIsLoading(true);
    setError(null);

    fetchSubCategoriesData(router.locale, category as string)
      .then(data => {
        if (data && typeof data === 'object') {
          setSubCategories(data.subcategories || []);
          setProducts(data.products || []);
          setCurrentCategory(data.category || '');
        } else {
          console.error('SubCategories data is invalid:', data);
          setSubCategories([]);
          setProducts([]);
          setCurrentCategory('');
          setError(
            locale === 'ar' ? 'تم استلام بيانات بتنسيق غير صالح' : 'Invalid data format received'
          );
        }
      })
      .catch(error => {
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

  // Subcategories first, then the products listed directly on this category.
  const items = useMemo<CategoryItem[]>(
    () => [
      ...subCategories.map(item => ({ kind: 'subcategory' as const, item })),
      ...products.map(item => ({ kind: 'product' as const, item })),
    ],
    [subCategories, products]
  );

  // Search mirrored to ?q= and page to ?page=, so refresh/share keep both.
  const { searchQuery, setSearchQuery, filteredItems, paginatedItems, currentPage, totalPages, goToPage } =
    useListSearchPagination(
      items,
      entry => (entry.kind === 'subcategory' ? entry.item.title : entry.item.name),
      { isLoading, resetKey: category }
    );

  // If no category or categories, show 404 - MUST BE AFTER ALL HOOKS
  if (!category || !category.length) {
    return <Error statusCode={404} />;
  }

  const hasContent = items.length > 0;

  const breadcrumbItems = [
    { label: generalData?.settings?.homepage_label || '', href: '/' },
    { label: generalData?.settings?.categories_label || '', href: '/categories' },
    { label: currentCategory || (category as string) || '' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <SeoHead
        seo={{
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
        }}
      />
      <Breadcrumb items={breadcrumbItems} />
      <BackButton
        href="/categories"
        className="mb-4"
        label={generalData?.settings.back_button_label || ''}
      />
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
          <h1 className="text-2xl font-bold mb-6 text-app-black dark:text-app-red">
            {currentCategory}
          </h1>
          <div className="relative mb-6 max-w-md">
            <MagnifyingGlassIcon
              className="w-5 h-5 absolute top-1/2 -translate-y-1/2 start-4 text-neutral-400 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                locale === 'ar'
                  ? `ابحث في ${currentCategory}...`
                  : `Search in ${currentCategory}...`
              }
              aria-label={locale === 'ar' ? 'بحث' : 'Search'}
              className="ps-11"
            />
          </div>
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={<MagnifyingGlassIcon className="w-10 h-10" />}
              title={
                locale === 'ar'
                  ? `لا توجد نتائج لـ "${searchQuery}"`
                  : `No results for "${searchQuery}"`
              }
              action={{
                label: locale === 'ar' ? 'مسح البحث' : 'Clear search',
                onClick: () => setSearchQuery(''),
                variant: 'outline',
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedItems.map(entry =>
                  entry.kind === 'subcategory' ? (
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
                  )
                )}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                locale={locale}
              />
            </>
          )}
        </div>
      ) : (
        <ComingSoon title={currentCategory || (category as string)} />
      )}
    </div>
  );
}
