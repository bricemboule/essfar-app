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
            'email' => 'patrick.seumen@essfar.com',
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


    }
}