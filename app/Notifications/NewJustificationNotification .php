<?php

namespace App\Notifications;

use App\Models\Attendance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// Notification pour nouvelle justification (pour l'administration)
class NewJustificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $attendance;

    public function __construct(Attendance $attendance)
    {
        $this->attendance = $attendance;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $student = $this->attendance->student;
        
        return (new MailMessage)
            ->subject('Nouvelle justification à valider')
            ->greeting('Bonjour,')
            ->line("L'étudiant(e) **{$student->name}** a soumis une justification d'absence.")
            ->line("**Date:** {$this->attendance->date->format('d/m/Y')}")
            ->line("**Matière:** {$this->attendance->subject->name}")
            ->line("**Motif:** {$this->attendance->student_justification}")
            ->action('Valider la justification', url("/scolarite/attendances/{$this->attendance->id}/validate"))
            ->line('Merci de traiter cette demande rapidement.');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'new_justification',
            'attendance_id' => $this->attendance->id,
            'student_id' => $this->attendance->student_id,
            'student_name' => $this->attendance->student->name,
            'date' => $this->attendance->date->format('d/m/Y'),
            'subject' => $this->attendance->subject->name,
        ];
    }
}

// Notification du résultat de validation (pour l'étudiant et parent)
class JustificationResultNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $attendance;

    public function __construct(Attendance $attendance)
    {
        $this->attendance = $attendance;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $approved = $this->attendance->justification_status === 'approved';
        $student = $this->attendance->student;
        
        $message = (new MailMessage)
            ->subject($approved ? 'Justification approuvée ✓' : 'Justification refusée ✗')
            ->greeting('Bonjour,');

        if ($approved) {
            $message->line("Votre justification d'absence a été **approuvée**.")
                    ->line("**Date:** {$this->attendance->date->format('d/m/Y')}")
                    ->line("**Matière:** {$this->attendance->subject->name}");
        } else {
            $message->line("Votre justification d'absence a été **refusée**.")
                    ->line("**Date:** {$this->attendance->date->format('d/m/Y')}")
                    ->line("**Matière:** {$this->attendance->subject->name}");
                    
            if ($this->attendance->validation_comment) {
                $message->line("**Motif du refus:** {$this->attendance->validation_comment}");
            }
        }

        $message->action('Consulter mes absences', url('/student/attendances'))
                ->line('Cordialement,')
                ->line('Le service de scolarité');

        return $message;
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'justification_result',
            'attendance_id' => $this->attendance->id,
            'status' => $this->attendance->justification_status,
            'date' => $this->attendance->date->format('d/m/Y'),
            'subject' => $this->attendance->course->name,
            'approved' => $this->attendance->justification_status === 'approved',
        ];
    }
}