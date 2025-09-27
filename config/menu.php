<?php

return [
    'etudiant' => [
        [
            'title' => 'Tableau de bord',
            'url' => '/dashboard',
            'icon' => 'fas fa-tachometer-alt',
        ],
        [
            'title' => 'Mes Cours',
            'url' => '/courses',
            'icon' => 'fas fa-book',
        ],
        [
            'title' => 'Notes & Résultats',
            'url' => '/grades',
            'icon' => 'fas fa-chart-line',
        ],
        [
            'title' => 'Planning',
            'url' => '/schedule',
            'icon' => 'fas fa-calendar',
        ],
        [
            'title' => 'Profil',
            'url' => '/profile',
            'icon' => 'fas fa-user',
        ],
    ],

    'admin' => [
        [
            'title' => 'Tableau de bord',
            'url' => '/admin/dashboard',
            'icon' => 'fas fa-tachometer-alt',
        ],
        [
            'title' => 'Gestion Utilisateurs',
            'icon' => 'fas fa-users',
            'children' => [
                ['title' => 'Étudiants', 'url' => '/admin/students'],
                ['title' => 'Enseignants', 'url' => '/admin/teachers'],
                ['title' => 'Staff Admin', 'url' => '/admin/staff'],
            ]
        ],
        [
            'title' => 'Gestion Académique',
            'icon' => 'fas fa-graduation-cap',
            'children' => [
                ['title' => 'Cours', 'url' => '/admin/courses'],
                ['title' => 'Classes', 'url' => '/admin/classes'],
                ['title' => 'Programmes', 'url' => '/admin/programs'],
            ]
        ],
        [
            'title' => 'Paramètres',
            'url' => '/admin/settings',
            'icon' => 'fas fa-cogs',
        ],
    ],

    'chef_scolarite' => [
        [
            'title' => 'Tableau de bord',
            'url' => '/scolarite/dashboard',
            'icon' => 'fas fa-tachometer-alt',
        ],
        [
            'title' => 'Inscriptions',
            'url' => '/scolarite/enrollments',
            'icon' => 'fas fa-user-plus',
        ],
        [
            'title' => 'Planning & Horaires',
            'url' => '/scolarite/schedules',
            'icon' => 'fas fa-calendar-alt',
        ],
        [
            'title' => 'Examens',
            'icon' => 'fas fa-file-alt',
            'children' => [
                ['title' => 'Planification', 'url' => '/scolarite/exams/planning'],
                ['title' => 'Résultats', 'url' => '/scolarite/exams/results'],
            ]
        ],
        [
            'title' => 'Rapports',
            'url' => '/scolarite/reports',
            'icon' => 'fas fa-chart-bar',
        ],
    ],

    'directeur_academique' => [
        [
            'title' => 'Tableau de bord',
            'url' => '/academic/dashboard',
            'icon' => 'fas fa-tachometer-alt',
        ],
        [
            'title' => 'Programmes Académiques',
            'url' => '/academic/programs',
            'icon' => 'fas fa-book-open',
        ],
        [
            'title' => 'Corps Enseignant',
            'url' => '/academic/faculty',
            'icon' => 'fas fa-chalkboard-teacher',
        ],
        [
            'title' => 'Évaluations',
            'url' => '/academic/evaluations',
            'icon' => 'fas fa-clipboard-check',
        ],
        [
            'title' => 'Statistiques',
            'url' => '/academic/analytics',
            'icon' => 'fas fa-chart-pie',
        ],
    ],

    'directeur_general' => [
        [
            'title' => 'Dashboard Exécutif',
            'url' => '/executive/dashboard',
            'icon' => 'fas fa-crown',
        ],
        [
            'title' => 'Vue d\'ensemble',
            'icon' => 'fas fa-eye',
            'children' => [
                ['title' => 'Indicateurs Clés', 'url' => '/executive/kpi'],
                ['title' => 'Rapports Financiers', 'url' => '/executive/financial'],
                ['title' => 'Performance Académique', 'url' => '/executive/academic-performance'],
            ]
        ],
        [
            'title' => 'Gestion Stratégique',
            'icon' => 'fas fa-chess',
            'children' => [
                ['title' => 'Objectifs', 'url' => '/executive/goals'],
                ['title' => 'Budgets', 'url' => '/executive/budgets'],
                ['title' => 'Ressources Humaines', 'url' => '/executive/hr'],
            ]
        ],
        [
            'title' => 'Administration',
            'url' => '/executive/admin',
            'icon' => 'fas fa-building',
        ],
    ],
];