<?php

namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use App\Models\AcademicYear;
use App\Models\Course;
use App\Models\ResourceDownload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EtudiantResourceController extends Controller
{
    public function index(Request $request)
    {
        $student = auth()->user();
        $student->load('schoolClass');
        
        if (!$student->school_class_id) {
            return Inertia::render('Etudiant/Ressource/Index', [
                'resources' => [
                    'data' => [],
                    'links' => [],
                    'last_page' => 1
                ],
                'stats' => [
                    'total' => 0,
                    'by_type' => [],
                    'recent' => 0
                ],
                'subjects' => [],
                'academicYears' => [],
                'filters' => [],
                'student' => $student,
                'error' => 'Vous n\'êtes pas assigné à une classe.',
            ]);
        }

        // CHANGÉ: Utiliser ofClass qui utilise whereHas avec la relation many-to-many
        $query = Resource::with(['cours', 'schoolClasses', 'academicYear', 'uploader'])
            ->ofClass($student->school_class_id)
            ->where('status', 'active')
            ->where('visibility', 'public')
            ->available()
            ->orderBy('created_at', 'desc');

        // Filtres
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        if ($request->filled('subject_id')) {
            $query->ofSubject($request->subject_id);
        }

        if ($request->filled('academic_year_id')) {
            $query->ofYear($request->academic_year_id);
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        $resources = $query->paginate(20)->withQueryString();

        // Statistiques
        $baseQuery = Resource::ofClass($student->school_class_id)
            ->where('status', 'active')
            ->where('visibility', 'public')
            ->available();

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'by_type' => (clone $baseQuery)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'recent' => (clone $baseQuery)
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        $subjects = Course::whereHas('schoolClasses', function ($query) use ($student) {
            $query->where('school_classes.id', $student->school_class_id);
        })->orderBy('name')->get();

        $academicYears = AcademicYear::whereHas('resources', function ($query) use ($student) {
            $query->whereHas('schoolClasses', function($q) use ($student) {
                $q->where('school_class_id', $student->school_class_id);
            });
        })->orderBy('is_active', 'desc')->orderBy('name', 'desc')->get();

        return Inertia::render('Etudiant/Ressource/Index', [
            'resources' => $resources,
            'stats' => $stats,
            'subjects' => $subjects,
            'academicYears' => $academicYears,
            'filters' => $request->only(['search', 'type', 'subject_id', 'academic_year_id', 'semester']) ?: [],
            'student' => $student,
        ]);
    }

    public function show(Resource $resource)
    {
        $student = auth()->user();

        // CHANGÉ: Utiliser la méthode canBeAccessedBy qui vérifie belongsToClass
        if (!$resource->canBeAccessedBy($student)) {
            abort(403, 'Vous n\'avez pas accès à cette ressource.');
        }

        $resource->load(['subject', 'schoolClasses', 'academicYear', 'uploader']);

        ResourceDownload::create([
            'user_id' => $student->id,
            'resource_id' => $resource->id,
            'action' => 'view',
            'ip_address' => request()->ip(),
        ]);

        $resource->increment('views_count');

        $similarResources = Resource::ofClass($student->school_class_id)
            ->ofSubject($resource->subject_id)
            ->ofType($resource->type)
            ->where('id', '!=', $resource->id)
            ->where('status', 'active')
            ->where('visibility', 'public')
            ->limit(5)
            ->get();

        return Inertia::render('Etudiant/Ressource/Show', [
            'resource' => $resource,
            'similarResources' => $similarResources,
        ]);
    }

    public function download(Resource $resource)
    {
        $student = auth()->user();

        if (!$resource->canBeAccessedBy($student)) {
            abort(403, 'Vous n\'avez pas accès à cette ressource.');
        }

        ResourceDownload::create([
            'user_id' => $student->id,
            'resource_id' => $resource->id,
            'action' => 'download',
            'ip_address' => request()->ip(),
        ]);

        $resource->increment('downloads_count');

        if (!Storage::exists($resource->file_path)) {
            abort(404, 'Fichier introuvable.');
        }

        return Storage::download($resource->file_path, $resource->file_name);
    }

    // ... reste du code
}