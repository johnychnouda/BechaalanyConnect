import { Url } from "next/dist/shared/lib/router/router";
import React from "react";
import Link from "next/link";
import clsx from "clsx";

type CardProps = {
  id: string;
  title: string;
  image: string;
  type: 'category' | 'product';
  href: Url;
  className?: string;
  imageClassName?: string;
  titleClassName?: string;
};

export default function Card({ 
  id, 
  title, 
  image, 
  type, 
  href,
  className,
  imageClassName,
  titleClassName 
}: CardProps) {
  return (
    <Link
      href={href}
      className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-red-500 border border-transparent transition-all duration-300 ease-in-out group relative"
    >
      <div className="relative w-full aspect-video">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover rounded-lg"
        />
        {/* View All Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-300 ease-in-out ">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <span className="relative text-app-red text-lg font-bold underline z-10">View All</span>
        </div>
      </div>
    </Link>
  );
} 