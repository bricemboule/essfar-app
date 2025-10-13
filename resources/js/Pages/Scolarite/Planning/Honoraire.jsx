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

export default function TeacherEarningsReport({
    earnings,
    startDate,
    endDate,
    totalEarnings,
    totalHours,
}) {
    const [localStartDate, setLocalStartDate] = useState(startDate);
    const [localEndDate, setLocalEndDate] = useState(endDate);
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const formatCurrency = (amount) => {
        return (
            new Intl.NumberFormat("fr-FR", {
                style: "decimal",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount) + " FCFA"
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const handleFilterChange = () => {
        router.get(
            route("planning.honoraire"),
            {
                start_date: localStartDate,
                end_date: localEndDate,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // CORRECTION: Fonction d'export corrigée avec la bonne route
    const exportReport = (format) => {
        // Construction de l'URL avec tous les paramètres nécessaires
        const params = new URLSearchParams({
            format: format,
            start_date: localStartDate,
            end_date: localEndDate,
            export: "1",
        });

        // Utilisation de la bonne route Laravel
        const exportUrl =
            route("reports.export-earnings") + "?" + params.toString();

        // Ouverture dans un nouvel onglet pour télécharger le fichier
        window.open(exportUrl, "_blank");
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    // Trier les données
    const sortedEarnings = [...earnings].sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case "name":
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case "hours":
                aValue = parseFloat(a.total_hours);
                bValue = parseFloat(b.total_hours);
                break;
            case "earnings":
                aValue = parseFloat(a.total_earnings);
                bValue = parseFloat(b.total_earnings);
                break;
            case "rate":
                aValue = parseFloat(a.avg_hourly_rate);
                bValue = parseFloat(b.avg_hourly_rate);
                break;
            default:
                return 0;
        }

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const averageHourlyRate =
        earnings.length > 0
            ? earnings.reduce(
                  (sum, e) => sum + parseFloat(e.avg_hourly_rate),
                  0
              ) / earnings.length
            : 0;

    const SortIcon = ({ field }) => {
        if (sortBy !== field)
            return <i className="fas fa-sort text-muted ml-1"></i>;
        return sortOrder === "asc" ? (
            <i className="fas fa-sort-up text-primary ml-1"></i>
        ) : (
            <i className="fas fa-sort-down text-primary ml-1"></i>
        );
    };

    return (
        <AdminLayout>
            <Head title="Honoraires Enseignants" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-money-bill-wave mr-2 text-success"></i>
                                Rapport des Honoraires Enseignants
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
                                    <Link href={route("planning.index")}>
                                        Plannings
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Honoraires
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
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{formatCurrency(totalEarnings)}</h3>
                                    <p>Total des honoraires</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-money-bill-wave"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{totalHours.toFixed(0)}h</h3>
                                    <p>Total heures effectuées</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{earnings.length}</h3>
                                    <p>Enseignants actifs</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-users"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-primary">
                                <div className="inner">
                                    <h3>{formatCurrency(averageHourlyRate)}</h3>
                                    <p>Tarif horaire moyen</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-calculator"></i>
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
                                    <label>Date de début</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={localStartDate}
                                        onChange={(e) =>
                                            setLocalStartDate(e.target.value)
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
                                        value={localEndDate}
                                        onChange={(e) =>
                                            setLocalEndDate(e.target.value)
                                        }
                                    />
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
                                        Appliquer
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="alert alert-info mt-3">
                            <i className="fas fa-info-circle mr-2"></i>
                            Période sélectionnée :{" "}
                            <strong>
                                Du {formatDate(startDate)} au{" "}
                                {formatDate(endDate)}
                            </strong>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="flex gap-2">
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
                                        href={route("planning.index")}
                                        className="btn btn-secondary"
                                    >
                                        <i className="fas fa-arrow-left mr-1"></i>
                                        Retour
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tableau des honoraires */}
                    <Card title="Détails par enseignant" icon="fas fa-table">
                        {earnings.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle mr-2"></i>
                                Aucune donnée disponible pour la période
                                sélectionnée.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-bordered">
                                    <thead className="thead-light">
                                        <tr>
                                            <th style={{ width: "5%" }}>#</th>
                                            <th
                                                style={{
                                                    width: "30%",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    handleSort("name")
                                                }
                                            >
                                                Enseignant
                                                <SortIcon field="name" />
                                            </th>
                                            <th
                                                className="text-center"
                                                style={{
                                                    width: "15%",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    handleSort("hours")
                                                }
                                            >
                                                Heures effectuées
                                                <SortIcon field="hours" />
                                            </th>

                                            <th
                                                className="text-right"
                                                style={{
                                                    width: "20%",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    handleSort("earnings")
                                                }
                                            >
                                                Total à payer
                                                <SortIcon field="earnings" />
                                            </th>
                                            <th
                                                className="text-center"
                                                style={{ width: "15%" }}
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedEarnings.map(
                                            (earning, index) => (
                                                <tr key={earning.id}>
                                                    <td className="text-center">
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-user-tie mr-2 text-primary"></i>
                                                            <strong>
                                                                {earning.name}
                                                            </strong>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge badge-info badge-lg">
                                                            {parseFloat(
                                                                earning.total_hours
                                                            ).toFixed(2)}
                                                            h
                                                        </span>
                                                    </td>

                                                    <td className="text-right">
                                                        <strong
                                                            className="text-success"
                                                            style={{
                                                                fontSize:
                                                                    "1.1rem",
                                                            }}
                                                        >
                                                            {formatCurrency(
                                                                earning.total_earnings
                                                            )}
                                                        </strong>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="btn-group btn-group-sm">
                                                            <Link
                                                                href={route(
                                                                    "planning.teacher",
                                                                    earning.id
                                                                )}
                                                                className="btn btn-info"
                                                                title="Voir planning"
                                                            >
                                                                <i className="fas fa-calendar"></i>
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary"
                                                                title="Détails"
                                                                onClick={() => {
                                                                    alert(
                                                                        `Détails pour ${
                                                                            earning.name
                                                                        }\n\nHeures: ${
                                                                            earning.total_hours
                                                                        }h\nHonoraires: ${formatCurrency(
                                                                            earning.total_earnings
                                                                        )}`
                                                                    );
                                                                }}
                                                            >
                                                                <i className="fas fa-info-circle"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-success"
                                                                title="Générer fiche de paie"
                                                            >
                                                                <i className="fas fa-file-invoice-dollar"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                    <tfoot className="thead-light">
                                        <tr>
                                            <td
                                                colSpan="2"
                                                className="text-right"
                                            >
                                                <strong>TOTAL GÉNÉRAL</strong>
                                            </td>
                                            <td className="text-center">
                                                <strong className="badge badge-info badge-lg">
                                                    {totalHours.toFixed(2)}h
                                                </strong>
                                            </td>
                                            <td className="text-center">
                                                <strong className="badge badge-secondary badge-lg">
                                                    {formatCurrency(
                                                        averageHourlyRate
                                                    )}
                                                </strong>
                                            </td>
                                            <td className="text-right">
                                                <strong
                                                    className="text-success"
                                                    style={{
                                                        fontSize: "1.2rem",
                                                    }}
                                                >
                                                    {formatCurrency(
                                                        totalEarnings
                                                    )}
                                                </strong>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </Card>

                    {/* Reste du code identique... */}
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

                .table thead th {
                    border-bottom: 2px solid #dee2e6;
                    font-weight: 600;
                }

                .table-hover tbody tr:hover {
                    background-color: rgba(40, 167, 69, 0.05);
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
                }
            `}</style>
        </AdminLayout>
    );
}
