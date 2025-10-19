import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Show({ resource, downloadStats }) {
    const getTypeBadge = (type) => {
        const badges = {
            ancien_cc: "badge-primary",
            ancien_ds: "badge-info",
            session_normale: "badge-danger",
            session_rattrapage: "badge-warning",
            cours: "badge-success",
            td: "badge-secondary",
            tp: "badge-dark",
            correction: "badge-light text-dark",
            autre: "badge-secondary",
        };
        return badges[type] || "badge-secondary";
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();
        const icons = {
            pdf: "fa-file-pdf text-danger",
            doc: "fa-file-word text-primary",
            docx: "fa-file-word text-primary",
            xls: "fa-file-excel text-success",
            xlsx: "fa-file-excel text-success",
            ppt: "fa-file-powerpoint text-warning",
            pptx: "fa-file-powerpoint text-warning",
        };
        return icons[extension] || "fa-file text-secondary";
    };

    return (
        <AdminLayout title={resource.title}>
            <Head title={resource.title} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i
                                    className={`fas ${getFileIcon(
                                        resource.file_name
                                    )} mr-2`}
                                ></i>
                                {resource.title}
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
                                            "scolarite.resources.index"
                                        )}
                                    >
                                        Ressources
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
                                            Informations de la ressource
                                        </h3>
                                        <span
                                            className={`badge ${getTypeBadge(
                                                resource.type
                                            )} badge-lg`}
                                        >
                                            {resource.type_formatted}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p>
                                                <strong>
                                                    <i className="fas fa-chalkboard mr-2 text-primary"></i>
                                                    Classe :
                                                </strong>
                                                <br />
                                                {resource.school_class.name}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p>
                                                <strong>
                                                    <i className="fas fa-book mr-2 text-success"></i>
                                                    Matière :
                                                </strong>
                                                <br />
                                                {resource.subject.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p>
                                                <strong>
                                                    <i className="fas fa-calendar-alt mr-2 text-info"></i>
                                                    Année académique :
                                                </strong>
                                                <br />
                                                {resource.academic_year.name}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p>
                                                <strong>
                                                    <i className="fas fa-user mr-2 text-secondary"></i>
                                                    Ajouté par :
                                                </strong>
                                                <br />
                                                {resource.uploader.name}
                                            </p>
                                        </div>
                                    </div>

                                    {resource.description && (
                                        <div className="row mb-3">
                                            <div className="col-12">
                                                <p>
                                                    <strong>
                                                        <i className="fas fa-align-left mr-2 text-warning"></i>
                                                        Description :
                                                    </strong>
                                                </p>
                                                <p className="text-muted">
                                                    {resource.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Métadonnées */}
                                    {(resource.exam_date ||
                                        resource.semester ||
                                        resource.duration ||
                                        resource.coefficient) && (
                                        <div className="row mb-3">
                                            <div className="col-12">
                                                <h5 className="mb-3">
                                                    <i className="fas fa-info-circle mr-2 text-primary"></i>
                                                    Métadonnées
                                                </h5>
                                            </div>
                                            {resource.exam_date && (
                                                <div className="col-md-6">
                                                    <p>
                                                        <strong>
                                                            Date de l'examen:
                                                        </strong>
                                                        <br />
                                                        {new Date(
                                                            resource.exam_date
                                                        ).toLocaleDateString(
                                                            "fr-FR"
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                            {resource.semester && (
                                                <div className="col-md-6">
                                                    <p>
                                                        <strong>
                                                            Semestre:
                                                        </strong>
                                                        <br />
                                                        <span className="badge badge-info">
                                                            {resource.semester}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                            {resource.duration && (
                                                <div className="col-md-6">
                                                    <p>
                                                        <strong>Durée:</strong>
                                                        <br />
                                                        {resource.duration}{" "}
                                                        minutes
                                                    </p>
                                                </div>
                                            )}
                                            {resource.coefficient && (
                                                <div className="col-md-6">
                                                    <p>
                                                        <strong>
                                                            Coefficient:
                                                        </strong>
                                                        <br />
                                                        {resource.coefficient}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Fichier */}
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="alert alert-light border">
                                                <h5>
                                                    <i className="fas fa-file mr-2"></i>
                                                    Fichier
                                                </h5>
                                                <p className="mb-0">
                                                    <strong>Nom :</strong>{" "}
                                                    {resource.file_name}
                                                    <br />
                                                    <strong>
                                                        Taille :
                                                    </strong>{" "}
                                                    {
                                                        resource.file_size_formatted
                                                    }
                                                    <br />
                                                    <strong>
                                                        Ajouté le :
                                                    </strong>{" "}
                                                    {new Date(
                                                        resource.created_at
                                                    ).toLocaleDateString(
                                                        "fr-FR"
                                                    )}{" "}
                                                    à{" "}
                                                    {new Date(
                                                        resource.created_at
                                                    ).toLocaleTimeString(
                                                        "fr-FR"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <div className="btn-group">
                                                <a
                                                    href={route(
                                                        "scolarite.resources.download",
                                                        resource.id
                                                    )}
                                                    className="btn btn-success"
                                                    target="_blank"
                                                >
                                                    <i className="fas fa-download mr-1"></i>
                                                    Télécharger
                                                </a>
                                                <Link
                                                    href={route(
                                                        "scolarite.resources.edit",
                                                        resource.id
                                                    )}
                                                    className="btn btn-warning"
                                                >
                                                    <i className="fas fa-edit mr-1"></i>
                                                    Modifier
                                                </Link>
                                                <Link
                                                    href={route(
                                                        "scolarite.resources.index"
                                                    )}
                                                    className="btn btn-secondary"
                                                >
                                                    <i className="fas fa-arrow-left mr-1"></i>
                                                    Retour à la liste
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistiques et état */}
                        <div className="col-md-4">
                            {/* Statut */}
                            <div className="card">
                                <div className="card-header bg-secondary">
                                    <h3 className="card-title">Statut</h3>
                                </div>
                                <div className="card-body">
                                    <p>
                                        <strong>État :</strong>
                                        <br />
                                        <span
                                            className={`badge ${
                                                resource.is_active
                                                    ? "badge-success"
                                                    : "badge-danger"
                                            }`}
                                        >
                                            {resource.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Visibilité :</strong>
                                        <br />
                                        <span
                                            className={`badge ${
                                                resource.is_public
                                                    ? "badge-info"
                                                    : "badge-warning"
                                            }`}
                                        >
                                            {resource.is_public
                                                ? "Publique"
                                                : "Privée"}
                                        </span>
                                    </p>
                                    {resource.available_from && (
                                        <p>
                                            <strong>
                                                Disponible à partir du :
                                            </strong>
                                            <br />
                                            {new Date(
                                                resource.available_from
                                            ).toLocaleDateString("fr-FR")}
                                        </p>
                                    )}
                                    {resource.available_until && (
                                        <p>
                                            <strong>
                                                Disponible jusqu'au :
                                            </strong>
                                            <br />
                                            {new Date(
                                                resource.available_until
                                            ).toLocaleDateString("fr-FR")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Statistiques */}
                            <div className="card">
                                <div className="card-header bg-info">
                                    <h3 className="card-title">
                                        Statistiques d'utilisation
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row text-center">
                                        <div className="col-6">
                                            <div className="small-box bg-success">
                                                <div className="inner">
                                                    <h3>
                                                        {
                                                            downloadStats.total_downloads
                                                        }
                                                    </h3>
                                                    <p>Téléchargements</p>
                                                </div>
                                                <div className="icon">
                                                    <i className="fas fa-download"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="small-box bg-info">
                                                <div className="inner">
                                                    <h3>
                                                        {
                                                            downloadStats.total_views
                                                        }
                                                    </h3>
                                                    <p>Consultations</p>
                                                </div>
                                                <div className="icon">
                                                    <i className="fas fa-eye"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-center">
                                        <strong>
                                            {downloadStats.unique_users}
                                        </strong>{" "}
                                        utilisateur(s) unique(s)
                                    </p>
                                </div>
                            </div>

                            {/* Tags */}
                            {resource.tags && (
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Tags</h3>
                                    </div>
                                    <div className="card-body">
                                        {resource.tags
                                            .split(",")
                                            .map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="badge badge-primary mr-1 mb-1"
                                                >
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes internes */}
                            {resource.notes && (
                                <div className="card">
                                    <div className="card-header bg-warning">
                                        <h3 className="card-title">
                                            Notes internes
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <p className="text-muted small">
                                            {resource.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Accès récents */}
                    {downloadStats.recent_downloads.length > 0 && (
                        <div className="row">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-history mr-2"></i>
                                            Accès récents
                                        </h3>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-sm table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Étudiant</th>
                                                        <th>Action</th>
                                                        <th>Date</th>
                                                        <th>Heure</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {downloadStats.recent_downloads.map(
                                                        (download) => (
                                                            <tr
                                                                key={
                                                                    download.id
                                                                }
                                                            >
                                                                <td>
                                                                    <strong>
                                                                        {
                                                                            download
                                                                                .user
                                                                                .name
                                                                        }
                                                                    </strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {
                                                                            download
                                                                                .user
                                                                                .email
                                                                        }
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`badge ${
                                                                            download.action ===
                                                                            "download"
                                                                                ? "badge-success"
                                                                                : "badge-info"
                                                                        }`}
                                                                    >
                                                                        {download.action ===
                                                                        "download"
                                                                            ? "Téléchargement"
                                                                            : "Consultation"}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {new Date(
                                                                        download.created_at
                                                                    ).toLocaleDateString(
                                                                        "fr-FR"
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {new Date(
                                                                        download.created_at
                                                                    ).toLocaleTimeString(
                                                                        "fr-FR"
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                .small-box {
                    border-radius: 5px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }
            `}</style>
        </AdminLayout>
    );
}
