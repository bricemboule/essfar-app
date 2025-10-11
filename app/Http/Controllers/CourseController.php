<?php
// app/Http/Controllers/CourseController.php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with([
            'academicYear',
            'teachers',
            'classes'
        ])->withCount(['teachers', 'classes', 'schedules']);

        // Filtres
        if ($request->academic_year_id) {
            $query->where('academic_year_id', $request->academic_year_id);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->credits) {
            $query->where('credits', $request->credits);
        }

        $courses = $query->orderBy('name')->paginate(15);

        return Inertia::render('Scolarite/Cours/Index', [
            'courses' => $courses,
            'academicYears' => AcademicYear::all(),
            'filters' => $request->only(['search', 'academic_year_id', 'credits'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Scolarite/Cours/Create', [
            'academicYears' => AcademicYear::all(),
            'teachers' => User::where('role', 'enseignant')->get(),
            'classes' => SchoolClass::with('academicYear')->get()
        ]);
    }

public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'code' => 'required|string|max:50|unique:courses',
        'description' => 'nullable|string|max:2000',
        'credits' => 'required|integer|min:1|max:10',
        'total_hours' => 'required|integer|min:1|max:200',
        'taux_horaire' => 'required|numeric|min:0',
        'academic_year_id' => 'required|exists:academic_years,id',
        'teacher_ids' => 'required|array|min:1',
        'teacher_ids.*' => 'exists:users,id',
        'class_ids' => 'required|array|min:1',
        'class_ids.*' => 'exists:school_classes,id',
    ]);

 
    $course = Course::create([
        'name' => $validated['name'],
        'code' => $validated['code'],
        'description' => $validated['description'] ?? null,
        'credits' => $validated['credits'],
        'total_hours' => $validated['total_hours'],
        'academic_year_id' => $validated['academic_year_id'],
    ]);


    foreach ($validated['teacher_ids'] as $teacherId) {
        $course->teachers()->attach($teacherId, [
            'academic_year_id' => $validated['academic_year_id'],
            'taux_horaire' => $validated['taux_horaire'],
            'assigned_at' => now(),
        ]);
    }

    foreach ($validated['class_ids'] as $classId) {
    $course->classes()->attach($classId, [
        'academic_year_id' => $validated['academic_year_id'],
        'teacher_id' => $validated['teacher_ids'][0] ?? null, // si tu veux lier un enseignant
    ]);
}


    return redirect()->route('academic.courses.index')
        ->with('success', 'Cours créé avec succès.');
}


    public function show(Course $course)
    {
        $course->load([
            'academicYear',
            'teachers',
            'classes.students',
            'schedules' => function($query) {
                $query->with(['teacher', 'classroom', 'schoolClass'])
                      ->orderBy('date')
                      ->orderBy('start_time');
            }
        ]);

        // Calculer les statistiques
        $statistics = [
            'total_students' => $course->classes->sum(function($class) {
                return $class->students->count();
            }),
            'total_teachers' => $course->teachers->count(),
            'total_classes' => $course->classes->count(),
            'total_schedules' => $course->schedules->count(),
            'completed_hours' => $course->getCompletedHours(),
            'remaining_hours' => $course->getRemainingHours(),
            'progress_percentage' => $course->total_hours > 0 
                ? round(($course->getCompletedHours() / $course->total_hours) * 100, 2)
                : 0,
            'total_cost' => $course->total_hours * $course->hourly_rate,
            'completed_cost' => $course->getCompletedHours() * $course->hourly_rate,
        ];

        return Inertia::render('Scolarite/Cours/Show', [
            'course' => $course,
            'statistics' => $statistics
        ]);
    }

    public function edit(Course $course)
    {
        $course->load(['teachers', 'classes']);

        return Inertia::render('Scolarite/Cours/Edit', [
            'course' => $course,
            'academicYears' => AcademicYear::all(),
            'teachers' => User::where('role', 'teacher')->get(),
            'classes' => SchoolClass::with('academicYear')->get(),
            'assignedTeachers' => $course->teachers->pluck('id')->toArray(),
            'assignedClasses' => $course->classes->pluck('id')->toArray()
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:courses,code,' . $course->id,
            'description' => 'nullable|string|max:2000',
            'credits' => 'required|integer|min:1|max:10',
            'total_hours' => 'required|integer|min:1|max:200',
            'hourly_rate' => 'required|numeric|min:0',
            'academic_year_id' => 'required|exists:academic_years,id',
            'teacher_ids' => 'required|array|min:1',
            'teacher_ids.*' => 'exists:users,id',
            'class_ids' => 'required|array|min:1',
            'class_ids.*' => 'exists:school_classes,id',
            'objectives' => 'nullable|string|max:2000',
            'prerequisites' => 'nullable|string|max:2000',
            'evaluation_method' => 'nullable|string|max:2000',
            'resources' => 'nullable|string|max:2000'
        ]);

        $course->update($validated);

        // Mettre à jour les enseignants
        $course->teachers()->sync($request->teacher_ids);

        // Mettre à jour les classes
        $course->classes()->sync($request->class_ids);

        return redirect()->route('academic.courses.index')
            ->with('success', 'Cours mis à jour avec succès.');
    }

    public function destroy(Course $course)
    {
        if ($course->schedules()->count() > 0) {
            return back()->withErrors(['error' => 'Impossible de supprimer un cours qui a des plannings.']);
        }

        // Détacher les relations
        $course->teachers()->detach();
        $course->classes()->detach();

        $course->delete();

        return redirect()->route('academic.courses.index')
            ->with('success', 'Cours supprimé avec succès.');
    }

public function teachers(Course $course)
{
    // Charger les enseignants liés au cours (avec le pivot)
    $course->load(['teachers' => function ($query) {
        $query->withPivot('academic_year_id', 'assigned_at');
    }]);

    // Récupérer toutes les années académiques pour les correspondances
    $academicYears = AcademicYear::pluck('name', 'id');

    // Construire un tableau propre avec l’année académique
    $teachers = $course->teachers->map(function ($teacher) use ($academicYears) {
        return [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'email' => $teacher->email,
            'assigned_at' => $teacher->pivot->assigned_at,
            'academic_year' => $academicYears[$teacher->pivot->academic_year_id] ?? 'Non définie',
        ];
    });

    return inertia('Scolarite/Cours/Enseignant', [
        'course' => $course,
        'teachers' => $teachers,
    ]);
}

public function coursesByClass(SchoolClass $class)
{
    $activeYear = AcademicYear::active()->first();

    if (!$activeYear) {
        return response()->json([]);
    }

    // On filtre sur l'année académique du pivot
    $courses = $class->courses()
        ->wherePivot('academic_year_id', $activeYear->id)
        ->get(['courses.id', 'courses.name', 'courses.code']);

    return response()->json($courses);
}

public function classes(Course $course)
{
    $course->load('classes');

    return inertia('Scolarite/Cours/Classes', [
        'course' => $course,
        'classes' => $course->classes,
    ]);
}


    public function assignTeachers(Request $request, Course $course)
    {
        $request->validate([
            'teacher_ids' => 'required|array',
            'teacher_ids.*' => 'exists:users,id'
        ]);

        $course->teachers()->sync($request->teacher_ids);

        return back()->with('success', 'Enseignants assignés avec succès.');
    }

    public function assignClasses(Request $request, Course $course)
    {
        $request->validate([
            'class_ids' => 'required|array',
            'class_ids.*' => 'exists:school_classes,id'
        ]);

        $course->classes()->sync($request->class_ids);

        return back()->with('success', 'Classes assignées avec succès.');
    }

    public function duplicate(Course $course)
    {
        $newCourse = $course->replicate();
        $newCourse->code = $course->code . '-COPY';
        $newCourse->name = $course->name . ' (Copie)';
        $newCourse->save();

        // Copier les relations
        $newCourse->teachers()->attach($course->teachers->pluck('id'));
        $newCourse->classes()->attach($course->classes->pluck('id'));

        return redirect()->route('academic.courses.edit', $newCourse)
            ->with('success', 'Cours dupliqué avec succès. Modifiez les informations si nécessaire.');
    }

    public function getProgress(Course $course)
    {
        $completedHours = $course->getCompletedHours();
        $progressPercentage = $course->total_hours > 0 
            ? round(($completedHours / $course->total_hours) * 100, 2)
            : 0;

        return response()->json([
            'completed_hours' => $completedHours,
            'remaining_hours' => $course->getRemainingHours(),
            'progress_percentage' => $progressPercentage,
            'total_hours' => $course->total_hours
        ]);
    }
}