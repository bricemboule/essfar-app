import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ teachers, filters, statistics, auth }) {
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "");

    // Fonction pour appliquer les filtres
    const applyFilters = () => {
        router.get(
            route(".index"),
            {
                search: searchTerm,
                specialite: selectedSpecialite,
                status: selectedStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Réinitialiser les filtres
    const clearFilters = () => {
        setSearchTerm("");
        selectedSpecialite("");
        setSelectedStatus("");
        router.get(
            route("academic.enseignants.index"),
            {},
            {
                preserveState: true,
            }
        );
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

    // Actions en lot
    const handleBulkAction = (action) => {
        if (selectedTeachers.length === 0) {
            alert("Veuillez sélectionner au moins un enseignant");
            return;
        }

        const message =
            action === "activate"
                ? "Voulez-vous activer ces enseignants ?"
                : "Voulez-vous désactiver ces enseignants ?";

        if (confirm(message)) {
            router.post(route("academic.enseignants.create"), {
                teacher_ids: selectedTeachers,
                action: action,
            });
        }
    };

    // Export des données
    const exportTeachers = () => {
        window.location.href = route("academic.enseignants.create", {
            department: selectedDepartment,
            status: selectedStatus,
            search: searchTerm,
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: "badge-success",
            inactive: "badge-secondary",
            on_leave: "badge-warning",
            terminated: "badge-danger",
        };

        const labels = {
            active: "Actif",
            inactive: "Inactif",
            on_leave: "En congé",
            terminated: "Terminé",
        };

        return (
            <span className={`badge ${badges[status] || "badge-secondary"}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getEmploymentTypeBadge = (type) => {
        const badges = {
            full_time: "badge-primary",
            part_time: "badge-info",
            contract: "badge-warning",
            vacation: "badge-secondary",
        };

        const labels = {
            full_time: "Temps plein",
            part_time: "Temps partiel",
            contract: "Contractuel",
            vacation: "Vacataire",
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
                                    <h3>{statistics.full_time_teachers}</h3>
                                    <p>Temps Plein</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{statistics.contracts_expiring}</h3>
                                    <p>Contrats à Renouveler</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <Link
                                    href={route("academic.enseignants.create", {
                                        expiring: 1,
                                    })}
                                    className="small-box-footer"
                                >
                                    Voir les détails{" "}
                                    <i className="fas fa-arrow-circle-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Actions principales */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="btn-group">
                                            <Link
                                                href={route(
                                                    "academic.enseignants.create"
                                                )}
                                                className="btn btn-success"
                                            >
                                                <i className="fas fa-plus mr-1"></i>
                                                Nouvel Enseignant
                                            </Link>
                                            <Link
                                                href={route(
                                                    "academic.enseignants.create"
                                                )}
                                                className="btn btn-info"
                                            >
                                                <i className="fas fa-file-contract mr-1"></i>
                                                Contrats
                                            </Link>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={exportTeachers}
                                            >
                                                <i className="fas fa-download mr-1"></i>
                                                Export
                                            </button>
                                        </div>

                                        <div className="btn-group">
                                            <button
                                                type="button"
                                                className={`btn btn-outline-primary ${
                                                    showFilters ? "active" : ""
                                                }`}
                                                onClick={() =>
                                                    setShowFilters(!showFilters)
                                                }
                                            >
                                                <i className="fas fa-filter mr-1"></i>
                                                Filtres
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Filtres */}
                                {showFilters && (
                                    <div className="card-body border-top">
                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Recherche</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Nom, email, ID..."
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            setSearchTerm(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Spécialité</label>
                                                    <select
                                                        className="form-control"
                                                        value={
                                                            selectedDepartment
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedDepartment(
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Toutes les
                                                            spécialités
                                                        </option>
                                                        {departments.map(
                                                            (dept) => (
                                                                <option
                                                                    key={
                                                                        dept.id
                                                                    }
                                                                    value={
                                                                        dept.id
                                                                    }
                                                                >
                                                                    {dept.name}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
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
                                                        <option value="active">
                                                            Actif
                                                        </option>
                                                        <option value="inactive">
                                                            Inactif
                                                        </option>
                                                        <option value="on_leave">
                                                            En congé
                                                        </option>
                                                        <option value="terminated">
                                                            Terminé
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>&nbsp;</label>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary mr-2"
                                                            onClick={
                                                                applyFilters
                                                            }
                                                        >
                                                            <i className="fas fa-search mr-1"></i>
                                                            Filtrer
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={
                                                                clearFilters
                                                            }
                                                        >
                                                            <i className="fas fa-times mr-1"></i>
                                                            Effacer
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions en lot */}
                    {selectedTeachers.length > 0 && (
                        <div className="row mb-3">
                            <div className="col-12">
                                <div className="alert alert-info">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>
                                            <strong>
                                                {selectedTeachers.length}
                                            </strong>{" "}
                                            enseignant(s) sélectionné(s)
                                        </span>
                                        <div className="btn-group">
                                            <button
                                                type="button"
                                                className="btn btn-success btn-sm"
                                                onClick={() =>
                                                    handleBulkAction("activate")
                                                }
                                            >
                                                <i className="fas fa-check mr-1"></i>
                                                Activer
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-warning btn-sm"
                                                onClick={() =>
                                                    handleBulkAction(
                                                        "deactivate"
                                                    )
                                                }
                                            >
                                                <i className="fas fa-pause mr-1"></i>
                                                Désactiver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Liste des enseignants */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        Liste des Enseignants (
                                        {teachers.data.length} résultat(s))
                                    </h3>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-hover">
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
                                                                    teachers
                                                                        .data
                                                                        .length >
                                                                        0
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
                                                    <th> Grade</th>
                                                    <th>Spécialité</th>
                                                    <th>Cours Assignés</th>
                                                    <th>Contrat</th>
                                                    <th>Statut</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teachers.data.length > 0 ? (
                                                    teachers.data.map(
                                                        (teacher) => (
                                                            <tr
                                                                key={teacher.id}
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
                                                                                teacher.profile_photo_url ||
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
                                                                                    teacher.email
                                                                                }
                                                                            </small>
                                                                            <br />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {
                                                                        teacher.grade
                                                                    }
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <div className="font-weight-bold">
                                                                            {teacher.specialite ||
                                                                                "Non assigné"}
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {getEmploymentTypeBadge(
                                                                                teacher.employment_type
                                                                            )}
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <span className="badge badge-primary">
                                                                            {teacher
                                                                                .assignments
                                                                                ?.length ||
                                                                                0}{" "}
                                                                            cours
                                                                        </span>
                                                                        {teacher.assignments &&
                                                                            teacher
                                                                                .assignments
                                                                                .length >
                                                                                0 && (
                                                                                <div className="mt-1">
                                                                                    {teacher.assignments
                                                                                        .slice(
                                                                                            0,
                                                                                            2
                                                                                        )
                                                                                        .map(
                                                                                            (
                                                                                                assignment,
                                                                                                index
                                                                                            ) => (
                                                                                                <small
                                                                                                    key={
                                                                                                        index
                                                                                                    }
                                                                                                    className="d-block text-muted"
                                                                                                >
                                                                                                    •{" "}
                                                                                                    {assignment
                                                                                                        .course
                                                                                                        ?.name ||
                                                                                                        "Cours"}
                                                                                                </small>
                                                                                            )
                                                                                        )}
                                                                                    {teacher
                                                                                        .assignments
                                                                                        .length >
                                                                                        2 && (
                                                                                        <small className="text-muted">
                                                                                            ...
                                                                                            et{" "}
                                                                                            {teacher
                                                                                                .assignments
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
                                                                    {teacher.contract ? (
                                                                        <div>
                                                                            <span className="badge badge-success">
                                                                                {
                                                                                    teacher
                                                                                        .contract
                                                                                        .contract_type
                                                                                }
                                                                            </span>
                                                                            <div className="mt-1">
                                                                                <small className="text-muted">
                                                                                    {
                                                                                        teacher
                                                                                            .contract
                                                                                            .contract_number
                                                                                    }
                                                                                </small>
                                                                                {teacher
                                                                                    .contract
                                                                                    .end_date && (
                                                                                    <div>
                                                                                        <small
                                                                                            className={
                                                                                                new Date(
                                                                                                    teacher.contract.end_date
                                                                                                ) <=
                                                                                                new Date(
                                                                                                    Date.now() +
                                                                                                        90 *
                                                                                                            24 *
                                                                                                            60 *
                                                                                                            60 *
                                                                                                            1000
                                                                                                )
                                                                                                    ? "text-warning font-weight-bold"
                                                                                                    : "text-muted"
                                                                                            }
                                                                                        >
                                                                                            Expire:{" "}
                                                                                            {new Date(
                                                                                                teacher.contract.end_date
                                                                                            ).toLocaleDateString()}
                                                                                        </small>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="badge badge-secondary">
                                                                            Pas
                                                                            de
                                                                            contrat
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {getStatusBadge(
                                                                        teacher.status
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group">
                                                                        <Link
                                                                            href={route(
                                                                                "academic.enseignants.show",
                                                                                teacher.id
                                                                            )}
                                                                            className="btn btn-info btn-sm"
                                                                            title="Voir les détails"
                                                                        >
                                                                            <i className="fas fa-eye"></i>
                                                                        </Link>
                                                                        <Link
                                                                            href={route(
                                                                                "academic.enseignants.edit",
                                                                                teacher.id
                                                                            )}
                                                                            className="btn btn-primary btn-sm"
                                                                            title="Modifier"
                                                                        >
                                                                            <i className="fas fa-edit"></i>
                                                                        </Link>
                                                                        {teacher.contract && (
                                                                            <a
                                                                                href={route(
                                                                                    "academic.enseignants.create",
                                                                                    teacher
                                                                                        .contract
                                                                                        .id
                                                                                )}
                                                                                className="btn btn-success btn-sm"
                                                                                title="Télécharger le contrat"
                                                                                target="_blank"
                                                                            >
                                                                                <i className="fas fa-file-pdf"></i>
                                                                            </a>
                                                                        )}
                                                                        <div className="btn-group dropleft">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-secondary btn-sm dropdown-toggle dropdown-toggle-split"
                                                                                data-toggle="dropdown"
                                                                            >
                                                                                <i className="fas fa-ellipsis-v"></i>
                                                                            </button>
                                                                            <div className="dropdown-menu">
                                                                                <Link
                                                                                    href={route(
                                                                                        "academic.enseignants.create",
                                                                                        teacher.id
                                                                                    )}
                                                                                    className="dropdown-item"
                                                                                >
                                                                                    <i className="fas fa-file-contract mr-2"></i>
                                                                                    Nouveau
                                                                                    contrat
                                                                                </Link>
                                                                                <div className="dropdown-divider"></div>
                                                                                <button
                                                                                    type="button"
                                                                                    className="dropdown-item text-warning"
                                                                                    onClick={() => {
                                                                                        if (
                                                                                            confirm(
                                                                                                "Voulez-vous suspendre cet enseignant ?"
                                                                                            )
                                                                                        ) {
                                                                                            router.patch(
                                                                                                route(
                                                                                                    "academic.enseignants.update",
                                                                                                    teacher.id
                                                                                                ),
                                                                                                {
                                                                                                    status: "inactive",
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <i className="fas fa-pause mr-2"></i>
                                                                                    Suspendre
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    className="dropdown-item text-danger"
                                                                                    onClick={() => {
                                                                                        if (
                                                                                            confirm(
                                                                                                "Êtes-vous sûr de vouloir supprimer cet enseignant ?"
                                                                                            )
                                                                                        ) {
                                                                                            router.delete(
                                                                                                route(
                                                                                                    "academic.enseignants.destroy",
                                                                                                    teacher.id
                                                                                                )
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <i className="fas fa-trash mr-2"></i>
                                                                                    Supprimer
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan="7"
                                                            className="text-center py-5"
                                                        >
                                                            <div className="text-muted">
                                                                <i className="fas fa-users fa-3x mb-3"></i>
                                                                <div>
                                                                    Aucun
                                                                    enseignant
                                                                    trouvé
                                                                </div>
                                                                <div className="mt-2">
                                                                    <Link
                                                                        href={route(
                                                                            "academic.enseignants.create"
                                                                        )}
                                                                        className="btn btn-primary"
                                                                    >
                                                                        <i className="fas fa-plus mr-1"></i>
                                                                        Créer le
                                                                        premier
                                                                        enseignant
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Pagination */}
                                {teachers.data.length > 0 && (
                                    <div className="card-footer clearfix">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="pagination-info">
                                                <small className="text-muted">
                                                    Affichage de {teachers.from}{" "}
                                                    à {teachers.to} sur{" "}
                                                    {teachers.total} enseignants
                                                </small>
                                            </div>
                                            <div className="pagination-links">
                                                {teachers.links &&
                                                    teachers.links.map(
                                                        (link, index) =>
                                                            link.url ? (
                                                                <Link
                                                                    key={index}
                                                                    href={
                                                                        link.url
                                                                    }
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
                    </div>
                </div>
            </section>
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
            `}</style>
        </AdminLayout>
    );
}
