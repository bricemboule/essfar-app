<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'school_class_id',
        'academic_year_id',
        'marked_by',
        'date',
        'time',
        'type',
        'delay_minutes',
        'hours_missed',
        'student_justification',
        'justification_file',
        'justification_date',
        'justification_status',
        'validated_by',
        'validation_date',
        'validation_comment',
        'parent_notified',
        'notification_sent_at',
        'alert_sent',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime',
        'justification_date' => 'datetime',
        'validation_date' => 'datetime',
        'notification_sent_at' => 'datetime',
        'parent_notified' => 'boolean',
        'alert_sent' => 'boolean',
        'delay_minutes' => 'integer',
        'hours_missed' => 'integer',
    ];

    // Relations
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function markedBy()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    public function validatedBy()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    // Accesseurs
    public function getJustificationFileUrlAttribute()
    {
        if ($this->justification_file) {
            return Storage::url($this->justification_file);
        }
        return null;
    }

    public function getTypeFormattedAttribute()
    {
        $types = [
            'presence' => 'Présent',
            'absence' => 'Absent',
            'retard' => 'Retard',
            'absence_justifiee' => 'Absence justifiée',
        ];
        return $types[$this->type] ?? $this->type;
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'presence' => 'badge-success',
            'absence' => 'badge-danger',
            'retard' => 'badge-warning',
            'absence_justifiee' => 'badge-info',
        ];
        return $badges[$this->type] ?? 'badge-secondary';
    }

    public function getJustificationStatusFormattedAttribute()
    {
        $statuses = [
            'pending' => 'En attente',
            'approved' => 'Approuvé',
            'rejected' => 'Rejeté',
        ];
        return $statuses[$this->justification_status] ?? '';
    }

    // Scopes
    public function scopeOfStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeOfClass($query, $classId)
    {
        return $query->where('school_class_id', $classId);
    }

    public function scopeOfCourse($query, $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    public function scopeAbsences($query)
    {
        return $query->whereIn('type', ['absence', 'absence_justifiee']);
    }

    public function scopeDelays($query)
    {
        return $query->where('type', 'retard');
    }

    public function scopeUnjustified($query)
    {
        return $query->where('type', 'absence')
                     ->where(function($q) {
                         $q->whereNull('justification_status')
                           ->orWhere('justification_status', 'rejected');
                     });
    }

    public function scopePendingJustification($query)
    {
        return $query->where('justification_status', 'pending');
    }

    public function scopeInPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('date', now()->month)
                     ->whereYear('date', now()->year);
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    // Méthodes utilitaires
    public function isJustified()
    {
        return $this->type === 'absence_justifiee' || 
               $this->justification_status === 'approved';
    }

    public function canBeJustified()
    {
        return in_array($this->type, ['absence', 'retard']) && 
               !$this->isJustified();
    }

    public function needsValidation()
    {
        return $this->justification_status === 'pending';
    }
}