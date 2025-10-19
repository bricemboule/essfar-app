<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('school_class_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('marked_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->date('date');
            $table->time('time')->nullable();
            $table->enum('type', ['presence', 'absence', 'retard', 'absence_justifiee'])->default('presence');
            $table->integer('delay_minutes')->nullable()->comment('Durée du retard en minutes');
            $table->integer('hours_missed')->default(0)->comment('Heures manquées');
            
            // Justification
            $table->text('student_justification')->nullable();
            $table->string('justification_file')->nullable();
            $table->timestamp('justification_date')->nullable();
            $table->enum('justification_status', ['pending', 'approved', 'rejected'])->nullable();
            $table->foreignId('validated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('validation_date')->nullable();
            $table->text('validation_comment')->nullable();
            
            // Notification
            $table->boolean('parent_notified')->default(false);
            $table->timestamp('notification_sent_at')->nullable();
            $table->boolean('alert_sent')->default(false)->comment('Alerte seuil envoyée');
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Index pour améliorer les performances
            $table->index(['student_id', 'date']);
            $table->index(['school_class_id', 'date']);
            $table->index(['course_id', 'date']);
            $table->index(['type', 'date']);
            $table->index('justification_status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('attendances');
    }
};