<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Middlewares appliqués à toutes les routes web
         $middleware->group('academic', [
            'auth',
            'role:chef_scolarite,directeur_academique,directeur_general,admin',
        ]);

        $middleware->group('financial', [
            'auth',
            'role:comptable,directeur_general,admin',
        ]);
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Déclaration de l'alias pour les routes protégées par rôle
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
            $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Accès refusé.'], 403);
            }
            
            return redirect()->back()->with('error', 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.');
        });

        // Gestion des erreurs d'authentification
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }
            
            return redirect()->route('login');
        });
    })
    ->create();

     $middleware->alias([
            'role' => \App\Http\Middleware\RolePermissionMiddleware::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
        ]);

        // Middleware de groupe
        $middleware->group('admin', [
            'auth',
            'role:admin',
        ]);

        $middleware->group('staff', [
            'auth',
            'role:chef_scolarite,gestionnaire_scolarite,directeur_academique,directeur_general,comptable,communication,admin',
        ]);
