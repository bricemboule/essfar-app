<?php
// app/Http/Controllers/ScheduleController.php

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

        if ($request->week_start && $request->week_end) {
            $query->forWeek($request->week_start, $request->week_end);
        }

        $schedules = $query->orderBy('start_time')->paginate(20);

        return Inertia::render('Schedule/Index', [
            'schedules' => $schedules,
            'teachers' => User::where('role', 'enseignant')->get(['id', 'name']),
            'classes' => SchoolClass::with('academicYear')->get(),
            'filters' => $request->only(['teacher_id', 'class_id', 'week_start', 'week_end'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Schedule/Create', [
            'courses' => Course::with('academicYear')->get(),
            'teachers' => User::where('role', 'enseignant')->get(['id', 'name']),
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

        return redirect()->route('schedules.index')
            ->with('success', 'Séance programmée avec succès.');
    }

    public function show(Schedule $schedule)
    {
        $schedule->load(['course', 'teacher', 'schoolClass', 'classroom']);

        return Inertia::render('Schedule/Show', [
            'schedule' => $schedule
        ]);
    }

    public function edit(Schedule $schedule)
    {
        if (!$schedule->canBeModified()) {
            return back()->withErrors(['error' => 'Cette séance ne peut plus être modifiée.']);
        }

        return Inertia::render('Schedule/Edit', [
            'schedule' => $schedule,
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

        return redirect()->route('schedules.index')
            ->with('success', 'Séance modifiée avec succès.');
    }

    public function destroy(Schedule $schedule)
    {
        if (!$schedule->canBeModified()) {
            return back()->withErrors(['error' => 'Cette séance ne peut pas être supprimée.']);
        }

        $schedule->delete();

        return redirect()->route('schedules.index')
            ->with('success', 'Séance supprimée avec succès.');
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

        return Inertia::render('Schedule/TeacherSchedule', [
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

        return Inertia::render('Schedule/ClassSchedule', [
            'class' => $class->load('academicYear'),
            'schedules' => $schedules,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString()
        ]);
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

        return Inertia::render('Schedule/HoursReport', [
            'report' => $report,
            'classes' => SchoolClass::where('academic_year_id', $academicYear->id)->get(),
            'selectedClass' => $classId ? SchoolClass::find($classId) : null,
            'academicYear' => $academicYear
        ]);
    }

    // Rapport honoraires enseignants
    public function teacherEarningsReport(Request $request)
    {
        $academicYear = AcademicYear::active()->first();
        $startDate = Carbon::parse($request->start_date ?? $academicYear->start_date);
        $endDate = Carbon::parse($request->end_date ?? now());

        $earnings = DB::table('users')
            ->join('schedules', 'users.id', '=', 'schedules.teacher_id')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->where('users.role', 'enseignant')
            ->where('schedules.status', 'completed')
            ->whereBetween('schedules.start_time', [$startDate, $endDate])
            ->groupBy('users.id', 'users.name')
            ->select([
                'users.id',
                'users.name',
                DB::raw('SUM(TIMESTAMPDIFF(MINUTE, schedules.start_time, schedules.end_time) / 60) as total_hours'),
                DB::raw('SUM((TIMESTAMPDIFF(MINUTE, schedules.start_time, schedules.end_time) / 60) * courses.hourly_rate) as total_earnings'),
                DB::raw('AVG(courses.hourly_rate) as avg_hourly_rate')
            ])
            ->get();

        return Inertia::render('Schedule/TeacherEarningsReport', [
            'earnings' => $earnings,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
            'totalEarnings' => $earnings->sum('total_earnings'),
            'totalHours' => $earnings->sum('total_hours')
        ]);
    }

    // Marquer une séance comme terminée
    public function markCompleted(Schedule $schedule)
    {
        if ($schedule->start_time->gt(now())) {
            return back()->withErrors(['error' => 'Cette séance n\'a pas encore eu lieu.']);
        }

        $schedule->markAsCompleted();

        return back()->with('success', 'Séance marquée comme terminée.');
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

    // Envoyer planning par email
    public function sendScheduleEmail(Request $request)
    {
        $request->validate([
            'type' => 'required|in:teacher,class',
            'id' => 'required|integer',
            'start_date' => 'required|date',
            'end_date' => 'required|date'
        ]);

        try {
            if ($request->type === 'teacher') {
                $this->sendTeacherScheduleEmail($request->id, $request->start_date, $request->end_date);
                $message = 'Planning envoyé à l\'enseignant avec succès.';
            } else {
                $this->sendClassScheduleEmail($request->id, $request->start_date, $request->end_date);
                $message = 'Planning envoyé aux étudiants de la classe avec succès.';
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
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

            // Vérifier qu'il n'y a pas de conflit
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

    private function sendTeacherScheduleEmail($teacherId, $startDate, $endDate)
    {
        $teacher = User::findOrFail($teacherId);
        $schedules = Schedule::forTeacher($teacherId)
            ->forWeek($startDate, $endDate)
            ->with(['course', 'schoolClass', 'classroom'])
            ->get();

        // Ici vous pouvez utiliser Mail::send() pour envoyer l'email
        // Mail::to($teacher->email)->send(new TeacherScheduleMail($teacher, $schedules, $startDate, $endDate));
    }

    private function sendClassScheduleEmail($classId, $startDate, $endDate)
    {
        $class = SchoolClass::with(['students', 'academicYear'])->findOrFail($classId);
        $schedules = Schedule::forClass($classId)
            ->forWeek($startDate, $endDate)
            ->with(['course', 'teacher', 'classroom'])
            ->get();

        // Envoyer à tous les étudiants de la classe
        $students = $class->students;
        foreach ($students as $student) {
            // Mail::to($student->email)->send(new ClassScheduleMail($student, $class, $schedules, $startDate, $endDate));
        }
    }
}