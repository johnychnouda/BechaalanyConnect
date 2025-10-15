import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Product {
    id: number;
    slug: string;
    name: string;
    full_path: {
        image: string;
    }

    subcategory: {
        slug: string;
        title: string;
        category: {
            slug: string;
            title: string;
        }
    }
}

function SearchModal({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAll, setShowAll] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const MAX_RESULTS = 6;

    // Debounce search
    useEffect(() => {
        if (!searchTerm) {
            setResults([]);
            setShowAll(false);
            return;
        }
        setLoading(true);
        setError('');
        const handler = setTimeout(() => {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${router.locale}/search?name=${encodeURIComponent(searchTerm)}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch');
                    return res.json();
                })
                .then((data: Product[]) => {
                    setResults(data);
                    setShowAll(data.length > MAX_RESULTS);
                })
                .catch(() => setError('Error fetching results'))
                .finally(() => setLoading(false));
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setSearchTerm('');
            setResults([]);
            setError('');
        }
    }, [isOpen]);

    // Close on ESC
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, setIsOpen]);

    // Close on outside click
    const onOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    }, [setIsOpen]);

    // Handle 'View All' click
    const handleViewAll = () => {
        setIsOpen(false);
        router.push(`/search?name=${encodeURIComponent(searchTerm)}`);
    };

    const handleProductClick = (product: Product) => {
        setIsOpen(false);
        const categorySlug = product?.subcategory?.category?.slug;
        const subcategorySlug = product?.subcategory?.slug;
        const productSlug = product?.slug;
        const href = categorySlug && subcategorySlug && productSlug
            ? `/categories/${categorySlug}/${subcategorySlug}/${productSlug}`
            : `/products/coming-soon?product=${encodeURIComponent(productSlug || String(product.id))}`;
        router.push(href);
    };

    // Slide animation classes
    const modalClasses = `fixed left-0 right-0 top-0 bottom-0 z-50 flex items-start justify-center bg-black bg-opacity-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`;
    const panelClasses = `bg-white dark:bg-background-dark w-full max-w-lg mx-auto mt-20 rounded-lg shadow-lg p-6 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : '-translate-y-10'} `;

    return (
        <div className={modalClasses} style={{ backdropFilter: 'blur(2px)' }} onMouseDown={onOverlayClick}>
            <div ref={modalRef} className={panelClasses} onMouseDown={e => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-app-red"
                    placeholder={`${router.locale === 'ar' ? 'ابحث عن منتجات...' : 'Search products...'}`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                {loading && <div className="text-center text-gray-500">{router.locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>}
                {error && <div className="text-center text-red-500">{error}</div>}
                {!loading && !error && searchTerm && (
                    <div>
                        {results.length === 0 && <div className="text-center text-gray-400">{router.locale === 'ar' ? 'لا يوجد نتائج...' : 'No results found.'}</div>}
                        <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                            {results.slice(0, MAX_RESULTS).map(product => (
                                <li key={product.id} className="py-2 px-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded"
                                    onClick={() => handleProductClick(product)}
                                >
                                    {product.name}
                                </li>
                            ))}
                        </ul>
                        {showAll && (
                            <button
                                className="mt-4 w-full bg-app-red text-white py-2 rounded hover:bg-app-red/90 transition"
                                onClick={handleViewAll}
                            >
                                {router.locale === 'ar' ? 'عرض الكل' : 'View All'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchModal;