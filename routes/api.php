<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ReplyController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/user/{username}', [AuthController::class, 'byUsername']);
Route::get('/check/username/{username}', [AuthController::class, 'checkUsername']);
Route::get('/check/email/{email}', [AuthController::class, 'checkEmail']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/dark-mode', [AuthController::class, 'toggleDarkMode']);

    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/mine', [PostController::class, 'mine']);
    Route::get('/posts/user/{username}', [PostController::class, 'byUser']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    Route::post('/users/{user}/follow', [FollowController::class, 'toggle']);
    Route::post('/posts/{post}/like', [LikeController::class, 'togglePost']);
    Route::post('/replies/{reply}/like', [LikeController::class, 'toggleReply']);
    Route::get('/posts/{post}/replies', [ReplyController::class, 'index']);
    Route::post('/posts/{post}/replies', [ReplyController::class, 'store']);
    Route::delete('/replies/{reply}', [ReplyController::class, 'destroy']);
    Route::get('/search', [FollowController::class, 'search']);
});
