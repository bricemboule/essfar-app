import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

const Card = ({ title, icon, children, className = "" }) => (
    <div className={`card ${className}`}>
        <div className="card-header">
            <h3 className="card-title">
                {icon && <i className={`${icon} mr-2`}></i>}
                {title}
            </h3>
        </div>
        <div className="card-body">{children}</div>
    </div>
);

export default function Show({ schedule }) {
    const formatTime = (datetime) => {
        return new Date(datetime).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
        });
    };

    const formatDate = (datetime) => {
        return new Date(datetime).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    };

    const formatDateTime = (datetime) => {
        return new Date(datetime).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: "badge-primary",
            completed: "badge-success",
            cancelled: "badge-danger",
            rescheduled: "badge-warning",
        };
        return `badge badge-lg ${badges[status] || "badge-secondary"}`;
    };

    const getStatusLabel = (status) => {
        const labels = {
            scheduled: "Programmé",
            completed: "Terminé",
            cancelled: "Annulé",
            rescheduled: "Reporté",
        };
        return labels[status] || status;
    };

    const getDayName = (dayNumber) => {
        const days = {
            1: "Lundi",
            2: "Mardi",
            3: "Mercredi",
            4: "Jeudi",
            5: "Vendredi",
            6: "Samedi",
            7: "Dimanche",
        };
        return days[dayNumber] || "";
    };

    const calculateDuration = () => {
        const start = new Date(schedule.start_time);
        const end = new Date(schedule.end_time);
        const durationMs = end - start;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor(
            (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        return `${hours}h ${minutes}min`;
    };

    const handleDelete = () => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
            router.delete(
                route("scolarite.planning.schedules.destroy", schedule.id)
            );
        }
    };

    const handleCancel = () => {
        const reason = prompt("Veuillez indiquer la raison de l'annulation :");
        if (reason) {
            router.post(route("scolarite.planning.cancel", schedule.id), {
                reason: reason,
            });
        }
    };

    const handleMarkCompleted = () => {
        if (confirm("Marquer cette séance comme terminée ?")) {
            const duration = prompt(
                "Durée effective en heures (ex: 1.5 pour 1h30) :",
                schedule.completed_hours || calculateDuration()
            );
            if (duration) {
                router.post(
                    route("scolarite.planning.mark-completed", schedule.id),
                    {
                        duration_hours: parseFloat(duration),
                        notes: "",
                    }
                );
            }
        }
    };

    return (
        <AdminLayout>
            <Head title={`Séance - ${schedule.course?.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-info-circle mr-2 text-primary"></i>
                                Détails de la séance
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
                                            "scolarite.planning.schedules.index"
                                        )}
                                    >
                                        Plannings
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
                    {/* Actions rapides */}
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <div className="btn-group">
                                <Link
                                    href={route(
                                        "scolarite.planning.schedules.index"
                                    )}
                                    className="btn btn-secondary"
                                >
                                    <i className="fas fa-arrow-left mr-1"></i>
                                    Retour à la liste
                                </Link>
                                {schedule.can_be_modified && (
                                    <>
                                        <Link
                                            href={route(
                                                "scolarite.planning.schedules.edit",
                                                schedule.id
                                            )}
                                            className="btn btn-warning"
                                        >
                                            <i className="fas fa-edit mr-1"></i>
                                            Modifier
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={handleDelete}
                                        >
                                            <i className="fas fa-trash mr-1"></i>
                                            Supprimer
                                        </button>
                                    </>
                                )}
                                {schedule.status === "scheduled" &&
                                    new Date(schedule.start_time) <=
                                        new Date() && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={handleMarkCompleted}
                                            >
                                                <i className="fas fa-check mr-1"></i>
                                                Marquer terminé
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleCancel}
                                            >
                                                <i className="fas fa-ban mr-1"></i>
                                                Annuler
                                            </button>
                                        </>
                                    )}
                                <button
                                    type="button"
                                    className="btn btn-info"
                                    onClick={() => window.print()}
                                >
                                    <i className="fas fa-print mr-1"></i>
                                    Imprimer
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Informations principales */}
                        <div className="col-md-8">
                            <Card
                                title="Informations de la séance"
                                icon="fas fa-calendar-alt"
                                className="card-primary card-outline"
                            >
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="info-group mb-3">
                                            <label className="text-muted">
                                                <i className="fas fa-book mr-2"></i>
                                                Cours
                                            </label>
                                            <h4 className="mb-0">
                                                {schedule.course?.name}
                                            </h4>
                                            {schedule.course?.code && (
                                                <small className="text-muted">
                                                    Code: {schedule.course.code}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6 text-right">
                                        <span
                                            className={getStatusBadge(
                                                schedule.status
                                            )}
                                        >
                                            {getStatusLabel(schedule.status)}
                                        </span>
                                        {schedule.is_recurring && (
                                            <span className="badge badge-info badge-lg ml-2">
                                                <i className="fas fa-repeat mr-1"></i>
                                                Récurrent
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="info-group mb-3">
                                            <label className="text-muted">
                                                <i className="fas fa-calendar mr-2"></i>
                                                Date
                                            </label>
                                            <p className="mb-0 font-weight-bold">
                                                {formatDate(
                                                    schedule.start_time
                                                )}
                                            </p>
                                            <small className="text-muted">
                                                {getDayName(
                                                    schedule.day_of_week
                                                )}{" "}
                                                - Semaine {schedule.week_number}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="info-group mb-3">
                                            <label className="text-muted">
                                                <i className="fas fa-clock mr-2"></i>
                                                Horaires
                                            </label>
                                            <p className="mb-0 font-weight-bold">
                                                {formatTime(
                                                    schedule.start_time
                                                )}{" "}
                                                -{" "}
                                                {formatTime(schedule.end_time)}
                                            </p>
                                            <small className="text-muted">
                                                Durée: {calculateDuration()}
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="info-group mb-3">
                                            <label className="text-muted">
                                                <i className="fas fa-user-tie mr-2"></i>
                                                Enseignant
                                            </label>
                                            <p className="mb-0">
                                                <Link
                                                    href={route(
                                                        "scolarite.planning.teacher",
                                                        schedule.teacher_id
                                                    )}
                                                    className="text-primary font-weight-bold"
                                                >
                                                    {schedule.teacher?.name}
                                                </Link>
                                            </p>
                                            {schedule.teacher?.email && (
                                                <small className="text-muted">
                                                    <i className="fas fa-envelope mr-1"></i>
                                                    {schedule.teacher.email}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="info-group mb-3">
                                            <label className="text-muted">
                                                <i className="fas fa-users mr-2"></i>
                                                Classe
                                            </label>
                                            <p className="mb-0">
                                                <Link
                                                    href={route(
                                                        "scolarite.planning.class",
                                                        schedule.school_class_id
                                                    )}
                                                    className="text-primary font-weight-bold"
                                                >
                                                    {
                                                        schedule.school_class
                                                            ?.name
                                                    }
                                                </Link>
                                            </p>
                                            {schedule.school_class?.level && (
                                                <small className="text-muted">
                                                    Niveau:{" "}
                                                    {
                                                        schedule.school_class
                                                            .level
                                                    }
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="info-group mb-3">
                                            <label className="text-muted">
                                                <i className="fas fa-door-open mr-2"></i>
                                                Salle de classe
                                            </label>
                                            <p className="mb-0 font-weight-bold">
                                                {schedule.classroom?.name}
                                            </p>
                                            {schedule.classroom?.capacity && (
                                                <small className="text-muted">
                                                    Capacité:{" "}
                                                    {
                                                        schedule.classroom
                                                            .capacity
                                                    }{" "}
                                                    places
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="info-group mb-3">
                                            <label className="text-muted">
                                                <i className="fas fa-graduation-cap mr-2"></i>
                                                Année académique
                                            </label>
                                            <p className="mb-0 font-weight-bold">
                                                {schedule.academic_year?.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {schedule.notes && (
                                    <>
                                        <hr />
                                        <div className="info-group">
                                            <label className="text-muted">
                                                <i className="fas fa-sticky-note mr-2"></i>
                                                Notes
                                            </label>
                                            <div className="alert alert-info mb-0">
                                                {schedule.notes}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Card>

                            {/* Informations supplémentaires selon le statut */}
                            {schedule.status === "completed" && (
                                <Card
                                    title="Détails de réalisation"
                                    icon="fas fa-check-circle"
                                    className="card-success card-outline"
                                >
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="info-group">
                                                <label className="text-muted">
                                                    Heures effectuées
                                                </label>
                                                <h4 className="text-success">
                                                    {schedule.completed_hours ||
                                                        0}
                                                    h
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-group">
                                                <label className="text-muted">
                                                    Date de complétion
                                                </label>
                                                <p className="mb-0">
                                                    {schedule.updated_at
                                                        ? formatDateTime(
                                                              schedule.updated_at
                                                          )
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {schedule.completion_notes && (
                                        <>
                                            <hr />
                                            <div className="info-group">
                                                <label className="text-muted">
                                                    Notes de complétion
                                                </label>
                                                <p className="mb-0">
                                                    {schedule.completion_notes}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </Card>
                            )}

                            {schedule.status === "cancelled" && (
                                <Card
                                    title="Détails d'annulation"
                                    icon="fas fa-ban"
                                    className="card-danger card-outline"
                                >
                                    <div className="info-group">
                                        <label className="text-muted">
                                            Raison de l'annulation
                                        </label>
                                        <div className="alert alert-danger mb-0">
                                            {schedule.cancellation_reason ||
                                                "Aucune raison fournie"}
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="col-md-4">
                            {/* Timeline */}
                            <Card title="Historique" icon="fas fa-history">
                                <div className="timeline timeline-sm">
                                    <div className="time-label">
                                        <span className="bg-primary">
                                            {formatDate(schedule.created_at)}
                                        </span>
                                    </div>
                                    <div>
                                        <i className="fas fa-plus bg-success"></i>
                                        <div className="timeline-item">
                                            <span className="time">
                                                <i className="fas fa-clock"></i>{" "}
                                                {formatTime(
                                                    schedule.created_at
                                                )}
                                            </span>
                                            <h3 className="timeline-header">
                                                Séance créée
                                            </h3>
                                            <div className="timeline-body">
                                                La séance a été programmée dans
                                                le système.
                                            </div>
                                        </div>
                                    </div>

                                    {schedule.status === "rescheduled" && (
                                        <div>
                                            <i className="fas fa-edit bg-warning"></i>
                                            <div className="timeline-item">
                                                <span className="time">
                                                    <i className="fas fa-clock"></i>{" "}
                                                    {formatTime(
                                                        schedule.updated_at
                                                    )}
                                                </span>
                                                <h3 className="timeline-header">
                                                    Séance reportée
                                                </h3>
                                                <div className="timeline-body">
                                                    La séance a été reportée à
                                                    une autre date/heure.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {schedule.status === "completed" && (
                                        <div>
                                            <i className="fas fa-check bg-success"></i>
                                            <div className="timeline-item">
                                                <span className="time">
                                                    <i className="fas fa-clock"></i>{" "}
                                                    {formatTime(
                                                        schedule.updated_at
                                                    )}
                                                </span>
                                                <h3 className="timeline-header">
                                                    Séance terminée
                                                </h3>
                                                <div className="timeline-body">
                                                    La séance a été marquée
                                                    comme terminée avec{" "}
                                                    {schedule.completed_hours}h
                                                    effectuées.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {schedule.status === "cancelled" && (
                                        <div>
                                            <i className="fas fa-ban bg-danger"></i>
                                            <div className="timeline-item">
                                                <span className="time">
                                                    <i className="fas fa-clock"></i>{" "}
                                                    {formatTime(
                                                        schedule.updated_at
                                                    )}
                                                </span>
                                                <h3 className="timeline-header">
                                                    Séance annulée
                                                </h3>
                                                <div className="timeline-body">
                                                    {
                                                        schedule.cancellation_reason
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <i className="fas fa-clock bg-gray"></i>
                                    </div>
                                </div>
                            </Card>

                            {/* Informations système */}
                            <Card
                                title="Informations système"
                                icon="fas fa-cog"
                                className="card-secondary card-outline"
                            >
                                <div className="info-group mb-2">
                                    <label className="text-muted small">
                                        ID
                                    </label>
                                    <p className="mb-0">{schedule.id}</p>
                                </div>
                                <div className="info-group mb-2">
                                    <label className="text-muted small">
                                        Créé le
                                    </label>
                                    <p className="mb-0">
                                        {formatDateTime(schedule.created_at)}
                                    </p>
                                </div>
                                <div className="info-group">
                                    <label className="text-muted small">
                                        Dernière modification
                                    </label>
                                    <p className="mb-0">
                                        {formatDateTime(schedule.updated_at)}
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .info-group label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                    display: block;
                }

                .info-group p {
                    font-size: 1rem;
                }

                .badge-lg {
                    font-size: 0.95rem;
                    padding: 0.5rem 0.75rem;
                }

                .timeline-sm .timeline-item {
                    margin-bottom: 0;
                }

                .timeline-sm .timeline-item .timeline-header {
                    font-size: 0.95rem;
                    margin: 0;
                }

                .timeline-sm .timeline-item .timeline-body {
                    font-size: 0.875rem;
                    padding: 0.5rem 0;
                }

                @media print {
                    .btn-group,
                    .breadcrumb,
                    .content-header,
                    .timeline {
                        display: none !important;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
