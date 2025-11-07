<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Site\EcoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Scolarite\ScheduleController;
use App\Http\Controllers\Scolarite\ReportsController;
use App\Http\Controllers\Scolarite\AcademicYearController;
use App\Http\Controllers\Scolarite\ClassroomController;
use App\Http\Controllers\Scolarite\CourseController;
use App\Http\Controllers\Scolarite\EtudiantController;
use App\Http\Controllers\Scolarite\ResourceController;
use App\Http\Controllers\Scolarite\EnseignantController;
use App\Http\Controllers\Scolarite\SchoolClassController;
use App\Http\Controllers\Scolarite\AttendanceController;
use App\Http\Controllers\Etudiant\StudentAttendanceController;
use App\Http\Controllers\Site\EtudeEssfarController;
use App\Http\Controllers\Site\CertificationController;
use App\Http\Controllers\Site\FormationController;
use App\Http\Controllers\Etudiant\EtudiantResourceController;
use App\Http\Controllers\Scolarite\ScolariteDashboardController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Routes du site public
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

/*
|--------------------------------------------------------------------------
| Routes communes (tous les utilisateurs authentifiés)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    // Profil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Consultation des plannings
    Route::get('/schedules/teacher/{teacher}', [ScheduleController::class, 'teacherSchedule'])->name('schedules.teacher');
    Route::get('/schedules/class/{class}', [ScheduleController::class, 'classSchedule'])->name('schedules.class');
    
    // Rapports généraux
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportsController::class, 'index'])->name('index');
        Route::get('/course-hours', [ReportsController::class, 'courseHoursReport'])->name('course-hours');
        Route::get('/classroom-usage', [ReportsController::class, 'classroomUsageReport'])->name('classroom-usage');
        Route::get('/weekly-schedule-pdf', [ReportsController::class, 'weeklySchedulePdf'])->name('weekly-schedule-pdf');
        Route::get('/teacher-earnings/export', [ReportsController::class, 'exportTeacherEarningsPdfRequest'])->name('export-earnings');
    });
});

/*
|--------------------------------------------------------------------------
| Routes ÉTUDIANT
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:etudiant'])->prefix('etudiant')->name('etudiant.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Etudiant/Dashboard'))->name('dashboard');
    
    Route::get('/schedule', function() {
        $user = auth()->user();
        $enrollment = $user->studentEnrollments()->where('status', 'active')->with('schoolClass')->first();
        
        if (!$enrollment) {
            return redirect()->route('etudiant.dashboard')
                ->with('error', 'Vous n\'êtes inscrit dans aucune classe.');
        }
        
        return redirect()->route('schedules.class', $enrollment->schoolClass);
    })->name('schedule');

    // Absences
    Route::prefix('attendances')->name('attendances.')->group(function () {
        Route::get('/', [StudentAttendanceController::class, 'index'])->name('index');
        Route::get('/statistics', [StudentAttendanceController::class, 'statistics'])->name('statistics');
        Route::get('/{attendance}', [StudentAttendanceController::class, 'show'])->name('show');
        Route::get('/{attendance}/justify', [StudentAttendanceController::class, 'justifyForm'])->name('justify-form');
        Route::post('/{attendance}/justify', [StudentAttendanceController::class, 'submitJustification'])->name('submit-justification');
        Route::get('/{attendance}/download-justification', [StudentAttendanceController::class, 'downloadJustification'])->name('download-justification');
    });
    
    Route::get('/courses', fn () => Inertia::render('Dashboards/Etudiant/Courses'))->name('courses');
    Route::get('/grades', fn () => Inertia::render('Dashboards/Etudiant/Grades'))->name('grades');

    // Ressources
    Route::prefix('resources')->name('resources.')->group(function () {
        Route::get('/', [EtudiantResourceController::class, 'index'])->name('index');
        Route::get('/statistics', [EtudiantResourceController::class, 'statistics'])->name('statistics');
        Route::get('/{resource}', [EtudiantResourceController::class, 'show'])->name('show');
        Route::get('/{resource}/download', [EtudiantResourceController::class, 'download'])->name('download');
    });
});

/*
|--------------------------------------------------------------------------
| Helper function pour les routes communes de gestion
|--------------------------------------------------------------------------
*/
function registerManagementRoutes() {
    // Routes de planning
    Route::prefix('planning')->name('planning.')->group(function () {
        Route::resource('schedules', ScheduleController::class)->parameters(['' => 'schedule']);
        Route::post('/{schedule}/mark-completed', [ScheduleController::class, 'markCompleted'])->name('mark-completed');
        Route::post('/{schedule}/cancel', [ScheduleController::class, 'cancel'])->name('cancel');
        Route::post('/bulk-action', [ScheduleController::class, 'bulkAction'])->name('bulk-action');
        Route::get('/teacher/{teacher}', [ScheduleController::class, 'teacherSchedule'])->name('teacher');
        Route::get('/class/{class}', [ScheduleController::class, 'classSchedule'])->name('class');
        Route::get('/reports/hours', [ScheduleController::class, 'hoursReport'])->name('hours-report');
        Route::get('/rapport/honoraire', [ScheduleController::class, 'teacherEarningsReport'])->name('honoraire');
        Route::post('/send-email', [ScheduleController::class, 'sendScheduleEmail'])->name('send-email');
        Route::get('/export/schedule', [ScheduleController::class, 'exportClassSchedulePdf'])->name('export.planning');
        Route::get('/classe/{class}/export-pdf', [ScheduleController::class, 'exportClassSchedulePdf'])->name('class.export-pdf');
        Route::get('/export/hours-report', [ScheduleController::class, 'exportHoursReport'])->name('export.hours-report');
        Route::get('/export/earnings-report', [ScheduleController::class, 'exportEarningsReport'])->name('export.earnings-report');
        Route::get('/classes/{class}/courses', [CourseController::class, 'coursesByClass'])->name('classes.courses');
        Route::get('/course/{course}/classes', [ScheduleController::class, 'getClassesForCourse'])
        ->name('course-classes');
    });

    // Routes d'absences
    Route::prefix('attendances')->name('attendances.')->group(function () {
        Route::get('/', [AttendanceController::class, 'index'])->name('index');
        Route::get('/create', [AttendanceController::class, 'create'])->name('create');
        Route::post('/', [AttendanceController::class, 'store'])->name('store');
        Route::get('/{attendance}', [AttendanceController::class, 'show'])->name('show');
        Route::put('/{attendance}', [AttendanceController::class, 'update'])->name('edit');
        Route::delete('/{attendance}', [AttendanceController::class, 'destroy'])->name('destroy');
        Route::get('/justifications/pending', [AttendanceController::class, 'pendingJustifications'])->name('pending-justifications');
        Route::post('/{attendance}/validate', [AttendanceController::class, 'validateJustification'])->name('validate-justification');
        Route::get('/reports/by-class', [AttendanceController::class, 'reportByClass'])->name('report-by-class');
        Route::get('/reports/by-subject/{class}', [AttendanceController::class, 'reportBySubject'])->name('report-by-subject');
    });

    // Routes de ressources
    Route::prefix('resources')->name('resources.')->group(function () {
        Route::get('/', [ResourceController::class, 'index'])->name('index');
        Route::get('/create', [ResourceController::class, 'create'])->name('create');
        Route::post('/', [ResourceController::class, 'store'])->name('store');
        Route::get('/statistics', [ResourceController::class, 'statistics'])->name('statistics');
        Route::get('/{resource}', [ResourceController::class, 'show'])->name('show');
        Route::get('/{resource}/edit', [ResourceController::class, 'edit'])->name('edit');
        Route::put('/{resource}', [ResourceController::class, 'update'])->name('update');
        Route::delete('/{resource}', [ResourceController::class, 'destroy'])->name('destroy');
        Route::get('/{resource}/download', [ResourceController::class, 'download'])->name('download');
        Route::post('/{resource}/toggle-status', [ResourceController::class, 'toggleStatus'])->name('toggle-status');
    });
}

/*
|--------------------------------------------------------------------------
| Routes GESTIONNAIRE SCOLARITÉ
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:gestionnaire_scolarite'])->prefix('gestionnaire')->name('gestionnaire.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Gestionnaire/Dashboard'))->name('dashboard');
    registerManagementRoutes();
});

/*
|--------------------------------------------------------------------------
| Routes CHEF SCOLARITÉ
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:chef_scolarite'])->prefix('scolarite')->name('scolarite.')->group(function () {
    Route::get('/dashboard', [ScolariteDashboardController::class, 'index'])->name('dashboard');
    
    registerManagementRoutes();

    // Gestion académique complète
    Route::resource('years', AcademicYearController::class);
    Route::resource('classes', SchoolClassController::class);
    
    Route::prefix('etudiants')->name('etudiants.')->group(function () {
        Route::get('/template', [EtudiantController::class, 'downloadTemplate'])->name('template');
        Route::post('/import', [EtudiantController::class, 'import'])->name('import');
        Route::get('/export', [EtudiantController::class, 'export'])->name('export');
    });
    Route::post('/etudiants/bulk-action', [EtudiantController::class, 'bulkAction'])->name('etudiants.bulk-action');
    Route::resource('etudiants', EtudiantController::class);
    
    Route::resource('enseignants', EnseignantController::class);
    Route::get('/courses/{course}/teachers', [CourseController::class, 'teachers'])->name('courses.teachers');
    Route::get('/courses/{course}/classes', [CourseController::class, 'classes'])->name('courses.classes');
    Route::resource('courses', CourseController::class);
    Route::resource('classrooms', ClassroomController::class);
    
    // Rapports
    Route::get('/reports/hours', [ReportsController::class, 'courseHoursReport'])->name('reports.hours');
    Route::get('/reports/classrooms', [ReportsController::class, 'classroomUsageReport'])->name('reports.classrooms');
});

/*
|--------------------------------------------------------------------------
| Routes DIRECTEUR ACADÉMIQUE (consultation uniquement)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:directeur_academique'])->prefix('academique')->name('academique.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Academique/Dashboard'))->name('dashboard');
    Route::get('/programs', fn () => Inertia::render('Dashboards/Academique/Programs'))->name('programs');
    Route::get('/performance', fn () => Inertia::render('Dashboards/Academique/Performance'))->name('performance');
    Route::get('/teachers', fn () => Inertia::render('Dashboards/Academique/Teachers'))->name('teachers');

    // Consultation uniquement (pas de création/modification)
    Route::get('/attendances', [AttendanceController::class, 'index'])->name('attendances.index');
    Route::get('/attendances/{attendance}', [AttendanceController::class, 'show'])->name('attendances.show');
    Route::get('/attendances/reports/by-class', [AttendanceController::class, 'reportByClass'])->name('attendances.report-by-class');
    Route::get('/attendances/reports/by-subject/{class}', [AttendanceController::class, 'reportBySubject'])->name('attendances.report-by-subject');

    Route::get('/years', [AcademicYearController::class, 'index'])->name('years.index');
    Route::get('/years/{year}', [AcademicYearController::class, 'show'])->name('years.show');
    Route::get('/classes', [SchoolClassController::class, 'index'])->name('classes.index');
    Route::get('/classes/{class}', [SchoolClassController::class, 'show'])->name('classes.show');
    Route::get('/etudiants', [EtudiantController::class, 'index'])->name('etudiants.index');
    Route::get('/etudiants/{etudiant}', [EtudiantController::class, 'show'])->name('etudiants.show');
    Route::get('/enseignants', [EnseignantController::class, 'index'])->name('enseignants.index');
    Route::get('/enseignants/{enseignant}', [EnseignantController::class, 'show'])->name('enseignants.show');
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
});

/*
|--------------------------------------------------------------------------
| Routes DIRECTEUR GÉNÉRAL (accès en lecture + rapports)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:directeur_general'])->prefix('direction')->name('direction.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Direction/Dashboard'))->name('dashboard');
    Route::get('/kpi', fn () => Inertia::render('Dashboards/Direction/KPI'))->name('kpi');
    Route::get('/financial', fn () => Inertia::render('Dashboards/Direction/Financial'))->name('financial');
    Route::get('/hr', fn () => Inertia::render('Dashboards/Direction/HR'))->name('hr');
    Route::get('/admin', fn () => Inertia::render('Dashboards/Direction/Administration'))->name('admin');

    // Planning (consultation + rapports)
    Route::prefix('planning')->name('planning.')->group(function () {
        Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
        Route::get('/schedules/{schedule}', [ScheduleController::class, 'show'])->name('schedules.show');
        Route::get('/teacher/{teacher}', [ScheduleController::class, 'teacherSchedule'])->name('teacher');
        Route::get('/class/{class}', [ScheduleController::class, 'classSchedule'])->name('class');
        Route::get('/reports/hours', [ScheduleController::class, 'hoursReport'])->name('hours-report');
        Route::get('/rapport/honoraire', [ScheduleController::class, 'teacherEarningsReport'])->name('honoraire');
        Route::get('/export/hours-report', [ScheduleController::class, 'exportHoursReport'])->name('export.hours-report');
        Route::get('/export/earnings-report', [ScheduleController::class, 'exportEarningsReport'])->name('export.earnings-report');
    });

    // Absences (consultation)
    Route::get('/attendances', [AttendanceController::class, 'index'])->name('attendances.index');
    Route::get('/attendances/{attendance}', [AttendanceController::class, 'show'])->name('attendances.show');
    Route::get('/attendances/justifications/pending', [AttendanceController::class, 'pendingJustifications'])->name('attendances.pending-justifications');
    Route::get('/attendances/reports/by-class', [AttendanceController::class, 'reportByClass'])->name('attendances.report-by-class');
    Route::get('/attendances/reports/by-subject/{class}', [AttendanceController::class, 'reportBySubject'])->name('attendances.report-by-subject');

    // Données académiques (consultation)
    Route::get('/years', [AcademicYearController::class, 'index'])->name('years.index');
    Route::get('/years/{year}', [AcademicYearController::class, 'show'])->name('years.show');
    Route::get('/classes', [SchoolClassController::class, 'index'])->name('classes.index');
    Route::get('/classes/{class}', [SchoolClassController::class, 'show'])->name('classes.show');
    Route::get('/etudiants', [EtudiantController::class, 'index'])->name('etudiants.index');
    Route::get('/etudiants/{etudiant}', [EtudiantController::class, 'show'])->name('etudiants.show');
    Route::get('/enseignants', [EnseignantController::class, 'index'])->name('enseignants.index');
    Route::get('/enseignants/{enseignant}', [EnseignantController::class, 'show'])->name('enseignants.show');
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
});

/*
|--------------------------------------------------------------------------
| Routes COMPTABLE
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:comptable'])->prefix('comptable')->name('comptable.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Comptable/Dashboard'))->name('dashboard');
    Route::get('/payments', fn () => Inertia::render('Dashboards/Comptable/Payments'))->name('payments');
    Route::get('/invoices', fn () => Inertia::render('Dashboards/Comptable/Invoices'))->name('invoices');
    Route::get('/reports', fn () => Inertia::render('Dashboards/Comptable/Reports'))->name('reports');

    // Rapports financiers
    Route::get('/planning/rapport/honoraire', [ScheduleController::class, 'teacherEarningsReport'])->name('planning.honoraire');
    Route::get('/planning/export/earnings-report', [ScheduleController::class, 'exportEarningsReport'])->name('planning.export.earnings-report');
});

/*
|--------------------------------------------------------------------------
| Routes COMMUNICATION
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:communication'])->prefix('communication')->name('communication.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboards/Communication/Dashboard'))->name('dashboard');
    Route::get('/announcements', fn () => Inertia::render('Dashboards/Communication/Announcements'))->name('announcements');
    Route::get('/notifications', fn () => Inertia::render('Dashboards/Communication/Notifications'))->name('notifications');
    Route::get('/bulk-emails', fn () => Inertia::render('Dashboards/Communication/BulkEmails'))->name('bulk-emails');
});

/*
|--------------------------------------------------------------------------
| Routes ADMIN (accès complet)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // Gestion des utilisateurs
    Route::resource('users', UserController::class);
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    
    // Système
    Route::get('/roles', fn () => Inertia::render('Dashboards/Admin/Roles'))->name('roles');
    Route::get('/logs', fn () => Inertia::render('Dashboards/Admin/Logs'))->name('logs');
    Route::get('/backup', fn () => Inertia::render('Dashboards/Admin/Backup'))->name('backup');
    Route::get('/settings', fn () => Inertia::render('Dashboards/Admin/Settings'))->name('settings');

    // Accès complet à toutes les routes de gestion
    registerManagementRoutes();

    // Gestion académique complète
    Route::resource('years', AcademicYearController::class);
    Route::resource('classes', SchoolClassController::class);
    
    Route::prefix('etudiants')->name('etudiants.')->group(function () {
        Route::get('/template', [EtudiantController::class, 'downloadTemplate'])->name('template');
        Route::post('/import', [EtudiantController::class, 'import'])->name('import');
        Route::get('/export', [EtudiantController::class, 'export'])->name('export');
    });
    Route::post('/etudiants/bulk-action', [EtudiantController::class, 'bulkAction'])->name('etudiants.bulk-action');
    Route::resource('etudiants', EtudiantController::class);
    
    Route::resource('enseignants', EnseignantController::class);
    Route::get('/courses/{course}/teachers', [CourseController::class, 'teachers'])->name('courses.teachers');
    Route::get('/courses/{course}/classes', [CourseController::class, 'classes'])->name('courses.classes');
    Route::resource('courses', CourseController::class);
    Route::resource('classrooms', ClassroomController::class);
});

require __DIR__.'/auth.php';