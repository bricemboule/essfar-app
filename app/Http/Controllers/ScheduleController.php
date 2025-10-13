<?php

namespace App\Http\Controllers;

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
use Illuminate\Support\Facades\Mail;
use App\Mail\EnseignantPlanningMail;
use App\Mail\ClassPlanningMail;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Jobs\SendClassPlanningJob;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        
        $query = Schedule::with([
            'course', 
            'teacher', 
            'schoolClass', 
            'classroom', 
            'academicYear'
        ]);

        // Filtres
        if ($request->teacher_id) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->class_id) {
            $query->where('school_class_id', $request->class_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->whereHas('course', function($subQ) use ($request) {
                    $subQ->where('name', 'like', '%' . $request->search . '%');
                })
                ->orWhereHas('teacher', function($subQ) use ($request) {
                    $subQ->where('name', 'like', '%' . $request->search . '%');
                })
                ->orWhereHas('schoolClass', function($subQ) use ($request) {
                    $subQ->where('name', 'like', '%' . $request->search . '%');
                });
            });
        }

        if ($request->week_start && $request->week_end) {
            $query->forWeek($request->week_start, $request->week_end);
        }

        $schedules = $query->orderBy('start_time', 'desc')->paginate(20);

        // Calculer les statistiques
        $stats = [
            'total' => Schedule::count(),
            'completed' => Schedule::where('status', 'completed')->count(),
            'upcoming' => Schedule::where('status', 'scheduled')
                ->where('start_time', '>', now())
                ->count(),
            'cancelled' => Schedule::where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Scolarite/Planning/Index', [
            'schedules' => $schedules,
            'teachers' => User::where('role', 'enseignant')->get(['id', 'name', 'email']),
            'classes' => SchoolClass::with('academicYear')->get(),
            'courses' => Course::with('academicYear')->get(['id', 'name', 'code']),
            'filters' => $request->only(['teacher_id', 'class_id', 'status', 'search', 'week_start', 'week_end']),
            'stats' => $stats
        ]);
    }

    public function create()
    {
        return Inertia::render('Scolarite/Planning/Create', [
            'courses' => Course::with('academicYear')->get(),
            'teachers' => User::where('role', 'enseignant')->get(['id', 'name', 'email']),
            'classes' => SchoolClass::with('academicYear')->get(),
            'classrooms' => Classroom::where('is_available', true)->get(),
            'academicYear' => AcademicYear::active()->first()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'teacher_id' => 'required|exists:users,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_recurring' => 'boolean',
            'notes' => 'nullable|string'
        ]);

        $startTime = Carbon::parse($validated['start_time']);
        $endTime = Carbon::parse($validated['end_time']);

        // Vérifier les conflits
        if (Schedule::hasConflict($validated['teacher_id'], $validated['classroom_id'], $startTime, $endTime)) {
            return back()->withErrors(['conflict' => 'Conflit détecté : enseignant ou salle déjà occupé(e) sur ce créneau.']);
        }

        $academicYear = AcademicYear::active()->first();

        $schedule = Schedule::create([
            ...$validated,
            'academic_year_id' => $academicYear->id,
            'day_of_week' => $startTime->dayOfWeek ?: 7,
            'week_number' => $startTime->week,
            'status' => 'scheduled'
        ]);

        // Si récurrent, créer les autres séances
        if ($validated['is_recurring'] ?? false) {
            $this->createRecurringSchedules($schedule, $academicYear);
        }

        return redirect()->route('planning.index')
            ->with('success', 'Séance programmée avec succès.');
    }

    public function show(Schedule $schedule)
    {
        $schedule->load(['course', 'teacher', 'schoolClass', 'classroom']);

        return Inertia::render('Scolarite/Planning/Show', [
            'schedule' => $schedule
        ]);
    }

    public function edit(Schedule $schedule)
    {
        if (!$schedule->canBeModified()) {
            return back()->withErrors(['error' => 'Cette séance ne peut plus être modifiée.']);
        }

        return Inertia::render('Scolarite/Planning/Edit', [
            'schedule' => $schedule->load(['course', 'teacher', 'schoolClass', 'classroom']),
            'courses' => Course::with('academicYear')->get(),
            'teachers' => User::where('role', 'enseignant')->get(['id', 'name']),
            'classes' => SchoolClass::with('academicYear')->get(),
            'classrooms' => Classroom::where('is_available', true)->get(),
        ]);
    }

    public function update(Request $request, Schedule $schedule)
    {
        if (!$schedule->canBeModified()) {
            return back()->withErrors(['error' => 'Cette séance ne peut plus être modifiée.']);
        }

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'teacher_id' => 'required|exists:users,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'notes' => 'nullable|string'
        ]);

        $startTime = Carbon::parse($validated['start_time']);
        $endTime = Carbon::parse($validated['end_time']);

        // Vérifier les conflits (exclure cette séance)
        if (Schedule::hasConflict($validated['teacher_id'], $validated['classroom_id'], $startTime, $endTime, $schedule->id)) {
            return back()->withErrors(['conflict' => 'Conflit détecté : enseignant ou salle déjà occupé(e) sur ce créneau.']);
        }

        $schedule->update([
            ...$validated,
            'day_of_week' => $startTime->dayOfWeek ?: 7,
            'week_number' => $startTime->week,
            'status' => 'rescheduled'
        ]);

        return redirect()->route('planning.index')
            ->with('success', 'Séance modifiée avec succès.');
    }

    public function destroy(Schedule $schedule)
    {
        if (!$schedule->canBeModified()) {
            return back()->withErrors(['error' => 'Cette séance ne peut pas être supprimée.']);
        }

        $schedule->delete();

        return redirect()->route('planning.index')
            ->with('success', 'Séance supprimée avec succès.');
    }

    // Marquer une séance comme terminée
public function markCompleted(Request $request, Schedule $schedule)
{
    
    $request->validate([
        'duration_hours' => 'required|numeric|min:0',
        'notes' => 'nullable|string|max:500'
    ]);

    if ($schedule->start_time->gt(now())) {
        return back()->withErrors(['error' => 'Cette séance n\'a pas encore eu lieu.']);
    }

    $schedule->update([
        'status' => 'completed',
        'completed_hours' => $request->duration_hours,
        'completion_notes' => $request->notes
    ]);

    return back()->with('success', 'Séance marquée comme terminée avec ' . $request->duration_hours . ' heures effectuées.');

}

    // Annuler une séance
    public function cancel(Request $request, Schedule $schedule)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $schedule->markAsCancelled($request->reason);

        return back()->with('success', 'Séance annulée.');
    }

    // Actions groupées
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:complete,cancel,delete',
            'schedule_ids' => 'required|array',
            'schedule_ids.*' => 'exists:schedules,id',
            'reason' => 'required_if:action,cancel|string|max:500'
        ]);

        $schedules = Schedule::whereIn('id', $request->schedule_ids)->get();

        foreach ($schedules as $schedule) {
            switch ($request->action) {
                case 'complete':
                    if ($schedule->start_time->lte(now())) {
                        $schedule->markAsCompleted();
                    }
                    break;
                
                case 'cancel':
                    if ($schedule->canBeModified()) {
                        $schedule->markAsCancelled($request->reason);
                    }
                    break;
                
                case 'delete':
                    if ($schedule->canBeModified()) {
                        $schedule->delete();
                    }
                    break;
            }
        }

        return back()->with('success', 'Action groupée effectuée avec succès.');
    }

    // Plannings individuels
    public function teacherSchedule(Request $request, User $teacher)
    {
        $user = auth()->user();

        if ($user->role === 'enseignant' && $user->id !== $teacher->id) {
            abort(403, 'Accès refusé');
        }

        $startDate = Carbon::parse($request->start_date ?? now()->startOfWeek());
        $endDate = Carbon::parse($request->end_date ?? now()->endOfWeek());

        $schedules = Schedule::forTeacher($teacher->id)
            ->forWeek($startDate, $endDate)
            ->with(['course', 'schoolClass', 'classroom'])
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Scolarite/Planning/PlanningEnseignant', [
            'teacher' => $teacher,
            'schedules' => $schedules,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString()
        ]);
    }

    public function classSchedule(Request $request, SchoolClass $class)
    {
        $startDate = Carbon::parse($request->start_date ?? now()->startOfWeek());
        $endDate = Carbon::parse($request->end_date ?? now()->endOfWeek());

        $schedules = Schedule::forClass($class->id)
            ->forWeek($startDate, $endDate)
            ->with(['course', 'teacher', 'classroom'])
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Scolarite/Planning/PlanningClasse', [
            'class' => $class->load('academicYear'),
            'schedules' => $schedules,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString()
        ]);
    }

    // Après la méthode classSchedule()
public function exportClassSchedulePdf(Request $request, SchoolClass $class)
{
    $startDate = Carbon::parse($request->start_date);
    $endDate = Carbon::parse($request->end_date);

    $schedules = Schedule::forClass($class->id)
        ->forWeek($startDate, $endDate)
        ->with(['course', 'teacher', 'classroom'])
        ->orderBy('start_time')
        ->get();

    $academicYear = AcademicYear::active()->first();

    $data = [
        'class' => $class,
        'academicYear' => $academicYear,
        'schedules' => $schedules,
        'startDate' => $startDate->format('d/m/Y'),
        'endDate' => $endDate->format('d/m/Y'),
        'generatedDate' => now()->format('d/m/Y H:i'),
    ];

    $pdf = Pdf::loadView('planning.class-schedule-pdf', $data)
              ->setPaper('a4', 'landscape');

    return $pdf->download("emploi_temps_{$class->name}_{$startDate->format('Y-m-d')}.pdf");
}



    // Récapitulatif des heures
    public function hoursReport(Request $request)
    {
        $academicYear = AcademicYear::active()->first();
        $classId = $request->class_id;

        $report = DB::table('courses')
            ->join('class_courses', 'courses.id', '=', 'class_courses.course_id')
            ->leftJoin('schedules', function($join) use ($classId) {
                $join->on('courses.id', '=', 'schedules.course_id')
                     ->where('schedules.status', 'completed');
                if ($classId) {
                    $join->where('schedules.school_class_id', $classId);
                }
            })
            ->where('courses.academic_year_id', $academicYear->id)
            ->when($classId, function($query) use ($classId) {
                return $query->where('class_courses.school_class_id', $classId);
            })
            ->groupBy('courses.id', 'courses.name', 'courses.total_hours')
            ->select([
                'courses.id',
                'courses.name',
                'courses.total_hours',
                DB::raw('COALESCE(SUM(TIMESTAMPDIFF(MINUTE, schedules.start_time, schedules.end_time) / 60), 0) as completed_hours'),
                DB::raw('courses.total_hours - COALESCE(SUM(TIMESTAMPDIFF(MINUTE, schedules.start_time, schedules.end_time) / 60), 0) as remaining_hours')
            ])
            ->get();

        return Inertia::render('Scolarite/Planning/RapportHeures', [
            'report' => $report,
            'classes' => SchoolClass::where('academic_year_id', $academicYear->id)->get(),
            'selectedClass' => $classId ? SchoolClass::find($classId) : null,
            'academicYear' => $academicYear
        ]);
    }

public function teacherEarningsReport(Request $request)
{
    $academicYear = AcademicYear::active()->first();

    $startDate = Carbon::parse($request->start_date ?? $academicYear->start_date);
    $endDate   = Carbon::parse($request->end_date ?? now());

    $earnings = DB::table('users')
        ->join('course_teachers', 'users.id', '=', 'course_teachers.teacher_id')
        ->join('courses', 'course_teachers.course_id', '=', 'courses.id')
        ->join('schedules', function ($join) {
            $join->on('schedules.course_id', '=', 'courses.id')
                 ->on('schedules.teacher_id', '=', 'users.id');
        })
        ->where('users.role', 'enseignant')
        ->where('schedules.status', 'completed')
        ->whereBetween('schedules.start_time', [$startDate, $endDate])
        ->groupBy('users.id', 'users.name')
        ->select([
            'users.id',
            'users.name',
            DB::raw('SUM(schedules.completed_hours) as total_hours'),
            DB::raw('SUM(schedules.completed_hours * course_teachers.taux_horaire) as total_earnings'),
            DB::raw('AVG(course_teachers.taux_horaire) as avg_hourly_rate'),
        ])
        ->get();

    return Inertia::render('Scolarite/Planning/Honoraire', [
        'earnings'      => $earnings,
        'startDate'     => $startDate->toDateString(),
        'endDate'       => $endDate->toDateString(),
        'totalEarnings' => $earnings->sum('total_earnings'),
        'totalHours'    => $earnings->sum('total_hours'),
    ]);
}



    // Envoyer planning par email
   public function sendScheduleEmail(Request $request)
{

    
    $request->validate([
        'type' => 'required|in:teacher,class,all_teachers,all_classes',
        'teacher_id' => 'required_if:type,teacher|exists:users,id',
        'class_id' => 'required_if:type,class|exists:school_classes,id',
        'start_date' => 'required|date',
        'end_date' => 'required|date',
        'include_pdf' => 'boolean',
        'message' => 'nullable|string|max:1000',
    ]);

    

    try {
        $sent = 0;
        
        switch ($request->type) {
            case 'teacher':
                
                $this->sendToTeacher($request->teacher_id, $request->all());
                $sent = 1;
                break;
            
            case 'class':
                
                $sent = $this->sendToClass($request->class_id, $request->all());
                break;
            
            case 'all_teachers':
                $sent = $this->sendToAllTeachers($request->all());
                break;
            
            case 'all_classes':
                $sent = $this->sendToAllClasses($request->all());
                break;
        }

        return back()->with('success', "Planning envoyé avec succès à {$sent} destinataire(s).");
    } catch (\Exception $e) {
        \Log::error('Erreur envoi planning: ' . $e->getMessage());
        return back()->withErrors(['error' => 'Erreur lors de l\'envoi : ' . $e->getMessage()]);
    }
}

    // Méthodes privées
    private function createRecurringSchedules(Schedule $originalSchedule, AcademicYear $academicYear)
    {
        $startDate = Carbon::parse($originalSchedule->start_time);
        $endDate = Carbon::parse($academicYear->end_date);
        $duration = $startDate->diffInMinutes(Carbon::parse($originalSchedule->end_time));

        $currentDate = $startDate->copy()->addWeek();

        while ($currentDate->lte($endDate)) {
            $newStartTime = $currentDate->copy();
            $newEndTime = $currentDate->copy()->addMinutes($duration);

            if (!Schedule::hasConflict($originalSchedule->teacher_id, $originalSchedule->classroom_id, $newStartTime, $newEndTime)) {
                Schedule::create([
                    'course_id' => $originalSchedule->course_id,
                    'teacher_id' => $originalSchedule->teacher_id,
                    'school_class_id' => $originalSchedule->school_class_id,
                    'classroom_id' => $originalSchedule->classroom_id,
                    'academic_year_id' => $originalSchedule->academic_year_id,
                    'start_time' => $newStartTime,
                    'end_time' => $newEndTime,
                    'day_of_week' => $newStartTime->dayOfWeek ?: 7,
                    'week_number' => $newStartTime->week,
                    'status' => 'scheduled',
                    'is_recurring' => true,
                    'notes' => $originalSchedule->notes
                ]);
            }

            $currentDate->addWeek();
        }
    }

 private function sendToTeacher($teacherId, $data)
{
    $teacher = User::findOrFail($teacherId);
    $schedules = Schedule::forTeacher($teacher->id)
        ->forWeek($data['start_date'], $data['end_date'])
        ->with(['course', 'schoolClass', 'classroom'])
        ->orderBy('start_time')
        ->get();

    if ($schedules->isEmpty()) {
        return 0;
    }

    $pdf = null;
    if ($data['include_pdf'] ?? true) {
        $pdf = $this->generateTeacherPdf($teacher, $schedules, $data);
    }

    Mail::to($teacher->email)->send(
        new TeacherScheduleMail($teacher, $schedules, $data, $pdf)
    );
    
    return 1;
}



private function sendToClass($classId, array $data): void
{
    $class = SchoolClass::findOrFail($classId);

    $schedules = Schedule::query()
        ->forClass($class->id)
        ->forWeek($data['start_date'], $data['end_date'])
        ->get();

    if ($schedules->isEmpty()) {
        \Log::info("Aucun planning trouvé pour la classe {$class->name}");
        return;
    }

    // Génère le PDF et enregistre-le sur le disque
    $pdfPath = null;
    if (!empty($data['include_pdf'])) {
        $pdf = $this->generateClassPdf($class, $schedules, $data);
        $pdfPath = storage_path('app/public/planning/' . uniqid('planning_') . '.pdf');
        file_put_contents($pdfPath, $pdf);
    }

  
    dispatch(new SendClassPlanningJob($class->id, $data, $pdfPath));
}

private function sendToAllTeachers(array $data): int
{
    \Log::info("Début d'envoi des plannings à tous les enseignants pour la période {$data['start_date']} - {$data['end_date']}");

    
    $teachers = User::where('role', 'enseignant')
        ->whereHas('schedules', function ($q) use ($data) {
            $q->forWeek($data['start_date'], $data['end_date']);
        })
        ->get();

    if ($teachers->isEmpty()) {
        \Log::info("Aucun enseignant avec emploi du temps trouvé pour cette période.");
        return 0;
    }

    $sent = 0;

    foreach ($teachers as $teacher) {
        if (empty($teacher->email)) {
            \Log::warning("Enseignant sans email : {$teacher->id} ({$teacher->name})");
            continue;
        }

        try {
            // Récupérer les cours de l'enseignant pour la période AVEC relations
            $schedules = Schedule::query()
                ->forTeacher($teacher->id)
                ->forWeek($data['start_date'], $data['end_date'])
                ->with(['course', 'classroom', 'schoolClass']) // IMPORTANT
                ->orderBy('start_time')
                ->get();

            if ($schedules->isEmpty()) {
                \Log::info("Aucun planning pour {$teacher->name}");
                continue;
            }

            // Génération du PDF (facultatif)
            $pdfPath = null;
            if (!empty($data['include_pdf'])) {
                try {
                    $pdf = $this->generateTeacherPdf($teacher, $schedules, $data);
                    
                    // Créer un nom de fichier unique
                    $filename = 'teacher_' . $teacher->id . '_' . time() . '_' . uniqid() . '.pdf';
                    $pdfPath = storage_path('app/public/planning/' . $filename);
                    
                    // S'assurer que le dossier existe
                    $directory = dirname($pdfPath);
                    if (!is_dir($directory)) {
                        mkdir($directory, 0755, true);
                    }
                    
                    file_put_contents($pdfPath, $pdf);
                    \Log::info("PDF généré : {$pdfPath}");
                } catch (\Exception $e) {
                    \Log::error("Erreur génération PDF pour {$teacher->name}: " . $e->getMessage());
                    $pdfPath = null;
                }
            }

            // Dispatch du job avec le chemin du PDF
            dispatch(new \App\Jobs\SendTeacherPlanningJob($teacher->id, $data, $pdfPath));

            $sent++;
        } catch (\Throwable $e) {
            \Log::error("Erreur envoi planning à {$teacher->email}: " . $e->getMessage(), [
                'teacher_id' => $teacher->id,
            ]);
        }
    }

    \Log::info("Fin d'envoi aux enseignants : {$sent} jobs dispatchés.");

    return $sent;
}



private function generateTeacherPdf($teacher, $schedules, $data)
{
    $pdf = Pdf::loadView('planning.teacher-schedule-pdf', [
        'teacher' => $teacher,
        'schedules' => $schedules,
        'startDate' => $data['start_date'],
        'endDate' => $data['end_date'],
        'generatedDate' => now()->format('d/m/Y H:i'),
    ])->setPaper('a4', 'portrait');

    return $pdf->output();
}

private function generateClassPdf($class, $schedules, $data)
{
    $pdf = Pdf::loadView('planning.class-schedule-pdf', [
        'class' => $class,
        'schedules' => $schedules,
        'startDate' => $data['start_date'],
        'endDate' => $data['end_date'],
        'generatedDate' => now()->format('d/m/Y H:i'),
    ])->setPaper('a4', 'landscape');

    return $pdf->output();
}



private function sendToAllClasses($data)
{
    $academicYear = AcademicYear::active()->first();
    $classes = SchoolClass::where('academic_year_id', $academicYear->id)
        ->whereHas('schedules', function($q) use ($data) {
            $q->forWeek($data['start_date'], $data['end_date']);
        })
        ->get();

    $sent = 0;
    foreach ($classes as $class) {
        try {
            $sent += $this->sendToClass($class->id, $data);
        } catch (\Exception $e) {
            \Log::error("Erreur envoi classe {$class->name}: " . $e->getMessage());
        }
    }
    
    return $sent;
}

    private function sendToBulk($data)
    {
        $schedules = Schedule::whereIn('id', $data['schedule_ids'])
            ->with(['teacher', 'course', 'schoolClass', 'classroom'])
            ->get();

        $teacherSchedules = $schedules->groupBy('teacher_id');

        foreach ($teacherSchedules as $teacherId => $schedules) {
            $teacher = $schedules->first()->teacher;
            Mail::to($teacher->email)->send(
                new TeacherScheduleMail($teacher, $schedules, $data)
            );
        }
    }
}