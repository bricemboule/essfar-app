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
            $table->string('specialite')->nullable()->after('photo');
            $table->string('grade')->nullable()->after('specialite');
            $table->string('date_embauche')->nullable()->after('grade');
            $table->string('type_contrat')->nullable()->after('date_embauche');
            $table->string('salaire_mensuel')->nullable()->after('type_contrat');
            $table->string('contract_start_date')->nullable()->after('salaire_mensuel');
            $table->string('contract_end_date')->nullable()->after('contract_start_date');
            $table -> string('parent_name')->nullable()->after('photo');
            $table -> string('parent_phone')->nullable()->after('parent_name');
            $table -> string('parent_email')->nullable()->after('parent_phone');
            $table -> string('previous_school')->nullable()->after('parent_email');
            $table -> string('scholarship')->nullable()->after('previous_school');
            $table -> string('contact_urgent')->nullable()->after('scholarship');
            $table -> string('medical_info')->nullable()->after('contact_urgent');
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