<?php

namespace App\Export;

use App\Models\SchoolClass;
use App\Models\AcademicYear;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class StudentTemplateExport
{
    public function download()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // En-têtes
        $headers = [
            'name *',
            'email *',
            'telephone',
            'adresse',
            'date_naissance * (JJ/MM/AAAA)',
            'lieu_naissance *',
            'sexe * (M ou F)',
            'school_class_id *',
            'academic_year_id *',
            'parent_name',
            'parent_phone',
            'parent_email',
            'previous_school',
            'scholarship (0 ou 1)',
            'contact_urgent',
            'medical_info',
            'notes_admin'
        ];
        
        // Écrire les en-têtes
        $column = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($column . '1', $header);
            $column++;
        }
        
        // Style des en-têtes
        $sheet->getStyle('A1:Q1')->applyFromArray([
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
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        
        // Hauteur de la ligne d'en-tête
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        // Largeurs des colonnes
        $widths = [
            'A' => 20, 'B' => 25, 'C' => 18, 'D' => 25,
            'E' => 20, 'F' => 20, 'G' => 12, 'H' => 15,
            'I' => 18, 'J' => 20, 'K' => 18, 'L' => 25,
            'M' => 25, 'N' => 15, 'O' => 25, 'P' => 25, 'Q' => 25
        ];
        
        foreach ($widths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }
        
        // Données d'exemple
        $activeYear = AcademicYear::where('is_active', true)->first();
        $firstClass = SchoolClass::first();
        
        $examples = [
            [
                'Jean Dupont',
                'jean.dupont@example.com',
                '+237 6XX XXX XXX',
                'Quartier Bastos, Yaoundé',
                '15/05/2005',
                'Yaoundé, Cameroun',
                'M',
                $firstClass?->id ?? '1',
                $activeYear?->id ?? '1',
                'Marie Dupont',
                '+237 6XX XXX XXX',
                'parent@example.com',
                'Lycée Général Leclerc',
                '0',
                'Tante Claire: +237 6XX XXX XXX',
                'Aucune allergie',
                'Étudiant sérieux'
            ],
            [
                'Sophie Martin',
                'sophie.martin@example.com',
                '+237 6XX XXX XXX',
                'Quartier Tsinga, Yaoundé',
                '22/08/2006',
                'Douala, Cameroun',
                'F',
                $firstClass?->id ?? '1',
                $activeYear?->id ?? '1',
                'Paul Martin',
                '+237 6XX XXX XXX',
                'pmartin@example.com',
                'Collège Vogt',
                '1',
                'Oncle Pierre: +237 6XX XXX XXX',
                'Asthme léger',
                'Excellente en mathématiques'
            ],
        ];
        
        // Écrire les exemples
        $row = 2;
        foreach ($examples as $example) {
            $column = 'A';
            foreach ($example as $value) {
                $sheet->setCellValue($column . $row, $value);
                $column++;
            }
            $row++;
        }
        
        // Ajouter les instructions
        $this->addInstructions($sheet);
        
        // Générer le fichier
        $writer = new Xlsx($spreadsheet);
        
        $filename = 'modele_etudiants.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), 'excel');
        $writer->save($tempFile);
        
        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
    
    private function addInstructions($sheet)
    {
        $lastRow = 5;
        
        $sheet->setCellValue("A{$lastRow}", "INSTRUCTIONS D'UTILISATION :");
        $sheet->getStyle("A{$lastRow}")->getFont()->setBold(true)->setSize(12);
        
        $lastRow++;
        $instructions = [
            "1. Les colonnes marquées avec * sont obligatoires",
            "2. Format de date : JJ/MM/AAAA (exemple : 15/05/2005)",
            "3. Sexe : Utilisez 'M' pour Masculin ou 'F' pour Féminin",
            "4. Email : Doit être unique pour chaque étudiant",
            "5. school_class_id : Utilisez l'ID de la classe (voir liste ci-dessous)",
            "6. academic_year_id : Utilisez l'ID de l'année académique active",
            "7. scholarship : 0 = Non boursier, 1 = Boursier",
            "8. Ne supprimez pas la ligne d'en-tête (ligne 1)",
            "9. Supprimez les exemples avant d'importer vos données",
        ];
        
        foreach ($instructions as $instruction) {
            $sheet->setCellValue("A{$lastRow}", $instruction);
            $lastRow++;
        }
        
        // Liste des classes
        $lastRow += 2;
        $sheet->setCellValue("A{$lastRow}", "LISTE DES CLASSES DISPONIBLES :");
        $sheet->getStyle("A{$lastRow}")->getFont()->setBold(true);
        $lastRow++;
        
        $classes = SchoolClass::all();
        foreach ($classes as $class) {
            $sheet->setCellValue("A{$lastRow}", "ID: {$class->id} - {$class->name} ({$class->level})");
            $lastRow++;
        }
        
        // Liste des années académiques
        $lastRow += 2;
        $sheet->setCellValue("A{$lastRow}", "LISTE DES ANNÉES ACADÉMIQUES :");
        $sheet->getStyle("A{$lastRow}")->getFont()->setBold(true);
        $lastRow++;
        
        $years = AcademicYear::all();
        foreach ($years as $year) {
            $active = $year->is_active ? " (ACTIVE)" : "";
            $sheet->setCellValue("A{$lastRow}", "ID: {$year->id} - {$year->name}{$active}");
            $lastRow++;
        }
    }
}