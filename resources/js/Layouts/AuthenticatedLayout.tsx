import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import DarkModeToggle from '@/Components/DarkModeToggle';
import SearchBar from '@/Components/SearchBar';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    dark_mode?: boolean;
}

interface AuthenticatedLayoutProps {
    children: ReactNode;
    user?: User;
    onDarkModeToggle?: (darkMode: boolean) => void;
}

export default function AuthenticatedLayout({ children, user, onDarkModeToggle }: AuthenticatedLayoutProps) {
    const initial = user?.name?.charAt(0).toUpperCase() ?? '?';
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
        } catch {} finally {
            localStorage.removeItem('token');
            router.visit('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <Link href={route('home')} className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                MyApp
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <SearchBar />
                            {onDarkModeToggle && (
                                <DarkModeToggle
                                    darkMode={user?.dark_mode ?? true}
                                    onToggle={onDarkModeToggle}
                                />
                            )}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setOpen(!open)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500"
                                >
                                    {initial}
                                </button>
                                {open && (
                                    <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg dark:bg-gray-700 z-50">
                                        <Link
                                            href={`/${user?.username}`}
                                            onClick={() => setOpen(false)}
                                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => { setOpen(false); handleLogout(); }}
                                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
