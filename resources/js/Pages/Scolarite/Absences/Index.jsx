import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({
    attendances,
    stats,
    classes,
    subjects,
    filters,
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filterClass, setFilterClass] = useState(filters.class_id || "");
    const [filterSubject, setFilterSubject] = useState(filters.course_id || "");
    const [filterType, setFilterType] = useState(filters.type || "");
    const [filterDateFrom, setFilterDateFrom] = useState(
        filters.date_from || ""
    );
    const [filterDateTo, setFilterDateTo] = useState(filters.date_to || "");
    const [filterJustification, setFilterJustification] = useState(
        filters.justification_status || ""
    );

    const handleSearch = () => {
        router.get(
            route("scolarite.attendances.index"),
            {
                search: searchTerm,
                class_id: filterClass,
                course_id: filterSubject,
                type: filterType,
                date_from: filterDateFrom,
                date_to: filterDateTo,
                justification_status: filterJustification,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterClass("");
        setFilterSubject("");
        setFilterType("");
        setFilterDateFrom("");
        setFilterDateTo("");
        setFilterJustification("");
        router.get(route("scolarite.attendances.index"));
    };

    const getTypeBadge = (type) => {
        const badges = {
            presence: "badge-success",
            absence: "badge-danger",
            retard: "badge-warning",
            absence_justifiee: "badge-info",
        };
        return badges[type] || "badge-secondary";
    };

    const getTypeLabel = (type) => {
        const labels = {
            presence: "Présent",
            absence: "Absent",
            retard: "Retard",
            absence_justifiee: "Absence justifiée",
        };
        return labels[type] || type;
    };

    return (
        <AdminLayout title="Gestion des présences">
            <Head title="Présences et absences" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-calendar-check mr-2 text-primary"></i>
                                Gestion des présences
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
                                    Présences
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
                                    <p>Total enregistrements</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clipboard-list"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{stats.today_absences}</h3>
                                    <p>Absences aujourd'hui</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-user-times"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.today_delays}</h3>
                                    <p>Retards aujourd'hui</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-secondary">
                                <div className="inner">
                                    <h3>{stats.pending_justifications}</h3>
                                    <p>Justifications en attente</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-hourglass-half"></i>
                                </div>
                                <Link
                                    href={route(
                                        "scolarite.attendances.pending-justifications"
                                    )}
                                    className="small-box-footer"
                                >
                                    Voir les justifications{" "}
                                    <i className="fas fa-arrow-circle-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="card mb-4">
                        <div className="card-header bg-primary">
                            <h3 className="card-title">Actions rapides</h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <Link
                                        href={route(
                                            "scolarite.attendances.create"
                                        )}
                                        className="btn btn-success btn-block btn-lg"
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        Saisir présences
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link
                                        href={route(
                                            "scolarite.attendances.report-by-class"
                                        )}
                                        className="btn btn-info btn-block btn-lg"
                                    >
                                        <i className="fas fa-chart-bar mr-2"></i>
                                        Rapport par classe
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <Link
                                        href={route(
                                            "scolarite.attendances.pending-justifications"
                                        )}
                                        className="btn btn-warning btn-block btn-lg"
                                    >
                                        <i className="fas fa-tasks mr-2"></i>
                                        Justifications (
                                        {stats.pending_justifications})
                                    </Link>
                                </div>
                                <div className="col-md-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-block btn-lg"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fas fa-print mr-2"></i>
                                        Imprimer
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
                                        <label>Recherche étudiant</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nom, email..."
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
                                        <label>Type</label>
                                        <select
                                            className="form-control"
                                            value={filterType}
                                            onChange={(e) =>
                                                setFilterType(e.target.value)
                                            }
                                        >
                                            <option value="">Tous</option>
                                            <option value="presence">
                                                Présent
                                            </option>
                                            <option value="absence">
                                                Absent
                                            </option>
                                            <option value="retard">
                                                Retard
                                            </option>
                                            <option value="absence_justifiee">
                                                Absence justifiée
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Justification</label>
                                        <select
                                            className="form-control"
                                            value={filterJustification}
                                            onChange={(e) =>
                                                setFilterJustification(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">Toutes</option>
                                            <option value="pending">
                                                En attente
                                            </option>
                                            <option value="approved">
                                                Approuvée
                                            </option>
                                            <option value="rejected">
                                                Rejetée
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Date début</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={filterDateFrom}
                                            onChange={(e) =>
                                                setFilterDateFrom(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Date fin</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={filterDateTo}
                                            onChange={(e) =>
                                                setFilterDateTo(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 d-flex align-items-end">
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
                                                Réinitialiser
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Liste des présences */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                Liste des enregistrements
                            </h3>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Étudiant</th>
                                            <th>Classe</th>
                                            <th>Matière</th>
                                            <th>Statut</th>
                                            <th>Détails</th>
                                            <th>Justification</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendances.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="text-center"
                                                >
                                                    Aucun enregistrement trouvé
                                                </td>
                                            </tr>
                                        ) : (
                                            attendances.data.map(
                                                (attendance) => (
                                                    <tr key={attendance.id}>
                                                        <td>
                                                            <strong>
                                                                {new Date(
                                                                    attendance.date
                                                                ).toLocaleDateString(
                                                                    "fr-FR"
                                                                )}
                                                            </strong>
                                                            {attendance.time && (
                                                                <>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {new Date(
                                                                            attendance.time
                                                                        ).toLocaleTimeString(
                                                                            "fr-FR",
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            }
                                                                        )}
                                                                    </small>
                                                                </>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={
                                                                        attendance
                                                                            .student
                                                                            .photo_url ||
                                                                        "/images/default-avatar.png"
                                                                    }
                                                                    alt={
                                                                        attendance
                                                                            .student
                                                                            .name
                                                                    }
                                                                    className="img-circle mr-2"
                                                                    style={{
                                                                        width: "30px",
                                                                        height: "30px",
                                                                    }}
                                                                />
                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            attendance
                                                                                .student
                                                                                .name
                                                                        }
                                                                    </strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {
                                                                            attendance
                                                                                .student
                                                                                .email
                                                                        }
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {
                                                                attendance
                                                                    .school_class
                                                                    .name
                                                            }
                                                        </td>
                                                        <td>
                                                            {
                                                                attendance
                                                                    .course.name
                                                            }
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`badge ${getTypeBadge(
                                                                    attendance.type
                                                                )}`}
                                                            >
                                                                {getTypeLabel(
                                                                    attendance.type
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {attendance.type ===
                                                                "retard" &&
                                                                attendance.delay_minutes && (
                                                                    <small className="text-warning">
                                                                        <i className="fas fa-clock mr-1"></i>
                                                                        {
                                                                            attendance.delay_minutes
                                                                        }{" "}
                                                                        min
                                                                    </small>
                                                                )}
                                                            {attendance.notes && (
                                                                <>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {
                                                                            attendance.notes
                                                                        }
                                                                    </small>
                                                                </>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {attendance.justification_status && (
                                                                <span
                                                                    className={`badge ${
                                                                        attendance.justification_status ===
                                                                        "approved"
                                                                            ? "badge-success"
                                                                            : attendance.justification_status ===
                                                                              "rejected"
                                                                            ? "badge-danger"
                                                                            : "badge-warning"
                                                                    }`}
                                                                >
                                                                    {attendance.justification_status ===
                                                                    "approved"
                                                                        ? "Approuvée"
                                                                        : attendance.justification_status ===
                                                                          "rejected"
                                                                        ? "Rejetée"
                                                                        : "En attente"}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="btn-group btn-group-sm">
                                                                <Link
                                                                    href={route(
                                                                        "scolarite.attendances.show",
                                                                        attendance.id
                                                                    )}
                                                                    className="btn btn-info"
                                                                    title="Voir"
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </Link>
                                                                {attendance.justification_status ===
                                                                    "pending" && (
                                                                    <Link
                                                                        href={route(
                                                                            "scolarite.attendances.pending-justifications"
                                                                        )}
                                                                        className="btn btn-warning"
                                                                        title="Valider"
                                                                    >
                                                                        <i className="fas fa-check"></i>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {attendances.last_page > 1 && (
                            <div className="card-footer">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        Affichage de {attendances.from} à{" "}
                                        {attendances.to} sur {attendances.total}{" "}
                                        résultats
                                    </div>
                                    <nav>
                                        <ul className="pagination pagination-sm mb-0">
                                            {attendances.links.map(
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
        </AdminLayout>
    );
}
