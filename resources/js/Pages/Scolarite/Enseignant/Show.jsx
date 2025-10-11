import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Show({
    teacher,
    currentContract,
    teachingStats,
    recentSchedules,
}) {
    const [activeTab, setActiveTab] = useState("overview");

    const getStatusBadge = (status) => {
        const badges = {
            actif: "badge-success",
            inactif: "badge-secondary",
            conge: "badge-warning",
        };
        return badges[status] || "badge-secondary";
    };

    const handleDelete = () => {
        if (
            confirm(
                `Êtes-vous sûr de vouloir supprimer l'enseignant ${teacher.name} ${teacher.prenom} ?`
            )
        ) {
            router.delete(route("academic.enseignants.destroy", teacher.id));
        }
    };

    const handleSuspend = () => {
        if (
            confirm(
                `Voulez-vous suspendre l'enseignant ${teacher.name} ${teacher.prenom} ?`
            )
        ) {
            router.patch(route("academic.enseignants.update", teacher.id), {
                statut: "inactif",
            });
        }
    };

    return (
        <AdminLayout title={`${teacher.name} ${teacher.prenom}`}>
            <Head title={`${teacher.name} ${teacher.prenom}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Profil de l'Enseignant</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("admin.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "academic.enseignants.index"
                                        )}
                                    >
                                        Enseignants
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    {teacher.name}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* En-tête du profil */}
                    <div className="row">
                        <div className="col-md-3">
                            <div className="card card-primary card-outline">
                                <div className="card-body box-profile">
                                    <div className="text-center">
                                        <img
                                            className="profile-user-img img-fluid img-circle"
                                            src={
                                                teacher.photo
                                                    ? `/storage/${teacher.photo}`
                                                    : "/images/default-avatar.png"
                                            }
                                            alt={teacher.name}
                                        />
                                    </div>
                                    <h3 className="profile-username text-center">
                                        {teacher.name} {teacher.prenom}
                                    </h3>
                                    <p className="text-muted text-center">
                                        {teacher.specialization}
                                    </p>

                                    <ul className="list-group list-group-unbordered mb-3">
                                        <li className="list-group-item">
                                            <b>Matricule</b>
                                            <a className="float-right">
                                                {teacher.matricule}
                                            </a>
                                        </li>
                                        <li className="list-group-item">
                                            <b>Statut</b>
                                            <span
                                                className={`badge float-right ${getStatusBadge(
                                                    teacher.statut
                                                )}`}
                                            >
                                                {teacher.statut}
                                            </span>
                                        </li>
                                        <li className="list-group-item">
                                            <b>Cours</b>
                                            <a className="float-right">
                                                {teachingStats.total_courses}
                                            </a>
                                        </li>
                                        <li className="list-group-item">
                                            <b>Classes</b>
                                            <a className="float-right">
                                                {teachingStats.classes_taught}
                                            </a>
                                        </li>
                                    </ul>

                                    <div className="btn-group btn-group-sm w-100 mb-2">
                                        <Link
                                            href={route(
                                                "academic.enseignants.edit",
                                                teacher.id
                                            )}
                                            className="btn btn-primary"
                                        >
                                            <i className="fas fa-edit"></i>{" "}
                                            Modifier
                                        </Link>
                                        {currentContract && (
                                            <a
                                                href={route(
                                                    "academic.contracts.download",
                                                    currentContract.id
                                                )}
                                                className="btn btn-success"
                                                target="_blank"
                                            >
                                                <i className="fas fa-file-pdf"></i>{" "}
                                                Contrat
                                            </a>
                                        )}
                                    </div>

                                    <div className="btn-group btn-group-sm w-100">
                                        <button
                                            type="button"
                                            className="btn btn-warning"
                                            onClick={handleSuspend}
                                        >
                                            <i className="fas fa-pause"></i>{" "}
                                            Suspendre
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={handleDelete}
                                        >
                                            <i className="fas fa-trash"></i>{" "}
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Informations de contact */}
                            <div className="card card-primary">
                                <div className="card-header">
                                    <h3 className="card-title">Contact</h3>
                                </div>
                                <div className="card-body">
                                    <strong>
                                        <i className="fas fa-envelope mr-1"></i>{" "}
                                        Email
                                    </strong>
                                    <p className="text-muted">
                                        {teacher.email}
                                    </p>
                                    <hr />
                                    <strong>
                                        <i className="fas fa-phone mr-1"></i>{" "}
                                        Téléphone
                                    </strong>
                                    <p className="text-muted">
                                        {teacher.telephone}
                                    </p>
                                    <hr />
                                    <strong>
                                        <i className="fas fa-map-marker-alt mr-1"></i>{" "}
                                        Adresse
                                    </strong>
                                    <p className="text-muted">
                                        {teacher.adresse || "Non renseignée"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-9">
                            {/* Statistiques */}
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="info-box">
                                        <span className="info-box-icon bg-info">
                                            <i className="fas fa-book"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Heures Assignées
                                            </span>
                                            <span className="info-box-number">
                                                {
                                                    teachingStats.total_hours_assigned
                                                }
                                                h
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-box">
                                        <span className="info-box-icon bg-success">
                                            <i className="fas fa-check"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Heures Complétées
                                            </span>
                                            <span className="info-box-number">
                                                {teachingStats.completed_hours}h
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-box">
                                        <span className="info-box-icon bg-warning">
                                            <i className="fas fa-users"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Classes
                                            </span>
                                            <span className="info-box-number">
                                                {teachingStats.classes_taught}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-box">
                                        <span className="info-box-icon bg-danger">
                                            <i className="fas fa-money-bill"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Gains Totaux
                                            </span>
                                            <span className="info-box-number">
                                                {teachingStats.total_earnings?.toLocaleString()}{" "}
                                                XAF
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Onglets */}
                            <div className="card">
                                <div className="card-header p-2">
                                    <ul className="nav nav-pills">
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "overview"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveTab("overview");
                                                }}
                                            >
                                                Vue d'ensemble
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "courses"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveTab("courses");
                                                }}
                                            >
                                                Cours
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "schedules"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveTab("schedules");
                                                }}
                                            >
                                                Emploi du temps
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "contract"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveTab("contract");
                                                }}
                                            >
                                                Contrat
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body">
                                    {/* Vue d'ensemble */}
                                    {activeTab === "overview" && (
                                        <div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <h5>
                                                        Informations
                                                        Personnelles
                                                    </h5>
                                                    <table className="table table-sm">
                                                        <tbody>
                                                            <tr>
                                                                <th>
                                                                    Date de
                                                                    naissance
                                                                </th>
                                                                <td>
                                                                    {new Date(
                                                                        teacher.date_naissance
                                                                    ).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>
                                                                    Lieu de
                                                                    naissance
                                                                </th>
                                                                <td>
                                                                    {teacher.lieu_naissance ||
                                                                        "Non renseigné"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>Sexe</th>
                                                                <td>
                                                                    {teacher.sexe ===
                                                                    "M"
                                                                        ? "Masculin"
                                                                        : "Féminin"}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="col-md-6">
                                                    <h5>
                                                        Informations
                                                        Professionnelles
                                                    </h5>
                                                    <table className="table table-sm">
                                                        <tbody>
                                                            <tr>
                                                                <th>
                                                                    Specialité
                                                                </th>
                                                                <td>
                                                                    {teacher.specialite ||
                                                                        "Non renseignée"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>Grade</th>
                                                                <td>
                                                                    {teacher.grade ||
                                                                        "Non renseignée"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>
                                                                    Date
                                                                    d'embauche
                                                                </th>
                                                                <td>
                                                                    {teacher.hire_date
                                                                        ? new Date(
                                                                              teacher.hire_date
                                                                          ).toLocaleDateString()
                                                                        : "Non renseignée"}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {teacher.notes_admin && (
                                                <div className="mt-3">
                                                    <h5>
                                                        Notes administratives
                                                    </h5>
                                                    <div className="alert alert-info">
                                                        {teacher.notes_admin}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Cours */}
                                    {activeTab === "courses" && (
                                        <div>
                                            <h5 className="mb-3">
                                                Cours Assignés (
                                                {teacher.teacherCourses
                                                    ?.length || 0}
                                                )
                                            </h5>
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Code</th>
                                                            <th>Cours</th>
                                                            <th>Crédits</th>
                                                            <th>Heures</th>
                                                            <th>
                                                                Taux horaire
                                                            </th>
                                                            <th>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {teacher.teacherCourses &&
                                                        teacher.teacherCourses
                                                            .length > 0 ? (
                                                            teacher.teacherCourses.map(
                                                                (course) => (
                                                                    <tr
                                                                        key={
                                                                            course.id
                                                                        }
                                                                    >
                                                                        <td>
                                                                            <span className="badge badge-primary">
                                                                                {
                                                                                    course.code
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                course.name
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                course.credits
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                course.total_hours
                                                                            }
                                                                            h
                                                                        </td>
                                                                        <td>
                                                                            {course.hourly_rate?.toLocaleString()}{" "}
                                                                            XAF
                                                                        </td>
                                                                        <td>
                                                                            <strong>
                                                                                {(
                                                                                    course.total_hours *
                                                                                    course.hourly_rate
                                                                                )?.toLocaleString()}{" "}
                                                                                XAF
                                                                            </strong>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td
                                                                    colSpan="6"
                                                                    className="text-center text-muted"
                                                                >
                                                                    Aucun cours
                                                                    assigné
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Emploi du temps */}
                                    {activeTab === "schedules" && (
                                        <div>
                                            <h5 className="mb-3">
                                                Emploi du Temps Récent
                                            </h5>
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Cours</th>
                                                            <th>Horaire</th>
                                                            <th>Classe</th>
                                                            <th>Statut</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {recentSchedules &&
                                                        recentSchedules.length >
                                                            0 ? (
                                                            recentSchedules.map(
                                                                (
                                                                    schedule,
                                                                    index
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <td>
                                                                            {new Date(
                                                                                schedule.date
                                                                            ).toLocaleDateString()}
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                schedule
                                                                                    .course
                                                                                    ?.name
                                                                            }
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
                                                                            <span
                                                                                className={`badge badge-${
                                                                                    schedule.status ===
                                                                                    "completed"
                                                                                        ? "success"
                                                                                        : "warning"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    schedule.status
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td
                                                                    colSpan="5"
                                                                    className="text-center text-muted"
                                                                >
                                                                    Aucun emploi
                                                                    du temps
                                                                    récent
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contrat */}
                                    {activeTab === "contract" && (
                                        <div>
                                            {currentContract ? (
                                                <div>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <h5>
                                                                Informations du
                                                                Contrat
                                                            </h5>
                                                            <table className="table table-sm">
                                                                <tbody>
                                                                    <tr>
                                                                        <th>
                                                                            Numéro
                                                                            de
                                                                            contrat
                                                                        </th>
                                                                        <td>
                                                                            {
                                                                                currentContract.contract_number
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>
                                                                            Type
                                                                        </th>
                                                                        <td>
                                                                            <span className="badge badge-primary">
                                                                                {
                                                                                    currentContract.contract_type
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>
                                                                            Début
                                                                        </th>
                                                                        <td>
                                                                            {new Date(
                                                                                currentContract.start_date
                                                                            ).toLocaleDateString()}
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>
                                                                            Fin
                                                                        </th>
                                                                        <td>
                                                                            {currentContract.end_date
                                                                                ? new Date(
                                                                                      currentContract.end_date
                                                                                  ).toLocaleDateString()
                                                                                : "Indéterminée"}
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>
                                                                            Statut
                                                                        </th>
                                                                        <td>
                                                                            <span
                                                                                className={`badge badge-${
                                                                                    currentContract.status ===
                                                                                    "active"
                                                                                        ? "success"
                                                                                        : "secondary"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    currentContract.status
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h5>
                                                                Rémunération
                                                            </h5>
                                                            <table className="table table-sm">
                                                                <tbody>
                                                                    {currentContract.contract_type ===
                                                                    "hourly" ? (
                                                                        <>
                                                                            <tr>
                                                                                <th>
                                                                                    Taux
                                                                                    horaire
                                                                                </th>
                                                                                <td>
                                                                                    {currentContract.hourly_rate?.toLocaleString()}{" "}
                                                                                    XAF
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th>
                                                                                    Heures
                                                                                    totales
                                                                                </th>
                                                                                <td>
                                                                                    {
                                                                                        currentContract.total_hours
                                                                                    }

                                                                                    h
                                                                                </td>
                                                                            </tr>
                                                                        </>
                                                                    ) : (
                                                                        <tr>
                                                                            <th>
                                                                                Salaire
                                                                                mensuel
                                                                            </th>
                                                                            <td>
                                                                                {currentContract.monthly_salary?.toLocaleString()}{" "}
                                                                                XAF
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                    <tr>
                                                                        <th>
                                                                            Compensation
                                                                            totale
                                                                        </th>
                                                                        <td>
                                                                            <strong>
                                                                                {currentContract.total_compensation?.toLocaleString()}{" "}
                                                                                XAF
                                                                            </strong>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3">
                                                        <h5>
                                                            Cours couverts par
                                                            le contrat
                                                        </h5>
                                                        <p className="text-muted">
                                                            {
                                                                currentContract.courses_summary
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="mt-3">
                                                        <a
                                                            href={route(
                                                                "academic.contracts.download",
                                                                currentContract.id
                                                            )}
                                                            className="btn btn-success"
                                                            target="_blank"
                                                        >
                                                            <i className="fas fa-file-pdf mr-2"></i>
                                                            Télécharger le
                                                            contrat
                                                        </a>
                                                        <Link
                                                            href={route(
                                                                "academic.enseignants.create-contract",
                                                                teacher.id
                                                            )}
                                                            className="btn btn-primary ml-2"
                                                        >
                                                            <i className="fas fa-plus mr-2"></i>
                                                            Nouveau contrat
                                                        </Link>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-5">
                                                    <i className="fas fa-file-contract fa-3x text-muted mb-3"></i>
                                                    <p className="text-muted">
                                                        Aucun contrat actif
                                                    </p>
                                                    <Link
                                                        href={route(
                                                            "academic.enseignants.create-contract",
                                                            teacher.id
                                                        )}
                                                        className="btn btn-primary"
                                                    >
                                                        <i className="fas fa-plus mr-2"></i>
                                                        Créer un contrat
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
