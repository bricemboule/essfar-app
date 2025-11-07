import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { Card, Alert } from "@/Components/UI/Composant";

export default function Show({ classroom, occupancyRate, upcomingSchedules }) {
    const getCapacityColor = (capacity) => {
        if (capacity >= 100) return "text-success";
        if (capacity >= 50) return "text-info";
        if (capacity >= 20) return "text-warning";
        return "text-secondary";
    };

    const getOccupancyColor = (rate) => {
        if (rate >= 80) return "bg-danger";
        if (rate >= 60) return "bg-warning";
        if (rate >= 40) return "bg-info";
        return "bg-success";
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getDuration = (startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(
            (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        if (diffHours > 0) {
            return `${diffHours}h${
                diffMinutes > 0 ? ` ${diffMinutes}min` : ""
            }`;
        }
        return `${diffMinutes}min`;
    };

    return (
        <AdminLayout title={`Salle ${classroom.name}`}>
            <Head title={`Salle ${classroom.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-door-open mr-2 text-primary"></i>
                                {classroom.name}
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
                                            "scolarite.classrooms.index"
                                        )}
                                    >
                                        Salles
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    {classroom.name}
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
                            {/* Informations générales */}
                            <Card
                                title="Informations générales"
                                icon="fas fa-info-circle"
                            >
                                <div className="row">
                                    <div className="col-md-6">
                                        <table className="table table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <strong>Nom :</strong>
                                                    </td>
                                                    <td>{classroom.name}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Code :</strong>
                                                    </td>
                                                    <td>
                                                        <code className="bg-light p-1">
                                                            {classroom.code}
                                                        </code>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            Capacité :
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`h5 ${getCapacityColor(
                                                                classroom.capacity
                                                            )}`}
                                                        >
                                                            <i className="fas fa-users mr-1"></i>
                                                            {classroom.capacity}{" "}
                                                            places
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            Statut :
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        {classroom.is_available ? (
                                                            <span className="badge badge-success">
                                                                <i className="fas fa-check mr-1"></i>
                                                                Disponible
                                                            </span>
                                                        ) : (
                                                            <span className="badge badge-danger">
                                                                <i className="fas fa-times mr-1"></i>
                                                                Indisponible
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-md-6">
                                        <table className="table table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            Bâtiment :
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        {classroom.building ? (
                                                            <>
                                                                <i className="fas fa-building text-info mr-1"></i>
                                                                {
                                                                    classroom.building
                                                                }
                                                            </>
                                                        ) : (
                                                            <span className="text-muted">
                                                                Non spécifié
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Étage :</strong>
                                                    </td>
                                                    <td>
                                                        {classroom.floor ? (
                                                            <>
                                                                <i className="fas fa-layer-group text-info mr-1"></i>
                                                                {
                                                                    classroom.floor
                                                                }
                                                            </>
                                                        ) : (
                                                            <span className="text-muted">
                                                                Non spécifié
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            Créée le :
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        {formatDate(
                                                            classroom.created_at
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            Modifiée le :
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        {formatDate(
                                                            classroom.updated_at
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Card>

                            {/* Équipements */}
                            <Card
                                title="Équipements disponibles"
                                icon="fas fa-tools"
                                className="mt-4"
                            >
                                {classroom.equipment &&
                                classroom.equipment.length > 0 ? (
                                    <div className="row">
                                        {classroom.equipment.map(
                                            (equipment, index) => (
                                                <div
                                                    key={index}
                                                    className="col-md-6 col-lg-4 mb-3"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-check-circle text-success mr-2"></i>
                                                        <span>{equipment}</span>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <Alert type="info">
                                        Aucun équipement spécifique n'a été
                                        renseigné pour cette salle.
                                    </Alert>
                                )}
                            </Card>

                            {/* Prochains créneaux */}
                            <Card
                                title="Prochains créneaux programmés"
                                icon="fas fa-calendar-alt"
                                className="mt-4"
                            >
                                {upcomingSchedules &&
                                upcomingSchedules.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Date et heure</th>
                                                    <th>Cours</th>
                                                    <th>Professeur</th>
                                                    <th>Classe</th>
                                                    <th>Durée</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {upcomingSchedules.map(
                                                    (schedule) => (
                                                        <tr key={schedule.id}>
                                                            <td>
                                                                <div>
                                                                    <strong>
                                                                        {formatDateTime(
                                                                            schedule.start_time
                                                                        )}
                                                                    </strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        à{" "}
                                                                        {new Date(
                                                                            schedule.end_time
                                                                        ).toLocaleTimeString(
                                                                            "fr-FR",
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            }
                                                                        )}
                                                                    </small>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    <strong>
                                                                        {schedule
                                                                            .course
                                                                            ?.name ||
                                                                            "N/A"}
                                                                    </strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {schedule
                                                                            .course
                                                                            ?.code ||
                                                                            ""}
                                                                    </small>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {schedule.teacher ? (
                                                                    <div>
                                                                        <strong>
                                                                            {
                                                                                schedule
                                                                                    .teacher
                                                                                    .first_name
                                                                            }{" "}
                                                                            {
                                                                                schedule
                                                                                    .teacher
                                                                                    .last_name
                                                                            }
                                                                        </strong>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted">
                                                                        Non
                                                                        assigné
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {schedule.school_class ? (
                                                                    <span className="badge badge-info">
                                                                        {
                                                                            schedule
                                                                                .school_class
                                                                                .name
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted">
                                                                        N/A
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span className="badge badge-secondary">
                                                                    {getDuration(
                                                                        schedule.start_time,
                                                                        schedule.end_time
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <Alert type="info">
                                        Aucun créneau programmé pour cette salle
                                        dans les prochains jours.
                                    </Alert>
                                )}
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="col-md-4">
                            {/* Actions */}
                            <Card title="Actions" icon="fas fa-cogs">
                                <div className="d-grid gap-2">
                                    <Link
                                        href={route(
                                            "scolarite.classrooms.edit",
                                            classroom.id
                                        )}
                                        className="btn btn-warning btn-block"
                                    >
                                        <i className="fas fa-edit mr-1"></i>
                                        Modifier la salle
                                    </Link>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-block"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fas fa-print mr-1"></i>
                                        Imprimer la fiche
                                    </button>
                                    <Link
                                        href={route(
                                            "scolarite.classrooms.index"
                                        )}
                                        className="btn btn-outline-secondary btn-block"
                                    >
                                        <i className="fas fa-list mr-1"></i>
                                        Retour à la liste
                                    </Link>
                                </div>
                            </Card>

                            {/* Statistiques d'utilisation */}
                            <Card
                                title="Taux d'occupation"
                                icon="fas fa-chart-pie"
                                className="mt-3"
                            >
                                <div className="text-center mb-3">
                                    <h3 className="text-primary">
                                        {Math.round(occupancyRate)}%
                                    </h3>
                                    <p className="text-muted">Ce mois-ci</p>
                                    <div className="progress">
                                        <div
                                            className={`progress-bar ${getOccupancyColor(
                                                occupancyRate
                                            )}`}
                                            style={{
                                                width: `${Math.min(
                                                    occupancyRate,
                                                    100
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="small text-muted">
                                    <p>
                                        <strong>Interprétation :</strong>
                                    </p>
                                    <ul>
                                        <li>0-40% : Sous-utilisée</li>
                                        <li>40-60% : Utilisation normale</li>
                                        <li>60-80% : Bien utilisée</li>
                                        <li>80%+ : Très demandée</li>
                                    </ul>
                                </div>
                            </Card>

                            {/* Informations techniques */}
                            <Card
                                title="Informations techniques"
                                icon="fas fa-cog"
                                className="mt-3"
                            >
                                <div className="small">
                                    <table className="table table-sm table-borderless">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <strong>ID :</strong>
                                                </td>
                                                <td>#{classroom.id}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>
                                                        Code unique :
                                                    </strong>
                                                </td>
                                                <td>
                                                    <code>
                                                        {classroom.code}
                                                    </code>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>Plannings :</strong>
                                                </td>
                                                <td>
                                                    {classroom.schedules_count ||
                                                        0}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <strong>
                                                        Équipements :
                                                    </strong>
                                                </td>
                                                <td>
                                                    {classroom.equipment
                                                        ? classroom.equipment
                                                              .length
                                                        : 0}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* État de la salle */}
                            <Card
                                title="État actuel"
                                icon="fas fa-info"
                                className="mt-3"
                            >
                                <div className="text-center">
                                    {classroom.is_available ? (
                                        <div>
                                            <i
                                                className="fas fa-check-circle text-success"
                                                style={{ fontSize: "3em" }}
                                            ></i>
                                            <h5 className="text-success mt-2">
                                                Disponible
                                            </h5>
                                            <p className="text-muted small">
                                                Cette salle peut être réservée
                                                pour des cours.
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <i
                                                className="fas fa-times-circle text-danger"
                                                style={{ fontSize: "3em" }}
                                            ></i>
                                            <h5 className="text-danger mt-2">
                                                Indisponible
                                            </h5>
                                            <p className="text-muted small">
                                                Cette salle est actuellement
                                                fermée aux réservations.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .d-grid .btn + .btn {
                    margin-top: 0.5rem;
                }
                
                .progress {
                    height: 20px;
                    border-radius: 10px;
                }
                
                .progress-bar {
                    border-radius: 10px;
                }
                
                .table td {
                    vertical-align: middle;
                    padding: 0.5rem;
                }
                
                .table-borderless td {
                    border: none;
                }
                
                code {
                    color: #e83e8c;
                    background-color: #f8f9fa;
                    padding: 0.2rem 0.4rem;
                    border-radius: 0.25rem;
                }
                
                .card-body .d-flex.align-items-center {
                    margin-bottom: 0.5rem;
                }
                
                .card-body .d-flex.align-items-center:last-child {
                    margin-bottom: 0;
                }
            `}</style>
        </AdminLayout>
    );
}
