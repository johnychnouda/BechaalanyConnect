import React from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/back-button';
import { useTranslations } from 'next-intl';
import Breadcrumb from '@/components/ui/breadcrumb';
import Card from '@/components/ui/card';

// Placeholder data for categories
const categories = [
  { id: 1, name: 'GAMING', image: '/gaming-image.png' },
  { id: 2, name: 'STREAMING', image: '/streaming-image.png' },
  { id: 3, name: 'TIKTOK COINS', image: '/tiktok-image.png' },
  { id: 4, name: 'ONLINE CARD', image: '/onlinecard-image.png' },
  { id: 5, name: 'SOCIAL MEDIA SERVICES', image: '/socialmedia-image.png' },
  { id: 6, name: 'TELECOM', image: '/telecom-image.png' },
  { id: 7, name: 'LIVE CHAT', image: '/livechat-image.png' },
  { id: 8, name: 'DSL CARD', image: '/dslcard-image.png' },
  { id: 9, name: 'SPECIAL NUMBERS', image: '/specialnumbers-image.png' },
  { id: 10, name: 'BALANCE SECTION', image: '/balance-image.png' },
];

interface Category {
  id: number;
  name: string;
  image: string;
}

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  return (
    <Card
      id={category.id.toString()}
      title={category.name}
      image={category.image}
      type="category"
      href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`} />
  );
};

const CategoriesPage = () => {
  const t = useTranslations("common");

  const breadcrumbItems = [
    { label: 'Homepage', href: '/' },
    { label: 'Categories' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />
      <BackButton href="/" className="mb-4" />

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">CATEGORIES</h1>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage; 