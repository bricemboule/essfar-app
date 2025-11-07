<?php

namespace App\Http\Controllers\Scolarite;

use App\Http\Controllers\Controller;
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
            'taux_horaire' => 'nullable|numeric|min:0',
            'academic_year_id' => 'required|exists:academic_years,id',
            'teacher_ids' => 'nullable|array', 
            'teacher_ids.*' => 'exists:users,id',
            'class_ids' => 'required|array|min:1',
            'class_ids.*' => 'exists:school_classes,id',
            'class_credits' => 'nullable|array', 
            'class_credits.*' => 'nullable|integer|min:0|max:10',
            'class_mandatory' => 'nullable|array', 
        ]);

        
        $course = Course::create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'] ?? null,
            'credits' => $validated['credits'],
            'total_hours' => $validated['total_hours'],
            'academic_year_id' => $validated['academic_year_id'],
        ]);

      
        if (!empty($validated['teacher_ids'])) {
            foreach ($validated['teacher_ids'] as $teacherId) {
                $course->teachers()->attach($teacherId, [
                    'academic_year_id' => $validated['academic_year_id'],
                    'taux_horaire' => $validated['taux_horaire'] ?? 0,
                    'assigned_at' => now(),
                ]);
            }
        }

        // Assigner les classes avec crédits spécifiques
        foreach ($validated['class_ids'] as $index => $classId) {
            $pivotData = [
                'academic_year_id' => $validated['academic_year_id'],
                'teacher_id' => $validated['teacher_ids'][0] ?? null,
            ];

            // Ajouter les crédits spécifiques si fournis
            if (isset($validated['class_credits'][$classId])) {
                $pivotData['credits'] = $validated['class_credits'][$classId];
            }

            // Ajouter le statut obligatoire
            $pivotData['is_mandatory'] = isset($validated['class_mandatory'][$classId]) 
                ? (bool)$validated['class_mandatory'][$classId] 
                : true;

            $course->classes()->attach($classId, $pivotData);
        }

        return redirect()->route('scolarite.courses.index')
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
            'teachers' => User::where('role', 'enseignant')->get(),
            'classes' => SchoolClass::with('academicYear')->get(),
            'assignedTeachers' => $course->teachers->pluck('id')->toArray(),
            'assignedClasses' => $course->classes->map(function($class) {
                return [
                    'id' => $class->id,
                    'credits' => $class->pivot->credits,
                    'is_mandatory' => $class->pivot->is_mandatory,
                ];
            })->toArray(),
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
            'taux_horaire' => 'nullable|numeric|min:0',
            'academic_year_id' => 'required|exists:academic_years,id',
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'exists:users,id',
            'class_ids' => 'required|array|min:1',
            'class_ids.*' => 'exists:school_classes,id',
            'class_credits' => 'nullable|array',
            'class_credits.*' => 'nullable|integer|min:0|max:10',
            'class_mandatory' => 'nullable|array',
        ]);

        $course->update($validated);

        // Mettre à jour les enseignants
        if (isset($validated['teacher_ids'])) {
            $teacherData = [];
            foreach ($validated['teacher_ids'] as $teacherId) {
                $teacherData[$teacherId] = [
                    'academic_year_id' => $validated['academic_year_id'],
                    'taux_horaire' => $validated['taux_horaire'] ?? 0,
                    'assigned_at' => now(),
                ];
            }
            $course->teachers()->sync($teacherData);
        }

        // Mettre à jour les classes
        $classData = [];
        foreach ($validated['class_ids'] as $classId) {
            $classData[$classId] = [
                'academic_year_id' => $validated['academic_year_id'],
                'teacher_id' => $validated['teacher_ids'][0] ?? null,
                'credits' => $validated['class_credits'][$classId] ?? null,
                'is_mandatory' => isset($validated['class_mandatory'][$classId]) 
                    ? (bool)$validated['class_mandatory'][$classId] 
                    : true,
            ];
        }
        $course->classes()->sync($classData);

        return redirect()->route('scolarite.courses.index')
            ->with('success', 'Cours mis à jour avec succès.');
    }

    public function destroy(Course $course)
    {
        if ($course->schedules()->count() > 0) {
            return back()->withErrors(['error' => 'Impossible de supprimer un cours qui a des plannings.']);
        }

        $course->teachers()->detach();
        $course->classes()->detach();
        $course->delete();

        return redirect()->route('scolarite.courses.index')
            ->with('success', 'Cours supprimé avec succès.');
    }

    public function teachers(Course $course)
    {
        $course->load(['teachers' => function ($query) {
            $query->withPivot('academic_year_id', 'assigned_at', 'taux_horaire');
        }]);

        $academicYears = AcademicYear::pluck('name', 'id');

        $teachers = $course->teachers->map(function ($teacher) use ($academicYears) {
            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'assigned_at' => $teacher->pivot->assigned_at,
                'taux_horaire' => $teacher->pivot->taux_horaire,
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
        $course->load(['classes' => function($query) {
            $query->withPivot('credits', 'is_mandatory');
        }]);

        $classes = $course->classes->map(function($class) use ($course) {
            return [
                'id' => $class->id,
                'name' => $class->name,
                'level' => $class->level,
                'capacity' => $class->capacity,
                'credits' => $class->pivot->credits ?? $course->credits,
                'is_mandatory' => $class->pivot->is_mandatory,
            ];
        });

        return inertia('Scolarite/Cours/Classes', [
            'course' => $course,
            'classes' => $classes,
        ]);
    }
}