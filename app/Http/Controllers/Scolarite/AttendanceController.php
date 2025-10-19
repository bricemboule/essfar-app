<?php

namespace App\Http\Controllers\Scolarite;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use App\Models\Course;
use App\Models\SchoolClass;
use App\Models\AcademicYear;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * Liste des présences/absences
     */
    public function index(Request $request)
    {
        $query = Attendance::with(['student', 'course', 'schoolClass', 'markedBy'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filtres
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('class_id')) {
            $query->where('school_class_id', $request->class_id);
        }

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id); // Corrigé: était 'subject_id'
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        if ($request->filled('justification_status')) {
            $query->where('justification_status', $request->justification_status);
        }

        $attendances = $query->paginate(20)->withQueryString();

        // Statistiques
        $stats = [
            'total' => Attendance::count(),
            'today_absences' => Attendance::whereDate('date', today())->absences()->count(),
            'today_delays' => Attendance::whereDate('date', today())->delays()->count(),
            'pending_justifications' => Attendance::pendingJustification()->count(),
            'this_week_absences' => Attendance::thisWeek()->absences()->count(),
        ];

        return Inertia::render('Scolarite/Absences/Index', [
            'attendances' => $attendances,
            'stats' => $stats,
            'classes' => SchoolClass::all(),
            'subjects' => Course::all(),
            'filters' => $request->only(['search', 'class_id', 'course_id', 'type', 'date_from', 'date_to', 'justification_status'])
        ]);
    }

    /**
     * Formulaire de saisie de présence
     */
    public function create(Request $request)
    {
        $classes = SchoolClass::with('students')->get();
        $subjects = Course::all();
        $academicYears = AcademicYear::where('is_active', true)->get();

        // Pré-remplir avec des étudiants si classe sélectionnée
        $students = [];
        if ($request->filled('class_id')) {
            $class = SchoolClass::find($request->class_id);
            if ($class) {
                $students = $class->students()
                    ->orderBy('name')
                    ->get();
            }
        }

        return Inertia::render('Scolarite/Absences/Create', [
            'classes' => $classes,
            'subjects' => $subjects,
            'academicYears' => $academicYears,
            'students' => $students,
            'preselected_class' => $request->class_id,
        ]);
    }

    /**
     * Enregistrer présences
     */
    public function store(Request $request)
    {
        
        $request->validate([
            'date' => 'required|date',
            'course_id' => 'required|exists:courses,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:users,id',
            'attendances.*.type' => 'required|in:presence,absence,retard',
            'attendances.*.delay_minutes' => 'nullable|integer|min:1',
            'attendances.*.notes' => 'nullable|string|max:500',
        ]);

     

        $results = ['success' => 0, 'errors' => []];

        foreach ($request->attendances as $attendance) {
            try {
                $data = [
                    'student_id' => $attendance['student_id'],
                    'course_id' => $request->course_id,
                    'school_class_id' => $request->school_class_id,
                    'academic_year_id' => $request->academic_year_id,
                    'date' => $request->date,
                    'type' => $attendance['type'],
                    'delay_minutes' => $attendance['delay_minutes'] ?? null,
                    'notes' => $attendance['notes'] ?? null,
                    'hours_missed' => $attendance['type'] === 'absence' ? 1 : 0,
                ];

              
                $this->attendanceService->markAttendance($data);
                $results['success']++;
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'student_id' => $attendance['student_id'],
                    'error' => $e->getMessage()
                ];
            }
        }

        if ($results['success'] > 0) {
            return redirect()->route('scolarite.attendances.index')
                ->with('success', "{$results['success']} présence(s) enregistrée(s) avec succès !");
        }

        return back()->withErrors(['error' => 'Erreur lors de l\'enregistrement'])->withInput();
    }

    /**
     * Validation des justifications en attente
     */
    public function pendingJustifications()
    {
        $attendances = Attendance::with(['student', 'course', 'schoolClass'])
            ->pendingJustification()
            ->orderBy('justification_date', 'desc')
            ->paginate(20);

        return Inertia::render('Scolarite/Absences/PendingJustifications', [
            'attendances' => $attendances,
        ]);
    }

    /**
     * Valider une justification
     */
    public function validateJustification(Request $request, Attendance $attendance)
    {
        $request->validate([
            'approved' => 'required|boolean',
            'comment' => 'nullable|string|max:500',
        ]);

        try {
            $this->attendanceService->validateJustification(
                $attendance->id,
                $request->approved,
                $request->comment
            );

            $message = $request->approved 
                ? 'Justification approuvée avec succès'
                : 'Justification rejetée';

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Rapport d'assiduité par classe
     */
    public function reportByClass(Request $request)
    {
        $academicYear = AcademicYear::where('is_active', true)->first();
        $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));

        $stats = $this->attendanceService->getStatsByClass(
            $academicYear->id,
            $startDate,
            $endDate
        );

        return Inertia::render('Scolarite/Absences/ReportByClass', [
            'stats' => $stats,
            'academicYear' => $academicYear,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    /**
     * Rapport d'assiduité par matière
     */
    public function reportBySubject(Request $request, SchoolClass $class)
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));

        $stats = $this->attendanceService->getStatsBySubject(
            $class->id,
            null,
            $startDate,
            $endDate
        );

        return Inertia::render('Scolarite/Absences/ReportBySubject', [
            'stats' => $stats,
            'class' => $class,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    /**
     * Vue détaillée d'une présence
     */
    public function show(Attendance $attendance)
    {
        $attendance->load([
            'student',
            'course',
            'schoolClass',
            'markedBy',
            'validatedBy'
        ]);

        return Inertia::render('Scolarite/Absences/Show', [
            'attendance' => $attendance,
        ]);
    }

    /**
     * Modifier une présence
     */
    public function update(Request $request, Attendance $attendance)
    {
        $request->validate([
            'type' => 'required|in:presence,absence,retard,absence_justifiee',
            'delay_minutes' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $attendance->update([
            'type' => $request->type,
            'delay_minutes' => $request->delay_minutes,
            'notes' => $request->notes,
            'hours_missed' => $request->type === 'absence' ? 1 : 0,
        ]);

        return back()->with('success', 'Présence mise à jour avec succès');
    }

    /**
     * Supprimer une présence
     */
    public function destroy(Attendance $attendance)
    {
        $attendance->delete();
        return redirect()->route('scolarite.attendances.index')
            ->with('success', 'Présence supprimée avec succès');
    }
}