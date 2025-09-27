<?php
// app/Http/Controllers/AcademicYearController.php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicYearController extends Controller
{
    public function index()
    {
        $academicYears = AcademicYear::withCount([
            'classes',
            'courses',
            'schedules'
        ])->orderBy('start_date', 'desc')->paginate(10);

        return Inertia::render('Scolarite/AnneeAcademique/Index', [
            'academicYears' => $academicYears
        ]);
    }

    public function create()
    {
        return Inertia::render('Scolarite/AnneeAcademique/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean'
        ]);

        // Si on active cette année, désactiver les autres
        if ($validated['is_active']) {
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
        }

        AcademicYear::create($validated);

        return redirect()->route('academic.years.index')
            ->with('success', 'Année académique créée avec succès.');
    }

    public function show(AcademicYear $year)
    {
        $year->load(['classes.students', 'courses', 'schedules']);
        
        return Inertia::render('Scolarite/AnneeAcademique/Show', [
            'academicYear' => $year,
            'statistics' => [
                'total_classes' => $year->classes->count(),
                'total_students' => $year->classes->sum(function($class) {
                    return $class->students->count();
                }),
                'total_courses' => $year->courses->count(),
                'total_schedules' => $year->schedules->count(),
            ]
        ]);
    }

    public function edit(AcademicYear $year)
    {
        return Inertia::render('Scolarite/AnneeAcademique/Edit', [
            'academicYear' => $year
        ]);
    }

    public function update(Request $request, AcademicYear $year)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name,' . $year->id,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean'
        ]);

        // Si on active cette année, désactiver les autres
        if ($validated['is_active'] && !$year->is_active) {
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
        }

        $year->update($validated);

        return redirect()->route('academic.years.index')
            ->with('success', 'Année académique mise à jour avec succès.');
    }

    public function destroy(AcademicYear $year)
    {
        if ($year->is_active) {
            return back()->withErrors(['error' => 'Impossible de supprimer l\'année académique active.']);
        }

        if ($year->schedules()->count() > 0) {
            return back()->withErrors(['error' => 'Cette année académique contient des plannings et ne peut pas être supprimée.']);
        }

        $year->delete();

        return redirect()->route('academic.years.index')
            ->with('success', 'Année académique supprimée avec succès.');
    }
}