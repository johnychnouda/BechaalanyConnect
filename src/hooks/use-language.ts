import { useLocale } from 'next-intl';

export function useLanguage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return {
    isRTL,
    locale,
  };
} 