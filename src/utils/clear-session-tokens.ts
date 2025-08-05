/**
 * Utility to clear multiple NextAuth session tokens
 * This helps resolve issues with multiple session tokens (0-4)
 */
export const clearSessionTokens = () => {
  if (typeof window === 'undefined') return;

  // Clear all possible session token cookies
  const tokenNames = [
    'next-auth.session-token',
    'next-auth.session-token.0',
    'next-auth.session-token.1',
    'next-auth.session-token.2',
    'next-auth.session-token.3',
    'next-auth.session-token.4',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token',
  ];

  tokenNames.forEach(tokenName => {
    // Remove from all possible paths
    document.cookie = `${tokenName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${tokenName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    document.cookie = `${tokenName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  });

  // Also clear localStorage and sessionStorage
  localStorage.removeItem('next-auth.session-token');
  sessionStorage.removeItem('next-auth.session-token');
};

/**
 * Check if multiple session tokens exist
 */
export const hasMultipleSessionTokens = (): boolean => {
  if (typeof window === 'undefined') return false;

  const cookies = document.cookie.split(';');
  const sessionTokens = cookies.filter(cookie => 
    cookie.trim().startsWith('next-auth.session-token')
  );

  return sessionTokens.length > 1;
};

/**
 * Log session token information for debugging
 */
export const logSessionTokens = () => {
  if (typeof window === 'undefined') return;

  const cookies = document.cookie.split(';');
  const sessionTokens = cookies.filter(cookie => 
    cookie.trim().startsWith('next-auth.session-token')
  );

  console.log('Session tokens found:', sessionTokens.length);
  sessionTokens.forEach((token, index) => {
    console.log(`Token ${index}:`, token.trim());
  });
}; 