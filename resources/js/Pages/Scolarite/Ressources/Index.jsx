import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";

export default function Index({
    resources,
    stats,
    subjects,
    classes,
    academicYears,
    filters,
}) {
    console.log(resources);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filterType, setFilterType] = useState(filters.type || "");
    const [filterSubject, setFilterSubject] = useState(
        filters.subject_id || ""
    );
    const [filterClass, setFilterClass] = useState(filters.class_id || "");
    const [filterYear, setFilterYear] = useState(
        filters.academic_year_id || ""
    );
    const [filterStatus, setFilterStatus] = useState(filters.is_active || "");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);

    const { delete: destroy, processing } = useForm();

    const handleSearch = () => {
        router.get(
            route("scolarite.resources.index"),
            {
                search: searchTerm,
                type: filterType,
                subject_id: filterSubject,
                class_id: filterClass,
                academic_year_id: filterYear,
                is_active: filterStatus,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterType("");
        setFilterSubject("");
        setFilterClass("");
        setFilterYear("");
        setFilterStatus("");
        router.get(route("scolarite.resources.index"));
    };

    const handleDelete = (resource) => {
        setResourceToDelete(resource);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (resourceToDelete) {
            destroy(route("scolarite.resources.destroy", resourceToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setResourceToDelete(null);
                },
            });
        }
    };

    const toggleStatus = (resource) => {
        router.post(
            route("scolarite.resources.toggle-status", resource.id),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const getTypeLabel = (type) => {
        const labels = {
            ancien_cc: "Ancien CC",
            ancien_ds: "Ancien DS",
            session_normale: "Session Normale",
            session_rattrapage: "Session Rattrapage",
            cours: "Support de cours",
            td: "TD",
            tp: "TP",
            correction: "Correction",
            autre: "Autre",
        };
        return labels[type] || type;
    };

    const getTypeBadge = (type) => {
        const badges = {
            ancien_cc: "badge-primary",
            ancien_ds: "badge-info",
            session_normale: "badge-danger",
            session_rattrapage: "badge-warning",
            cours: "badge-success",
            td: "badge-secondary",
            tp: "badge-dark",
            correction: "badge-light text-dark",
            autre: "badge-secondary",
        };
        return badges[type] || "badge-secondary";
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();
        const icons = {
            pdf: "fa-file-pdf text-danger",
            doc: "fa-file-word text-primary",
            docx: "fa-file-word text-primary",
            xls: "fa-file-excel text-success",
            xlsx: "fa-file-excel text-success",
            ppt: "fa-file-powerpoint text-warning",
            pptx: "fa-file-powerpoint text-warning",
        };
        return icons[extension] || "fa-file text-secondary";
    };

    return (
        <AdminLayout title="Gestion des ressources">
            <Head title="Ressources pédagogiques" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-folder-open mr-2 text-info"></i>
                                Gestion des ressources pédagogiques
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("scolarite.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Ressources
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Statistiques */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{stats.total}</h3>
                                    <p>Ressources totales</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-folder-open"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats.active}</h3>
                                    <p>Actives</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.total_downloads}</h3>
                                    <p>Téléchargements</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-download"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{stats.recent}</h3>
                                    <p>Cette semaine</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-calendar-week"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="card mb-4">
                        <div className="card-header bg-primary">
                            <h3 className="card-title">Actions rapides</h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <Link
                                        href={route(
                                            "scolarite.resources.create"
                                        )}
                                        className="btn btn-success btn-block btn-lg"
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        Ajouter une ressource
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link
                                        href={route(
                                            "scolarite.resources.statistics"
                                        )}
                                        className="btn btn-info btn-block btn-lg"
                                    >
                                        <i className="fas fa-chart-bar mr-2"></i>
                                        Statistiques détaillées
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <button
                                        type="button"
                                        className="btn btn-warning btn-block btn-lg"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fas fa-print mr-2"></i>
                                        Imprimer la liste
                                    </button>
                                </div>
                                <div className="col-md-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-block btn-lg"
                                        onClick={() =>
                                            alert("Export en développement")
                                        }
                                    >
                                        <i className="fas fa-file-excel mr-2"></i>
                                        Exporter Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-filter mr-2"></i>
                                Filtres de recherche
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Recherche</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Titre, description..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            onKeyPress={(e) =>
                                                e.key === "Enter" &&
                                                handleSearch()
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            className="form-control"
                                            value={filterType}
                                            onChange={(e) =>
                                                setFilterType(e.target.value)
                                            }
                                        >
                                            <option value="">Tous</option>
                                            <option value="ancien_cc">
                                                Ancien CC
                                            </option>
                                            <option value="ancien_ds">
                                                Ancien DS
                                            </option>
                                            <option value="session_normale">
                                                Session Normale
                                            </option>
                                            <option value="session_rattrapage">
                                                Session Rattrapage
                                            </option>
                                            <option value="cours">Cours</option>
                                            <option value="td">TD</option>
                                            <option value="tp">TP</option>
                                            <option value="correction">
                                                Correction
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Classe</label>
                                        <select
                                            className="form-control"
                                            value={filterClass}
                                            onChange={(e) =>
                                                setFilterClass(e.target.value)
                                            }
                                        >
                                            <option value="">Toutes</option>
                                            {classes.map((cls) => (
                                                <option
                                                    key={cls.id}
                                                    value={cls.id}
                                                >
                                                    {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Matière</label>
                                        <select
                                            className="form-control"
                                            value={filterSubject}
                                            onChange={(e) =>
                                                setFilterSubject(e.target.value)
                                            }
                                        >
                                            <option value="">Toutes</option>
                                            {subjects.map((subject) => (
                                                <option
                                                    key={subject.id}
                                                    value={subject.id}
                                                >
                                                    {subject.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Année</label>
                                        <select
                                            className="form-control"
                                            value={filterYear}
                                            onChange={(e) =>
                                                setFilterYear(e.target.value)
                                            }
                                        >
                                            <option value="">Toutes</option>
                                            {academicYears.map((year) => (
                                                <option
                                                    key={year.id}
                                                    value={year.id}
                                                >
                                                    {year.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-1">
                                    <div className="form-group">
                                        <label>Statut</label>
                                        <select
                                            className="form-control"
                                            value={filterStatus}
                                            onChange={(e) =>
                                                setFilterStatus(e.target.value)
                                            }
                                        >
                                            <option value="">Tous</option>
                                            <option value="1">Actif</option>
                                            <option value="0">Inactif</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleSearch}
                                        >
                                            <i className="fas fa-search mr-1"></i>
                                            Rechercher
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={clearFilters}
                                        >
                                            <i className="fas fa-times mr-1"></i>
                                            Réinitialiser
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Liste des ressources */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                Liste des ressources ({resources.total})
                            </h3>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Ressource</th>
                                            <th>Type</th>
                                            <th>Classe/Matière</th>
                                            <th>Année</th>
                                            <th>Statistiques</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resources.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="text-center"
                                                >
                                                    Aucune ressource trouvée
                                                </td>
                                            </tr>
                                        ) : (
                                            resources.data.map((resource) => (
                                                <tr key={resource.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <i
                                                                className={`fas ${getFileIcon(
                                                                    resource.file_name
                                                                )} fa-2x mr-2`}
                                                            ></i>
                                                            <div>
                                                                <strong>
                                                                    {
                                                                        resource.title
                                                                    }
                                                                </strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {
                                                                        resource.file_name
                                                                    }
                                                                </small>
                                                                <br />
                                                                <small className="text-info">
                                                                    {
                                                                        resource.file_size_formatted
                                                                    }
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${getTypeBadge(
                                                                resource.type
                                                            )}`}
                                                        >
                                                            {getTypeLabel(
                                                                resource.type
                                                            )}
                                                        </span>
                                                        {resource.semester && (
                                                            <>
                                                                <br />
                                                                <span className="badge badge-info mt-1">
                                                                    {
                                                                        resource.semester
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {
                                                                resource
                                                                    .school_class
                                                                    .name
                                                            }
                                                        </strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {resource.course
                                                                ?.name ?? "—"}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        {
                                                            resource
                                                                .academic_year
                                                                .name
                                                        }
                                                    </td>
                                                    <td>
                                                        <i className="fas fa-eye text-info mr-1"></i>
                                                        {resource.views_count}
                                                        <br />
                                                        <i className="fas fa-download text-success mr-1"></i>
                                                        {
                                                            resource.downloads_count
                                                        }
                                                    </td>
                                                    <td>
                                                        <div className="custom-control custom-switch">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id={`status-${resource.id}`}
                                                                checked={
                                                                    resource.is_active
                                                                }
                                                                onChange={() =>
                                                                    toggleStatus(
                                                                        resource
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor={`status-${resource.id}`}
                                                            >
                                                                {resource.is_active
                                                                    ? "Actif"
                                                                    : "Inactif"}
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <Link
                                                                href={route(
                                                                    "scolarite.resources.show",
                                                                    resource.id
                                                                )}
                                                                className="btn btn-info"
                                                                title="Voir"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "scolarite.resources.edit",
                                                                    resource.id
                                                                )}
                                                                className="btn btn-warning"
                                                                title="Modifier"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <a
                                                                href={route(
                                                                    "scolarite.resources.download",
                                                                    resource.id
                                                                )}
                                                                className="btn btn-success"
                                                                title="Télécharger"
                                                                target="_blank"
                                                            >
                                                                <i className="fas fa-download"></i>
                                                            </a>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                title="Supprimer"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        resource
                                                                    )
                                                                }
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {resources.last_page > 1 && (
                            <div className="card-footer">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        Affichage de {resources.from} à{" "}
                                        {resources.to} sur {resources.total}{" "}
                                        résultats
                                    </div>
                                    <nav>
                                        <ul className="pagination pagination-sm mb-0">
                                            {resources.links.map(
                                                (link, index) => (
                                                    <li
                                                        key={index}
                                                        className={`page-item ${
                                                            link.active
                                                                ? "active"
                                                                : ""
                                                        } ${
                                                            !link.url
                                                                ? "disabled"
                                                                : ""
                                                        }`}
                                                    >
                                                        {link.url ? (
                                                            <Link
                                                                href={link.url}
                                                                className="page-link"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        ) : (
                                                            <span
                                                                className="page-link"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        )}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modal de suppression */}
            {showDeleteModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <i className="fas fa-exclamation-triangle text-warning mr-2"></i>
                                    Confirmer la suppression
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Êtes-vous sûr de vouloir supprimer la
                                    ressource{" "}
                                    <strong>{resourceToDelete?.title}</strong> ?
                                </p>
                                <p className="text-danger">
                                    <i className="fas fa-exclamation-circle mr-1"></i>
                                    Cette action est irréversible et supprimera
                                    également le fichier.
                                </p>
                            </div>
                            <div className="modal-footer justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-trash mr-1"></i>
                                            Supprimer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .small-box {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .table td {
                    vertical-align: middle;
                }
            `}</style>
        </AdminLayout>
    );
}
