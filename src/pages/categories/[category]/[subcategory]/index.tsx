import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/categories.service';
import BackButton from '@/components/ui/back-button';
import ComingSoon from '@/components/ui/coming-soon';
import Breadcrumb from '@/components/ui/breadcrumb';
import Card from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
}

// This would typically come from your API
const getProducts = (category: string, subcategory: string): Product[] => {
    // console.log(category, subcategory);
  // Placeholder data - replace with actual API call
  const products: Record<string, Record<string, Product[]>> = {
    GAMING: {
      'Pubg': [
        {
          id: 'pubg-mobile',
          name: 'PUBG Mobile',
          image: '/pubg-mobile.png',
          price: 0.00,
          description: 'PUBG Mobile Game'
        },
        {
          id: 'pubg-mobile-code',
          name: 'PUBG Mobile Code',
          image: '/pubg-mobile-code.png',
          price: 0.00,
          description: 'PUBG Mobile Game Code'
        },
        {
          id: 'pubg-lite',
          name: 'PUBG Lite',
          image: '/pubg-lite.png',
          price: 0.00,
          description: 'PUBG Lite Game'
        },
        {
          id: 'pubg-turkey',
          name: 'PUBG Turkey',
          image: '/pubg-turkey.png',
          price: 0.00,
          description: 'PUBG Turkey Version'
        }
      ],
      'Free Fire': [
        {
          id: 'ff-diamonds-100',
          name: 'Free Fire Diamonds 100',
          image: '/freefire-image.png',
          price: 0.99,
          description: '100 Diamonds for Free Fire'
        }
      ]
    },
    STREAMING: {
      'NETFLIX': [
        {
          id: 'netflix-basic',
          name: 'Netflix Basic Plan',
          image: '/netflix-image.png',
          price: 8.99,
          description: 'Netflix Basic Plan - Standard Definition'
        }
      ],
      'DISNEY+': [
        {
          id: 'disney-plus',
          name: 'Disney+ Subscription',
          image: '/disney-image.png',
          price: 7.99,
          description: 'Disney+ Monthly Subscription'
        }
      ]
    }
  };

  return products[category]?.[subcategory] || [];
};

const SubCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category: categorySlug, subcategory: subcategorySlug } = router.query;

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  if (isLoadingCategories) {
    return <div>Loading...</div>;
  }

  if (!categorySlug || !subcategorySlug || !categories) {
    return null;
  }

  // Convert URL slugs back to title format
  const categoryTitle = (categorySlug as string).toUpperCase();
  const subcategoryTitle = (subcategorySlug as string)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const currentCategory = categories.find(c => c.title === categoryTitle);
  if (!currentCategory) {
    return <div>Category not found</div>;
  }

//   console.log(categoryTitle, subcategoryTitle);

  const products = getProducts(categoryTitle, subcategoryTitle);

  const breadcrumbItems = [
    { label: 'Homepage', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: currentCategory.title, href: `/categories/${categorySlug}` },
    { label: subcategoryTitle }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      <BackButton href={`/categories/${categorySlug}`} className="mb-4" />
      
      <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{subcategoryTitle}</h1>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col items-center">
              <Card
                id={product.id}
                title={product.name}
                image={product.image}
                type="product"
                href={`/categories/${categorySlug}/${subcategorySlug}/${product.id}`}
              />
              <div className="text-center mt-2">
                <h3 className="text-[16px] font-semibold text-gray-800">{product.name}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ComingSoon />
      )}
    </div>
  );
};

export default SubCategoryPage; 