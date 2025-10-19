import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Show({ attendance }) {
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

    const getTypeIcon = (type) => {
        const icons = {
            presence: "fa-check-circle text-success",
            absence: "fa-times-circle text-danger",
            retard: "fa-clock text-warning",
            absence_justifiee: "fa-check-double text-info",
        };
        return icons[type] || "fa-question-circle";
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (time) => {
        if (!time) return "N/A";
        return new Date("2000-01-01 " + time).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AdminLayout title="Détails de la présence">
            <Head title="Détails" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-info-circle mr-2 text-info"></i>
                                Détails de l'enregistrement
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("scolarite.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "scolarite.attendances.index"
                                        )}
                                    >
                                        Présences
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Détails
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        {/* Informations principales */}
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h3 className="card-title">
                                            Informations de présence
                                        </h3>
                                        <span
                                            className={`badge ${getTypeBadge(
                                                attendance.type
                                            )} badge-lg`}
                                        >
                                            <i
                                                className={`fas ${getTypeIcon(
                                                    attendance.type
                                                )} mr-1`}
                                            ></i>
                                            {getTypeLabel(attendance.type)}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {/* Étudiant */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <h5 className="text-muted mb-3">
                                                <i className="fas fa-user mr-2"></i>
                                                Étudiant
                                            </h5>
                                            <div className="d-flex align-items-center p-3 bg-light rounded">
                                                <img
                                                    src={
                                                        attendance.student
                                                            ?.photo_url ||
                                                        "/images/default-avatar.png"
                                                    }
                                                    alt={
                                                        attendance.student?.name
                                                    }
                                                    className="img-circle mr-3"
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        objectFit: "cover",
                                                        border: "3px solid #fff",
                                                        boxShadow:
                                                            "0 2px 4px rgba(0,0,0,0.1)",
                                                    }}
                                                />
                                                <div>
                                                    <h4 className="mb-1">
                                                        {
                                                            attendance.student
                                                                ?.name
                                                        }
                                                    </h4>
                                                    <p className="mb-0 text-muted">
                                                        <i className="fas fa-id-card mr-2"></i>
                                                        {
                                                            attendance.student
                                                                ?.matricule
                                                        }
                                                    </p>
                                                    <p className="mb-0 text-muted">
                                                        <i className="fas fa-envelope mr-2"></i>
                                                        {
                                                            attendance.student
                                                                ?.email
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr />

                                    {/* Date et Heure */}
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <h5 className="text-muted mb-3">
                                                <i className="fas fa-calendar mr-2"></i>
                                                Date
                                            </h5>
                                            <p className="h5">
                                                {formatDate(attendance.date)}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <h5 className="text-muted mb-3">
                                                <i className="fas fa-clock mr-2"></i>
                                                Heure
                                            </h5>
                                            <p className="h5">
                                                {formatTime(attendance.time)}
                                            </p>
                                        </div>
                                    </div>

                                    <hr />

                                    {/* Classe et Matière */}
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <h5 className="text-muted mb-3">
                                                <i className="fas fa-users mr-2"></i>
                                                Classe
                                            </h5>
                                            <p className="h5">
                                                {attendance.school_class?.name}
                                            </p>
                                            <small className="text-muted">
                                                {attendance.school_class?.level}
                                            </small>
                                        </div>
                                        <div className="col-md-6">
                                            <h5 className="text-muted mb-3">
                                                <i className="fas fa-book mr-2"></i>
                                                Matière
                                            </h5>
                                            <p className="h5">
                                                {attendance.course?.name}
                                            </p>
                                            <small className="text-muted">
                                                {attendance.course?.code}
                                            </small>
                                        </div>
                                    </div>

                                    {/* Retard */}
                                    {attendance.type === "retard" &&
                                        attendance.delay_minutes && (
                                            <>
                                                <hr />
                                                <div className="row mb-4">
                                                    <div className="col-12">
                                                        <h5 className="text-muted mb-3">
                                                            <i className="fas fa-hourglass-half mr-2"></i>
                                                            Durée du retard
                                                        </h5>
                                                        <div className="alert alert-warning">
                                                            <i className="fas fa-clock mr-2"></i>
                                                            <strong>
                                                                {
                                                                    attendance.delay_minutes
                                                                }{" "}
                                                                minutes
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                    {/* Heures manquées */}
                                    {attendance.hours_missed > 0 && (
                                        <>
                                            <hr />
                                            <div className="row mb-4">
                                                <div className="col-12">
                                                    <h5 className="text-muted mb-3">
                                                        <i className="fas fa-business-time mr-2"></i>
                                                        Heures manquées
                                                    </h5>
                                                    <div className="alert alert-danger">
                                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                                        <strong>
                                                            {
                                                                attendance.hours_missed
                                                            }{" "}
                                                            heure(s)
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Notes */}
                                    {attendance.notes && (
                                        <>
                                            <hr />
                                            <div className="row mb-4">
                                                <div className="col-12">
                                                    <h5 className="text-muted mb-3">
                                                        <i className="fas fa-sticky-note mr-2"></i>
                                                        Notes
                                                    </h5>
                                                    <div className="alert alert-info">
                                                        {attendance.notes}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Justification */}
                                    {attendance.student_justification && (
                                        <>
                                            <hr />
                                            <div className="row mb-4">
                                                <div className="col-12">
                                                    <h5 className="text-muted mb-3">
                                                        <i className="fas fa-file-alt mr-2"></i>
                                                        Justification
                                                    </h5>
                                                    <div className="card">
                                                        <div className="card-body">
                                                            <p className="mb-2">
                                                                {
                                                                    attendance.student_justification
                                                                }
                                                            </p>
                                                            {attendance.justification_file && (
                                                                <a
                                                                    href={`/storage/${attendance.justification_file}`}
                                                                    target="_blank"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                >
                                                                    <i className="fas fa-download mr-1"></i>
                                                                    Télécharger
                                                                    le fichier
                                                                    joint
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {attendance.justification_status && (
                                                        <div className="mt-2">
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
                                                            {attendance.validation_comment && (
                                                                <p className="mt-2 mb-0">
                                                                    <strong>
                                                                        Commentaire:{" "}
                                                                    </strong>
                                                                    {
                                                                        attendance.validation_comment
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informations système */}
                        <div className="col-md-4">
                            {/* Métadonnées */}
                            <div className="card">
                                <div className="card-header bg-info">
                                    <h3 className="card-title">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        Métadonnées
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <dl>
                                        <dt>
                                            <i className="fas fa-hashtag mr-2"></i>
                                            ID
                                        </dt>
                                        <dd>{attendance.id}</dd>

                                        <dt>
                                            <i className="fas fa-user-tie mr-2"></i>
                                            Marqué par
                                        </dt>
                                        <dd>
                                            {attendance.marked_by?.name ||
                                                "N/A"}
                                        </dd>

                                        <dt>
                                            <i className="fas fa-calendar-plus mr-2"></i>
                                            Date de création
                                        </dt>
                                        <dd>
                                            {new Date(
                                                attendance.created_at
                                            ).toLocaleString("fr-FR")}
                                        </dd>

                                        {attendance.updated_at !==
                                            attendance.created_at && (
                                            <>
                                                <dt>
                                                    <i className="fas fa-calendar-check mr-2"></i>
                                                    Dernière modification
                                                </dt>
                                                <dd>
                                                    {new Date(
                                                        attendance.updated_at
                                                    ).toLocaleString("fr-FR")}
                                                </dd>
                                            </>
                                        )}

                                        {attendance.validated_by && (
                                            <>
                                                <dt>
                                                    <i className="fas fa-user-check mr-2"></i>
                                                    Validé par
                                                </dt>
                                                <dd>
                                                    {
                                                        attendance.validated_by
                                                            ?.name
                                                    }
                                                </dd>

                                                <dt>
                                                    <i className="fas fa-calendar-check mr-2"></i>
                                                    Date de validation
                                                </dt>
                                                <dd>
                                                    {new Date(
                                                        attendance.validation_date
                                                    ).toLocaleString("fr-FR")}
                                                </dd>
                                            </>
                                        )}

                                        {attendance.parent_notified && (
                                            <>
                                                <dt>
                                                    <i className="fas fa-bell mr-2"></i>
                                                    Parent notifié
                                                </dt>
                                                <dd>
                                                    <span className="badge badge-success">
                                                        Oui
                                                    </span>
                                                    {attendance.notification_sent_at && (
                                                        <small className="d-block text-muted">
                                                            {new Date(
                                                                attendance.notification_sent_at
                                                            ).toLocaleString(
                                                                "fr-FR"
                                                            )}
                                                        </small>
                                                    )}
                                                </dd>
                                            </>
                                        )}
                                    </dl>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="card">
                                <div className="card-header bg-secondary">
                                    <h3 className="card-title">
                                        <i className="fas fa-tools mr-2"></i>
                                        Actions
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="d-grid gap-2">
                                        <Link
                                            href={route(
                                                "scolarite.attendances.index"
                                            )}
                                            className="btn btn-secondary btn-block mb-2"
                                        >
                                            <i className="fas fa-arrow-left mr-2"></i>
                                            Retour à la liste
                                        </Link>

                                        <Link
                                            href={route(
                                                "scolarite.attendances.edit",
                                                attendance.id
                                            )}
                                            className="btn btn-primary btn-block mb-2"
                                        >
                                            <i className="fas fa-edit mr-2"></i>
                                            Modifier
                                        </Link>

                                        <Link
                                            href={route(
                                                "scolarite.attendances.destroy",
                                                attendance.id
                                            )}
                                            method="delete"
                                            as="button"
                                            className="btn btn-danger btn-block"
                                            onBefore={() =>
                                                confirm(
                                                    "Êtes-vous sûr de vouloir supprimer cet enregistrement ?"
                                                )
                                            }
                                        >
                                            <i className="fas fa-trash mr-2"></i>
                                            Supprimer
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Statistiques rapides */}
                            <div className="card">
                                <div className="card-header bg-success">
                                    <h3 className="card-title">
                                        <i className="fas fa-chart-bar mr-2"></i>
                                        Statistiques de l'étudiant
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="info-box mb-2 bg-success">
                                        <span className="info-box-icon">
                                            <i className="fas fa-check"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Présences
                                            </span>
                                            <span className="info-box-number">
                                                -
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-box mb-2 bg-danger">
                                        <span className="info-box-icon">
                                            <i className="fas fa-times"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Absences
                                            </span>
                                            <span className="info-box-number">
                                                -
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-box mb-0 bg-warning">
                                        <span className="info-box-icon">
                                            <i className="fas fa-clock"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Retards
                                            </span>
                                            <span className="info-box-number">
                                                -
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .badge-lg {
                    font-size: 1rem;
                    padding: 0.5rem 1rem;
                }
                dl {
                    margin-bottom: 0;
                }
                dt {
                    font-weight: 600;
                    margin-top: 1rem;
                    color: #6c757d;
                }
                dt:first-child {
                    margin-top: 0;
                }
                dd {
                    margin-bottom: 0;
                    margin-left: 0;
                }
                .d-grid.gap-2 > * {
                    margin-bottom: 0 !important;
                }
                .d-grid.gap-2 > *:not(:last-child) {
                    margin-bottom: 0.5rem !important;
                }
            `}</style>
        </AdminLayout>
    );
}
