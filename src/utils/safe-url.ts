const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * A link written in the CMS, safe to put in an href. `javascript:` and `data:` URLs run
 * on this origin when clicked, so anything but a plain link becomes "#".
 */
export function safeUrl(url?: string | null): string {
  const value = (url ?? '').trim();
  if (!value) return '#';

  // Browsers drop tabs and newlines inside a scheme, so java\tscript: must not slip past.
  const compact = value.replace(/[\u0000- ]+/g, '');

  try {
    return ALLOWED_SCHEMES.includes(new URL(compact, 'https://relative.invalid').protocol) ? value : '#';
  } catch {
    return '#';
  }
}
