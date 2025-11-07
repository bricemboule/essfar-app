<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'credits',
        'total_hours',
        'academic_year_id'
    ];

    protected $casts = [
        'credits' => 'integer',
        'total_hours' => 'integer',
    ];

    // Relations
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Classes avec crédits spécifiques par classe
     */
    public function classes()
    {
        return $this->belongsToMany(SchoolClass::class, 'class_courses', 'course_id', 'school_class_id')
            ->withPivot('academic_year_id', 'teacher_id', 'credits', 'is_mandatory')
            ->withTimestamps();
    }

    /**
     * Enseignants assignés au cours
     */
    public function teachers()
    {
        return $this->belongsToMany(User::class, 'course_teachers', 'course_id', 'teacher_id')
            ->withPivot('taux_horaire', 'academic_year_id', 'assigned_at')
            ->withTimestamps();
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function classrooms()
    {
        return $this->belongsToMany(Classroom::class, 'schedules');
    }

    // Méthodes utilitaires
    public function getCompletedHours($classId = null)
    {
        $query = $this->schedules()->where('status', 'completed');
        
        if ($classId) {
            $query->where('school_class_id', $classId);
        }
        
        return $query->sum(\DB::raw('TIMESTAMPDIFF(MINUTE, start_time, end_time) / 60'));
    }

    public function getRemainingHours($classId = null)
    {
        return $this->total_hours - $this->getCompletedHours($classId);
    }

    public function getTeacherEarnings($teacherId)
    {
        $completedHours = $this->schedules()
            ->where('teacher_id', $teacherId)
            ->where('status', 'completed')
            ->sum(\DB::raw('TIMESTAMPDIFF(MINUTE, start_time, end_time) / 60'));
            
        return $completedHours * $this->hourly_rate;
    }

    /**
     * Obtenir les crédits pour une classe spécifique
     */
    public function getCreditsForClass($classId)
    {
        $pivot = $this->classes()->where('class_id', $classId)->first();
        
       
        return $pivot && $pivot->pivot->credits !== null 
            ? $pivot->pivot->credits 
            : $this->credits;
    }
}