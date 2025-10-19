import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Statistics({
    stats,
    attendancesBySubject,
    monthlyStats,
}) {
    return (
        <AdminLayout title="Statistiques d'assiduité">
            <Head title="Statistiques" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-chart-line mr-2 text-info"></i>
                                Mes statistiques d'assiduité
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
                                        href={route(
                                            "student.attendances.index"
                                        )}
                                    >
                                        Absences et retards
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
                    {/* Vue d'ensemble */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{stats.total_classes}</h3>
                                    <p>Cours enregistrés</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clipboard-list"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats.presences}</h3>
                                    <p>Présences</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{stats.absences}</h3>
                                    <p>Absences totales</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-times-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.retards}</h3>
                                    <p>Retards</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Taux de présence */}
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header bg-primary">
                                    <h3 className="card-title">
                                        <i className="fas fa-percentage mr-2"></i>
                                        Taux de présence
                                    </h3>
                                </div>
                                <div className="card-body text-center">
                                    <div
                                        className="position-relative"
                                        style={{ height: "200px" }}
                                    >
                                        <div className="d-flex align-items-center justify-content-center h-100">
                                            <div>
                                                <h1 className="display-1 text-primary font-weight-bold">
                                                    {stats.attendance_rate}%
                                                </h1>
                                                <p className="text-muted">
                                                    de présence
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="row">
                                        <div className="col-6">
                                            <p className="mb-0">
                                                <small className="text-muted">
                                                    Heures manquées
                                                </small>
                                                <br />
                                                <strong className="text-danger">
                                                    {stats.total_hours_missed}h
                                                </strong>
                                            </p>
                                        </div>
                                        <div className="col-6">
                                            <p className="mb-0">
                                                <small className="text-muted">
                                                    Temps de retard
                                                </small>
                                                <br />
                                                <strong className="text-warning">
                                                    {stats.total_delay_minutes}{" "}
                                                    min
                                                </strong>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Répartition */}
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header bg-success">
                                    <h3 className="card-title">
                                        <i className="fas fa-chart-pie mr-2"></i>
                                        Répartition
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row text-center">
                                        <div className="col-6 mb-3">
                                            <div className="bg-success rounded p-3">
                                                <h3 className="text-white mb-0">
                                                    {stats.presences}
                                                </h3>
                                                <small className="text-white">
                                                    Présences
                                                </small>
                                            </div>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <div className="bg-danger rounded p-3">
                                                <h3 className="text-white mb-0">
                                                    {
                                                        stats.absences_non_justifiees
                                                    }
                                                </h3>
                                                <small className="text-white">
                                                    Abs. non justifiées
                                                </small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="bg-info rounded p-3">
                                                <h3 className="text-white mb-0">
                                                    {stats.absences_justifiees}
                                                </h3>
                                                <small className="text-white">
                                                    Abs. justifiées
                                                </small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="bg-warning rounded p-3">
                                                <h3 className="text-white mb-0">
                                                    {stats.retards}
                                                </h3>
                                                <small className="text-white">
                                                    Retards
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Par matière */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header bg-info">
                                    <h3 className="card-title">
                                        <i className="fas fa-book mr-2"></i>
                                        Assiduité par matière
                                    </h3>
                                </div>
                                <div className="card-body p-0">
                                    {Object.keys(attendancesBySubject)
                                        .length === 0 ? (
                                        <p className="p-4 text-center text-muted">
                                            Aucune donnée disponible
                                        </p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Matière</th>
                                                        <th className="text-center">
                                                            Total
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
                                                            Taux
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(
                                                        attendancesBySubject
                                                    ).map(
                                                        ([subjectId, data]) => (
                                                            <tr key={subjectId}>
                                                                <td>
                                                                    <strong>
                                                                        {
                                                                            data
                                                                                .subject
                                                                                .name
                                                                        }
                                                                    </strong>
                                                                </td>
                                                                <td className="text-center">
                                                                    {data.total}
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className="badge badge-success">
                                                                        {
                                                                            data.presences
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className="badge badge-danger">
                                                                        {
                                                                            data.absences
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className="badge badge-warning">
                                                                        {
                                                                            data.retards
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <strong
                                                                        className={
                                                                            data.presences /
                                                                                data.total >=
                                                                            0.8
                                                                                ? "text-success"
                                                                                : "text-danger"
                                                                        }
                                                                    >
                                                                        {Math.round(
                                                                            (data.presences /
                                                                                data.total) *
                                                                                100
                                                                        )}
                                                                        %
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

                    {/* Évolution mensuelle */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header bg-warning">
                                    <h3 className="card-title">
                                        <i className="fas fa-calendar-alt mr-2"></i>
                                        Évolution mensuelle
                                    </h3>
                                </div>
                                <div className="card-body p-0">
                                    {Object.keys(monthlyStats).length === 0 ? (
                                        <p className="p-4 text-center text-muted">
                                            Aucune donnée disponible
                                        </p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Mois</th>
                                                        <th className="text-center">
                                                            Présences
                                                        </th>
                                                        <th className="text-center">
                                                            Absences
                                                        </th>
                                                        <th className="text-center">
                                                            Retards
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(
                                                        monthlyStats
                                                    ).map(([month, data]) => (
                                                        <tr key={month}>
                                                            <td>
                                                                <strong>
                                                                    {data.month}
                                                                </strong>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="badge badge-success">
                                                                    {
                                                                        data.presences
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="badge badge-danger">
                                                                    {
                                                                        data.absences
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="badge badge-warning">
                                                                    {
                                                                        data.retards
                                                                    }
                                                                </span>
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
                    </div>

                    {/* Bouton retour */}
                    <div className="row">
                        <div className="col-12">
                            <Link
                                href={route("student.attendances.index")}
                                className="btn btn-secondary"
                            >
                                <i className="fas fa-arrow-left mr-1"></i>
                                Retour à mes absences
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
