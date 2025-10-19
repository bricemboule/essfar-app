<?php

namespace App\Import;

use App\Models\User;
use App\Models\SchoolClass;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
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
        ]);

        if ($validator->fails()) {
            throw new \Exception(implode(', ', $validator->errors()->all()));
        }

        // Vérifier la capacité de la classe
        $schoolClass = SchoolClass::find($row['school_class_id']);
        if ($schoolClass) {
            $currentStudents = $schoolClass->students()->count();
            if ($currentStudents >= $schoolClass->capacity) {
                throw new \Exception("La classe {$schoolClass->name} a atteint sa capacité maximale");
            }
        }

        // Parser la date de naissance
        $dateNaissance = $this->parseDate($row['date_naissance']);
        if (!$dateNaissance) {
            throw new \Exception("Format de date invalide. Utilisez JJ/MM/AAAA");
        }

        // Créer l'étudiant
        $student = User::create([
            'name' => trim($row['name']),
            'email' => strtolower(trim($row['email'])),
            'password' => Hash::make('password'),
            'role' => 'etudiant',
            'telephone' => $row['telephone'] ?? null,
            'adresse' => $row['adresse'] ?? null,
            'date_naissance' => $dateNaissance,
            'lieu_naissance' => trim($row['lieu_naissance']),
            'sexe' => strtoupper($row['sexe']),
            'school_class_id' => $row['school_class_id'],
            'academic_year_id' => $row['academic_year_id'],
            'parent_name' => $row['parent_name'] ?? null,
            'parent_phone' => $row['parent_phone'] ?? null,
            'parent_email' => isset($row['parent_email']) ? strtolower(trim($row['parent_email'])) : null,
            'previous_school' => $row['previous_school'] ?? null,
            'scholarship' => isset($row['scholarship']) ? (bool)$row['scholarship'] : false,
            'contact_urgent' => $row['contact_urgent'] ?? null,
            'medical_info' => $row['medical_info'] ?? null,
            'notes_admin' => $row['notes_admin'] ?? null,
            'statut' => 'actif',
            'email_verified_at' => now(),
        ]);

        // Créer l'inscription
        $student->studentEnrollments()->create([
            'school_class_id' => $row['school_class_id'],
            'academic_year_id' => $row['academic_year_id'],
            'enrollment_date' => now(),
            'status' => 'active',
            'scholarship' => isset($row['scholarship']) ? (bool)$row['scholarship'] : false,
        ]);

        $this->successCount++;
    }
    
    private function parseDate($date)
    {
        if (empty($date)) return null;

        try {
            if (is_numeric($date)) {
                return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($date))
                    ->format('Y-m-d');
            }

            $formats = ['d/m/Y', 'Y-m-d', 'd-m-Y', 'm/d/Y'];
            
            foreach ($formats as $format) {
                try {
                    $parsed = Carbon::createFromFormat($format, trim($date));
                    if ($parsed) return $parsed->format('Y-m-d');
                } catch (\Exception $e) {
                    continue;
                }
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
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