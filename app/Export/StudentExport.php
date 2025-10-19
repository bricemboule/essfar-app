<?php

namespace App\Export;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class StudentExport
{
    protected $students;

    public function __construct($students)
    {
        $this->students = $students;
    }

    public function download()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // En-têtes
        $headers = [
            'ID', 'Matricule', 'Nom et Prénom', 'Email', 'Téléphone',
            'Date de naissance', 'Lieu de naissance', 'Sexe', 'Adresse',
            'Classe actuelle', 'Année académique', 'Parent/Tuteur',
            'Tél. Parent', 'Email Parent', 'Contact Urgence',
            'Établissement précédent', 'Boursier', 'Statut', 'Date inscription'
        ];
        
        // Écrire les en-têtes
        $column = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($column . '1', $header);
            $column++;
        }
        
        // Style des en-têtes
        $sheet->getStyle('A1:S1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4472C4'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);
        
        // Largeurs
        $widths = ['A' => 8, 'B' => 15, 'C' => 25, 'D' => 30, 'E' => 18];
        foreach ($widths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }
        
        // Données
        $row = 2;
        foreach ($this->students as $student) {
            $lastEnrollment = $student->studentEnrollments->sortByDesc('enrollment_date')->first();
            
            $data = [
                $student->id,
                $student->matricule ?? 'N/A',
                $student->name,
                $student->email,
                $student->telephone,
                $student->date_naissance ? \Carbon\Carbon::parse($student->date_naissance)->format('d/m/Y') : '',
                $student->lieu_naissance,
                $student->sexe === 'M' ? 'Masculin' : 'Féminin',
                $student->adresse,
                $lastEnrollment ? $lastEnrollment->schoolClass->name : 'N/A',
                $lastEnrollment ? $lastEnrollment->academicYear->name : 'N/A',
                $student->parent_name,
                $student->parent_phone,
                $student->parent_email,
                $student->contact_urgent,
                $student->previous_school,
                $student->scholarship ? 'Oui' : 'Non',
                ucfirst($student->statut ?? 'N/A'),
                $student->created_at->format('d/m/Y'),
            ];
            
            $column = 'A';
            foreach ($data as $value) {
                $sheet->setCellValue($column . $row, $value);
                $column++;
            }
            $row++;
        }
        
        $writer = new Xlsx($spreadsheet);
        $filename = 'etudiants_' . now()->format('Y-m-d_His') . '.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), 'excel');
        $writer->save($tempFile);
        
        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
}