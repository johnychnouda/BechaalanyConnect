import React, { useState } from 'react';

interface OrderCodesProps {
  htmlContent: string;
  className?: string;
}

const OrderCodes: React.FC<OrderCodesProps> = ({ htmlContent, className = "" }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Parse HTML content to extract codes
  const extractCodes = (html: string): string[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const listItems = doc.querySelectorAll('li');
    return Array.from(listItems).map(li => li.textContent?.trim() || '');
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const codes = extractCodes(htmlContent);

  if (codes.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <ul className="space-y-2">
        {codes.map((code, index) => (
          <li key={index} className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#070707] dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex-1 mr-2">
              {code}
            </span>
            <button
              onClick={() => copyToClipboard(code)}
              className={`
                flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200
                ${copiedCode === code 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }
                opacity-100
              `}
              title={copiedCode === code ? "Copied!" : "Copy code"}
            >
              {copiedCode === code ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderCodes;
