<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\SchoolClass;
use App\Models\Course;
use App\Models\Classroom;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScheduleReplicationService
{
    /**
     * Répliquer un planning dans toutes les classes ayant le même cours
     */
    public function replicateSchedule(Schedule $parentSchedule, array $options = [])
    {
        $replicate = $options['replicate'] ?? true;
        $useDefaultClassroom = $options['use_default_classroom'] ?? false;
        $intervalMinutes = $options['interval_minutes'] ?? 0;

        if (!$replicate) {
            return [];
        }

        DB::beginTransaction();

        try {
            // Obtenir toutes les classes ayant le même cours
            $otherClasses = $this->getClassesWithSameCourse(
                $parentSchedule->course_id,
                $parentSchedule->school_class_id,
                $parentSchedule->academic_year_id
            );

            if ($otherClasses->isEmpty()) {
                DB::commit();
                return [];
            }

            $replicated = [];
            $currentStartTime = Carbon::parse($parentSchedule->start_time);
            $duration = $parentSchedule->getDurationInHours();

            foreach ($otherClasses as $class) {
                // Calculer le nouveau créneau horaire
                if ($intervalMinutes > 0) {
                    $currentStartTime = $currentStartTime->copy()->addMinutes($intervalMinutes);
                } else {
                    $currentStartTime = Carbon::parse($parentSchedule->start_time);
                }

                $newEndTime = $currentStartTime->copy()->addHours($duration);

                // Déterminer la salle
                $classroomId = $useDefaultClassroom 
                    ? $this->findAvailableClassroom($currentStartTime, $newEndTime)
                    : $parentSchedule->classroom_id;

                // Vérifier les conflits
                if ($this->hasConflictForClass($class->id, $parentSchedule->teacher_id, $classroomId, $currentStartTime, $newEndTime)) {
                    Log::warning("Conflit détecté pour la classe {$class->name}, réplication ignorée");
                    continue;
                }

                // Créer la réplication
                $replicatedSchedule = Schedule::create([
                    'parent_schedule_id' => $parentSchedule->id,
                    'course_id' => $parentSchedule->course_id,
                    'teacher_id' => $parentSchedule->teacher_id,
                    'school_class_id' => $class->id,
                    'classroom_id' => $classroomId,
                    'academic_year_id' => $parentSchedule->academic_year_id,
                    'start_time' => $currentStartTime,
                    'end_time' => $newEndTime,
                    'day_of_week' => $currentStartTime->dayOfWeek ?: 7,
                    'week_number' => $currentStartTime->week,
                    'status' => 'scheduled',
                    'is_recurring' => $parentSchedule->is_recurring,
                    'is_replicated' => true,
                    'notes' => $parentSchedule->notes
                ]);

                $replicated[] = $replicatedSchedule;
            }

            DB::commit();

            Log::info("Planning répliqué avec succès", [
                'parent_id' => $parentSchedule->id,
                'replications' => count($replicated)
            ]);

            return $replicated;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erreur lors de la réplication du planning", [
                'parent_id' => $parentSchedule->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Mettre à jour les réplications lorsque le parent est modifié
     */
    public function updateReplications(Schedule $parentSchedule, array $newData)
    {
        if (!$parentSchedule->isParent()) {
            throw new \Exception("Ce planning n'est pas un planning parent");
        }

        DB::beginTransaction();

        try {
            $replications = $parentSchedule->replicatedSchedules()
                ->where('status', 'scheduled')
                ->get();

            foreach ($replications as $replication) {
                $updateData = [];

                // Mettre à jour les champs modifiables
                if (isset($newData['start_time']) && isset($newData['end_time'])) {
                    $newStartTime = Carbon::parse($newData['start_time']);
                    $newEndTime = Carbon::parse($newData['end_time']);

                    // Vérifier les conflits
                    if (!$this->hasConflictForClass(
                        $replication->school_class_id,
                        $newData['teacher_id'] ?? $replication->teacher_id,
                        $newData['classroom_id'] ?? $replication->classroom_id,
                        $newStartTime,
                        $newEndTime,
                        $replication->id
                    )) {
                        $updateData['start_time'] = $newStartTime;
                        $updateData['end_time'] = $newEndTime;
                        $updateData['day_of_week'] = $newStartTime->dayOfWeek ?: 7;
                        $updateData['week_number'] = $newStartTime->week;
                    }
                }

                if (isset($newData['teacher_id'])) {
                    $updateData['teacher_id'] = $newData['teacher_id'];
                }

                if (isset($newData['notes'])) {
                    $updateData['notes'] = $newData['notes'];
                }

                if (!empty($updateData)) {
                    $replication->update($updateData);
                }
            }

            DB::commit();
            return $replications->count();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erreur lors de la mise à jour des réplications", [
                'parent_id' => $parentSchedule->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Supprimer toutes les réplications d'un planning parent
     */
    public function deleteReplications(Schedule $parentSchedule)
    {
        if (!$parentSchedule->isParent()) {
            return 0;
        }

        return $parentSchedule->replicatedSchedules()
            ->where('status', 'scheduled')
            ->delete();
    }

    /**
     * Annuler toutes les réplications
     */
    public function cancelReplications(Schedule $parentSchedule, string $reason = null)
    {
        if (!$parentSchedule->isParent()) {
            return 0;
        }

        $count = 0;
        foreach ($parentSchedule->replicatedSchedules()->where('status', 'scheduled')->get() as $replication) {
            $replication->markAsCancelled($reason ?? "Annulation en cascade du planning parent");
            $count++;
        }

        return $count;
    }

    /**
     * Obtenir les classes ayant le même cours
     */
    private function getClassesWithSameCourse($courseId, $excludeClassId, $academicYearId)
    {
        return SchoolClass::whereHas('courses', function($query) use ($courseId) {
            $query->where('courses.id', $courseId);
        })
        ->where('id', '!=', $excludeClassId)
        ->where('academic_year_id', $academicYearId)
        ->get();
    }

    /**
     * Trouver une salle disponible
     */
    private function findAvailableClassroom($startTime, $endTime)
    {
        $classroom = Classroom::where('is_available', true)
            ->whereDoesntHave('schedules', function($query) use ($startTime, $endTime) {
                $query->where(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
                })
                ->whereNotIn('status', ['cancelled', 'completed']);
            })
            ->first();

        return $classroom ? $classroom->id : null;
    }

    /**
     * Vérifier les conflits pour une classe spécifique
     */
    private function hasConflictForClass($classId, $teacherId, $classroomId, $startTime, $endTime, $excludeId = null)
    {
        $query = Schedule::where(function ($q) use ($classId, $teacherId, $classroomId) {
            $q->where('school_class_id', $classId)
              ->orWhere('teacher_id', $teacherId)
              ->orWhere('classroom_id', $classroomId);
        })
        ->where(function ($q) use ($startTime, $endTime) {
            $q->where('start_time', '<', $endTime)
              ->where('end_time', '>', $startTime);
        })
        ->whereNotIn('status', ['cancelled', 'completed']);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}