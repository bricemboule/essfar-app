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
use App\Models\SchoolClass;

class ClassPlanningMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $student;
    public $class;
    public $schedules;
    public $data;
    public $pdfContent;

    /**
     * Create a new message instance.
     */
    public function __construct(User $student, SchoolClass $class, $schedules, $data, $pdfContent = null)
    {
        $this->student = $student;
        $this->class = $class;
        $this->schedules = $schedules;
        $this->data = $data;
        $this->pdfContent = $pdfContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $startDate = \Carbon\Carbon::parse($this->data['start_date'])->format('d/m/Y');
        $endDate = \Carbon\Carbon::parse($this->data['end_date'])->format('d/m/Y');
        
        return new Envelope(
            subject: "Emploi du temps {$this->class->name} - Du {$startDate} au {$endDate}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.class-schedule',
            with: [
                'student' => $this->student,
                'class' => $this->class,
                'schedules' => $this->schedules,
                'startDate' => \Carbon\Carbon::parse($this->data['start_date'])->format('d/m/Y'),
                'endDate' => \Carbon\Carbon::parse($this->data['end_date'])->format('d/m/Y'),
                'customMessage' => $this->data['message'] ?? null,
                'totalHours' => $this->calculateTotalHours(),
                'schedulesByDay' => $this->groupByDay(),
                'courseStats' => $this->getCourseStats()
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        $attachments = [];

        if ($this->pdfContent) {
            $startDate = \Carbon\Carbon::parse($this->data['start_date'])->format('Y-m-d');
            
            $attachments[] = Attachment::fromData(fn () => $this->pdfContent, "emploi_temps_{$this->class->name}_{$startDate}.pdf")
                ->withMime('application/pdf');
        }

        return $attachments;
    }

    /**
     * Calculer le total d'heures
     */
    private function calculateTotalHours()
    {
        return $this->schedules->sum(function($schedule) {
            $start = new \DateTime($schedule->start_time);
            $end = new \DateTime($schedule->end_time);
            return $end->diff($start)->h + ($end->diff($start)->i / 60);
        });
    }

    /**
     * Grouper les séances par jour
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

        foreach ($this->schedules as $schedule) {
            $dayOfWeek = \Carbon\Carbon::parse($schedule->start_time)->dayOfWeek ?: 7;
            if (isset($days[$dayOfWeek])) {
                $days[$dayOfWeek]['schedules'][] = $schedule;
            }
        }

        return $days;
    }

    /**
     * Obtenir les statistiques par cours
     */
    private function getCourseStats()
    {
        $stats = [];
        foreach ($this->schedules as $schedule) {
            $courseName = $schedule->course->name ?? 'N/A';
            if (!isset($stats[$courseName])) {
                $stats[$courseName] = ['count' => 0, 'hours' => 0];
            }
            $stats[$courseName]['count']++;
            $start = new \DateTime($schedule->start_time);
            $end = new \DateTime($schedule->end_time);
            $stats[$courseName]['hours'] += $end->diff($start)->h + ($end->diff($start)->i / 60);
        }
        return $stats;
    }
}