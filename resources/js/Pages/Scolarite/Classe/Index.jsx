import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { Card, Alert } from "@/Components/UI/Composant";

export default function Index({ classes, academicYears, auth }) {
    console.log(classes);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterLevel, setFilterLevel] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);

    const { delete: destroy, processing } = useForm();

    const filteredClasses = classes.data.filter((schoolClass) => {
        const matchesSearch =
            schoolClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            schoolClass.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            schoolClass.level.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesYear =
            !filterYear ||
            schoolClass.academic_year.id.toString() === filterYear;

        const matchesLevel = !filterLevel || schoolClass.level === filterLevel;

        return matchesSearch && matchesYear && matchesLevel;
    });

    const handleDelete = (schoolClass) => {
        setClassToDelete(schoolClass);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (classToDelete) {
            destroy(route("scolarite.classes.destroy", classToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setClassToDelete(null);
                },
            });
        }
    };

    const getProgressColor = (current, max) => {
        const percentage = (current / max) * 100;
        if (percentage >= 90) return "bg-danger";
        if (percentage >= 75) return "bg-warning";
        if (percentage >= 50) return "bg-info";
        return "bg-success";
    };

    const levels = [...new Set(classes.data.map((c) => c.level))];

    return (
        <AdminLayout title="Gestion des classes">
            <Head title="Classes" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-users mr-2 text-primary"></i>
                                Gestion des classes
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("scolarite.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Classes
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
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{classes.total}</h3>
                                    <p>Classes totales</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-school"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>
                                        {classes.data.reduce(
                                            (sum, c) => sum + c.students_count,
                                            0
                                        )}
                                    </h3>
                                    <p>Étudiants inscrits</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-user-graduate"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>
                                        {classes.data.reduce(
                                            (sum, c) => sum + c.courses_count,
                                            0
                                        )}
                                    </h3>
                                    <p>Cours programmés</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-book"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>
                                        {Math.round(
                                            (classes.data.reduce(
                                                (sum, c) =>
                                                    sum + c.students_count,
                                                0
                                            ) /
                                                classes.data.reduce(
                                                    (sum, c) =>
                                                        sum + c.capacity,
                                                    0
                                                )) *
                                                100
                                        ) || 0}
                                        %
                                    </h3>
                                    <p>Taux d'occupation</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-chart-pie"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres et recherche */}
                    <Card
                        title="Recherche et filtres"
                        icon="fas fa-filter"
                        className="mb-4"
                    >
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Recherche</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">
                                                <i className="fas fa-search"></i>
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nom, code ou niveau..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Année académique</label>
                                    <select
                                        className="form-control"
                                        value={filterYear}
                                        onChange={(e) =>
                                            setFilterYear(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Toutes les années
                                        </option>
                                        {academicYears.map((year) => (
                                            <option
                                                key={year.id}
                                                value={year.id}
                                            >
                                                {year.name}{" "}
                                                {year.is_active
                                                    ? "(Active)"
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Niveau</label>
                                    <select
                                        className="form-control"
                                        value={filterLevel}
                                        onChange={(e) =>
                                            setFilterLevel(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Tous les niveaux
                                        </option>
                                        {levels.map((level) => (
                                            <option key={level} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <div className="form-group mb-0 w-100">
                                    <Link
                                        href={route("scolarite.classes.create")}
                                        className="btn btn-primary btn-block"
                                    >
                                        <i className="fas fa-plus mr-1"></i>
                                        Nouvelle classe
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Liste des classes */}
                    <Card title="Liste des classes" icon="fas fa-list">
                        {filteredClasses.length === 0 ? (
                            <Alert type="info">
                                {classes.data.length === 0
                                    ? "Aucune classe n'a été créée pour le moment."
                                    : "Aucune classe ne correspond aux critères de recherche."}
                            </Alert>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Classe</th>
                                            <th>Niveau</th>
                                            <th>Année académique</th>
                                            <th>Étudiants</th>
                                            <th>Cours</th>
                                            <th>Taux d'occupation</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClasses.map((schoolClass) => (
                                            <tr key={schoolClass.id}>
                                                <td>
                                                    <div>
                                                        <strong>
                                                            {schoolClass.name}
                                                        </strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {schoolClass.code}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-info">
                                                        {schoolClass.level}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div>
                                                        {
                                                            schoolClass
                                                                .academic_year
                                                                .name
                                                        }
                                                        {schoolClass
                                                            .academic_year
                                                            .is_active && (
                                                            <span className="badge badge-success ml-1">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="mr-2">
                                                            {
                                                                schoolClass.students_count
                                                            }
                                                            /
                                                            {
                                                                schoolClass.capacity
                                                            }
                                                        </span>
                                                        <div
                                                            className="progress flex-grow-1"
                                                            style={{
                                                                height: "20px",
                                                                minWidth:
                                                                    "60px",
                                                            }}
                                                        >
                                                            <div
                                                                className={`progress-bar ${getProgressColor(
                                                                    schoolClass.students_count,
                                                                    schoolClass.capacity
                                                                )}`}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        (schoolClass.students_count /
                                                                            schoolClass.capacity) *
                                                                            100,
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-primary">
                                                        {
                                                            schoolClass.courses_count
                                                        }{" "}
                                                        cours
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${
                                                            (schoolClass.students_count /
                                                                schoolClass.capacity) *
                                                                100 >=
                                                            90
                                                                ? "badge-danger"
                                                                : (schoolClass.students_count /
                                                                      schoolClass.capacity) *
                                                                      100 >=
                                                                  75
                                                                ? "badge-warning"
                                                                : "badge-success"
                                                        }`}
                                                    >
                                                        {Math.round(
                                                            (schoolClass.students_count /
                                                                schoolClass.capacity) *
                                                                100
                                                        )}
                                                        %
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <Link
                                                            href={route(
                                                                "scolarite.classes.show",
                                                                schoolClass.id
                                                            )}
                                                            className="btn btn-info"
                                                            title="Voir les détails"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                "scolarite.classes.edit",
                                                                schoolClass.id
                                                            )}
                                                            className="btn btn-warning"
                                                            title="Modifier"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            title="Supprimer"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    schoolClass
                                                                )
                                                            }
                                                            disabled={
                                                                schoolClass.students_count >
                                                                0
                                                            }
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {classes.last_page > 1 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    Affichage de {classes.from} à {classes.to}{" "}
                                    sur {classes.total} résultats
                                </div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        {classes.links.map((link, index) => (
                                            <li
                                                key={index}
                                                className={`page-item ${
                                                    link.active ? "active" : ""
                                                } ${
                                                    !link.url ? "disabled" : ""
                                                }`}
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
                    </Card>
                </div>
            </section>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <i className="fas fa-exclamation-triangle text-warning mr-2"></i>
                                    Confirmer la suppression
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Êtes-vous sûr de vouloir supprimer la classe{" "}
                                    <strong>{classToDelete?.name}</strong> ?
                                </p>
                                <p className="text-muted">
                                    Cette action est irréversible. Tous les
                                    plannings associés seront également
                                    supprimés.
                                </p>
                                {classToDelete?.students_count > 0 && (
                                    <Alert type="danger">
                                        Cette classe contient{" "}
                                        {classToDelete.students_count}{" "}
                                        étudiant(s). Vous devez d'abord les
                                        désinscrire avant de pouvoir supprimer
                                        la classe.
                                    </Alert>
                                )}
                            </div>
                            <div className="modal-footer justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                    disabled={
                                        processing ||
                                        classToDelete?.students_count > 0
                                    }
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-trash mr-1"></i>
                                            Supprimer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .progress {
                    border-radius: 10px;
                }
                
                .progress-bar {
                    border-radius: 10px;
                }
                
                .table td {
                    vertical-align: middle;
                }
                
                .badge {
                    font-size: 0.75em;
                }
                
                .small-box {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .modal.show {
                    display: block !important;
                }
            `}</style>
        </AdminLayout>
    );
}
