import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Show({ student, stats }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    const getStatusBadge = (status) => {
        const badges = {
            actif: "badge-success",
            inactif: "badge-secondary",
            suspendu: "badge-warning",
            exclu: "badge-danger",
        };
        return badges[status] || "badge-secondary";
    };

    const handleResetPassword = () => {
        if (newPassword.length < 8) {
            alert("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }
        router.post(
            route("scolarite.etudiants.reset-password", student.id),
            {
                password: newPassword,
            },
            {
                onSuccess: () => {
                    setShowResetPasswordModal(false);
                    setNewPassword("");
                },
            }
        );
    };

    const handleDelete = () => {
        if (
            confirm(
                `Êtes-vous sûr de vouloir supprimer l'étudiant ${student.name} ${student.prenom} ?`
            )
        ) {
            router.delete(route("scolarite.etudiants.destroy", student.id));
        }
    };

    const handleStatusChange = (newStatus) => {
        if (confirm(`Voulez-vous vraiment changer le statut de l'étudiant ?`)) {
            router.patch(route("scolarite.etudiants.update", student.id), {
                statut: newStatus,
            });
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return "N/A";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }
        return age;
    };

    return (
        <AdminLayout title={`${student.name} ${student.prenom}`}>
            <Head title={`${student.name} ${student.prenom}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Profil de l'Étudiant</h1>
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
                                            "scolarite.etudiants.index"
                                        )}
                                    >
                                        Étudiants
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    {student.name}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        {/* Colonne gauche - Info profil */}
                        <div className="col-md-3">
                            <div className="card card-primary card-outline">
                                <div className="card-body box-profile">
                                    <div className="text-center">
                                        <img
                                            className="profile-user-img img-fluid img-circle"
                                            src={
                                                student.photo_url ||
                                                "/images/default-avatar.png"
                                            }
                                            alt={student.name}
                                            style={{
                                                width: "150px",
                                                height: "150px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>

                                    <h3 className="profile-username text-center">
                                        {student.name} {student.prenom}
                                    </h3>

                                    <p className="text-muted text-center">
                                        {student.student_enrollment
                                            ?.school_class?.name ||
                                            "Non assigné"}
                                    </p>

                                    <ul className="list-group list-group-unbordered mb-3">
                                        <li className="list-group-item">
                                            <b>Matricule</b>
                                            <a className="float-right">
                                                {student.matricule}
                                            </a>
                                        </li>
                                        <li className="list-group-item">
                                            <b>Statut</b>
                                            <span
                                                className={`badge float-right ${getStatusBadge(
                                                    student.statut
                                                )}`}
                                            >
                                                {student.statut}
                                            </span>
                                        </li>
                                        <li className="list-group-item">
                                            <b>Âge</b>
                                            <a className="float-right">
                                                {calculateAge(
                                                    student.date_naissance
                                                )}{" "}
                                                ans
                                            </a>
                                        </li>
                                        <li className="list-group-item">
                                            <b>Taux de présence</b>
                                            <a className="float-right">
                                                {stats.attendance_rate}%
                                            </a>
                                        </li>
                                        {student.student_enrollment
                                            ?.scholarship && (
                                            <li className="list-group-item">
                                                <span className="badge badge-info">
                                                    Boursier
                                                </span>
                                            </li>
                                        )}
                                    </ul>

                                    <div className="btn-group btn-group-sm w-100 mb-2">
                                        <Link
                                            href={route(
                                                "scolarite.etudiants.edit",
                                                student.id
                                            )}
                                            className="btn btn-primary"
                                        >
                                            <i className="fas fa-edit"></i>{" "}
                                            Modifier
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-info"
                                            onClick={() =>
                                                setShowResetPasswordModal(true)
                                            }
                                        >
                                            <i className="fas fa-key"></i> Mot
                                            de passe
                                        </button>
                                    </div>

                                    <div className="btn-group btn-group-sm w-100">
                                        <button
                                            type="button"
                                            className="btn btn-warning"
                                            onClick={() =>
                                                handleStatusChange("suspendu")
                                            }
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

                            {/* Carte de contact */}
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
                                        {student.email}
                                    </p>
                                    <hr />
                                    <strong>
                                        <i className="fas fa-phone mr-1"></i>{" "}
                                        Téléphone
                                    </strong>
                                    <p className="text-muted">
                                        {student.telephone || "Non renseigné"}
                                    </p>
                                    <hr />
                                    <strong>
                                        <i className="fas fa-map-marker-alt mr-1"></i>{" "}
                                        Adresse
                                    </strong>
                                    <p className="text-muted">
                                        {student.adresse || "Non renseignée"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Colonne droite - Détails */}
                        <div className="col-md-9">
                            {/* Statistiques */}
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="info-box">
                                        <span className="info-box-icon bg-danger">
                                            <i className="fas fa-times-circle"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Absences
                                            </span>
                                            <span className="info-box-number">
                                                {stats.total_absences}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-box">
                                        <span className="info-box-icon bg-success">
                                            <i className="fas fa-check-circle"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Présence
                                            </span>
                                            <span className="info-box-number">
                                                {stats.attendance_rate}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-box">
                                        <span className="info-box-icon bg-info">
                                            <i className="fas fa-folder"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Ressources
                                            </span>
                                            <span className="info-box-number">
                                                {stats.total_resources}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-box">
                                        <span className="info-box-icon bg-warning">
                                            <i className="fas fa-calendar"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Inscription
                                            </span>
                                            <span className="info-box-number">
                                                {stats.enrollment_date}
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
                                                    activeTab === "academic"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveTab("academic");
                                                }}
                                            >
                                                Informations académiques
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "family"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveTab("family");
                                                }}
                                            >
                                                Famille
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "attendance"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveTab("attendance");
                                                }}
                                            >
                                                Présences
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "resources"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveTab("resources");
                                                }}
                                            >
                                                Ressources
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
                                                                        student.date_naissance
                                                                    ).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>
                                                                    Lieu de
                                                                    naissance
                                                                </th>
                                                                <td>
                                                                    {student.lieu_naissance ||
                                                                        "Non renseigné"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>Genre</th>
                                                                <td>
                                                                    {student.genre ===
                                                                    "M"
                                                                        ? "Masculin"
                                                                        : "Féminin"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>Email</th>
                                                                <td>
                                                                    {
                                                                        student.email
                                                                    }
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>
                                                                    Téléphone
                                                                </th>
                                                                <td>
                                                                    {student.telephone ||
                                                                        "Non renseigné"}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="col-md-6">
                                                    <h5>Scolarité</h5>
                                                    <table className="table table-sm">
                                                        <tbody>
                                                            <tr>
                                                                <th>
                                                                    Classe
                                                                    actuelle
                                                                </th>
                                                                <td>
                                                                    {student.current_class ??
                                                                        "Non assigné"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>
                                                                    Année
                                                                    académique
                                                                </th>
                                                                <td>
                                                                    {student.current_academic_year ??
                                                                        "—"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>
                                                                    Date
                                                                    d'inscription
                                                                </th>
                                                                <td>
                                                                    {student.enrollment_date ??
                                                                        "—"}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th>Statut</th>
                                                                <td>
                                                                    <span
                                                                        className={`badge ${getStatusBadge(
                                                                            student.statut
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            student.statut
                                                                        }
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {student.medical_info && (
                                                <div className="mt-3">
                                                    <h5>
                                                        Informations médicales
                                                    </h5>
                                                    <div className="alert alert-warning">
                                                        <i className="icon fas fa-exclamation-triangle"></i>
                                                        {student.medical_info}
                                                    </div>
                                                </div>
                                            )}

                                            {student.notes_admin && (
                                                <div className="mt-3">
                                                    <h5>
                                                        Notes administratives
                                                    </h5>
                                                    <div className="alert alert-info">
                                                        {student.notes_admin}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Informations académiques */}
                                    {activeTab === "academic" && (
                                        <div>
                                            <h5 className="mb-3">
                                                Parcours Académique
                                            </h5>
                                            <table className="table table-hover">
                                                <tbody>
                                                    <tr>
                                                        <th>
                                                            Établissement
                                                            précédent
                                                        </th>
                                                        <td>
                                                            {student.previous_school ||
                                                                "Non renseigné"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th>Année du Bac</th>
                                                        <td>
                                                            {student.bac_year ||
                                                                "Non renseigné"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th>Mention au Bac</th>
                                                        <td>
                                                            {student.bac_grade ||
                                                                "Non renseigné"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th>Bourse</th>
                                                        <td>
                                                            {student
                                                                .student_enrollment
                                                                ?.scholarship ? (
                                                                <span className="badge badge-info">
                                                                    Oui -
                                                                    Boursier
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-secondary">
                                                                    Non
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div className="mt-4">
                                                <h5>Classe actuelle</h5>
                                                {student.student_enrollment
                                                    ?.school_class && (
                                                    <div className="card bg-light">
                                                        <div className="card-body">
                                                            <h6>
                                                                {
                                                                    student
                                                                        .student_enrollment
                                                                        .school_class
                                                                        .name
                                                                }
                                                            </h6>
                                                            <p className="mb-1">
                                                                <strong>
                                                                    Niveau:
                                                                </strong>{" "}
                                                                {
                                                                    student
                                                                        .student_enrollment
                                                                        .school_class
                                                                        .level
                                                                }
                                                            </p>
                                                            <p className="mb-1">
                                                                <strong>
                                                                    Capacité:
                                                                </strong>{" "}
                                                                {
                                                                    student
                                                                        .student_enrollment
                                                                        .school_class
                                                                        .students_count
                                                                }
                                                                /
                                                                {
                                                                    student
                                                                        .student_enrollment
                                                                        .school_class
                                                                        .capacity
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3">
                                                <Link
                                                    href={route(
                                                        "scolarite.etudiants.edit",
                                                        student.id
                                                    )}
                                                    className="btn btn-primary"
                                                >
                                                    <i className="fas fa-edit mr-1"></i>
                                                    Modifier les informations
                                                    académiques
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {/* Informations famille */}
                                    {activeTab === "family" && (
                                        <div>
                                            <h5 className="mb-3">
                                                Parent / Tuteur légal
                                            </h5>
                                            <table className="table table-hover">
                                                <tbody>
                                                    <tr>
                                                        <th>Nom complet</th>
                                                        <td>
                                                            {student.parent_name ||
                                                                "Non renseigné"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th>Téléphone</th>
                                                        <td>
                                                            {student.parent_phone ||
                                                                "Non renseigné"}
                                                            {student.parent_phone && (
                                                                <a
                                                                    href={`tel:${student.parent_phone}`}
                                                                    className="btn btn-sm btn-info ml-2"
                                                                >
                                                                    <i className="fas fa-phone"></i>{" "}
                                                                    Appeler
                                                                </a>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th>Email</th>
                                                        <td>
                                                            {student.parent_email ||
                                                                "Non renseigné"}
                                                            {student.parent_email && (
                                                                <a
                                                                    href={`mailto:${student.parent_email}`}
                                                                    className="btn btn-sm btn-primary ml-2"
                                                                >
                                                                    <i className="fas fa-envelope"></i>{" "}
                                                                    Envoyer
                                                                    email
                                                                </a>
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <h5 className="mt-4 mb-3">
                                                Contact d'urgence
                                            </h5>
                                            <div className="alert alert-danger">
                                                <h6>
                                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                                    En cas d'urgence
                                                </h6>
                                                <p className="mb-0">
                                                    {student.emergency_contact ||
                                                        "Aucun contact d'urgence renseigné"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Présences */}
                                    {activeTab === "attendance" && (
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5>Historique de présence</h5>
                                                <Link
                                                    href={route(
                                                        "scolarite.attendances.index",
                                                        student.id
                                                    )}
                                                    className="btn btn-primary"
                                                >
                                                    <i className="fas fa-list mr-1"></i>
                                                    Voir détails complets
                                                </Link>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card bg-light">
                                                        <div className="card-body">
                                                            <h6>
                                                                Statistiques
                                                                générales
                                                            </h6>
                                                            <ul>
                                                                <li>
                                                                    Taux de
                                                                    présence:{" "}
                                                                    <strong className="text-success">
                                                                        {
                                                                            stats.attendance_rate
                                                                        }
                                                                        %
                                                                    </strong>
                                                                </li>
                                                                <li>
                                                                    Total
                                                                    absences:{" "}
                                                                    <strong className="text-danger">
                                                                        {
                                                                            stats.total_absences
                                                                        }
                                                                    </strong>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="alert alert-info">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                Pour consulter l'historique
                                                détaillé des présences, absences
                                                et retards, cliquez sur le
                                                bouton "Voir détails complets"
                                                ci-dessus.
                                            </div>
                                        </div>
                                    )}

                                    {/* Ressources */}
                                    {activeTab === "resources" && (
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5>Ressources pédagogiques</h5>
                                                <Link
                                                    href={route(
                                                        "scolarite.resources.index",
                                                        student.id
                                                    )}
                                                    className="btn btn-primary"
                                                >
                                                    <i className="fas fa-folder mr-1"></i>
                                                    Gérer les ressources
                                                </Link>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="card bg-light">
                                                        <div className="card-body">
                                                            <h6>
                                                                Total des
                                                                ressources
                                                            </h6>
                                                            <p className="mb-0">
                                                                <strong>
                                                                    {
                                                                        stats.total_resources
                                                                    }
                                                                </strong>{" "}
                                                                ressources
                                                                disponibles
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="alert alert-info">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                Les ressources incluent les
                                                devoirs, anciens sujets
                                                d'examens, corrections et autres
                                                documents pédagogiques.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal Reset Password */}
            {showResetPasswordModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-info">
                                <h5 className="modal-title">
                                    <i className="fas fa-key mr-2"></i>
                                    Réinitialiser le mot de passe
                                </h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() =>
                                        setShowResetPasswordModal(false)
                                    }
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Définir un nouveau mot de passe pour{" "}
                                    <strong>
                                        {student.name} {student.prenom}
                                    </strong>
                                </p>
                                <div className="form-group">
                                    <label>Nouveau mot de passe</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Minimum 8 caractères"
                                    />
                                    <small className="text-muted">
                                        Le mot de passe sera communiqué à
                                        l'étudiant
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setShowResetPasswordModal(false)
                                    }
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-info"
                                    onClick={handleResetPassword}
                                >
                                    <i className="fas fa-check mr-1"></i>
                                    Réinitialiser
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
