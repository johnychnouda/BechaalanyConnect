import React from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center max-w-[240px] cursor-pointer"
    >
      <div className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out group relative w-full">
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:brightness-90"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <span className="relative text-app-red text-lg font-bold underline z-10">View Details</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center w-full mt-2">
        <h3 className="text-[14px] font-semibold text-gray-800 text-center">{product.name}</h3>
        <p className="text-[12px] text-gray-600 text-center mt-1">{product.description}</p>
        <p className="text-[16px] font-bold text-app-red mt-2">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard; 