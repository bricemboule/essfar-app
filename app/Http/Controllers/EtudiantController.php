<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Attendance;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class EtudiantController extends Controller
{
    /**
     * Afficher la liste des étudiants
     */

    public function index(Request $request)
{
    $query = User::where('role', 'etudiant')
        ->with(['studentEnrollments'])
        ->orderBy('created_at', 'desc');

       
    // Filtres
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('telephone', 'like', "%{$search}%");
        });
    }

    if ($request->filled('class')) {
        $query->where('school_class_id', $request->class);
    }

    if ($request->filled('sexe')) {
        $query->where('sexe', $request->sexe);
    }

    if ($request->filled('statut')) {
        $query->where('statut', $request->statut);
    }

    $students = $query->paginate(20)->withQueryString();

    // Formater la date de naissance
    $students->getCollection()->transform(function ($student) {
        $student->date_naissance_formatted = $student->date_naissance
            ? Carbon::parse($student->date_naissance)->format('d/m/Y')
            : null;

    $lastEnrollment = $student->studentEnrollments->sortByDesc('enrollment_date')->first();
    $student->current_class = $lastEnrollment ? $lastEnrollment->schoolClass->name : null;
    $student->current_academic_year = $lastEnrollment ? $lastEnrollment->academicYear->name : null;

        return $student;
    });


    

    // Statistiques
    $stats = [
        'total' => User::where('role', 'etudiant')->count(),
        'active' => User::where('role', 'etudiant')->where('statut', 'active')->count(),
        'new_this_month' => User::where('role', 'etudiant')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count(),
        'scholarships' => User::where('role', 'etudiant')->count(),
    ];

    // Classes pour les filtres
    $classes = SchoolClass::withCount('students')->get();
       
    return Inertia::render('Scolarite/Etudiant/Index', [
        'students' => $students,
        'classes' => $classes,
        'stats' => $stats,
        'filters' => $request->only(['search', 'class', 'statut'])
    ]);
}


    /**
     * Afficher le formulaire de création d'un étudiant
     */
    public function create()
    {
        $academicYears = AcademicYear::orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $classes = SchoolClass::with('students')
            ->get()
            ->map(function ($class) {
                $class->current_students = $class->students->count();
                return $class;
            });

        return Inertia::render('Scolarite/Etudiant/Create', [
            'academicYears' => $academicYears,
            'classes' => $classes
        ]);
    }

    /**
     * Enregistrer un nouvel étudiant
     */
    public function store(Request $request)
    {
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:500',
            'date_naissance' => 'required|date|before:today',
            'lieu_naissance' => 'required|string|max:255',
            'sexe' => 'required|in:M,F',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'school_class_id' => 'required|exists:school_classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'previous_school' => 'nullable|string|max:255',
            'scholarship' => 'boolean',
            'contact_urgent' => 'nullable|string|max:255',
            'medical_info' => 'nullable|string|max:1000',
            'notes_admin' => 'nullable|string|max:1000',
        ]);

        

        DB::beginTransaction();

        try {
            // Vérifier la capacité de la classe
            $schoolClass = SchoolClass::findOrFail($request->school_class_id);
            $currentStudents = $schoolClass->students()->count();
            
            if ($currentStudents >= $schoolClass->capacity) {
                return back()->withErrors([
                    'school_class_id' => 'Cette classe a atteint sa capacité maximale.'
                ]);
            }

            // Upload de la photo
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('students/photos', 'public');
            }
           
            // Créer l'étudiant
            $student = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'etudiant',
                'telephone' => $request->telephone,
                'adresse' => $request->adresse,
                'date_naissance' => $request->date_naissance,
                'lieu_naissance' => $request->lieu_naissance,
                'sexe' => $request->sexe,
                'photo' => $photoPath,
                'school_class_id' => $request->school_class_id,
                'academic_year_id' => $request->academic_year_id,
                'parent_name' => $request->parent_name,
                'parent_phone' => $request->parent_phone,
                'parent_email' => $request->parent_email,
                'previous_school' => $request->previous_school,
                'scholarship' => $request->boolean('scholarship'),
                'contact_urgent' => $request->contact_urgent,
                'medical_info' => $request->medical_info,
                'notes_admin' => $request->notes_admin,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $student->studentEnrollments()->create([
                'school_class_id' => $request->school_class_id,
                'academic_year_id' => $request->academic_year_id,
                'enrollment_date' => now(),
                'status' => 'active',
            ]);

            DB::commit();

            // Envoyer email de bienvenue (optionnel)
            $this->sendWelcomeEmail($student, $request->password);

            return redirect()->route('academic.etudiants.index')
                ->with('success', 'Étudiant inscrit avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Supprimer la photo si elle a été uploadée
            if ($photoPath && Storage::disk('public')->exists($photoPath)) {
                Storage::disk('public')->delete($photoPath);
            }

            return back()->withErrors([
                'error' => 'Une erreur est survenue lors de l\'inscription.'
            ])->withInput();
        }
    }

    /**
     * Afficher les détails d'un étudiant
     */
public function show(User $student)
{
    if ($student->role !== 'etudiant') {
        abort(404);
    }

    // Charger les relations nécessaires
    $student->load([
        'studentEnrollments.schoolClass',
        'studentEnrollments.academicYear',
    ]);

    // Formater la date de naissance
    $student->date_naissance_formatted = $student->date_naissance
        ? \Carbon\Carbon::parse($student->date_naissance)->format('d/m/Y')
        : null;

    // Récupérer la dernière inscription (classe + année + date)
    $lastEnrollment = $student->studentEnrollments
        ->sortByDesc('enrollment_date')
        ->first();

    $student->current_class = $lastEnrollment ? $lastEnrollment->schoolClass->name : null;
    $student->current_academic_year = $lastEnrollment ? $lastEnrollment->academicYear->name : null;
    $student->enrollment_date = $lastEnrollment && $lastEnrollment->enrollment_date
        ? \Carbon\Carbon::parse($lastEnrollment->enrollment_date)->format('d/m/Y')
        : null;

    // Statistiques
    $stats = [
        'attendance_rate' => 12,
        'total_absences' => 12,
        'total_resources' => 10,
        'enrollment_date' => $student->created_at->format('d/m/Y'),
    ];

    return inertia('Scolarite/Etudiant/Show', [
        'student' => $student,
        'stats' => $stats,
    ]);
}



    /**
     * Afficher le formulaire d'édition
     */
    public function edit(User $student)
    {
      
        if ($student->role !== 'etudiant') {
            abort(404);
        }
          
        $academicYears = AcademicYear::orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

      $classes = SchoolClass::with('students')->get()->map(function ($class) use ($student) {
                    $excludedId = $student?->id;
                    $class->current_students = $excludedId
                    ? $class->students->where('id', '!=', $excludedId)->count()
                    : $class->students->count();

                return $class;
                });

               $student->date_naissance_formatted = $student->date_naissance
                        ? Carbon::parse($student->date_naissance)->format('Y/m/d')
                        : null;
          
        return Inertia::render('Scolarite/Etudiant/Edit', [
            'student' => $student,
            'academicYears' => $academicYears,
            'classes' => $classes
        ]);
    }

    /**
     * Mettre à jour un étudiant
     */
    public function update(Request $request, User $student)
    {
        if ($student->role !== 'etudiant') {
            abort(404);
        }

    
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($student->id)],
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:500',
            'date_naissance' => 'required|date|before:today',
            'lieu_naissance' =>'required|string|max:255',
            'sexe' => 'required|in:M,F',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'school_class_id' => 'required|exists:school_classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email',
            'previous_school' => 'nullable|string|max:255',
            'scholarship' => 'boolean',
            'contact_urgent' => 'nullable|string|max:255',
            'medical_info' => 'nullable|string|max:1000',
            'notes_admin' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive,suspended,expelled',
        ]);
  
        DB::beginTransaction();

        try {
            // Vérifier la capacité si changement de classe
            if ($request->school_class_id != $student->school_class_id) {
                $newClass = SchoolClass::findOrFail($request->school_class_id);
                $currentStudents = $newClass->students()->count();
                
                if ($currentStudents >= $newClass->capacity) {
                    return back()->withErrors([
                        'school_class_id' => 'Cette classe a atteint sa capacité maximale.'
                    ]);
                }
            }

            // Upload nouvelle photo
            if ($request->hasFile('photo')) {
                // Supprimer ancienne photo
                if ($student->photo && Storage::disk('public')->exists($student->photo)) {
                    Storage::disk('public')->delete($student->photo);
                }
                $photoPath = $request->file('photo')->store('students/photos', 'public');
                $student->photo = $photoPath;
            }

            // Mettre à jour les données
            $student->update([
                'name' => $request->name,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'adresse' => $request->adresse,
                'date_naissance' => $request->date_naissance,
                'lieu_naissance' => $request->lieu_naissance,
                'sexe' => $request->sexe,
                'school_class_id' => $request->school_class_id,
                'academic_year_id' => $request->academic_year_id,
                'parent_name' => $request->parent_name,
                'parent_phone' => $request->parent_phone,
                'parent_email' => $request->parent_email,
                'previous_school' => $request->previous_school,
                'scholarship' => $request->boolean('scholarship'),
                'contact_urgent' => $request->contact_urgent,
                'medical_info' => $request->medical_info,
                'notes_admin' => $request->notes_admin,
                'status' => $request->status,
            ]);

            if ($request->hasFile('photo')) {
                $student->save();
            }

            DB::commit();

            return redirect()->route('academic.etudiants.show', $student)
                ->with('success', 'Informations mises à jour avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Une erreur est survenue lors de la mise à jour.'
            ])->withInput();
        }
    }

    /**
     * Supprimer un étudiant
     */
    public function destroy(User $student)
    {
        if ($student->role !== 'etudiant') {
            abort(404);
        }

        DB::beginTransaction();

        try {
            // Supprimer la photo
            if ($student->photo && Storage::disk('public')->exists($student->photo)) {
                Storage::disk('public')->delete($student->photo);
            }

            // Supprimer les données liées
            $student->attendances()->delete();
            $student->resources()->delete();
            
            $student->delete();

            DB::commit();

            return redirect()->route('academic.etudiants.index')
                ->with('success', 'Étudiant supprimé avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Impossible de supprimer cet étudiant.'
            ]);
        }
    }

    /**
     * Afficher les absences et retards d'un étudiant
     */
    public function attendance(Request $request, User $student)
    {
        if ($student->role !== 'etudiant') {
            abort(404);
        }

        $query = Attendance::where('student_id', $student->id)
            ->with(['subject'])
            ->orderBy('date', 'desc');

        // Filtres
        if ($request->filled('month')) {
            $month = Carbon::createFromFormat('Y-m', $request->month);
            $query->whereYear('date', $month->year)
                  ->whereMonth('date', $month->month);
        }

        if ($request->filled('subject')) {
            $query->where('subject_id', $request->subject);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $attendanceRecords = $query->get();

        // Statistiques
        $stats = [
            'total_absences' => $attendanceRecords->where('type', 'absence')->count(),
            'total_retards' => $attendanceRecords->where('type', 'retard')->count(),
            'hours_missed' => $attendanceRecords->sum('hours_missed'),
            'justified_percentage' => $attendanceRecords->count() > 0 
                ? round(($attendanceRecords->where('justified', true)->count() / $attendanceRecords->count()) * 100)
                : 0,
        ];

        // Matières pour les filtres
        $subjects = Subject::whereHas('schoolClasses', function ($query) use ($student) {
            $query->where('school_classes.id', $student->school_class_id);
        })->get();

        return Inertia::render('Admin/Students/Attendance', [
            'student' => $student->load('schoolClass'),
            'attendanceRecords' => $attendanceRecords,
            'subjects' => $subjects,
            'stats' => $stats,
            'filters' => $request->only(['month', 'subject', 'type'])
        ]);
    }

    /**
     * Afficher les ressources d'un étudiant
     */
    public function resources(Request $request, User $student)
    {
        if ($student->role !== 'etudiant') {
            abort(404);
        }

        $query = Resource::where('student_id', $student->id)
            ->with(['subject'])
            ->orderBy('created_at', 'desc');

        // Filtres
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('subject')) {
            $query->where('subject_id', $request->subject);
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        $resources = $query->get();

        // Statistiques
        $stats = [
            'total_devoirs' => $resources->where('type', 'devoir')->count(),
            'total_anciens_cc' => $resources->where('type', 'ancien_cc')->count(),
            'total_session_normale' => $resources->where('type', 'session_normale')->count(),
            'total_session_rattrapage' => $resources->where('type', 'session_rattrapage')->count(),
        ];

        // Matières pour les filtres
        $subjects = Subject::whereHas('schoolClasses', function ($query) use ($student) {
            $query->where('school_classes.id', $student->school_class_id);
        })->get();

        return Inertia::render('Admin/Students/Resources', [
            'student' => $student->load('schoolClass'),
            'resources' => $resources,
            'subjects' => $subjects,
            'stats' => $stats,
            'filters' => $request->only(['type', 'subject', 'semester'])
        ]);
    }

    /**
     * Actions groupées sur plusieurs étudiants
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,suspend,export',
            'students' => 'required|array',
            'students.*' => 'exists:users,id'
        ]);

        $students = User::whereIn('id', $request->students)
            ->where('role', 'etudiant')
            ->get();

        switch ($request->action) {
            case 'activate':
                $students->each(function ($student) {
                    $student->update(['status' => 'active']);
                });
                $message = 'Étudiants activés avec succès.';
                break;

            case 'deactivate':
                $students->each(function ($student) {
                    $student->update(['status' => 'inactive']);
                });
                $message = 'Étudiants désactivés avec succès.';
                break;

            case 'suspend':
                $students->each(function ($student) {
                    $student->update(['status' => 'suspended']);
                });
                $message = 'Étudiants suspendus avec succès.';
                break;

            case 'export':
                return $this->exportStudents($students);
        }

        return redirect()->route('admin.students.index')
            ->with('success', $message);
    }

    /**
     * Réinitialiser le mot de passe d'un étudiant
     */
    public function resetPassword(Request $request, User $student)
    {
        if ($student->role !== 'etudiant') {
            abort(404);
        }

        $request->validate([
            'password' => 'required|string|min:8'
        ]);

        $student->update([
            'password' => Hash::make($request->password)
        ]);

        // Envoyer email avec nouveau mot de passe (optionnel)
        $this->sendPasswordResetEmail($student, $request->password);

        return back()->with('success', 'Mot de passe réinitialisé avec succès.');
    }

    /**
     * Calculer le taux de présence d'un étudiant
     */
    private function calculateAttendanceRate($student)
    {
        $totalClasses = 100; // À adapter selon votre système
        $absences = Attendance::where('student_id', $student->id)
            ->where('type', 'absence')
            ->count();

        return max(0, round((($totalClasses - $absences) / $totalClasses) * 100));
    }

    /**
     * Envoyer email de bienvenue
     */
    private function sendWelcomeEmail($student, $password)
    {
        // Implémenter l'envoi d'email de bienvenue
        // Mail::to($student->email)->send(new WelcomeStudentMail($student, $password));
    }

    /**
     * Envoyer email de réinitialisation de mot de passe
     */
    private function sendPasswordResetEmail($student, $password)
    {
        // Implémenter l'envoi d'email
        // Mail::to($student->email)->send(new PasswordResetMail($student, $password));
    }

    /**
     * Exporter la liste des étudiants
     */
    private function export($students)
    {
        // Implémenter l'export Excel/CSV
        return response()->json(['message' => 'Export en cours de développement']);
    }
}