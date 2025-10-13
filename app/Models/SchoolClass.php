<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'school_classes';

    protected $fillable = [
        'name',
        'code',
        'level',
        'academic_year_id',
        'capacity',
        'description',
    ];

    // Relations
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function students()
    {
        return $this->belongsToMany(
            User::class,
            'student_enrollments',
            'school_class_id',
            'student_id'
        )
        ->where('users.role', 'etudiant')
        ->wherePivot('status', 'active')
        ->withPivot(['enrollment_date', 'status', 'academic_year_id'])
        ->withTimestamps();
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'class_courses')
            ->withPivot(['academic_year_id', 'teacher_id'])
            ->withTimestamps();
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function studentEnrollments()
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    // Attributs calculés
    public function getStudentCountAttribute(): int
    {
        return $this->students()->count();
    }

    public function getFullNameAttribute(): string
    {
        return $this->academicYear
            ? "{$this->name} - {$this->academicYear->name}"
            : $this->name;
    }
}
