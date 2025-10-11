<?php
// app/Models/Schedule.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'teacher_id',
        'school_class_id',
        'classroom_id',
        'academic_year_id',
        'start_time',
        'end_time',
        'day_of_week',
        'week_number',
        'status',
        'completed_hours',
        'notes',
        'is_recurring'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'day_of_week' => 'integer', // 1 = Lundi, 7 = Dimanche
        'week_number' => 'integer',
        'is_recurring' => 'boolean'
    ];

    // Relations
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    // Scopes
    public function scopeForWeek($query, $weekStart, $weekEnd)
    {
        return $query->whereBetween('start_time', [$weekStart, $weekEnd]);
    }

    public function scopeForTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeForClass($query, $classId)
    {
        return $query->where('school_class_id', $classId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>', now())
                    ->where('status', 'scheduled');
    }

    // Méthodes utilitaires
    public function getDurationInHours()
    {
        return $this->start_time->diffInMinutes($this->end_time) / 60;
    }

    public function getDayNameAttribute()
    {
        $days = [
            1 => 'Lundi',
            2 => 'Mardi', 
            3 => 'Mercredi',
            4 => 'Jeudi',
            5 => 'Vendredi',
            6 => 'Samedi',
            7 => 'Dimanche'
        ];
        
        return $days[$this->day_of_week] ?? '';
    }

    public function getFormattedTimeAttribute()
    {
        return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
    }

    public function canBeModified()
    {
        return $this->start_time->gt(now()) && in_array($this->status, ['scheduled', 'rescheduled']);
    }

    public function markAsCompleted()
    {
        $this->update(['status' => 'completed']);
    }

    public function markAsCancelled($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'notes' => $reason
        ]);
    }

    // Vérification des conflits
    public static function hasConflict($teacherId, $classroomId, $startTime, $endTime, $excludeId = null)
    {
        $query = self::where(function ($q) use ($teacherId, $classroomId) {
            $q->where('teacher_id', $teacherId)
              ->orWhere('classroom_id', $classroomId);
        })
        ->where(function ($q) use ($startTime, $endTime) {
            $q->whereBetween('start_time', [$startTime, $endTime])
              ->orWhereBetween('end_time', [$startTime, $endTime])
              ->orWhere(function ($subq) use ($startTime, $endTime) {
                  $subq->where('start_time', '<=', $startTime)
                       ->where('end_time', '>=', $endTime);
              });
        });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}