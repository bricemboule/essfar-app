<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class EnseignantPlanningMail extends Mailable
{
    use Queueable, SerializesModels;

    public $teacher;
    public $schedules;
    public $data;
    public $pdfPath; // CHANGEMENT : Stocker le chemin au lieu du contenu

    /**
     * Create a new message instance.
     */
    public function __construct(User $teacher, $schedules, $data, $pdfPath = null)
    {
        $this->teacher = $teacher;
        $this->schedules = $schedules;
        $this->data = $data;
        $this->pdfPath = $pdfPath;

        // IMPORTANT : S'assurer que les relations sont chargées AVANT la sérialisation
        if ($schedules) {
            $schedules->load(['course', 'classroom', 'schoolClass']);
        }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $startDate = \Carbon\Carbon::parse($this->data['start_date'])->format('d/m/Y');
        $endDate = \Carbon\Carbon::parse($this->data['end_date'])->format('d/m/Y');
        
        return new Envelope(
            subject: "Votre emploi du temps - Du {$startDate} au {$endDate}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.teacher-schedule',
            with: [
                'teacher' => $this->teacher,
                'schedules' => $this->schedules,
                'startDate' => \Carbon\Carbon::parse($this->data['start_date'])->format('d/m/Y'),
                'endDate' => \Carbon\Carbon::parse($this->data['end_date'])->format('d/m/Y'),
                'customMessage' => $this->data['message'] ?? null,
                'totalHours' => $this->calculateTotalHours(),
                'schedulesByDay' => $this->groupByDay()
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        $attachments = [];

        // CHANGEMENT : Attacher depuis un fichier au lieu du contenu
        if ($this->pdfPath && file_exists($this->pdfPath)) {
            $startDate = \Carbon\Carbon::parse($this->data['start_date'])->format('Y-m-d');
            
            $attachments[] = Attachment::fromPath($this->pdfPath)
                ->as("emploi_temps_{$this->teacher->name}_{$startDate}.pdf")
                ->withMime('application/pdf');
        }

        return $attachments;
    }

    /**
     * Calculer le total d'heures - OPTIMISÉ
     */
    private function calculateTotalHours()
    {
        if (!$this->schedules || $this->schedules->isEmpty()) {
            return 0;
        }

        return $this->schedules->sum(function($schedule) {
            try {
                $start = new \DateTime($schedule->start_time);
                $end = new \DateTime($schedule->end_time);
                $diff = $end->diff($start);
                return $diff->h + ($diff->i / 60);
            } catch (\Exception $e) {
                \Log::warning("Erreur calcul heures pour schedule {$schedule->id}: " . $e->getMessage());
                return 0;
            }
        });
    }

    /**
     * Grouper les séances par jour - OPTIMISÉ
     */
    private function groupByDay()
    {
        $days = [
            1 => ['name' => 'Lundi', 'schedules' => []],
            2 => ['name' => 'Mardi', 'schedules' => []],
            3 => ['name' => 'Mercredi', 'schedules' => []],
            4 => ['name' => 'Jeudi', 'schedules' => []],
            5 => ['name' => 'Vendredi', 'schedules' => []],
            6 => ['name' => 'Samedi', 'schedules' => []],
            7 => ['name' => 'Dimanche', 'schedules' => []],
        ];

        if (!$this->schedules || $this->schedules->isEmpty()) {
            return $days;
        }

        foreach ($this->schedules as $schedule) {
            try {
                $dayOfWeek = \Carbon\Carbon::parse($schedule->start_time)->dayOfWeek ?: 7;
                if (isset($days[$dayOfWeek])) {
                    $days[$dayOfWeek]['schedules'][] = $schedule;
                }
            } catch (\Exception $e) {
                \Log::warning("Erreur groupement jour pour schedule {$schedule->id}: " . $e->getMessage());
            }
        }

        return $days;
    }
}