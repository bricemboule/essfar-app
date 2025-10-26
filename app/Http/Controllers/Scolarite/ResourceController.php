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
        $query = Resource::with(['subject', 'schoolClasses', 'academicYear', 'uploader'])
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

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $resources = $query->paginate(20)->withQueryString();

        // Statistiques
        $stats = [
            'total' => Resource::count(),
            'active' => Resource::where('status', 'active')->count(),
            'by_type' => Resource::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'total_downloads' => Resource::sum('downloads_count'),
            'recent' => Resource::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return Inertia::render('Scolarite/Ressources/Index', [
            'resources' => $resources,
            'stats' => $stats,
            'subjects' => Course::orderBy('name')->get(),
            'classes' => SchoolClass::orderBy('name')->get(),
            'academicYears' => AcademicYear::orderBy('is_active', 'desc')->get(),
            'filters' => $request->only(['search', 'type', 'subject_id', 'class_id', 'academic_year_id', 'status']) ?: [],
        ]);
    }

    /**
     * Formulaire de création
     */
    public function create()
    {
        return Inertia::render('Scolarite/Ressources/Create', [
            'subjects' => Course::orderBy('name')->get(),
            'classes' => SchoolClass::orderBy('name')->get(),
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
            'school_class_ids' => 'required|array|min:1', // CHANGÉ: accepte plusieurs classes
            'school_class_ids.*' => 'exists:school_classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar,jpg,jpeg,png,txt', 
            'exam_date' => 'nullable|date',
            'semester' => 'nullable|string|in:S1,S2,S3,S4',
            'duration' => 'nullable|integer|min:1',
            'coefficient' => 'nullable|integer|min:1',
            'visibility' => 'required|in:public,private,restricted', // CHANGÉ
            'status' => 'required|in:active,inactive,draft', // CHANGÉ
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
                'subject_id' => $request->subject_id, // CHANGÉ
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
                'visibility' => $request->visibility, // CHANGÉ
                'status' => $request->status, // CHANGÉ
                'available_from' => $request->available_from,
                'available_until' => $request->available_until,
                'tags' => $request->tags,
                'notes' => $request->notes,
            ]);

            // Attacher les classes sélectionnées
            $resource->schoolClasses()->attach($request->school_class_ids);

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
                'error' => 'Une erreur est survenue lors de l\'ajout de la ressource: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Voir une ressource
     */
    public function show(Resource $resource)
    {
        $resource->load(['subject', 'schoolClasses', 'academicYear', 'uploader', 'downloads.user']);

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
            'downloads_by_class' => $resource->downloads()
                ->join('users', 'resource_downloads.user_id', '=', 'users.id')
                ->join('school_classes', 'users.school_class_id', '=', 'school_classes.id')
                ->selectRaw('school_classes.name, COUNT(*) as count')
                ->groupBy('school_classes.id', 'school_classes.name')
                ->get(),
        ];

        return Inertia::render('Scolarite/Ressources/Show', [
            'resource' => $resource,
            'downloadStats' => $downloadStats,
        ]);
    }

    /**
     * Formulaire d'édition
     */
    public function edit(Resource $resource)
    {
        $resource->load('schoolClasses');
        
        return Inertia::render('Scolarite/Ressources/Edit', [
            'resource' => $resource,
            'subjects' => Course::orderBy('name')->get(),
            'classes' => SchoolClass::orderBy('name')->get(),
            'academicYears' => AcademicYear::orderBy('is_active', 'desc')->get(),
            'selectedClassIds' => $resource->schoolClasses->pluck('id')->toArray(), // AJOUTÉ
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
            'subject_id' => 'required|exists:courses,id',
            'school_class_ids' => 'required|array|min:1', // CHANGÉ
            'school_class_ids.*' => 'exists:school_classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'file' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar,jpg,jpeg,png,txt',
            'exam_date' => 'nullable|date',
            'semester' => 'nullable|string|in:S1,S2,S3,S4',
            'duration' => 'nullable|integer|min:1',
            'coefficient' => 'nullable|integer|min:1',
            'visibility' => 'required|in:public,private,restricted', // CHANGÉ
            'status' => 'required|in:active,inactive,draft', // CHANGÉ
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
            'tags' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $data = [
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'subject_id' => $request->subject_id, // CHANGÉ
                'academic_year_id' => $request->academic_year_id,
                'exam_date' => $request->exam_date,
                'semester' => $request->semester,
                'duration' => $request->duration,
                'coefficient' => $request->coefficient,
                'visibility' => $request->visibility, // CHANGÉ
                'status' => $request->status, // CHANGÉ
                'available_from' => $request->available_from,
                'available_until' => $request->available_until,
                'tags' => $request->tags,
                'notes' => $request->notes,
            ];

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

            // Synchroniser les classes
            $resource->schoolClasses()->sync($request->school_class_ids);

            DB::commit();

            return redirect()->route('scolarite.resources.show', $resource)
                ->with('success', 'Ressource mise à jour avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Une erreur est survenue lors de la mise à jour: ' . $e->getMessage()
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
            // Détacher toutes les classes
            $resource->schoolClasses()->detach();

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
                'error' => 'Impossible de supprimer cette ressource: ' . $e->getMessage()
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
        $mostDownloaded = Resource::with(['subject', 'schoolClasses'])
            ->orderBy('downloads_count', 'desc')
            ->limit(10)
            ->get();

        // Ressources les plus consultées
        $mostViewed = Resource::with(['subject', 'schoolClasses'])
            ->orderBy('views_count', 'desc')
            ->limit(10)
            ->get();

        // Statistiques par type
        $statsByType = Resource::selectRaw('type, COUNT(*) as count, SUM(downloads_count) as total_downloads')
            ->groupBy('type')
            ->get();

        // Statistiques par classe (MODIFIÉ pour many-to-many)
        $statsByClass = DB::table('resource_school_class')
            ->join('school_classes', 'resource_school_class.school_class_id', '=', 'school_classes.id')
            ->join('resources', 'resource_school_class.resource_id', '=', 'resources.id')
            ->selectRaw('school_classes.name, COUNT(DISTINCT resources.id) as count, SUM(resources.downloads_count) as total_downloads')
            ->groupBy('school_classes.id', 'school_classes.name')
            ->get();

        // Statistiques par matière
        $statsBySubject = Resource::join('courses', 'resources.subject_id', '=', 'courses.id')
            ->selectRaw('courses.name, COUNT(*) as count, SUM(resources.downloads_count) as total_downloads')
            ->groupBy('courses.id', 'courses.name')
            ->get();

        // Statistiques d'activité par mois (derniers 6 mois)
        $activityByMonth = Resource::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Top utilisateurs (plus de téléchargements)
        $topUsers = DB::table('resource_downloads')
            ->join('users', 'resource_downloads.user_id', '=', 'users.id')
            ->where('resource_downloads.action', 'download')
            ->selectRaw('users.name, users.email, COUNT(*) as downloads')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('downloads')
            ->limit(10)
            ->get();

        return Inertia::render('Scolarite/Ressources/Statistics', [
            'mostDownloaded' => $mostDownloaded,
            'mostViewed' => $mostViewed,
            'statsByType' => $statsByType,
            'statsByClass' => $statsByClass,
            'statsBySubject' => $statsBySubject,
            'activityByMonth' => $activityByMonth,
            'topUsers' => $topUsers,
        ]);
    }

    /**
     * Activer/Désactiver une ressource
     */
    public function toggleStatus(Resource $resource)
    {
        $newStatus = $resource->status === 'active' ? 'inactive' : 'active';
        
        $resource->update([
            'status' => $newStatus
        ]);

        $statusText = $newStatus === 'active' ? 'activée' : 'désactivée';

        return back()->with('success', "Ressource {$statusText} avec succès.");
    }

    /**
     * Dupliquer une ressource
     */
    public function duplicate(Resource $resource)
    {
        DB::beginTransaction();

        try {
            // Copier le fichier
            $oldPath = $resource->file_path;
            $fileName = time() . '_copy_' . $resource->file_name;
            $newPath = 'resources/' . $fileName;

            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->copy($oldPath, $newPath);
            }

            // Créer la nouvelle ressource
            $newResource = $resource->replicate();
            $newResource->title = $resource->title . ' (Copie)';
            $newResource->file_path = $newPath;
            $newResource->uploaded_by = auth()->id();
            $newResource->downloads_count = 0;
            $newResource->views_count = 0;
            $newResource->save();

            // Copier les relations avec les classes
            $classIds = $resource->schoolClasses->pluck('id')->toArray();
            $newResource->schoolClasses()->attach($classIds);

            DB::commit();

            return redirect()->route('scolarite.resources.edit', $newResource)
                ->with('success', 'Ressource dupliquée avec succès !');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Erreur lors de la duplication: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Export des ressources (CSV)
     */
    public function export()
    {
        $resources = Resource::with(['subject', 'schoolClasses', 'academicYear', 'uploader'])->get();

        $csvData = [];
        $csvData[] = ['ID', 'Titre', 'Type', 'Matière', 'Classes', 'Année académique', 'Téléchargements', 'Vues', 'Status', 'Date création'];

        foreach ($resources as $resource) {
            $csvData[] = [
                $resource->id,
                $resource->title,
                $resource->type_formatted,
                $resource->subject->name ?? 'N/A',
                $resource->schoolClasses->pluck('name')->join(', '),
                $resource->academicYear->name ?? 'N/A',
                $resource->downloads_count,
                $resource->views_count,
                $resource->status,
                $resource->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'resources_export_' . date('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'r+');
        
        foreach ($csvData as $row) {
            fputcsv($handle, $row);
        }
        
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}