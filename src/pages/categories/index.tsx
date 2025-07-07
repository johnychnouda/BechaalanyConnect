import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/back-button';
import Breadcrumb from '@/components/ui/breadcrumb';
import Card from '@/components/ui/card';
import { useGlobalContext } from '@/context/GlobalContext';
import { useRouter } from 'next/router';
import { fetchCategoriesData } from '@/services/api.service';
import { Category } from '@/types/category.type';

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  return (
    <Card
      id={category.id.toString()}
      title={category.title}
      image={category.full_path.image}
      type="category"
      href={`/categories/${category.slug}`} />
  );
};

const CategoriesPage = () => {
  const { generalData } = useGlobalContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const breadcrumbItems = [
    { label: generalData?.settings.homepage_label || '', href: '/' },
    { label: generalData?.settings.categories_label || '' }
  ];

  useEffect(() => {
    if (!router.locale) return;
    setIsLoading(true);
    setError(null);

    fetchCategoriesData(router.locale)
      .then((data) => {
        // Ensure we always set an array
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.error('Categories data is not an array:', data);
          setCategories([]);
          setError('Invalid data format received');
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setCategories([]);
        setError('Failed to load categories');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router.locale]);


  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />
      <BackButton href="/" className="mb-4" label={generalData?.settings.back_button_label || ''} />


      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6 dark:text-[#E73828]">{generalData?.settings.categories_label || ''}</h1>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">
            {
              router.locale === 'ar' ? 'جاري تحميل الفئات...' : 'Loading categories...'
            }
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">
            {
              router.locale === 'ar' ? 'لم يتم العثور على أي فئات' : 'No categories found'
            }
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category: Category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage; 