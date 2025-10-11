<?php


namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Illuminate\Support\Collection;

class HonoraireEnseignant implements 
    FromCollection, 
    WithHeadings, 
    WithStyles, 
    WithTitle,
    WithColumnWidths,
    WithEvents
{
    protected $earnings;
    protected $startDate;
    protected $endDate;
    protected $totalHours;
    protected $totalEarnings;
    protected $averageHourlyRate;

    public function __construct($earnings, $startDate, $endDate, $totalHours, $totalEarnings, $averageHourlyRate)
    {
        $this->earnings = $earnings;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->totalHours = $totalHours;
        $this->totalEarnings = $totalEarnings;
        $this->averageHourlyRate = $averageHourlyRate;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        $data = new Collection();

        // Ajouter un titre
        $data->push([
            'RAPPORT DES HONORAIRES ENSEIGNANTS',
            '',
            '',
            '',
            ''
        ]);

        // Ajouter la période
        $data->push([
            'Période: Du ' . $this->startDate->format('d/m/Y') . ' au ' . $this->endDate->format('d/m/Y'),
            '',
            '',
            '',
            ''
        ]);

        // Ligne vide
        $data->push(['', '', '', '', '']);

        // Les données des enseignants
        $index = 1;
        foreach ($this->earnings as $earning) {
            $data->push([
                $index++,
                $earning['name'],
                number_format($earning['total_hours'], 2, ',', ' ') . ' h',
                number_format($earning['avg_hourly_rate'], 0, ',', ' ') . ' FCFA',
                number_format($earning['total_earnings'], 0, ',', ' ') . ' FCFA'
            ]);
        }

        // Ligne de total
        $data->push([
            '',
            'TOTAL GÉNÉRAL',
            number_format($this->totalHours, 2, ',', ' ') . ' h',
            number_format($this->averageHourlyRate, 0, ',', ' ') . ' FCFA',
            number_format($this->totalEarnings, 0, ',', ' ') . ' FCFA'
        ]);

        // Statistiques
        $data->push(['', '', '', '', '']);
        $data->push(['STATISTIQUES', '', '', '', '']);
        $data->push(['Nombre d\'enseignants:', count($this->earnings), '', '', '']);
        $data->push(['Total des heures:', number_format($this->totalHours, 2, ',', ' ') . ' h', '', '', '']);
        $data->push(['Total des honoraires:', number_format($this->totalEarnings, 0, ',', ' ') . ' FCFA', '', '', '']);
        $data->push(['Tarif horaire moyen:', number_format($this->averageHourlyRate, 0, ',', ' ') . ' FCFA', '', '', '']);
        $data->push(['Moyenne heures/enseignant:', number_format($this->totalHours / max(count($this->earnings), 1), 2, ',', ' ') . ' h', '', '', '']);

        return $data;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            '#',
            'Enseignant',
            'Heures effectuées',
            'Tarif horaire moyen',
            'Total à payer'
        ];
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return 'Honoraires Enseignants';
    }

    /**
     * @return array
     */
    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 35,
            'C' => 20,
            'D' => 25,
            'E' => 25,
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style pour la ligne de titre (ligne 1)
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 16,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '28a745']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ]
            ],
            
            // Style pour la période (ligne 2)
            2 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ]
            ],

            // Style pour les en-têtes (ligne 4)
            4 => [
                'font' => [
                    'bold' => true,
                    'size' => 12,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '6c757d']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ]
            ],
        ];
    }

    /**
     * @return array
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Fusionner les cellules pour le titre
                $sheet->mergeCells('A1:E1');
                $sheet->mergeCells('A2:E2');
                
                // Hauteur de la ligne du titre
                $sheet->getRowDimension(1)->setRowHeight(30);
                $sheet->getRowDimension(2)->setRowHeight(20);
                $sheet->getRowDimension(4)->setRowHeight(25);

                // Calculer la ligne du total
                $totalRow = 5 + count($this->earnings);

                // Style pour la ligne de total
                $sheet->getStyle("A{$totalRow}:E{$totalRow}")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 12,
                        'color' => ['rgb' => 'FFFFFF']
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '28a745']
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_MEDIUM,
                            'color' => ['rgb' => '000000']
                        ]
                    ]
                ]);

                // Bordures pour toutes les lignes de données
                $dataEndRow = $totalRow - 1;
                $sheet->getStyle("A4:E{$dataEndRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'CCCCCC']
                        ]
                    ]
                ]);

                // Alignement pour les colonnes numériques
                $sheet->getStyle("C5:E{$totalRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Alternance de couleurs pour les lignes
                for ($i = 5; $i <= $dataEndRow; $i++) {
                    if (($i - 5) % 2 == 0) {
                        $sheet->getStyle("A{$i}:E{$i}")->applyFromArray([
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'F8F9FA']
                            ]
                        ]);
                    }
                }

                // Style pour la section statistiques
                $statsStartRow = $totalRow + 2;
                $sheet->getStyle("A{$statsStartRow}:B{$statsStartRow}")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 13,
                        'color' => ['rgb' => 'FFFFFF']
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '17a2b8']
                    ]
                ]);

                // Style pour les lignes de statistiques
                for ($i = $statsStartRow + 1; $i <= $statsStartRow + 5; $i++) {
                    $sheet->getStyle("A{$i}:B{$i}")->applyFromArray([
                        'font' => [
                            'size' => 11
                        ],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'E9ECEF']
                        ],
                        'borders' => [
                            'outline' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => 'CCCCCC']
                            ]
                        ]
                    ]);
                    
                    // Mettre en gras la colonne A
                    $sheet->getStyle("A{$i}")->getFont()->setBold(true);
                }

                // Ajuster automatiquement la largeur des colonnes
                foreach (range('A', 'E') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(false);
                }

                // Date de génération en bas
                $lastRow = $statsStartRow + 7;
                $sheet->setCellValue("A{$lastRow}", 'Généré le: ' . now()->format('d/m/Y à H:i'));
                $sheet->getStyle("A{$lastRow}")->applyFromArray([
                    'font' => [
                        'italic' => true,
                        'size' => 9,
                        'color' => ['rgb' => '6c757d']
                    ]
                ]);
            }
        ];
    }
}