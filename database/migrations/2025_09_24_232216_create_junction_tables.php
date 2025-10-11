<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Table de liaison Classe-Cours
        Schema::create('class_courses', function (Blueprint $table) {
        $table->id();
        $table->foreignId('school_class_id')->constrained('school_classes')->onDelete('cascade');
        $table->foreignId('course_id')->constrained()->onDelete('cascade');
        $table->foreignId('academic_year_id')->nullable()->constrained('academic_years')->onDelete('set null');
        $table->foreignId('teacher_id')->nullable()->constrained('users')->onDelete('set null');
        $table->timestamps();
    });

        // Table de liaison Cours-Enseignants
        Schema::create('course_teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
             $table->decimal('taux_horaire', 8, 2)->nullable(); // Tarif spécifique pour ce prof
            $table->date('assigned_at')->nullable();
           
            $table->timestamps();

            $table->unique(['course_id', 'teacher_id']);
        });

        // Table des inscriptions étudiants
       Schema::create('student_enrollments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('school_class_id')->constrained()->onDelete('cascade');
    $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
    $table->date('enrollment_date');
    $table->enum('status', ['active', 'suspended', 'withdrawn', 'completed'])->default('active');
    $table->timestamps();

    $table->unique(
        ['student_id', 'school_class_id', 'academic_year_id'],
        'uniq_student_class_year'
    );

    $table->index(['academic_year_id', 'status'], 'idx_year_status');
});

    }

    public function down()
    {
        Schema::dropIfExists('student_enrollments');
        Schema::dropIfExists('course_teachers');
        Schema::dropIfExists('class_courses');
    }
};