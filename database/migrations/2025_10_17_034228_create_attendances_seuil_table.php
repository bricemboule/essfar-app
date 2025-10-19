<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('attendance_seuil', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            
            $table->integer('warning_absences')->default(3)->comment('Nombre d\'absences avant alerte');
            $table->integer('critical_absences')->default(5)->comment('Nombre d\'absences critique');
            $table->integer('warning_delays')->default(5)->comment('Nombre de retards avant alerte');
            $table->integer('critical_delays')->default(10)->comment('Nombre de retards critique');
            $table->integer('period_days')->default(30)->comment('Période de calcul en jours');
            
            $table->boolean('notify_parents')->default(true);
            $table->boolean('notify_administration')->default(true);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            $table->unique(['school_class_id', 'academic_year_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('attendance_seuil');
    }
};