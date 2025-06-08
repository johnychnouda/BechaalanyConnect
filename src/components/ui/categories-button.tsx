import React from 'react';

interface CategoriesButtonProps {
  href: string;
  className?: string;
}

const CategoriesButton: React.FC<CategoriesButtonProps> = ({ href, className = '' }) => {
  return (
    <a 
      href={href}
      className={`cursor-pointer text-app-white bg-app-red py-2 px-6 text-center rounded-full font-bold text-[16px] border-2 border-transparent transition-all duration-200 hover:bg-white hover:text-app-red hover:border-app-red group ${className}`}
    >
      VIEW CATEGORIES
    </a>
  );
};

export default CategoriesButton; 