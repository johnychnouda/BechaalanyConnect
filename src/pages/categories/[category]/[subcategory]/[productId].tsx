import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import BackButton from '@/components/ui/back-button';
import Breadcrumb from '@/components/ui/breadcrumb';
import PageLayout from '@/components/ui/page-layout';
import Card from '@/components/ui/card';
import Image from 'next/image';
import { fetchProductDetails, saveOrder } from '@/services/api.service';
import ComingSoon from '@/components/ui/coming-soon';
import { LogoIcon } from '@/assets/icons/logo.icon';
import { LogoWhiteIcon } from '@/assets/icons/logo-white.icon';
import { useAuth } from '@/context/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import CardSkeleton from '@/components/ui/card-skeleton';
import { useGlobalContext } from "@/context/GlobalContext";
import { useCreditOperations } from "@/services/credits.service";

interface ProductVariation {
  id: number;
  name: string;
  description: string;
  full_path: {
    image: string;
  }
  price: number;
  wholesale_price: number | null;
  product_id: number;
  is_active: number;
  quantity: number | null;
  price_variations: PriceVariation[];
}

interface PriceVariation {
  id: number;
  products_variations_id: number;
  price: number;
  user_types_id: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  slug: string;
  full_path: {
    image: string;
  }
  related_products: Product[];
  product_type_id: number;
}

// Type for the selected amount/variation
interface SelectedAmount {
  id: number;
  amount: string;
  price: number;
  image: string;
  description: string;
}

const ProductPage: React.FC = () => {
  const router = useRouter();
  const { deductFromBalance } = useCreditOperations();
  const { user, refreshUserData } = useAuth();
  const { refreshOrders, generalData } = useGlobalContext();
  const { locale } = useRouter();
  const { category: categorySlug, subcategory: subcategorySlug, productId: productSlug } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentSubcategory, setCurrentSubcategory] = useState<string>('');
  const [product, setProduct] = useState<Product>();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<SelectedAmount | null>(null);
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
  const [recipientUser, setRecipientUser] = useState('');


  // Convert product variations to amounts format
  const amounts: SelectedAmount[] = productVariations.map((variation, index) => ({
    id: variation.id || index,
    amount: variation.name,
    price: variation.price_variations.find((price) => price.user_types_id === user?.user_types?.id)?.price || variation.price,
    image: variation.full_path?.image,
    description: variation.description
  }));


  useEffect(() => {
    if (!router.locale || !categorySlug) return;
    setIsLoading(true);
    setError(null);
    fetchProductDetails(router.locale, categorySlug as string, subcategorySlug as string, productSlug as string)
      .then((data) => {
        if (data && typeof data === 'object') {
          setProductVariations(data.product_variations || []);
          setProduct(data.product || {});
          setRelatedProducts(data.product.related_products || []);
          setCurrentCategory(data.category || '');
          setCurrentSubcategory(data.subcategory || '');
        }
        else {
          console.error('Products data is invalid:', data);
          setProductVariations([]);
          setRelatedProducts([]);
          setCurrentCategory('');
          setCurrentSubcategory('');
          setError('Invalid data format received');
        }
      })
      .catch((error) => {
        console.error('Error fetching Products:', error);
        setProductVariations([]);
        setRelatedProducts([]);
        setCurrentCategory('');
        setCurrentSubcategory('');
        setError('Failed to load Products');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router.locale, categorySlug, subcategorySlug, productSlug]);


  // Set initial selected amount when variations are loaded
  useEffect(() => {
    if (amounts.length > 0 && !selectedAmount) {
      setSelectedAmount(amounts[0]);
    }
  }, [amounts, selectedAmount]);

  const [quantity, setQuantity] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const breadcrumbItems = [
    { label: generalData?.settings.homepage_label || '', href: '/' },
    { label: generalData?.settings.categories_label || '', href: '/categories' },
    { label: currentCategory, href: `/categories/${categorySlug}` },
    { label: currentSubcategory, href: `/categories/${categorySlug}/${subcategorySlug}` },
    { label: product?.name || '' }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show error state
  if (error || !selectedAmount) {
    return (
      <PageLayout className="flex flex-col min-h-screen px-0 md:px-0 py-0 bg-white">
        <div className="w-full px-4 md:px-12 pt-6 pb-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        {/*Back Button*/}
        <div className="w-full px-4 md:px-12 mb-4">
          <BackButton label={generalData?.settings.back_button_label} href={`/categories/${categorySlug}/${subcategorySlug}`} />
        </div>
        <div className="flex items-center justify-center h-64">
          <ComingSoon />
        </div>
      </PageLayout>
    );
  }

  const total = selectedAmount.price * quantity;

  const selectedProductVariation = productVariations.find((variation) => variation.id === selectedAmount?.id);

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Validate required fields based on product type
    if (product?.product_type_id === 1 && !recipientUser.trim()) {
      showError(locale === 'en' ? 'Please enter a User ID' : 'الرجاء إدخال رقم المستخدم');
      return;
    }

    if (product?.product_type_id === 3 && !recipientPhoneNumber.trim()) {
      showError(locale === 'en' ? 'Please enter a Phone Number' : 'الرجاء إدخال رقم الهاتف');
      return;
    }

    setSubmitLoading(true);
    try {
      await saveOrder({
        users_id: user.id,
        product_variation_id: selectedProductVariation?.id || 0,
        quantity: quantity,
        total_price: total,
        recipient_phone_number: recipientPhoneNumber,
        recipient_user: recipientUser,
        statuses_id: 3,
        lang: router.locale || 'en'
      });

      showSuccess(locale === 'en' ? 'Order placed successfully!' : 'تم وضع الطلب بنجاح!');
      // Deduct amount from credits store for immediate UI feedback
      const productName = selectedProductVariation?.name || product?.name || 'Product';
      deductFromBalance(total, `Purchase of ${productName} (Qty: ${quantity}) for $${total}`);
      // Refresh orders after successful placement
      refreshOrders();
      // Optional: Still refresh user data as backup
      // await refreshUserData(true);
      // Reset form fields after successful submission
      setRecipientPhoneNumber('');
      setRecipientUser('');
      setQuantity(1);
      setSubmitLoading(false);
    } catch (error) {
      showError(`${error ? error : locale === 'en' ? 'Failed to place order. Please try again.' : 'فشل وضع الطلب. الرجاء المحاولة مرة أخرى.'}`);
      console.error('Error saving order:', error);
      setSubmitLoading(false);
    }
  };

  return (
    productVariations.length > 0 ? (
      <PageLayout className="flex flex-col min-h-screen px-0 md:px-0 py-0 bg-white">
        {/* Breadcrumb */}
        <div className="w-full px-4 md:px-12 pt-6 pb-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="w-full px-4 md:px-12 mb-4">
          <BackButton label={generalData?.settings.back_button_label} href={`/categories/${categorySlug}/${subcategorySlug}`} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full px-2 md:px-12 pb-8  mx-auto">
          {/* Product Image */}
          <div className="relative h-full w-full mx-auto col-span-1 aspect-square max-h-[600px] max-w-[600px]">
            <div className="block overflow-hidden rounded-[25px] shadow-sm border border-transparent relative h-full w-full">
              <div className="relative w-full h-full">
                {selectedAmount.image ? (
                  <Image
                    src={selectedAmount.image}
                    alt={selectedAmount.amount}
                    className="w-full h-full object-cover"
                    fill
                    objectFit='cover'
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-slate-200">
                    <LogoIcon className="w-full h-full object-cover p-6" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <form onSubmit={handleBuyNow} className="w-full max-w-[400px] mx-auto flex flex-col gap-4 col-span-1">
            <h1 className="text-[32px] font-bold text-app-red leading-tight">{selectedAmount.amount}</h1>
            <p className="text-gray-700 text-[15px] mb-2 dark:text-white">{product?.description || selectedAmount.description}</p>

            {/* Amount Select */}
            <div className="mb-2">
              <label className="block text-gray-800 font-semibold mb-1">{generalData?.settings.amount}</label>
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
                  <div className="absolute left-0 right-0 mt-2 z-20 bg-white border border-app-red rounded-[12px] py-2 flex flex-col" style={{ padding: '8px 0' }}>
                    {amounts.map((amount: SelectedAmount) => (
                      <button
                        key={amount.id}
                        type="button"
                        className={`text-left px-4 py-2 text-[16px] font-roboto font-normal uppercase ${amount.id === selectedAmount.id ? 'bg-app-red/10 text-black font-bold' : 'text-black'} hover:bg-app-red/20 transition-all rounded-[8px]`}
                        onClick={() => { setSelectedAmount(amount); setDropdownOpen(false); }}
                      >
                        {amount.amount}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {product?.product_type_id !== 1 && (
              <div className="mb-2">
                <label className="block text-gray-800 font-semibold mb-1">{generalData?.settings.quantity}</label>
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
            )}

            {/* Product Type */}
            {/* If product type id is 1, add input to enter User ID */}
            {product?.product_type_id === 1 && (
              <div className="mb-2">
                <label className="block text-gray-800 font-semibold mb-1">{generalData?.settings.user_id_label}</label>
                <input
                  name="recipient_user"
                  type="text"
                  // required
                  value={recipientUser}
                  onChange={(e) => setRecipientUser(e.target.value)}
                  className="w-full border border-app-red rounded-full px-2 py-1 bg-white"
                  placeholder={generalData?.settings.user_id_placeholder}
                />
              </div>
            )}

            {/* If product type id is 3, add input to enter User phone number */}
            {product?.product_type_id === 3 && (
              <div className="mb-2">
                <label className="block text-gray-800 font-semibold mb-1">{generalData?.settings.phone_number_label}</label>
                <input
                  name="recipient_phone_number"
                  type="tel"
                  // required
                  value={recipientPhoneNumber}
                  onChange={(e) => setRecipientPhoneNumber(e.target.value)}
                  className={`w-full outline-none border border-app-red rounded-full px-2 py-1 bg-white ${locale === 'ar' ? 'rtl:text-right' : ''}`}
                  placeholder={generalData?.settings.phone_number_placeholder}
                />
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-2 mb-2">
              <span className="text-black text-lg font-bold">{generalData?.settings.total}</span>
              <span className="text-2xl font-bold text-app-red">${total.toFixed(2)}</span>
            </div>

            {/* Buy Button */}
            {
              submitLoading ?
                <div className="w-full flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]"></div>
                </div>
                :
                <button
                  type="submit"
                  className="bg-app-red text-white font-bold py-2 px-6 rounded-full w-full mt-2 transition duration-300 text-lg hover:bg-white hover:text-app-red border border-app-red"
                >
                  {generalData?.settings.buy_now_button}
                </button>
            }
          </form>
        </div>

        {/* Related Products */}
        {
          relatedProducts.length > 0 && (
            <div className="w-full px-4 md:px-12 pt-6 pb-2">
              <h2 className="text-app-red text-[20px] font-bold mb-4 mt-2">{generalData?.settings.related_products}</h2>
              <div className="grid grid-cols-4 gap-2">
                {relatedProducts.map((prod: Product, index: number) => (
                  <Card
                    key={index}
                    id={prod.id.toString()}
                    title={prod.name}
                    image={prod.full_path.image}
                    type="product"
                    href={`/categories/${categorySlug}/${subcategorySlug}/${prod.slug}`}
                  />
                ))}
              </div>
            </div>
          )}
      </PageLayout>
    ) : (
      <PageLayout className="flex flex-col min-h-screen px-0 md:px-0 py-0 bg-white">
        <ComingSoon />
      </PageLayout>
    )
  );
};

export default ProductPage; 