<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    public function toggle(User $user): JsonResponse
    {
        $currentUser = Auth::guard('api')->user();

        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'Cannot follow yourself'], 400);
        }

        if ($currentUser->isFollowing($user)) {
            $currentUser->following()->detach($user->id);
            $following = false;
        } else {
            $currentUser->following()->attach($user->id);
            $following = true;
        }

        return response()->json([
            'following' => $following,
            'followers_count' => $user->followers()->count(),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->validate([
            'q' => 'required|string|min:1',
        ])['q'];

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('username', 'like', "%{$query}%")
            ->limit(10)
            ->get(['id', 'name', 'username']);

        return response()->json($users);
    }
}
