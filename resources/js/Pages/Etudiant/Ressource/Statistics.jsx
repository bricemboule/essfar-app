import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Statistics({
    stats,
    viewedResources,
    downloadedResources,
}) {
    return (
        <AdminLayout title="Mes statistiques">
            <Head title="Statistiques d'utilisation" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-chart-line mr-2 text-info"></i>
                                Mes statistiques d'utilisation
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("student.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route("student.resources.index")}
                                    >
                                        Ressources
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Statistiques
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Statistiques globales */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{stats.total_views}</h3>
                                    <p>Ressources consultées</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-eye"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats.total_downloads}</h3>
                                    <p>Téléchargements</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-download"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.this_week}</h3>
                                    <p>Cette semaine</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-calendar-week"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{Object.keys(stats.by_type).length}</h3>
                                    <p>Types consultés</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-layer-group"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Par type */}
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header bg-primary">
                                    <h3 className="card-title">
                                        Ressources par type
                                    </h3>
                                </div>
                                <div className="card-body">
                                    {Object.keys(stats.by_type).length === 0 ? (
                                        <p className="text-muted">
                                            Aucune donnée disponible
                                        </p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Type</th>
                                                        <th className="text-right">
                                                            Accès
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(
                                                        stats.by_type
                                                    ).map(([type, count]) => (
                                                        <tr key={type}>
                                                            <td>
                                                                <span className="badge badge-primary">
                                                                    {type.replace(
                                                                        "_",
                                                                        " "
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td className="text-right">
                                                                <strong>
                                                                    {count}
                                                                </strong>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Par matière */}
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header bg-success">
                                    <h3 className="card-title">
                                        Ressources par matière
                                    </h3>
                                </div>
                                <div className="card-body">
                                    {Object.keys(stats.by_subject).length ===
                                    0 ? (
                                        <p className="text-muted">
                                            Aucune donnée disponible
                                        </p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Matière</th>
                                                        <th className="text-right">
                                                            Accès
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(
                                                        stats.by_subject
                                                    ).map(
                                                        ([subject, count]) => (
                                                            <tr key={subject}>
                                                                <td>
                                                                    {subject}
                                                                </td>
                                                                <td className="text-right">
                                                                    <strong>
                                                                        {count}
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ressources récemment consultées */}
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header bg-info">
                                    <h3 className="card-title">
                                        Récemment consultées
                                    </h3>
                                </div>
                                <div className="card-body p-0">
                                    {viewedResources.length === 0 ? (
                                        <p className="p-3 text-muted">
                                            Aucune ressource consultée
                                        </p>
                                    ) : (
                                        <ul className="list-group list-group-flush">
                                            {viewedResources.map((item) => (
                                                <li
                                                    key={item.id}
                                                    className="list-group-item"
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <Link
                                                                href={route(
                                                                    "student.resources.show",
                                                                    item
                                                                        .resource
                                                                        .id
                                                                )}
                                                                className="font-weight-bold"
                                                            >
                                                                {
                                                                    item
                                                                        .resource
                                                                        .title
                                                                }
                                                            </Link>
                                                            <br />
                                                            <small className="text-muted">
                                                                {
                                                                    item
                                                                        .resource
                                                                        .subject
                                                                        .name
                                                                }
                                                            </small>
                                                        </div>
                                                        <small className="text-muted">
                                                            {new Date(
                                                                item.created_at
                                                            ).toLocaleDateString(
                                                                "fr-FR"
                                                            )}
                                                        </small>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ressources récemment téléchargées */}
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header bg-success">
                                    <h3 className="card-title">
                                        Récemment téléchargées
                                    </h3>
                                </div>
                                <div className="card-body p-0">
                                    {downloadedResources.length === 0 ? (
                                        <p className="p-3 text-muted">
                                            Aucun téléchargement
                                        </p>
                                    ) : (
                                        <ul className="list-group list-group-flush">
                                            {downloadedResources.map((item) => (
                                                <li
                                                    key={item.id}
                                                    className="list-group-item"
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <Link
                                                                href={route(
                                                                    "student.resources.show",
                                                                    item
                                                                        .resource
                                                                        .id
                                                                )}
                                                                className="font-weight-bold"
                                                            >
                                                                {
                                                                    item
                                                                        .resource
                                                                        .title
                                                                }
                                                            </Link>
                                                            <br />
                                                            <small className="text-muted">
                                                                {
                                                                    item
                                                                        .resource
                                                                        .subject
                                                                        .name
                                                                }
                                                            </small>
                                                        </div>
                                                        <small className="text-muted">
                                                            {new Date(
                                                                item.created_at
                                                            ).toLocaleDateString(
                                                                "fr-FR"
                                                            )}
                                                        </small>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bouton retour */}
                    <div className="row">
                        <div className="col-12">
                            <Link
                                href={route("student.resources.index")}
                                className="btn btn-secondary"
                            >
                                <i className="fas fa-arrow-left mr-1"></i>
                                Retour aux ressources
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .small-box {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </AdminLayout>
    );
}
