import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Contracts({ contracts, filters, statistics }) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "");
    const [selectedType, setSelectedType] = useState(filters.type || "");

    const applyFilters = () => {
        router.get(
            route("scolarite.contracts.index"),
            {
                search: searchTerm,
                status: selectedStatus,
                type: selectedType,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("");
        setSelectedType("");
        router.get(
            route("scolarite.contracts.index"),
            {},
            { preserveState: true }
        );
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: "badge-success",
            expired: "badge-danger",
            terminated: "badge-dark",
            replaced: "badge-secondary",
        };
        return badges[status] || "badge-secondary";
    };

    const getTypeBadge = (type) => {
        const badges = {
            permanent: "badge-primary",
            temporary: "badge-info",
            hourly: "badge-warning",
            project: "badge-secondary",
        };
        return badges[type] || "badge-secondary";
    };

    const handleRenewContract = (contractId) => {
        router.get(route("scolarite.contracts.renew-form", contractId));
    };

    const handleTerminateContract = (contractId) => {
        if (confirm("Êtes-vous sûr de vouloir résilier ce contrat ?")) {
            router.post(route("scolarite.contracts.terminate", contractId));
        }
    };

    return (
        <AdminLayout title="Gestion des Contrats">
            <Head title="Contrats" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-file-contract mr-2 text-primary"></i>
                                Gestion des Contrats
                            </h1>
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
                                            "scolarite.enseignants.index"
                                        )}
                                    >
                                        Enseignants
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Contrats
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Statistiques */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{statistics.active_contracts}</h3>
                                    <p>Contrats Actifs</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-file-signature"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{statistics.expiring_contracts}</h3>
                                    <p>À Renouveler (3 mois)</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>
                                        {(
                                            statistics.total_compensation /
                                            1000000
                                        ).toFixed(1)}
                                        M
                                    </h3>
                                    <p>Compensation Totale (XAF)</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-money-bill-wave"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-primary">
                                <div className="inner">
                                    <h3>
                                        {(
                                            statistics.average_compensation /
                                            1000
                                        ).toFixed(0)}
                                        K
                                    </h3>
                                    <p>Moyenne par Contrat (XAF)</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres et actions */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="btn-group">
                                            <Link
                                                href={route(
                                                    "scolarite.enseignants.index"
                                                )}
                                                className="btn btn-secondary"
                                            >
                                                <i className="fas fa-users mr-1"></i>
                                                Voir les Enseignants
                                            </Link>
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={() =>
                                                    (window.location.href =
                                                        route(
                                                            "scolarite.contracts.export"
                                                        ))
                                                }
                                            >
                                                <i className="fas fa-download mr-1"></i>
                                                Exporter
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            className={`btn btn-outline-primary ${
                                                showFilters ? "active" : ""
                                            }`}
                                            onClick={() =>
                                                setShowFilters(!showFilters)
                                            }
                                        >
                                            <i className="fas fa-filter mr-1"></i>
                                            Filtres
                                        </button>
                                    </div>
                                </div>

                                {showFilters && (
                                    <div className="card-body border-top">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Recherche</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Numéro, enseignant..."
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            setSearchTerm(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>
                                                        Type de contrat
                                                    </label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedType}
                                                        onChange={(e) =>
                                                            setSelectedType(
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Tous les types
                                                        </option>
                                                        <option value="permanent">
                                                            Permanent
                                                        </option>
                                                        <option value="temporary">
                                                            Temporaire
                                                        </option>
                                                        <option value="hourly">
                                                            Horaire
                                                        </option>
                                                        <option value="project">
                                                            Projet
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Statut</label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedStatus}
                                                        onChange={(e) =>
                                                            setSelectedStatus(
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Tous les statuts
                                                        </option>
                                                        <option value="active">
                                                            Actif
                                                        </option>
                                                        <option value="expired">
                                                            Expiré
                                                        </option>
                                                        <option value="terminated">
                                                            Résilié
                                                        </option>
                                                        <option value="replaced">
                                                            Remplacé
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>&nbsp;</label>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-block"
                                                            onClick={
                                                                applyFilters
                                                            }
                                                        >
                                                            <i className="fas fa-search mr-1"></i>
                                                            Filtrer
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary btn-block mt-1"
                                                            onClick={
                                                                clearFilters
                                                            }
                                                        >
                                                            Effacer
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Liste des contrats */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        Liste des Contrats (
                                        {contracts.data.length} résultat(s))
                                    </h3>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-hover">
                                            <thead>
                                                <tr>
                                                    <th>N° Contrat</th>
                                                    <th>Enseignant</th>
                                                    <th>Type</th>
                                                    <th>Période</th>
                                                    <th>Rémunération</th>
                                                    <th>Cours</th>
                                                    <th>Statut</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contracts.data.length > 0 ? (
                                                    contracts.data.map(
                                                        (contract) => (
                                                            <tr
                                                                key={
                                                                    contract.id
                                                                }
                                                            >
                                                                <td>
                                                                    <span className="badge badge-dark">
                                                                        {
                                                                            contract.contract_number
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <Link
                                                                            href={route(
                                                                                "scolarite.enseignants.show",
                                                                                contract
                                                                                    .teacher
                                                                                    .id
                                                                            )}
                                                                            className="font-weight-bold"
                                                                        >
                                                                            {
                                                                                contract
                                                                                    .teacher
                                                                                    .name
                                                                            }{" "}
                                                                            {
                                                                                contract
                                                                                    .teacher
                                                                                    .prenom
                                                                            }
                                                                        </Link>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {
                                                                                contract
                                                                                    .teacher
                                                                                    .matricule
                                                                            }
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`badge ${getTypeBadge(
                                                                            contract.contract_type
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            contract.contract_type
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <small>
                                                                            <strong>
                                                                                Début:
                                                                            </strong>{" "}
                                                                            {new Date(
                                                                                contract.start_date
                                                                            ).toLocaleDateString()}
                                                                        </small>
                                                                        <br />
                                                                        {contract.end_date ? (
                                                                            <small>
                                                                                <strong>
                                                                                    Fin:
                                                                                </strong>{" "}
                                                                                {new Date(
                                                                                    contract.end_date
                                                                                ).toLocaleDateString()}
                                                                            </small>
                                                                        ) : (
                                                                            <small className="text-muted">
                                                                                Indéterminée
                                                                            </small>
                                                                        )}
                                                                        {contract.is_expiring && (
                                                                            <div>
                                                                                <span className="badge badge-warning mt-1">
                                                                                    Expire
                                                                                    bientôt
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {contract.contract_type ===
                                                                    "hourly" ? (
                                                                        <div>
                                                                            <div>
                                                                                {contract.hourly_rate?.toLocaleString()}{" "}
                                                                                XAF/h
                                                                            </div>
                                                                            <small className="text-muted">
                                                                                {
                                                                                    contract.total_hours
                                                                                }

                                                                                h
                                                                                total
                                                                            </small>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <div>
                                                                                {contract.monthly_salary?.toLocaleString()}{" "}
                                                                                XAF/mois
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="mt-1">
                                                                        <strong className="text-success">
                                                                            Total:{" "}
                                                                            {contract.total_compensation?.toLocaleString()}{" "}
                                                                            XAF
                                                                        </strong>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div
                                                                        className="text-truncate"
                                                                        style={{
                                                                            maxWidth:
                                                                                "200px",
                                                                        }}
                                                                    >
                                                                        <small className="text-muted">
                                                                            {
                                                                                contract.courses_summary
                                                                            }
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`badge ${getStatusBadge(
                                                                            contract.status
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            contract.status
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group btn-group-sm">
                                                                        <a
                                                                            href={route(
                                                                                "scolarite.contracts.download",
                                                                                contract.id
                                                                            )}
                                                                            className="btn btn-success"
                                                                            title="Télécharger"
                                                                            target="_blank"
                                                                        >
                                                                            <i className="fas fa-file-pdf"></i>
                                                                        </a>
                                                                        {contract.status ===
                                                                            "active" && (
                                                                            <>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-info"
                                                                                    title="Renouveler"
                                                                                    onClick={() =>
                                                                                        handleRenewContract(
                                                                                            contract.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <i className="fas fa-redo"></i>
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-danger"
                                                                                    title="Résilier"
                                                                                    onClick={() =>
                                                                                        handleTerminateContract(
                                                                                            contract.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <i className="fas fa-times"></i>
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan="8"
                                                            className="text-center py-5"
                                                        >
                                                            <div className="text-muted">
                                                                <i className="fas fa-file-contract fa-3x mb-3"></i>
                                                                <div>
                                                                    Aucun
                                                                    contrat
                                                                    trouvé
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Pagination */}
                                {contracts.data.length > 0 &&
                                    contracts.links && (
                                        <div className="card-footer clearfix">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="pagination-info">
                                                    <small className="text-muted">
                                                        Affichage de{" "}
                                                        {contracts.from} à{" "}
                                                        {contracts.to} sur{" "}
                                                        {contracts.total}{" "}
                                                        contrats
                                                    </small>
                                                </div>
                                                <div className="pagination-links">
                                                    {contracts.links.map(
                                                        (link, index) =>
                                                            link.url ? (
                                                                <Link
                                                                    key={index}
                                                                    href={
                                                                        link.url
                                                                    }
                                                                    className={`btn btn-sm mr-1 ${
                                                                        link.active
                                                                            ? "btn-primary"
                                                                            : "btn-outline-primary"
                                                                    }`}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: link.label,
                                                                    }}
                                                                    preserveState
                                                                />
                                                            ) : (
                                                                <span
                                                                    key={index}
                                                                    className="btn btn-sm btn-outline-secondary mr-1 disabled"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: link.label,
                                                                    }}
                                                                />
                                                            )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .small-box {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .table td {
                    vertical-align: middle;
                }
            `}</style>
        </AdminLayout>
    );
}
