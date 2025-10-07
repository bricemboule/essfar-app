<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Optimisation du chargement Vite
        Vite::prefetch(concurrency: 3);

        // Définir les modèles à binder automatiquement
        Route::model('etudiant', User::class);
        Route::model('enseignant', User::class);
    }
}
