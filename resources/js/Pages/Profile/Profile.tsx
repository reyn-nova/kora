import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PostReplies from '@/Components/PostReplies';
import { Head, Link, router, usePage } from '@inertiajs/react';
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

interface ProfileUser extends User {
    followers_count: number;
    following_count: number;
    is_following: boolean;
}

interface Post {
    id: number;
    body: string;
    user_id: number;
    user: { id: number; name: string };
    created_at: string;
    likes_count: number;
    is_liked: boolean;
}

interface PageProps {
    username: string;
    [key: string]: unknown;
}

export default function Profile() {
    const { username } = usePage<PageProps>().props;
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);

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
            .then((data) => {
                if (data) {
                    setCurrentUser(data);
                    if (data.dark_mode) {
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

    useEffect(() => {
        if (!currentUser) return;

        fetch(`/api/user/${username}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json',
            },
        })
            .then((res) => {
                if (!res.ok) {
                    setProfileUser(null);
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) setProfileUser(data);
            })
            .catch(() => {});
    }, [currentUser, username]);

    useEffect(() => {
        if (!profileUser) return;
        const token = localStorage.getItem('token');
        fetch(`/api/posts/user/${username}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => setPosts(data.data))
            .catch(() => {});
    }, [profileUser, username]);

    const handleFollow = async () => {
        if (!profileUser) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/users/${profileUser.id}/follow`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setProfileUser({
                    ...profileUser,
                    is_following: data.following,
                    followers_count: data.followers_count,
                });
            }
        } catch {}
    };

    const handleDelete = async (postId: number) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                setPosts(posts.filter((p) => p.id !== postId));
            }
        } catch {}
    };

    const handleLike = async (postId: number) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(posts.map((p) =>
                    p.id === postId
                        ? { ...p, is_liked: data.liked, likes_count: data.likes_count }
                        : p
                ));
            }
        } catch {}
    };

    const handleDarkModeToggle = (darkMode: boolean) => {
        if (currentUser) {
            setCurrentUser({ ...currentUser, dark_mode: darkMode });
        }
    };

    const isOwnProfile = currentUser?.id === profileUser?.id;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    if (!profileUser) {
        return (
            <AuthenticatedLayout
                user={currentUser}
                onDarkModeToggle={handleDarkModeToggle}
            >
                <Head title="404 Not Found" />
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">User not found.</p>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={currentUser}
            onDarkModeToggle={handleDarkModeToggle}
        >
            <Head title={`${profileUser.name}'s Profile`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="mb-6 overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-semibold text-white">
                                        {profileUser.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profileUser.name}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{profileUser.username}</p>
                                        <p className="text-gray-600 dark:text-gray-400">{profileUser.email}</p>
                                    </div>
                                </div>
                                {isOwnProfile ? (
                                    <Link
                                        href={route('profile.edit')}
                                        className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-100"
                                    >
                                        Edit Profile
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleFollow}
                                        className={`rounded-md px-4 py-2 text-sm font-semibold ${
                                            profileUser.is_following
                                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                        }`}
                                    >
                                        {profileUser.is_following ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>

                            <div className="mt-4 flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                                <span><strong className="text-gray-900 dark:text-gray-100">{profileUser.followers_count}</strong> followers</span>
                                <span><strong className="text-gray-900 dark:text-gray-100">{profileUser.following_count}</strong> following</span>
                            </div>

                            {profileUser.bio && (
                                <p className="mt-4 text-gray-700 dark:text-gray-300">{profileUser.bio}</p>
                            )}
                            {profileUser.age && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Age: {profileUser.age}</p>
                            )}
                        </div>
                    </div>

                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {isOwnProfile ? 'Your Posts' : `${profileUser.name}'s Posts`}
                    </h3>

                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="relative overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg"
                            >
                                <div className="p-4">
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="absolute right-3 top-3 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(post.created_at).toLocaleDateString('en-GB')} {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </span>
                                    <p className="mt-2 text-gray-700 dark:text-gray-300">{post.body}</p>
                                    <div className="mt-3 flex items-center gap-1">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className={`flex items-center gap-1 text-sm ${post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'}`}
                                        >
                                            {post.is_liked ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            )}
                                            {post.likes_count > 0 && <span>{post.likes_count}</span>}
                                        </button>
                                    </div>
                                    <PostReplies postId={post.id} currentUserId={currentUser.id} postOwnerId={post.user_id} />
                                </div>
                            </div>
                        ))}

                        {posts.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400">
                                {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
