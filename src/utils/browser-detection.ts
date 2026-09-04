export const isLegacyBrowser = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIE = userAgent.includes('msie') || userAgent.includes('trident');
  const isOldAndroid = userAgent.includes('android 4') || userAgent.includes('android 5');
  
  return isIE || isOldAndroid;
}; 