/**
 * One password policy, in one place.
 *
 * There used to be two regexes: signup required uppercase + digit + symbol, and
 * signin *also* validated strength but additionally required a lowercase letter. So
 * the login form could reject a password the signup form had just accepted, and any
 * account created before the rule tightened could not sign in at all.
 *
 * Strength is now checked only where a password is being CHOSEN (signup, reset,
 * change password). Sign-in only checks that something was entered — the server
 * decides whether it is correct.
 *
 * Kept in step with the backend, which enforces
 * `Password::min(8)->letters()->numbers()` on registration and reset.
 */

/** At least 8 characters, with an uppercase letter, a digit and a symbol. */
export const PASSWORD_PATTERN =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const isStrongPassword = (value: string): boolean =>
    PASSWORD_PATTERN.test(value);

/** Message describing the rule, for inline form validation. */
export const passwordRuleMessage = (locale?: string): string =>
    locale === 'ar'
        ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وتتضمن حرفاً كبيراً ورقماً ورمزاً.'
        : 'Password must be at least 8 characters and include an uppercase letter, a number and a symbol.';
