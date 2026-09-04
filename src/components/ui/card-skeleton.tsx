import React from 'react'
import { Skeleton } from './primitives/Skeleton'

/**
 * Kept as its own file/export (unchanged call signature — no props, default
 * export) since every catalog page already imports it this way. Internally it
 * now composes the shared `Skeleton` primitive instead of hand-rolling
 * `animate-pulse` + `bg-gray-*` again.
 */
const CardSkeleton = () => {
    return (
        <div className="flex flex-col items-center">
            <div className="w-full relative aspect-[4/3] rounded-lg overflow-hidden">
                <Skeleton className="absolute inset-0" rounded="rounded-lg" />
            </div>
            <div className="w-full mt-2 px-2 flex items-center justify-center">
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    )
}

export default CardSkeleton
