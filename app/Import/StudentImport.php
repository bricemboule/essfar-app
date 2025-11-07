<?php

namespace App\Import;

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\AcademicYear;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Carbon\Carbon;

class StudentImport
{
    private array $errors = [];
    private int $successCount = 0;

    public function import($filePath)
    {
        try {
            $spreadsheet = IOFactory::load($filePath);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
            
            // Supprimer la ligne d'en-tête
            $headers = array_shift($rows);
            
            // Normaliser les en-têtes
            $headers = array_map(function($header) {
                return $this->normalizeHeader($header);
            }, $headers);
            
            $rowNumber = 2;
            
            foreach ($rows as $rowData) {
                // Ignorer les lignes vides
                if (empty(array_filter($rowData))) {
                    continue;
                }
                
                // Créer un tableau associatif
                $row = array_combine($headers, $rowData);
                
                try {
                    $this->processRow($row, $rowNumber);
                } catch (\Exception $e) {
                    $this->errors[] = [
                        'row' => $rowNumber,
                        'message' => $e->getMessage()
                    ];
                }
                
                $rowNumber++;
            }
            
        } catch (\Exception $e) {
            $this->errors[] = [
                'row' => 'N/A',
                'message' => 'Erreur de lecture du fichier : ' . $e->getMessage()
            ];
        }
    }
    
    private function normalizeHeader($header)
    {
        $header = trim($header);
        $header = str_replace('*', '', $header);
        $header = preg_replace('/\s*\(.*?\)\s*/', '', $header);
        $header = trim($header);
        
        return strtolower(str_replace(' ', '_', $header));
    }
    
    private function processRow(array $row, int $rowNumber)
    {
        // Validation
        $validator = Validator::make($row, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'date_naissance' => 'required',
            'lieu_naissance' => 'required|string|max:255',
            'sexe' => 'required|in:M,F,m,f',
            'school_class_id' => 'required|exists:school_classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
        ], [
            'name.required' => 'Le nom est obligatoire',
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'Format d\'email invalide',
            'email.unique' => 'Cet email existe déjà',
            'date_naissance.required' => 'La date de naissance est obligatoire',
            'lieu_naissance.required' => 'Le lieu de naissance est obligatoire',
            'sexe.required' => 'Le sexe est obligatoire',
            'sexe.in' => 'Le sexe doit être M ou F',
            'school_class_id.required' => 'La classe est obligatoire',
            'school_class_id.exists' => 'La classe spécifiée n\'existe pas',
            'academic_year_id.required' => 'L\'année académique est obligatoire',
            'academic_year_id.exists' => 'L\'année académique spécifiée n\'existe pas',
        ]);

        if ($validator->fails()) {
            throw new \Exception(implode(', ', $validator->errors()->all()));
        }

        // Vérifier la capacité de la classe
        $schoolClass = SchoolClass::find($row['school_class_id']);
        if ($schoolClass) {
            $currentStudents = $schoolClass->students()->count();
            if ($currentStudents >= $schoolClass->capacity) {
                throw new \Exception("La classe {$schoolClass->name} a atteint sa capacité maximale ({$schoolClass->capacity} étudiants)");
            }
        }

        // Parser la date de naissance
        $dateNaissance = $this->parseDate($row['date_naissance']);
        if (!$dateNaissance) {
            throw new \Exception("Format de date invalide pour date_naissance. Utilisez JJ/MM/AAAA");
        }

        // Générer le matricule
        $matricule = $this->generateMatricule($dateNaissance);

        // Obtenir l'avatar par défaut
        $photoPath = $this->getDefaultAvatar(strtoupper($row['sexe']));

        DB::beginTransaction();
        
        try {
            // Créer l'étudiant (sans school_class_id et academic_year_id qui n'existent pas dans users)
            $student = User::create([
                'name' => trim($row['name']),
                'email' => strtolower(trim($row['email'])),
                'password' => Hash::make('password'),
                'role' => 'etudiant',
                'matricule' => $matricule,
                'telephone' => isset($row['telephone']) ? trim($row['telephone']) : null,
                'adresse' => isset($row['adresse']) ? trim($row['adresse']) : null,
                'date_naissance' => $dateNaissance,
                'lieu_naissance' => trim($row['lieu_naissance']),
                'sexe' => strtoupper($row['sexe']),
                'photo' => $photoPath,
                'parent_name' => isset($row['parent_name']) ? trim($row['parent_name']) : null,
                'parent_phone' => isset($row['parent_phone']) ? trim($row['parent_phone']) : null,
                'parent_email' => isset($row['parent_email']) ? strtolower(trim($row['parent_email'])) : null,
                'previous_school' => isset($row['previous_school']) ? trim($row['previous_school']) : null,
                'scholarship' => isset($row['scholarship']) ? (bool)$row['scholarship'] : false,
                'contact_urgent' => isset($row['contact_urgent']) ? trim($row['contact_urgent']) : null,
                'medical_info' => isset($row['medical_info']) ? trim($row['medical_info']) : null,
                'notes_admin' => isset($row['notes_admin']) ? trim($row['notes_admin']) : null,
                'statut' => 'actif',
                'email_verified_at' => now(),
            ]);

            // Créer l'inscription dans student_enrollments
            $student->studentEnrollments()->create([
                'school_class_id' => $row['school_class_id'],
                'academic_year_id' => $row['academic_year_id'],
                'enrollment_date' => now(),
                'status' => 'active',
            ]);

            DB::commit();
            $this->successCount++;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception("Erreur lors de la création de l'étudiant : " . $e->getMessage());
        }
    }
    
    private function parseDate($date)
    {
        if (empty($date)) return null;

        try {
            // Si c'est un nombre (format Excel)
            if (is_numeric($date)) {
                return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($date))
                    ->format('Y-m-d');
            }

            // Essayer différents formats
            $formats = ['d/m/Y', 'Y-m-d', 'd-m-Y', 'm/d/Y', 'Y/m/d'];
            
            foreach ($formats as $format) {
                try {
                    $parsed = Carbon::createFromFormat($format, trim($date));
                    if ($parsed && $parsed->year > 1900 && $parsed->year < date('Y')) {
                        return $parsed->format('Y-m-d');
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
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
        $style = 'avataaars';
        $seed = uniqid(); 
        
        return "https://api.dicebear.com/7.x/{$style}/svg?seed={$seed}";
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getSuccessCount(): int
    {
        return $this->successCount;
    }
}