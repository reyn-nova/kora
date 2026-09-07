<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = Auth::guard('api')->login($user);

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
        ], 201);
    }

    /**
     * Login user and create token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::guard('api')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::guard('api')->user();
        $token = Auth::guard('api')->attempt($credentials);

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    /**
     * Logout user (revoke the token).
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('api')->logout();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    /**
     * Get the authenticated User.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(Auth::guard('api')->user());
    }

    /**
     * Update the authenticated User's profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = Auth::guard('api')->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'bio' => 'sometimes|nullable|string|max:500',
            'age' => 'sometimes|nullable|integer|min:1|max:150',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    /**
     * Toggle the authenticated User's dark mode preference.
     */
    public function toggleDarkMode(Request $request): JsonResponse
    {
        $user = Auth::guard('api')->user();

        $validated = $request->validate([
            'dark_mode' => 'required|boolean',
        ]);

        $user->update(['dark_mode' => $validated['dark_mode']]);

        return response()->json([
            'dark_mode' => $user->dark_mode,
        ]);
    }

    /**
     * Get a user by username.
     */
    public function byUsername(string $username): JsonResponse
    {
        $user = User::where('username', $username)->firstOrFail();

        $currentUser = Auth::guard('api')->user();
        $isFollowing = $currentUser ? $currentUser->isFollowing($user) : false;

        return response()->json(array_merge($user->toArray(), [
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'is_following' => $isFollowing,
        ]));
    }

    /**
     * Check if a username is available.
     */
    public function checkUsername(string $username): JsonResponse
    {
        $exists = User::where('username', $username)->exists();

        return response()->json(['available' => !$exists]);
    }

    /**
     * Check if an email is available.
     */
    public function checkEmail(string $email): JsonResponse
    {
        $exists = User::where('email', $email)->exists();

        return response()->json(['available' => !$exists]);
    }
}
