<?php

namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentAttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * Liste des absences et retards de l'étudiant
     */
    public function index(Request $request)
    {
    
        $student = auth()->user();
        
        $query = Attendance::ofStudent($student->id)
            ->with(['course', 'schoolClass', 'validatedBy'])
            ->orderBy('date', 'desc');

        // Filtres
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('month')) {
            $month = \Carbon\Carbon::createFromFormat('Y-m', $request->month);
            $query->whereYear('date', $month->year)
                  ->whereMonth('date', $month->month);
        }

        $attendances = $query->paginate(20)->withQueryString();

        // Statistiques
        $stats = $this->attendanceService->getStudentStats(
            $student->id,
            $student->academic_year_id
        );

        // Absences non justifiées
        $unjustifiedAbsences = Attendance::ofStudent($student->id)
            ->unjustified()
            ->orderBy('date', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Etudiant/Absences/Index', [
            'attendances' => $attendances,
            'stats' => $stats,
            'unjustifiedAbsences' => $unjustifiedAbsences,
            'subjects' => $student->schoolClass->courses ?? [],
            'filters' => $request->only(['type', 'course_id', 'month'])
        ]);
    }

    /**
     * Détail d'une absence/retard
     */
    public function show(Attendance $attendance)
    {
        // Vérifier que c'est bien l'étudiant concerné
        if ($attendance->student_id !== auth()->id()) {
            abort(403);
        }

       

        $attendance->load(['course', 'schoolClass', 'markedBy', 'validatedBy']);
 
        return Inertia::render('Etudiant/Absences/Show', [
            'attendance' => $attendance,
            'canJustify' => $attendance->canBeJustified(),
        ]);
    }

    /**
     * Formulaire de justification
     */
    public function justifyForm(Attendance $attendance)
    {
        // Vérifier que c'est bien l'étudiant concerné
        if ($attendance->student_id !== auth()->id()) {
            abort(403);
        }

        if (!$attendance->canBeJustified()) {
            return back()->withErrors(['error' => 'Cette absence/retard ne peut pas être justifié(e)']);
        }

        $attendance->load(['course', 'schoolClass', 'markedBy', 'validatedBy']);
        return Inertia::render('Etudiant/Absences/Justify', [
            'attendance' => $attendance,
        ]);
    }

    /**
     * Soumettre une justification
     */
    public function submitJustification(Request $request, Attendance $attendance)
    {
        // Vérifier que c'est bien l'étudiant concerné
        if ($attendance->student_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'justification' => 'required|string|min:20|max:1000',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ], [
            'justification.required' => 'La justification est obligatoire',
            'justification.min' => 'La justification doit contenir au moins 20 caractères',
            'file.mimes' => 'Le fichier doit être au format PDF, JPG ou PNG',
            'file.max' => 'Le fichier ne doit pas dépasser 2 Mo',
        ]);

        try {
            $data = [
                'justification' => $request->justification,
            ];

            // Upload du fichier justificatif
            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('justifications', 'public');
                $data['file'] = $path;
            }

            $this->attendanceService->submitJustification($attendance->id, $data);

            return redirect()->route('etudiant.attendances.index')
                ->with('success', 'Justification soumise avec succès. Elle sera examinée par l\'administration.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    /**
     * Statistiques détaillées
     */
    public function statistics()
    {
        $student = auth()->user();
        
        $stats = $this->attendanceService->getStudentStats(
            $student->id,
            $student->academic_year_id
        );

        // Absences par matière
        $attendancesBySubject = Attendance::ofStudent($student->id)
            ->where('academic_year_id', $student->academic_year_id)
            ->with('subject')
            ->get()
            ->groupBy('subject_id')
            ->map(function ($group) {
                return [
                    'subject' => $group->first()->subject,
                    'total' => $group->count(),
                    'presences' => $group->where('type', 'presence')->count(),
                    'absences' => $group->whereIn('type', ['absence', 'absence_justifiee'])->count(),
                    'retards' => $group->where('type', 'retard')->count(),
                ];
            });

        // Évolution mensuelle
        $monthlyStats = Attendance::ofStudent($student->id)
            ->where('academic_year_id', $student->academic_year_id)
            ->get()
            ->groupBy(function ($item) {
                return $item->date->format('Y-m');
            })
            ->map(function ($group) {
                return [
                    'month' => $group->first()->date->format('F Y'),
                    'presences' => $group->where('type', 'presence')->count(),
                    'absences' => $group->whereIn('type', ['absence', 'absence_justifiee'])->count(),
                    'retards' => $group->where('type', 'retard')->count(),
                ];
            });

        return Inertia::render('Etudiant/Absences/Statistics', [
            'stats' => $stats,
            'attendancesBySubject' => $attendancesBySubject,
            'monthlyStats' => $monthlyStats,
        ]);
    }

    /**
     * Télécharger le justificatif
     */
    public function downloadJustification(Attendance $attendance)
    {
        // Vérifier que c'est bien l'étudiant concerné
        if ($attendance->student_id !== auth()->id()) {
            abort(403);
        }

        if (!$attendance->justification_file) {
            abort(404);
        }

        return Storage::disk('public')->download($attendance->justification_file);
    }
}