<?php
// database/migrations/2025_01_01_000002_create_school_classes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // ex: "Licence 1 Informatique A"
            $table->string('code')->unique(); // ex: "L1-INFO-A"
            $table->string('level'); // ex: "Licence 1", "Master 2"
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->integer('capacity')->default(50);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['academic_year_id', 'level']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('school_classes');
    }
};