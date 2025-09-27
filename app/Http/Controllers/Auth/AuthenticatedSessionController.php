<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Vérifier si le compte est actif
        if ($user->statut !== 'actif') {
            Auth::logout();
            return back()->withErrors([
                'account' => 'Votre compte a été désactivé. Contactez l\'administration.'
            ]);
        }

        // Mettre à jour la dernière connexion
        $user->updateLastLogin();

        // Générer le matricule s'il n'existe pas
        if (!$user->matricule) {
            $user->generateMatricule();
        }

        // Redirection selon le rôle de l'utilisateur
        $dashboardRoute = $user->getDashboardRoute();
        
        return redirect()->intended(route($dashboardRoute));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Vous avez été déconnecté avec succès.');
    }
}
