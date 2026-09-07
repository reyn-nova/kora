import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

interface SearchResult {
    id: number;
    name: string;
    username: string;
}

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            const token = localStorage.getItem('token');
            fetch(`/api/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data) => setResults(data))
                .catch(() => setResults([]));
        }, 300);
        return () => clearTimeout(timer.current);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                className="w-48 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 sm:w-64"
            />
            {open && results.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md bg-white shadow-lg dark:bg-gray-700">
                    {results.map((user) => (
                        <Link
                            key={user.id}
                            href={`/${user.username}`}
                            onClick={() => {
                                setQuery('');
                                setOpen(false);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            <span className="font-medium">{user.name}</span>
                            <span className="ml-2 text-gray-500 dark:text-gray-400">@{user.username}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
