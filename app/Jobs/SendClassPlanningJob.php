<?php

namespace App\Jobs;

use App\Models\SchoolClass;
use App\Models\Schedule;
use App\Mail\ClassPlanningMail;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendClassPlanningJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $classId;
    protected array $data;
    protected ?string $pdfPath;

    /**
     * Crée un nouveau job.
     */
    public function __construct(int $classId, array $data, ?string $pdfPath = null)
    {
        $this->classId = $classId;
        $this->data = $data;
        $this->pdfPath = $pdfPath;
    }

    /**
     * Exécute le job.
     */
    public function handle(): void
    {
        Log::info("Démarrage du job d’envoi du planning pour la classe ID {$this->classId}");

        $class = SchoolClass::with(['students', 'academicYear'])->find($this->classId);

        if (!$class) {
            Log::warning("Classe introuvable pour le job : {$this->classId}");
            return;
        }

        $schedules = Schedule::query()
            ->forClass($class->id)
            ->forWeek($this->data['start_date'], $this->data['end_date'])
            ->with(['course', 'teacher', 'classroom'])
            ->orderBy('start_time')
            ->get();

        if ($schedules->isEmpty()) {
            Log::info("Aucun planning trouvé pour la classe {$class->name}");
            return;
        }

        $students = $class->students;

        if ($students->isEmpty()) {
            Log::warning("Aucun étudiant actif trouvé dans la classe {$class->name}");
            return;
        }

        $emailsEnvoyes = 0;

        foreach ($students as $student) {
            if (empty($student->email)) {
                Log::warning("Étudiant sans email : {$student->id} ({$student->name})");
                continue;
            }

            try {
                Mail::to($student->email)->send(
                    new ClassPlanningMail($student, $class, $schedules, $this->data, $this->pdfPath)
                );

                $emailsEnvoyes++;
            } catch (\Throwable $e) {
                Log::error("Erreur lors de l’envoi du planning à {$student->email} : " . $e->getMessage(), [
                    'class_id' => $this->classId,
                    'student_id' => $student->id,
                ]);
            }
        }

        Log::info("Job terminé : {$emailsEnvoyes} emails envoyés pour la classe {$class->name}");
    }
}
