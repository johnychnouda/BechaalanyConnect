export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Format date as YYYY-MM-DD
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  
  // Format time in 12-hour format, remove all spaces (including non-breaking) before AM/PM
  let formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  // Remove all spaces (including non-breaking) before AM/PM
  formattedTime = formattedTime.replace(/\s/g, '');
  
  return `${formattedDate} ${formattedTime}`;
}; 