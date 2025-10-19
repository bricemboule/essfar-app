<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceSeuil extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_class_id',
        'academic_year_id',
        'warning_absences',
        'critical_absences',
        'warning_delays',
        'critical_delays',
        'period_days',
        'notify_parents',
        'notify_administration',
        'is_active',
    ];

    protected $casts = [
        'warning_absences' => 'integer',
        'critical_absences' => 'integer',
        'warning_delays' => 'integer',
        'critical_delays' => 'integer',
        'period_days' => 'integer',
        'notify_parents' => 'boolean',
        'notify_administration' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relations
    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    // Méthodes statiques
    public static function getForClass($classId, $academicYearId)
    {
        return self::where('school_class_id', $classId)
                   ->where('academic_year_id', $academicYearId)
                   ->where('is_active', true)
                   ->first() ?? self::getDefault($academicYearId);
    }

    public static function getDefault($academicYearId)
    {
        return self::where('school_class_id', null)
                   ->where('academic_year_id', $academicYearId)
                   ->where('is_active', true)
                   ->first() ?? self::createDefault($academicYearId);
    }

    public static function createDefault($academicYearId)
    {
        return self::create([
            'school_class_id' => null,
            'academic_year_id' => $academicYearId,
            'warning_absences' => 3,
            'critical_absences' => 5,
            'warning_delays' => 5,
            'critical_delays' => 10,
            'period_days' => 30,
            'notify_parents' => true,
            'notify_administration' => true,
            'is_active' => true,
        ]);
    }

    // Méthodes de vérification
    public function checkAbsenceLevel($absenceCount)
    {
        if ($absenceCount >= $this->critical_absences) {
            return 'critical';
        } elseif ($absenceCount >= $this->warning_absences) {
            return 'warning';
        }
        return 'normal';
    }

    public function checkDelayLevel($delayCount)
    {
        if ($delayCount >= $this->critical_delays) {
            return 'critical';
        } elseif ($delayCount >= $this->warning_delays) {
            return 'warning';
        }
        return 'normal';
    }
}