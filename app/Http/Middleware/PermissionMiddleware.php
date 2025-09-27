<?php
// app/Http/Middleware/PermissionMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Vérifier si l'utilisateur est actif
        if ($user->statut !== 'actif') {
            auth()->logout();
            return redirect()->route('login')->withErrors([
                'account' => 'Votre compte a été désactivé.'
            ]);
        }

        // L'admin a toutes les permissions
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Vérifier les permissions
        foreach ($permissions as $permission) {
            if ($this->hasPermissionByRole($user->role, $permission)) {
                return $next($request);
            }
        }

        // Accès refusé
        return $this->redirectToDashboard($user->role);
    }

    private function hasPermissionByRole(string $role, string $permission): bool
    {
        $rolePermissions = [
            'manage_schedules' => [
                'chef_scolarite',
                'gestionnaire_scolarite',
                'admin'
            ],
            'view_reports' => [
                'chef_scolarite',
                'gestionnaire_scolarite',
                'directeur_academique',
                'directeur_general',
                'comptable',
                'admin'
            ],
            'view_financial_reports' => [
                'comptable',
                'directeur_general',
                'admin'
            ],
            'manage_academic' => [
                'gestionnaire_scolarite',
                'chef_scolarite',
                'directeur_academique',
                'directeur_general',
                'admin'
            ],
            'manage_users' => [
                'directeur_general',
                'admin'
            ],
          
            'send_communications' => [
                'communication',
                'chef_scolarite',
                'directeur_general',
                'admin'
            ],
            'view_all_data' => [
                'directeur_academique',
                'directeur_general',
                'admin'
            ],
        ];

        return isset($rolePermissions[$permission]) && 
               in_array($role, $rolePermissions[$permission]);
    }

    private function redirectToDashboard(string $role): Response
    {
        $message = 'Vous n\'avez pas les permissions nécessaires pour cette action.';

        return redirect()->route(match($role) {
            'etudiant' => 'etudiant.dashboard',
            'enseignant' => 'enseignant.dashboard',
            'chef_scolarite' => 'scolarite.dashboard',
            'gestionnaire_scolarite' => 'gestionnaire.dashboard',
            'directeur_academique' => 'academique.dashboard',
            'directeur_general' => 'direction.dashboard',
            'comptable' => 'comptable.dashboard',
            'communication' => 'communication.dashboard',
            default => 'dashboard'
        })->with('error', $message);
    }
}