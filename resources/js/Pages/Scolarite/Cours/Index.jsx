import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { Card, Alert } from "@/Components/UI/ProfessionalComponents";

export default function Index({ courses, academicYears, filters, auth }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filterYear, setFilterYear] = useState(
        filters.academic_year_id || ""
    );
    const [filterCredits, setFilterCredits] = useState(filters.credits || "");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const { delete: destroy, processing } = useForm();

    const handleSearch = () => {
        router.get(
            route("academic.courses.index"),
            {
                search: searchTerm,
                academic_year_id: filterYear,
                credits: filterCredits,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterYear("");
        setFilterCredits("");
        router.get(route("academic.courses.index"));
    };

    const handleDelete = (course) => {
        setCourseToDelete(course);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (courseToDelete) {
            destroy(route("academic.courses.destroy", courseToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setCourseToDelete(null);
                },
            });
        }
    };

    const handleDuplicate = (course) => {
        router.post(route("academic.courses.duplicate", course.id));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
        }).format(amount);
    };

    const getProgressColor = (progress) => {
        if (progress >= 90) return "bg-success";
        if (progress >= 75) return "bg-info";
        if (progress >= 50) return "bg-warning";
        return "bg-danger";
    };

    // Statistiques calculées
    const totalStatistics = courses.data.reduce(
        (acc, course) => ({
            courses: acc.courses + 1,
            credits: acc.credits + course.credits,
            hours: acc.hours + course.total_hours,
            cost: acc.cost + course.total_hours * course.hourly_rate,
            teachers: acc.teachers + course.teachers_count,
            classes: acc.classes + course.classes_count,
        }),
        { courses: 0, credits: 0, hours: 0, cost: 0, teachers: 0, classes: 0 }
    );

    const creditOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return (
        <AdminLayout title="Gestion des cours">
            <Head title="Cours" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-book mr-2 text-primary"></i>
                                Gestion des cours
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
                                    Cours
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
                        <div className="col-lg-2 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{courses.total}</h3>
                                    <p>Cours totaux</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-book"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{totalStatistics.credits}</h3>
                                    <p>Crédits totaux</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-medal"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{totalStatistics.hours}h</h3>
                                    <p>Volume horaire</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>
                                        {Math.round(
                                            totalStatistics.cost / 1000000
                                        )}
                                        M
                                    </h3>
                                    <p>Coût total (XAF)</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-money-bill"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-6">
                            <div className="small-box bg-purple">
                                <div className="inner">
                                    <h3>{totalStatistics.teachers}</h3>
                                    <p>Enseignants</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-chalkboard-teacher"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-6">
                            <div className="small-box bg-secondary">
                                <div className="inner">
                                    <h3>{totalStatistics.classes}</h3>
                                    <p>Classes</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-users"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres et recherche */}
                    <Card
                        title="Recherche et filtres"
                        icon="fas fa-filter"
                        className="mb-4"
                    >
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Recherche</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nom, code ou description..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
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
                                    <label>Année académique</label>
                                    <select
                                        className="form-control"
                                        value={filterYear}
                                        onChange={(e) =>
                                            setFilterYear(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Toutes les années
                                        </option>
                                        {academicYears.map((year) => (
                                            <option
                                                key={year.id}
                                                value={year.id}
                                            >
                                                {year.name}{" "}
                                                {year.is_active
                                                    ? "(Active)"
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Crédits</label>
                                    <select
                                        className="form-control"
                                        value={filterCredits}
                                        onChange={(e) =>
                                            setFilterCredits(e.target.value)
                                        }
                                    >
                                        <option value="">Tous</option>
                                        {creditOptions.map((credit) => (
                                            <option key={credit} value={credit}>
                                                {credit} crédit
                                                {credit > 1 ? "s" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <div className="form-group mb-0 w-100">
                                    <div className="btn-group w-100">
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
                                            Reset
                                        </button>
                                        <Link
                                            href={route(
                                                "academic.courses.create"
                                            )}
                                            className="btn btn-success"
                                        >
                                            <i className="fas fa-plus mr-1"></i>
                                            Nouveau
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Liste des cours */}
                    <Card title="Liste des cours" icon="fas fa-list">
                        {courses.data.length === 0 ? (
                            <Alert type="info">
                                {courses.total === 0
                                    ? "Aucun cours n'a été créé pour le moment."
                                    : "Aucun cours ne correspond aux critères de recherche."}
                            </Alert>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Cours</th>
                                            <th>Année académique</th>
                                            <th>Crédits/Heures</th>
                                            <th>Coût</th>
                                            <th>Enseignants</th>
                                            <th>Classes</th>
                                            <th>Progression</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.data.map((course) => {
                                            const totalCost =
                                                course.total_hours *
                                                course.hourly_rate;
                                            // Simulation du progrès (vous pouvez l'obtenir via une API)
                                            const progress = Math.floor(
                                                Math.random() * 100
                                            );

                                            return (
                                                <tr key={course.id}>
                                                    <td>
                                                        <div>
                                                            <strong>
                                                                {course.name}
                                                            </strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {course.code}
                                                            </small>
                                                            {course.description && (
                                                                <br />
                                                            )}
                                                            {course.description && (
                                                                <small className="text-info">
                                                                    {course
                                                                        .description
                                                                        .length >
                                                                    50
                                                                        ? course.description.substring(
                                                                              0,
                                                                              50
                                                                          ) +
                                                                          "..."
                                                                        : course.description}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            {
                                                                course
                                                                    .academic_year
                                                                    .name
                                                            }
                                                            {course
                                                                .academic_year
                                                                .is_active && (
                                                                <span className="badge badge-success ml-1">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="text-center">
                                                            <span className="badge badge-info d-block mb-1">
                                                                {course.credits}{" "}
                                                                crédit
                                                                {course.credits >
                                                                1
                                                                    ? "s"
                                                                    : ""}
                                                            </span>
                                                            <span className="badge badge-warning">
                                                                {
                                                                    course.total_hours
                                                                }
                                                                h
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>
                                                                {formatCurrency(
                                                                    totalCost
                                                                )}
                                                            </strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {formatCurrency(
                                                                    course.hourly_rate
                                                                )}
                                                                /h
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <span className="badge badge-primary mr-1">
                                                                {
                                                                    course.teachers_count
                                                                }
                                                            </span>
                                                            {course.teachers_count >
                                                                0 && (
                                                                <Link
                                                                    href={route(
                                                                        "academic.courses.show",
                                                                        course.id
                                                                    )}
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    title="Voir les enseignants"
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <span className="badge badge-secondary mr-1">
                                                                {
                                                                    course.classes_count
                                                                }
                                                            </span>
                                                            {course.classes_count >
                                                                0 && (
                                                                <Link
                                                                    href={route(
                                                                        "academic.courses.show",
                                                                        course.id
                                                                    )}
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    title="Voir les classes"
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div
                                                                className="progress mb-1"
                                                                style={{
                                                                    height: "15px",
                                                                }}
                                                            >
                                                                <div
                                                                    className={`progress-bar ${getProgressColor(
                                                                        progress
                                                                    )}`}
                                                                    style={{
                                                                        width: `${progress}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <small className="text-muted">
                                                                {progress}%
                                                                terminé
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <Link
                                                                href={route(
                                                                    "academic.courses.show",
                                                                    course.id
                                                                )}
                                                                className="btn btn-info"
                                                                title="Voir les détails"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "academic.courses.edit",
                                                                    course.id
                                                                )}
                                                                className="btn btn-warning"
                                                                title="Modifier"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary"
                                                                title="Dupliquer"
                                                                onClick={() =>
                                                                    handleDuplicate(
                                                                        course
                                                                    )
                                                                }
                                                            >
                                                                <i className="fas fa-copy"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                title="Supprimer"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        course
                                                                    )
                                                                }
                                                                disabled={
                                                                    course.schedules_count >
                                                                    0
                                                                }
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {courses.last_page > 1 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    Affichage de {courses.from} à {courses.to}{" "}
                                    sur {courses.total} résultats
                                </div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        {courses.links.map((link, index) => (
                                            <li
                                                key={index}
                                                className={`page-item ${
                                                    link.active ? "active" : ""
                                                } ${
                                                    !link.url ? "disabled" : ""
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
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </Card>
                </div>
            </section>

            {/* Modal de confirmation de suppression */}
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
                                    Êtes-vous sûr de vouloir supprimer le cours{" "}
                                    <strong>{courseToDelete?.name}</strong> ?
                                </p>
                                <p className="text-muted">
                                    Cette action est irréversible. Tous les
                                    emplois du temps associés seront également
                                    supprimés.
                                </p>

                                {courseToDelete?.schedules_count > 0 && (
                                    <Alert type="danger">
                                        Ce cours contient{" "}
                                        {courseToDelete.schedules_count}{" "}
                                        emploi(s) du temps. Vous devez d'abord
                                        les supprimer avant de pouvoir supprimer
                                        le cours.
                                    </Alert>
                                )}

                                {courseToDelete &&
                                    courseToDelete.schedules_count === 0 && (
                                        <div className="mt-3">
                                            <h6>Données à supprimer :</h6>
                                            <ul>
                                                <li>
                                                    {
                                                        courseToDelete.teachers_count
                                                    }{" "}
                                                    enseignant(s) assigné(s)
                                                </li>
                                                <li>
                                                    {
                                                        courseToDelete.classes_count
                                                    }{" "}
                                                    classe(s) assignée(s)
                                                </li>
                                                <li>
                                                    Toutes les données liées au
                                                    cours
                                                </li>
                                            </ul>
                                        </div>
                                    )}
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
                                    disabled={
                                        processing ||
                                        courseToDelete?.schedules_count > 0
                                    }
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-trash mr-1"></i>
                                            Supprimer définitivement
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

                .badge {
                    font-size: 0.75em;
                }

                .progress {
                    border-radius: 10px;
                }

                .progress-bar {
                    border-radius: 10px;
                }

                .modal.show {
                    display: block !important;
                }

                .bg-purple {
                    background-color: #6f42c1 !important;
                }

                .btn-group .btn {
                    border-radius: 0;
                }

                .btn-group .btn:first-child {
                    border-top-left-radius: 0.25rem;
                    border-bottom-left-radius: 0.25rem;
                }

                .btn-group .btn:last-child {
                    border-top-right-radius: 0.25rem;
                    border-bottom-right-radius: 0.25rem;
                }
            `}</style>
        </AdminLayout>
    );
}
