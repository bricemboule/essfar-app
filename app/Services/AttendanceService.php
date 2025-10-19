<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceSeuil;
use App\Models\User;
use App\Notifications\AttendanceNotification;
use App\Notifications\AttendanceAlertNotification;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceService
{
    /**
     * Marquer une présence/absence/retard
     */
    public function markAttendance($data)
    {
        DB::beginTransaction();
        
        try {
            // Vérifier que l'utilisateur est authentifié
            if (!auth()->check()) {
                throw new \Exception("Utilisateur non authentifié");
            }

            $attendance = Attendance::create([
                'student_id' => $data['student_id'],
                'course_id' => $data['course_id'],
                'school_class_id' => $data['school_class_id'],
                'academic_year_id' => $data['academic_year_id'],
                'marked_by' => auth()->id(),
                'date' => $data['date'] ?? now()->format('Y-m-d'),
                'time' => $data['time'] ?? now()->format('H:i:s'),
                'type' => $data['type'],
                'delay_minutes' => $data['delay_minutes'] ?? null,
                'hours_missed' => $data['hours_missed'] ?? 0,
                'notes' => $data['notes'] ?? null,
            ]);

            // Envoyer notification si absence ou retard (à décommenter quand les notifications seront créées)
            /*
            if (in_array($data['type'], ['absence', 'retard'])) {
                try {
                    $this->sendNotification($attendance);
                } catch (\Exception $e) {
                    // Logger l'erreur mais ne pas bloquer l'enregistrement
                    \Log::error('Erreur notification attendance: ' . $e->getMessage());
                }
            }
            */

            // Vérifier les seuils d'alerte (à décommenter quand la table AttendanceSeuil sera créée)
            /*
            try {
                $this->checkThresholds($attendance->student_id, $attendance->school_class_id);
            } catch (\Exception $e) {
                // Logger l'erreur mais ne pas bloquer l'enregistrement
                \Log::error('Erreur vérification seuils: ' . $e->getMessage());
            }
            */

            DB::commit();
            
            return $attendance;
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur markAttendance: ' . $e->getMessage());
            throw new \Exception("Erreur lors de l'enregistrement de la présence: " . $e->getMessage());
        }
    }

    /**
     * Marquer plusieurs présences en masse
     */
    public function markBulkAttendance($students, $data)
    {
        $results = ['success' => 0, 'errors' => []];
        
        foreach ($students as $studentId) {
            try {
                $attendanceData = array_merge($data, ['student_id' => $studentId]);
                $this->markAttendance($attendanceData);
                $results['success']++;
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'student_id' => $studentId,
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return $results;
    }

    /**
     * Soumettre une justification
     */
    public function submitJustification($attendanceId, $data)
    {
        $attendance = Attendance::findOrFail($attendanceId);
        
        // Vérifier si c'est une absence ou retard
        if (!in_array($attendance->type, ['absence', 'retard'])) {
            throw new \Exception("Cette présence ne peut pas être justifiée");
        }

        $attendance->update([
            'student_justification' => $data['justification'],
            'justification_file' => $data['file'] ?? null,
            'justification_date' => now(),
            'justification_status' => 'pending',
        ]);

        // Notifier l'administration (commenté si les notifications n'existent pas)
        // $this->notifyAdministration($attendance);

        return $attendance;
    }

    /**
     * Valider/Rejeter une justification
     */
    public function validateJustification($attendanceId, $approved, $comment = null)
    {
        $attendance = Attendance::findOrFail($attendanceId);
        
        $attendance->update([
            'justification_status' => $approved ? 'approved' : 'rejected',
            'validated_by' => auth()->id(),
            'validation_date' => now(),
            'validation_comment' => $comment,
            'type' => $approved ? 'absence_justifiee' : $attendance->type,
        ]);

        // Notifier l'étudiant et le parent (commenté si les notifications n'existent pas)
        // $this->notifyJustificationResult($attendance);

        return $attendance;
    }

    /**
     * Envoyer notification d'absence/retard
     */
    private function sendNotification($attendance)
    {
        $student = $attendance->student;
        
        // Notifier l'étudiant
        $student->notify(new AttendanceNotification($attendance));
        
        // Notifier le parent
        if ($student->parent_email) {
            \Notification::route('mail', $student->parent_email)
                ->notify(new AttendanceNotification($attendance));
        }
        
        $attendance->update([
            'parent_notified' => true,
            'notification_sent_at' => now(),
        ]);
    }

    /**
     * Vérifier les seuils et envoyer alertes si nécessaire
     */
    private function checkThresholds($studentId, $classId)
    {
        $student = User::find($studentId);
        
        // Vérifier si la table AttendanceSeuil existe
        if (!class_exists(AttendanceSeuil::class)) {
            return;
        }
        
        $threshold = AttendanceSeuil::where('school_class_id', $classId)
            ->where('academic_year_id', $student->academic_year_id)
            ->first();
        
        if (!$threshold) {
            return;
        }

        // Calculer les absences et retards sur la période
        $startDate = now()->subDays($threshold->period_days);
        
        $absences = Attendance::where('student_id', $studentId)
            ->where('type', 'absence')
            ->where('date', '>=', $startDate)
            ->count();
            
        $delays = Attendance::where('student_id', $studentId)
            ->where('type', 'retard')
            ->where('date', '>=', $startDate)
            ->count();

        // Vérifier les niveaux d'alerte
        $absenceLevel = $this->checkAbsenceLevel($threshold, $absences);
        $delayLevel = $this->checkDelayLevel($threshold, $delays);

        if ($absenceLevel !== 'normal' || $delayLevel !== 'normal') {
            $this->sendAlert($student, $threshold, $absences, $delays, $absenceLevel, $delayLevel);
        }
    }

    /**
     * Vérifier le niveau d'absence
     */
    private function checkAbsenceLevel($threshold, $absences)
    {
        if ($absences >= $threshold->absence_critical) {
            return 'critical';
        } elseif ($absences >= $threshold->absence_warning) {
            return 'warning';
        }
        return 'normal';
    }

    /**
     * Vérifier le niveau de retard
     */
    private function checkDelayLevel($threshold, $delays)
    {
        if ($delays >= $threshold->delay_critical) {
            return 'critical';
        } elseif ($delays >= $threshold->delay_warning) {
            return 'warning';
        }
        return 'normal';
    }

    /**
     * Envoyer alerte de seuil atteint
     */
    private function sendAlert($student, $threshold, $absences, $delays, $absenceLevel, $delayLevel)
    {
        $alertData = [
            'student' => $student,
            'absences' => $absences,
            'delays' => $delays,
            'absence_level' => $absenceLevel,
            'delay_level' => $delayLevel,
            'period_days' => $threshold->period_days,
        ];

        // Notifier les parents
        if ($threshold->notify_parents && $student->parent_email) {
            \Notification::route('mail', $student->parent_email)
                ->notify(new AttendanceAlertNotification($alertData));
        }

        // Notifier l'administration
        if ($threshold->notify_administration) {
            $admins = User::where('role', 'scolarite')->get();
            \Notification::send($admins, new AttendanceAlertNotification($alertData));
        }

        // Marquer l'alerte comme envoyée
        Attendance::where('student_id', $student->id)
            ->where('alert_sent', false)
            ->latest()
            ->first()
            ?->update(['alert_sent' => true]);
    }

    /**
     * Notifier l'administration d'une nouvelle justification
     */
    private function notifyAdministration($attendance)
    {
        $admins = User::whereIn('role', ['scolarite', 'admin'])->get();
        
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\NewJustificationNotification($attendance));
        }
    }

    /**
     * Notifier le résultat de validation
     */
    private function notifyJustificationResult($attendance)
    {
        $student = $attendance->student;
        
        // Notifier l'étudiant
        $student->notify(new \App\Notifications\JustificationResultNotification($attendance));
        
        // Notifier le parent
        if ($student->parent_email) {
            \Notification::route('mail', $student->parent_email)
                ->notify(new \App\Notifications\JustificationResultNotification($attendance));
        }
    }

    /**
     * Obtenir les statistiques d'assiduité d'un étudiant
     */
    public function getStudentStats($studentId, $academicYearId = null)
    {
        $query = Attendance::where('student_id', $studentId);
        
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        $attendances = $query->get();
        
        $totalClasses = $attendances->count();
        $presences = $attendances->where('type', 'presence')->count();
        $absences = $attendances->whereIn('type', ['absence', 'absence_justifiee'])->count();
        $absencesNonJustifiees = $attendances->where('type', 'absence')->count();
        $retards = $attendances->where('type', 'retard')->count();
        
        $attendanceRate = $totalClasses > 0 
            ? round(($presences / $totalClasses) * 100, 2)
            : 0;

        return [
            'total_classes' => $totalClasses,
            'presences' => $presences,
            'absences' => $absences,
            'absences_non_justifiees' => $absencesNonJustifiees,
            'absences_justifiees' => $absences - $absencesNonJustifiees,
            'retards' => $retards,
            'attendance_rate' => $attendanceRate,
            'total_delay_minutes' => $attendances->sum('delay_minutes'),
            'total_hours_missed' => $attendances->sum('hours_missed'),
        ];
    }

    /**
     * Obtenir les statistiques par matière
     */
    public function getStatsBySubject($classId, $subjectId = null, $startDate = null, $endDate = null)
    {
        $query = Attendance::where('school_class_id', $classId);
        
        if ($subjectId) {
            $query->where('course_id', $subjectId);
        }
        
        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        $attendances = $query->with('student', 'course')->get();
        
        $stats = $attendances->groupBy('course_id')->map(function ($group) {
            $course = $group->first()->course;
            return [
                'cours' => $course,
                'total' => $group->count(),
                'presences' => $group->where('type', 'presence')->count(),
                'absences' => $group->whereIn('type', ['absence', 'absence_justifiee'])->count(),
                'retards' => $group->where('type', 'retard')->count(),
                'attendance_rate' => $group->count() > 0 
                    ? round(($group->where('type', 'presence')->count() / $group->count()) * 100, 2)
                    : 0,
            ];
        });

       
        return $stats;
    }

    /**
     * Obtenir les statistiques par classe
     */
    public function getStatsByClass($academicYearId, $startDate = null, $endDate = null)
    {
        $query = Attendance::where('academic_year_id', $academicYearId);
        
        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        $attendances = $query->with('student', 'schoolClass')->get();
        
        $stats = $attendances->groupBy('school_class_id')->map(function ($group) {
            $class = $group->first()->schoolClass;
            $uniqueStudents = $group->pluck('student_id')->unique()->count();
            
            return [
                'class' => $class,
                'total_records' => $group->count(),
                'unique_students' => $uniqueStudents,
                'presences' => $group->where('type', 'presence')->count(),
                'absences' => $group->whereIn('type', ['absence', 'absence_justifiee'])->count(),
                'retards' => $group->where('type', 'retard')->count(),
                'attendance_rate' => $group->count() > 0 
                    ? round(($group->where('type', 'presence')->count() / $group->count()) * 100, 2)
                    : 0,
            ];
        });

        return $stats;
    }
}