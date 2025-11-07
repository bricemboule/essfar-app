<?php

namespace App\Http\Controllers\Scolarite;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Course;
use App\Models\SchoolClass;
use App\Models\Classroom;
use App\Models\User;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ScolariteDashboardController extends Controller
{
    public function index()
    {
        $academicYear = AcademicYear::active()->first();
        
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        // Statistiques principales
        $statistics = [
            'schedules_today' => Schedule::whereDate('start_time', $today)
                ->where('status', 'scheduled')
                ->count(),
            
            'occupied_classrooms' => Schedule::whereDate('start_time', $today)
                ->whereBetween('start_time', [now()->subHours(2), now()->addHours(2)])
                ->distinct('classroom_id')
                ->count('classroom_id'),
            
            'total_classrooms' => Classroom::where('is_available', true)->count(),
            
            'pending_enrollments' => DB::table('student_enrollments')
                ->where('status', 'pending')
                ->count(),
            
            'schedule_changes' => Schedule::where('status', 'rescheduled')
                ->whereDate('updated_at', '>=', $today->subDays(7))
                ->count(),
        ];

        // Récupérer toutes les classes actives (SANS mapper)
        $classesCollection = SchoolClass::where('academic_year_id', $academicYear->id)
            ->withCount('students')
            ->orderBy('name')
            ->get();

        // Planning de la semaine organisé par classe
        $weeklySchedulesByClass = [];
        
        foreach ($classesCollection as $class) {
            $weeklySchedulesByClass[$class->id] = $this->getWeeklyScheduleGrid(
                $startOfWeek, 
                $endOfWeek, 
                $class->id
            );
        }

        // Maintenant transformer pour Inertia
        $classes = $classesCollection->map(function ($class) {
            return [
                'id' => $class->id,
                'name' => $class->name,
                'cycle' => $class->cycle ?? 'licence', // Valeur par défaut
                'students_count' => $class->students_count,
            ];
        })->values();

        // Répartition des cours
        $courseDistribution = Course::where('academic_year_id', $academicYear->id)
            ->withCount('schedules')
            ->with('classes')
            ->get()
            ->map(function ($course) {
                $totalHours = Schedule::where('course_id', $course->id)
                    ->where('status', 'completed')
                    ->get()
                    ->sum(function ($schedule) {
                        return $schedule->start_time->diffInHours($schedule->end_time);
                    });

                return [
                    'subject' => $course->name,
                    'hours' => $totalHours,
                    'classes_count' => $course->classes->count(),
                    'teachers_count' => $course->teachers()->count(),
                ];
            })
            ->sortByDesc('hours')
            ->take(6)
            ->values();

        // Utilisation des salles
        $classroomUtilization = Classroom::where('is_available', true)
            ->get()
            ->map(function ($classroom) use ($startOfWeek, $endOfWeek) {
                $totalSlots = 50;
                $occupiedSlots = Schedule::where('classroom_id', $classroom->id)
                    ->whereBetween('start_time', [$startOfWeek, $endOfWeek])
                    ->count();
                
                return [
                    'name' => $classroom->name,
                    'capacity' => $classroom->capacity,
                    'utilization' => $totalSlots > 0 ? round(($occupiedSlots / $totalSlots) * 100) : 0,
                ];
            })
            ->sortByDesc('utilization')
            ->take(5)
            ->values();

        // Inscriptions en attente
        $pendingEnrollments = DB::table('student_enrollments')
            ->join('users', 'student_enrollments.student_id', '=', 'users.id')
            ->join('school_classes', 'student_enrollments.school_class_id', '=', 'school_classes.id')
            ->where('student_enrollments.status', 'pending')
            ->select([
                'student_enrollments.id',
                'users.name as student_name',
              
                'school_classes.name as requested_class',
                'student_enrollments.created_at',
          
            ])
            ->orderBy('student_enrollments.created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'student' => [
                        'name' => $enrollment->student_name,
                        'photo_url' => $enrollment->student_photo 
                            ? asset('storage/' . $enrollment->student_photo) 
                            : null,
                    ],
                    'requested_class' => $enrollment->requested_class,
                    'created_at' => Carbon::parse($enrollment->created_at)->format('d/m/Y'),
                    'reason' => $enrollment->reason ?? 'Non spécifié',
                ];
            });

        // Notifications de planning
        $scheduleNotifications = Schedule::where('status', 'rescheduled')
            ->orWhere('status', 'cancelled')
            ->whereDate('updated_at', '>=', $today->subDays(3))
            ->with(['course', 'teacher', 'schoolClass'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($schedule) {
                return [
                    'title' => $schedule->status === 'cancelled' 
                        ? 'Cours annulé' 
                        : 'Cours reprogrammé',
                    'message' => "{$schedule->course->name} - {$schedule->schoolClass->name}",
                    'time' => $schedule->updated_at->diffForHumans(),
                ];
            });

        // Alertes importantes
        $alerts = [];

        if ($statistics['pending_enrollments'] > 10) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Inscriptions en attente',
                'message' => "Vous avez {$statistics['pending_enrollments']} inscriptions en attente de traitement.",
                'time' => 'Maintenant',
                'priority' => 'high',
                'action' => 'Traiter maintenant'
            ];
        }

        if ($statistics['schedule_changes'] > 5) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Modifications de planning',
                'message' => "{$statistics['schedule_changes']} modifications de planning cette semaine nécessitent votre attention.",
                'time' => 'Cette semaine',
                'priority' => 'medium',
            ];
        }

        return Inertia::render('Dashboards/Scolarite/Dashboard', [
            'statistics' => $statistics,
            'weeklySchedulesByClass' => $weeklySchedulesByClass,
            'classes' => $classes,
            'courseDistribution' => $courseDistribution,
            'classroomUtilization' => $classroomUtilization,
            'pendingEnrollments' => $pendingEnrollments,
            'scheduleNotifications' => $scheduleNotifications,
            'alerts' => $alerts,
        ]);
    }

    private function getWeeklyScheduleGrid($startOfWeek, $endOfWeek, $classId)
    {
        // Récupérer la classe avec son cycle
        $schoolClass = SchoolClass::find($classId);
        
        // Créneaux horaires standards
        $timeSlots = [
            ['time' => '08:00-12:00', 'start' => '08:00', 'end' => '12:00'],
            ['time' => '13:00-17:00', 'start' => '13:00', 'end' => '17:00'],
            ['time' => '17:00-21:00', 'start' => '17:00', 'end' => '21:00'],
        ];

        $schedules = Schedule::with(['course', 'teacher', 'schoolClass', 'classroom'])
            ->where('school_class_id', $classId)
            ->whereBetween('start_time', [$startOfWeek, $endOfWeek])
            ->whereIn('status', ['scheduled', 'completed'])
            ->orderBy('start_time')
            ->get();

        \Log::info("Schedules pour classe {$classId}: " . $schedules->count());

        $weekGrid = [];

        foreach ($timeSlots as $slot) {
            $slotData = [
                'time' => $slot['time'],
                'days' => []
            ];

            // Pour chaque jour de la semaine (Lundi = 1, Dimanche = 7)
            for ($day = 1; $day <= 7; $day++) {
                $dayDate = $startOfWeek->copy()->addDays($day - 1);
                
                // Filtrer les cours pour ce jour et ce créneau
                $dayCourses = $schedules->filter(function ($schedule) use ($dayDate, $slot) {
                    $scheduleDate = $schedule->start_time->format('Y-m-d');
                    $scheduleTime = $schedule->start_time->format('H:i');
                    
                    return $scheduleDate === $dayDate->format('Y-m-d') 
                        && $scheduleTime >= $slot['start'] 
                        && $scheduleTime < $slot['end'];
                });

                // Déterminer si c'est une classe de licence
                $isLicence = $schoolClass && isset($schoolClass->cycle) 
                    ? strtolower($schoolClass->cycle) === 'licence' 
                    : false;

                $slotData['days'][] = [
                    'date' => $dayDate->format('Y-m-d'),
                    'is_licence' => $isLicence,
                    'courses' => $dayCourses->map(function ($schedule) {
                        return [
                            'id' => $schedule->id,
                            'name' => $schedule->course->name ?? 'N/A',
                            'teacher' => $schedule->teacher->name ?? 'N/A',
                            'classroom' => $schedule->classroom->name ?? 'N/A',
                            'class' => $schedule->schoolClass->name ?? 'N/A',
                            'color' => $this->getCourseColor($schedule->course_id),
                            'time' => $schedule->start_time->format('H:i') . '-' . $schedule->end_time->format('H:i'),
                        ];
                    })->values()->toArray()
                ];
            }

            $weekGrid[] = $slotData;
        }

        return $weekGrid;
    }

    private function getCourseColor($courseId)
    {
        $colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary', 'indigo', 'purple'];
        return $colors[$courseId % count($colors)];
    }
}