<?php
// app/Http/Middleware/RolePermissionMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$rolesOrPermissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Vérifier si l'utilisateur est actif
        if ($user->statut !== 'actif') {
            auth()->logout();
            return redirect()->route('login')->withErrors([
                'account' => 'Votre compte a été désactivé. Contactez l\'administration.'
            ]);
        }

        // Mettre à jour la dernière connexion
        $user->updateLastLogin();

        // Vérifier les rôles/permissions
        foreach ($rolesOrPermissions as $roleOrPermission) {
            // Si c'est un rôle (commence par 'role:')
            if (str_starts_with($roleOrPermission, 'role:')) {
                $role = substr($roleOrPermission, 5);
                if ($user->hasRole($role)) {
                    return $next($request);
                }
            }
            // Si c'est une permission (commence par 'permission:')
            elseif (str_starts_with($roleOrPermission, 'permission:')) {
                $permission = substr($roleOrPermission, 11);
                if ($user->hasPermission($permission)) {
                    return $next($request);
                }
            }
            // Sinon, traiter comme un rôle pour la compatibilité
            else {
                if ($user->hasRole($roleOrPermission)) {
                    return $next($request);
                }
            }
        }

        // Redirection selon le rôle si accès refusé
        return $this->redirectToDashboard($user->role);
    }

    private function redirectToDashboard(string $role): Response
    {
        $message = 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.';

        return redirect()->route(match($role) {
            'etudiant' => 'etudiant.dashboard',
            'enseignant' => 'enseignant.dashboard',
            'chef_scolarite' => 'scolarite.dashboard',
            'gestionnaire_scolarite' => 'gestionnaire.dashboard',
            'directeur_academique' => 'academique.dashboard',
            'directeur_general' => 'direction.dashboard',
            'comptable' => 'comptable.dashboard',
            'communication' => 'communication.dashboard',
            'admin' => 'admin.dashboard',
            default => 'dashboard'
        })->with('error', $message);
    }
}