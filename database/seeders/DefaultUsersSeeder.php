<?php
// database/seeders/DefaultUsersSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DefaultUsersSeeder extends Seeder
{
    public function run()
    {
        // Administrateur principal
        $admin = User::create([
            'name' => 'Administrateur Principal',
            'email' => 'admin@essfar.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'telephone' => '+237 XXX XXX XXX',
            'statut' => 'actif',
            'notes_admin' => 'Compte administrateur principal du système',
        ]);
        $admin->generateMatricule();

        // Directeur Général
        $dg = User::create([
            'name' => 'Directeur Général',
            'email' => 'patric.seumen@essfar.com',
            'password' => Hash::make('password'),
            'role' => 'directeur_general',
            'telephone' => '+237 XXX XXX XXX',
            'statut' => 'actif',
        ]);
        $dg->generateMatricule();

        // Directeur Académique
        $da = User::create([
            'name' => 'Directeur Académique',
            'email' => 'etienne.tsamo@essfar.com',
            'password' => Hash::make('password'),
            'role' => 'directeur_academique',
            'telephone' => '+237 XXX XXX XXX',
            'statut' => 'actif',
        ]);
        $da->generateMatricule();

        // Chef Scolarité
        $cs = User::create([
            'name' => 'Chef Scolarité',
            'email' => 'donald.mbapou@essfar.com',
            'password' => Hash::make('password'),
            'role' => 'chef_scolarite',
            'telephone' => '+237 XXX XXX XXX',
            'statut' => 'actif',
        ]);
        $cs->generateMatricule();

        // Gestionnaire Scolarité
        $gs = User::create([
            'name' => 'Gestionnaire Scolarité',
            'email' => 'brice.mboule@essfar.com',
            'password' => Hash::make('password'),
            'role' => 'gestionnaire_scolarite',
            'telephone' => '+237 XXX XXX XXX',
            'statut' => 'actif',
        ]);
        $gs->generateMatricule();

        // Comptable
        $comptable = User::create([
            'name' => 'Comptable Principal',
            'email' => 'ulrich.wakeu@essfar.com',
            'password' => Hash::make('password'),
            'role' => 'comptable',
            'telephone' => '+237 XXX XXX XXX',
            'statut' => 'actif',
        ]);
        $comptable->generateMatricule();

        // Responsable Communication
        $com = User::create([
            'name' => 'Responsable Communication',
            'email' => 'myriam.makon@essfar.com',
            'password' => Hash::make('password'),
            'role' => 'communication',
            'telephone' => '+237 XXX XXX XXX',
            'statut' => 'actif',
        ]);
        $com->generateMatricule();

        // Enseignants de test
        $enseignants = [
            'Martin Kouam' => 'martin.kouam@essfar.edu',
            'Marie Tchinda' => 'marie.tchinda@essfar.edu',
            'Paul Ngando' => 'paul.ngando@essfar.edu',
            'Claire Mballa' => 'claire.mballa@essfar.edu',
            'Jean Fouda' => 'jean.fouda@essfar.edu',
        ];

        foreach ($enseignants as $name => $email) {
            $enseignant = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'enseignant',
                'telephone' => '+237 XXX XXX XXX',
                'statut' => 'actif',
            ]);
            $enseignant->generateMatricule();
        }

        // Étudiants de test
        $etudiants = [
            'Alice Mbongo' => 'alice.mbongo@student.essfar.edu',
            'Bob Ndongo' => 'bob.ndongo@student.essfar.edu',
            'Claire Manga' => 'claire.manga@student.essfar.edu',
            'David Ayissi' => 'david.ayissi@student.essfar.edu',
            'Emma Biya' => 'emma.biya@student.essfar.edu',
            'Frank Eto\'o' => 'frank.etoo@student.essfar.edu',
            'Grace Onana' => 'grace.onana@student.essfar.edu',
            'Henri Nkomo' => 'henri.nkomo@student.essfar.edu',
        ];

        foreach ($etudiants as $name => $email) {
            $etudiant = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'etudiant',
                'telephone' => '+237 XXX XXX XXX',
                'date_naissance' => fake()->dateTimeBetween('-25 years', '-18 years'),
                'sexe' => fake()->randomElement(['M', 'F']),
                'statut' => 'actif',
            ]);
            $etudiant->generateMatricule();
        }

        $this->command->info('Utilisateurs par défaut créés avec succès !');
        $this->command->line('');
        $this->command->line('=== COMPTES DE TEST ===');
        $this->command->line('Admin: admin@essfar.edu / password');
        $this->command->line('DG: dg@essfar.edu / password');
        $this->command->line('DA: da@essfar.edu / password');
        $this->command->line('Chef Scolarité: chef.scolarite@essfar.edu / password');
        $this->command->line('Comptable: comptable@essfar.edu / password');
        $this->command->line('Communication: communication@essfar.edu / password');
        $this->command->line('Enseignant: martin.kouam@essfar.edu / password');
        $this->command->line('Étudiant: alice.mbongo@student.essfar.edu / password');
    }
}