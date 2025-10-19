<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AttendanceAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $alertData;

    public function __construct($alertData)
    {
        $this->alertData = $alertData;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $student = $this->alertData['student'];
        $absences = $this->alertData['absences'];
        $delays = $this->alertData['delays'];
        $absenceLevel = $this->alertData['absence_level'];
        $delayLevel = $this->alertData['delay_level'];
        $period = $this->alertData['period_days'];

        $message = (new MailMessage)
            ->subject('⚠️ Alerte d\'assiduité - ' . $student->name)
            ->greeting('Alerte importante !')
            ->line("L'étudiant(e) **{$student->name}** a atteint un seuil d'alerte concernant son assiduité.");

        if ($absenceLevel !== 'normal') {
            $message->line("**Absences:** {$absences} absences sur les {$period} derniers jours")
                    ->line($this->getAbsenceMessage($absenceLevel));
        }

        if ($delayLevel !== 'normal') {
            $message->line("**Retards:** {$delays} retards sur les {$period} derniers jours")
                    ->line($this->getDelayMessage($delayLevel));
        }

        $message->line('Une intervention rapide est recommandée pour améliorer l\'assiduité de l\'étudiant.')
                ->action('Consulter le dossier', url("/admin/students/{$student->id}/attendance"))
                ->line('Cordialement,')
                ->line('Le service de scolarité');

        return $message;
    }

    public function toArray($notifiable)
    {
        $student = $this->alertData['student'];
        
        return [
            'type' => 'attendance_alert',
            'student_id' => $student->id,
            'student_name' => $student->name,
            'absences' => $this->alertData['absences'],
            'delays' => $this->alertData['delays'],
            'absence_level' => $this->alertData['absence_level'],
            'delay_level' => $this->alertData['delay_level'],
            'period_days' => $this->alertData['period_days'],
            'message' => $this->getAlertMessage(),
        ];
    }

    private function getAbsenceMessage($level)
    {
        return $level === 'critical' 
            ? '🔴 Niveau CRITIQUE - Action immédiate requise'
            : '🟡 Niveau ATTENTION - Surveillance recommandée';
    }

    private function getDelayMessage($level)
    {
        return $level === 'critical'
            ? '🔴 Niveau CRITIQUE - Trop de retards accumulés'
            : '🟡 Niveau ATTENTION - Retards fréquents';
    }

    private function getAlertMessage()
    {
        $student = $this->alertData['student'];
        $messages = [];

        if ($this->alertData['absence_level'] === 'critical') {
            $messages[] = "Absences critiques pour {$student->name}";
        } elseif ($this->alertData['absence_level'] === 'warning') {
            $messages[] = "Attention aux absences de {$student->name}";
        }

        if ($this->alertData['delay_level'] === 'critical') {
            $messages[] = "Retards critiques pour {$student->name}";
        } elseif ($this->alertData['delay_level'] === 'warning') {
            $messages[] = "Attention aux retards de {$student->name}";
        }

        return implode(' - ', $messages);
    }
}