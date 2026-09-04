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
    <button
      type="button"
      className={`font-bold text-[18px] text-app-red cursor-pointer ${className}`}
      onClick={handleClick}
      aria-pressed={!isBlurred}
      aria-label={isBlurred ? 'Show balance' : 'Hide balance'}
    >
      <span className={isBlurred ? 'filter blur-[4px]' : ''}>
        {price.toFixed(2)}
      </span>
      <span className="ms-1">$</span>
    </button>
  );
};

export default BlurredPrice;
