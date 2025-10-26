import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({
    attendances,
    stats,
    unjustifiedAbsences,
    subjects,
    filters,
}) {
    const [filterType, setFilterType] = useState(filters.type || "");
    const [filterSubject, setFilterSubject] = useState(
        filters.subject_id || ""
    );
    const [filterMonth, setFilterMonth] = useState(filters.month || "");

    const handleSearch = () => {
        router.get(
            route("etudiant.attendances.index"),
            {
                type: filterType,
                subject_id: filterSubject,
                month: filterMonth,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setFilterType("");
        setFilterSubject("");
        setFilterMonth("");
        router.get(route("etudiant.attendances.index"));
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

    const getJustificationBadge = (status) => {
        const badges = {
            pending: "badge-warning",
            approved: "badge-success",
            rejected: "badge-danger",
        };
        return badges[status] || "badge-secondary";
    };

    const getJustificationLabel = (status) => {
        const labels = {
            pending: "En attente",
            approved: "Approuvée",
            rejected: "Rejetée",
        };
        return labels[status] || status;
    };

    return (
        <AdminLayout title="Mes absences et retards">
            <Head title="Absences et retards" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-calendar-check mr-2 text-primary"></i>
                                Mes absences et retards
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("etudiant.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Absences et retards
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
                                    <h3>{stats.total_classes}</h3>
                                    <p>Cours enregistrés</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clipboard-list"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats.attendance_rate}%</h3>
                                    <p>Taux de présence</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{stats.absences}</h3>
                                    <p>Absences totales</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-times-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.retards}</h3>
                                    <p>Retards</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alertes absences non justifiées */}
                    {unjustifiedAbsences.length > 0 && (
                        <div className="alert alert-warning">
                            <h5>
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Absences non justifiées (
                                {unjustifiedAbsences.length})
                            </h5>
                            <p className="mb-2">
                                Vous avez des absences qui nécessitent une
                                justification :
                            </p>
                            <ul className="mb-0">
                                {unjustifiedAbsences
                                    .slice(0, 3)
                                    .map((attendance) => (
                                        <li key={attendance.id}>
                                            <strong>
                                                {attendance.subject.name}
                                            </strong>{" "}
                                            -{" "}
                                            {new Date(
                                                attendance.date
                                            ).toLocaleDateString("fr-FR")}
                                            <Link
                                                href={route(
                                                    "etudiant.attendances.justify-form",
                                                    attendance.id
                                                )}
                                                className="btn btn-sm btn-primary ml-2"
                                            >
                                                Justifier
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                            {unjustifiedAbsences.length > 3 && (
                                <p className="mt-2 mb-0">
                                    <small>
                                        Et {unjustifiedAbsences.length - 3}{" "}
                                        autre(s) absence(s)...
                                    </small>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions rapides */}
                    <div className="card mb-4">
                        <div className="card-header bg-primary">
                            <h3 className="card-title">Actions rapides</h3>
                        </div>
                        <div className="card-body">
                            <div className="btn-group">
                                <Link
                                    href={route(
                                        "etudiant.attendances.statistics"
                                    )}
                                    className="btn btn-info"
                                >
                                    <i className="fas fa-chart-line mr-1"></i>
                                    Statistiques détaillées
                                </Link>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => window.print()}
                                >
                                    <i className="fas fa-print mr-1"></i>
                                    Imprimer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-filter mr-2"></i>
                                Filtrer
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4">
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
                                <div className="col-md-4">
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
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label>Mois</label>
                                        <input
                                            type="month"
                                            className="form-control"
                                            value={filterMonth}
                                            onChange={(e) =>
                                                setFilterMonth(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
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

                    {/* Liste des présences/absences */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Historique</h3>
                        </div>
                        <div className="card-body p-0">
                            {attendances.data.length === 0 ? (
                                <div className="p-4 text-center text-muted">
                                    Aucun enregistrement trouvé
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Matière</th>
                                                <th>Statut</th>
                                                <th>Détails</th>
                                                <th>Justification</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendances.data.map(
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
                                                                    <span className="text-warning">
                                                                        <i className="fas fa-clock mr-1"></i>
                                                                        {
                                                                            attendance.delay_minutes
                                                                        }{" "}
                                                                        min
                                                                    </span>
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
                                                            {attendance.justification_status ? (
                                                                <span
                                                                    className={`badge ${getJustificationBadge(
                                                                        attendance.justification_status
                                                                    )}`}
                                                                >
                                                                    {getJustificationLabel(
                                                                        attendance.justification_status
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                attendance.type ===
                                                                    "absence" && (
                                                                    <span className="text-muted">
                                                                        Non
                                                                        justifiée
                                                                    </span>
                                                                )
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="btn-group btn-group-sm">
                                                                <Link
                                                                    href={route(
                                                                        "etudiant.attendances.show",
                                                                        attendance.id
                                                                    )}
                                                                    className="btn btn-info"
                                                                    title="Voir"
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </Link>
                                                                {(attendance.type ===
                                                                    "absence" ||
                                                                    attendance.type ===
                                                                        "retard") &&
                                                                    (!attendance.justification_status ||
                                                                        attendance.justification_status ===
                                                                            "rejected") && (
                                                                        <Link
                                                                            href={route(
                                                                                "etudiant.attendances.justify-form",
                                                                                attendance.id
                                                                            )}
                                                                            className="btn btn-warning"
                                                                            title="Justifier"
                                                                        >
                                                                            <i className="fas fa-file-alt"></i>
                                                                        </Link>
                                                                    )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
