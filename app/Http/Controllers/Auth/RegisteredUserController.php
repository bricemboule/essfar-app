<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        // Seuls certains rôles peuvent créer des comptes
        $allowedRoles = [];
        
        if (Auth::check() && Auth::user()->canManageUsers()) {
            $allowedRoles = User::ROLES;
        } else {
            // Les visiteurs ne peuvent créer que des comptes étudiants
            $allowedRoles = ['etudiant' => 'Étudiant'];
        }

        return Inertia::render('Auth/Register', [
            'roles' => $allowedRoles,
            'canSelectRole' => Auth::check() && Auth::user()->canManageUsers(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'telephone' => 'nullable|string|max:20',
            'date_naissance' => 'nullable|date|before:today',
            'genre' => 'nullable|in:M,F',
        ];

        // Seuls les administrateurs peuvent assigner des rôles
        if (Auth::check() && Auth::user()->canManageUsers()) {
            $rules['role'] = 'required|in:' . implode(',', array_keys(User::ROLES));
        }

        $validated = $request->validate($rules);

        // Définir le rôle par défaut
        if (!isset($validated['role']) || !Auth::check() || !Auth::user()->canManageUsers()) {
            $validated['role'] = 'etudiant';
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'telephone' => $validated['telephone'] ?? null,
            'date_naissance' => $validated['date_naissance'] ?? null,
            'genre' => $validated['genre'] ?? null,
            'statut' => 'actif',
        ]);

        // Générer le matricule
        $user->generateMatricule();

        event(new Registered($user));

        // Si c'est un admin qui crée le compte, ne pas connecter automatiquement
        if (Auth::check() && Auth::user()->canManageUsers()) {
            return redirect()->route('admin.users.index')
                ->with('success', 'Utilisateur créé avec succès. Matricule: ' . $user->matricule);
        }

        // Sinon, connecter l'utilisateur et rediriger
        Auth::login($user);
        return redirect()->route($user->getDashboardRoute());
    }
}
