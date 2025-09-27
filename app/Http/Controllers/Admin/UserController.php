<?php
// app/Http/Controllers/Admin/UserController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Filtres
        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('matricule', 'like', '%' . $request->search . '%');
            });
        }

        // Tri
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'statut', 'search', 'sort_by', 'sort_order']),
            'roles' => User::ROLES,
            'stats' => [
                'total' => User::count(),
                'active' => User::where('statut', 'actif')->count(),
                'by_role' => User::selectRaw('role, count(*) as count')
                    ->groupBy('role')
                    ->pluck('count', 'role')
                    ->toArray(),
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => User::ROLES,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:' . implode(',', array_keys(User::ROLES)),
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:500',
            'date_naissance' => 'required|date|before:today',
            'lieu_naissance' => 'required|string|max:255',
            'sexe' => 'required|in:M,F',
            'statut' => 'required|in:actif,inactif,suspendu',
            'notes_admin' => 'nullable|string|max:1000',
        ]);
         
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'telephone' => $validated['telephone'],
            'adresse' => $validated['adresse'],
            'date_naissance' => $validated['date_naissance'],
            'lieu_naissance' => $validated['lieu_naissance'],
            'sexe' => $validated['sexe'],
            'statut' => $validated['statut'],
            'notes_admin' => $validated['notes_admin'],
        ]);

        // Générer le matricule
        if ($validated['role'] === 'etudiant'){
            $user->generateMatricule();
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur créé avec succès. Matricule: ' . $user->name);
    }

    public function show(User $user)
    {
        $user->load(['studentEnrollments.schoolClass', 'teacherCourses', 'teacherSchedules']);

        $stats = [];
        
        if ($user->role === 'etudiant') {
            $stats = [
                'enrollments_count' => $user->studentEnrollments->count(),
                'current_class' => $user->studentEnrollments()
                    ->where('status', 'active')
                    ->with('schoolClass')
                    ->first()?->schoolClass?->name,
            ];
        } elseif ($user->role === 'enseignant') {
            $stats = [
                'courses_count' => $user->teacherCourses->count(),
                'schedules_count' => $user->teacherSchedules->count(),
                'completed_hours' => $user->teacherSchedules()
                    ->where('status', 'completed')
                    ->sum(\DB::raw('TIMESTAMPDIFF(MINUTE, start_time, end_time) / 60')),
            ];
        }

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => User::ROLES,
        ]);
    }

    public function update(Request $request, User $user)
    {
      $request->validate([
    'name' => 'sometimes|required|string|max:255',
    'email' => 'sometimes|required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
    'role' => 'sometimes|required|in:' . implode(',', array_keys(User::ROLES)),
    'telephone' => 'nullable|string|max:20',
    'adresse' => 'nullable|string|max:500',
    'date_naissance' => 'sometimes|required|date|before:today',
    'lieu_naissance' => 'sometimes|required|string|max:255',
    'sexe' => 'nullable|in:M,F',
    'statut' => 'sometimes|required|in:actif,inactif,suspendu',
    'notes_admin' => 'nullable|string|max:1000',
]);

        // Si le rôle change, régénérer le matricule
        $roleChanged = $user->role !== $validated['role'];
        
        $user->update($validated);

        if ($roleChanged) {
            $user->update(['matricule' => null]);
            $user->generateMatricule();
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur mis à jour avec succès.');
    }

    public function destroy(User $user)
    {
        // Vérifier si l'utilisateur peut être supprimé
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return back()->withErrors(['error' => 'Impossible de supprimer le dernier administrateur.']);
        }

        if ($user->teacherSchedules()->count() > 0) {
            return back()->withErrors(['error' => 'Impossible de supprimer un enseignant qui a des plannings.']);
        }

        if ($user->studentEnrollments()->count() > 0) {
            return back()->withErrors(['error' => 'Impossible de supprimer un étudiant qui a des inscriptions.']);
        }

        $matricule = $user->matricule;
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', "Utilisateur {$matricule} supprimé avec succès.");
    }

    public function toggleStatus(User $user)
    {
        $newStatus = $user->statut === 'actif' ? 'inactif' : 'actif';
        $user->update(['statut' => $newStatus]);

        $message = $newStatus === 'actif' ? 'Compte activé' : 'Compte désactivé';

        return back()->with('success', $message . ' avec succès.');
    }

    public function resetPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Mot de passe réinitialisé avec succès.');
    }

    // Méthodes utilitaires
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,suspend,delete',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();

        switch ($request->action) {
            case 'activate':
                User::whereIn('id', $request->user_ids)->update(['statut' => 'actif']);
                $message = 'Utilisateurs activés';
                break;
            
            case 'deactivate':
                User::whereIn('id', $request->user_ids)->update(['statut' => 'inactif']);
                $message = 'Utilisateurs désactivés';
                break;
            
            case 'suspend':
                User::whereIn('id', $request->user_ids)->update(['statut' => 'suspendu']);
                $message = 'Utilisateurs suspendus';
                break;
            
            case 'delete':
                // Vérifications avant suppression
                $adminCount = $users->where('role', 'admin')->count();
                $totalAdmins = User::where('role', 'admin')->count();
                
                if ($adminCount > 0 && $totalAdmins - $adminCount < 1) {
                    return back()->withErrors(['error' => 'Impossible de supprimer tous les administrateurs.']);
                }
                
                User::whereIn('id', $request->user_ids)->delete();
                $message = 'Utilisateurs supprimés';
                break;
        }

        return back()->with('success', $message . ' avec succès.');
    }

    // Export des utilisateurs
    public function export(Request $request)
    {
        $query = User::query();

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        $users = $query->get();

        // Ici vous pouvez utiliser Laravel Excel pour l'export
        // return Excel::download(new UsersExport($users), 'users.xlsx');
        
        return back()->with('info', 'Export à implémenter avec Laravel Excel');
    }
}