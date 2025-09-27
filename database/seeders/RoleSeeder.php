<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        $roles = [
            ['name' => 'admin', 'label' => 'Administrateur'],
            ['name' => 'etudiant', 'label' => 'Étudiant'],
            ['name' => 'chef_scolarite', 'label' => 'Chef de scolarité'],
            ['name' => 'directeur_academique', 'label' => 'Directeur académique'],
            ['name' => 'directeur_general', 'label' => 'Directeur général'],
            ['name' => 'comptabilite', 'label' => 'Comptabilité'],
            ['name' => 'communication', 'label' => 'Communication'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
