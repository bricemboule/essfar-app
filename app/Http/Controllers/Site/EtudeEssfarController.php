<?php

namespace App\Http\Controllers\Site;
use App\Http\Controllers\Controller;

use Inertia\Inertia;

use Illuminate\Http\Request;

class EtudeEssfarController extends Controller
{
    public function je_suis_etudiant(){

        return Inertia::render('EtudeEssfar/Etudiant');
    }

    public function je_suis_salarier(){

        return Inertia::render('EtudeEssfar/Salarier');
    }

    public function formations(){
        return Inertia::render('EtudeEssfar/Formation');
    }

    public function sujet(){

        return Inertia::render('EtudeEssfar/Sujet');
    }

    public function scolarite(){

        return Inertia::render('EtudeEssfar/Scolarite');
    }

    public function admission(){

        return Inertia::render('EtudeEssfar/Admission');
    }
}
