// src/utils/getErrorMessage.ts
export function getErrorMessage(err: any, fallback = "An unexpected error occurred.") {
    // If the error is a string (from api.ts), return it directly
    if (typeof err === "string") return err;
    // Axios error with response data (prioritize this)
    if (err?.response?.data?.message) return err.response.data.message;
    // Validation errors (e.g., { type: 'validation', errors: { email: [...] } })
    if (err?.errors && typeof err.errors === "object") {
        const firstError = Object.values(err.errors)[0];
        if (Array.isArray(firstError)) return firstError[0];
        if (typeof firstError === "string") return firstError;
    }
    // General error with message
    if (err?.message) return err.message;
    // Fallback
    return fallback;
}
