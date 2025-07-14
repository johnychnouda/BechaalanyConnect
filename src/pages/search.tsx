import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
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

const SearchPage = () => {
    const router = useRouter();
    const { name: searchTerm } = router.query;
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!searchTerm || typeof searchTerm !== 'string') {
            setResults([]);
            return;
        }
        setLoading(true);
        setError('');
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${router.locale}/search?name=${encodeURIComponent(searchTerm)}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then((data: Product[]) => setResults(data))
            .catch(() => setError('Error fetching results'))
            .finally(() => setLoading(false));
    }, [searchTerm, router.locale]);

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Search Results</h1>
            {typeof searchTerm !== 'string' || !searchTerm ? (
                <div className="text-gray-500">Please enter a search term.</div>
            ) : loading ? (
                <div className="text-gray-500">Loading...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : results.length === 0 ? (
                <div className="text-gray-400">No results found for "{searchTerm}".</div>
            ) : (
                <ul className="divide-y divide-gray-100 bg-white dark:bg-background-dark rounded shadow">
                    {results.map(product => (
                        <li key={product.id} className="py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                            <Link href={`/categories/${product.subcategory.category.slug}/${product.subcategory.slug}/${product.slug}`}>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-[50px] h-[50px] md:w-[70px] md:h-[70px] lg:w-[100px] lg:h-[100px] aspect-square rounded overflow-hidden">
                                        <Image src={product.full_path.image} alt={product.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium">{product.name}</p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchPage; 