<?php
// app/Http/Controllers/SchoolClassController.php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\AcademicYear;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolClassController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::with(['academicYear'])
            ->withCount(['students', 'courses', 'schedules'])
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Academic/Classes/Index', [
            'classes' => $classes,
            'academicYears' => AcademicYear::all()
        ]);
    }

    public function create()
    {
        return Inertia::render('Academic/Classes/Create', [
            'academicYears' => AcademicYear::all(),
            'levels' => [
                'Licence 1',
                'Licence 2',
                'Licence 3',
                'Master 1',
                'Master 2',
                'Doctorat'
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:school_classes',
            'level' => 'required|string|max:100',
            'academic_year_id' => 'required|exists:academic_years,id',
            'capacity' => 'required|integer|min:1|max:200',
            'description' => 'nullable|string|max:1000'
        ]);

        SchoolClass::create($validated);

        return redirect()->route('academic.classes.index')
            ->with('success', 'Classe créée avec succès.');
    }

    public function show(SchoolClass $class)
    {
        $class->load([
            'academicYear',
            'students',
            'courses',
            'schedules.course',
            'schedules.teacher'
        ]);

        return Inertia::render('Academic/Classes/Show', [
            'class' => $class,
            'availableCourses' => Course::where('academic_year_id', $class->academic_year_id)
                ->whereNotIn('id', $class->courses->pluck('id'))
                ->get()
        ]);
    }

    public function edit(SchoolClass $class)
    {
        return Inertia::render('Academic/Classes/Edit', [
            'class' => $class,
            'academicYears' => AcademicYear::all(),
            'levels' => [
                'Licence 1',
                'Licence 2',
                'Licence 3',
                'Master 1',
                'Master 2',
                'Doctorat'
            ]
        ]);
    }

    public function update(Request $request, SchoolClass $class)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:school_classes,code,' . $class->id,
            'level' => 'required|string|max:100',
            'academic_year_id' => 'required|exists:academic_years,id',
            'capacity' => 'required|integer|min:1|max:200',
            'description' => 'nullable|string|max:1000'
        ]);

        $class->update($validated);

        return redirect()->route('academic.classes.index')
            ->with('success', 'Classe mise à jour avec succès.');
    }

    public function destroy(SchoolClass $class)
    {
        if ($class->students()->count() > 0) {
            return back()->withErrors(['error' => 'Impossible de supprimer une classe qui contient des étudiants.']);
        }

        if ($class->schedules()->count() > 0) {
            return back()->withErrors(['error' => 'Impossible de supprimer une classe qui a des plannings.']);
        }

        $class->delete();

        return redirect()->route('academic.classes.index')
            ->with('success', 'Classe supprimée avec succès.');
    }

    // Assigner des cours à une classe
    public function assignCourses(Request $request, SchoolClass $class)
    {
        $request->validate([
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,id'
        ]);

        // Vérifier que les cours appartiennent à la même année académique
        $courses = Course::whereIn('id', $request->course_ids)
            ->where('academic_year_id', $class->academic_year_id)
            ->get();

        if ($courses->count() !== count($request->course_ids)) {
            return back()->withErrors(['error' => 'Certains cours ne correspondent pas à l\'année académique de la classe.']);
        }

        $class->courses()->sync($request->course_ids);

        return back()->with('success', 'Cours assignés avec succès.');
    }
}