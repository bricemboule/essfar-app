<?php

namespace App\Http\Controllers\Scolarite;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use App\Models\Course;
use App\Models\SchoolClass;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ResourceController extends Controller
{
    /**
     * Liste des ressources
     */
    public function index(Request $request)
    {
        $query = Resource::with(['course', 'schoolClass', 'academicYear', 'uploader'])
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

        if ($request->filled('class_id')) {
            $query->ofClass($request->class_id);
        }

        if ($request->filled('academic_year_id')) {
            $query->ofYear($request->academic_year_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $resources = $query->paginate(20)->withQueryString();

        // Statistiques
        $stats = [
            'total' => Resource::count(),
            'active' => Resource::active()->count(),
            'by_type' => Resource::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'total_downloads' => Resource::sum('downloads_count'),
            'recent' => Resource::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return Inertia::render('Scolarite/Ressources/Index', [
            'resources' => $resources,
            'stats' => $stats,
            'subjects' => Course::all(),
            'classes' => SchoolClass::all(),
            'academicYears' => AcademicYear::orderBy('is_active', 'desc')->get(),
            'filters' => $request->only(['search', 'type', 'subject_id', 'class_id', 'academic_year_id', 'is_active']),
        ]);
    }

    /**
     * Formulaire de création
     */
    public function create()
    {
        return Inertia::render('Scolarite/Ressources/Create', [
            'subjects' => Course::all(),
            'classes' => SchoolClass::all(),
            'academicYears' => AcademicYear::orderBy('is_active', 'desc')->get(),
        ]);
    }

    /**
     * Enregistrer une ressource
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:ancien_cc,ancien_ds,session_normale,session_rattrapage,cours,td,tp,correction,autre',
            'subject_id' => 'required|exists:courses,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'file' => 'required|file|max:10240', 
            'exam_date' => 'nullable|date',
            'semester' => 'nullable|string|in:S1,S2,S3,S4',
            'duration' => 'nullable|integer|min:1',
            'coefficient' => 'nullable|integer|min:1',
            'is_public' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
            'tags' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // Upload du fichier
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('resources', $fileName, 'public');

            // Créer la ressource
            $resource = Resource::create([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'course_id' => $request->subject_id,
                'school_class_id' => $request->school_class_id,
                'academic_year_id' => $request->academic_year_id,
                'uploaded_by' => auth()->id(),
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'exam_date' => $request->exam_date,
                'semester' => $request->semester,
                'duration' => $request->duration,
                'coefficient' => $request->coefficient,
                'is_public' => $request->boolean('is_public', true),
                'is_active' => true,
                'available_from' => $request->available_from,
                'available_until' => $request->available_until,
                'tags' => $request->tags,
                'notes' => $request->notes,
            ]);

            DB::commit();

            return redirect()->route('scolarite.resources.index')
                ->with('success', 'Ressource ajoutée avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Supprimer le fichier si upload réussi mais erreur après
            if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            return back()->withErrors([
                'error' => 'Une erreur est survenue lors de l\'ajout de la ressource.'
            ])->withInput();
        }
    }

    /**
     * Voir une ressource
     */
    public function show(Resource $resource)
    {
        $resource->load(['cours', 'schoolClass', 'academicYear', 'uploader', 'downloads.user']);

        // Statistiques de téléchargement
        $downloadStats = [
            'total_downloads' => $resource->downloads()->where('action', 'download')->count(),
            'total_views' => $resource->downloads()->where('action', 'view')->count(),
            'unique_users' => $resource->downloads()->distinct('user_id')->count('user_id'),
            'recent_downloads' => $resource->downloads()
                ->with('user')
                ->latest()
                ->limit(10)
                ->get(),
        ];

        return Inertia::render('Scolarite/Resources/Show', [
            'resource' => $resource,
            'downloadStats' => $downloadStats,
        ]);
    }

    /**
     * Formulaire d'édition
     */
    public function edit(Resource $resource)
    {
        return Inertia::render('Scolarite/Resources/Edit', [
            'resource' => $resource,
            'subjects' => Course::all(),
            'classes' => SchoolClass::all(),
            'academicYears' => AcademicYear::orderBy('is_active', 'desc')->get(),
        ]);
    }

    /**
     * Mettre à jour une ressource
     */
    public function update(Request $request, Resource $resource)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:ancien_cc,ancien_ds,session_normale,session_rattrapage,cours,td,tp,correction,autre',
            'subject_id' => 'required|exists:subjects,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'file' => 'nullable|file|max:10240',
            'exam_date' => 'nullable|date',
            'semester' => 'nullable|string|in:S1,S2,S3,S4',
            'duration' => 'nullable|integer|min:1',
            'coefficient' => 'nullable|integer|min:1',
            'is_public' => 'boolean',
            'is_active' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
            'tags' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $data = $request->except('file');

            // Si nouveau fichier uploadé
            if ($request->hasFile('file')) {
                // Supprimer l'ancien fichier
                if (Storage::disk('public')->exists($resource->file_path)) {
                    Storage::disk('public')->delete($resource->file_path);
                }

                // Upload du nouveau fichier
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('resources', $fileName, 'public');

                $data['file_path'] = $filePath;
                $data['file_name'] = $file->getClientOriginalName();
                $data['file_type'] = $file->getMimeType();
                $data['file_size'] = $file->getSize();
            }

            $resource->update($data);

            DB::commit();

            return redirect()->route('scolarite.resources.show', $resource)
                ->with('success', 'Ressource mise à jour avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Une erreur est survenue lors de la mise à jour.'
            ])->withInput();
        }
    }

    /**
     * Supprimer une ressource
     */
    public function destroy(Resource $resource)
    {
        DB::beginTransaction();

        try {
            // Supprimer le fichier
            if (Storage::disk('public')->exists($resource->file_path)) {
                Storage::disk('public')->delete($resource->file_path);
            }

            $resource->delete();

            DB::commit();

            return redirect()->route('scolarite.resources.index')
                ->with('success', 'Ressource supprimée avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Impossible de supprimer cette ressource.'
            ]);
        }
    }

    /**
     * Télécharger une ressource
     */
    public function download(Resource $resource)
    {
        if (!Storage::disk('public')->exists($resource->file_path)) {
            abort(404, 'Fichier introuvable.');
        }

        // Enregistrer l'accès
        $resource->recordAccess(auth()->user(), 'download');

        return Storage::disk('public')->download($resource->file_path, $resource->file_name);
    }

    /**
     * Statistiques détaillées
     */
    public function statistics()
    {
        // Ressources les plus téléchargées
        $mostDownloaded = Resource::with(['cours', 'schoolClass'])
            ->orderBy('downloads_count', 'desc')
            ->limit(10)
            ->get();

        // Ressources les plus consultées
        $mostViewed = Resource::with(['cours', 'schoolClass'])
            ->orderBy('views_count', 'desc')
            ->limit(10)
            ->get();

        // Statistiques par type
        $statsByType = Resource::selectRaw('type, COUNT(*) as count, SUM(downloads_count) as total_downloads')
            ->groupBy('type')
            ->get();

        // Statistiques par classe
        $statsByClass = Resource::join('school_classes', 'resources.school_class_id', '=', 'school_classes.id')
            ->selectRaw('school_classes.name, COUNT(*) as count, SUM(resources.downloads_count) as total_downloads')
            ->groupBy('school_classes.id', 'school_classes.name')
            ->get();

        // Statistiques par matière
        $statsBySubject = Resource::join('courses', 'resources.course_id', '=', 'courses.id')
            ->selectRaw('courses.name, COUNT(*) as count, SUM(resources.downloads_count) as total_downloads')
            ->groupBy('courses.id', 'courses.name')
            ->get();

        return Inertia::render('Scolarite/Resources/Statistics', [
            'mostDownloaded' => $mostDownloaded,
            'mostViewed' => $mostViewed,
            'statsByType' => $statsByType,
            'statsByClass' => $statsByClass,
            'statsBySubject' => $statsBySubject,
        ]);
    }

    /**
     * Activer/Désactiver une ressource
     */
    public function toggleStatus(Resource $resource)
    {
        $resource->update([
            'is_active' => !$resource->is_active
        ]);

        $status = $resource->is_active ? 'activée' : 'désactivée';

        return back()->with('success', "Ressource {$status} avec succès.");
    }
}