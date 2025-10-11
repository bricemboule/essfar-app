<?php
// database/migrations/2025_01_01_000005_create_schedules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('school_class_id')->constrained()->onDelete('cascade');
            $table->foreignId('classroom_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->datetime('start_time');
            $table->datetime('end_time');
            $table->tinyInteger('day_of_week'); // 1=Lundi, 7=Dimanche
            $table->integer('week_number'); // Semaine de l'année
            $table->decimal('completed_hours', 5, 2)->nullable();
            $table->text('completion_notes')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'rescheduled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->boolean('is_recurring')->default(false); // Cours récurrent
            $table->timestamps();

            // Index pour les requêtes fréquentes
            $table->index(['teacher_id', 'start_time']);
            $table->index(['school_class_id', 'start_time']);
            $table->index(['classroom_id', 'start_time']);
            $table->index(['academic_year_id', 'week_number']);
            $table->index(['day_of_week', 'start_time']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('schedules');
    }
};