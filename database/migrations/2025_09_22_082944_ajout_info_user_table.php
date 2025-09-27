<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Rôle étendu
            $table->enum('role', [
                'etudiant',
                'enseignant',
                'chef_scolarite',
                'gestionnaire_scolarite',
                'directeur_academique',
                'directeur_general',
                'comptable',
                'communication',
                'admin'
            ])->default('etudiant')->after('email_verified_at');

            // Informations supplémentaires
            $table->string('prenom')->nullable()->after('name');
            $table->date('date_naissance')->nullable()->after('prenom');
            $table->string('lieu_naissance')->nullable()->after('date_naissance');
            $table->enum('sexe', ['M', 'F'])->nullable()->after('lieu_naissance');
            $table->string('matricule')->nullable()->unique()->after('lieu_naissance');
            $table->string('telephone')->nullable()->after('matricule');
            $table->text('adresse')->nullable()->after('telephone');
            $table->string('photo')->nullable()->after('sexe');
            
            // Statut et métadonnées
            $table->enum('statut', ['actif', 'inactif', 'suspendu'])->default('actif')->after('photo');
            $table->timestamp('derniere_connexion')->nullable()->after('statut');
            $table->json('permissions_supplementaires')->nullable()->after('derniere_connexion');
            $table->text('notes_admin')->nullable()->after('permissions_supplementaires');

            // Index pour les recherches fréquentes
            $table->index(['role', 'statut']);
            $table->index('matricule');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'statut']);
            $table->dropIndex(['matricule']);
            
            $table->dropColumn([
                'role',
                'matricule',
                'telephone',
                'adresse',
                'date_naissance',
                'lieu_naissance',
                'sexe',
                'photo',
                'statut',
                'derniere_connexion',
                'permissions_supplementaires',
                'notes_admin'
            ]);
        });
    }
};