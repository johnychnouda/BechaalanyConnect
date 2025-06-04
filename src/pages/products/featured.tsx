import React, { useState } from 'react';
import PageLayout from '@/components/ui/page-layout';
import Product from '@/components/products/product';
import Breadcrumb from '@/components/ui/breadcrumb';
import BackButton from '@/components/ui/back-button';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/services/products.service';
import { getCategories } from '@/services/categories.service';

export default function FeaturedProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const featuredProducts = products.filter(
    (p) => selectedCategories.length === 0 || (p.category && selectedCategories.includes(p.category.title))
  ).slice(0, 5);

  const breadcrumbItems = [
    { label: 'Homepage', href: '/' },
    { label: 'Featured Products' }
  ];

  const handleCategoryChange = (catTitle: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catTitle)
        ? prev.filter((c) => c !== catTitle)
        : [...prev, catTitle]
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />
      <BackButton href="/" className="mb-4" />
      <h1 className="text-2xl font-bold mb-6">FEATURED PRODUCTS</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 w-full md:sticky md:top-8 flex-shrink-0 bg-white border border-[#E73828] rounded-xl p-6 mb-4 md:mb-0 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Filter by Category</h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.length === 0}
                onChange={() => setSelectedCategories([])}
                className="w-4 h-4 accent-[#E73828] rounded border-gray-300 focus:ring-[#E73828]"
              />
              <span className="text-sm font-medium hover:text-[#E73828] transition-colors">All Categories</span>
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.title)}
                  onChange={() => handleCategoryChange(cat.title)}
                  className="w-4 h-4 accent-[#E73828] rounded border-gray-300 focus:ring-[#E73828]"
                />
                <span className="text-sm font-medium hover:text-[#E73828] transition-colors">{cat.title}</span>
              </label>
            ))}
          </div>
        </aside>
        {/* Product Grid */}
        <main className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <div key={product.id} className="flex flex-col items-center">
                <Product product={product} />
                <div className="text-center mt-2">
                  <h3 className="text-[18px] font-semibold text-gray-800">{product.title}</h3>
                </div>
              </div>
            ))}
          </div>
          {isLoading && <div className="text-center text-lg text-gray-600 mt-8">Loading...</div>}
          {!isLoading && featuredProducts.length === 0 && (
            <div className="text-center text-lg text-gray-600 mt-8">No featured products found.</div>
          )}
        </main>
      </div>
    </div>
  );
} 