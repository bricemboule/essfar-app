<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            
            // Type de ressource
            $table->enum('type', [          
                'ancien_ds',           
                'session_normale',     
                'session_rattrapage', 
                'cours',              
                'td',                  
                'tp',                 
                'correction',         
                'autre'              
            ]);
            
            // Relations
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('school_class_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            
            // Fichier
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->nullable();
            $table->bigInteger('file_size')->nullable(); // en bytes
            
            // Métadonnées
            $table->date('exam_date')->nullable()->comment('Date de l\'examen original');
            $table->string('semester')->nullable()->comment('Semestre: S1, S2, etc.');
            $table->integer('duration')->nullable()->comment('Durée en minutes');
            $table->integer('coefficient')->nullable();
            
            // Visibilité et accès
            $table->boolean('is_public')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('available_from')->nullable();
            $table->timestamp('available_until')->nullable();
            
            // Statistiques
            $table->integer('downloads_count')->default(0);
            $table->integer('views_count')->default(0);
            
            // Tags et recherche
            $table->text('tags')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index pour optimisation
            $table->index(['school_class_id', 'course_id', 'type']);
            $table->index(['academic_year_id', 'is_active']);
            $table->index('type');
            $table->index('is_public');
        });
    }

    public function down()
    {
        Schema::dropIfExists('resources');
    }
};