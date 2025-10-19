import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({
    resources,
    stats,
    subjects,
    academicYears,
    filters,
    student,
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filterType, setFilterType] = useState(filters.type || "");
    const [filterSubject, setFilterSubject] = useState(
        filters.subject_id || ""
    );
    const [filterYear, setFilterYear] = useState(
        filters.academic_year_id || ""
    );
    const [filterSemester, setFilterSemester] = useState(
        filters.semester || ""
    );

    const handleSearch = () => {
        router.get(
            route("student.resources.index"),
            {
                search: searchTerm,
                type: filterType,
                subject_id: filterSubject,
                academic_year_id: filterYear,
                semester: filterSemester,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterType("");
        setFilterSubject("");
        setFilterYear("");
        setFilterSemester("");
        router.get(route("student.resources.index"));
    };

    const getTypeLabel = (type) => {
        const labels = {
            ancien_cc: "Ancien CC",
            ancien_ds: "Ancien DS",
            session_normale: "Session Normale",
            session_rattrapage: "Session Rattrapage",
            cours: "Support de cours",
            td: "TD",
            tp: "TP",
            correction: "Correction",
            autre: "Autre",
        };
        return labels[type] || type;
    };

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
            zip: "fa-file-archive text-secondary",
            rar: "fa-file-archive text-secondary",
        };
        return icons[extension] || "fa-file text-secondary";
    };

    return (
        <AdminLayout title="Ressources pédagogiques">
            <Head title="Mes ressources" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-folder-open mr-2 text-info"></i>
                                Ressources pédagogiques
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("student.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Ressources
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Informations étudiant */}
                    <div className="alert alert-info">
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Classe :</strong>{" "}
                        {student.school_class?.name || "Non assigné"} |
                        <strong className="ml-2">
                            Ressources disponibles :
                        </strong>{" "}
                        {stats.total}
                        {stats.recent > 0 && (
                            <span className="badge badge-success ml-2">
                                {stats.recent} nouvelles cette semaine
                            </span>
                        )}
                    </div>

                    {/* Statistiques rapides */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{stats.total}</h3>
                                    <p>Ressources disponibles</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-folder-open"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-primary">
                                <div className="inner">
                                    <h3>{stats.by_type.ancien_cc || 0}</h3>
                                    <p>Anciens CC</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-file-alt"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>
                                        {stats.by_type.session_normale || 0}
                                    </h3>
                                    <p>Examens normaux</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-graduation-cap"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats.by_type.cours || 0}</h3>
                                    <p>Supports de cours</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-book"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-filter mr-2"></i>
                                Filtrer les ressources
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Recherche</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Titre, description..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            onKeyPress={(e) =>
                                                e.key === "Enter" &&
                                                handleSearch()
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            className="form-control"
                                            value={filterType}
                                            onChange={(e) =>
                                                setFilterType(e.target.value)
                                            }
                                        >
                                            <option value="">Tous</option>
                                            <option value="ancien_cc">
                                                Ancien CC
                                            </option>
                                            <option value="ancien_ds">
                                                Ancien DS
                                            </option>
                                            <option value="session_normale">
                                                Session Normale
                                            </option>
                                            <option value="session_rattrapage">
                                                Session Rattrapage
                                            </option>
                                            <option value="cours">Cours</option>
                                            <option value="td">TD</option>
                                            <option value="tp">TP</option>
                                            <option value="correction">
                                                Correction
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Matière</label>
                                        <select
                                            className="form-control"
                                            value={filterSubject}
                                            onChange={(e) =>
                                                setFilterSubject(e.target.value)
                                            }
                                        >
                                            <option value="">Toutes</option>
                                            {subjects.map((subject) => (
                                                <option
                                                    key={subject.id}
                                                    value={subject.id}
                                                >
                                                    {subject.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Année</label>
                                        <select
                                            className="form-control"
                                            value={filterYear}
                                            onChange={(e) =>
                                                setFilterYear(e.target.value)
                                            }
                                        >
                                            <option value="">Toutes</option>
                                            {academicYears.map((year) => (
                                                <option
                                                    key={year.id}
                                                    value={year.id}
                                                >
                                                    {year.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Semestre</label>
                                        <select
                                            className="form-control"
                                            value={filterSemester}
                                            onChange={(e) =>
                                                setFilterSemester(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">Tous</option>
                                            <option value="S1">S1</option>
                                            <option value="S2">S2</option>
                                            <option value="S3">S3</option>
                                            <option value="S4">S4</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleSearch}
                                        >
                                            <i className="fas fa-search mr-1"></i>
                                            Rechercher
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={clearFilters}
                                        >
                                            <i className="fas fa-times mr-1"></i>
                                            Réinitialiser
                                        </button>
                                        <Link
                                            href={route(
                                                "student.resources.statistics"
                                            )}
                                            className="btn btn-outline-info"
                                        >
                                            <i className="fas fa-chart-bar mr-1"></i>
                                            Mes statistiques
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Liste des ressources */}
                    <div className="row">
                        {resources.data.length === 0 ? (
                            <div className="col-12">
                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    Aucune ressource disponible pour le moment.
                                </div>
                            </div>
                        ) : (
                            resources.data.map((resource) => (
                                <div
                                    key={resource.id}
                                    className="col-md-6 col-lg-4"
                                >
                                    <div className="card card-outline card-primary">
                                        <div className="card-header">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <h5 className="card-title mb-1">
                                                        <i
                                                            className={`fas ${getFileIcon(
                                                                resource.file_name
                                                            )} mr-2`}
                                                        ></i>
                                                        {resource.title}
                                                    </h5>
                                                    <span
                                                        className={`badge ${getTypeBadge(
                                                            resource.type
                                                        )}`}
                                                    >
                                                        {getTypeLabel(
                                                            resource.type
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <p className="text-muted small mb-2">
                                                <i className="fas fa-book mr-1"></i>
                                                {resource.subject.name}
                                            </p>
                                            {resource.description && (
                                                <p className="card-text small">
                                                    {resource.description.substring(
                                                        0,
                                                        100
                                                    )}
                                                    {resource.description
                                                        .length > 100 && "..."}
                                                </p>
                                            )}
                                            <div className="row text-center mt-3">
                                                <div className="col-6">
                                                    <small className="text-muted d-block">
                                                        Taille
                                                    </small>
                                                    <strong>
                                                        {
                                                            resource.file_size_formatted
                                                        }
                                                    </strong>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">
                                                        Téléchargements
                                                    </small>
                                                    <strong>
                                                        {
                                                            resource.downloads_count
                                                        }
                                                    </strong>
                                                </div>
                                            </div>
                                            {resource.exam_date && (
                                                <p className="text-muted small mt-2 mb-0">
                                                    <i className="fas fa-calendar mr-1"></i>
                                                    Date:{" "}
                                                    {new Date(
                                                        resource.exam_date
                                                    ).toLocaleDateString(
                                                        "fr-FR"
                                                    )}
                                                </p>
                                            )}
                                            {resource.semester && (
                                                <span className="badge badge-info mt-1">
                                                    {resource.semester}
                                                </span>
                                            )}
                                        </div>
                                        <div className="card-footer">
                                            <div className="btn-group btn-group-sm w-100">
                                                <Link
                                                    href={route(
                                                        "student.resources.show",
                                                        resource.id
                                                    )}
                                                    className="btn btn-info"
                                                >
                                                    <i className="fas fa-eye mr-1"></i>
                                                    Voir
                                                </Link>
                                                <a
                                                    href={route(
                                                        "student.resources.download",
                                                        resource.id
                                                    )}
                                                    className="btn btn-success"
                                                    target="_blank"
                                                >
                                                    <i className="fas fa-download mr-1"></i>
                                                    Télécharger
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {resources.last_page > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav>
                                <ul className="pagination">
                                    {resources.links.map((link, index) => (
                                        <li
                                            key={index}
                                            className={`page-item ${
                                                link.active ? "active" : ""
                                            } ${!link.url ? "disabled" : ""}`}
                                        >
                                            {link.url ? (
                                                <Link
                                                    href={link.url}
                                                    className="page-link"
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    className="page-link"
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                .small-box {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .card {
                    transition: transform 0.2s;
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </AdminLayout>
    );
}
