<?php

namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use App\Models\AcademicYear;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EtudiantResourceController extends Controller
{
    /**
     * Liste des ressources accessibles à l'étudiant
     */
    public function index(Request $request)
    {
        $student = auth()->user();
        
        // Vérifier que l'étudiant a une classe assignée
        if (!$student->school_class_id) {
            return Inertia::render('Etudiant/Ressource/Index', [
                'resources' => collect([]),
                'error' => 'Vous n\'êtes pas assigné à une classe.',
            ]);
        }

        $query = Resource::with(['cours', 'schoolClass', 'academicYear', 'uploader'])
            ->ofClass($student->school_class_id)
            ->active()
            ->public()
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
        $stats = [
            'total' => Resource::ofClass($student->school_class_id)
                ->active()
                ->public()
                ->available()
                ->count(),
            'by_type' => Resource::ofClass($student->school_class_id)
                ->active()
                ->public()
                ->available()
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'recent' => Resource::ofClass($student->school_class_id)
                ->active()
                ->public()
                ->available()
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        // Données pour les filtres
        $subjects = Subject::whereHas('schoolClasses', function ($query) use ($student) {
            $query->where('school_classes.id', $student->school_class_id);
        })->get();

        $academicYears = AcademicYear::whereHas('resources', function ($query) use ($student) {
            $query->where('school_class_id', $student->school_class_id);
        })->orderBy('is_active', 'desc')->get();

        return Inertia::render('Etudiant/Ressource/Index', [
            'resources' => $resources,
            'stats' => $stats,
            'subjects' => $subjects,
            'academicYears' => $academicYears,
            'filters' => $request->only(['search', 'type', 'subject_id', 'academic_year_id', 'semester']),
            'student' => $student->load('schoolClass'),
        ]);
    }

    /**
     * Voir une ressource
     */
    public function show(Resource $resource)
    {
        $student = auth()->user();

        // Vérifier l'accès
        if (!$resource->canBeAccessedBy($student)) {
            abort(403, 'Vous n\'avez pas accès à cette ressource.');
        }

        $resource->load(['cours', 'schoolClass', 'academicYear', 'uploader']);

        // Enregistrer la vue
        $resource->recordAccess($student, 'view');

        // Ressources similaires
        $similarResources = Resource::ofClass($student->school_class_id)
            ->ofSubject($resource->subject_id)
            ->ofType($resource->type)
            ->where('id', '!=', $resource->id)
            ->active()
            ->public()
            ->available()
            ->limit(5)
            ->get();

        return Inertia::render('Etudiant/Ressource/Show', [
            'resource' => $resource,
            'similarResources' => $similarResources,
        ]);
    }

    /**
     * Télécharger une ressource
     */
    public function download(Resource $resource)
    {
        $student = auth()->user();

        // Vérifier l'accès
        if (!$resource->canBeAccessedBy($student)) {
            abort(403, 'Vous n\'avez pas accès à cette ressource.');
        }

        // Enregistrer le téléchargement
        $resource->recordAccess($student, 'download');

        // Télécharger le fichier
        if (!Storage::exists($resource->file_path)) {
            abort(404, 'Fichier introuvable.');
        }

        return Storage::download($resource->file_path, $resource->file_name);
    }

    /**
     * Statistiques personnelles
     */
    public function statistics()
    {
        $student = auth()->user();

        // Ressources consultées
        $viewedResources = ResourceDownload::where('user_id', $student->id)
            ->where('action', 'view')
            ->with('resource.subject')
            ->latest()
            ->limit(10)
            ->get();

        // Ressources téléchargées
        $downloadedResources = ResourceDownload::where('user_id', $student->id)
            ->where('action', 'download')
            ->with('resource.subject')
            ->latest()
            ->limit(10)
            ->get();

        // Statistiques par type
        $statsByType = ResourceDownload::where('user_id', $student->id)
            ->join('resources', 'resource_downloads.resource_id', '=', 'resources.id')
            ->selectRaw('resources.type, COUNT(*) as count')
            ->groupBy('resources.type')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->type => $item->count];
            });

        // Statistiques par matière
        $statsBySubject = ResourceDownload::where('user_id', $student->id)
            ->join('resources', 'resource_downloads.resource_id', '=', 'resources.id')
            ->join('courses', 'resources.cours_id', '=', 'courses.id')
            ->selectRaw('courses.name, COUNT(*) as count')
            ->groupBy('courses.id', 'courses.name')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->name => $item->count];
            });

        $stats = [
            'total_views' => ResourceDownload::where('user_id', $student->id)
                ->where('action', 'view')
                ->count(),
            'total_downloads' => ResourceDownload::where('user_id', $student->id)
                ->where('action', 'download')
                ->count(),
            'by_type' => $statsByType,
            'by_subject' => $statsBySubject,
            'this_week' => ResourceDownload::where('user_id', $student->id)
                ->where('created_at', '>=', now()->startOfWeek())
                ->count(),
        ];

        return Inertia::render('Etudiant/Ressource/Statistics', [
            'stats' => $stats,
            'viewedResources' => $viewedResources,
            'downloadedResources' => $downloadedResources,
        ]);
    }
}