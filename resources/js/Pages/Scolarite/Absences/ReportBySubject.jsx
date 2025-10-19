import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function ReportBySubject({
    stats,
    class: schoolClass,
    startDate,
    endDate,
}) {
    const [filterStartDate, setFilterStartDate] = useState(startDate);
    const [filterEndDate, setFilterEndDate] = useState(endDate);

    const handleFilter = () => {
        router.get(
            route("scolarite.attendances.report-by-subject", schoolClass.id),
            {
                start_date: filterStartDate,
                end_date: filterEndDate,
            },
            {
                preserveState: true,
            }
        );
    };

    return (
        <AdminLayout title="Rapport par matière">
            <Head title="Rapport par matière" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-book mr-2 text-success"></i>
                                Rapport par matière - {schoolClass.name}
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
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "scolarite.attendances.report-by-class"
                                        )}
                                    >
                                        Par classe
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Par matière
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Informations */}
                    <div className="alert alert-info">
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Classe :</strong> {schoolClass.name} (
                        {schoolClass.level}) |
                        <strong className="ml-2">Période :</strong> du{" "}
                        {new Date(startDate).toLocaleDateString("fr-FR")} au{" "}
                        {new Date(endDate).toLocaleDateString("fr-FR")}
                    </div>

                    {/* Filtres */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-filter mr-2"></i>
                                Période d'analyse
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label>Date de début</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={filterStartDate}
                                            onChange={(e) =>
                                                setFilterStartDate(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label>Date de fin</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={filterEndDate}
                                            onChange={(e) =>
                                                setFilterEndDate(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4 d-flex align-items-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-block"
                                        onClick={handleFilter}
                                    >
                                        <i className="fas fa-sync mr-1"></i>
                                        Actualiser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="btn-group">
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => window.print()}
                                >
                                    <i className="fas fa-print mr-1"></i>
                                    Imprimer
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-info"
                                    onClick={() =>
                                        alert("Export Excel en développement")
                                    }
                                >
                                    <i className="fas fa-file-excel mr-1"></i>
                                    Exporter Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques par matière */}
                    <div className="card">
                        <div className="card-header bg-success">
                            <h3 className="card-title">
                                <i className="fas fa-table mr-2"></i>
                                Statistiques par matière
                            </h3>
                        </div>
                        <div className="card-body p-0">
                            {Object.keys(stats).length === 0 ? (
                                <div className="p-4 text-center text-muted">
                                    Aucune donnée disponible pour cette période
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Cours</th>
                                                <th className="text-center">
                                                    Total cours
                                                </th>
                                                <th className="text-center">
                                                    Présences
                                                </th>
                                                <th className="text-center">
                                                    Absences
                                                </th>
                                                <th className="text-center">
                                                    Retards
                                                </th>
                                                <th className="text-center">
                                                    Taux de présence
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(stats).map(
                                                ([subjectId, data]) => (
                                                    <tr key={subjectId}>
                                                        <td>
                                                            <strong>
                                                                {
                                                                    data.cours
                                                                        .name
                                                                }
                                                            </strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {
                                                                    data.cours
                                                                        .code
                                                                }
                                                            </small>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge badge-info">
                                                                {data.total}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge badge-success">
                                                                {data.presences}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge badge-danger">
                                                                {data.absences}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge badge-warning">
                                                                {data.retards}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <div
                                                                className="progress"
                                                                style={{
                                                                    height: "25px",
                                                                }}
                                                            >
                                                                <div
                                                                    className={`progress-bar ${
                                                                        data.attendance_rate >=
                                                                        80
                                                                            ? "bg-success"
                                                                            : data.attendance_rate >=
                                                                              60
                                                                            ? "bg-warning"
                                                                            : "bg-danger"
                                                                    }`}
                                                                    style={{
                                                                        width: `${data.attendance_rate}%`,
                                                                    }}
                                                                >
                                                                    <strong>
                                                                        {
                                                                            data.attendance_rate
                                                                        }
                                                                        %
                                                                    </strong>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                        <tfoot className="bg-light">
                                            <tr>
                                                <td>
                                                    <strong>TOTAUX</strong>
                                                </td>
                                                <td className="text-center">
                                                    <strong>
                                                        {Object.values(
                                                            stats
                                                        ).reduce(
                                                            (sum, data) =>
                                                                sum +
                                                                data.total,
                                                            0
                                                        )}
                                                    </strong>
                                                </td>
                                                <td className="text-center">
                                                    <strong className="text-success">
                                                        {Object.values(
                                                            stats
                                                        ).reduce(
                                                            (sum, data) =>
                                                                sum +
                                                                data.presences,
                                                            0
                                                        )}
                                                    </strong>
                                                </td>
                                                <td className="text-center">
                                                    <strong className="text-danger">
                                                        {Object.values(
                                                            stats
                                                        ).reduce(
                                                            (sum, data) =>
                                                                sum +
                                                                data.absences,
                                                            0
                                                        )}
                                                    </strong>
                                                </td>
                                                <td className="text-center">
                                                    <strong className="text-warning">
                                                        {Object.values(
                                                            stats
                                                        ).reduce(
                                                            (sum, data) =>
                                                                sum +
                                                                data.retards,
                                                            0
                                                        )}
                                                    </strong>
                                                </td>
                                                <td className="text-center">
                                                    <strong>
                                                        {Math.round(
                                                            (Object.values(
                                                                stats
                                                            ).reduce(
                                                                (sum, data) =>
                                                                    sum +
                                                                    data.presences,
                                                                0
                                                            ) /
                                                                Object.values(
                                                                    stats
                                                                ).reduce(
                                                                    (
                                                                        sum,
                                                                        data
                                                                    ) =>
                                                                        sum +
                                                                        data.total,
                                                                    0
                                                                )) *
                                                                100
                                                        )}
                                                        %
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Graphiques */}
                    {Object.keys(stats).length > 0 && (
                        <div className="row mt-4">
                            {Object.entries(stats).map(([subjectId, data]) => (
                                <div
                                    key={subjectId}
                                    className="col-md-4 col-sm-6 mb-3"
                                >
                                    <div className="card">
                                        <div className="card-header">
                                            <h5 className="mb-0">
                                                {data.cours.name}
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="row text-center">
                                                <div className="col-4">
                                                    <div className="bg-success rounded p-3">
                                                        <h3 className="text-white mb-0">
                                                            {data.presences}
                                                        </h3>
                                                        <small className="text-white">
                                                            Présents
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="bg-danger rounded p-3">
                                                        <h3 className="text-white mb-0">
                                                            {data.absences}
                                                        </h3>
                                                        <small className="text-white">
                                                            Absents
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="bg-warning rounded p-3">
                                                        <h3 className="text-white mb-0">
                                                            {data.retards}
                                                        </h3>
                                                        <small className="text-white">
                                                            Retards
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-center">
                                                <h4
                                                    className={
                                                        data.attendance_rate >=
                                                        80
                                                            ? "text-success"
                                                            : "text-danger"
                                                    }
                                                >
                                                    {data.attendance_rate}%
                                                </h4>
                                                <small className="text-muted">
                                                    Taux de présence
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="mt-3">
                        <Link
                            href={route(
                                "scolarite.attendances.report-by-class"
                            )}
                            className="btn btn-secondary"
                        >
                            <i className="fas fa-arrow-left mr-1"></i>
                            Retour aux classes
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`
                @media print {
                    .content-header, .btn, .breadcrumb {
                        display: none !important;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
