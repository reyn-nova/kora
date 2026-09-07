import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

interface Reply {
    id: number;
    body: string;
    user_id: number;
    user: { id: number; name: string; username: string };
    created_at: string;
    likes_count: number;
    is_liked: boolean;
}

interface PostRepliesProps {
    postId: number;
    currentUserId: number;
    postOwnerId: number;
}

export default function PostReplies({ postId, currentUserId, postOwnerId }: PostRepliesProps) {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`/api/posts/${postId}/replies`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => setReplies(data))
            .catch(() => {});
    }, [postId]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        setLoading(true);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/posts/${postId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ body }),
            });
            if (res.ok) {
                const reply = await res.json();
                setReplies([...replies, reply]);
                setBody('');
            }
        } catch {} finally {
            setLoading(false);
        }
    };

    const handleDelete = async (replyId: number) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/replies/${replyId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                setReplies(replies.filter((r) => r.id !== replyId));
            }
        } catch {}
    };

    const handleLike = async (replyId: number) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/replies/${replyId}/like`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setReplies(replies.map((r) =>
                    r.id === replyId
                        ? { ...r, is_liked: data.liked, likes_count: data.likes_count }
                        : r
                ));
            }
        } catch {}
    };

    return (
        <div className="mt-3 space-y-3">
            <form onSubmit={handleReply} className="flex gap-2">
                <input
                    type="text"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={255}
                    placeholder="Write a reply..."
                    className="flex-1 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={loading || !body.trim()}
                    className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                    Reply
                </button>
            </form>

            {replies.map((reply) => (
                <div key={reply.id} className="relative rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                    {(reply.user_id === currentUserId || postOwnerId === currentUserId) && (
                        <button
                            onClick={() => handleDelete(reply.id)}
                            className="absolute right-2 top-2 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <Link href={`/${reply.user.username}`} className="text-xs font-medium text-gray-900 hover:underline dark:text-gray-100">
                            {reply.user.name}
                        </Link>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{reply.body}</p>
                    <button
                        onClick={() => handleLike(reply.id)}
                        className={`mt-1 flex items-center gap-1 text-xs ${reply.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'}`}
                    >
                        {reply.is_liked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        )}
                        {reply.likes_count > 0 && <span>{reply.likes_count}</span>}
                    </button>
                </div>
            ))}
        </div>
    );
}
