<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Schedule;
use App\Models\Grade;
use App\Models\Attendance;
use App\Models\Assignment;
use App\Models\Announcement;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Carbon\Carbon;

class EtudiantController extends Controller
{
    public function __construct()
    {
        // Vérifier que l'utilisateur a le rôle etudiant
        $this->middleware(['auth', 'role:etudiant']);
    }

    public function dashboard()
    {
        $student = Auth::user();
        
        return Inertia::render('Dashboards/Etudiant/Dashboard', [
            'student' => $this->getStudentProfile($student),
            'todaySchedule' => $this->getTodaySchedule($student),
            'weekSchedule' => $this->getWeekSchedule($student),
            'recentGrades' => $this->getRecentGrades($student),
            'semesterGrades' => $this->getSemesterGrades($student),
            'attendance' => $this->getAttendanceStats($student),
            'assignments' => $this->getAssignments($student),
            'announcements' => $this->getAnnouncements($student),
            'classmates' => $this->getClassmates($student),
            'academicProgress' => $this->getAcademicProgress($student),
        ]);
    }

    /**
     * Obtenir le profil de l'étudiant avec les informations de base
     */
    private function getStudentProfile($student)
    {
        return [
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'photo_url' => $student->profile_photo_url,
            'student_id' => $student->student_id ?? str_pad($student->id, 6, '0', STR_PAD_LEFT),
            'class_name' => $student->schoolClass->name ?? 'Non assigné',
            'class_id' => $student->school_class_id,
            'class_size' => $student->schoolClass ? $student->schoolClass->students()->count() : 0,
            'academic_year' => $student->academicYear->name ?? Carbon::now()->year,
            'enrollment_date' => $student->created_at->format('d/m/Y'),
            'specialization' => $student->schoolClass->specialization ?? 'Générale',
        ];
    }

    /**
     * Obtenir le planning d'aujourd'hui pour l'étudiant
     */
    private function getTodaySchedule($student)
    {
        if (!$student->school_class_id) {
            return [];
        }

        return Schedule::with(['course', 'classroom', 'teacher'])
            ->whereHas('schoolClasses', function($query) use ($student) {
                $query->where('school_classes.id', $student->school_class_id);
            })
            ->whereDate('start_time', today())
            ->where('status', 'active')
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'subject_name' => $schedule->course->name ?? 'Cours',
                    'subject_code' => $schedule->course->code ?? '',
                    'teacher_name' => $schedule->teacher->name ?? 'Enseignant',
                    'classroom' => $schedule->classroom->name ?? 'Salle TBD',
                    'start_time' => $schedule->start_time->format('H:i'),
                    'end_time' => $schedule->end_time->format('H:i'),
                    'type' => $schedule->course->type ?? 'Cours',
                    'description' => $schedule->description ?? '',
                    'assignment_due' => $this->hasAssignmentDue($schedule, $student),
                ];
            })
            ->toArray();
    }

    /**
     * Obtenir les notes récentes de l'étudiant
     */
    private function getRecentGrades($student)
    {
        return Grade::with(['course', 'teacher'])
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'subject' => $grade->course->name ?? 'Matière',
                    'score' => $grade->score,
                    'max_score' => $grade->max_score ?? 20,
                    'type' => $grade->type ?? 'Évaluation', // Devoir, Contrôle, Examen
                    'coefficient' => $grade->coefficient ?? 1,
                    'date' => $grade->created_at->format('d/m/Y'),
                    'teacher' => $grade->teacher->name ?? 'Enseignant',
                    'class_average' => $grade->class_average,
                    'comments' => $grade->comments,
                ];
            })
            ->toArray();
    }

    /**
     * Obtenir les notes du semestre par matière
     */
    private function getSemesterGrades($student)
    {
        $currentSemester = $this->getCurrentSemester();
        
        return Grade::with(['course'])
            ->where('student_id', $student->id)
            ->where('semester', $currentSemester)
            ->get()
            ->groupBy('course.name')
            ->map(function ($grades, $subject) {
                $totalPoints = 0;
                $totalCoefficients = 0;
                
                foreach ($grades as $grade) {
                    $coefficient = $grade->coefficient ?? 1;
                    $totalPoints += ($grade->score * $coefficient);
                    $totalCoefficients += $coefficient;
                }
                
                return [
                    'subject' => $subject,
                    'average' => $totalCoefficients > 0 ? round($totalPoints / $totalCoefficients, 2) : 0,
                    'grades_count' => $grades->count(),
                    'coefficient' => $totalCoefficients,
                    'grades' => $grades->map(function($grade) {
                        return [
                            'score' => $grade->score,
                            'type' => $grade->type,
                            'date' => $grade->created_at->format('d/m'),
                        ];
                    })->toArray()
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Obtenir les statistiques de présence
     */
    private function getAttendanceStats($student)
    {
        $totalSchedules = Schedule::whereHas('schoolClasses', function($query) use ($student) {
            $query->where('school_classes.id', $student->school_class_id);
        })
        ->where('start_time', '<=', now())
        ->where('start_time', '>=', now()->startOfMonth())
        ->count();

        $presentCount = Attendance::where('student_id', $student->id)
            ->where('status', 'present')
            ->where('date', '>=', now()->startOfMonth())
            ->count();

        $absentCount = Attendance::where('student_id', $student->id)
            ->where('status', 'absent')
            ->where('date', '>=', now()->startOfMonth())
            ->count();

        $rate = $totalSchedules > 0 ? round(($presentCount / $totalSchedules) * 100, 1) : 100;

        return [
            'rate' => $rate,
            'present' => $presentCount,
            'absent' => $absentCount,
            'total' => $totalSchedules,
            'late_count' => Attendance::where('student_id', $student->id)
                ->where('status', 'late')
                ->where('date', '>=', now()->startOfMonth())
                ->count(),
        ];
    }

    /**
     * Obtenir les devoirs à rendre
     */
    private function getAssignments($student)
    {
        $upcomingAssignments = Assignment::with(['course', 'teacher'])
            ->whereHas('course.schedules.schoolClasses', function($query) use ($student) {
                $query->where('school_classes.id', $student->school_class_id);
            })
            ->where('due_date', '>=', now())
            ->orderBy('due_date')
            ->get();

        return [
            'pending' => $upcomingAssignments->where('due_date', '>=', now())->count(),
            'overdue' => Assignment::with(['course'])
                ->whereHas('course.schedules.schoolClasses', function($query) use ($student) {
                    $query->where('school_classes.id', $student->school_class_id);
                })
                ->where('due_date', '<', now())
                ->whereDoesntHave('submissions', function($query) use ($student) {
                    $query->where('student_id', $student->id);
                })
                ->count(),
            'upcoming' => $upcomingAssignments->map(function($assignment) {
                $dueDate = Carbon::parse($assignment->due_date);
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'subject' => $assignment->course->name ?? 'Matière',
                    'teacher' => $assignment->teacher->name ?? 'Enseignant',
                    'due_date' => $dueDate->format('d/m/Y'),
                    'due_time' => $dueDate->format('H:i'),
                    'days_left' => now()->diffInDays($dueDate, false),
                    'description' => $assignment->description,
                    'type' => $assignment->type ?? 'Devoir',
                ];
            })->toArray()
        ];
    }

    /**
     * Obtenir les annonces pour l'étudiant
     */
    private function getAnnouncements($student)
    {
        return Announcement::where(function($query) use ($student) {
            $query->where('target_type', 'all')
                  ->orWhere(function($q) use ($student) {
                      $q->where('target_type', 'class')
                        ->where('target_id', $student->school_class_id);
                  })
                  ->orWhere(function($q) use ($student) {
                      $q->where('target_type', 'student')
                        ->where('target_id', $student->id);
                  });
        })
        ->where('published_at', '<=', now())
        ->where(function($query) {
            $query->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
        })
        ->orderBy('published_at', 'desc')
        ->limit(10)
        ->get()
        ->map(function($announcement) {
            return [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'message' => $announcement->message,
                'date' => $announcement->published_at->diffForHumans(),
                'priority' => $announcement->priority ?? 'normal',
                'type' => $announcement->type ?? 'info',
            ];
        })
        ->toArray();
    }

    /**
     * Obtenir les camarades de classe
     */
    private function getClassmates($student)
    {
        if (!$student->school_class_id) {
            return [];
        }

        return User::where('school_class_id', $student->school_class_id)
            ->where('id', '!=', $student->id)
            ->where('role', 'etudiant')
            ->select('id', 'name', 'email')
            ->limit(10)
            ->get()
            ->toArray();
    }

    /**
     * Obtenir les progrès académiques
     */
    private function getAcademicProgress($student)
    {
        $currentSemesterGrades = Grade::where('student_id', $student->id)
            ->where('semester', $this->getCurrentSemester())
            ->get();

        if ($currentSemesterGrades->isEmpty()) {
            return [
                'overall_average' => null,
                'class_rank' => null,
                'trend' => 0,
                'subjects_count' => 0,
            ];
        }

        // Calculer la moyenne générale
        $totalPoints = 0;
        $totalCoefficients = 0;
        
        foreach ($currentSemesterGrades as $grade) {
            $coefficient = $grade->coefficient ?? 1;
            $totalPoints += ($grade->score * $coefficient);
            $totalCoefficients += $coefficient;
        }
        
        $overallAverage = $totalCoefficients > 0 ? round($totalPoints / $totalCoefficients, 2) : 0;

        // Calculer le rang dans la classe
        $classRank = $this->calculateClassRank($student, $overallAverage);

        // Calculer la tendance (comparaison avec le mois précédent)
        $previousMonthAverage = $this->getPreviousMonthAverage($student);
        $trend = $previousMonthAverage ? ($overallAverage - $previousMonthAverage) : 0;

        return [
            'overall_average' => $overallAverage,
            'class_rank' => $classRank,
            'trend' => $trend > 0 ? 1 : ($trend < 0 ? -1 : 0),
            'subjects_count' => $currentSemesterGrades->unique('course_id')->count(),
            'best_subject' => $this->getBestSubject($student),
            'improvement_needed' => $this->getSubjectsNeedingImprovement($student),
        ];
    }

    /**
     * Afficher le planning complet de l'étudiant
     */
    public function schedule()
    {
        $student = Auth::user();
        
        return Inertia::render('Student/Schedule', [
            'student' => $this->getStudentProfile($student),
            'weekSchedule' => $this->getWeekSchedule($student),
            'monthSchedule' => $this->getMonthSchedule($student),
        ]);
    }

    /**
     * Afficher toutes les notes de l'étudiant
     */
    public function grades()
    {
        $student = Auth::user();
        
        return Inertia::render('Student/Grades', [
            'student' => $this->getStudentProfile($student),
            'semesterGrades' => $this->getSemesterGrades($student),
            'allGrades' => $this->getAllGrades($student),
            'academicProgress' => $this->getAcademicProgress($student),
        ]);
    }

    /**
     * Afficher et modifier le profil de l'étudiant
     */
    public function profile()
    {
        $student = Auth::user();
        
        return Inertia::render('Student/Profile', [
            'student' => $student->load(['schoolClass', 'academicYear']),
        ]);
    }

    /**
     * Mettre à jour le profil de l'étudiant
     */
    public function updateProfile(Request $request)
    {
        $student = Auth::user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->id,
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:500',
            'photo' => 'nullable|image|max:2048',
        ]);

        $data = $request->only(['name', 'email', 'telephone', 'adresse']);

        // Gestion de la photo de profil
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('profile-photos', 'public');
            $data['profile_photo_path'] = $photoPath;
        }

        $student->update($data);

        return back()->with('success', 'Profil mis à jour avec succès');
    }

    /**
     * Changer le mot de passe de l'étudiant
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $student = Auth::user();

        if (!Hash::check($request->current_password, $student->password)) {
            return back()->withErrors(['current_password' => 'Le mot de passe actuel est incorrect.']);
        }

        $student->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Mot de passe modifié avec succès');
    }

    /**
     * Méthodes utilitaires privées
     */
    private function getCurrentSemester()
    {
        $month = now()->month;
        return $month >= 9 || $month <= 2 ? 1 : 2; // Semestre 1: Sept-Fév, Semestre 2: Mars-Juin
    }

    private function hasAssignmentDue($schedule, $student)
    {
        return Assignment::whereHas('course', function($query) use ($schedule) {
            $query->where('id', $schedule->course_id);
        })
        ->where('due_date', '>=', now())
        ->where('due_date', '<=', now()->addDays(3))
        ->exists();
    }

    private function calculateClassRank($student, $average)
    {
        if (!$student->school_class_id || !$average) return null;

        $betterStudents = User::where('school_class_id', $student->school_class_id)
            ->where('id', '!=', $student->id)
            ->whereHas('grades', function($query) use ($average) {
                $query->selectRaw('student_id, AVG(score) as avg_score')
                      ->groupBy('student_id')
                      ->havingRaw('AVG(score) > ?', [$average]);
            })
            ->count();

        return $betterStudents + 1;
    }

    private function getPreviousMonthAverage($student)
    {
        $previousMonth = now()->subMonth();
        
        $grades = Grade::where('student_id', $student->id)
            ->whereMonth('created_at', $previousMonth->month)
            ->whereYear('created_at', $previousMonth->year)
            ->get();

        if ($grades->isEmpty()) return null;

        $totalPoints = 0;
        $totalCoefficients = 0;
        
        foreach ($grades as $grade) {
            $coefficient = $grade->coefficient ?? 1;
            $totalPoints += ($grade->score * $coefficient);
            $totalCoefficients += $coefficient;
        }
        
        return $totalCoefficients > 0 ? round($totalPoints / $totalCoefficients, 2) : 0;
    }

    private function getBestSubject($student)
    {
        $subjectAverages = Grade::where('student_id', $student->id)
            ->with('course')
            ->get()
            ->groupBy('course_id')
            ->map(function($grades) {
                $totalPoints = 0;
                $totalCoefficients = 0;
                
                foreach ($grades as $grade) {
                    $coefficient = $grade->coefficient ?? 1;
                    $totalPoints += ($grade->score * $coefficient);
                    $totalCoefficients += $coefficient;
                }
                
                return [
                    'subject' => $grades->first()->course->name,
                    'average' => $totalCoefficients > 0 ? round($totalPoints / $totalCoefficients, 2) : 0
                ];
            })
            ->sortByDesc('average')
            ->first();

        return $subjectAverages ? $subjectAverages['subject'] : null;
    }

    private function getSubjectsNeedingImprovement($student)
    {
        return Grade::where('student_id', $student->id)
            ->with('course')
            ->get()
            ->groupBy('course_id')
            ->map(function($grades) {
                $totalPoints = 0;
                $totalCoefficients = 0;
                
                foreach ($grades as $grade) {
                    $coefficient = $grade->coefficient ?? 1;
                    $totalPoints += ($grade->score * $coefficient);
                    $totalCoefficients += $coefficient;
                }
                
                return [
                    'subject' => $grades->first()->course->name,
                    'average' => $totalCoefficients > 0 ? round($totalPoints / $totalCoefficients, 2) : 0
                ];
            })
            ->where('average', '<', 10)
            ->pluck('subject')
            ->toArray();
    }

    private function getMonthSchedule($student)
    {
        if (!$student->school_class_id) {
            return [];
        }

        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        return Schedule::with(['course', 'classroom', 'teacher'])
            ->whereHas('schoolClasses', function($query) use ($student) {
                $query->where('school_classes.id', $student->school_class_id);
            })
            ->whereBetween('start_time', [$startOfMonth, $endOfMonth])
            ->where('status', 'active')
            ->orderBy('start_time')
            ->get()
            ->toArray();
    }

    private function getAllGrades($student)
    {
        return Grade::with(['course', 'teacher'])
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }
}