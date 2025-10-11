<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'matricule',
        'telephone',
        'adresse',
        'date_naissance',
        'lieu_naissance',
        'sexe',
        'grade',
        'specialite',
        'photo',
        'statut',
        'parent_name',
        'parent_phone',
        'contact_urgent',
        'previous_school',
        'parent_email',
        'permissions_supplementaires',
        'notes_admin'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_naissance' => 'date',
        'derniere_connexion' => 'datetime',
        'permissions_supplementaires' => 'array',
    ];

    // Constantes pour les rôles
    const ROLES = [
        'etudiant' => 'Étudiant',
        'enseignant' => 'Enseignant',
        'chef_scolarite' => 'Chef Scolarité',
        'gestionnaire_scolarite' => 'Gestionnaire Scolarité',
        'directeur_academique' => 'Directeur Académique',
        'directeur_general' => 'Directeur Général',
        'comptable' => 'Comptable',
        'communication' => 'Communication',
        'admin' => 'Administrateur'
    ];

    // Hiérarchie des permissions (du plus bas au plus haut)
    const ROLE_HIERARCHY = [
        'etudiant' => 1,
        'enseignant' => 2,
        'gestionnaire_scolarite' => 3,
        'communication' => 4,
        'comptable' => 5,
        'chef_scolarite' => 6,
        'directeur_academique' => 7,
        'directeur_general' => 8,
        'admin' => 9
    ];

    // Relations
    public function studentEnrollments()
    {
        return $this->hasMany(StudentEnrollment::class, 'student_id');
    }

    public function teacherCourses()
    {
        return $this->belongsToMany(Course::class, 'course_teachers', 'teacher_id', 'course_id')
                                    ->withPivot('academic_year_id', 'assigned_at');
    }

    
    public function teacherSchedules()
    {
        return $this->hasMany(Schedule::class, 'teacher_id');
    }

    // Accesseurs
    public function getRoleDisplayNameAttribute()
    {
        return self::ROLES[$this->role] ?? $this->role;
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo ? asset('storage/' . $this->photo) : asset('images/default-avatar.png');
    }

    public function getAgeAttribute()
    {
        return $this->date_naissance ? $this->date_naissance->age : null;
    }

    // Méthodes de vérification des permissions
    public function hasRole(string|array $roles): bool
    {
        if (is_string($roles)) {
            return $this->role === $roles;
        }
        
        return in_array($this->role, $roles);
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->hasRole($roles);
    }

    public function hasPermission(string $permission): bool
    {
        // Permissions basées sur les rôles
        $rolePermissions = $this->getRolePermissions();
        
        // Permissions supplémentaires stockées en base
        $extraPermissions = $this->permissions_supplementaires ?? [];
        
        return in_array($permission, $rolePermissions) || in_array($permission, $extraPermissions);
    }

    public function canAccessPlanning(): bool
    {
        return $this->hasAnyRole([
            'chef_scolarite',
            'gestionnaire_scolarite',
            'directeur_academique',
            'directeur_general',
            'comptable',
            'communication',
            'admin'
        ]);
    }

    public function canManageUsers(): bool
    {
        return $this->hasAnyRole([
            'directeur_general',
            'admin'
        ]);
    }

    public function canViewFinancialReports(): bool
    {
        return $this->hasAnyRole([
            'comptable',
            'directeur_general',
            'admin'
        ]);
    }

    public function canManageSchedules(): bool
    {
        return $this->hasAnyRole([
            'chef_scolarite',
            'gestionnaire_scolarite',
            'admin'
        ]);
    }

    public function hasHigherRoleThan(User $user): bool
    {
        $myLevel = self::ROLE_HIERARCHY[$this->role] ?? 0;
        $theirLevel = self::ROLE_HIERARCHY[$user->role] ?? 0;
        
        return $myLevel > $theirLevel;
    }

    // Permissions par rôle
    private function getRolePermissions(): array
    {
        return match($this->role) {
            'etudiant' => [
                'view_own_schedule',
                'view_own_grades',
                'view_own_profile',
                'update_own_profile'
            ],
            'enseignant' => [
                'view_own_schedule',
                'view_teaching_schedules',
                'mark_attendance',
                'view_class_students',
                'update_own_profile'
            ],
            'gestionnaire_scolarite' => [
                'view_schedules',
                'create_schedules',
                'update_schedules',
                'manage_student_enrollments',
                'view_class_reports',
                'send_notifications'
            ],
            'communication' => [
                'manage_announcements',
                'send_bulk_emails',
                'manage_website_content',
                'view_communication_reports'
            ],
            'comptable' => [
                'view_financial_reports',
                'manage_payments',
                'view_teacher_earnings',
                'generate_invoices',
                'view_budget_reports'
            ],
            'chef_scolarite' => [
                'view_financial_reports',
                'view_teacher_earnings',
                'manage_schedules',
                'manage_classrooms',
                'manage_courses',
                'view_academic_reports',
                'manage_student_enrollments',
                'approve_schedule_changes',
                'send_schedule_notifications'
            ],
            'directeur_academique' => [
                'view_all_academic_data',
                'manage_academic_programs',
                'approve_academic_decisions',
                'view_teacher_performance',
                'manage_curriculum'
            ],
            'directeur_general' => [
                'manage_all',
                'view_all_reports',
                'manage_strategic_decisions',
                'view_financial_summaries',
                'approve_major_changes',
                'access_executive_dashboard'
            ],
            'admin' => [
                'manage_all',
                'system_administration',
                'manage_users',
                'view_system_logs',
                'backup_restore'
            ],
            default => []
        };
    }

    // Scopes
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeActive($query)
    {
        return $query->where('statut', 'actif');
    }

    public function scopeStaff($query)
    {
        return $query->whereNotIn('role', ['etudiant']);
    }

    public function scopeAdministration($query)
    {
        return $query->whereIn('role', [
            'chef_scolarite',
            'gestionnaire_scolarite',
            'directeur_academique',
            'directeur_general',
            'comptable',
            'communication',
            'admin'
        ]);
    }

    // Méthodes utilitaires
    public function updateLastLogin()
    {
        $this->update(['derniere_connexion' => now()]);
    }

    public function generateMatricule()
    {
        if (!$this->matricule) {
            $prefix = match($this->role) {
                'etudiant' => 'ETU',
                'enseignant' => 'ENS',
                'chef_scolarite' => 'CS',
                'gestionnaire_scolarite' => 'GS',
                'directeur_academique' => 'DA',
                'directeur_general' => 'DG',
                'comptable' => 'CPT',
                'communication' => 'COM',
                'admin' => 'ADM',
                default => 'USR'
            };
            
            $year = date('Y');
            $number = str_pad($this->id, 4, '0', STR_PAD_LEFT);
            
            $this->update(['matricule' => $prefix . $year . $number]);
        }
    }

    public function getDashboardRoute(): string
    {
        return match($this->role) {
            'etudiant' => 'etudiant.dashboard',
            'enseignant' => 'enseignant.dashboard',
            'chef_scolarite' => 'scolarite.dashboard',
            'gestionnaire_scolarite' => 'gestionnaire.dashboard',
            'directeur_academique' => 'academique.dashboard',
            'directeur_general' => 'direction.dashboard',
            'comptable' => 'comptable.dashboard',
            'communication' => 'communication.dashboard',
            'admin' => 'admin.dashboard',
            default => 'dashboard'
        };
    }
}