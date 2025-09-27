import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Card, Alert } from "@/Components/UI/Composant";

export default function Index({ academicYears, auth }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [yearToDelete, setYearToDelete] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");

    const { delete: destroy, processing } = useForm();

    const filteredYears = academicYears.data.filter((year) => {
        const matchesSearch = year.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && year.is_active) ||
            (filterStatus === "inactive" && !year.is_active);

        return matchesSearch && matchesStatus;
    });

    const handleDelete = (year) => {
        setYearToDelete(year);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (yearToDelete) {
            destroy(route("academic.years.destroy", yearToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setYearToDelete(null);
                },
            });
        }
    };

    const getStatusBadge = (year) => {
        if (year.is_active) {
            return <span className="badge badge-success">Active</span>;
        }

        const today = new Date();
        const endDate = new Date(year.end_date);
        const startDate = new Date(year.start_date);

        if (endDate < today) {
            return <span className="badge badge-secondary">Terminée</span>;
        } else if (startDate > today) {
            return <span className="badge badge-info">À venir</span>;
        } else {
            return <span className="badge badge-warning">En cours</span>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.round(diffDays / 30);
        return `${diffMonths} mois`;
    };

    const totalStatistics = academicYears.data.reduce(
        (acc, year) => ({
            classes: acc.classes + year.classes_count,
            courses: acc.courses + year.courses_count,
            schedules: acc.schedules + year.schedules_count,
        }),
        { classes: 0, courses: 0, schedules: 0 }
    );

    const activeYear = academicYears.data.find((year) => year.is_active);

    return (
        <AdminLayout title="Gestion des années académiques">
            <Head title="Années académiques" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                                Années académiques
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
                                    Années académiques
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Année active en cours */}
                    {activeYear && (
                        <Alert type="info" className="mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <i className="fas fa-star mr-2"></i>
                                    <strong>
                                        Année académique active :
                                    </strong>{" "}
                                    {activeYear.name}
                                    <span className="ml-2 text-muted">
                                        ({formatDate(activeYear.start_date)} -{" "}
                                        {formatDate(activeYear.end_date)})
                                    </span>
                                </div>
                                <Link
                                    href={route(
                                        "academic.years.show",
                                        activeYear.id
                                    )}
                                    className="btn btn-sm btn-outline-info"
                                >
                                    <i className="fas fa-eye mr-1"></i>
                                    Voir détails
                                </Link>
                            </div>
                        </Alert>
                    )}

                    {/* Statistiques globales */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{academicYears.total}</h3>
                                    <p>Années académiques</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-calendar-alt"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{totalStatistics.classes}</h3>
                                    <p>Classes totales</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-school"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{totalStatistics.courses}</h3>
                                    <p>Cours programmés</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-book"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{totalStatistics.schedules}</h3>
                                    <p>Emplois du temps</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-calendar-check"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres et actions */}
                    <Card
                        title="Recherche et actions"
                        icon="fas fa-filter"
                        className="mb-4"
                    >
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Recherche</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">
                                                <i className="fas fa-search"></i>
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nom de l'année..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Statut</label>
                                    <select
                                        className="form-control"
                                        value={filterStatus}
                                        onChange={(e) =>
                                            setFilterStatus(e.target.value)
                                        }
                                    >
                                        <option value="all">Toutes</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">
                                            Inactives
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-5 d-flex align-items-end">
                                <div className="form-group mb-0 w-100">
                                    <div className="btn-group w-100">
                                        <Link
                                            href={route(
                                                "academic.years.create"
                                            )}
                                            className="btn btn-primary"
                                        >
                                            <i className="fas fa-plus mr-1"></i>
                                            Nouvelle année
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setFilterStatus("all");
                                            }}
                                        >
                                            <i className="fas fa-refresh mr-1"></i>
                                            Réinitialiser
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Liste des années académiques */}
                    <Card
                        title="Liste des années académiques"
                        icon="fas fa-list"
                    >
                        {filteredYears.length === 0 ? (
                            <Alert type="info">
                                {academicYears.data.length === 0
                                    ? "Aucune année académique n'a été créée pour le moment."
                                    : "Aucune année académique ne correspond aux critères de recherche."}
                            </Alert>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Année académique</th>
                                            <th>Période</th>
                                            <th>Durée</th>
                                            <th>Statut</th>
                                            <th>Classes</th>
                                            <th>Cours</th>
                                            <th>Emplois du temps</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredYears.map((year) => (
                                            <tr
                                                key={year.id}
                                                className={
                                                    year.is_active
                                                        ? "table-success"
                                                        : ""
                                                }
                                            >
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {year.is_active && (
                                                            <i
                                                                className="fas fa-star text-warning mr-2"
                                                                title="Année active"
                                                            ></i>
                                                        )}
                                                        <div>
                                                            <strong>
                                                                {year.name}
                                                            </strong>
                                                            {year.is_active && (
                                                                <span className="badge badge-success ml-2">
                                                                    ACTIVE
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <small className="text-muted d-block">
                                                            Début :
                                                        </small>
                                                        {formatDate(
                                                            year.start_date
                                                        )}
                                                        <br />
                                                        <small className="text-muted d-block">
                                                            Fin :
                                                        </small>
                                                        {formatDate(
                                                            year.end_date
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-info">
                                                        {getDuration(
                                                            year.start_date,
                                                            year.end_date
                                                        )}
                                                    </span>
                                                </td>
                                                <td>{getStatusBadge(year)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="badge badge-primary mr-1">
                                                            {year.classes_count}
                                                        </span>
                                                        {year.classes_count >
                                                            0 && (
                                                            <Link
                                                                href={route(
                                                                    "academic.classes.index",
                                                                    {
                                                                        academic_year_id:
                                                                            year.id,
                                                                    }
                                                                )}
                                                                className="btn btn-sm btn-outline-primary"
                                                                title="Voir les classes"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="badge badge-warning mr-1">
                                                            {year.courses_count}
                                                        </span>
                                                        {year.courses_count >
                                                            0 && (
                                                            <Link
                                                                href={route(
                                                                    "academic.courses.index",
                                                                    {
                                                                        academic_year_id:
                                                                            year.id,
                                                                    }
                                                                )}
                                                                className="btn btn-sm btn-outline-warning"
                                                                title="Voir les cours"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="badge badge-danger mr-1">
                                                            {
                                                                year.schedules_count
                                                            }
                                                        </span>
                                                        {year.schedules_count >
                                                            0 && (
                                                            <Link
                                                                href={route(
                                                                    "academic.schedules.index",
                                                                    {
                                                                        academic_year_id:
                                                                            year.id,
                                                                    }
                                                                )}
                                                                className="btn btn-sm btn-outline-danger"
                                                                title="Voir les emplois du temps"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <Link
                                                            href={route(
                                                                "academic.years.show",
                                                                year.id
                                                            )}
                                                            className="btn btn-info"
                                                            title="Voir les détails"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                "academic.years.edit",
                                                                year.id
                                                            )}
                                                            className="btn btn-warning"
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
                                                                    year
                                                                )
                                                            }
                                                            disabled={
                                                                year.is_active ||
                                                                year.schedules_count >
                                                                    0
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

                        {/* Pagination */}
                        {academicYears.last_page > 1 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    Affichage de {academicYears.from} à{" "}
                                    {academicYears.to} sur {academicYears.total}{" "}
                                    résultats
                                </div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        {academicYears.links.map(
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
                                    Êtes-vous sûr de vouloir supprimer l'année
                                    académique{" "}
                                    <strong>{yearToDelete?.name}</strong> ?
                                </p>
                                <p className="text-muted">
                                    Cette action est irréversible. Toutes les
                                    données associées (classes, cours, emplois
                                    du temps) seront également supprimées.
                                </p>

                                {yearToDelete?.is_active && (
                                    <Alert type="danger">
                                        Cette année académique est actuellement
                                        active. Vous ne pouvez pas la supprimer.
                                    </Alert>
                                )}

                                {yearToDelete?.schedules_count > 0 && (
                                    <Alert type="warning">
                                        Cette année contient{" "}
                                        {yearToDelete.schedules_count} emploi(s)
                                        du temps. Vous devez d'abord les
                                        supprimer.
                                    </Alert>
                                )}

                                {yearToDelete &&
                                    !yearToDelete.is_active &&
                                    yearToDelete.schedules_count === 0 && (
                                        <div className="mt-3">
                                            <h6>Données à supprimer :</h6>
                                            <ul>
                                                <li>
                                                    {yearToDelete.classes_count}{" "}
                                                    classe(s)
                                                </li>
                                                <li>
                                                    {yearToDelete.courses_count}{" "}
                                                    cours
                                                </li>
                                                <li>
                                                    Tous les emplois du temps
                                                    associés
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
                                        yearToDelete?.is_active ||
                                        yearToDelete?.schedules_count > 0
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

            <style jsx>{`
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

                .table-success {
                    background-color: rgba(40, 167, 69, 0.1) !important;
                }

                .modal.show {
                    display: block !important;
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
