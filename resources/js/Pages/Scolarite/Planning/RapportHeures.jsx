import React, { useState } from "react";
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

export default function RapportHeures({
    report,
    classes,
    selectedClass,
    academicYear,
}) {
    const [filterClass, setFilterClass] = useState(selectedClass?.id || "");

    const handleFilterChange = () => {
        router.get(
            route("scolarite.planning.hours-report"),
            {
                class_id: filterClass,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const exportReport = (format) => {
        const params = new URLSearchParams({
            format: format,
            class_id: filterClass,
        });

        window.open(
            `${route(
                "scolarite.planning.hours-report"
            )}?${params.toString()}&export=true`
        );
    };

    // Calculs statistiques
    const totalHours = report.reduce(
        (sum, item) => sum + parseFloat(item.total_hours || 0),
        0
    );
    const completedHours = report.reduce(
        (sum, item) => sum + parseFloat(item.completed_hours || 0),
        0
    );
    const remainingHours = report.reduce(
        (sum, item) => sum + parseFloat(item.remaining_hours || 0),
        0
    );
    const completionRate =
        totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

    const getProgressColor = (completed, total) => {
        const percentage = (completed / total) * 100;
        if (percentage >= 80) return "success";
        if (percentage >= 50) return "warning";
        return "danger";
    };

    const getProgressPercentage = (completed, total) => {
        if (total === 0) return 0;
        return Math.min((completed / total) * 100, 100);
    };

    return (
        <AdminLayout>
            <Head title="Rapport d'Heures" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-chart-bar mr-2 text-primary"></i>
                                Rapport d'Heures de Cours
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
                                    Rapport d'heures
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
                                    <h3>{totalHours.toFixed(0)}h</h3>
                                    <p>Heures programmées</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-calendar"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{completedHours.toFixed(0)}h</h3>
                                    <p>Heures effectuées</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{remainingHours.toFixed(0)}h</h3>
                                    <p>Heures restantes</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-primary">
                                <div className="inner">
                                    <h3>{completionRate.toFixed(1)}%</h3>
                                    <p>Taux de réalisation</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-percentage"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres et actions */}
                    <Card
                        title="Filtres et actions"
                        icon="fas fa-filter"
                        className="mb-4"
                    >
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Année académique</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={academicYear?.name}
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Filtrer par classe</label>
                                    <select
                                        className="form-control"
                                        value={filterClass}
                                        onChange={(e) =>
                                            setFilterClass(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Toutes les classes
                                        </option>
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4 d-flex align-items-end">
                                <div className="form-group mb-0 w-100">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-block"
                                        onClick={handleFilterChange}
                                    >
                                        <i className="fas fa-filter mr-2"></i>
                                        Appliquer le filtre
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-12">
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={() => exportReport("excel")}
                                    >
                                        <i className="fas fa-file-excel mr-1"></i>
                                        Exporter Excel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => exportReport("pdf")}
                                    >
                                        <i className="fas fa-file-pdf mr-1"></i>
                                        Exporter PDF
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-info"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fas fa-print mr-1"></i>
                                        Imprimer
                                    </button>
                                    <Link
                                        href={route(
                                            "scolarite.planning.schedules.index"
                                        )}
                                        className="btn btn-secondary"
                                    >
                                        <i className="fas fa-arrow-left mr-1"></i>
                                        Retour
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tableau du rapport */}
                    <Card title="Détails par cours" icon="fas fa-table">
                        {report.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle mr-2"></i>
                                Aucune donnée disponible pour les critères
                                sélectionnés.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-bordered">
                                    <thead className="thead-light">
                                        <tr>
                                            <th style={{ width: "5%" }}>#</th>
                                            <th style={{ width: "30%" }}>
                                                Cours
                                            </th>
                                            <th
                                                className="text-center"
                                                style={{ width: "15%" }}
                                            >
                                                Heures prévues
                                            </th>
                                            <th
                                                className="text-center"
                                                style={{ width: "15%" }}
                                            >
                                                Heures effectuées
                                            </th>
                                            <th
                                                className="text-center"
                                                style={{ width: "15%" }}
                                            >
                                                Heures restantes
                                            </th>
                                            <th style={{ width: "20%" }}>
                                                Progression
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.map((item, index) => {
                                            const percentage =
                                                getProgressPercentage(
                                                    item.completed_hours,
                                                    item.total_hours
                                                );
                                            const color = getProgressColor(
                                                item.completed_hours,
                                                item.total_hours
                                            );

                                            return (
                                                <tr key={item.id}>
                                                    <td className="text-center">
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {item.name}
                                                        </strong>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge badge-info badge-lg">
                                                            {parseFloat(
                                                                item.total_hours
                                                            ).toFixed(1)}
                                                            h
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge badge-success badge-lg">
                                                            {parseFloat(
                                                                item.completed_hours
                                                            ).toFixed(1)}
                                                            h
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span
                                                            className={`badge badge-${
                                                                item.remaining_hours >
                                                                0
                                                                    ? "warning"
                                                                    : "secondary"
                                                            } badge-lg`}
                                                        >
                                                            {parseFloat(
                                                                item.remaining_hours
                                                            ).toFixed(1)}
                                                            h
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div
                                                            className="progress"
                                                            style={{
                                                                height: "25px",
                                                            }}
                                                        >
                                                            <div
                                                                className={`progress-bar bg-${color}`}
                                                                role="progressbar"
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                }}
                                                                aria-valuenow={
                                                                    percentage
                                                                }
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            >
                                                                <strong>
                                                                    {percentage.toFixed(
                                                                        1
                                                                    )}
                                                                    %
                                                                </strong>
                                                            </div>
                                                        </div>
                                                        {percentage >= 100 && (
                                                            <small className="text-success d-block mt-1">
                                                                <i className="fas fa-check-circle mr-1"></i>
                                                                Programme
                                                                terminé
                                                            </small>
                                                        )}
                                                        {percentage < 50 &&
                                                            item.remaining_hours >
                                                                0 && (
                                                                <small className="text-danger d-block mt-1">
                                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                                    Retard dans
                                                                    le programme
                                                                </small>
                                                            )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="thead-light">
                                        <tr>
                                            <td
                                                colSpan="2"
                                                className="text-right"
                                            >
                                                <strong>TOTAL</strong>
                                            </td>
                                            <td className="text-center">
                                                <strong className="badge badge-info badge-lg">
                                                    {totalHours.toFixed(1)}h
                                                </strong>
                                            </td>
                                            <td className="text-center">
                                                <strong className="badge badge-success badge-lg">
                                                    {completedHours.toFixed(1)}h
                                                </strong>
                                            </td>
                                            <td className="text-center">
                                                <strong className="badge badge-warning badge-lg">
                                                    {remainingHours.toFixed(1)}h
                                                </strong>
                                            </td>
                                            <td>
                                                <div
                                                    className="progress"
                                                    style={{ height: "25px" }}
                                                >
                                                    <div
                                                        className={`progress-bar bg-${
                                                            completionRate >= 80
                                                                ? "success"
                                                                : completionRate >=
                                                                  50
                                                                ? "warning"
                                                                : "danger"
                                                        }`}
                                                        role="progressbar"
                                                        style={{
                                                            width: `${completionRate}%`,
                                                        }}
                                                    >
                                                        <strong>
                                                            {completionRate.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </strong>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </Card>

                    {/* Graphique de progression */}
                    {report.length > 0 && (
                        <div className="row">
                            <div className="col-md-6">
                                <Card
                                    title="Cours en retard"
                                    icon="fas fa-exclamation-triangle"
                                >
                                    {report.filter((item) => {
                                        const percentage =
                                            getProgressPercentage(
                                                item.completed_hours,
                                                item.total_hours
                                            );
                                        return percentage >= 100;
                                    }).length === 0 ? (
                                        <div className="alert alert-info">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            Aucun cours n'a encore terminé son
                                            programme.
                                        </div>
                                    ) : (
                                        <ul className="list-group">
                                            {report
                                                .filter((item) => {
                                                    const percentage =
                                                        getProgressPercentage(
                                                            item.completed_hours,
                                                            item.total_hours
                                                        );
                                                    return percentage >= 100;
                                                })
                                                .map((item) => (
                                                    <li
                                                        key={item.id}
                                                        className="list-group-item"
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <strong>
                                                                    {item.name}
                                                                </strong>
                                                                <br />
                                                                <small className="text-success">
                                                                    <i className="fas fa-check mr-1"></i>
                                                                    {parseFloat(
                                                                        item.completed_hours
                                                                    ).toFixed(
                                                                        1
                                                                    )}
                                                                    h effectuées
                                                                    /{" "}
                                                                    {
                                                                        item.total_hours
                                                                    }
                                                                    h prévues
                                                                </small>
                                                            </div>
                                                            <span className="badge badge-success badge-lg">
                                                                <i className="fas fa-check-circle mr-1"></i>
                                                                100%
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                .small-box {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .badge-lg {
                    font-size: 0.95rem;
                    padding: 0.4rem 0.7rem;
                }

                .progress {
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .progress-bar {
                    transition: width 0.6s ease;
                    font-size: 0.9rem;
                    line-height: 25px;
                }

                .table thead th {
                    border-bottom: 2px solid #dee2e6;
                    font-weight: 600;
                }

                .table-hover tbody tr:hover {
                    background-color: rgba(0, 123, 255, 0.05);
                }

                .list-group-item {
                    border-left: 3px solid transparent;
                    transition: all 0.3s ease;
                }

                .list-group-item:hover {
                    border-left-color: #007bff;
                    background-color: rgba(0, 123, 255, 0.05);
                    transform: translateX(3px);
                }

                @media print {
                    .btn, .btn-group, .breadcrumb, .content-header {
                        display: none !important;
                    }
                    
                    .card {
                        page-break-inside: avoid;
                        box-shadow: none !important;
                        border: 1px solid #ddd;
                    }
                    
                    .small-box {
                        page-break-inside: avoid;
                    }
                }

                .card-warning .card-header {
                    background-color: #ffc107;
                    color: #212529;
                }

                .thead-light th {
                    background-color: #f8f9fa;
                    color: #495057;
                }
            `}</style>
        </AdminLayout>
    );
}
