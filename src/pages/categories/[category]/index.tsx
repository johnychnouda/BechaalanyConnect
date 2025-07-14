import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BackButton from "@/components/ui/back-button";
import ComingSoon from "@/components/ui/coming-soon";
import Breadcrumb from "@/components/ui/breadcrumb";
import Card from "@/components/ui/card";
import Error from "next/error";
import { useGlobalContext } from "@/context/GlobalContext";
import { fetchSubCategoriesData } from "@/services/api.service";
import CardSkeleton from "@/components/ui/card-skeleton";

interface SubCategory {
  id: number;
  slug: string;
  title: string;
  full_path: {
    image: string;
  }
}

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
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.locale || !category) return;
    setIsLoading(true);
    setError(null);

    fetchSubCategoriesData(router.locale, category as string)
      .then((data) => {
        if (data && typeof data === 'object') {
          setSubCategories(data.subcategories || []);
          setCurrentCategory(data.category || '');
        }
        else {
          console.error('SubCategories data is invalid:', data);
          setSubCategories([]);
          setCurrentCategory('');
          setError('Invalid data format received');
        }
      })
      .catch((error) => {
        console.error('Error fetching subategories:', error);
        setSubCategories([]);
        setCurrentCategory('');
        setError('Failed to load subcategories');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router.locale, category]);

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  // If no category or categories, show 404
  if (!category || !category.length) {
    return <Error statusCode={404} />;
  }

  // const subCategories = getSubCategories(currentCategory.title);
  const hasContent = subCategories.length > 0;

  const breadcrumbItems = [
    { label: generalData?.settings?.homepage_label || '', href: '/' },
    { label: generalData?.settings?.categories_label || '', href: '/categories' },
    { label: currentCategory || (category as string) || '' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />
      <BackButton href="/categories" className="mb-4" label={generalData?.settings.back_button_label || ''} />
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : hasContent ? (
        <div>
          <h1 className="text-2xl font-bold mb-6 dark:text-[#E73828]">{currentCategory}</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subCategories.map((subCategory) => (
              <SubCategoryCard
                key={subCategory.id}
                category={subCategory}
                parentSlug={category as string}
              />
            ))}
          </div>
        </div>
      ) : (
        <ComingSoon title={currentCategory || (category as string)} />
      )}
    </div>
  );
} 