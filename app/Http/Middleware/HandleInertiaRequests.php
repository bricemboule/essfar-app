<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'role_display_name' => $request->user()->role_display_name,
                    'matricule' => $request->user()->matricule,
                    'telephone' => $request->user()->telephone,
                    'photo_url' => $request->user()->photo_url,
                    'statut' => $request->user()->statut,
                    'derniere_connexion' => $request->user()->derniere_connexion,
                    'permissions' => $this->getUserPermissions($request->user()),
                    'dashboard_route' => $request->user()->getDashboardRoute(),
                ] : null,
            ],
            'menu' => $request->user() 
                ? $this->getMenuForRole($request->user()->role)
                : [],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'permissions' => $request->user() 
                ? $this->getUserPermissions($request->user()) 
                : [],
        ]);
    }

    private function getUserPermissions($user): array
    {
        if (!$user) return [];

        return [
            'can_access_planning' => $user->canAccessPlanning(),
            'can_manage_users' => $user->canManageUsers(),
            'can_view_financial_reports' => $user->canViewFinancialReports(),
            'can_manage_schedules' => $user->canManageSchedules(),
            'role_level' => \App\Models\User::ROLE_HIERARCHY[$user->role] ?? 0,
        ];
    }

    private function getMenuForRole(string $role): array
    {
        return match($role) {
            'etudiant' => $this->getEtudiantMenu(),
            'enseignant' => $this->getEnseignantMenu(),
            'chef_scolarite' => $this->getChefScolariteMenu(),
            'gestionnaire_scolarite' => $this->getGestionnaireScolariteMenu(),
            'directeur_academique' => $this->getDirecteurAcademiqueMenu(),
            'directeur_general' => $this->getDirecteurGeneralMenu(),
            'comptable' => $this->getComptableMenu(),
            'communication' => $this->getCommunicationMenu(),
            'admin' => $this->getAdminMenu(),
            default => []
        };
    }

    // Menus spécifiques par rôle
    private function getEtudiantMenu(): array
    {
        return [
            [
                'title' => 'Tableau de bord',
                'url' => route('etudiant.dashboard'),
                'icon' => 'fas fa-tachometer-alt',
            ],
            [
                'title' => 'Mon Planning',
                'url' => route('etudiant.schedule'),
                'icon' => 'fas fa-calendar',
            ],
            [
                'title' => 'Mes Cours',
                'url' => route('etudiant.courses'),
                'icon' => 'fas fa-book',
            ],
            [
                'title' => 'Mes Notes',
                'url' => route('etudiant.grades'),
                'icon' => 'fas fa-chart-line',
            ],
            [
                'title' => 'Mon Profil',
                'url' => route('profile.edit'),
                'icon' => 'fas fa-user',
            ],
        ];
    }

    private function getEnseignantMenu(): array
    {
        return [
            [
                'title' => 'Tableau de bord',
                'url' => route('enseignant.dashboard'),
                'icon' => 'fas fa-tachometer-alt',
            ],
            [
                'title' => 'Mon Planning',
                'url' => route('enseignant.schedule'),
                'icon' => 'fas fa-calendar-alt',
            ],
            [
                'title' => 'Mes Cours',
                'url' => route('enseignant.courses'),
                'icon' => 'fas fa-chalkboard-teacher',
            ],
            [
                'title' => 'Mes Classes',
                'url' => route('enseignant.classes'),
                'icon' => 'fas fa-users',
            ],
            [
                'title' => 'Présences',
                'url' => route('enseignant.attendance'),
                'icon' => 'fas fa-check-circle',
            ],
        ];
    }

    private function getChefScolariteMenu(): array
    {
        return [
            [
                'title' => 'Tableau de bord',
                'url' => route('scolarite.dashboard'),
                'icon' => 'fas fa-tachometer-alt',
            ],
              [
                'title' => 'Salles & Ressources',
                'url' => route('academic.classrooms.index'),
                'icon' => 'fas fa-door-open',
            ],
              [
                'title' => 'Gestion Académique',
                'icon' => 'fas fa-graduation-cap',
                'children' => [
                    ['title' => 'Annees Academiques', 'url' => route('academic.years.index')],
                    ['title' => 'Classes', 'url' => route('academic.classes.index')],
                    ['title' => 'Etudiants', 'url' => route('academic.etudiants.index')],
                    ['title' => 'Enseignants', 'url' => route('academic.enseignants.index')],
                    ['title' => 'Cours', 'url' => route('academic.courses.index')],
                    ['title' => 'Inscriptions', 'url' => ""],
                ]
            ],
        
            [
                'title' => 'Gestion Planning',
                'icon' => 'fas fa-calendar-check',
                'children' => [
                    ['title' => 'Plannings', 'url' => route('schedules.index')],
                    ['title' => 'Créer séance', 'url' => route('schedules.create')],
                    ['title' => 'Rapports heures', 'url' => route('reports.course-hours')],
                ]
            ]
          
        ];
    }

    // ... Autres menus (je continue dans le prochain artifact)
    private function getGestionnaireScolariteMenu(): array
    {
        return [
            [
                'title' => 'Tableau de bord',
                'url' => route('gestionnaire.dashboard'),
                'icon' => 'fas fa-tachometer-alt',
            ],
            [
                'title' => 'Planning',
                'url' => route('schedules.index'),
                'icon' => 'fas fa-calendar',
            ],
            [
                'title' => 'Inscriptions',
                'url' => "",//route('academic.enrollments.index'),
                'icon' => 'fas fa-user-plus',
            ],
            [
                'title' => 'Rapports',
                'url' => route('reports.index'),
                'icon' => 'fas fa-chart-bar',
            ],
        ];
    }

    private function getDirecteurAcademiqueMenu(): array
    {
        return [
            [
                'title' => 'Dashboard Académique',
                'url' => route('academique.dashboard'),
                'icon' => 'fas fa-university',
            ],
            [
                'title' => 'Vue d\'ensemble',
                'icon' => 'fas fa-eye',
                'children' => [
                    ['title' => 'Programmes', 'url' => route('academique.programs')],
                    ['title' => 'Performance', 'url' => route('academique.performance')],
                    ['title' => 'Enseignants', 'url' => route('academique.teachers')],
                ]
            ],
               [
                'title' => 'Gestion Académique',
                'icon' => 'fas fa-graduation-cap',
                'children' => [
                    ['title' => 'Annees Academiques', 'url' => route('academic.years.index')],
                    ['title' => 'Classes', 'url' => route('academic.classes.index')],
                    ['title' => 'Cours', 'url' => route('academic.courses.index')],
                    ['title' => 'Inscriptions', 'url' => ""],
                ]
            ],
            [
                'title' => 'Salles & Ressources',
                'url' => route('academic.classrooms.index'),
                'icon' => 'fas fa-door-open',
            ],
            [
                'title' => 'Rapports Académiques',
                'url' => route('reports.academic'),
                'icon' => 'fas fa-chart-pie',
            ],
        ];
    }

    private function getDirecteurGeneralMenu(): array
    {
        return [
            [
                'title' => 'Dashboard Exécutif',
                'url' => route('direction.dashboard'),
                'icon' => 'fas fa-crown',
            ],
            [
                'title' => 'Vue Stratégique',
                'icon' => 'fas fa-chess',
                'children' => [
                    ['title' => 'KPI Généraux', 'url' => route('direction.kpi')],
                ['title' => 'Finances', 'url' => route('direction.financial')],
            ['title' => 'RH', 'url' => route('direction.hr')],
                ]
            ],
            [
                'title' => 'Administration',
                'url' => route('direction.admin'),
                'icon' => 'fas fa-building',
            ],
               [
                'title' => 'Gestion Académique',
                'icon' => 'fas fa-graduation-cap',
                'children' => [
                    ['title' => 'Annees Academiques', 'url' => route('academic.years.index')],
                    ['title' => 'Classes', 'url' => route('academic.classes.index')],
                    ['title' => 'Cours', 'url' => route('academic.courses.index')],
                    ['title' => 'Inscriptions', 'url' => ""],
                ]
            ],
            [
                'title' => 'Salles & Ressources',
                'url' => route('academic.classrooms.index'),
                'icon' => 'fas fa-door-open',
            ],
        ];
    }

    private function getComptableMenu(): array
    {
        return [
            [
                'title' => 'Dashboard Comptable',
                'url' => route('comptable.dashboard'),
                'icon' => 'fas fa-calculator',
            ],
            [
                'title' => 'Gestion Financière',
                'icon' => 'fas fa-euro-sign',
                'children' => [
                    ['title' => 'Honoraires Enseignants', 'url' => route('reports.teacher-earnings')],
                    ['title' => 'Paiements', 'url' => route('comptable.payments')],
                    ['title' => 'Factures', 'url' => route('comptable.invoices')],
                ]
            ],
            [
                'title' => 'Rapports Financiers',
                'url' => route('comptable.reports'),
                'icon' => 'fas fa-chart-line',
            ],
        ];
    }

    private function getCommunicationMenu(): array
    {
        return [
            [
                'title' => 'Dashboard Communication',
                'url' => route('communication.dashboard'),
                'icon' => 'fas fa-bullhorn',
            ],
            [
                'title' => 'Annonces',
                'url' => route('communication.announcements'),
                'icon' => 'fas fa-newspaper',
            ],
            [
                'title' => 'Notifications',
                'url' => route('communication.notifications'),
                'icon' => 'fas fa-bell',
            ],
            [
                'title' => 'Envois Groupés',
                'url' => route('communication.bulk-emails'),
                'icon' => 'fas fa-envelope-bulk',
            ],
        ];
    }

    private function getAdminMenu(): array
    {
        return [
            [
                'title' => 'Dashboard Admin',
                'url' => route('admin.dashboard'),
                'icon' => 'fas fa-cogs',
            ],
            [
                'title' => 'Gestion Utilisateurs',
                'icon' => 'fas fa-users-cog',
                'children' => [
                    ['title' => 'Tous les utilisateurs', 'url' => route('admin.users.index')],
                    ['title' => 'Créer utilisateur', 'url' => route('admin.users.create')],
                    ['title' => 'Rôles & Permissions', 'url' => route('admin.roles')],
                ]
            ],
               [
                'title' => 'Gestion Académique',
                'icon' => 'fas fa-graduation-cap',
                'children' => [
                    ['title' => 'Annees Academiques', 'url' => route('academic.years.index')],
                    ['title' => 'Classes', 'url' => route('academic.classes.index')],
                    ['title' => 'Cours', 'url' => route('academic.courses.index')],
                    ['title' => 'Inscriptions', 'url' => ""],
                ]
            ],
            [
                'title' => 'Salles & Ressources',
                'url' => route('academic.classrooms.index'),
                'icon' => 'fas fa-door-open',
            ],
            [
                'title' => 'Système',
                'icon' => 'fas fa-server',
                'children' => [
                    ['title' => 'Logs', 'url' => route('admin.logs')],
                    ['title' => 'Sauvegarde', 'url' => route('admin.backup')],
                    ['title' => 'Configuration', 'url' => route('admin.settings')],
                ]
            ],
        ];
    }
}
