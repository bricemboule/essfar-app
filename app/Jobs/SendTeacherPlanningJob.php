<?php

namespace App\Jobs;

use App\Mail\EnseignantPlanningMail;
use App\Models\User;
use App\Models\Schedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendTeacherPlanningJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $teacherId;
    protected $data;
    protected $pdfContent;

    /**
     * Create a new job instance.
     */
    public function __construct($teacherId, $data, $pdfContent = null)
    {
        $this->teacherId = $teacherId;
        $this->data = $data;
        $this->pdfContent = $pdfContent;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $teacher = User::find($this->teacherId);
        if (!$teacher) {
            \Log::warning("Aucun enseignant trouvé avec l'ID {$this->teacherId}");
            return;
        }

        $schedules = Schedule::query()
            ->where('teacher_id', $teacher->id)
            ->forWeek($this->data['start_date'], $this->data['end_date'])
            ->get();

        if ($schedules->isEmpty()) {
            \Log::info("Aucun emploi du temps pour {$teacher->name}");
            return;
        }

        Mail::to($teacher->email)->send(
            new EnseignantPlanningMail($teacher, $schedules, $this->data, $this->pdfContent)
        );

        \Log::info("Emploi du temps envoyé à {$teacher->email}");
    }
}
