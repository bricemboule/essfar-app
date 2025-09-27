<?php
// database/migrations/2025_01_01_000003_create_courses_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // ex: "Programmation Web"
            $table->string('code')->unique(); // ex: "INFO-301"
            $table->text('description')->nullable();
            $table->integer('credits')->default(3);
            $table->integer('total_hours'); // Total d'heures prévues
            $table->decimal('hourly_rate', 8, 2)->default(0); // Tarif horaire enseignant
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->index(['academic_year_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('courses');
    }
};