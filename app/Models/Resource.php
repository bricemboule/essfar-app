<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Resource extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'type',
        'course_id',
        'academic_year_id',
        'uploaded_by',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'exam_date',
        'semester',
        'duration',
        'coefficient',
        'status',
        'visibility',
        'available_from',
        'available_until',
        'downloads_count',
        'views_count',
        'tags',
        'notes',
    ];

    protected $casts = [
        'exam_date' => 'date',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
        'downloads_count' => 'integer',
        'views_count' => 'integer',
        'file_size' => 'integer',
        'duration' => 'integer',
        'coefficient' => 'integer',
    ];

    protected $attributes = [
        'status' => 'active',
        'visibility' => 'public',
        'downloads_count' => 0,
        'views_count' => 0,
    ];

    // Relations
    public function cours()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function course()
    {
        return $this->subject();
    }

    // CHANGÉ: Many-to-Many avec SchoolClass
    public function schoolClasses()
    {
        return $this->belongsToMany(SchoolClass::class, 'resource_school_class')
                    ->withTimestamps();
    }

    // Méthode helper pour vérifier si une ressource appartient à une classe spécifique
    public function belongsToClass($classId)
    {
        return $this->schoolClasses()->where('school_class_id', $classId)->exists();
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function downloads()
    {
        return $this->hasMany(ResourceDownload::class);
    }

    // Accesseurs (restent identiques)
    public function getFileUrlAttribute()
    {
        return Storage::url($this->file_path);
    }

    public function getFileSizeFormattedAttribute()
    {
        if (!$this->file_size) return 'N/A';
        
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unit = 0;
        
        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }
        
        return round($size, 2) . ' ' . $units[$unit];
    }

    public function getTypeFormattedAttribute()
    {
        $types = [
            'ancien_cc' => 'Ancien CC',
            'ancien_ds' => 'Ancien DS',
            'session_normale' => 'Session Normale',
            'session_rattrapage' => 'Session Rattrapage',
            'cours' => 'Support de cours',
            'td' => 'TD',
            'tp' => 'TP',
            'correction' => 'Correction',
            'autre' => 'Autre',
        ];
        return $types[$this->type] ?? $this->type;
    }

    public function getTypeBadgeAttribute()
    {
        $badges = [
            'ancien_cc' => 'badge-primary',
            'ancien_ds' => 'badge-info',
            'session_normale' => 'badge-danger',
            'session_rattrapage' => 'badge-warning',
            'cours' => 'badge-success',
            'td' => 'badge-secondary',
            'tp' => 'badge-dark',
            'correction' => 'badge-light',
            'autre' => 'badge-secondary',
        ];
        return $badges[$this->type] ?? 'badge-secondary';
    }

    public function getFileIconAttribute()
    {
        $extension = pathinfo($this->file_name, PATHINFO_EXTENSION);
        
        $icons = [
            'pdf' => 'fa-file-pdf text-danger',
            'doc' => 'fa-file-word text-primary',
            'docx' => 'fa-file-word text-primary',
            'xls' => 'fa-file-excel text-success',
            'xlsx' => 'fa-file-excel text-success',
            'ppt' => 'fa-file-powerpoint text-warning',
            'pptx' => 'fa-file-powerpoint text-warning',
            'zip' => 'fa-file-archive text-secondary',
            'rar' => 'fa-file-archive text-secondary',
            'jpg' => 'fa-file-image text-info',
            'jpeg' => 'fa-file-image text-info',
            'png' => 'fa-file-image text-info',
            'gif' => 'fa-file-image text-info',
            'txt' => 'fa-file-alt text-dark',
        ];
        
        return $icons[$extension] ?? 'fa-file text-secondary';
    }

   
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopeOfClass($query, $classId)
    {
        return $query->whereHas('schoolClasses', function($q) use ($classId) {
            $q->where('school_class_id', $classId);
        });
    }

    public function scopeOfClasses($query, array $classIds)
    {
        return $query->whereHas('schoolClasses', function($q) use ($classIds) {
            $q->whereIn('school_class_id', $classIds);
        });
    }

    public function scopeOfSubject($query, $subjectId)
    {
        return $query->where('course_id', $subjectId);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOfYear($query, $yearId)
    {
        return $query->where('academic_year_id', $yearId);
    }

    public function scopeAvailable($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('available_from')
              ->orWhere('available_from', '<=', now());
        })->where(function ($q) {
            $q->whereNull('available_until')
              ->orWhere('available_until', '>=', now());
        });
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('tags', 'like', "%{$search}%");
        });
    }

    // Méthodes utilitaires
    public function isAvailable()
    {
        if ($this->status !== 'active') return false;
        
        $now = now();
        
        if ($this->available_from && $this->available_from->gt($now)) {
            return false;
        }
        
        if ($this->available_until && $this->available_until->lt($now)) {
            return false;
        }
        
        return true;
    }

    public function canBeAccessedBy(User $user)
    {
        if (!$this->isAvailable()) return false;
        
        // Admin et Scolarité ont toujours accès
        if (in_array($user->role, ['admin', 'chef_scolarite', 'gestionnaire_scolarite'])) {
            return true;
        }
        
        // Étudiant: vérifier qu'il est dans l'une des classes autorisées
        if ($user->role === 'etudiant' && $user->school_class_id) {
            return $this->belongsToClass($user->school_class_id);
        }
        
        return false;
    }

    public function incrementDownloads()
    {
        $this->increment('downloads_count');
    }

    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function recordAccess(User $user, $action = 'download')
    {
        ResourceDownload::create([
            'resource_id' => $this->id,
            'user_id' => $user->id,
            'action' => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
        
        if ($action === 'download') {
            $this->incrementDownloads();
        } else {
            $this->incrementViews();
        }
    }
}