// src/utils/getErrorMessage.ts
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred.") {
    // If the error is a string (from api.ts), return it directly
    if (typeof err === "string") return err;
    const e = err as { response?: { data?: { message?: string } }; errors?: Record<string, unknown>; message?: string };
    // Axios error with response data (prioritize this)
    if (e?.response?.data?.message) return e.response.data.message;
    // Validation errors (e.g., { type: 'validation', errors: { email: [...] } })
    if (e?.errors && typeof e.errors === "object") {
        const firstError = Object.values(e.errors)[0];
        if (Array.isArray(firstError)) return firstError[0];
        if (typeof firstError === "string") return firstError;
    }
    // General error with message
    if (e?.message) return e.message;
    // Fallback
    return fallback;
}
