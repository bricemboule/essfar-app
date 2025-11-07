import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Card, Alert } from "@/Components/UI/Composant";

export default function Show({ course, statistics }) {
    const [activeTab, setActiveTab] = useState("overview");

    const { post, processing } = useForm();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getProgressColor = (progress) => {
        if (progress >= 90) return "success";
        if (progress >= 75) return "info";
        if (progress >= 50) return "warning";
        return "danger";
    };

    const handleDuplicate = () => {
        post(route("scolarite.courses.duplicate", course.id));
    };

    return (
        <AdminLayout title={`Cours: ${course.name}`}>
            <Head title={`${course.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-8">
                            <h1 className="m-0">
                                <i className="fas fa-book mr-2 text-primary"></i>
                                {course.name}
                            </h1>
                            <p className="text-muted mb-0">
                                Code: {course.code} | Année:{" "}
                                {course.academic_year.name}
                                {course.academic_year.is_active && (
                                    <span className="badge badge-success ml-2">
                                        Active
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="col-sm-4">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("admin.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route("scolarite.courses.index")}
                                    >
                                        Cours
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    {course.name}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Statistiques principales */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-6">
                            <div className="info-box">
                                <span className="info-box-icon bg-info">
                                    <i className="fas fa-medal"></i>
                                </span>
                                <div className="info-box-content">
                                    <span className="info-box-text">
                                        Crédits
                                    </span>
                                    <span className="info-box-number">
                                        {course.credits}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="info-box">
                                <span className="info-box-icon bg-success">
                                    <i className="fas fa-clock"></i>
                                </span>
                                <div className="info-box-content">
                                    <span className="info-box-text">
                                        Heures totales
                                    </span>
                                    <span className="info-box-number">
                                        {course.total_hours}h
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="info-box">
                                <span className="info-box-icon bg-warning">
                                    <i className="fas fa-users"></i>
                                </span>
                                <div className="info-box-content">
                                    <span className="info-box-text">
                                        Étudiants
                                    </span>
                                    <span className="info-box-number">
                                        {statistics.total_students}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="info-box">
                                <span className="info-box-icon bg-danger">
                                    <i className="fas fa-money-bill"></i>
                                </span>
                                <div className="info-box-content">
                                    <span className="info-box-text">
                                        Coût total
                                    </span>
                                    <span className="info-box-number">
                                        {Math.round(
                                            statistics.total_cost / 1000
                                        )}
                                        K
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <Card title="Actions" icon="fas fa-tools" className="mb-4">
                        <div className="btn-group">
                            <Link
                                href={route(
                                    "scolarite.courses.edit",
                                    course.id
                                )}
                                className="btn btn-warning"
                            >
                                <i className="fas fa-edit mr-1"></i>
                                Modifier le cours
                            </Link>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleDuplicate}
                                disabled={processing}
                            >
                                <i className="fas fa-copy mr-1"></i>
                                Dupliquer
                            </button>
                            <Link
                                href={route(
                                    "scolarite.planning.schedules.create",
                                    {
                                        course_id: course.id,
                                    }
                                )}
                                className="btn btn-info"
                            >
                                <i className="fas fa-calendar-plus mr-1"></i>
                                Créer un planning
                            </Link>
                            <Link
                                href={route(
                                    "scolarite.planning.schedules.index",
                                    {
                                        course_id: course.id,
                                    }
                                )}
                                className="btn btn-primary"
                            >
                                <i className="fas fa-calendar mr-1"></i>
                                Voir les plannings
                            </Link>
                        </div>
                    </Card>

                    {/* Onglets de contenu */}
                    <div className="card">
                        <div className="card-header p-0 pt-1">
                            <ul className="nav nav-tabs" role="tablist">
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${
                                            activeTab === "overview"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab("overview")}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Vue d'ensemble
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${
                                            activeTab === "teachers"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab("teachers")}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <i className="fas fa-chalkboard-teacher mr-1"></i>
                                        Enseignants ({statistics.total_teachers}
                                        )
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${
                                            activeTab === "classes"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab("classes")}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <i className="fas fa-users mr-1"></i>
                                        Classes ({statistics.total_classes})
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${
                                            activeTab === "schedules"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setActiveTab("schedules")
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <i className="fas fa-calendar mr-1"></i>
                                        Plannings ({statistics.total_schedules})
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${
                                            activeTab === "progress"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab("progress")}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <i className="fas fa-chart-line mr-1"></i>
                                        Progression
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body">
                            {/* Onglet Vue d'ensemble */}
                            {activeTab === "overview" && (
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="mb-4">
                                            <h5>
                                                <i className="fas fa-align-left mr-2"></i>
                                                Description
                                            </h5>
                                            <p className="text-justify">
                                                {course.description ||
                                                    "Aucune description disponible."}
                                            </p>
                                        </div>

                                        {course.objectives && (
                                            <div className="mb-4">
                                                <h5>
                                                    <i className="fas fa-bullseye mr-2"></i>
                                                    Objectifs pédagogiques
                                                </h5>
                                                <div className="alert alert-info">
                                                    <pre
                                                        style={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        {course.objectives}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}

                                        {course.prerequisites && (
                                            <div className="mb-4">
                                                <h5>
                                                    <i className="fas fa-list-check mr-2"></i>
                                                    Prérequis
                                                </h5>
                                                <div className="alert alert-warning">
                                                    <pre
                                                        style={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        {course.prerequisites}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}

                                        {course.evaluation_method && (
                                            <div className="mb-4">
                                                <h5>
                                                    <i className="fas fa-clipboard-check mr-2"></i>
                                                    Méthode d'évaluation
                                                </h5>
                                                <div className="alert alert-success">
                                                    <pre
                                                        style={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        {
                                                            course.evaluation_method
                                                        }
                                                    </pre>
                                                </div>
                                            </div>
                                        )}

                                        {course.resources && (
                                            <div className="mb-4">
                                                <h5>
                                                    <i className="fas fa-tools mr-2"></i>
                                                    Ressources nécessaires
                                                </h5>
                                                <div className="alert alert-secondary">
                                                    <pre
                                                        style={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        {course.resources}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-4">
                                        <Card
                                            title="Informations techniques"
                                            icon="fas fa-cog"
                                        >
                                            <table className="table table-sm">
                                                <tr>
                                                    <td>
                                                        <strong>Code:</strong>
                                                    </td>
                                                    <td>{course.code}</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            Crédits:
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-info">
                                                            {course.credits}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Durée:</strong>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-success">
                                                            {course.total_hours}
                                                            h
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            Tarif/h:
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        {formatCurrency(
                                                            course.hourly_rate
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            Coût total:
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <strong className="text-success">
                                                            {formatCurrency(
                                                                statistics.total_cost
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            </table>
                                        </Card>

                                        <Card
                                            title="Année académique"
                                            icon="fas fa-calendar-alt"
                                            className="mt-3"
                                        >
                                            <div className="text-center">
                                                <h5>
                                                    {course.academic_year.name}
                                                </h5>
                                                {course.academic_year
                                                    .is_active ? (
                                                    <span className="badge badge-success badge-lg">
                                                        <i className="fas fa-star mr-1"></i>
                                                        Année active
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-secondary badge-lg">
                                                        Année inactive
                                                    </span>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {/* Onglet Enseignants */}
                            {activeTab === "teachers" && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5>Enseignants assignés</h5>
                                        <Link
                                            href={route(
                                                "scolarite.courses.edit",
                                                course.id
                                            )}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <i className="fas fa-edit mr-1"></i>
                                            Modifier les assignations
                                        </Link>
                                    </div>

                                    {course.teachers.length === 0 ? (
                                        <Alert type="warning">
                                            Aucun enseignant n'est assigné à ce
                                            cours.
                                        </Alert>
                                    ) : (
                                        <div className="row">
                                            {course.teachers.map((teacher) => (
                                                <div
                                                    key={teacher.id}
                                                    className="col-md-6 mb-3"
                                                >
                                                    <div className="card">
                                                        <div className="card-body">
                                                            <div className="d-flex align-items-center">
                                                                <div className="mr-3">
                                                                    <div className="avatar-circle bg-primary text-white">
                                                                        <i className="fas fa-user"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1">
                                                                        {
                                                                            teacher.name
                                                                        }
                                                                    </h6>
                                                                    <p className="text-muted mb-1">
                                                                        {
                                                                            teacher.email
                                                                        }
                                                                    </p>
                                                                    <small className="text-info">
                                                                        Rôle:{" "}
                                                                        {
                                                                            teacher.role
                                                                        }
                                                                    </small>
                                                                </div>
                                                                <div>
                                                                    <Link
                                                                        href={route(
                                                                            "admin.users.show",
                                                                            teacher.id
                                                                        )}
                                                                        className="btn btn-sm btn-outline-info"
                                                                    >
                                                                        <i className="fas fa-eye"></i>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Onglet Classes */}
                            {activeTab === "classes" && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5>Classes concernées</h5>
                                        <Link
                                            href={route(
                                                "scolarite.courses.edit",
                                                course.id
                                            )}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <i className="fas fa-edit mr-1"></i>
                                            Modifier les assignations
                                        </Link>
                                    </div>

                                    {course.classes.length === 0 ? (
                                        <Alert type="warning">
                                            Aucune classe n'est assignée à ce
                                            cours.
                                        </Alert>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Classe</th>
                                                        <th>Niveau</th>
                                                        <th>Étudiants</th>
                                                        <th>Capacité</th>
                                                        <th>
                                                            Taux d'occupation
                                                        </th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {course.classes.map(
                                                        (schoolClass) => {
                                                            const studentCount =
                                                                schoolClass.students
                                                                    ? schoolClass
                                                                          .students
                                                                          .length
                                                                    : 0;
                                                            const occupationRate =
                                                                Math.round(
                                                                    (studentCount /
                                                                        schoolClass.capacity) *
                                                                        100
                                                                );

                                                            return (
                                                                <tr
                                                                    key={
                                                                        schoolClass.id
                                                                    }
                                                                >
                                                                    <td>
                                                                        <strong>
                                                                            {
                                                                                schoolClass.name
                                                                            }
                                                                        </strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {
                                                                                schoolClass.code
                                                                            }
                                                                        </small>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge badge-info">
                                                                            {
                                                                                schoolClass.level
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            studentCount
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            schoolClass.capacity
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        <div
                                                                            className="progress"
                                                                            style={{
                                                                                height: "20px",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                className={`progress-bar bg-${
                                                                                    occupationRate >=
                                                                                    90
                                                                                        ? "danger"
                                                                                        : occupationRate >=
                                                                                          75
                                                                                        ? "warning"
                                                                                        : "success"
                                                                                }`}
                                                                                style={{
                                                                                    width: `${Math.min(
                                                                                        occupationRate,
                                                                                        100
                                                                                    )}%`,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    occupationRate
                                                                                }

                                                                                %
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <Link
                                                                            href={route(
                                                                                "scolarite.classes.show",
                                                                                schoolClass.id
                                                                            )}
                                                                            className="btn btn-sm btn-outline-info"
                                                                        >
                                                                            <i className="fas fa-eye"></i>
                                                                        </Link>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Onglet Plannings */}
                            {activeTab === "schedules" && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5>Emplois du temps</h5>
                                        <Link
                                            href={route(
                                                "scolarite.planning.schedules.create",
                                                { course_id: course.id }
                                            )}
                                            className="btn btn-success btn-sm"
                                        >
                                            <i className="fas fa-plus mr-1"></i>
                                            Nouveau planning
                                        </Link>
                                    </div>

                                    {course.schedules.length === 0 ? (
                                        <Alert type="info">
                                            Aucun planning n'est encore défini
                                            pour ce cours.
                                        </Alert>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Horaires</th>
                                                        <th>Classe</th>
                                                        <th>Enseignant</th>
                                                        <th>Salle</th>
                                                        <th>Statut</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {course.schedules.map(
                                                        (schedule) => (
                                                            <tr
                                                                key={
                                                                    schedule.id
                                                                }
                                                            >
                                                                <td>
                                                                    {formatDate(
                                                                        schedule.date
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        schedule.start_time
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        schedule.end_time
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        schedule
                                                                            .school_class
                                                                            ?.name
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        schedule
                                                                            .teacher
                                                                            ?.name
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {schedule
                                                                        .classroom
                                                                        ?.name ||
                                                                        "Non assignée"}
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`badge ${
                                                                            schedule.status ===
                                                                            "completed"
                                                                                ? "badge-success"
                                                                                : schedule.status ===
                                                                                  "cancelled"
                                                                                ? "badge-danger"
                                                                                : schedule.status ===
                                                                                  "in_progress"
                                                                                ? "badge-warning"
                                                                                : "badge-secondary"
                                                                        }`}
                                                                    >
                                                                        {schedule.status ===
                                                                        "completed"
                                                                            ? "Terminé"
                                                                            : schedule.status ===
                                                                              "cancelled"
                                                                            ? "Annulé"
                                                                            : schedule.status ===
                                                                              "in_progress"
                                                                            ? "En cours"
                                                                            : "Programmé"}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <Link
                                                                        href={route(
                                                                            "scolarite.planning.schedules.show",
                                                                            schedule.id
                                                                        )}
                                                                        className="btn btn-sm btn-outline-info"
                                                                    >
                                                                        <i className="fas fa-eye"></i>
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Onglet Progression */}
                            {activeTab === "progress" && (
                                <div>
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <Card
                                                title="Progression générale"
                                                icon="fas fa-chart-pie"
                                            >
                                                <div className="text-center mb-3">
                                                    <div
                                                        className="progress mb-2"
                                                        style={{
                                                            height: "30px",
                                                        }}
                                                    >
                                                        <div
                                                            className={`progress-bar bg-${getProgressColor(
                                                                statistics.progress_percentage
                                                            )}`}
                                                            style={{
                                                                width: `${statistics.progress_percentage}%`,
                                                            }}
                                                        >
                                                            {
                                                                statistics.progress_percentage
                                                            }
                                                            %
                                                        </div>
                                                    </div>
                                                    <p className="text-muted">
                                                        {
                                                            statistics.completed_hours
                                                        }
                                                        h sur{" "}
                                                        {course.total_hours}h
                                                        terminées
                                                    </p>
                                                </div>

                                                <div className="row text-center">
                                                    <div className="col-6">
                                                        <div className="description-block">
                                                            <h5 className="description-header text-success">
                                                                {
                                                                    statistics.completed_hours
                                                                }
                                                                h
                                                            </h5>
                                                            <span className="description-text">
                                                                TERMINÉ
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="description-block">
                                                            <h5 className="description-header text-info">
                                                                {
                                                                    statistics.remaining_hours
                                                                }
                                                                h
                                                            </h5>
                                                            <span className="description-text">
                                                                RESTANT
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>

                                        <div className="col-md-6">
                                            <Card
                                                title="Finances"
                                                icon="fas fa-money-bill"
                                            >
                                                <div className="text-center mb-3">
                                                    <h4 className="text-success">
                                                        {formatCurrency(
                                                            statistics.completed_cost
                                                        )}
                                                    </h4>
                                                    <p className="text-muted">
                                                        sur{" "}
                                                        {formatCurrency(
                                                            statistics.total_cost
                                                        )}{" "}
                                                        budgétés
                                                    </p>
                                                    <div
                                                        className="progress"
                                                        style={{
                                                            height: "20px",
                                                        }}
                                                    >
                                                        <div
                                                            className="progress-bar bg-success"
                                                            style={{
                                                                width: `${statistics.progress_percentage}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <table className="table table-sm">
                                                    <tr>
                                                        <td>Tarif horaire:</td>
                                                        <td>
                                                            <strong>
                                                                {formatCurrency(
                                                                    course.hourly_rate
                                                                )}
                                                            </strong>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Coût réalisé:</td>
                                                        <td>
                                                            <strong className="text-success">
                                                                {formatCurrency(
                                                                    statistics.completed_cost
                                                                )}
                                                            </strong>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Coût restant:</td>
                                                        <td>
                                                            <strong className="text-info">
                                                                {formatCurrency(
                                                                    statistics.total_cost -
                                                                        statistics.completed_cost
                                                                )}
                                                            </strong>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </Card>
                                        </div>
                                    </div>

                                    <Card
                                        title="Statistiques détaillées"
                                        icon="fas fa-chart-bar"
                                    >
                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="description-block border-right">
                                                    <h5 className="description-header">
                                                        {
                                                            statistics.total_students
                                                        }
                                                    </h5>
                                                    <span className="description-text">
                                                        ÉTUDIANTS
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="description-block border-right">
                                                    <h5 className="description-header">
                                                        {
                                                            statistics.total_teachers
                                                        }
                                                    </h5>
                                                    <span className="description-text">
                                                        ENSEIGNANTS
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="description-block">
                                                    <h5 className="description-header">
                                                        {
                                                            statistics.total_classes
                                                        }
                                                    </h5>
                                                    <span className="description-text">
                                                        CLASSES
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .info-box {
                    display: flex;
                    position: relative;
                    border-radius: 0.25rem;
                    background: #fff;
                    border: 1px solid rgba(0,0,0,.125);
                    margin-bottom: 1rem;
                }

                .info-box-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 70px;
                    border-radius: 0.25rem 0 0 0.25rem;
                    font-size: 1.875rem;
                    color: white;
                }

                .info-box-content {
                    flex: 1;
                    padding: 0.5rem 0.75rem;
                }

                .info-box-text {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 400;
                    color: #6c757d;
                    text-transform: uppercase;
                }

                .info-box-number {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .avatar-circle {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }

                .description-block {
                    display: block;
                }

                .description-header {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                }

                .description-text {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    font-weight: 600;
                    color: #6c757d;
                }

                .border-right {
                    border-right: 1px solid #dee2e6;
                }

                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }

                .nav-tabs .nav-link {
                    border: 1px solid transparent;
                    border-top-left-radius: 0.25rem;
                    border-top-right-radius: 0.25rem;
                }

                .nav-tabs .nav-link:hover {
                    border-color: #e9ecef #e9ecef #dee2e6;
                }

                .nav-tabs .nav-link.active {
                    color: #495057;
                    background-color: #fff;
                    border-color: #dee2e6 #dee2e6 #fff;
                }

                .progress {
                    border-radius: 10px;
                }

                .progress-bar {
                    border-radius: 10px;
                }

                pre {
                    background: none;
                    border: none;
                    margin: 0;
                    padding: 0;
                }
            `}</style>
        </AdminLayout>
    );
}
