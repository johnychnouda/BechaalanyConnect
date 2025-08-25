import { useRouter } from 'next/router';

export function useLanguage() {
  const router = useRouter();
  
  // Fallback to router.locale for contexts where next-intl provider isn't available
  const locale = router.locale || 'en';
  const isRTL = locale === 'ar';

  return {
    isRTL,
    locale,
  };
} 