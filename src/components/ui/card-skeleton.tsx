import React from 'react'

const CardSkeleton = () => {
    return (
        <div className="flex flex-col items-center animate-pulse">
            <div className="block rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-200 dark:bg-gray-700 w-full relative aspect-[4/3]">
                {/* Image skeleton */}
                <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="w-full mt-2 px-2 flex items-center justify-center">
                <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
        </div>
    )
}

export default CardSkeleton