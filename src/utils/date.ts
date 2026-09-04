/**
 * Date/time formatting.
 *
 * Every formatter here takes the app locale ('en' | 'ar'), not a BCP-47 tag, and maps
 * it internally — call sites already have `locale` from useLanguage()/router. The
 * default stays 'en' so existing call sites keep their exact previous output.
 */

type AppLocale = string | undefined;

const intlLocale = (locale: AppLocale): string => (locale === 'ar' ? 'ar-EG' : 'en-US');

export const formatDate = (dateString: string, locale?: AppLocale): string => {
  const date = new Date(dateString);
  const tag = intlLocale(locale);

  // Format date as YYYY-MM-DD
  const formattedDate = date.toLocaleDateString(tag, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');

  // Format time in 12-hour format, remove all spaces (including non-breaking) before AM/PM
  let formattedTime = date.toLocaleTimeString(tag, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Remove all spaces (including non-breaking) before AM/PM
  formattedTime = formattedTime.replace(/\s/g, '');

  return `${formattedDate} ${formattedTime}`;
};

/**
 * A notification/row timestamp: date + time, no seconds.
 *
 * Returns a localized placeholder rather than throwing or leaking the literal
 * 'Invalid Date' into Arabic UI — this replaces a private copy in
 * pages/account-dashboard/notifications.tsx that hardcoded 'en-US' and English
 * fallbacks in both locales.
 */
export const formatDateTime = (dateString: string, locale?: AppLocale): string => {
  const invalid = locale === 'ar' ? 'تاريخ غير صالح' : 'Invalid Date';
  if (!dateString) return invalid;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return invalid;

  return date.toLocaleString(intlLocale(locale), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/** The day heading a group of notifications sits under. */
export const formatDateHeading = (dateString: string, locale?: AppLocale): string => {
  const unknown = locale === 'ar' ? 'تاريخ غير معروف' : 'Unknown Date';
  if (!dateString) return unknown;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return unknown;

  return date.toLocaleDateString(intlLocale(locale), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/** Just the calendar date, no time. */
export const formatDateOnly = (dateString: string | Date, locale?: AppLocale): string => {
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return locale === 'ar' ? 'تاريخ غير صالح' : 'Invalid Date';
  return date.toLocaleDateString(intlLocale(locale));
};
