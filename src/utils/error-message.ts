import { isApiError } from './api';

type Locale = string | undefined;

/**
 * Turns anything a rejected request can produce into a sentence safe to show a user.
 *
 * Call sites used to do `toast.error(error)` or
 * `toast.error(error?.message || locale === 'en' ? 'Failed…' : 'فشل…')`. The first
 * rendered "[object Object]" whenever the network dropped; the second is an operator
 * precedence bug — it parses as `(error?.message || locale === 'en') ? A : B`, so the
 * backend's real message was never shown and Arabic users got the English string
 * whenever any message existed.
 *
 * Everything funnels through here instead.
 */
export function toMessage(error: unknown, locale?: Locale): string {
    const ar = locale === 'ar';

    if (!error) {
        return ar ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.';
    }

    // Legacy call sites and thrown Errors.
    if (typeof error === 'string') return error;
    if (error instanceof Error && error.message) return error.message;

    if (!isApiError(error)) {
        return ar ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.';
    }

    const localised = LOCALISED[error.code];
    if (localised) return ar ? localised.ar : localised.en;

    // 422: surface the first field error, which is far more useful than
    // "The given data was invalid."
    if (error.errors) {
        const first = Object.values(error.errors)[0]?.[0];
        if (first) return first;
    }

    // Server errors carry a correlation id; including it makes a support report
    // actionable instead of "it said something went wrong".
    if (error.code === 'server_error' && error.ref) {
        return ar
            ? `حدث خطأ في الخادم. الرجاء المحاولة لاحقاً. (المرجع: ${error.ref.slice(0, 8)})`
            : `Something went wrong on our side. Please try again. (ref: ${error.ref.slice(0, 8)})`;
    }

    return error.message;
}

/**
 * Codes worth phrasing ourselves, because the API message is English-only and these
 * are the ones users actually hit.
 */
const LOCALISED: Record<string, { en: string; ar: string }> = {
    network: {
        en: 'No response from the server. Please check your internet connection.',
        ar: 'لا يوجد اتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
    },
    request_setup: {
        en: 'The request could not be sent. Please try again.',
        ar: 'تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.',
    },
    unauthenticated: {
        en: 'Your session has expired. Please sign in again.',
        ar: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
    },
    rate_limited: {
        en: 'Too many attempts. Please wait a moment and try again.',
        ar: 'محاولات كثيرة جداً. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.',
    },
    kyc_required: {
        en: 'Your account must be verified before you can do this.',
        ar: 'يجب التحقق من حسابك قبل تنفيذ هذا الإجراء.',
    },
    product_unavailable: {
        en: 'This product is no longer available.',
        ar: 'هذا المنتج لم يعد متوفراً.',
    },
    recipient_phone_required: {
        en: 'A phone number is required for this product.',
        ar: 'رقم الهاتف مطلوب لهذا المنتج.',
    },
    recipient_user_required: {
        en: 'A user ID is required for this product.',
        ar: 'معرّف المستخدم مطلوب لهذا المنتج.',
    },
    not_found: {
        en: 'We could not find what you were looking for.',
        ar: 'تعذر العثور على ما تبحث عنه.',
    },
};

/**
 * Insufficient credits deserves its own message, because the API tells us exactly how
 * much is missing and the user can act on it immediately.
 *
 * The old behaviour was a red toast reading "Not enough credits to place order" —
 * always in English, with no balance, no shortfall and no way to top up.
 */
export function insufficientCreditsMessage(error: unknown, locale?: Locale): string | null {
    if (!isApiError(error) || error.code !== 'insufficient_credits') return null;

    const missing = Number(error.data?.missing);
    const ar = locale === 'ar';

    if (!Number.isFinite(missing) || missing <= 0) {
        return ar ? 'رصيدك غير كافٍ لإتمام هذا الطلب.' : 'You do not have enough credits for this order.';
    }

    const amount = `$${missing.toFixed(2)}`;

    return ar
        ? `رصيدك غير كافٍ. تحتاج إلى ${amount} إضافية.`
        : `Not enough credits — you need ${amount} more.`;
}

/** Normalises a money value the API may serialise as a decimal string ("12.50"). */
export function toNumber(value: unknown, fallback = 0): number {
    const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    return Number.isFinite(n) ? n : fallback;
}
