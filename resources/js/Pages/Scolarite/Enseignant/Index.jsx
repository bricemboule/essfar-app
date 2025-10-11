import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ teachers, filters, statistics, auth }) {
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedSpecialite, setSelectedSpecialite] = useState(
        filters.specialite || ""
    );
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkAction, setBulkAction] = useState("");
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState("excel");

    // Fonction pour appliquer les filtres
    const handleSearch = () => {
        router.get(
            route("academic.enseignants.index"),
            {
                search: searchTerm,
                specialite: selectedSpecialite,
                status: selectedStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    // Réinitialiser les filtres
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedSpecialite("");
        setSelectedStatus("");
        router.get(route("academic.enseignants.index"));
    };

    // Sélection multiple
    const toggleTeacherSelection = (teacherId) => {
        setSelectedTeachers((prev) =>
            prev.includes(teacherId)
                ? prev.filter((id) => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    const toggleSelectAll = () => {
        setSelectedTeachers(
            selectedTeachers.length === teachers.data.length
                ? []
                : teachers.data.map((teacher) => teacher.id)
        );
    };

    // Suppression
    const handleDelete = (teacher) => {
        setTeacherToDelete(teacher);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (teacherToDelete) {
            router.delete(
                route("academic.enseignants.destroy", teacherToDelete.id),
                {
                    onSuccess: () => {
                        setShowDeleteModal(false);
                        setTeacherToDelete(null);
                    },
                }
            );
        }
    };

    // Actions en lot
    const handleBulkAction = () => {
        if (selectedTeachers.length === 0) {
            alert("Veuillez sélectionner au moins un enseignant");
            return;
        }
        setShowBulkModal(true);
    };

    const confirmBulkAction = () => {
        if (!bulkAction) {
            alert("Veuillez sélectionner une action");
            return;
        }

        router.post(
            route("academic.enseignants.bulk-action"),
            {
                action: bulkAction,
                teacher_ids: selectedTeachers,
            },
            {
                onSuccess: () => {
                    setShowBulkModal(false);
                    setSelectedTeachers([]);
                    setBulkAction("");
                },
            }
        );
    };

    // Export des données
    const handleExport = () => {
        const params = new URLSearchParams({
            format: exportFormat,
            search: searchTerm,
            specialite: selectedSpecialite,
            status: selectedStatus,
        });

        if (selectedTeachers.length > 0) {
            params.append("teacher_ids", selectedTeachers.join(","));
        }

        window.open(
            `${route("academic.enseignants.export")}?${params.toString()}`
        );
        setShowExportModal(false);
    };

    const getStatusBadge = (status) => {
        const badges = {
            actif: "badge-success",
            inactif: "badge-secondary",
            conge: "badge-warning",
        };

        const labels = {
            actif: "Actif",
            inactif: "Inactif",
            conge: "En congé",
        };

        return (
            <span className={`badge ${badges[status] || "badge-secondary"}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getContractTypeBadge = (type) => {
        const badges = {
            horaire: "badge-info",
            projet: "badge-primary",
        };

        const labels = {
            horaire: "Horaire",
            projet: "Projet",
        };

        return (
            <span className={`badge ${badges[type] || "badge-secondary"}`}>
                {labels[type] || type}
            </span>
        );
    };

    return (
        <AdminLayout title="Gestion des Enseignants">
            <Head title="Enseignants" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-chalkboard-teacher mr-2 text-primary"></i>
                                Gestion des Enseignants
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("admin.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Enseignants
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
                                    <h3>{statistics.total_teachers}</h3>
                                    <p>Total Enseignants</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-users"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{statistics.active_teachers}</h3>
                                    <p>Enseignants Actifs</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-user-check"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-primary">
                                <div className="inner">
                                    <h3>
                                        {statistics.teachers_with_contracts ||
                                            0}
                                    </h3>
                                    <p>Avec Contrats</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-file-contract"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>
                                        {statistics.contracts_expiring || 0}
                                    </h3>
                                    <p>Contrats à Renouveler</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions principales */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-tools mr-2"></i>
                                Actions principales
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <Link
                                        href={route(
                                            "academic.enseignants.create"
                                        )}
                                        className="btn btn-success btn-block btn-lg"
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        Nouvel Enseignant
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link
                                        href={route(
                                            "academic.enseignants.index"
                                        )}
                                        className="btn btn-info btn-block btn-lg"
                                    >
                                        <i className="fas fa-file-contract mr-2"></i>
                                        Gestion des Contrats
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link
                                        href={route(
                                            "academic.enseignants.index"
                                        )}
                                        className="btn btn-primary btn-block btn-lg"
                                    >
                                        <i className="fas fa-chart-bar mr-2"></i>
                                        Statistiques
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <button
                                        type="button"
                                        className="btn btn-warning btn-block btn-lg"
                                        onClick={() => setShowExportModal(true)}
                                    >
                                        <i className="fas fa-download mr-2"></i>
                                        Exporter la liste
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres et recherche */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <div className="d-flex justify-content-between align-items-center">
                                <h3 className="card-title">
                                    <i className="fas fa-filter mr-2"></i>
                                    Recherche et filtres
                                </h3>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${
                                        showFilters
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                    }`}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <i className="fas fa-filter mr-1"></i>
                                    {showFilters ? "Masquer" : "Afficher"} les
                                    filtres
                                </button>
                            </div>
                        </div>
                        {showFilters && (
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label>Recherche</label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nom, email, matricule..."
                                                    value={searchTerm}
                                                    onChange={(e) =>
                                                        setSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyPress={(e) =>
                                                        e.key === "Enter" &&
                                                        handleSearch()
                                                    }
                                                />
                                                <div className="input-group-append">
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={handleSearch}
                                                    >
                                                        <i className="fas fa-search"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Spécialité</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Filtrer par spécialité..."
                                                value={selectedSpecialite}
                                                onChange={(e) =>
                                                    setSelectedSpecialite(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Statut</label>
                                            <select
                                                className="form-control"
                                                value={selectedStatus}
                                                onChange={(e) =>
                                                    setSelectedStatus(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Tous les statuts
                                                </option>
                                                <option value="actif">
                                                    Actif
                                                </option>
                                                <option value="inactif">
                                                    Inactif
                                                </option>
                                                <option value="conge">
                                                    En congé
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <div className="form-group mb-0 w-100">
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-block"
                                                onClick={handleSearch}
                                            >
                                                <i className="fas fa-search mr-1"></i>
                                                Rechercher
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={clearFilters}
                                        >
                                            <i className="fas fa-times mr-1"></i>
                                            Réinitialiser les filtres
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions en lot */}
                    {selectedTeachers.length > 0 && (
                        <div className="alert alert-info mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>{selectedTeachers.length}</strong>{" "}
                                    enseignant(s) sélectionné(s)
                                </span>
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        onClick={handleBulkAction}
                                    >
                                        <i className="fas fa-edit mr-1"></i>
                                        Actions groupées
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-warning btn-sm"
                                        onClick={() => setShowExportModal(true)}
                                    >
                                        <i className="fas fa-download mr-1"></i>
                                        Exporter la sélection
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Liste des enseignants */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                Liste des Enseignants ({teachers.data.length}{" "}
                                résultat(s))
                            </h3>
                        </div>
                        <div className="card-body p-0">
                            {teachers.data.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                                    <div className="text-muted">
                                        {teachers.total === 0
                                            ? "Aucun enseignant n'est enregistré pour le moment."
                                            : "Aucun enseignant ne correspond aux critères de recherche."}
                                    </div>
                                    <div className="mt-3">
                                        <Link
                                            href={route(
                                                "academic.enseignants.create"
                                            )}
                                            className="btn btn-primary"
                                        >
                                            <i className="fas fa-plus mr-1"></i>
                                            Créer le premier enseignant
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped">
                                        <thead>
                                            <tr>
                                                <th width="40">
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            id="select-all"
                                                            checked={
                                                                selectedTeachers.length ===
                                                                    teachers
                                                                        .data
                                                                        .length &&
                                                                teachers.data
                                                                    .length > 0
                                                            }
                                                            onChange={
                                                                toggleSelectAll
                                                            }
                                                        />
                                                        <label
                                                            className="custom-control-label"
                                                            htmlFor="select-all"
                                                        ></label>
                                                    </div>
                                                </th>
                                                <th>Enseignant</th>
                                                <th>Grade</th>
                                                <th>Spécialité</th>
                                                <th>Cours Assignés</th>
                                                <th>Contact</th>
                                                <th>Statut</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teachers.data.map((teacher) => (
                                                <tr
                                                    key={teacher.id}
                                                    className={
                                                        selectedTeachers.includes(
                                                            teacher.id
                                                        )
                                                            ? "table-active"
                                                            : ""
                                                    }
                                                >
                                                    <td>
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id={`teacher-${teacher.id}`}
                                                                checked={selectedTeachers.includes(
                                                                    teacher.id
                                                                )}
                                                                onChange={() =>
                                                                    toggleTeacherSelection(
                                                                        teacher.id
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor={`teacher-${teacher.id}`}
                                                            ></label>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={
                                                                    teacher.photo_url ||
                                                                    "/images/default-avatar.png"
                                                                }
                                                                alt={
                                                                    teacher.name
                                                                }
                                                                className="img-circle mr-3"
                                                                width="40"
                                                                height="40"
                                                            />
                                                            <div>
                                                                <div className="font-weight-bold">
                                                                    {
                                                                        teacher.name
                                                                    }
                                                                </div>
                                                                <small className="text-muted">
                                                                    {
                                                                        teacher.matricule
                                                                    }
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-secondary">
                                                            {teacher.grade ||
                                                                "Non défini"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            {teacher.specialite ||
                                                                "Non assigné"}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <span className="badge badge-primary">
                                                                {teacher
                                                                    .teacher_courses
                                                                    ?.length ||
                                                                    0}{" "}
                                                                cours
                                                            </span>
                                                            {teacher.teacher_courses &&
                                                                teacher
                                                                    .teacher_courses
                                                                    .length >
                                                                    0 && (
                                                                    <div className="mt-1">
                                                                        {teacher.teacher_courses
                                                                            .slice(
                                                                                0,
                                                                                2
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    course,
                                                                                    index
                                                                                ) => (
                                                                                    <small
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="d-block text-muted"
                                                                                    >
                                                                                        •{" "}
                                                                                        {
                                                                                            course.name
                                                                                        }
                                                                                    </small>
                                                                                )
                                                                            )}
                                                                        {teacher
                                                                            .teacher_courses
                                                                            .length >
                                                                            2 && (
                                                                            <small className="text-muted">
                                                                                ...
                                                                                et{" "}
                                                                                {teacher
                                                                                    .teacher_courses
                                                                                    .length -
                                                                                    2}{" "}
                                                                                autre(s)
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <small className="d-block">
                                                                {teacher.email}
                                                            </small>
                                                            {teacher.telephone && (
                                                                <small className="text-muted">
                                                                    {
                                                                        teacher.telephone
                                                                    }
                                                                </small>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(
                                                            teacher.statut
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <Link
                                                                href={route(
                                                                    "academic.enseignants.show",
                                                                    teacher.id
                                                                )}
                                                                className="btn btn-info"
                                                                title="Voir les détails"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "academic.enseignants.edit",
                                                                    teacher.id
                                                                )}
                                                                className="btn btn-primary"
                                                                title="Modifier"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                title="Supprimer"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        teacher
                                                                    )
                                                                }
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {teachers.last_page > 1 && (
                            <div className="card-footer clearfix">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="pagination-info">
                                        <small className="text-muted">
                                            Affichage de {teachers.from} à{" "}
                                            {teachers.to} sur {teachers.total}{" "}
                                            enseignants
                                        </small>
                                    </div>
                                    <div className="pagination-links">
                                        {teachers.links &&
                                            teachers.links.map((link, index) =>
                                                link.url ? (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        className={`btn btn-sm mr-1 ${
                                                            link.active
                                                                ? "btn-primary"
                                                                : "btn-outline-primary"
                                                        }`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                        preserveState
                                                    />
                                                ) : (
                                                    <span
                                                        key={index}
                                                        className="btn btn-sm btn-outline-secondary mr-1 disabled"
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                )
                                            )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modal d'export */}
            {showExportModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <i className="fas fa-download mr-2"></i>
                                    Exporter la liste des enseignants
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowExportModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Format d'export</label>
                                    <select
                                        className="form-control"
                                        value={exportFormat}
                                        onChange={(e) =>
                                            setExportFormat(e.target.value)
                                        }
                                    >
                                        <option value="excel">
                                            Excel (.xlsx)
                                        </option>
                                        <option value="csv">CSV</option>
                                        <option value="pdf">PDF</option>
                                    </select>
                                </div>

                                <div className="alert alert-info">
                                    <h6>
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Informations incluses :
                                    </h6>
                                    <ul className="mb-0 small">
                                        <li>
                                            Informations personnelles (nom,
                                            email, téléphone)
                                        </li>
                                        <li>
                                            Données professionnelles (grade,
                                            spécialité, matricule)
                                        </li>
                                        <li>Cours assignés</li>
                                        <li>Statut et date d'embauche</li>
                                        {selectedTeachers.length > 0 && (
                                            <li>
                                                <strong>
                                                    Seuls les enseignants
                                                    sélectionnés seront exportés
                                                </strong>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            <div className="modal-footer justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowExportModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleExport}
                                >
                                    <i className="fas fa-download mr-1"></i>
                                    Exporter (
                                    {selectedTeachers.length > 0
                                        ? selectedTeachers.length
                                        : teachers.total}{" "}
                                    enseignants)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    Êtes-vous sûr de vouloir supprimer
                                    l'enseignant{" "}
                                    <strong>{teacherToDelete?.name}</strong> ?
                                </p>
                                <p className="text-muted">
                                    Cette action désactivera l'enseignant et
                                    toutes ses assignations.
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
                                >
                                    <i className="fas fa-trash mr-1"></i>
                                    Supprimer définitivement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'actions groupées */}
            {showBulkModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <i className="fas fa-users mr-2"></i>
                                    Actions groupées
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowBulkModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Sélectionnez l'action à appliquer aux{" "}
                                    {selectedTeachers.length} enseignant(s)
                                    sélectionné(s) :
                                </p>
                                <div className="form-group">
                                    <label>Action à effectuer</label>
                                    <select
                                        className="form-control"
                                        value={bulkAction}
                                        onChange={(e) =>
                                            setBulkAction(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            -- Choisir une action --
                                        </option>
                                        <option value="activate">
                                            Activer
                                        </option>
                                        <option value="deactivate">
                                            Désactiver
                                        </option>
                                        <option value="set_on_leave">
                                            Mettre en congé
                                        </option>
                                        <option value="assign_courses">
                                            Assigner des cours
                                        </option>
                                        <option value="export">
                                            Exporter la sélection
                                        </option>
                                    </select>
                                </div>

                                {bulkAction === "assign_courses" && (
                                    <div className="alert alert-info">
                                        <small>
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Vous serez redirigé vers la page
                                            d'assignation de cours pour les
                                            enseignants sélectionnés.
                                        </small>
                                    </div>
                                )}

                                {bulkAction === "set_on_leave" && (
                                    <div className="form-group mt-3">
                                        <label>Date de début du congé</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                        />
                                    </div>
                                )}

                                {(bulkAction === "activate" ||
                                    bulkAction === "deactivate") && (
                                    <div className="alert alert-warning mt-3">
                                        <small>
                                            <i className="fas fa-exclamation-triangle mr-1"></i>
                                            Cette action modifiera le statut de
                                            tous les enseignants sélectionnés.
                                        </small>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowBulkModal(false);
                                        setBulkAction("");
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={confirmBulkAction}
                                    disabled={!bulkAction}
                                >
                                    <i className="fas fa-check mr-1"></i>
                                    Appliquer l'action
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

                .img-circle {
                    border-radius: 50%;
                    object-fit: cover;
                }

                .modal.show {
                    display: block !important;
                }

                .table-active {
                    background-color: rgba(0, 123, 255, 0.075);
                }

                .btn-lg {
                    font-size: 1rem;
                    padding: 0.75rem 1.25rem;
                }

                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }

                .card {
                    box-shadow: 0 0 1px rgba(0,0,0,.125), 0 1px 3px rgba(0,0,0,.2);
                    margin-bottom: 1rem;
                }

                .card-header {
                    background-color: transparent;
                    border-bottom: 1px solid rgba(0,0,0,.125);
                }

                .btn-group-sm > .btn {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.875rem;
                }

                .custom-control-label::before,
                .custom-control-label::after {
                    top: 0.125rem;
                }

                .alert {
                    border-radius: 0.25rem;
                }

                .badge {
                    font-weight: 500;
                    padding: 0.25rem 0.5rem;
                }

                .pagination-links .btn {
                    min-width: 35px;
                }

                .form-control:focus {
                    border-color: #007bff;
                    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
                }

                .input-group-append .btn:focus {
                    z-index: 3;
                }

                .modal-backdrop {
                    background-color: rgba(0, 0, 0, 0.5);
                }

                .modal-content {
                    border-radius: 0.5rem;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                }

                .modal-header {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                }

                .modal-footer {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }

                @media (max-width: 768px) {
                    .btn-lg {
                        font-size: 0.9rem;
                        padding: 0.5rem 1rem;
                    }

                    .small-box h3 {
                        font-size: 1.5rem;
                    }

                    .table-responsive {
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
