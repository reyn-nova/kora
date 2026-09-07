<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Reply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReplyController extends Controller
{
    public function index(Post $post): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $replies = Reply::with('user:id,name,username')
            ->withCount('likes')
            ->where('post_id', $post->id)
            ->oldest()
            ->get();

        $replies->each(function ($reply) use ($userId) {
            $reply->is_liked = $reply->likes()->where('user_id', $userId)->exists();
            unset($reply->likes);
        });

        return response()->json($replies);
    }

    public function store(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:255',
        ]);

        $reply = Auth::guard('api')->user()->replies()->create([
            'post_id' => $post->id,
            'body' => $validated['body'],
        ]);

        $reply->load('user:id,name,username');
        $reply->likes_count = 0;
        $reply->is_liked = false;

        return response()->json($reply, 201);
    }

    public function destroy(Reply $reply): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        if ($reply->user_id !== $userId && $reply->post->user_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $reply->delete();

        return response()->json(['message' => 'Reply deleted']);
    }
}
