<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Site\EcoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\EnseignantController;
use App\Http\Controllers\SchoolClassController;
use App\Http\Controllers\StudentEnrollmentController;
use App\Http\Controllers\Site\EtudeEssfarController;
use App\Http\Controllers\Site\CertificationController;
use App\Http\Controllers\Site\FormationController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/test-login', function() {
    return response()->json([
        'status' => 'OK',
        'user' => auth()->user(),
        'routes' => [
            'login' => route('login'),
            'register' => route('register')
        ]
    ]);
});

/*
|--------------------------------------------------------------------------
| Routes de l'école
|--------------------------------------------------------------------------
*/
Route::prefix('ecole')->name('ecole.')->group(function () {
    Route::get('/mot-du-directeur', [EcoleController::class, 'motDirecteur'])->name('motDirecteur');
    Route::get('/notre-gouvernance', [EcoleController::class, 'gouvernance'])->name('gouvernance');
    Route::get('/projet-pedagogique', [EcoleController::class, 'projetPedagogique'])->name('projet_pedagogique');
    Route::get('/partenaires', [EcoleController::class, 'partenaires'])->name('partenaires');
});

Route::prefix('etudier_a_essfar')->name('etudier_a_essfar.')->group(function () {
    Route::get('/etudiant', [EtudeEssfarController::class, 'je_suis_etudiant'])->name('etudiant');
    Route::get('/salarier', [EtudeEssfarController::class, 'je_suis_salarier'])->name('salarier');
    Route::get('/admission', [EtudeEssfarController::class, 'admission'])->name('admission');
    Route::get('/formations', [EtudeEssfarController::class, 'formations'])->name('nos_formations');
    Route::get('/anciens_sujets', [EtudeEssfarController::class, 'sujet'])->name('anciens_sujets');
    Route::get('/frais_scolarite', [EtudeEssfarController::class, 'scolarite'])->name('frais_scolarite');
});

Route::prefix('formation')->name('formation.')->group(function () {
    Route::get('/mathematiques_economie', [FormationController::class, 'Mathematiques'])->name('mathematiques_economie');
    Route::get('/informatique_des_organisations', [FormationController::class, 'Informatique'])->name('informatiques_des_organisations');
    Route::get('/actuatiat', [FormationController::class, 'Actuariat'])->name('actuariat');
    Route::get('/big_data', [FormationController::class, 'BigData'])->name('big_data');
    Route::get('/ingenierie_financiere', [FormationController::class, 'IngenierieFinanciere'])->name('ingenierie_financiere');
    Route::get('/systeme_information', [FormationController::class, 'Systeme_information'])->name('systeme_information');
});

Route::prefix('certifications')->name('certifications.')->group(function () {
    Route::get('/architecte_big_data', [CertificationController::class, 'architecte_big_data'])->name('iarchitecte_big_data');
    Route::get('/developpeur_web_mobile', [CertificationController::class, 'developpeur_web_mobile'])->name('developpeur_web_mobile');
    Route::get('/architecte_ia_big_data', [CertificationController::class, 'architecte_ia_big_data'])->name('architecte_ia_big_data');
    Route::get('/developpeur_sql', [CertificationController::class, 'developpeur_sql'])->name('developpeur_sql');
    Route::get('/camec', [CertificationController::class, 'camec'])->name('camec');
});

// Routes protégées nécessitant une authentification
Route::middleware(['auth', 'role:etudiant'])->prefix('etudiant')->name('etudiant.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Etudiant/Dashboard'))
        ->name('dashboard');
    
    Route::get('/schedule', function() {
        $user = auth()->user();
        $enrollment = $user->studentEnrollments()->where('status', 'active')->with('schoolClass')->first();
        
        if (!$enrollment) {
            return redirect()->route('etudiant.dashboard')
                ->with('error', 'Vous n\'êtes inscrit dans aucune classe.');
        }
        
        return redirect()->route('schedules.class', $enrollment->schoolClass);
    })->name('schedule');
    
    Route::get('/courses', fn () => Inertia::render('Dashboards/Etudiant/Courses'))
        ->name('courses');
    Route::get('/grades', fn () => Inertia::render('Dashboards/Etudiant/Grades'))
        ->name('grades');
});


// Routes GESTIONNAIRE SCOLARITÉ
Route::middleware(['auth', 'role:gestionnaire_scolarite,chef_scolarite,admin'])->prefix('gestionnaire')->name('gestionnaire.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Gestionnaire/Dashboard'))
        ->name('dashboard');
});

// Routes CHEF SCOLARITÉ
Route::middleware(['auth', 'role:chef_scolarite,admin'])->prefix('scolarite')->name('scolarite.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Scolarite/Dashboard'))
        ->name('dashboard');
    
    // Gestion complète des plannings
    Route::resource('planning', ScheduleController::class)->except(['show']);
    Route::get('/schedules/{schedule}', [ScheduleController::class, 'show'])->name('schedules.show');
    
    // Rapports
    Route::get('/reports/hours', [ReportsController::class, 'courseHoursReport'])
        ->name('reports.hours');
    Route::get('/reports/classrooms', [ReportsController::class, 'classroomUsageReport'])
        ->name('reports.classrooms');
});

// Routes DIRECTEUR ACADÉMIQUE
Route::middleware(['auth', 'role:directeur_academique,directeur_general,admin'])->prefix('academique')->name('academique.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Academique/Dashboard'))
        ->name('dashboard');
    
    Route::get('/programs', fn () => Inertia::render('Dashboards/Academique/Programs'))
        ->name('programs');
    Route::get('/performance', fn () => Inertia::render('Dashboards/Academique/Performance'))
        ->name('performance');
    Route::get('/teachers', fn () => Inertia::render('Dashboards/Academique/Teachers'))
        ->name('teachers');
});

// Routes DIRECTEUR GÉNÉRAL
Route::middleware(['auth', 'role:directeur_general,admin'])->prefix('direction')->name('direction.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Direction/Dashboard'))
        ->name('dashboard');
    
    Route::get('/kpi', fn () => Inertia::render('Dashboards/Direction/KPI'))
        ->name('kpi');
    Route::get('/financial', fn () => Inertia::render('Dashboards/Direction/Financial'))
        ->name('financial');
    Route::get('/hr', fn () => Inertia::render('Dashboards/Direction/HR'))
        ->name('hr');
    Route::get('/admin', fn () => Inertia::render('Dashboards/Direction/Administration'))
        ->name('admin');
});

// Routes COMPTABLE
Route::middleware(['auth', 'role:comptable,directeur_general,admin'])->prefix('comptable')->name('comptable.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Comptable/Dashboard'))
        ->name('dashboard');
    
    Route::get('/payments', fn () => Inertia::render('Dashboards/Comptable/Payments'))
        ->name('payments');
    Route::get('/invoices', fn () => Inertia::render('Dashboards/Comptable/Invoices'))
        ->name('invoices');
    Route::get('/reports', fn () => Inertia::render('Dashboards/Comptable/Reports'))
        ->name('reports');
});

// Routes COMMUNICATION
Route::middleware(['auth', 'role:communication,chef_scolarite,directeur_general,admin'])->prefix('communication')->name('communication.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Communication/Dashboard'))
        ->name('dashboard');
    
    Route::get('/announcements', fn () => Inertia::render('Dashboards/Communication/Announcements'))
        ->name('announcements');
    Route::get('/notifications', fn () => Inertia::render('Dashboards/Communication/Notifications'))
        ->name('notifications');
    Route::get('/bulk-emails', fn () => Inertia::render('Dashboards/Communication/BulkEmails'))
        ->name('bulk-emails');
});

// Routes ADMIN (accès complet)
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
     Route::get('/dashboard', [AdminDashboardController::class, 'index'])
        ->name('dashboard');
    
    // Gestion des utilisateurs
    Route::resource('users', UserController::class);
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->name('users.toggle-status');
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])
        ->name('users.reset-password');
    
    // Gestion des rôles et permissions
    Route::get('/roles', fn () => Inertia::render('Dashboards/Admin/Roles'))
        ->name('roles');
    
    // Système
    Route::get('/logs', fn () => Inertia::render('Dashboards/Admin/Logs'))
        ->name('logs');
    Route::get('/backup', fn () => Inertia::render('Dashboards/Admin/Backup'))
        ->name('backup');
    Route::get('/settings', fn () => Inertia::render('Dashboards/Admin/Settings'))
        ->name('settings');
});

/*
|--------------------------------------------------------------------------
| Routes du système de planning (accès selon les permissions)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
    
    // Consultation des plannings (tous les utilisateurs connectés)
    Route::get('/schedules/teacher/{teacher}', [ScheduleController::class, 'teacherSchedule'])
        ->name('schedules.teacher')
        ->middleware('auth');

    
    Route::get('/schedules/class/{class}', [ScheduleController::class, 'classSchedule'])
        ->name('schedules.class');
    
    // Gestion des plannings (permissions spéciales)
 Route::middleware(['auth', 'permission:manage_schedules'])->prefix('planning')->name('planning.')->group(function () {
    
    Route::resource('schedules', ScheduleController::class)->parameters([
        '' => 'schedule'
    ])->names([
        'index' => 'index',
        'create' => 'create',
        'store' => 'store',
        'show' => 'show',
        'edit' => 'edit',
        'update' => 'update',
        'destroy' => 'destroy'
    ]);

    Route::post('/{schedule}/mark-completed', [ScheduleController::class, 'markCompleted'])
        ->name('mark-completed');
    
    // Annuler une séance avec raison
    Route::post('/{schedule}/cancel', [ScheduleController::class, 'cancel'])
        ->name('cancel');
    
    // Actions groupées sur plusieurs séances
    Route::post('/bulk-action', [ScheduleController::class, 'bulkAction'])
        ->name('bulk-action');

 
    Route::get('/teacher/{teacher}', [ScheduleController::class, 'teacherSchedule'])
        ->name('teacher');
    
    // Planning d'une classe spécifique
    Route::get('/class/{class}', [ScheduleController::class, 'classSchedule'])
        ->name('class');

   
    Route::get('/reports/hours', [ScheduleController::class, 'hoursReport'])
        ->name('hours-report');
    
   
    Route::get('/rapport/honoraire', [ScheduleController::class, 'teacherEarningsReport'])
        ->name('honoraire');

    Route::post('/send-email', [ScheduleController::class, 'sendScheduleEmail'])
        ->name('send-email');

    /*
    |--------------------------------------------------------------------------
    | Exports (Excel, PDF, CSV)
    |--------------------------------------------------------------------------
    */
    // Exporter le planning général
    Route::get('/export/schedule', [ScheduleController::class, 'exportClassSchedulePdf'])
        ->name('export.planning');
    Route::get('/classe/{class}/export-pdf', [ScheduleController::class, 'exportClassSchedulePdf'])
    ->name('class.export-pdf');
    
    // Exporter le rapport d'heures
    Route::get('/export/hours-report', [ScheduleController::class, 'exportHoursReport'])
        ->name('export.hours-report');
    
    // Exporter le rapport des honoraires
    Route::get('/export/earnings-report', [ScheduleController::class, 'exportEarningsReport'])
        ->name('export.earnings-report');

    Route::get('/classes/{class}/courses', [CourseController::class, 'coursesByClass'])
    ->name('classes.courses');

});
    
    // Rapports (selon les permissions)
    Route::middleware(['permission:view_reports'])->prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportsController::class, 'index'])->name('index');
        Route::get('/course-hours', [ReportsController::class, 'courseHoursReport'])->name('course-hours');
        Route::get('/classroom-usage', [ReportsController::class, 'classroomUsageReport'])->name('classroom-usage');
        Route::get('/weekly-schedule-pdf', [ReportsController::class, 'weeklySchedulePdf'])->name('weekly-schedule-pdf');
    });
    
    // Rapports financiers (comptables + direction)
    Route::middleware(['permission:view_financial_reports'])->group(function () {
        
        Route::get('/reports/teacher-earnings/export', [ReportsController::class, 'exportTeacherEarningsPdfRequest'])
    ->name('reports.export-earnings');
    
    });
    
    // Gestion académique (chef scolarité + direction académique)
   Route::middleware(['permission:manage_academic'])
    ->prefix('academic')
    ->name('academic.')
    ->group(function () {

        Route::resource('years', AcademicYearController::class);
        Route::resource('classes', SchoolClassController::class);

        Route::get('/etudiants/export', [EtudiantController::class, 'export'])
            ->name('etudiants.export');
        Route::resource('etudiants', EtudiantController::class);
        Route::resource('enseignants', EnseignantController::class);

        Route::get('/courses/{course}/teachers', [CourseController::class, 'teachers'])
            ->name('courses.teachers');

        Route::get('/courses/{course}/classes', [CourseController::class, 'classes'])
            ->name('courses.classes');

        Route::resource('courses', CourseController::class);
        Route::resource('classrooms', ClassroomController::class);
    });

});

// Routes de profil (tous les utilisateurs connectés)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Routes de profil
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// IMPORTANT: Cette ligne doit être à la fin
require __DIR__.'/auth.php';