import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    bio: string | null;
    age: number | null;
    dark_mode: boolean;
}

export default function EditProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [data, setData] = useState({
        name: '',
        email: '',
        bio: '',
        age: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            router.visit('/login');
            return;
        }

        fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
            .then((res) => {
                if (!res.ok) {
                    localStorage.removeItem('token');
                    router.visit('/login');
                    return;
                }
                return res.json();
            })
            .then((userData) => {
                if (userData) {
                    setUser(userData);
                    setData({
                        name: userData.name,
                        email: userData.email,
                        bio: userData.bio || '',
                        age: userData.age?.toString() || '',
                    });
                    if (userData.dark_mode) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                router.visit('/login');
            })
            .finally(() => setLoading(false));
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setErrors({});

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    bio: data.bio || null,
                    age: data.age ? parseInt(data.age) : null,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setErrors(result.errors || {});
                return;
            }

            setUser(result);
            setSuccess(true);
        } catch (error) {
            setErrors({ name: 'An error occurred. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDarkModeToggle = (darkMode: boolean) => {
        if (user) {
            setUser({ ...user, dark_mode: darkMode });
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <AuthenticatedLayout
            user={user}
            onDarkModeToggle={handleDarkModeToggle}
        >
            <Head title="Edit Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6">
                            {success && (
                                <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/30">
                                    <p className="text-sm text-green-700 dark:text-green-400">Profile updated successfully.</p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />

                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        required
                                    />

                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />

                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="username"
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        required
                                    />

                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="age" value="Age" />

                                    <TextInput
                                        id="age"
                                        type="number"
                                        name="age"
                                        value={data.age}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData({ ...data, age: e.target.value })}
                                        min="1"
                                        max="150"
                                    />

                                    <InputError message={errors.age} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="bio" value="Bio" />

                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={data.bio}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                        rows={4}
                                        maxLength={500}
                                        onChange={(e) => setData({ ...data, bio: e.target.value })}
                                    />

                                    <InputError message={errors.bio} className="mt-2" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={saving}>
                                        {saving ? 'Saving...' : 'Save'}
                                    </PrimaryButton>

                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="rounded-md px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
