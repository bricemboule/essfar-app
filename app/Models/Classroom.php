<?php
// app/Models/Classroom.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'capacity',
        'building',
        'floor',
        'equipment',
        'is_available'
    ];

    protected $casts = [
        'capacity' => 'integer',
        'equipment' => 'array',
        'is_available' => 'boolean'
    ];

    // Relations
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    // Vérifier disponibilité
    public function isAvailable($startTime, $endTime, $excludeScheduleId = null)
    {
        $query = $this->schedules()
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($subq) use ($startTime, $endTime) {
                      $subq->where('start_time', '<=', $startTime)
                           ->where('end_time', '>=', $endTime);
                  });
            });

        if ($excludeScheduleId) {
            $query->where('id', '!=', $excludeScheduleId);
        }

        return $query->count() === 0;
    }

    public function getOccupancyRate($startDate, $endDate)
    {
        $totalMinutes = $this->schedules()
            ->whereBetween('start_time', [$startDate, $endDate])
            ->sum(\DB::raw('TIMESTAMPDIFF(MINUTE, start_time, end_time)'));
            
        $periodMinutes = (strtotime($endDate) - strtotime($startDate)) / 60;
        
        return $periodMinutes > 0 ? ($totalMinutes / $periodMinutes) * 100 : 0;
    }
}