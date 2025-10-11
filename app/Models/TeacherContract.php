<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherContract extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'contract_number',
        'contract_type',
        'start_date',
        'end_date',
        'hourly_rate',
        'monthly_salary',
        'total_hours',
        'total_compensation',
        'courses_summary',
        'course_details',
        'terms_and_conditions',
        'status',
        'termination_date',
        'termination_reason',
        'renewed_at',
        'renewed_by',
        'terminated_by',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'termination_date' => 'date',
        'renewed_at' => 'datetime',
        'hourly_rate' => 'decimal:2',
        'monthly_salary' => 'decimal:2',
        'total_compensation' => 'decimal:2',
        'course_details' => 'array',
    ];

    /**
     * Relations
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Méthodes utilitaires
     */
    public function getMonthsRemainingAttribute()
    {
        if (!$this->end_date) return null;
        return now()->diffInMonths($this->end_date, false);
    }

    public function getIsExpiringAttribute()
    {
        return $this->end_date && $this->end_date <= now()->addMonths(3);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpiring($query, $months = 3)
    {
        return $query->where('end_date', '<=', now()->addMonths($months))
                    ->where('status', 'active');
    }
}
