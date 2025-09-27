<?php

namespace App\Http\Controllers\Site;
use App\Http\Controllers\Controller;

use Inertia\Inertia;

use Illuminate\Http\Request;

class EcoleController extends Controller
{

    public function motDirecteur(){

        return Inertia::render('Ecole/MotDirecteur');
    }

    public function gouvernance(){

        return Inertia::render('Ecole/Gouvernance');
    }
    

    public function projetPedagogique(){

        return Inertia::render('Ecole/ProjetPedagogique');
    }

    public function partenaires(){

        return Inertia::render('Ecole/Partenaires');
    }
}
