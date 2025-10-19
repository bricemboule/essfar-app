<?php

namespace App\Http\Controllers\Scolarite;

use App\Http\Controllers\Controller;

use App\Models\Classroom;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class ClassroomController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Classroom::query();

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('building', 'like', "%{$search}%");
            });
        }

        // Filtres
        if ($request->filled('building')) {
            $query->where('building', $request->building);
        }

        if ($request->filled('is_available')) {
            $query->where('is_available', $request->boolean('is_available'));
        }

        if ($request->filled('min_capacity')) {
            $query->where('capacity', '>=', $request->min_capacity);
        }

        // Tri
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $classrooms = $query->withCount('schedules')->paginate(15);

        // Statistiques
        $stats = [
            'total' => Classroom::count(),
            'available' => Classroom::where('is_available', true)->count(),
            'total_capacity' => Classroom::sum('capacity'),
            'buildings' => Classroom::distinct('building')->whereNotNull('building')->pluck('building')
        ];

        return Inertia::render('Scolarite/Salles/Index', [
            'classrooms' => $classrooms,
            'stats' => $stats,
            'filters' => $request->only(['search', 'building', 'is_available', 'min_capacity']),
            'buildings' => Classroom::distinct('building')->whereNotNull('building')->orderBy('building')->pluck('building')
        ]);
    }

    public function create(): Response
    {
        $buildings = Classroom::distinct('building')
            ->whereNotNull('building')
            ->orderBy('building')
            ->pluck('building');

        $equipmentOptions = [
            'Projecteur',
            'Tableau interactif',
            'Système audio',
            'Ordinateurs',
            'Wifi',
            'Climatisation',
            'Tableau blanc',
            'Prises électriques',
            'Caméra',
            'Microphone'
        ];

        return Inertia::render('Scolarite/Salles/Create', [
            'buildings' => $buildings,
            'equipmentOptions' => $equipmentOptions
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:classrooms,code',
            'capacity' => 'required|integer|min:1|max:500',
            'building' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:50',
            'equipment' => 'nullable|array',
            'equipment.*' => 'string',
            'is_available' => 'boolean'
        ]);

        Classroom::create($validated);

        return redirect()
            ->route('academic.classrooms.index')
            ->with('success', 'Salle créée avec succès.');
    }

    public function show(Classroom $classroom): Response
    {
        $classroom->load([
            'schedules' => function ($query) {
                $query->with(['course', 'teacher', 'schoolClass'])
                      ->orderBy('start_time', 'desc')
                      ->limit(10);
            }
        ]);

        // Calcul du taux d'occupation pour le mois en cours
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();
        $occupancyRate = $classroom->getOccupancyRate($startOfMonth, $endOfMonth);

        // Prochains créneaux réservés
        $upcomingSchedules = $classroom->schedules()
            ->with(['course', 'teacher', 'schoolClass'])
            ->where('start_time', '>=', now())
            ->orderBy('start_time')
            ->limit(5)
            ->get();

        return Inertia::render('Scolarite/Salles/Show', [
            'classroom' => $classroom,
            'occupancyRate' => $occupancyRate,
            'upcomingSchedules' => $upcomingSchedules
        ]);
    }

    public function edit(Classroom $classroom): Response
    {
        $buildings = Classroom::distinct('building')
            ->whereNotNull('building')
            ->orderBy('building')
            ->pluck('building');

        $equipmentOptions = [
            'Projecteur',
            'Tableau interactif',
            'Système audio',
            'Ordinateurs',
            'Wifi',
            'Climatisation',
            'Tableau blanc',
            'Prises électriques',
            'Caméra',
            'Microphone'
        ];

        return Inertia::render('Academic/Classrooms/Edit', [
            'classroom' => $classroom,
            'buildings' => $buildings,
            'equipmentOptions' => $equipmentOptions
        ]);
    }

    public function update(Request $request, Classroom $classroom): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('classrooms', 'code')->ignore($classroom->id)
            ],
            'capacity' => 'required|integer|min:1|max:500',
            'building' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:50',
            'equipment' => 'nullable|array',
            'equipment.*' => 'string',
            'is_available' => 'boolean'
        ]);

        $classroom->update($validated);

        return redirect()
            ->route('academic.classrooms.show', $classroom)
            ->with('success', 'Salle mise à jour avec succès.');
    }

    public function destroy(Classroom $classroom): RedirectResponse
    {
        // Vérifier s'il y a des plannings futurs
        $futureSchedules = $classroom->schedules()
            ->where('start_time', '>=', now())
            ->count();

        if ($futureSchedules > 0) {
            return redirect()
                ->route('academic.classrooms.index')
                ->with('error', 'Impossible de supprimer cette salle car elle a des créneaux programmés.');
        }

        $classroom->delete();

        return redirect()
            ->route('academic.classrooms.index')
            ->with('success', 'Salle supprimée avec succès.');
    }

    public function checkAvailability(Request $request, Classroom $classroom)
    {
        $request->validate([
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'exclude_schedule_id' => 'nullable|integer'
        ]);

        $isAvailable = $classroom->isAvailable(
            $request->start_time,
            $request->end_time,
            $request->exclude_schedule_id
        );

        return response()->json([
            'available' => $isAvailable,
            'classroom' => $classroom->only(['id', 'name', 'code', 'capacity'])
        ]);
    }
}