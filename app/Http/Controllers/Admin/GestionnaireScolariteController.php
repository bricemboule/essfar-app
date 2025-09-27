<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Schedule;
use App\Models\Classroom;
use App\Models\Course;
use App\Models\StudentEnrollment;
use App\Models\Notification;
use App\Models\Task;
use App\Models\SchoolClass;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class GestionnaireScolariteController extends Controller
{
    public function __construct()
    {
        // Vérifier que l'utilisateur a le rôle gestionnaire_scolarite
        $this->middleware(['auth', 'role:gestionnaire_scolarite']);
    }

    public function dashboard()
    {
        return Inertia::render('Dashboards/GestionnaireScolarite/Dashboard', [
            'statistics' => $this->getStatistics(),
            'todaySchedules' => $this->getTodaySchedules(),
            'upcomingSchedules' => $this->getUpcomingSchedules(),
            'studentEnrollments' => $this->getRecentEnrollments(),
            'classReports' => $this->getClassReports(),
            'recentNotifications' => $this->getRecentNotifications(),
            'myTasks' => $this->getMyTasks(),
            'alerts' => $this->getOperationalAlerts(),
        ]);
    }

    /**
     * Obtenir les statistiques opérationnelles
     */
    private function getStatistics()
    {
        return [
            'schedules_today' => Schedule::whereDate('start_time', today())
                ->where('status', 'active')
                ->count(),
            'new_enrollments' => StudentEnrollment::whereBetween('created_at', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->count(),
            'pending_tasks' => Task::where('assigned_to', Auth::id())
                ->where('status', 'pending')
                ->count(),
            'notifications_sent' => Notification::where('created_by', Auth::id())
                ->whereDate('created_at', today())
                ->count(),
            'schedules_this_week' => Schedule::whereBetween('start_time', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->where('status', 'active')->count(),
            'total_students_managed' => $this->getTotalStudentsManaged(),
        ];
    }

    /**
     * Obtenir les plannings d'aujourd'hui
     */
    private function getTodaySchedules()
    {
        return Schedule::with(['course', 'classroom', 'teacher', 'students'])
            ->whereDate('start_time', today())
            ->where('status', 'active')
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'course_name' => $schedule->course->name ?? 'Cours',
                    'course_code' => $schedule->course->code ?? '',
                    'teacher_name' => $schedule->teacher->name ?? 'Non assigné',
                    'classroom' => $schedule->classroom->name ?? 'Salle TBD',
                    'start_time' => $schedule->start_time->format('H:i'),
                    'end_time' => $schedule->end_time->format('H:i'),
                    'students_count' => $schedule->students->count() ?? 0,
                    'status' => $schedule->status,
                    'duration' => $schedule->start_time->diffInMinutes($schedule->end_time),
                    'can_edit' => true, // Le gestionnaire peut modifier
                ];
            })
            ->toArray();
    }

    /**
     * Obtenir les prochains cours (3 prochains jours)
     */
    private function getUpcomingSchedules()
    {
        return Schedule::with(['course', 'classroom'])
            ->whereBetween('start_time', [
                Carbon::tomorrow(),
                Carbon::now()->addDays(3)
            ])
            ->where('status', 'active')
            ->orderBy('start_time')
            ->limit(10)
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'course_name' => $schedule->course->name ?? 'Cours',
                    'classroom' => $schedule->classroom->name ?? 'Salle TBD',
                    'date' => $schedule->start_time->format('d/m'),
                    'start_time' => $schedule->start_time->format('H:i'),
                    'day_name' => $schedule->start_time->format('l'),
                ];
            })
            ->toArray();
    }

    /**
     * Obtenir les inscriptions récentes à gérer
     */
    private function getRecentEnrollments()
    {
        return StudentEnrollment::with(['student', 'schoolClass'])
            ->where('managed_by', Auth::id())
            ->orWhere('status', 'in_progress')
            ->orderBy('updated_at', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'student' => [
                        'id' => $enrollment->student->id,
                        'name' => $enrollment->student->name,
                        'email' => $enrollment->student->email,
                        'photo_url' => $enrollment->student->profile_photo_url ?? null,
                    ],
                    'class_name' => $enrollment->schoolClass->name ?? 'Classe TBD',
                    'status' => $enrollment->status,
                    'created_at' => $enrollment->created_at->diffForHumans(),
                    'completion_percentage' => $this->calculateEnrollmentCompletion($enrollment),
                    'next_step' => $this->getNextEnrollmentStep($enrollment),
                ];
            })
            ->toArray();
    }

    /**
     * Obtenir les rapports de classes
     */
    private function getClassReports()
    {
        return SchoolClass::with(['students'])
            ->where('status', 'active')
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'class_name' => $class->name,
                    'student_count' => $class->students->count(),
                    'capacity' => $class->capacity ?? 30,
                    'occupancy_rate' => $class->capacity > 0 ? 
                        round(($class->students->count() / $class->capacity) * 100) : 0,
                    'specialization' => $class->specialization ?? 'Générale',
                    'level' => $class->level ?? 'N/A',
                ];
            })
            ->sortByDesc('student_count')
            ->values()
            ->toArray();
    }

    /**
     * Obtenir les notifications récentes
     */
    private function getRecentNotifications()
    {
        return Notification::where('created_by', Auth::id())
            ->orWhere('recipient_id', Auth::id())
            ->orWhere('recipient_role', 'gestionnaire_scolarite')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type ?? 'info',
                    'created_at' => $notification->created_at->diffForHumans(),
                    'is_read' => $notification->read_at !== null,
                    'sender' => $notification->creator->name ?? 'Système',
                ];
            })
            ->toArray();
    }

    /**
     * Obtenir mes tâches assignées
     */
    private function getMyTasks()
    {
        return Task::where('assigned_to', Auth::id())
            ->where('status', '!=', 'completed')
            ->orderBy('priority', 'desc')
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority ?? 'normal', // high, medium, normal
                    'due_date' => $task->due_date,
                    'deadline' => $task->due_date ? Carbon::parse($task->due_date)->diffForHumans() : 'Pas de limite',
                    'category' => $task->category ?? 'general',
                    'icon' => $this->getTaskIcon($task->category),
                    'completed' => $task->status === 'completed',
                    'progress' => $task->progress ?? 0,
                ];
            })
            ->toArray();
    }

    /**
     * Obtenir les alertes opérationnelles
     */
    private function getOperationalAlerts()
    {
        $alerts = [];

        // Vérifier les tâches en retard
        $overdueTasks = Task::where('assigned_to', Auth::id())
            ->where('due_date', '<', now())
            ->where('status', '!=', 'completed')
            ->count();

        if ($overdueTasks > 0) {
            $alerts[] = [
                'type' => 'danger',
                'icon' => 'exclamation-triangle',
                'title' => 'Tâches en retard',
                'message' => "Vous avez {$overdueTasks} tâches en retard qui nécessitent votre attention.",
                'action' => 'Voir les tâches'
            ];
        }

        // Vérifier les conflits de planning à résoudre
        $scheduleConflicts = $this->getMyScheduleConflicts();
        if ($scheduleConflicts > 0) {
            $alerts[] = [
                'type' => 'warning',
                'icon' => 'calendar-times',
                'title' => 'Conflits de planning',
                'message' => "{$scheduleConflicts} conflits de planning nécessitent des modifications.",
                'action' => 'Résoudre'
            ];
        }

        // Vérifier les inscriptions incomplètes
        $incompleteEnrollments = StudentEnrollment::where('managed_by', Auth::id())
            ->where('status', 'in_progress')
            ->where('created_at', '<', now()->subDays(3))
            ->count();

        if ($incompleteEnrollments > 0) {
            $alerts[] = [
                'type' => 'info',
                'icon' => 'user-clock',
                'title' => 'Inscriptions en attente',
                'message' => "{$incompleteEnrollments} inscriptions sont en cours depuis plus de 3 jours.",
                'action' => 'Finaliser'
            ];
        }

        return $alerts;
    }

    /**
     * Calculer le pourcentage de complétion d'une inscription
     */
    private function calculateEnrollmentCompletion($enrollment)
    {
        $steps = ['basic_info', 'academic_info', 'documents', 'payment', 'validation'];
        $completedSteps = 0;

        foreach ($steps as $step) {
            if ($enrollment->{$step . '_completed'} ?? false) {
                $completedSteps++;
            }
        }

        return round(($completedSteps / count($steps)) * 100);
    }

    /**
     * Obtenir la prochaine étape d'une inscription
     */
    private function getNextEnrollmentStep($enrollment)
    {
        if (!($enrollment->basic_info_completed ?? false)) return 'Informations de base';
        if (!($enrollment->academic_info_completed ?? false)) return 'Informations académiques';
        if (!($enrollment->documents_completed ?? false)) return 'Documents';
        if (!($enrollment->payment_completed ?? false)) return 'Paiement';
        if (!($enrollment->validation_completed ?? false)) return 'Validation finale';
        
        return 'Inscription complète';
    }

    /**
     * Obtenir l'icône pour un type de tâche
     */
    private function getTaskIcon($category)
    {
        $icons = [
            'schedule' => 'calendar-alt',
            'enrollment' => 'user-plus',
            'notification' => 'bell',
            'report' => 'chart-bar',
            'maintenance' => 'tools',
            'meeting' => 'users',
            'general' => 'tasks'
        ];

        return $icons[$category] ?? 'tasks';
    }

    /**
     * Obtenir le nombre total d'étudiants gérés
     */
    private function getTotalStudentsManaged()
    {
        return StudentEnrollment::where('managed_by', Auth::id())
            ->whereIn('status', ['completed', 'active'])
            ->count();
    }

    /**
     * Obtenir mes conflits de planning
     */
    private function getMyScheduleConflicts()
    {
        return Schedule::where('created_by', Auth::id())
            ->where('status', 'conflict')
            ->count();
    }

    /**
     * Créer un nouveau planning
     */
    public function createSchedule()
    {
        $courses = Course::where('status', 'active')->get();
        $classrooms = Classroom::where('status', 'active')->get();
        $teachers = User::where('role', 'enseignant')
            ->where('status', 'active')
            ->get();

        return Inertia::render('Schedules/Create', [
            'courses' => $courses,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Enregistrer un nouveau planning
     */
    public function storeSchedule(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'teacher_id' => 'required|exists:users,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'recurring' => 'boolean',
            'recurring_pattern' => 'nullable|string',
        ]);

        // Vérifier les conflits
        $conflicts = $this->checkScheduleConflicts($request->all());
        if ($conflicts->count() > 0) {
            return back()->withErrors([
                'schedule' => 'Conflit détecté avec un autre cours planifié.'
            ]);
        }

        $schedule = Schedule::create([
            'course_id' => $request->course_id,
            'classroom_id' => $request->classroom_id,
            'teacher_id' => $request->teacher_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'recurring' => $request->recurring ?? false,
            'recurring_pattern' => $request->recurring_pattern,
            'status' => 'active',
            'created_by' => Auth::id(),
        ]);

        // Si récurrent, créer les occurrences
        if ($request->recurring) {
            $this->createRecurringSchedules($schedule, $request->recurring_pattern);
        }

        return redirect()->route('schedules.index')->with('success', 'Planning créé avec succès');
    }

    /**
     * Mettre à jour un planning existant
     */
    public function updateSchedule(Request $request, Schedule $schedule)
    {
        // Vérifier les permissions
        if ($schedule->created_by !== Auth::id() && !Auth::user()->hasRole(['admin', 'chef_scolarite'])) {
            abort(403, 'Non autorisé à modifier ce planning');
        }

        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'teacher_id' => 'required|exists:users,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        // Vérifier les conflits (exclure le planning actuel)
        $conflicts = $this->checkScheduleConflicts($request->all(), $schedule->id);
        if ($conflicts->count() > 0) {
            return back()->withErrors([
                'schedule' => 'Conflit détecté avec un autre cours planifié.'
            ]);
        }

        $schedule->update($request->only([
            'course_id', 'classroom_id', 'teacher_id', 
            'start_time', 'end_time'
        ]));

        return back()->with('success', 'Planning mis à jour avec succès');
    }

    /**
     * Gérer les inscriptions d'étudiants
     */
    public function manageEnrollments()
    {
        $enrollments = StudentEnrollment::with(['student', 'schoolClass'])
            ->where('managed_by', Auth::id())
            ->orWhere('status', 'in_progress')
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        return Inertia::render('Enrollments/Manage', [
            'enrollments' => $enrollments
        ]);
    }

    /**
     * Mettre à jour le statut d'une inscription
     */
    public function updateEnrollmentStatus(Request $request, StudentEnrollment $enrollment)
    {
        $request->validate([
            'status' => 'required|in:in_progress,completed,on_hold,cancelled',
            'notes' => 'nullable|string'
        ]);

        $enrollment->update([
            'status' => $request->status,
            'notes' => $request->notes,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Statut d\'inscription mis à jour');
    }

    /**
     * Envoyer une notification
     */
    public function sendNotification(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'recipient_type' => 'required|in:individual,class,role,all',
            'recipient_id' => 'nullable|integer',
            'priority' => 'in:low,normal,high,urgent',
            'schedule_for' => 'nullable|date|after_or_equal:now',
        ]);

        $notification = Notification::create([
            'title' => $request->title,
            'message' => $request->message,
            'recipient_type' => $request->recipient_type,
            'recipient_id' => $request->recipient_id,
            'priority' => $request->priority ?? 'normal',
            'scheduled_for' => $request->schedule_for,
            'created_by' => Auth::id(),
            'status' => $request->schedule_for ? 'scheduled' : 'sent',
        ]);

        // Envoyer immédiatement si pas programmé
        if (!$request->schedule_for) {
            $this->dispatchNotification($notification);
        }

        return back()->with('success', 'Notification envoyée avec succès');
    }

    /**
     * Vérifier les conflits de planning
     */
    private function checkScheduleConflicts($data, $excludeId = null)
    {
        $query = Schedule::where('classroom_id', $data['classroom_id'])
            ->where('status', 'active')
            ->where(function ($q) use ($data) {
                $q->whereBetween('start_time', [$data['start_time'], $data['end_time']])
                  ->orWhereBetween('end_time', [$data['start_time'], $data['end_time']])
                  ->orWhere(function ($q2) use ($data) {
                      $q2->where('start_time', '<=', $data['start_time'])
                         ->where('end_time', '>=', $data['end_time']);
                  });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->get();
    }

    /**
     * Créer les plannings récurrents
     */
    private function createRecurringSchedules($baseSchedule, $pattern)
    {
        // Implémentation de la logique de récurrence
        // Exemple: chaque semaine pendant un semestre
    }

    /**
     * Dispatcher une notification
     */
    private function dispatchNotification($notification)
    {
        // Implémentation de l'envoi de notification
        // Peut utiliser queues, email, SMS, push notifications, etc.
    }

    /**
     * Marquer une tâche comme terminée
     */
    public function completeTask(Request $request, Task $task)
    {
        if ($task->assigned_to !== Auth::id()) {
            abort(403, 'Non autorisé à modifier cette tâche');
        }

        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completion_notes' => $request->input('notes'),
        ]);

        return response()->json([
            'message' => 'Tâche marquée comme terminée',
            'task' => $task
        ]);
    }

    /**
     * API pour rafraîchir le dashboard
     */
    public function refreshDashboard()
    {
        return response()->json([
            'statistics' => $this->getStatistics(),
            'alerts' => $this->getOperationalAlerts(),
            'myTasks' => $this->getMyTasks(),
            'updated_at' => now()->format('d/m/Y H:i:s')
        ]);
    }
}