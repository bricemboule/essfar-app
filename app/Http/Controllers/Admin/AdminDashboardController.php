<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Schedule;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboards/Admin/Dashboard', [
            'statistics' => [
                'total_students' => User::where('role', 'etudiant')->count(),
                'total_teachers' => User::where('role', 'enseignant')->count(),
                'total_staff' => User::where('role', '!=', 'etudiant')->where('role', '!=', 'enseignant')->count(),
                'total_schedules_today' => Schedule::whereDate('start_time', today())->count(),
            ],
            'monthlyRegistrations' => $this->getMonthlyRegistrations(),
            'roleDistribution' => $this->getRoleDistribution(),
            'recentUsers' => $this->getRecentUsers(),
            'systemStats' => $this->getSystemStats(),
            'alerts' => $this->getSystemAlerts(),
        ]);
    }

    /**
     * Obtenir les inscriptions mensuelles pour l'année courante
     */
    private function getMonthlyRegistrations()
    {
        $months = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr',
            5 => 'Mai', 6 => 'Jun', 7 => 'Jul', 8 => 'Aoû',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];

        $registrations = User::selectRaw('MONTH(created_at) as month, COUNT(*) as registrations')
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('registrations', 'month')
            ->toArray();

        $monthlyData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthlyData[] = [
                'month' => $months[$i],
                'registrations' => $registrations[$i] ?? 0
            ];
        }

        return $monthlyData;
    }

    /**
     * Obtenir la répartition des utilisateurs par rôle
     */
    private function getRoleDistribution()
    {
        return User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'role' => ucfirst($item->role),
                    'count' => $item->count
                ];
            })
            ->toArray();
    }

    /**
     * Obtenir les utilisateurs récents (derniers 10)
     */
    private function getRecentUsers()
    {
        return User::select('id', 'name', 'email', 'role', 'created_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'photo_url' => null, // Ajoutez ici la logique pour les photos si nécessaire
                    'created_at' => $user->created_at->diffForHumans(),
                ];
            })
            ->toArray();
    }

    /**
     * Obtenir les statistiques système
     */
    private function getSystemStats()
    {
        return [
            'disk_usage' => [
                'used' => rand(45, 75), // Simulated data
                'total' => '100GB',
                'free' => '25GB'
            ],
            'memory_usage' => [
                'current' => $this->formatBytes(memory_get_usage()),
                'peak' => $this->formatBytes(memory_get_peak_usage()),
            ],
            'active_sessions' => User::whereNotNull('email_verified_at')
                ->where('updated_at', '>=', now()->subHours(24))
                ->count(),
            'database_size' => $this->getDatabaseSize(),
        ];
    }

    /**
     * Obtenir les alertes système
     */
    private function getSystemAlerts()
    {
        $alerts = [];

        // Vérifier les utilisateurs non vérifiés
        $unverifiedUsers = User::whereNull('email_verified_at')->count();
        if ($unverifiedUsers > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Comptes non vérifiés',
                'message' => "{$unverifiedUsers} utilisateurs n'ont pas encore vérifié leur email.",
                'time' => now()->format('d/m/Y H:i'),
                'action' => 'Envoyer rappels'
            ];
        }

        // Vérifier les cours d'aujourd'hui
        $todaySchedules = Schedule::whereDate('start_time', today())->count();
        if ($todaySchedules > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Cours programmés',
                'message' => "{$todaySchedules} cours sont programmés pour aujourd'hui.",
                'time' => now()->format('d/m/Y H:i'),
                'action' => null
            ];
        }

        // Vérifier la mémoire système
        $memoryUsage = memory_get_usage() / 1024 / 1024; // En MB
        if ($memoryUsage > 100) {
            $alerts[] = [
                'type' => 'danger',
                'title' => 'Utilisation mémoire élevée',
                'message' => 'L\'utilisation de la mémoire dépasse les seuils recommandés.',
                'time' => now()->format('d/m/Y H:i'),
                'action' => 'Optimiser'
            ];
        }

        return $alerts;
    }

    /**
     * Formater les bytes en format lisible
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    /**
     * Obtenir la taille de la base de données (approximative)
     */
    private function getDatabaseSize()
    {
        try {
            $size = DB::select("
                SELECT 
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS db_size 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            ");
            
            return ($size[0]->db_size ?? 0) . ' MB';
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    /**
     * API pour rafraîchir les statistiques (optionnel)
     */
    public function refreshStats()
    {
        return response()->json([
            'statistics' => [
                'total_students' => User::where('role', 'etudiant')->count(),
                'total_teachers' => User::where('role', 'enseignant')->count(),
                'total_staff' => User::where('role', '!=', 'etudiant')->where('role', '!=', 'enseignant')->count(),
                'total_schedules_today' => Schedule::whereDate('start_time', today())->count(),
            ],
            'updated_at' => now()->format('d/m/Y H:i:s')
        ]);
    }
}