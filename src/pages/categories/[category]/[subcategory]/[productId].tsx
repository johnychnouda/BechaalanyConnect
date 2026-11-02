import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import BackButton from '@/components/ui/back-button';
import Breadcrumb from '@/components/ui/breadcrumb';
import PageLayout from '@/components/ui/page-layout';
import Card from '@/components/ui/card';
import ImageWithFallback from '@/components/ui/image-with-fallback';
import { fetchProductDetails, saveOrder } from '@/services/api.service';
import ComingSoon from '@/components/ui/coming-soon';
import { useAuth } from '@/context/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { useGlobalContext } from "@/context/GlobalContext";
import { useCreditOperations } from "@/services/credits.service";
import SeoHead from "@/components/ui/SeoHead";
import PendingApprovalModal from "@/components/ui/pending-approval-modal";
import ConfirmPurchaseModal from "@/components/ui/confirm-purchase-modal";
import { PRODUCT_TYPE_USER_ID, PRODUCT_TYPE_PHONE, PRODUCT_TYPE_COIN, PRODUCT_TYPE_SOCIAL } from "@/constants/productTypes";
import { toMessage, insufficientCreditsMessage } from "@/utils/error-message";
import { useCreditsStore } from "@/store/credits.store";
import { Button } from "@/components/ui/primitives/Button";
import { FormField } from "@/components/ui/primitives/FormField";
import { Input } from "@/components/ui/primitives/Input";
import { ErrorState } from "@/components/ui/primitives/ErrorState";
import { Skeleton, SkeletonText } from "@/components/ui/primitives/Skeleton";

interface ProductVariation {
  id: number;
  name: string;
  description: string;
  full_path: {
    image: string | null;
  }
  price: number;
  product_id: number;
  is_active: number;
  quantity: number | null;
  unit_amount: number | null;
  unit_label: string | null;
  // What the supplier will actually sell in one order. Some suppliers have no
  // quantity parameter at all (usharez quota allocates exactly one bundle), so
  // {min:1,max:1} means "the stepper is a lie" — see maxQty below.
  external_qty_values: { min?: number; max?: number } | null;
  // Smallest / largest quantity the backend accepts (real coins for Coin Recharge
  // products) — the admin's minimum, the supplier's bounds and our own cap.
  // saveOrder refuses anything outside them.
  min_order_quantity?: number;
  max_order_quantity?: number;
  // Social Media Services (1xpanel): what the supplier publishes about the
  // service, refreshed by every catalog sync. null for every other product.
  external_details?: ServiceDetails | null;
  price_variations: PriceVariation[];
}

interface ServiceDetails {
  quality?: string | null;
  speed?: string | null;
  refill?: string | null;
  link?: string | null;
  start_time?: string | null;
  drop?: string | null;
  average_time?: string | null;
  notes?: string[];
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
    image: string | null;
  }
  related_products: Product[];
  product_type_id: number;
}

// Type for the selected amount/variation
interface SelectedAmount {
  id: number;
  amount: string;
  price: number;
  image: string | null;
  description: string;
  unitAmount: number | null;
  unitLabel: string | null;
  // Highest quantity the supplier accepts in one order, or null when unbounded.
  // 1 pins the purchase to a single unit and hides the quantity stepper.
  maxQty: number | null;
  // Lowest quantity (coins for Coin Recharge) one order may hold; 1 when unbounded.
  minQty: number;
  details: ServiceDetails | null;
}

const ProductPage: React.FC = () => {
  const router = useRouter();
  const { deductFromBalance } = useCreditOperations();
  const creditsBalance = useCreditsStore((state) => state.balance);
  const { user, isApproved, refreshUserData, balanceStatus } = useAuth();
  const [showPendingModal, setShowPendingModal] = useState(false);
  const { refreshOrders, generalData } = useGlobalContext();
  const { locale } = useRouter();
  const { category: categorySlug, subcategory: subcategorySlug, productId: productSlug, single } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  // Set when the API refuses an order for lack of credits, so the shortfall stays on
  // screen with an "Add credits" link rather than vanishing with the toast.
  const [creditShortfall, setCreditShortfall] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentSubcategory, setCurrentSubcategory] = useState<string>('');
  // Subcategory hidden as a storefront level: its products live on the
  // category page, so the breadcrumb and back button skip it.
  const [subcategoryHidden, setSubcategoryHidden] = useState<boolean>(false);
  const [product, setProduct] = useState<Product>();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<SelectedAmount | null>(null);
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
  const [recipientUser, setRecipientUser] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ user?: string; phone?: string }>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  // The signed-in user's price tier, or null. Matched against product_price_variations
  // below: an admin can set a different price per user type, and the API ships the whole
  // table on every variation for the client to pick from.
  //
  // This reads the flat `user_types_id`, NOT `user_types.id`. The nested relation is only
  // present when /user/profile eager-loads it; when that load was dropped for performance
  // the match silently stopped hitting and every tier user saw the default price while
  // still being charged the tier price by OrderController.
  const userTypeId = user?.user_types_id ?? null;

  // Convert a product variation to the amounts format (localized fields)
  const toAmount = useCallback(
    (variation: ProductVariation, index: number): SelectedAmount => ({
      id: variation.id || index,
      amount: variation.name,
      // products_variations.price (and product_price_variations.price) are MySQL
      // DECIMAL columns with no ->decimal()/->float() cast on the backend models, so
      // the API serialises them as JSON strings ("5.99"), not numbers, even though
      // SelectedAmount.price is typed `number`. Uncoerced, this reached
      // selectedAmount.price.toFixed() below and crashed the page for any variation
      // whose displayed unit price (Coin Recharge products) rendered that line.
      price: Number(
        (userTypeId === null
          ? undefined
          : variation.price_variations?.find(
              (price) => Number(price.user_types_id) === Number(userTypeId)
            )?.price)
          ?? variation.price
      ) || 0,
      image: variation.full_path?.image,
      description: variation.description,
      unitAmount: variation.unit_amount,
      unitLabel: variation.unit_label,
      maxQty: variation.max_order_quantity ?? variation.external_qty_values?.max ?? null,
      minQty: Math.max(1, Number(variation.min_order_quantity) || 1),
      details: variation.external_details ?? null,
    }),
    [userTypeId]
  );

  const amounts: SelectedAmount[] = productVariations.map(toAmount);


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
          setSubcategoryHidden(Boolean(data.show_products_in_category));
        }
        else {
          console.error('Products data is invalid:', data);
          setProductVariations([]);
          setRelatedProducts([]);
          setCurrentCategory('');
          setCurrentSubcategory('');
          setError(locale === 'ar' ? 'تعذر تحميل بيانات المنتج.' : 'We could not load this product.');
        }
      })
      .catch((error) => {
        console.error('Error fetching Products:', error);
        setProductVariations([]);
        setRelatedProducts([]);
        setCurrentCategory('');
        setCurrentSubcategory('');
        setError(toMessage(error, locale));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router.locale, categorySlug, subcategorySlug, productSlug]);


  // Keep the selected variation in sync with freshly fetched data (e.g. after a
  // language switch), preserving the chosen variation by id but refreshing its
  // localized fields (name, description, price). Falls back to the first variation.
  useEffect(() => {
    if (productVariations.length === 0) {
      setSelectedAmount(null);
      return;
    }
    const list = productVariations.map(toAmount);
    setSelectedAmount((prev) => (prev ? list.find((a) => a.id === prev.id) ?? list[0] : list[0]));
  }, [productVariations, toAmount]);

  const [quantity, setQuantity] = useState(1);
  // Coin Recharge: what the customer is typing in the coin field (digits only,
  // may be empty mid-edit). `quantity` holds the parsed coin count.
  const [coinInput, setCoinInput] = useState('');

  // Some variations are sold one at a time — the supplier's purchase endpoint has
  // no quantity parameter (usharez allocates exactly one quota bundle), so an order
  // for 2 is accepted and charged here, rejected upstream, then auto-refunded. Reset
  // to 1 whenever such a variation is selected; the stepper is hidden for it below.
  // Variations with a minimum (Jawaker sells from 10,000 coins) start at it, so the
  // first price shown is one the backend will accept.
  // Kept above the early returns so the hook order never changes.
  const selectedId = selectedAmount?.id;
  const selectedMaxQty = selectedAmount?.maxQty;
  const selectedMinQty = selectedAmount?.minQty ?? 1;
  useEffect(() => {
    if (selectedId === undefined) return;
    const start = selectedMaxQty === 1 ? 1 : selectedMinQty;
    setQuantity(start);
    setCoinInput(String(start));
  }, [selectedId, selectedMaxQty, selectedMinQty]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // `role="listbox"` with no keyboard support is worse than a native
  // <select> — this was mouse-only. Escape closes and returns focus to the
  // trigger; ArrowUp/ArrowDown move between options; the first option is
  // focused automatically when the list opens (e.g. via ArrowDown on the
  // trigger, handled in its own onKeyDown below).
  useEffect(() => {
    if (!dropdownOpen) return;

    const options = () =>
      Array.from(dropdownRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);

    const focusFirst = () => options()[0]?.focus();
    focusFirst();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDropdownOpen(false);
        dropdownTriggerRef.current?.focus();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

      event.preventDefault();
      const list = options();
      if (list.length === 0) return;
      const currentIndex = list.indexOf(document.activeElement as HTMLButtonElement);
      const nextIndex =
        event.key === 'ArrowDown'
          ? (currentIndex + 1) % list.length
          : (currentIndex - 1 + list.length) % list.length;
      list[nextIndex]?.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  const breadcrumbItems = [
    { label: generalData?.settings.homepage_label || '', href: '/' },
    { label: generalData?.settings.categories_label || '', href: '/categories' },
    { label: currentCategory, href: `/categories/${categorySlug}` },
    ...(subcategoryHidden ? [] : [
      { label: currentSubcategory, href: single ? `/categories/${categorySlug}` : `/categories/${categorySlug}/${subcategorySlug}` },
    ]),
    { label: product?.name || '' }
  ];

  // Show loading state.
  //
  // This used to render a 4-up grid of CATEGORY-card skeletons — no
  // breadcrumb, no back button, no image placeholder, no form shape. Nothing
  // about it resembled the page that followed, so the whole viewport
  // reflowed the instant data arrived. This shape mirrors the real layout
  // below (image | form panel) so nothing jumps.
  if (isLoading) {
    return (
      <PageLayout className="flex flex-col min-h-screen px-0 md:px-0 py-0 bg-white dark:bg-background-dark">
        <div className="w-full max-w-7xl mx-auto">
          <div className="w-full px-4 md:px-12 pt-6 pb-2">
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="w-full px-4 md:px-12 mb-4">
            <Skeleton className="h-9 w-28" rounded="rounded-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full px-4 md:px-12 pb-8">
            <Skeleton className="w-full aspect-square max-h-[600px] max-w-[600px] mx-auto" rounded="rounded-[25px]" />
            <div className="w-full flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
              <Skeleton className="h-8 w-3/4" />
              <SkeletonText lines={2} />
              <Skeleton className="h-11 w-full" rounded="rounded-full" />
              <Skeleton className="h-11 w-full" rounded="rounded-full" />
              <Skeleton className="h-16 w-full" rounded="rounded-xl" />
              <Skeleton className="h-12 w-full" rounded="rounded-full" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  /*
   * A genuine fetch failure and "this product has no variations yet" are different
   * things and must not look the same.
   *
   * Both used to render <ComingSoon />, so whenever the API was unreachable the
   * customer was told the product was an upcoming release — with no error, no retry,
   * and no hint that anything was wrong.
   */
  if (error) {
    return (
      <PageLayout className="flex flex-col min-h-screen px-0 md:px-0 py-0 bg-white dark:bg-background-dark">
        <div className="w-full px-4 md:px-12 pt-6 pb-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="w-full px-4 md:px-12 mb-4">
          <BackButton label={generalData?.settings.back_button_label} href={single || subcategoryHidden ? `/categories/${categorySlug}` : `/categories/${categorySlug}/${subcategorySlug}`} />
        </div>
        <ErrorState
          message={error}
          onRetry={() => router.reload()}
          retryLabel={locale === 'en' ? 'Try again' : 'إعادة المحاولة'}
          className="h-64"
        />
      </PageLayout>
    );
  }

  // No error, but nothing to sell — this is the real "Coming Soon" case.
  if (!selectedAmount) {
    return (
      <PageLayout className="flex flex-col min-h-screen px-0 md:px-0 py-0 bg-white dark:bg-background-dark">
        <div className="w-full px-4 md:px-12 pt-6 pb-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        {/*Back Button*/}
        <div className="w-full px-4 md:px-12 mb-4">
          <BackButton label={generalData?.settings.back_button_label} href={single || subcategoryHidden ? `/categories/${categorySlug}` : `/categories/${categorySlug}/${subcategorySlug}`} />
        </div>
        <div className="flex items-center justify-center h-64">
          <ComingSoon />
        </div>
      </PageLayout>
    );
  }

  // Coin Recharge products: the customer types the real number of coins
  // (`quantity`). `price` is the price of `unitAmount` coins (e.g. $0.13 per 1,000),
  // so the total is prorated and rounded UP to the cent — the exact formula
  // ProductsVariation::coinTotal() charges server-side.
  const isCoin = product?.product_type_id === PRODUCT_TYPE_COIN;
  // Social Media Services (1xpanel) use the same engine: `price` is per
  // `unitAmount` (1,000) followers/views/…, the customer types the real quantity,
  // and the link they want it delivered to — like the panel's own order form.
  const isSocial = product?.product_type_id === PRODUCT_TYPE_SOCIAL;
  const isProrated = isCoin || isSocial;
  const pricingUnit = selectedAmount.unitAmount && selectedAmount.unitAmount > 0 ? selectedAmount.unitAmount : 1;
  // Supplier sells this one unit at a time — no stepper, and the order is pinned
  // to 1 regardless of any stale quantity state.
  const qtyLocked = !isProrated && selectedAmount.maxQty === 1;
  const total = isProrated
    ? Math.ceil(Number(((selectedAmount.price * quantity) / pricingUnit * 100).toFixed(6))) / 100
    : selectedAmount.price * quantity;
  const coinUnitLabel = isSocial ? '' : selectedAmount.unitLabel || (locale === 'ar' ? 'كوينز' : 'Coins');
  const withUnit = (n: number) => `${fmt(n)} ${coinUnitLabel}`.trim();
  const fmt = (n: number) => n.toLocaleString('en-US');
  // Shown live under the coin field and blocks Buy — nothing is silently clamped.
  const coinError = !isProrated
    ? undefined
    : coinInput === '' || quantity < 1
      ? (isSocial
          ? (locale === 'ar' ? 'أدخل الكمية' : 'Enter a quantity')
          : (locale === 'ar' ? 'أدخل عدد الكوينز' : 'Enter an amount'))
      : quantity < selectedAmount.minQty
        ? `${locale === 'ar' ? 'الحد الأدنى' : 'Minimum'} ${withUnit(selectedAmount.minQty)}`
        : selectedAmount.maxQty != null && quantity > selectedAmount.maxQty
          ? `${locale === 'ar' ? 'الحد الأقصى' : 'Maximum'} ${withUnit(selectedAmount.maxQty)}`
          : undefined;
  // "$2.90 per 1,000" — how the panel itself quotes these services.
  const socialRate = `$${selectedAmount.price.toFixed(2)} ${locale === 'ar' ? 'لكل' : 'per'} ${fmt(pricingUnit)}`;
  const details = isSocial ? selectedAmount.details : null;
  // "Username Link", "Post Link", … from the supplier's description; the field
  // the order is delivered to (recipient_user).
  const linkLabel = locale === 'ar' ? 'الرابط' : 'Link';
  const linkHint = details?.link && !/check description/i.test(details.link) ? details.link : null;

  // Live balance from the credits store, so the check reflects any top-up approved
  // while this page was open.
  const currentBalance = creditsBalance;
  // Only meaningful once the account is verified — unverified users are blocked
  // earlier and see blurred prices anyway.
  //
  // Gated on balanceStatus === 'known': the store's balance starts at 0 before
  // /user/profile has ever resolved, so treating an unresolved fetch the same as
  // a real balance produced a false "insufficient credits" lockout on every cold
  // page load — and a permanent one if the fetch failed outright (React Query's
  // retry: 1 gives up, and nothing ever set the balance after that).
  const cannotAfford = Boolean(user) && balanceStatus === 'known' && currentBalance < total;
  const balanceCheckFailed = Boolean(user) && balanceStatus === 'error';
  const coinAmount = isProrated ? quantity : 0;

  const selectedProductVariation = productVariations.find((variation) => variation.id === selectedAmount?.id);

  // The selected variation's description is rich HTML (CMS rich-textbox) and may be
  // empty (e.g. "<p></p>" / "&nbsp;"); only render the section when it has real content.
  const variationDescriptionHtml = selectedAmount?.description ?? '';
  const hasVariationDescription =
    variationDescriptionHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, '').trim().length > 0;

  // Was one function that validated and immediately called saveOrder — a
  // single click spent credits against a hand-typed phone number or user ID
  // with nothing shown back to check first, and a typo was unrecoverable.
  // Split in two: this validates and opens ConfirmPurchaseModal; submitOrder
  // (below) is what the modal's Confirm button actually calls.
  const handleBuyNow = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      // Carry the current page so signing in returns the customer to the product
      // they were buying instead of dumping them on the homepage.
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Users must be identity-verified (KYC) before placing orders. The panel
    // already shows a visible notice (and disables this button) when
    // `user && !isApproved` — see the "Verification" block below — so
    // reaching this branch at all means the pending-approval case; an
    // unsubmitted/rejected user is routed to /account-verification before
    // they can even focus the button.
    if (!isApproved) {
      if (user.verification_status === 'pending') {
        setShowPendingModal(true);
      } else {
        router.push('/account-verification');
      }
      return;
    }

    // Validate required fields based on product type. Used to be a toast on
    // submit with no indication of which field was wrong until it fired;
    // these are now inline errors on the field itself.
    if (coinError) return;

    const errors: { user?: string; phone?: string } = {};
    if ((product?.product_type_id === PRODUCT_TYPE_USER_ID || isProrated) && !recipientUser.trim()) {
      errors.user = isSocial
        ? (locale === 'en' ? 'Please enter a link' : 'الرجاء إدخال الرابط')
        : (locale === 'en' ? 'Please enter a User ID' : 'الرجاء إدخال رقم المستخدم');
    }
    if (product?.product_type_id === PRODUCT_TYPE_PHONE && !recipientPhoneNumber.trim()) {
      errors.phone = locale === 'en' ? 'Please enter a Phone Number' : 'الرجاء إدخال رقم الهاتف';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setShowConfirmModal(true);
  };

  const submitOrder = async () => {
    setSubmitLoading(true);
    try {
      const placedOrder = await saveOrder(router.locale || 'en', {
        product_variation_id: selectedProductVariation?.id || 0,
        quantity: qtyLocked ? 1 : quantity,
        recipient_phone_number: recipientPhoneNumber,
        recipient_user: recipientUser,
      });

      showSuccess(locale === 'en' ? 'Order placed successfully!' : 'تم وضع الطلب بنجاح!');
      // Deduct amount from credits store for immediate UI feedback
      const productName = selectedProductVariation?.name || product?.name || 'Product';
      const orderDetail = isProrated
        ? `${coinAmount.toLocaleString(locale)} ${isCoin ? selectedAmount.unitLabel || '' : ''}`.trim()
        : `Qty: ${quantity}`;
      deductFromBalance(total, `Purchase of ${productName} (${orderDetail}) for $${total}`);
      // Refresh orders after successful placement
      refreshOrders();
      // Reset form fields after successful submission
      setRecipientPhoneNumber('');
      setRecipientUser('');
      setQuantity(selectedAmount.minQty);
      setCoinInput(String(selectedAmount.minQty));
      setSubmitLoading(false);
      setShowConfirmModal(false);

      // A toast used to be the ONLY confirmation: no order number, no summary, and no
      // way to reach the order — and refreshOrders() does nothing unless My Orders
      // happens to be mounted. saveOrder returns the created row (OrderController
      // responds with the full Order), so route straight to its status page rather
      // than the full list; that page polls this one order while it is pending.
      if (placedOrder?.id) {
        router.push(`/account-dashboard/my-orders/${placedOrder.id}`);
      } else {
        router.push('/account-dashboard/my-orders');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      setSubmitLoading(false);
      // Close the modal so the (still on-screen, page-level) error state below
      // is visible instead of stacking a toast behind the modal backdrop.
      setShowConfirmModal(false);

      // Insufficient credits gets its own message with the exact shortfall and a way
      // to act on it. Previously this whole branch rendered the raw rejection value,
      // which printed "[object Object]" on any network error.
      const shortfall = insufficientCreditsMessage(error, locale);

      if (shortfall) {
        setCreditShortfall(shortfall);
        showError(shortfall);
        return;
      }

      showError(toMessage(error, locale));
    }
  };

  return (
    productVariations.length > 0 ? (
      <PageLayout className="flex flex-col min-h-screen px-0 md:px-0 py-0 bg-white dark:bg-background-dark pb-24 lg:pb-0">
        <SeoHead seo={{
        title: `${currentSubcategory || subcategorySlug} ${selectedAmount.amount} - Bechaalany Connect`,
        description: `Browse product ${currentSubcategory || subcategorySlug} ${selectedAmount.amount}`,
        og: {
          title: `${currentSubcategory || subcategorySlug} ${selectedAmount.amount} - Bechaalany Connect`,
          description: `Browse product ${currentSubcategory || subcategorySlug} ${selectedAmount.amount}`,
          image: generalData?.settings?.full_path?.logo || undefined,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/categories/${categorySlug}/${subcategorySlug}/${productSlug}`,
          type: 'website',
        },
        canonical_url: `${process.env.NEXT_PUBLIC_SITE_URL}/categories/${categorySlug}/${subcategorySlug}/${productSlug}`,
        meta_robots: 'index, follow',
        keywords: `${currentSubcategory || subcategorySlug} ${selectedAmount.amount} - ${currentCategory || categorySlug} - Bechaalany Connect`,
      }} />
        <div className="w-full max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="w-full px-4 md:px-12 pt-6 pb-2">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className="w-full px-4 md:px-12 mb-4">
            <BackButton label={generalData?.settings.back_button_label} href={single || subcategoryHidden ? `/categories/${categorySlug}` : `/categories/${categorySlug}/${subcategorySlug}`} />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full px-4 md:px-12 pb-8">
            {/* Product Image */}
            <div className="w-full lg:sticky lg:top-24 self-start">
              <div className="relative w-full mx-auto aspect-square max-h-[600px] max-w-[600px]">
                <div className="block overflow-hidden rounded-[25px] shadow-sm border border-transparent relative h-full w-full">
                  <ImageWithFallback
                    src={selectedAmount.image}
                    alt={selectedAmount.amount}
                    className="object-cover"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                  />
                </div>
              </div>
            </div>

            {/* Purchase Panel */}
            <form
              id="purchase-form"
              onSubmit={handleBuyNow}
              className="w-full flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 sm:p-6 bg-white dark:bg-background-dark"
            >
              <div>
                {/* The visible heading below is the selected *variation*'s
                    name/amount (e.g. a specific top-up size) — that's the
                    right thing to show prominently here, but it meant the
                    product's own name never appeared as a heading anywhere
                    on the page. A visually-hidden real <h1> carries that
                    without changing what's shown. */}
                {product?.name && <h1 className="sr-only">{product.name}</h1>}
                <div className="text-[28px] sm:text-[32px] font-bold text-app-red leading-tight" role="heading" aria-level={2}>{selectedAmount.amount}</div>
                {product?.description && (
                  <p className="text-gray-700 text-[15px] mt-2 dark:text-white">{product.description}</p>
                )}
              </div>

              {/* Amount Select — hidden for Coin Recharge (single per-block rate) */}
              {!isCoin && (
              <div>
                <label htmlFor="amount-trigger" className="block text-gray-800 dark:text-white font-semibold mb-1">{isSocial ? (locale === 'ar' ? 'الخدمة' : 'Service') : generalData?.settings.amount}</label>
                <div ref={dropdownRef} className="relative w-full">
                  <button
                    id="amount-trigger"
                    ref={dropdownTriggerRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={dropdownOpen}
                    className={`w-full flex justify-between items-center box-border bg-white dark:bg-background-dark border border-app-red rounded-full px-4 py-2.5 text-[16px] font-normal uppercase text-app-red transition-all duration-200 cursor-pointer ${dropdownOpen ? 'ring-2 ring-app-red' : ''} group`}
                    onClick={() => setDropdownOpen((open) => !open)}
                    onKeyDown={(e) => {
                      if (!dropdownOpen && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setDropdownOpen(true);
                      }
                    }}
                  >
                    <span className="text-black dark:text-white">{selectedAmount.amount}</span>
                    <span className="ml-2 rtl:ml-0 rtl:mr-2 flex items-center">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transition-transform duration-200 text-gray-500 group-hover:text-app-red ${dropdownOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M6 9L11 14L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                  {dropdownOpen && (
                    <div role="listbox" aria-label={generalData?.settings.amount} className="absolute left-0 right-0 mt-2 z-20 bg-white dark:bg-background-dark border border-app-red rounded-[12px] py-2 flex flex-col max-h-60 overflow-y-auto">
                      {amounts.map((amount: SelectedAmount) => (
                        <button
                          key={amount.id}
                          type="button"
                          role="option"
                          aria-selected={amount.id === selectedAmount.id}
                          className={`text-start px-4 py-2 text-[16px] font-normal uppercase cursor-pointer ${amount.id === selectedAmount.id ? 'bg-app-red/10 text-black dark:text-white font-bold' : 'text-black dark:text-white'} hover:bg-app-red/20 transition-all rounded-[8px]`}
                          onClick={() => { setSelectedAmount(amount); setDropdownOpen(false); dropdownTriggerRef.current?.focus(); }}
                        >
                          {amount.amount}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Social Media Service details — what the supplier publishes for the
                  selected service (Quality, Speed, Refill, …), like the description
                  box on the panel's own order form. An admin-written variation
                  description replaces the supplier's notes. */}
              {details && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                    {([
                      [locale === 'ar' ? 'الجودة' : 'Quality', details.quality],
                      [locale === 'ar' ? 'السرعة' : 'Speed', details.speed],
                      [locale === 'ar' ? 'الضمان' : 'Guarantee', details.refill],
                      [locale === 'ar' ? 'وقت البدء' : 'Start time', details.start_time],
                      [locale === 'ar' ? 'الثبات' : 'Drop', details.drop],
                      [linkLabel, linkHint],
                    ] as const)
                      .filter(([, value]) => Boolean(value))
                      .map(([label, value]) => (
                        <React.Fragment key={label}>
                          <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                          <dd className="text-gray-800 dark:text-white font-medium">{value}</dd>
                        </React.Fragment>
                      ))}
                  </dl>
                  {!hasVariationDescription && (details.notes?.length ?? 0) > 0 && (
                    <ul className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-1 text-gray-600 dark:text-gray-300">
                      {details.notes!.map((note, i) => <li key={i}>{note}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {/* Link — Social Media Services are delivered to a post/profile link,
                  asked for before the quantity as on the panel's order form. */}
              {isSocial && (
                <FormField
                  label={linkHint ? `${linkLabel} (${linkHint})` : linkLabel}
                  error={fieldErrors.user}
                >
                  <Input
                    id="recipient_user"
                    name="recipient_user"
                    type="text"
                    inputMode="url"
                    autoComplete="off"
                    dir="ltr"
                    value={recipientUser}
                    onChange={(e) => {
                      setRecipientUser(e.target.value);
                      if (fieldErrors.user) setFieldErrors((prev) => ({ ...prev, user: undefined }));
                    }}
                    placeholder="https://"
                  />
                </FormField>
              )}

              {/* Typed amount — Coin Recharge (coins) and Social Media Services
                  (followers, views, …): the customer types the real number (no
                  blocks, no multiples), within the min/max. */}
              {isProrated && (
                <FormField
                  label={
                    isSocial
                      ? generalData?.settings.quantity
                      : `${locale === 'ar' ? 'مبلغ مخصص' : 'Custom Amount'} (${coinUnitLabel})`
                  }
                  error={coinError}
                  hint={[
                    isSocial ? socialRate : `${fmt(pricingUnit)} ${coinUnitLabel} = $${selectedAmount.price.toFixed(2)}`,
                    selectedAmount.minQty > 1 ? `${locale === 'ar' ? 'الحد الأدنى' : 'Min'} ${fmt(selectedAmount.minQty)}` : null,
                    selectedAmount.maxQty != null ? `${locale === 'ar' ? 'الحد الأقصى' : 'Max'} ${fmt(selectedAmount.maxQty)}` : null,
                  ].filter(Boolean).join(' · ')}
                >
                  <Input
                    id="coin_amount"
                    name="coin_amount"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    invalid={Boolean(coinError)}
                    // Always grouped (10,000). Swapping to raw digits on focus changed the
                    // value under the cursor and dropped a select-all, so retyping the
                    // amount appended to it instead of replacing it.
                    value={coinInput === '' ? '' : fmt(Number(coinInput))}
                    placeholder={[
                      selectedAmount.minQty > 1 ? `${locale === 'ar' ? 'الحد الأدنى' : 'Min'} ${fmt(selectedAmount.minQty)}` : null,
                      isSocial && selectedAmount.maxQty != null ? `${locale === 'ar' ? 'الحد الأقصى' : 'Max'} ${fmt(selectedAmount.maxQty)}` : null,
                    ].filter(Boolean).join(' – ') || undefined}
                    onChange={(e) => {
                      // Accept Arabic-Indic digits too; drop separators and anything else.
                      const digits = e.target.value
                        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
                        .replace(/\D/g, '')
                        .replace(/^0+(?=\d)/, '')
                        .slice(0, 9);
                      setCoinInput(digits);
                      setQuantity(digits === '' ? 0 : parseInt(digits, 10));
                    }}
                  />
                </FormField>
              )}

              {/* Average time — the supplier's average completion time over its
                  latest orders, read-only as on the panel's order form. */}
              {isSocial && (
                <FormField
                  label={locale === 'ar' ? 'متوسط وقت التنفيذ' : 'Average time'}
                  hint={locale === 'ar'
                    ? 'يُحسب من أوقات إتمام آخر الطلبات.'
                    : 'Calculated from the completion times of the latest orders.'}
                >
                  <Input
                    id="average_time"
                    type="text"
                    // The supplier's text is English ("2 hours 24 minutes"); laid
                    // out RTL its numbers jump to the wrong end.
                    dir={details?.average_time ? 'ltr' : undefined}
                    readOnly
                    tabIndex={-1}
                    value={details?.average_time || (locale === 'ar' ? 'غير متوفر بعد' : 'Not enough data yet')}
                  />
                </FormField>
              )}

              {/* Quantity Selector — not shown for User ID or prorated (Coin Recharge /
                  Social Media) products, nor for variations the supplier only sells one of */}
              {product?.product_type_id !== PRODUCT_TYPE_USER_ID && !isProrated && !qtyLocked && (
                <div>
                  <span className="block text-gray-800 dark:text-white font-semibold mb-1">{generalData?.settings.quantity}</span>
                  <div role="group" aria-label={generalData?.settings.quantity} className="flex items-center border border-app-red rounded-full px-2 py-1 w-full bg-white dark:bg-background-dark justify-between min-w-[160px]">
                    <button
                      aria-label={locale === 'ar' ? 'إنقاص الكمية' : 'Decrease quantity'}
                      className="w-9 h-9 flex items-center justify-center rounded-full border-none text-2xl text-black dark:text-white font-normal cursor-pointer transition-colors duration-150 hover:bg-app-red/10 p-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => setQuantity(q => Math.max(selectedAmount.minQty, q - 1))}
                      disabled={quantity <= selectedAmount.minQty}
                      type="button"
                    >-</button>
                    {/* A read-only span used to sit here — reaching quantity 50
                        took 49 clicks on the + button, with no ceiling even
                        when the variation's maxQty was lower. Direct entry
                        plus a real clamp fixes both. */}
                    <input
                      type="number"
                      inputMode="numeric"
                      min={selectedAmount.minQty}
                      max={selectedAmount.maxQty ?? undefined}
                      value={quantity}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        if (!Number.isFinite(parsed)) return;
                        setQuantity(Math.min(selectedAmount.maxQty ?? Infinity, Math.max(selectedAmount.minQty, parsed)));
                      }}
                      aria-label={generalData?.settings.quantity}
                      className="text-lg font-semibold w-12 text-center bg-transparent text-black dark:text-white select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      aria-label={locale === 'ar' ? 'زيادة الكمية' : 'Increase quantity'}
                      className="w-9 h-9 flex items-center justify-center rounded-full border-none text-2xl text-black dark:text-white font-normal cursor-pointer transition-colors duration-150 hover:bg-app-red/10 p-0"
                      onClick={() => setQuantity(q => Math.min(selectedAmount.maxQty ?? Infinity, q + 1))}
                      disabled={selectedAmount.maxQty != null && quantity >= selectedAmount.maxQty}
                      type="button"
                    >+</button>
                  </div>
                </div>
              )}

              {/* Minimum hint for non-coin variations — shown even where the stepper is
                  hidden (User ID products), since the order is then placed at the minimum. */}
              {!isProrated && !qtyLocked && selectedAmount.minQty > 1 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                  {`${locale === 'ar' ? 'الحد الأدنى للكمية:' : 'Minimum quantity:'} ${selectedAmount.minQty.toLocaleString(locale)}`}
                </p>
              )}

              {/* Product Type */}
              {/* User ID input — required for Direct Recharge and Coin Recharge products.
                  Was a toast-on-submit; validation now surfaces inline via
                  FormField, which also wires aria-invalid/aria-describedby —
                  neither existed on any recipient field before. */}
              {(product?.product_type_id === PRODUCT_TYPE_USER_ID || isCoin) && (
                <FormField label={generalData?.settings.user_id_label} error={fieldErrors.user}>
                  <Input
                    id="recipient_user"
                    name="recipient_user"
                    type="text"
                    value={recipientUser}
                    onChange={(e) => {
                      setRecipientUser(e.target.value);
                      if (fieldErrors.user) setFieldErrors((prev) => ({ ...prev, user: undefined }));
                    }}
                    placeholder={generalData?.settings.user_id_placeholder}
                  />
                </FormField>
              )}

              {/* Phone number input — Telecommunication Charge products */}
              {product?.product_type_id === PRODUCT_TYPE_PHONE && (
                <FormField label={generalData?.settings.phone_number_label} error={fieldErrors.phone}>
                  <Input
                    id="recipient_phone_number"
                    name="recipient_phone_number"
                    type="tel"
                    value={recipientPhoneNumber}
                    onChange={(e) => {
                      setRecipientPhoneNumber(e.target.value);
                      if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    className="text-start"
                    placeholder={generalData?.settings.phone_number_placeholder}
                  />
                </FormField>
              )}

              {/* Total — blurred until the account's identity is verified */}
              <div className="flex justify-between items-center bg-app-red/5 rounded-xl px-4 py-3 mt-1">
                <span className="text-black dark:text-white text-base font-semibold">{generalData?.settings.total}</span>
                <span className={`text-2xl font-extrabold text-app-red ${user && !isApproved ? 'filter blur-[6px] select-none' : ''}`}>${total.toFixed(2)}</span>
              </div>

              {/*
                Insufficient-credits warning, shown BEFORE the user tries to buy.

                creditsService.hasSufficientBalance() has existed since the credits
                feature was written and was never called anywhere, so the only feedback
                was a red toast after a rejected request — English-only, with no balance,
                no shortfall and no route to topping up.
              */}
              {isApproved && cannotAfford && (
                <div className="rounded-xl border border-app-red/40 bg-app-red/5 px-4 py-3 text-sm">
                  <p className="text-app-red font-semibold mb-1">
                    {locale === 'en'
                      ? `Not enough credits — you need $${(total - currentBalance).toFixed(2)} more.`
                      : `رصيدك غير كافٍ — تحتاج إلى ${(total - currentBalance).toFixed(2)}$ إضافية.`}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {locale === 'en'
                      ? `Your balance: $${currentBalance.toFixed(2)}`
                      : `رصيدك: ${currentBalance.toFixed(2)}$`}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/account-dashboard/add-credits')}
                    className="underline font-semibold text-app-red"
                  >
                    {locale === 'en' ? 'Add credits' : 'إضافة رصيد'}
                  </button>
                </div>
              )}

              {/* Balance couldn't be checked (profile fetch failed) — do not block
                  the purchase on it; the server re-checks the real balance under a
                  row lock when the order is submitted regardless. */}
              {isApproved && balanceCheckFailed && (
                <div className="rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">
                    {locale === 'en'
                      ? "We couldn't check your balance. You can still try to buy — we'll verify your balance when you submit."
                      : 'تعذر التحقق من رصيدك. يمكنك المحاولة على أي حال — سنتحقق من رصيدك عند الإرسال.'}
                  </p>
                </div>
              )}

              {/* Server-side rejection, kept on screen after the toast fades. */}
              {creditShortfall && !cannotAfford && (
                <div className="rounded-xl border border-app-red/40 bg-app-red/5 px-4 py-3 text-sm">
                  <p className="text-app-red font-semibold mb-2">{creditShortfall}</p>
                  <button
                    type="button"
                    onClick={() => router.push('/account-dashboard/add-credits')}
                    className="underline font-semibold text-app-red"
                  >
                    {locale === 'en' ? 'Add credits' : 'إضافة رصيد'}
                  </button>
                </div>
              )}

              {/*
                Verification gate, shown BEFORE the click rather than only after.
                Prices were already blurred for an unapproved user, but the CTA
                stayed enabled — clicking it was the only way to discover you
                needed to verify first (PendingApprovalModal / a redirect).
              */}
              {user && !isApproved && (
                <div className="rounded-xl border border-app-red/40 bg-app-red/5 px-4 py-3 text-sm">
                  <p className="text-app-red font-semibold">
                    {user.verification_status === 'pending'
                      ? (locale === 'en'
                          ? 'Your account is pending verification. You can browse, but purchases are locked until it is approved.'
                          : 'حسابك قيد التحقق. يمكنك التصفح، لكن الشراء مقفل حتى تتم الموافقة.')
                      : (locale === 'en'
                          ? 'Verify your identity to unlock purchases.'
                          : 'تحقق من هويتك لفتح إمكانية الشراء.')}
                  </p>
                  {user.verification_status !== 'pending' && (
                    <button
                      type="button"
                      onClick={() => router.push('/account-verification')}
                      className="underline font-semibold text-app-red mt-1"
                    >
                      {locale === 'en' ? 'Verify now' : 'تحقق الآن'}
                    </button>
                  )}
                </div>
              )}

              {/* Buy Button.
                  `loading` keeps the button's own width and label in place
                  (as `invisible`, not removed) instead of swapping the whole
                  CTA for a bare spinner — that used to make the button vanish
                  and reflow the page on submit. */}
              <Button
                type="submit"
                disabled={(isApproved && cannotAfford) || Boolean(coinError)}
                loading={submitLoading}
                size="lg"
                fullWidth
              >
                {generalData?.settings.buy_now_button}
              </Button>
            </form>
          </div>

          {/* Variation Description (rich HTML, full width) */}
          {hasVariationDescription && (
            <section className="w-full px-4 md:px-12 pt-6 pb-2">
              <h2 className="text-app-red text-[20px] font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                {locale === 'ar' ? 'الوصف' : 'Description'}
              </h2>
              <div
                className="text-gray-700 dark:text-white leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-app-red [&_a]:underline [&_h1]:font-bold [&_h2]:font-bold rtl:[&_ul]:pr-6 rtl:[&_ul]:pl-0 rtl:[&_ol]:pr-6 rtl:[&_ol]:pl-0"
                dangerouslySetInnerHTML={{ __html: variationDescriptionHtml }}
              />
            </section>
          )}

          {/* Related Products */}
          {
            relatedProducts.length > 0 && (
              <section className="w-full px-4 md:px-12 pt-6 pb-8">
                <h2 className="text-app-red text-[20px] font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">{generalData?.settings.related_products}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {relatedProducts.map((prod: Product) => (
                    <Card
                      key={prod.id}
                      id={prod.id.toString()}
                      title={prod.name}
                      image={prod.full_path.image}
                      type="product"
                      href={`/categories/${categorySlug}/${subcategorySlug}/${prod.slug}`}
                    />
                  ))}
                </div>
              </section>
            )}
        </div>

        <PendingApprovalModal
          isOpen={showPendingModal}
          onClose={() => setShowPendingModal(false)}
          locale={router.locale || 'en'}
        />

        <ConfirmPurchaseModal
          isOpen={showConfirmModal}
          onClose={() => !submitLoading && setShowConfirmModal(false)}
          onConfirm={submitOrder}
          loading={submitLoading}
          locale={router.locale || 'en'}
          productName={product?.name || ''}
          variationName={selectedAmount.amount}
          recipientLabel={
            product?.product_type_id === PRODUCT_TYPE_PHONE
              ? generalData?.settings.phone_number_label
              : isSocial
                ? linkLabel
                : generalData?.settings.user_id_label
          }
          recipientValue={
            product?.product_type_id === PRODUCT_TYPE_PHONE
              ? recipientPhoneNumber
              : (product?.product_type_id === PRODUCT_TYPE_USER_ID || isProrated)
                ? recipientUser
                : undefined
          }
          quantity={qtyLocked ? 1 : quantity}
          unitPrice={selectedAmount.price}
          coinLabel={isProrated ? withUnit(quantity) : undefined}
          coinRate={isSocial ? socialRate : isCoin ? `${fmt(pricingUnit)} ${coinUnitLabel} = $${selectedAmount.price.toFixed(2)}` : undefined}
          total={total}
          currentBalance={currentBalance}
        />

        {/* Sticky mobile Buy bar — keeps the CTA in view while scrolling.
            Was its own <button> that read `submitLoading` independently of
            the desktop CTA's <Button loading> swap — the desktop button
            would vanish behind a spinner while this one stayed put with no
            loading indication at all. Both now render the same Button. */}
        <div
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-gray-500 dark:text-gray-400">{generalData?.settings.total}</span>
            <span className={`text-lg font-extrabold text-app-red ${user && !isApproved ? 'filter blur-[6px] select-none' : ''}`}>${total.toFixed(2)}</span>
          </div>
          <Button
            type="submit"
            form="purchase-form"
            disabled={(isApproved && cannotAfford) || Boolean(coinError)}
            loading={submitLoading}
          >
            {generalData?.settings.buy_now_button}
          </Button>
        </div>
      </PageLayout>
    ) : (
      <PageLayout className="flex flex-col min-h-screen px-0 md:px-0 py-0 bg-white dark:bg-background-dark">
        <ComingSoon />
      </PageLayout>
    )
  );
};

export default ProductPage; 