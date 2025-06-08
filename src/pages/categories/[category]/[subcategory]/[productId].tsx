import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/categories.service';
import BackButton from '@/components/ui/back-button';
import Breadcrumb from '@/components/ui/breadcrumb';
import PageLayout from '@/components/ui/page-layout';
import Card from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
}

// This would typically come from your API
const getProduct = (category: string, subcategory: string, productId: string): Product | null => {
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

  return products[category]?.[subcategory]?.find(p => p.id === productId) || null;
};

const ProductPage: React.FC = () => {
  const router = useRouter();
  const { category: categorySlug, subcategory: subcategorySlug, productId } = router.query;
  const [quantity, setQuantity] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoadingCategories) {
    return <div>Loading...</div>;
  }

  if (!categorySlug || !subcategorySlug || !productId || !categories) {
    return null;
  }

  const categoryTitle = (categorySlug as string).toUpperCase();
  const subcategoryTitle = (subcategorySlug as string)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const currentCategory = categories.find(c => c.title === categoryTitle);
  if (!currentCategory) {
    return <div>Category not found</div>;
  }

  const product = getProduct(categoryTitle, subcategoryTitle, productId as string);
  if (!product) {
    return <div>Product not found</div>;
  }

  const breadcrumbItems = [
    { label: 'Homepage', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: currentCategory.title, href: `/categories/${categorySlug}` },
    { label: subcategoryTitle, href: `/categories/${categorySlug}/${subcategorySlug}` },
    { label: product.name }
  ];

  // Simulate available amounts (should come from backend in real app)
  const amounts = [
    { id: 1, amount: "100 UC", price: 1, image: '/pubg-uc.png' },
    { id: 2, amount: "325 UC", price: 5, image: '/pubg-uc.png' },
    { id: 3, amount: "660 UC", price: 10, image: '/pubg-uc.png' },
    { id: 4, amount: "1800 UC", price: 25, image: '/pubg-uc.png' },
    { id: 5, amount: "3850 UC", price: 48, image: '/pubg-uc.png' },
    { id: 6, amount: "8100 UC", price: 92, image: '/pubg-uc.png' },
  ];

  const [selectedAmount, setSelectedAmount] = useState(amounts[0]);

  const total = selectedAmount.price * quantity;

  // Related products: all except the current one
  const related = amounts.filter(a => a.id !== selectedAmount.id);

  return (
    <PageLayout className="flex flex-col min-h-screen px-0 md:px-0 py-0 bg-white">
      {/* Breadcrumb */}
      <div className="w-full px-4 md:px-12 pt-6 pb-2">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="w-full px-4 md:px-12 mb-4">
        <BackButton href={`/categories/${categorySlug}/${subcategorySlug}`} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8 items-start w-full px-4 md:px-12 pb-8">
        {/* Product Image */}
        <div className="md:w-1/2 flex justify-center items-start">
          <div className="relative w-full max-w-[400px] h-[400px]">
            <div className="block overflow-hidden rounded-[25px] shadow-sm border border-transparent relative h-full">
              <div className="relative w-full h-full">
                <img 
                  src={selectedAmount.image} 
                  alt={selectedAmount.amount} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 flex flex-col gap-4 max-w-lg w-full">
          <h1 className="text-[32px] font-bold text-app-red leading-tight">{selectedAmount.amount}</h1>
          <p className="text-gray-700 text-[15px] mb-2 dark:text-white">{product.description}</p>

          {/* Amount Select */}
          <div className="mb-2">
            <label className="block text-gray-800 font-semibold mb-1">Amount</label>
            <div ref={dropdownRef} className="relative w-full">
              <button
                type="button"
                className={`w-full flex justify-between items-center box-border bg-white border border-app-red rounded-full px-4 py-2 text-[16px] font-roboto font-normal uppercase text-app-red transition-all duration-200 cursor-pointer focus:outline-none ${dropdownOpen ? 'ring-2 ring-app-red' : ''} group`}
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <span className="text-black">{selectedAmount.amount}</span>
                <span className="ml-2 flex items-center">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-colors duration-200 text-gray-500 group-hover:text-app-red"
                  >
                    <path d="M6 9L11 14L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 z-20 bg-white border border-app-red rounded-[12px] py-2 flex flex-col" style={{padding: '8px 0'}}>
                  {amounts.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      className={`text-left px-4 py-2 text-[16px] font-roboto font-normal uppercase ${a.id === selectedAmount.id ? 'bg-app-red/10 text-black font-bold' : 'text-black'} hover:bg-app-red/20 transition-all rounded-[8px]`}
                      onClick={() => { setSelectedAmount(a); setDropdownOpen(false); }}
                    >
                      {a.amount}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-2">
            <label className="block text-gray-800 font-semibold mb-1">Quantity</label>
            <div className="flex items-center border border-app-red rounded-full px-2 py-1 w-full bg-white justify-between min-w-[160px]">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border-none text-2xl text-black font-normal transition-transform duration-150 hover:scale-110 hover:bg-app-red/10 hover:text-black p-0"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                type="button"
              >-</button>
              <span className="text-lg font-normal w-8 text-center text-black select-none">{quantity}</span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border-none text-2xl text-black font-normal transition-transform duration-150 hover:scale-110 hover:bg-app-red/10 hover:text-black p-0"
                onClick={() => setQuantity(q => q + 1)}
                type="button"
              >+</button>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-2 mb-2">
            <span className="text-black text-lg font-bold">Total</span>
            <span className="text-2xl font-bold text-app-red">${total.toFixed(2)}</span>
          </div>

          {/* Buy Button */}
          <button className="bg-app-red text-white font-bold py-2 px-6 rounded-full w-full mt-2 transition duration-300 text-lg hover:bg-white hover:text-app-red border border-app-red">
            BUY NOW
          </button>
        </div>
      </div>

      {/* Related Products */}
      <div className="w-full px-4 md:px-12 pb-12">
        <h2 className="text-app-red text-[24px] font-bold mb-4 mt-2">RELATED PRODUCTS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {related.map((prod) => (
            <div key={prod.id} className="flex flex-col items-center">
              <Card
                id={prod.id.toString()}
                title={prod.amount}
                image={prod.image}
                type="product"
                href="#"
              />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductPage; 