import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Show({ attendance, canJustify }) {
    const getTypeBadge = (type) => {
        const badges = {
            presence: "badge-success",
            absence: "badge-danger",
            retard: "badge-warning",
            absence_justifiee: "badge-info",
        };
        return badges[type] || "badge-secondary";
    };
    console.log(attendance);
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
        <AdminLayout title="Détails de la présence">
            <Head title="Détails" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-info-circle mr-2 text-info"></i>
                                Détails de la présence
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("etudiant.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "etudiant.attendances.index"
                                        )}
                                    >
                                        Absences et retards
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
                        <div className="col-md-8">
                            {/* Informations principales */}
                            <div className="card">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h3 className="card-title">
                                            Informations
                                        </h3>
                                        <span
                                            className={`badge ${getTypeBadge(
                                                attendance.type
                                            )} badge-lg`}
                                        >
                                            {getTypeLabel(attendance.type)}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p>
                                                <strong>
                                                    <i className="fas fa-calendar mr-2 text-primary"></i>
                                                    Date :
                                                </strong>
                                                <br />
                                                {new Date(
                                                    attendance.date
                                                ).toLocaleDateString("fr-FR", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p>
                                                <strong>
                                                    <i className="fas fa-clock mr-2 text-info"></i>
                                                    Heure :
                                                </strong>
                                                <br />
                                                {attendance.time
                                                    ? new Date(
                                                          attendance.time
                                                      ).toLocaleTimeString(
                                                          "fr-FR",
                                                          {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          }
                                                      )
                                                    : "Non spécifiée"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p>
                                                <strong>
                                                    <i className="fas fa-book mr-2 text-success"></i>
                                                    Matière :
                                                </strong>
                                                <br />
                                                {attendance.course.name}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p>
                                                <strong>
                                                    <i className="fas fa-chalkboard mr-2 text-warning"></i>
                                                    Classe :
                                                </strong>
                                                <br />
                                                {attendance.school_class.name}
                                            </p>
                                        </div>
                                    </div>

                                    {attendance.type === "retard" &&
                                        attendance.delay_minutes && (
                                            <div className="alert alert-warning">
                                                <h5>
                                                    <i className="fas fa-clock mr-2"></i>
                                                    Détails du retard
                                                </h5>
                                                <p className="mb-0">
                                                    <strong>Durée :</strong>{" "}
                                                    {attendance.delay_minutes}{" "}
                                                    minute(s) de retard
                                                </p>
                                            </div>
                                        )}

                                    {attendance.notes && (
                                        <div className="alert alert-info">
                                            <h5>
                                                <i className="fas fa-sticky-note mr-2"></i>
                                                Notes
                                            </h5>
                                            <p className="mb-0">
                                                {attendance.notes}
                                            </p>
                                        </div>
                                    )}

                                    {attendance.marked_by && (
                                        <p className="text-muted">
                                            <small>
                                                Enregistré par{" "}
                                                {attendance.marked_by.name} le{" "}
                                                {new Date(
                                                    attendance.created_at
                                                ).toLocaleDateString(
                                                    "fr-FR"
                                                )}{" "}
                                                à{" "}
                                                {new Date(
                                                    attendance.created_at
                                                ).toLocaleTimeString("fr-FR")}
                                            </small>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Justification */}
                            {attendance.student_justification && (
                                <div className="card">
                                    <div className="card-header bg-warning">
                                        <h3 className="card-title">
                                            <i className="fas fa-file-alt mr-2"></i>
                                            Ma justification
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <p>
                                            <strong>Motif :</strong>
                                        </p>
                                        <p className="border-left border-warning pl-3">
                                            {attendance.student_justification}
                                        </p>

                                        {attendance.justification_file_url && (
                                            <div className="mt-3">
                                                <a
                                                    href={route(
                                                        "etudiant.attendances.download-justification",
                                                        attendance.id
                                                    )}
                                                    className="btn btn-sm btn-primary"
                                                    target="_blank"
                                                >
                                                    <i className="fas fa-download mr-1"></i>
                                                    Télécharger le justificatif
                                                </a>
                                            </div>
                                        )}

                                        <p className="text-muted mt-3 mb-0">
                                            <small>
                                                Soumis le{" "}
                                                {new Date(
                                                    attendance.justification_date
                                                ).toLocaleDateString(
                                                    "fr-FR"
                                                )}{" "}
                                                à{" "}
                                                {new Date(
                                                    attendance.justification_date
                                                ).toLocaleTimeString("fr-FR")}
                                            </small>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Réponse de l'administration */}
                            {attendance.validation_date && (
                                <div className="card">
                                    <div className="card-header bg-secondary">
                                        <h3 className="card-title">
                                            <i className="fas fa-reply mr-2"></i>
                                            Réponse de l'administration
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <div
                                            className={`alert ${
                                                attendance.justification_status ===
                                                "approved"
                                                    ? "alert-success"
                                                    : "alert-danger"
                                            }`}
                                        >
                                            <h5>
                                                <i
                                                    className={`fas ${
                                                        attendance.justification_status ===
                                                        "approved"
                                                            ? "fa-check-circle"
                                                            : "fa-times-circle"
                                                    } mr-2`}
                                                ></i>
                                                Justification{" "}
                                                {attendance.justification_status ===
                                                "approved"
                                                    ? "approuvée"
                                                    : "rejetée"}
                                            </h5>
                                            {attendance.validation_comment && (
                                                <p className="mb-0">
                                                    <strong>
                                                        Commentaire :
                                                    </strong>{" "}
                                                    {
                                                        attendance.validation_comment
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-muted mb-0">
                                            <small>
                                                Validé par{" "}
                                                {attendance.validated_by?.name}{" "}
                                                le{" "}
                                                {new Date(
                                                    attendance.validation_date
                                                ).toLocaleDateString(
                                                    "fr-FR"
                                                )}{" "}
                                                à{" "}
                                                {new Date(
                                                    attendance.validation_date
                                                ).toLocaleTimeString("fr-FR")}
                                            </small>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="card">
                                <div className="card-body">
                                    <Link
                                        href={route(
                                            "etudiant.attendances.index"
                                        )}
                                        className="btn btn-secondary"
                                    >
                                        <i className="fas fa-arrow-left mr-1"></i>
                                        Retour à la liste
                                    </Link>
                                    {canJustify && (
                                        <Link
                                            href={route(
                                                "etudiant.attendances.justify-form",
                                                attendance.id
                                            )}
                                            className="btn btn-warning ml-2"
                                        >
                                            <i className="fas fa-file-alt mr-1"></i>
                                            Justifier cette absence
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-md-4">
                            {/* État de la justification */}
                            <div className="card">
                                <div className="card-header bg-info">
                                    <h3 className="card-title">État</h3>
                                </div>
                                <div className="card-body text-center">
                                    {!attendance.justification_status ? (
                                        <div>
                                            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                                            <h5>Non justifiée</h5>
                                            {canJustify && (
                                                <p className="text-muted">
                                                    Vous pouvez soumettre une
                                                    justification
                                                </p>
                                            )}
                                        </div>
                                    ) : attendance.justification_status ===
                                      "pending" ? (
                                        <div>
                                            <i className="fas fa-hourglass-half fa-3x text-warning mb-3"></i>
                                            <h5>En attente</h5>
                                            <p className="text-muted">
                                                Votre justification est en cours
                                                de traitement
                                            </p>
                                        </div>
                                    ) : attendance.justification_status ===
                                      "approved" ? (
                                        <div>
                                            <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                                            <h5>Approuvée</h5>
                                            <p className="text-muted">
                                                Votre justification a été
                                                acceptée
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <i className="fas fa-times-circle fa-3x text-danger mb-3"></i>
                                            <h5>Rejetée</h5>
                                            <p className="text-muted">
                                                Votre justification n'a pas été
                                                acceptée
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Conseils */}
                            <div className="card bg-gradient-primary">
                                <div className="card-body">
                                    <h5 className="text-white">
                                        <i className="fas fa-lightbulb mr-2"></i>
                                        Conseil
                                    </h5>
                                    <p className="text-white mb-0 small">
                                        Pour qu'une justification soit acceptée,
                                        elle doit être accompagnée d'un document
                                        valide (certificat médical, justificatif
                                        officiel, etc.).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }
            `}</style>
        </AdminLayout>
    );
}
