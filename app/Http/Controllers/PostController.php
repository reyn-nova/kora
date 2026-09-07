<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    private function appendLikes($posts, $userId)
    {
        return $posts->getCollection()->map(function ($post) use ($userId) {
            $post->likes_count = $post->likes()->count();
            $post->is_liked = $post->likes()->where('user_id', $userId)->exists();
            unset($post->likes);
            return $post;
        });
    }

    public function index(): JsonResponse
    {
        $userId = Auth::guard('api')->id();
        $followingIds = Auth::guard('api')->user()->following()->pluck('users.id')->toArray();
        $userIds = array_merge([$userId], $followingIds);

        $posts = Post::with('user:id,name,username')
            ->withCount('likes')
            ->whereIn('user_id', $userIds)
            ->latest()
            ->paginate(20);

        $posts->getCollection()->transform(function ($post) use ($userId) {
            $post->is_liked = $post->likes()->where('user_id', $userId)->exists();
            return $post;
        });

        return response()->json($posts);
    }

    public function mine(): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $posts = Post::with('user:id,name,username')
            ->withCount('likes')
            ->where('user_id', $userId)
            ->latest()
            ->paginate(20);

        $posts->getCollection()->transform(function ($post) use ($userId) {
            $post->is_liked = $post->likes()->where('user_id', $userId)->exists();
            return $post;
        });

        return response()->json($posts);
    }

    public function byUser(string $username): JsonResponse
    {
        $userId = Auth::guard('api')->id();
        $user = \App\Models\User::where('username', $username)->firstOrFail();

        $posts = Post::with('user:id,name,username')
            ->withCount('likes')
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(20);

        $posts->getCollection()->transform(function ($post) use ($userId) {
            $post->is_liked = $post->likes()->where('user_id', $userId)->exists();
            return $post;
        });

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:255',
        ]);

        $post = Auth::guard('api')->user()->posts()->create($validated);
        $post->load('user:id,name,username');
        $post->likes_count = 0;
        $post->is_liked = false;

        return response()->json($post, 201);
    }

    public function destroy(Post $post): JsonResponse
    {
        if ($post->user_id !== Auth::guard('api')->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted']);
    }
}
