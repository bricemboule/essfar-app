<?php
// database/migrations/2025_01_01_000004_create_classrooms_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // ex: "Salle A101"
            $table->string('code')->unique(); // ex: "A101"
            $table->integer('capacity'); // Nombre de places
            $table->string('building')->nullable(); // Bâtiment
            $table->string('floor')->nullable(); // Étage
            $table->json('equipment')->nullable(); // Équipements disponibles
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->index(['building', 'is_available']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('classrooms');
    }
};