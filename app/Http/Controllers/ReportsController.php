<?php
// app/Http/Controllers/ReportsController.php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Course;
use App\Models\SchoolClass;
use App\Models\User;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TeacherEarningsExport;

class ReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    // Rapport des honoraires des enseignants
    public function teacherEarningsReport(Request $request)
    {
        $academicYear = AcademicYear::active()->first();
        $startDate = Carbon::parse($request->start_date ?? $academicYear->start_date);
        $endDate = Carbon::parse($request->end_date ?? now());
        $teacherId = $request->teacher_id;

        $query = User::where('role', 'enseignant')
            ->with(['schedules' => function($query) use ($startDate, $endDate) {
                $query->where('status', 'completed')
                      ->whereBetween('start_time', [$startDate, $endDate])
                      ->with('course');
            }]);

        if ($teacherId) {
            $query->where('id', $teacherId);
        }

        $teachers = $query->get()->map(function($teacher) {
            $totalHours = 0;
            $totalEarnings = 0;
            $courseBreakdown = [];

            foreach ($teacher->schedules as $schedule) {
                $hours = $schedule->getDurationInHours();
                $earnings = $hours * $schedule->course->hourly_rate;
                
                $totalHours += $hours;
                $totalEarnings += $earnings;

                $courseKey = $schedule->course->name;
                if (!isset($courseBreakdown[$courseKey])) {
                    $courseBreakdown[$courseKey] = [
                        'course_name' => $schedule->course->name,
                        'hours' => 0,
                        'earnings' => 0,
                        'hourly_rate' => $schedule->course->hourly_rate
                    ];
                }
                $courseBreakdown[$courseKey]['hours'] += $hours;
                $courseBreakdown[$courseKey]['earnings'] += $earnings;
            }

            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'total_hours' => round($totalHours, 2),
                'total_earnings' => round($totalEarnings, 2),
                'avg_hourly_rate' => $totalHours > 0 ? round($totalEarnings / $totalHours, 2) : 0,
                'course_breakdown' => array_values($courseBreakdown),
                'sessions_count' => $teacher->schedules->count()
            ];
        });

        // Calculs pour le résumé
        $totalHours = $teachers->sum('total_hours');
        $totalEarnings = $teachers->sum('total_earnings');
        $averageHourlyRate = $teachers->avg('avg_hourly_rate');

        // Si export demandé
        if ($request->has('export')) {
            $format = $request->format;
            
            if ($format === 'pdf') {
                return $this->exportTeacherEarningsPdf($teachers, $startDate, $endDate, $totalHours, $totalEarnings, $averageHourlyRate);
            } elseif ($format === 'excel') {
                return $this->exportTeacherEarningsExcel($teachers, $startDate, $endDate, $totalHours, $totalEarnings, $averageHourlyRate);
            }
        }

        return Inertia::render('Reports/TeacherEarnings', [
            'earnings' => $teachers,
            'allTeachers' => User::where('role', 'enseignant')->select('id', 'name')->get(),
            'selectedTeacher' => $teacherId ? User::find($teacherId) : null,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
            'totalHours' => $totalHours,
            'totalEarnings' => $totalEarnings,
            'summary' => [
                'total_teachers' => $teachers->count(),
                'total_hours' => $totalHours,
                'total_earnings' => $totalEarnings,
                'average_hourly_rate' => $averageHourlyRate
            ]
        ]);
    }

    public function exportTeacherEarningsPdfRequest(Request $request)
{
    $academicYear = AcademicYear::active()->first();
    $startDate = Carbon::parse($request->start_date ?? $academicYear->start_date);
    $endDate = Carbon::parse($request->end_date ?? now());
    $teacherId = $request->teacher_id;

    $query = User::where('role', 'enseignant')
        ->with(['teacherSchedules' => function($query) use ($startDate, $endDate) {
            $query->where('status', 'completed')
                  ->whereBetween('start_time', [$startDate, $endDate])
                  ->with('course');
        }]);

    if ($teacherId) {
        $query->where('id', $teacherId);
    }

    $teachers = $query->get()->map(function($teacher) {
        $totalHours = 0;
        $totalEarnings = 0;
        $courseBreakdown = [];

        foreach ($teacher->teacherSchedules as $schedule) {
    $hours = $schedule->getDurationInHours();

    // Récupérer le taux horaire depuis la relation pivot
    $teacherCourse = $schedule->course
        ->teachers()
        ->where('users.id', $teacher->id)
        ->first();

    $hourlyRate = $teacherCourse ? $teacherCourse->pivot->taux_horaire : 0;

    $earnings = $hours * $hourlyRate;

    $totalHours += $hours;
    $totalEarnings += $earnings;

    $courseKey = $schedule->course->name;
    if (!isset($courseBreakdown[$courseKey])) {
        $courseBreakdown[$courseKey] = [
            'course_name' => $schedule->course->name,
            'hours' => 0,
            'earnings' => 0,
            'hourly_rate' => $hourlyRate
        ];
    }
    $courseBreakdown[$courseKey]['hours'] += $hours;
    $courseBreakdown[$courseKey]['earnings'] += $earnings;
}


        return [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'email' => $teacher->email,
            'total_hours' => round($totalHours, 2),
            'total_earnings' => round($totalEarnings, 2),
            'avg_hourly_rate' => $totalHours > 0 ? round($totalEarnings / $totalHours, 2) : 0,
            'course_breakdown' => array_values($courseBreakdown),
            'sessions_count' => $teacher->teacherSchedules->count()
        ];
    });

    $totalHours = $teachers->sum('total_hours');
    $totalEarnings = $teachers->sum('total_earnings');
    $averageHourlyRate = $teachers->avg('avg_hourly_rate');

    // Appelle la méthode interne pour générer le PDF
    return $this->exportTeacherEarningsPdf($teachers, $startDate, $endDate, $totalHours, $totalEarnings, $averageHourlyRate);
}

    // Export PDF des honoraires
    public function exportTeacherEarningsPdf($earnings, $startDate, $endDate, $totalHours, $totalEarnings, $averageHourlyRate)
    {
        $data = [
            'earnings' => $earnings,
            'startDate' => $startDate->format('d/m/Y'),
            'endDate' => $endDate->format('d/m/Y'),
            'totalHours' => $totalHours,
            'totalEarnings' => $totalEarnings,
            'averageHourlyRate' => $averageHourlyRate,
            'generatedDate' => now()->format('d/m/Y H:i')
        ];

        $pdf = Pdf::loadView('rapport.honoraire_enseignant', $data)
                  ->setPaper('a4', 'landscape')
                  ->setOption('margin-top', 10)
                  ->setOption('margin-bottom', 10);

        $filename = "honoraires_enseignants_{$startDate->format('Y-m-d')}_au_{$endDate->format('Y-m-d')}.pdf";
        
        return $pdf->download($filename);
    }

    // Export Excel des honoraires
    public function exportTeacherEarningsExcel($earnings, $startDate, $endDate, $totalHours, $totalEarnings, $averageHourlyRate)
    {
        $filename = "honoraires_enseignants_{$startDate->format('Y-m-d')}_au_{$endDate->format('Y-m-d')}.xlsx";
        
        return Excel::download(
            new TeacherEarningsExport($earnings, $startDate, $endDate, $totalHours, $totalEarnings, $averageHourlyRate),
            $filename
        );
    }

    // Rapport détaillé des heures par cours et classe
    public function courseHoursReport(Request $request)
    {
        $academicYear = AcademicYear::active()->first();
        $classId = $request->class_id;

        $query = Course::with(['academicYear'])
            ->where('academic_year_id', $academicYear->id)
            ->withSum(['schedules as completed_hours' => function($query) use ($classId) {
                $query->where('status', 'completed')
                      ->selectRaw('SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time) / 60)');
                if ($classId) {
                    $query->where('school_class_id', $classId);
                }
            }], 'id')
            ->withCount(['schedules as total_sessions' => function($query) use ($classId) {
                if ($classId) {
                    $query->where('school_class_id', $classId);
                }
            }])
            ->withCount(['schedules as completed_sessions' => function($query) use ($classId) {
                $query->where('status', 'completed');
                if ($classId) {
                    $query->where('school_class_id', $classId);
                }
            }]);

        if ($classId) {
            $query->whereHas('classes', function($q) use ($classId) {
                $q->where('school_classes.id', $classId);
            });
        }

        $courses = $query->get()->map(function($course) {
            $completedHours = $course->completed_hours ?: 0;
            $remainingHours = $course->total_hours - $completedHours;
            $progressPercentage = $course->total_hours > 0 ? ($completedHours / $course->total_hours) * 100 : 0;

            return [
                'id' => $course->id,
                'name' => $course->name,
                'code' => $course->code,
                'total_hours' => $course->total_hours,
                'completed_hours' => round($completedHours, 2),
                'remaining_hours' => round($remainingHours, 2),
                'progress_percentage' => round($progressPercentage, 2),
                'total_sessions' => $course->total_sessions,
                'completed_sessions' => $course->completed_sessions,
                'hourly_rate' => $course->hourly_rate,
                'total_cost' => round($completedHours * $course->hourly_rate, 2)
            ];
        });

        return Inertia::render('Reports/CourseHours', [
            'courses' => $courses,
            'classes' => SchoolClass::where('academic_year_id', $academicYear->id)->get(),
            'selectedClass' => $classId ? SchoolClass::find($classId) : null,
            'academicYear' => $academicYear,
            'summary' => [
                'total_planned_hours' => $courses->sum('total_hours'),
                'total_completed_hours' => $courses->sum('completed_hours'),
                'total_remaining_hours' => $courses->sum('remaining_hours'),
                'total_cost' => $courses->sum('total_cost'),
                'overall_progress' => $courses->avg('progress_percentage')
            ]
        ]);
    }

    // Rapport d'utilisation des salles
    public function classroomUsageReport(Request $request)
    {
        $academicYear = AcademicYear::active()->first();
        $startDate = Carbon::parse($request->start_date ?? now()->startOfMonth());
        $endDate = Carbon::parse($request->end_date ?? now()->endOfMonth());

        $classrooms = DB::table('classrooms')
            ->leftJoin('schedules', function($join) use ($startDate, $endDate) {
                $join->on('classrooms.id', '=', 'schedules.classroom_id')
                     ->whereBetween('schedules.start_time', [$startDate, $endDate]);
            })
            ->groupBy('classrooms.id', 'classrooms.name', 'classrooms.capacity', 'classrooms.building')
            ->select([
                'classrooms.id',
                'classrooms.name',
                'classrooms.capacity',
                'classrooms.building',
                DB::raw('COUNT(schedules.id) as total_sessions'),
                DB::raw('SUM(TIMESTAMPDIFF(MINUTE, schedules.start_time, schedules.end_time)) as total_minutes'),
                DB::raw('ROUND(SUM(TIMESTAMPDIFF(MINUTE, schedules.start_time, schedules.end_time)) / 60, 2) as total_hours')
            ])
            ->get();

        $periodHours = $startDate->diffInHours($endDate);
        $workingHours = $periodHours * 0.4; // Environ 40% du temps = heures de cours

        $classrooms = $classrooms->map(function($classroom) use ($workingHours) {
            $occupancyRate = $workingHours > 0 ? ($classroom->total_hours / $workingHours) * 100 : 0;
            
            return [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'capacity' => $classroom->capacity,
                'building' => $classroom->building,
                'total_sessions' => $classroom->total_sessions,
                'total_hours' => $classroom->total_hours,
                'occupancy_rate' => round($occupancyRate, 2),
                'efficiency_score' => $this->calculateEfficiencyScore($occupancyRate, $classroom->total_sessions)
            ];
        });

        return Inertia::render('Reports/ClassroomUsage', [
            'classrooms' => $classrooms,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
            'summary' => [
                'total_classrooms' => $classrooms->count(),
                'average_occupancy' => $classrooms->avg('occupancy_rate'),
                'most_used' => $classrooms->sortByDesc('occupancy_rate')->first(),
                'least_used' => $classrooms->sortBy('occupancy_rate')->first()
            ]
        ]);
    }

    // Planning hebdomadaire pour export PDF
    public function weeklySchedulePdf(Request $request)
    {
        $request->validate([
            'type' => 'required|in:enseignant,class',
            'id' => 'required|integer',
            'start_date' => 'required|date'
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfWeek();
        $endDate = $startDate->copy()->endOfWeek();

        if ($request->type === 'enseignant') {
            $teacher = User::findOrFail($request->id);
            $schedules = Schedule::forTeacher($teacher->id)
                ->forWeek($startDate, $endDate)
                ->with(['course', 'schoolClass', 'classroom'])
                ->orderBy('start_time')
                ->get();

            $data = [
                'type' => 'enseignant',
                'entity' => $teacher,
                'schedules' => $schedules,
                'startDate' => $startDate,
                'endDate' => $endDate
            ];
        } else {
            $class = SchoolClass::with('academicYear')->findOrFail($request->id);
            $schedules = Schedule::forClass($class->id)
                ->forWeek($startDate, $endDate)
                ->with(['course', 'teacher', 'classroom'])
                ->orderBy('start_time')
                ->get();

            $data = [
                'type' => 'class',
                'entity' => $class,
                'schedules' => $schedules,
                'startDate' => $startDate,
                'endDate' => $endDate
            ];
        }

        // Organiser par jour
        $schedulesByDay = $schedules->groupBy(function($schedule) {
            return $schedule->start_time->dayOfWeek;
        });

        $data['schedulesByDay'] = $schedulesByDay;

        $pdf = Pdf::loadView('reports.weekly-schedule', $data);
        
        $filename = $request->type === 'enseignant' 
            ? "planning_enseignant_{$teacher->name}_{$startDate->format('Y-m-d')}.pdf"
            : "planning_classe_{$class->name}_{$startDate->format('Y-m-d')}.pdf";

        return $pdf->download($filename);
    }

    // Méthodes privées
    public function calculateEfficiencyScore($occupancyRate, $totalSessions)
    {
        // Score basé sur le taux d'occupation et le nombre de sessions
        $occupancyScore = min($occupancyRate / 60 * 100, 100); // Optimal à 60%
        $sessionScore = min($totalSessions / 20 * 100, 100); // Optimal à 20 sessions/mois
        
        return round(($occupancyScore + $sessionScore) / 2, 2);
    }
}