<?php

namespace App\Http\Controllers\Scolarite;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Course;
use App\Models\AcademicYear;
use App\Models\TeacherContract;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use App\Notifications\TeacherAccountCreated;
use Barryvdh\DomPDF\Facade\Pdf;

class EnseignantController extends Controller
{

    /**
     * Afficher la liste des enseignants
     */
    public function index(Request $request)
    {
        $query = User::with(['teacherCourses'])
            ->where('role', 'enseignant');

        // Filtres
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('prenom', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('matricule', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $teachers = $query->orderBy('name')->paginate(20);

        // Enrichir les données avec les contrats
        /*$teachers->getCollection()->transform(function ($teacher) {
            $teacher->contract = TeacherContract::where('teacher_id', $teacher->id)
                ->where('status', 'active')
                ->first();
            return $teacher;
        });*/

        return Inertia::render('Scolarite/Enseignant/Index', [
            'teachers' => $teachers,
            'filters' => $request->only(['search', 'statut']),
            'statistics' => [
                'total_teachers' => User::where('role', 'enseignant')->count(),
                'active_teachers' => User::where('role', 'enseignant')->where('statut', 'actif')->count(),
                //'teachers_with_contracts' => TeacherContract::where('status', 'active')->count(),
                /*'contracts_expiring' => TeacherContract::where('end_date', '<=', now()->addMonths(3))
                    ->where('status', 'active')->count(),*/
            ],
        ]);
    }

    /**
     * Afficher le formulaire de création d'enseignant
     */
    public function create()
    {
        return Inertia::render('Scolarite/Enseignant/Create', [
            'courses' => Course::orderBy('name')->get(),
            'academicYears' => AcademicYear::orderBy('name', 'desc')->get(),
        ]);
    }

    /**
     * Enregistrer un nouvel enseignant
     */
    public function store(Request $request)
    {

        
        $validatedData = $request->validate([
            // Informations personnelles
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'telephone' => 'required|string|max:20',
            'adresse' => 'nullable|string|max:500',
            'date_naissance' => 'required|date|before:today',
            'lieu_naissance' => 'nullable|string|max:255',
            'sexe' => 'required|in:M,F',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
         
            // Informations professionnelles
            'specialite' => 'required|string|max:255',
            'grade' => 'required|string|max:255',
            'date_embauche' => 'required|date',
            'status' => 'required|in:actif,inactif,conge',
            'notes_admin' => 'nullable|string|max:1000',
            
            // Cours assignés
            'courses' => 'nullable|array',
            'courses.*' => 'exists:courses,id',
            
            // Informations de contrat
            'type_contrat' => 'required|in:horaire,projet',
            'taux_horaire' => 'required_if:type_contrat,horaire|nullable|numeric|min:0',
            'salaire_mensuel' => 'nullable|required_unless:type_contrat,horaire|numeric|min:0',
            'contract_start_date' => 'required|date',
            'contract_end_date' => 'nullable|date|after:contract_start_date',
        ]);

    

        DB::beginTransaction();

        try {
            // Gérer l'upload de photo
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('enseignant/photos', 'public');
            }

        
            // Créer l'utilisateur enseignant
            $teacher = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => Hash::make('password'),
                'role' => 'enseignant',
                'telephone' => $validatedData['telephone'],
                'adresse' => $validatedData['adresse'],
                'date_naissance' => $validatedData['date_naissance'],
                'lieu_naissance' => $validatedData['lieu_naissance'],
                'sexe' => $validatedData['sexe'],
                'photo' => $photoPath,
                'statut' => $validatedData['status'],
                'specialite' =>$validatedData['specialite'],
                'grade' => $validatedData['grade'],
                'notes_admin' => $validatedData['notes_admin'],
            ]);

         

            // Générer le matricule
            $teacher->generateMatricule();

        
            if (!empty($validatedData['courses'])) {
                $courses = Course::whereIn('id', $validatedData['courses'])->get();

                $pivotData = [];
                foreach ($courses as $course) {
                    $pivotData[$course->id] = [
                        'academic_year_id' => $validatedData['academic_year_id'] ?? null,
                        'taux_horaire' => $course->pivot->taux_horaire ?? 0, // Utiliser le taux du cours
                        'assigned_at' => now(),
                    ];
                }

            $teacher->teacherCourses()->attach($pivotData);
        }


            // Créer le contrat global pour tous les cours
            //$contract = $this->createUnifiedContract($teacher, $validatedData, $courses);

            DB::commit();

            // Envoyer notification
           /*$teacher->notify(new TeacherAccountCreated([
                    'email' => $validatedData['email'],
                    'password' => $validatedData['password'],
                    'matricule' => $teacher->matricule,
                    'courses_count' => count($validatedData['courses']),
                // 'contract_number' => $contract->contract_number,
            ]));*/

            return redirect()->route('scolarite.enseignants.index')
                ->with('success', "L'enseignant {$teacher->name} {$teacher->prenom} a été créé avec succès.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            if ($photoPath) {
                Storage::disk('public')->delete($photoPath);
            }

            return back()->withErrors([
                'error' => 'Erreur lors de la création de l\'enseignant: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Créer un contrat unifié pour un enseignant
     */
    private function createUnifiedContract($teacher, $validatedData, $courses)
    {
        // Calculer les heures totales de tous les cours
        $totalHours = $courses->sum('total_hours');
        
        // Calculer la rémunération totale
        if ($validatedData['contract_type'] === 'horaire') {
            $totalCompensation = $courses->sum(function($course) use ($validatedData) {
                return $course->total_hours * $validatedData['taux_horaire'];
            });
        } else {
            // Pour les salaires mensuels, calculer sur 12 mois
            $totalCompensation = $validatedData['salaire_mensuel'] * 12;
        }

        return TeacherContract::create([
            'teacher_id' => $teacher->id,
            'contract_number' => $this->generateContractNumber(),
            'type_contrat' => $validatedData['type_contrat'],
            'start_date' => $validatedData['contract_start_date'],
            'end_date' => $validatedData['contract_end_date'],
            'taux_horaire' => $validatedData['taux_horaire'],
            'salaire__mensuel' => $validatedData['salaire__mensuel'],
            'total_hours' => $totalHours,
            'total_compensation' => $totalCompensation,
            'courses_summary' => $courses->pluck('name')->join(', '),
            'course_details' => $this->generateCourseDetails($courses),
            'terms_and_conditions' => $this->generateContractTerms($teacher, $courses, $validatedData),
            'status' => 'active',
            'created_by' => auth()->id(),
        ]);
    }

    /**
     * Générer les détails des cours pour le contrat
     */
    private function generateCourseDetails($courses)
    {
        return $courses->map(function($course) {
            return [
                'id' => $course->id,
                'name' => $course->name,
                'code' => $course->code,
                'credits' => $course->credits,
                'total_hours' => $course->total_hours,
                'taux_horaire' => $course->hourly_rate,
                'total_compensation' => $course->total_hours * $course->hourly_rate,
            ];
        })->toArray();
    }

    /**
     * Afficher les détails d'un enseignant
     */
    public function show(User $teacher)
    {
        $teacher->load(['teacherCourses']);
        //$teacher->load(['teacherCourses', 'teacherSchedules']);
        
        // Contrat actuel
        /*$currentContract = TeacherContract::where('teacher_id', $teacher->id)
            ->where('status', 'active')
            ->first();*/

        // Statistiques d'enseignement
        $teachingStats = [
            'total_courses' => $teacher->teacherCourses->count(),
            'total_hours_assigned' => $teacher->teacherCourses->sum('total_hours'),
            'completed_hours' => $this->getCompletedHours($teacher->id),
            'total_earnings' => $this->calculateTotalEarnings($teacher->id),
            'classes_taught' => $this->getClassesTaught($teacher->id),
        ];

        return Inertia::render('Scolarite/Enseignant/Show', [
            'teacher' => $teacher,
            //'currentContract' => $currentContract,
            'teachingStats' => $teachingStats,
            'recentSchedules' => $teacher->teacherSchedules()
                ->with(['course'])
                ->latest()
                ->limit(10)
                ->get(),
        ]);
    }

    /**
 * Afficher le formulaire d'édition d'un enseignant
 */
public function edit(User $teacher)
{
    // Charger les relations nécessaires
    $teacher->load(['teacherCourses']);
    
    // Récupérer le contrat actif si existant
    /*$activeContract = TeacherContract::where('teacher_id', $teacher->id)
        ->where('status', 'active')
        ->first();*/
    
    return Inertia::render('Scolarite/Enseignant/Edit', [
        'teacher' => $teacher,
        'courses' => Course::orderBy('name')->get(),
        'academicYears' => AcademicYear::orderBy('name', 'desc')->get(),
        'assignedCourses' => $teacher->teacherCourses->pluck('id')->toArray(),
        //'activeContract' => $activeContract,
    ]);
}

/**
 * Mettre à jour les informations d'un enseignant
 */
public function update(Request $request, User $teacher)
{
    $validatedData = $request->validate([
        // Informations personnelles
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users,email,' . $teacher->id,
        'telephone' => 'required|string|max:20',
        'adresse' => 'nullable|string|max:500',
        'date_naissance' => 'required|date|before:today',
        'lieu_naissance' => 'nullable|string|max:255',
        'sexe' => 'required|in:M,F',
        'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
     
        // Informations professionnelles
        'specialite' => 'required|string|max:255',
        'grade' => 'required|string|max:255',
        'date_embauche' => 'required|date',
        'status' => 'required|in:actif,inactif,conge',
        'notes_admin' => 'nullable|string|max:1000',
        
        // Cours assignés
        'courses' => 'nullable|array',
        'courses.*' => 'exists:courses,id',
        'academic_year_id' => 'nullable|exists:academic_years,id',
        
        // Informations de contrat (optionnelles pour la mise à jour)
        'type_contrat' => 'nullable|in:horaire,projet',
        'taux_horaire' => 'nullable|numeric|min:0',
        'salaire_mensuel' => 'nullable|numeric|min:0',
        'update_contract' => 'boolean', // Pour savoir si on doit mettre à jour le contrat
    ]);

    DB::beginTransaction();

    try {
        // Gérer l'upload de photo
        if ($request->hasFile('photo')) {
            // Supprimer l'ancienne photo si elle existe
            if ($teacher->photo) {
                Storage::disk('public')->delete($teacher->photo);
            }
            $validatedData['photo'] = $request->file('photo')->store('enseignant/photos', 'public');
        }

        // Mettre à jour les informations de l'enseignant
        $teacher->update([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'telephone' => $validatedData['telephone'],
            'adresse' => $validatedData['adresse'],
            'date_naissance' => $validatedData['date_naissance'],
            'lieu_naissance' => $validatedData['lieu_naissance'],
            'sexe' => $validatedData['sexe'],
            'photo' => $validatedData['photo'] ?? $teacher->photo,
            'statut' => $validatedData['status'],
            'specialite' => $validatedData['specialite'],
            'grade' => $validatedData['grade'],
            'notes_admin' => $validatedData['notes_admin'],
        ]);

        // Mettre à jour les cours assignés si fournis
        if (isset($validatedData['courses'])) {
            if (!empty($validatedData['courses'])) {
                $courses = Course::whereIn('id', $validatedData['courses'])->get();

                $pivotData = [];
                foreach ($courses as $course) {
                    $pivotData[$course->id] = [
                        'academic_year_id' => $validatedData['academic_year_id'] ?? null,
                        'assigned_at' => now(),
                    ];
                }

                $teacher->teacherCourses()->sync($pivotData);
            } else {
                // Si le tableau est vide, détacher tous les cours
                $teacher->teacherCourses()->detach();
            }
        }

        // Mettre à jour le contrat si demandé
        /*if ($request->boolean('update_contract') && isset($validatedData['type_contrat'])) {
            $activeContract = TeacherContract::where('teacher_id', $teacher->id)
                ->where('status', 'active')
                ->first();

            if ($activeContract) {
                $activeContract->update([
                    'type_contrat' => $validatedData['type_contrat'],
                    'taux_horaire' => $validatedData['taux_horaire'] ?? $activeContract->taux_horaire,
                    'salaire_mensuel' => $validatedData['salaire_mensuel'] ?? $activeContract->salaire_mensuel,
                    'updated_at' => now(),
                ]);
            }
        }*/

        DB::commit();

        return redirect()->route('scolarite.enseignants.index')
            ->with('success', "Les informations de l'enseignant {$teacher->name} ont été mises à jour avec succès.");

    } catch (\Exception $e) {
        DB::rollBack();
        
        // Supprimer la nouvelle photo en cas d'erreur
        if (isset($validatedData['photo']) && $validatedData['photo'] !== $teacher->photo) {
            Storage::disk('public')->delete($validatedData['photo']);
        }

        return back()->withErrors([
            'error' => 'Erreur lors de la mise à jour de l\'enseignant: ' . $e->getMessage()
        ])->withInput();
    }
}

/**
 * Supprimer un enseignant (soft delete recommandé)
 */
public function destroy(User $teacher)
{
    DB::beginTransaction();

    try {
        // Vérifier s'il y a des contrats actifs
        /*$activeContracts = TeacherContract::where('teacher_id', $teacher->id)
            ->where('status', 'active')
            ->count();

        if ($activeContracts > 0) {
            return back()->withErrors([
                'error' => 'Impossible de supprimer cet enseignant car il a des contrats actifs. Veuillez d\'abord résilier les contrats.'
            ]);
        }*/

        // Détacher tous les cours
        $teacher->teacherCourses()->detach();

        // Changer le statut au lieu de supprimer (soft delete manuel)
        $teacher->update([
            'statut' => 'inactif',
            'email' => $teacher->email . '_deleted_' . time(), // Pour éviter les conflits d'email
        ]);

        // Ou vraiment supprimer si vous préférez
        // $teacher->delete();

        DB::commit();

        return redirect()->route('scolarite.enseignants.index')
            ->with('success', 'L\'enseignant a été désactivé avec succès.');

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors([
            'error' => 'Erreur lors de la suppression: ' . $e->getMessage()
        ]);
    }
}

    /**
     * Gestion des contrats
     */
    public function contracts(Request $request)
    {
        $query = TeacherContract::with(['teacher']);

        // Filtres
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('contract_type', $request->type);
        }

        if ($request->filled('expiring')) {
            $query->where('end_date', '<=', now()->addMonths(3));
        }

        $contracts = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Scolarite/Enseignant/Contracts', [
            'contracts' => $contracts,
            'filters' => $request->only(['status', 'type', 'expiring']),
            'statistics' => [
                'active_contracts' => TeacherContract::where('status', 'active')->count(),
                'expiring_contracts' => TeacherContract::where('end_date', '<=', now()->addMonths(3))
                    ->where('status', 'active')->count(),
                'total_compensation' => TeacherContract::where('status', 'active')
                    ->sum('total_compensation'),
                'average_compensation' => TeacherContract::where('status', 'active')
                    ->avg('total_compensation'),
            ],
        ]);
    }

    /**
     * Créer un nouveau contrat pour un enseignant existant
     */
    public function createContract(User $teacher)
    {
        return Inertia::render('Scolarite/Enseignant/CreateContract', [
            'teacher' => $teacher->load(['teacherCourses']),
            'courses' => Course::orderBy('name')->get(),
            'currentContract' => TeacherContract::where('teacher_id', $teacher->id)
                ->where('status', 'active')
                ->first(),
        ]);
    }

    /**
     * Enregistrer un nouveau contrat
     */
    public function storeContract(Request $request, User $teacher)
    {
        $validatedData = $request->validate([
            'type_contrat' => 'required|in:permanent,temporary,hourly,project',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'hourly_rate' => 'required_if:contract_type,hourly|nullable|numeric|min:0',
            'monthly_salary' => 'required_unless:contract_type,hourly|nullable|numeric|min:0',
            'courses' => 'required|array|min:1',
            'courses.*' => 'exists:courses,id',
            'terms_and_conditions' => 'nullable|string',
            'replace_current' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            // Si demandé, désactiver l'ancien contrat
            if ($validatedData['replace_current']) {
                TeacherContract::where('teacher_id', $teacher->id)
                    ->where('status', 'active')
                    ->update(['status' => 'replaced', 'updated_at' => now()]);
            }

            // Récupérer les cours
            $courses = Course::whereIn('id', $validatedData['courses'])->get();

            // Mettre à jour les cours assignés à l'enseignant
            $teacher->teacherCourses()->sync($validatedData['courses']);

            // Créer le nouveau contrat
            $contract = $this->createUnifiedContract($teacher, $validatedData, $courses);

            DB::commit();

            return redirect()->route('admin.teachers.contracts')
                ->with('success', 'Nouveau contrat créé avec succès pour ' . $teacher->name . ' ' . $teacher->prenom);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la création du contrat: ' . $e->getMessage()]);
        }
    }

    /**
     * Générer le PDF du contrat
     */
    public function generateContractPDF(TeacherContract $contract)
    {
        $contract->load(['teacher']);
        $courseDetails = $contract->course_details ?? [];
        
        $pdf = PDF::loadView('contracts.teacher-contract-unified', [
            'contract' => $contract,
            'teacher' => $contract->teacher,
            'courseDetails' => $courseDetails,
            'generated_at' => now(),
        ]);

        $fileName = "contrat_{$contract->teacher->matricule}_{$contract->contract_number}.pdf";
        return $pdf->download($fileName);
    }

    /**
     * Calculer les gains d'un enseignant
     */
    public function calculateEarnings(User $teacher, Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $earnings = [];
        
        foreach ($teacher->teacherCourses as $course) {
            $courseEarnings = $course->getTeacherEarnings($teacher->id);
            $earnings[] = [
                'course_name' => $course->name,
                'course_code' => $course->code,
                'taux_horaire' => $course->taux_horaire,
                'completed_hours' => $course->getCompletedHours(),
                'total_earnings' => $courseEarnings,
            ];
        }

        return response()->json([
            'teacher' => $teacher->only(['id', 'name', 'prenom', 'matricule']),
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'earnings_by_course' => $earnings,
            'total_earnings' => collect($earnings)->sum('total_earnings'),
        ]);
    }

    /**
     * Renouveler un contrat
     */
    public function renewContract(Request $request, TeacherContract $contract)
    {
        $request->validate([
            'new_end_date' => 'required|date|after:' . $contract->end_date,
            'salary_adjustment' => 'nullable|numeric',
            'new_courses' => 'nullable|array',
            'new_courses.*' => 'exists:courses,id',
        ]);

        DB::beginTransaction();

        try {
            $updates = [
                'end_date' => $request->new_end_date,
                'renewed_at' => now(),
                'renewed_by' => auth()->id(),
            ];

            // Ajustement salarial
            if ($request->filled('salary_adjustment')) {
                if ($contract->contract_type === 'hourly') {
                    $updates['taux_horaire'] = $contract->taux_horaire + $request->salary_adjustment;
                } else {
                    $updates['monthly_salary'] = $contract->salaire_mensuel + $request->salary_adjustment;
                }
                
                // Recalculer la compensation totale
                $updates['total_compensation'] = $this->recalculateCompensation($contract, $updates);
            }

            // Nouveaux cours
            if ($request->filled('new_courses')) {
                $newCourses = Course::whereIn('id', $request->new_courses)->get();
                $updates['courses_summary'] = $newCourses->pluck('name')->join(', ');
                $updates['course_details'] = $this->generateCourseDetails($newCourses);
                $updates['total_hours'] = $newCourses->sum('total_hours');
                
                // Mettre à jour les cours de l'enseignant
                $contract->teacher->teacherCourses()->sync($request->new_courses);
            }

            $contract->update($updates);

            DB::commit();

            return back()->with('success', 'Contrat renouvelé avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors du renouvellement: ' . $e->getMessage()]);
        }
    }

    /**
     * Résilier un contrat
     */
    public function terminateContract(Request $request, TeacherContract $contract)
    {
        $request->validate([
            'termination_reason' => 'required|string|max:1000',
            'termination_date' => 'required|date',
        ]);

        $contract->update([
            'status' => 'terminated',
            'termination_date' => $request->termination_date,
            'termination_reason' => $request->termination_reason,
            'terminated_by' => auth()->id(),
        ]);

        // Mettre à jour le statut de l'enseignant
        $contract->teacher->update(['statut' => 'inactif']);

        return back()->with('success', 'Contrat résilié avec succès');
    }

    /**
     * Méthodes utilitaires privées
     */
    private function generateContractNumber()
    {
        $year = date('Y');
        $count = TeacherContract::whereYear('created_at', $year)->count() + 1;
        return 'CTR-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    private function generateContractTerms($teacher, $courses, $validatedData)
    {
        $terms = [
            'CONTRAT D\'ENSEIGNEMENT',
            '',
            'Entre l\'établissement ' . config('app.name') . ' et M./Mme ' . $teacher->name . ' ' . $teacher->prenom,
            '',
            'COURS ASSIGNÉS:',
            $courses->map(function($course) {
                return "- {$course->name} ({$course->code}) - {$course->total_hours}h total - {$course->hourly_rate} XAF/h";
            })->join("\n"),
            '',
            'CONDITIONS FINANCIÈRES:',
        ];

        if ($validatedData['contract_type'] === 'hourly') {
            $terms[] = "- Rémunération à l'heure: Selon taux défini par cours";
            $terms[] = "- Taux horaire moyen: {$validatedData['hourly_rate']} XAF/heure";
        } else {
            $terms[] = "- Salaire mensuel: {$validatedData['monthly_salary']} XAF";
        }

        $terms = array_merge($terms, [
            '',
            'OBLIGATIONS DE L\'ENSEIGNANT:',
            '- Respecter les horaires de cours',
            '- Préparer et dispenser les cours selon le programme',
            '- Évaluer les étudiants',
            '- Tenir les registres de présence',
            '- Participer aux réunions pédagogiques',
            '',
            'OBLIGATIONS DE L\'ÉTABLISSEMENT:',
            '- Fournir les ressources pédagogiques nécessaires',
            '- Payer la rémunération selon les termes convenus',
            '- Assurer un environnement de travail approprié',
        ]);

        return implode("\n", $terms);
    }

    private function getCompletedHours($teacherId)
    {
        return DB::table('schedules')
            ->join('courses', 'schedules.course_id', '=', 'courses.id')
            ->where('schedules.teacher_id', $teacherId)
            ->where('schedules.status', 'completed')
            ->sum(DB::raw('TIMESTAMPDIFF(MINUTE, schedules.start_time, schedules.end_time) / 60'));
    }

    private function calculateTotalEarnings($teacherId)
    {
        $teacher = User::find($teacherId);
        $totalEarnings = 0;

        foreach ($teacher->teacherCourses as $course) {
            $totalEarnings += $course->getTeacherEarnings($teacherId);
        }

        return $totalEarnings;
    }

    private function getClassesTaught($teacherId)
    {
        return DB::table('schedules')
            ->join('school_classes', 'schedules.school_class_id', '=', 'school_classes.id')
            ->where('schedules.teacher_id', $teacherId)
            ->distinct()
            ->count('school_classes.id');
    }

    private function recalculateCompensation($contract, $updates)
    {
        if ($contract->contract_type === 'hourly') {
            $newRate = $updates['hourly_rate'] ?? $contract->hourly_rate;
            return $contract->total_hours * $newRate;
        } else {
            $newSalary = $updates['monthly_salary'] ?? $contract->monthly_salary;
            return $newSalary * 12; // Compensation annuelle
        }
    }
}



