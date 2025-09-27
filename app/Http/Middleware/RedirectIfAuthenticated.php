<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, ...$guards)
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Utilisation de ta méthode dans User.php
            $dashboardRoute = $user->getDashboardRoute();

            return redirect()->route($dashboardRoute);
        }

        return $next($request);
    }
}
