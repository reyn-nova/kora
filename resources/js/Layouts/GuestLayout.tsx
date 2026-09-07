import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface GuestLayoutProps {
    children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 dark:bg-gray-900 sm:justify-center sm:pt-0">
            <div className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
                MyApp
            </div>

            <div className="w-full overflow-hidden bg-white px-6 py-4 shadow-md dark:bg-gray-800 dark:shadow-gray-700 sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
