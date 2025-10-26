<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Créer la table pivot
        Schema::create('resource_school_class', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained()->onDelete('cascade');
            $table->foreignId('school_class_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Index pour éviter les doublons
            $table->unique(['resource_id', 'school_class_id']);
        });

        // Optionnel: Migrer les données existantes si vous aviez school_class_id dans resources
        if (Schema::hasColumn('resources', 'school_class_id')) {
            DB::statement('
                INSERT INTO resource_school_class (resource_id, school_class_id, created_at, updated_at)
                SELECT id, school_class_id, created_at, updated_at 
                FROM resources 
                WHERE school_class_id IS NOT NULL
            ');
            
            // Supprimer l'ancienne colonne
            Schema::table('resources', function (Blueprint $table) {
                $table->dropForeign(['school_class_id']);
                $table->dropColumn('school_class_id');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('resource_school_class');
        
        // Restaurer la colonne si besoin
        Schema::table('resources', function (Blueprint $table) {
            $table->foreignId('school_class_id')->nullable()->constrained()->onDelete('cascade');
        });
    }
};