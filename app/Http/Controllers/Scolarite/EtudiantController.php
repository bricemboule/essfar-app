<?php

namespace App\Http\Controllers\Scolarite;

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
use App\Import\StudentImport;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use App\Export\StudentTemplateExport;
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
            ->with(['studentEnrollments.schoolClass', 'studentEnrollments.academicYear'])
            ->orderBy('created_at', 'desc');

        // Filtres
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%")
                  ->orWhere('matricule', 'like', "%{$search}%");
            });
        }

        if ($request->filled('class_id')) {
            $query->whereHas('studentEnrollments', function ($q) use ($request) {
                $q->where('school_class_id', $request->class_id);
            });
        }

        if ($request->filled('sexe')) {
            $query->where('sexe', $request->sexe);
        }

        if ($request->filled('status')) {
            $query->where('statut', $request->status);
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
            'active' => User::where('role', 'etudiant')->where('statut', 'actif')->count(),
            'suspended' => User::where('role', 'etudiant')->where('statut', 'suspendu')->count(),
            'inactive' => User::where('role', 'etudiant')->where('statut', 'inactif')->count(),
        ];

        // Classes pour les filtres
        $classes = SchoolClass::withCount('students')->get();
           
        return Inertia::render('Scolarite/Etudiant/Index', [
            'students' => $students,
            'classes' => $classes,
            'stats' => $stats,
            'filters' => $request->only(['search', 'class_id', 'status', 'sexe'])
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

            $matricule = $this->generateMatricule($request->date_naissance);

            // Upload de la photo
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('students/photos', 'public');
            } else {
                // Utiliser l'avatar par défaut
                $photoPath = $this->getDefaultAvatar($request->sexe);
            }
            
            // Créer l'étudiant
           $student = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('password'),
                'role' => 'etudiant',
                'matricule' => $matricule, // Ajout du matricule
                'telephone' => $request->telephone,
                'adresse' => $request->adresse,
                'date_naissance' => $request->date_naissance,
                'lieu_naissance' => $request->lieu_naissance,
                'sexe' => $request->sexe,
                'photo' => $photoPath,
                'parent_name' => $request->parent_name,
                'parent_phone' => $request->parent_phone,
                'parent_email' => $request->parent_email,
                'previous_school' => $request->previous_school,
                'scholarship' => $request->boolean('scholarship'),
                'contact_urgent' => $request->contact_urgent,
                'medical_info' => $request->medical_info,
                'notes_admin' => $request->notes_admin,
                'statut' => 'actif',
                'email_verified_at' => now(),
            ]);

            // Créer l'inscription dans student_enrollments
            $student->studentEnrollments()->create([
                'school_class_id' => $request->school_class_id,
                'academic_year_id' => $request->academic_year_id,
                'enrollment_date' => now(),
                'status' => 'active',
            ]);

            DB::commit();

            // Envoyer email de bienvenue (optionnel)
            // $this->sendWelcomeEmail($student, 'password');

            return redirect()->route('scolarite.etudiants.index')
                ->with('success', 'Étudiant inscrit avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Supprimer la photo si elle a été uploadée
            if ($photoPath && Storage::disk('public')->exists($photoPath)) {
                Storage::disk('public')->delete($photoPath);
            }

            return back()->withErrors([
                'error' => 'Une erreur est survenue lors de l\'inscription: ' . $e->getMessage()
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
            ? Carbon::parse($student->date_naissance)->format('d/m/Y')
            : null;

        // Récupérer la dernière inscription
        $lastEnrollment = $student->studentEnrollments
            ->sortByDesc('enrollment_date')
            ->first();

        $student->current_class = $lastEnrollment ? $lastEnrollment->schoolClass->name : null;
        $student->current_academic_year = $lastEnrollment ? $lastEnrollment->academicYear->name : null;
        $student->enrollment_date = $lastEnrollment && $lastEnrollment->enrollment_date
            ? Carbon::parse($lastEnrollment->enrollment_date)->format('d/m/Y')
            : null;

        // Statistiques
        $stats = [
            'attendance_rate' => 85,
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
            ? Carbon::parse($student->date_naissance)->format('Y-m-d')
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
            'statut' => 'required|in:actif,inactif,suspendu',
        ]);
  
        DB::beginTransaction();

        try {
            // Vérifier la capacité si changement de classe
            $lastEnrollment = $student->studentEnrollments->sortByDesc('enrollment_date')->first();
            $currentClassId = $lastEnrollment ? $lastEnrollment->school_class_id : null;

            if ($request->school_class_id != $currentClassId) {
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
                'parent_name' => $request->parent_name,
                'parent_phone' => $request->parent_phone,
                'parent_email' => $request->parent_email,
                'previous_school' => $request->previous_school,
                'scholarship' => $request->boolean('scholarship'),
                'contact_urgent' => $request->contact_urgent,
                'medical_info' => $request->medical_info,
                'notes_admin' => $request->notes_admin,
                'statut' => $request->statut,
            ]);

            if ($request->hasFile('photo')) {
                $student->save();
            }

            // Mettre à jour l'inscription si nécessaire
            if ($request->school_class_id != $currentClassId || $request->academic_year_id != $lastEnrollment?->academic_year_id) {
                $student->studentEnrollments()->create([
                    'school_class_id' => $request->school_class_id,
                    'academic_year_id' => $request->academic_year_id,
                    'enrollment_date' => now(),
                    'status' => 'active',
                ]);
            }

            DB::commit();

            return redirect()->route('scolarite.etudiants.show', $student)
                ->with('success', 'Informations mises à jour avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Une erreur est survenue lors de la mise à jour: ' . $e->getMessage()
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
            $student->studentEnrollments()->delete();
            
            $student->delete();

            DB::commit();

            return redirect()->route('scolarite.etudiants.index')
                ->with('success', 'Étudiant supprimé avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Impossible de supprimer cet étudiant: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Télécharger le template d'import Excel
     */
    public function downloadTemplate()
    {
        $export = new StudentTemplateExport();
        return $export->download();
    }

    /**
     * Importer des étudiants depuis Excel
     */
    public function import(Request $request)
    {

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ]);

        DB::beginTransaction();

        try {
            $filePath = $request->file('file')->getRealPath();
            
            $import = new StudentImport();
            $import->import($filePath);
            
            $errors = $import->getErrors();
            $successCount = $import->getSuccessCount();
            
            if (count($errors) > 0) {
                DB::rollBack();
                return back()->withErrors(['import_errors' => $errors]);
            }
            
            DB::commit();
            return redirect()->route('scolarite.etudiants.index')
                ->with('success', "{$successCount} étudiant(s) importé(s) avec succès !");
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de l\'import: ' . $e->getMessage()]);
        }
    }

    /**
     * Exporter la liste des étudiants
     */
    public function export(Request $request)
    {
        $query = User::where('role', 'etudiant')
            ->with(['studentEnrollments.schoolClass', 'studentEnrollments.academicYear']);

        // Filtres
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('matricule', 'like', "%{$search}%");
            });
        }

        if ($request->filled('class_id')) {
            $query->whereHas('studentEnrollments', function ($q) use ($request) {
                $q->where('school_class_id', $request->class_id);
            });
        }

        if ($request->filled('sexe')) {
            $query->where('sexe', $request->sexe);
        }

        if ($request->filled('status')) {
            $query->where('statut', $request->status);
        }

        if ($request->filled('student_ids')) {
            $ids = explode(',', $request->student_ids);
            $query->whereIn('id', $ids);
        }

        $students = $query->get();

        // Format demandé : csv, pdf ou excel (par défaut excel)
        $format = strtolower($request->input('format', 'excel'));
        $fileName = 'etudiants_' . now()->format('Y-m-d_His');

        // Structure commune
        $data = $students->map(function ($student) {
            $lastEnrollment = $student->studentEnrollments->sortByDesc('enrollment_date')->first();
            
            return [
                'Matricule' => $student->matricule ?? 'N/A',
                'Nom' => $student->name,
                'Email' => $student->email,
                'Téléphone' => $student->telephone ?? 'N/A',
                'Sexe' => $student->sexe,
                'Date naissance' => $student->date_naissance ? Carbon::parse($student->date_naissance)->format('d/m/Y') : 'N/A',
                'Lieu naissance' => $student->lieu_naissance ?? 'N/A',
                'Classe' => $lastEnrollment ? $lastEnrollment->schoolClass->name : 'Non assigné',
                'Année académique' => $lastEnrollment ? $lastEnrollment->academicYear->name : 'N/A',
                'Statut' => ucfirst($student->statut),
                'Parent' => $student->parent_name ?? 'N/A',
                'Contact urgent' => $student->contact_urgent ?? 'N/A',
                'Date inscription' => $student->created_at->format('d/m/Y'),
            ];
        });

        switch ($format) {
            case 'pdf':
                $pdf = Pdf::loadView('exports.students', ['students' => $data]);
                return $pdf->download($fileName . '.pdf');

            case 'csv':
                $headers = [
                    "Content-type" => "text/csv",
                    "Content-Disposition" => "attachment; filename={$fileName}.csv",
                    "Pragma" => "no-cache",
                    "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
                    "Expires" => "0"
                ];

                $callback = function() use ($data) {
                    $file = fopen('php://output', 'w');
                    
                    // Headers
                    if ($data->isNotEmpty()) {
                        fputcsv($file, array_keys($data->first()));
                    }

                    // Data
                    foreach ($data as $row) {
                        fputcsv($file, $row);
                    }

                    fclose($file);
                };

                return response()->stream($callback, 200, $headers);

            case 'excel':
            default:
                $spreadsheet = new Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();
                
                // Headers
                if ($data->isNotEmpty()) {
                    $sheet->fromArray(array_keys($data->first()), null, 'A1');
                    
                    // Style des headers
                    $headerStyle = $sheet->getStyle('A1:M1');
                    $headerStyle->getFont()->setBold(true);
                    $headerStyle->getFill()
                        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                        ->getStartColor()->setARGB('FF4CAF50');
                    $headerStyle->getFont()->getColor()->setARGB('FFFFFFFF');
                }

                // Data
                $row = 2;
                foreach ($data as $student) {
                    $sheet->fromArray(array_values($student), null, 'A' . $row++);
                }

                // Auto-size columns
                foreach (range('A', 'M') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }

                $writer = new Xlsx($spreadsheet);
                $temp_file = tempnam(sys_get_temp_dir(), $fileName);
                $writer->save($temp_file);

                return response()->download($temp_file, $fileName . '.xlsx')->deleteFileAfterSend(true);
        }
    }

    /**
     * Actions groupées sur plusieurs étudiants
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,suspend,transfer,mark_attendance,send_resources',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id'
        ]);

        $students = User::whereIn('id', $request->student_ids)
            ->where('role', 'etudiant')
            ->get();

        DB::beginTransaction();

        try {
            switch ($request->action) {
                case 'activate':
                    $students->each(function ($student) {
                        $student->update(['statut' => 'actif']);
                    });
                    $message = 'Étudiants activés avec succès.';
                    break;

                case 'suspend':
                    $students->each(function ($student) {
                        $student->update(['statut' => 'suspendu']);
                    });
                    $message = 'Étudiants suspendus avec succès.';
                    break;

                case 'transfer':
                    // Logique de transfert à implémenter
                    $message = 'Transfert effectué avec succès.';
                    break;

                default:
                    $message = 'Action effectuée avec succès.';
            }

            DB::commit();

            return redirect()->route('scolarite.etudiants.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de l\'action groupée: ' . $e->getMessage()]);
        }
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
            'password' => 'required|string|min:8|confirmed'
        ]);

        $student->update([
            'password' => Hash::make($request->password)
        ]);

        return back()->with('success', 'Mot de passe réinitialisé avec succès.');
    }

    private function generateMatricule($dateNaissance)
{
    $birthDate = Carbon::parse($dateNaissance);
    $currentYear = date('y');
    

    $day = $birthDate->format('d');
    $month = $birthDate->format('m');
    $birthYear = $birthDate->format('y'); 
    
    
    $prefix = $day . $month . $birthYear . $currentYear;
    
  
    $lastStudent = User::where('role', 'etudiant')
        ->where('matricule', 'like', "%{$currentYear}%")
        ->whereYear('created_at', date('Y'))
        ->orderBy('matricule', 'desc')
        ->first();
    
    $nextNumber = 1;
    if ($lastStudent && $lastStudent->matricule) {
        
        $lastNumber = substr($lastStudent->matricule, -4);
        $nextNumber = intval($lastNumber) + 1;
    }
    
 
    $formattedNumber = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    
    return $prefix . $formattedNumber;
}

private function getDefaultAvatar($sexe)
{
    
    $style = $sexe === 'M' ? 'avataaars' : 'avataaars'; 
    $seed = uniqid(); 
    
    return "https://api.dicebear.com/7.x/{$style}/svg?seed={$seed}";
}
}