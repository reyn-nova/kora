<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');

    Route::get('/register', function () {
        return Inertia::render('Auth/Register');
    })->name('register');
});

Route::get('/home', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/{username}', function ($username) {
    return Inertia::render('Profile/Profile', ['username' => $username]);
})->name('profile');

Route::get('/profile/edit', function () {
    return Inertia::render('Profile/EditProfile');
})->name('profile.edit');
