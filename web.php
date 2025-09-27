<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Site\EcoleController;
use App\Http\Controllers\Site\EtudeEssfarController;
use App\Http\Controllers\Site\FormationController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Routes de l'école
|--------------------------------------------------------------------------
*/
Route::prefix('ecole')->name('ecole.')->group(function () {
    //Route::get('/', [EcoleController::class, 'index'])->name('index');
    Route::get('/mot-du-directeur', [EcoleController::class, 'motDirecteur'])->name('motDirecteur');
    Route::get('/notre-gouvernance', [EcoleController::class, 'gouvernance'])->name('gouvernance');
    Route::get('/projet-pedagogique', [EcoleController::class, 'projetPedagogique'])->name('projet_pedagogique');
    Route::get('/partenaires', [EcoleController::class, 'partenaires'])->name('partenaires');
});

Route::prefix('etudier_a_essfar')->name('etudier_a_essfar.')->group(function () {
    
    Route::get('/etudiant', [EtudeEssfarController::class, 'je_suis_etudiant'])->name('etudiant');
    Route ::get('/salarier', [EtudeEssfarController::class, 'je_suis_salarier'])->name('salarier');
    Route ::get('/admission', [EtudeEssfarController::class, 'admission'])->name('admission');
    Route ::get('/formations', [EtudeEssfarController::class, 'formations'])->name('nos_formations');
    Route ::get('/anciens_sujets', [EtudeEssfarController::class, 'sujet'])->name('anciens_sujets');
    Route ::get('/frais_scolarite', [EtudeEssfarController::class, 'scolarite'])->name('frais_scolarite');
});


Route::prefix('formation')->name('formation.')->group(function () {
    
    Route::get('/mathematiques_economie', [FormationController::class, 'Mathematiques'])->name('mathematiques_economie');
    Route::get('/informatique_des_organisations', [FormationController::class, 'Informatique'])->name('informatiques_des_organisations');
    Route::get('/actuatiat', [FormationController::class, 'Actuariat'])->name('actuariat');
    Route::get('/big_data', [FormationController::class, 'BigData'])->name('big_data');
    Route::get('/ingenierie_financiere', [FormationController::class, 'IngenierieFinanciere'])->name('ingenierie_financiere');
    Route::get('/systeme_information', [FormationController::class, 'Systeme_information'])->name('systeme_information');
});

/*
|--------------------------------------------------------------------------
| Routes des formations
|--------------------------------------------------------------------------
*/
/*Route::prefix('formations')->name('formations.')->group(function () {
    Route::get('/', [FormationController::class, 'index'])->name('index');
    Route::get('/licences', [FormationController::class, 'licences'])->name('licences');
    Route::get('/masters', [FormationController::class, 'masters'])->name('masters');
    Route::get('/certifications', [FormationController::class, 'certifications'])->name('certifications');
});*/

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
