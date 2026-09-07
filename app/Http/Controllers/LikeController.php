<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Reply;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function togglePost(Post $post): JsonResponse
    {
        $user = Auth::guard('api')->user();

        if ($user->likes()->where('post_id', $post->id)->exists()) {
            $user->likes()->where('post_id', $post->id)->delete();
            $liked = false;
        } else {
            $user->likes()->create(['post_id' => $post->id]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $post->likes()->count(),
        ]);
    }

    public function toggleReply(Reply $reply): JsonResponse
    {
        $user = Auth::guard('api')->user();

        if ($user->likes()->where('reply_id', $reply->id)->exists()) {
            $user->likes()->where('reply_id', $reply->id)->delete();
            $liked = false;
        } else {
            $user->likes()->create(['reply_id' => $reply->id]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $reply->likes()->count(),
        ]);
    }
}
