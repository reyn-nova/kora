import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import PostReplies from '@/Components/PostReplies';
import { Head, Link, router } from '@inertiajs/react';
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

interface Post {
    id: number;
    body: string;
    user_id: number;
    user: { id: number; name: string; username: string };
    created_at: string;
    likes_count: number;
    is_liked: boolean;
}

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [body, setBody] = useState('');
    const [posting, setPosting] = useState(false);

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
                    setUser(data);
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
        if (!user) return;
        fetchPosts();
    }, [user]);

    const fetchPosts = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/posts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data.data);
            }
        } catch {}
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        setPosting(true);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ body }),
            });

            if (res.ok) {
                const post = await res.json();
                setPosts([post, ...posts]);
                setBody('');
            }
        } catch {} finally {
            setPosting(false);
        }
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
            <Head title="Home" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <form onSubmit={handlePost} className="mb-6 overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-4">
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                maxLength={255}
                                placeholder="What's on your mind?"
                                className="w-full resize-none rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                rows={3}
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {body.length}/255
                                </span>
                                <PrimaryButton disabled={posting || !body.trim()}>
                                    Post
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>

                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg"
                            >
                                <div className="relative p-4">
                                    {post.user_id === user.id && (
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="absolute right-3 top-3 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                    <div className="mb-2 flex items-center gap-2">
                                        <Link href={`/${post.user.username}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500">
                                            {post.user.name.charAt(0).toUpperCase()}
                                        </Link>
                                        <div>
                                            <Link href={`/${post.user.username}`} className="text-sm font-medium text-gray-900 hover:underline dark:text-gray-100">
                                                {post.user.name}
                                            </Link>
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(post.created_at).toLocaleDateString('en-GB')} {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">{post.body}</p>
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
                                    <PostReplies postId={post.id} currentUserId={user.id} postOwnerId={post.user_id} />
                                </div>
                            </div>
                        ))}

                        {posts.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400">
                                No posts yet. Be the first to post!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
