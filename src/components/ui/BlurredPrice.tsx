import React, { useState } from 'react';

interface BlurredPriceProps {
  price: number;
  className?: string;
  onClick?: () => void;
}

const BlurredPrice: React.FC<BlurredPriceProps> = ({ price, className = '', onClick }) => {
  const [isBlurred, setIsBlurred] = useState(true);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setIsBlurred(!isBlurred);
  };

  return (
    <span 
      className={`font-bold text-[18px] text-app-red cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <span className={isBlurred ? 'filter blur-[4px]' : ''}>
        {price.toFixed(2)}
      </span>
      <span className="ml-1">$</span>
    </span>
  );
};

export default BlurredPrice; 