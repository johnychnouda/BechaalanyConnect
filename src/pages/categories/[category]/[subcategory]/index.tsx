import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import BackButton from '@/components/ui/back-button';
import ComingSoon from '@/components/ui/coming-soon';
import Breadcrumb from '@/components/ui/breadcrumb';
import Card from '@/components/ui/card';
import { fetchProductsData } from '@/services/api.service';
import { useGlobalContext } from '@/context/GlobalContext';
import CardSkeleton from '@/components/ui/card-skeleton';

interface Product {
  id: string;
  name: string;
  slug: string;
  full_path: {
    image: string;
  }
  price: number;
  description: string;
}


const SubCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category: categorySlug, subcategory: subcategorySlug } = router.query;
  const [products, setProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentSubcategory, setCurrentSubcategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { generalData } = useGlobalContext();


  useEffect(() => {
    if (!router.locale || !categorySlug) return;
    setIsLoading(true);
    setError(null);

    fetchProductsData(router.locale, categorySlug as string, subcategorySlug as string)
      .then((data) => {
        if (data && typeof data === 'object') {
          setProducts(data.products || []);
          setCurrentCategory(data.category || '');
          setCurrentSubcategory(data.subcategory || '');
        }
        else {
          console.error('Products data is invalid:', data);
          setProducts([]);
          setCurrentCategory('');
          setCurrentSubcategory('');
          setError('Invalid data format received');
        }
      })
      .catch((error) => {
        console.error('Error fetching Products:', error);
        setProducts([]);
        setCurrentCategory('');
        setCurrentSubcategory('');
        setError('Failed to load Products');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router.locale, categorySlug, subcategorySlug]);

  if (!categorySlug || !subcategorySlug || !products) {
    return null;
  }

  const breadcrumbItems = [
    { label: generalData?.settings?.homepage_label || '', href: '/' },
    { label: generalData?.settings?.categories_label || '', href: '/categories' },
    { label: currentCategory, href: `/categories/${categorySlug}` },
    { label: currentSubcategory }
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="px-2 sm:px-0">
        <Breadcrumb items={breadcrumbItems} />
        <BackButton href={`/categories/${categorySlug}`} className="mb-2 sm:mb-4" label={generalData?.settings.back_button_label || ''} />
      </div>

      {
        !isLoading && <h1 className="text-[clamp(20px,5vw,32px)] font-bold text-gray-900 mt-4 sm:mt-8 mb-4 px-2 sm:px-0">{currentSubcategory}</h1>
      }
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-8">
            {products.map((product) => (
              <Card
                key={product.id}
                id={product.id}
                title={product.name}
                image={product.full_path.image}
                type="product"
                href={`/categories/${categorySlug}/${subcategorySlug}/${product.slug}`}
              />
            ))}
          </div>
        ) : (
          <ComingSoon />
        )
      )}


    </div>
  );
};

export default SubCategoryPage; 