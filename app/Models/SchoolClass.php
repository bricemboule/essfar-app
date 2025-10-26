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

    // Ajouter un attribut virtuel
    protected $appends = ['cycle'];

   
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

  public function resources()
    {
        return $this->belongsToMany(Resource::class, 'resource_school_class')
                    ->withTimestamps();
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

    // Déduire le cycle depuis le level
    public function getCycleAttribute(): string
    {
        $level = strtolower($this->level ?? '');
        
        // Licence : L1, L2, L3, Licence 1, Licence 2, Licence 3
        if (preg_match('/^l[1-3]$/i', $level) || 
            preg_match('/licence\s*[1-3]/i', $level) ||
            in_array($level, ['l1', 'l2', 'l3'])) {
            return 'licence';
        }
        
        // Master : M1, M2, Master 1, Master 2
        if (preg_match('/^m[1-2]$/i', $level) || 
            preg_match('/master\s*[1-2]/i', $level) ||
            in_array($level, ['m1', 'm2'])) {
            return 'master';
        }
        
        // Doctorat : D1, D2, D3, Doctorat
        if (preg_match('/^d[1-3]$/i', $level) || 
            preg_match('/doctorat/i', $level)) {
            return 'doctorat';
        }
        
        // Par défaut, considérer comme licence
        return 'licence';
    }

    // Méthode helper pour vérifier si c'est une licence
    public function isLicence(): bool
    {
        return $this->cycle === 'licence';
    }

    // Accesseur pour le nom du cycle
    public function getCycleNameAttribute(): string
    {
        return ucfirst($this->cycle);
    }
}