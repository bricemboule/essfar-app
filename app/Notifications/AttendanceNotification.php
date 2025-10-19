<?php

namespace App\Notifications;

use App\Models\Attendance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AttendanceNotification extends Notification implements ShouldQueue
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
        $subject = $this->attendance->subject;
        $type = $this->attendance->type;
        
        $message = (new MailMessage)
            ->subject($this->getSubject())
            ->greeting('Bonjour,')
            ->line($this->getMessage());

        if ($type === 'retard') {
            $message->line("Retard de {$this->attendance->delay_minutes} minutes");
        }

        if ($this->attendance->notes) {
            $message->line("Note: {$this->attendance->notes}");
        }

        $message->line("Date: {$this->attendance->date->format('d/m/Y')}")
                ->line("Matière: {$subject->name}")
                ->action('Consulter les détails', url('/student/attendances'))
                ->line('Merci de votre attention.');

        return $message;
    }

    public function toArray($notifiable)
    {
        return [
            'attendance_id' => $this->attendance->id,
            'student_id' => $this->attendance->student_id,
            'student_name' => $this->attendance->student->name,
            'subject_name' => $this->attendance->course->name,
            'type' => $this->attendance->type,
            'date' => $this->attendance->date->format('d/m/Y'),
            'delay_minutes' => $this->attendance->delay_minutes,
            'message' => $this->getMessage(),
        ];
    }

    private function getSubject()
    {
        $types = [
            'absence' => 'Notification d\'absence',
            'retard' => 'Notification de retard',
            'absence_justifiee' => 'Absence justifiée',
        ];
        
        return $types[$this->attendance->type] ?? 'Notification de présence';
    }

    private function getMessage()
    {
        $student = $this->attendance->student->name;
        $subject = $this->attendance->subject->name;
        $date = $this->attendance->date->format('d/m/Y');
        
        $messages = [
            'absence' => "L'étudiant(e) {$student} a été absent(e) au cours de {$subject} le {$date}.",
            'retard' => "L'étudiant(e) {$student} est arrivé(e) en retard au cours de {$subject} le {$date}.",
            'absence_justifiee' => "L'absence de l'étudiant(e) {$student} au cours de {$subject} le {$date} a été justifiée.",
        ];
        
        return $messages[$this->attendance->type] ?? "Notification concernant {$student}";
    }
}