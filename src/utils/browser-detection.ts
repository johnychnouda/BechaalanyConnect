export const isAndroidBrowser = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isChrome = userAgent.includes('chrome');
  const isSamsung = userAgent.includes('samsung');
  
  // Check if it's Android's built-in browser (not Chrome)
  return isAndroid && !isChrome && !isSamsung;
};

export const isLegacyBrowser = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIE = userAgent.includes('msie') || userAgent.includes('trident');
  const isOldAndroid = userAgent.includes('android 4') || userAgent.includes('android 5');
  
  return isIE || isOldAndroid;
}; 