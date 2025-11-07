import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { Card, Alert } from "@/Components/UI/Composant";

export default function Index({ students, classes, filters, auth }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filterSexe, setFilterSexe] = useState(filters.sexe || "");
    const [filterClass, setFilterClass] = useState(filters.class_id || "");
    const [filterStatus, setFilterStatus] = useState(filters.status || "");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkAction, setBulkAction] = useState("");
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState("excel");
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importErrors, setImportErrors] = useState([]);
    const [importSuccess, setImportSuccess] = useState(null);

    const { delete: destroy, processing, post } = useForm();

    const handleSearch = () => {
        router.get(
            route("scolarite.etudiants.index"),
            {
                search: searchTerm,
                class_id: filterClass,
                status: filterStatus,
                sexe: filterSexe,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            const validTypes = [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "text/csv",
            ];

            if (!validTypes.includes(file.type)) {
                alert(
                    "Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV"
                );
                e.target.value = null; // Reset input
                return;
            }

            // Vérifier la taille (5 Mo max)
            if (file.size > 5 * 1024 * 1024) {
                alert("Le fichier ne doit pas dépasser 5 Mo");
                e.target.value = null;
                return;
            }

            setImportFile(file);
            setImportErrors([]);
            setImportSuccess(null);
        }
    };

    const handleImport = () => {
        if (!importFile) {
            alert("Veuillez sélectionner un fichier");
            return;
        }

        const formData = new FormData();
        formData.append("file", importFile);

        router.post(route("scolarite.etudiants.import"), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowImportModal(false);
                setImportFile(null);
                setImportErrors([]);
                setImportSuccess(null);
            },
            onError: (errors) => {
                if (errors.import_errors) {
                    setImportErrors(errors.import_errors);
                } else if (errors.error) {
                    alert(errors.error);
                } else if (errors.file) {
                    alert(errors.file[0]);
                }
            },
        });
    };

    const downloadTemplate = () => {
        window.location.href = route("scolarite.etudiants.template");
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterSexe;
        setFilterClass("");
        setFilterStatus("");
        router.get(route("scolarite.etudiants.index"));
    };

    const handleDelete = (student) => {
        setStudentToDelete(student);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (studentToDelete) {
            destroy(route("scolarite.etudiants.destroy", studentToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setStudentToDelete(null);
                },
            });
        }
    };

    const handleBulkAction = () => {
        if (selectedStudents.length === 0) {
            alert("Veuillez sélectionner au moins un étudiant");
            return;
        }
        setShowBulkModal(true);
    };

    const confirmBulkAction = () => {
        post(route("admin.users.bulk-action"), {
            action: bulkAction,
            student_ids: selectedStudents,
            onSuccess: () => {
                setShowBulkModal(false);
                setSelectedStudents([]);
                setBulkAction("");
            },
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            format: exportFormat,
            search: searchTerm,
            sexe: filterSexe,
            class_id: filterClass,
            status: filterStatus,
        });

        if (selectedStudents.length > 0) {
            params.append("student_ids", selectedStudents.join(","));
        }

        window.open(
            `${route("scolarite.etudiants.export")}?${params.toString()}`
        );
        setShowExportModal(false);
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR");
    };

    const getStatusBadge = (status) => {
        const badges = {
            actif: "badge-success",
            inactif: "badge-secondary",
            suspendu: "badge-warning",
        };
        return `badge ${badges[status] || "badge-secondary"}`;
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
        return age + " ans";
    };

    // Statistiques calculées
    const stats = {
        total: students.total,
        active: students.data.filter((s) => s.statut === "actif").length,
        suspended: students.data.filter((s) => s.statut === "suspendu").length,
        inactive: students.data.filter((s) => s.statut === "inactif").length,
    };

    return (
        <AdminLayout title="Gestion des étudiants">
            <Head title="Étudiants" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-user-graduate mr-2 text-primary"></i>
                                Gestion des étudiants
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
                                    Étudiants
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
                                    <h3>{stats.total}</h3>
                                    <p>Étudiants inscrits</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-user-graduate"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats.active}</h3>
                                    <p>Actifs</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.suspended}</h3>
                                    <p>Suspendus</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-pause-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-secondary">
                                <div className="inner">
                                    <h3>{stats.inactive}</h3>
                                    <p>Inactifs</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-times-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu d'actions principales */}
                    <Card
                        title="Actions principales"
                        icon="fas fa-tools"
                        className="mb-4"
                    >
                        <div className="row">
                            <div className="col-md-3">
                                <Link
                                    href={route("scolarite.etudiants.create")}
                                    className="btn btn-success btn-block btn-lg"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Inscrire un étudiant
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-block btn-lg"
                                    onClick={() => setShowImportModal(true)}
                                >
                                    <i className="fas fa-file-excel mr-2"></i>
                                    Importer depuis Excel
                                </button>
                            </div>
                            <div className="col-md-3">
                                <Link
                                    href={route("scolarite.attendances.index")}
                                    className="btn btn-primary btn-block btn-lg"
                                >
                                    <i className="fas fa-calendar-check mr-2"></i>
                                    Gestion des absences et retards
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <Link
                                    href={route("scolarite.resources.index")}
                                    className="btn btn-info btn-block btn-lg"
                                >
                                    <i className="fas fa-folder-open mr-2"></i>
                                    Ressources pédagogiques
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <button
                                    type="button"
                                    className="btn btn-warning btn-block btn-lg"
                                    onClick={() => setShowExportModal(true)}
                                >
                                    <i className="fas fa-download mr-2"></i>
                                    Exporter la liste
                                </button>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-12">
                                <div className="btn-group">
                                    <Link
                                        href={route(
                                            "scolarite.etudiants.create"
                                        )}
                                        className="btn btn-outline-primary"
                                    >
                                        <i className="fas fa-chart-bar mr-1"></i>
                                        Rapport d'assiduité
                                    </Link>
                                    <Link
                                        href={route(
                                            "scolarite.etudiants.create"
                                        )}
                                        className="btn btn-outline-success"
                                    >
                                        <i className="fas fa-plus mr-1"></i>
                                        Saisir présences
                                    </Link>
                                    <Link
                                        href={route(
                                            "scolarite.etudiants.create"
                                        )}
                                        className="btn btn-outline-info"
                                    >
                                        <i className="fas fa-cloud-upload-alt mr-1"></i>
                                        Ajouter ressource
                                    </Link>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => router.get(route(""))}
                                    >
                                        <i className="fas fa-analytics mr-1"></i>
                                        Statistiques avancées
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Filtres et actions */}
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
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nom, email, matricule..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            onKeyPress={(e) =>
                                                e.key === "Enter" &&
                                                handleSearch()
                                            }
                                        />
                                        <div className="input-group-append">
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={handleSearch}
                                            >
                                                <i className="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Classe</label>
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
                                        {classes.map((schoolClass) => (
                                            <option
                                                key={schoolClass.id}
                                                value={schoolClass.id}
                                            >
                                                {schoolClass.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Sexe</label>
                                    <select
                                        className="form-control"
                                        value={filterSexe}
                                        onChange={(e) =>
                                            setFilterSexe(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Sélectionner...
                                        </option>
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Statut</label>
                                    <select
                                        className="form-control"
                                        value={filterStatus}
                                        onChange={(e) =>
                                            setFilterStatus(e.target.value)
                                        }
                                    >
                                        <option value="">Tous</option>
                                        <option value="actif">Actif</option>
                                        <option value="suspendu">
                                            Suspendu
                                        </option>
                                        <option value="inactif">Inactif</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <div className="form-group mb-0 w-100">
                                    <div className="btn-group w-100">
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
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-6">
                                {selectedStudents.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-warning mr-2"
                                        onClick={handleBulkAction}
                                    >
                                        <i className="fas fa-edit mr-1"></i>
                                        Actions groupées (
                                        {selectedStudents.length})
                                    </button>
                                )}
                                {selectedStudents.length > 0 && (
                                    <Link
                                        href={route(
                                            "scolarite.etudiants.create",
                                            {
                                                student_ids:
                                                    selectedStudents.join(","),
                                            }
                                        )}
                                        className="btn btn-info mr-2"
                                    >
                                        <i className="fas fa-calendar-check mr-1"></i>
                                        Présences groupées
                                    </Link>
                                )}
                            </div>
                            <div className="col-md-6 text-right">
                                {selectedStudents.length > 0 && (
                                    <span className="badge badge-primary badge-lg">
                                        {selectedStudents.length} étudiant(s)
                                        sélectionné(s)
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Liste des étudiants */}
                    <Card title="Liste des étudiants" icon="fas fa-list">
                        {students.data.length === 0 ? (
                            <Alert type="info">
                                {students.total === 0
                                    ? "Aucun étudiant n'est inscrit pour le moment."
                                    : "Aucun étudiant ne correspond aux critères de recherche."}
                            </Alert>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>
                                                <div className="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id="select-all"
                                                        checked={
                                                            selectedStudents.length ===
                                                            students.data.length
                                                        }
                                                        onChange={(e) => {
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                setSelectedStudents(
                                                                    students.data.map(
                                                                        (s) =>
                                                                            s.id
                                                                    )
                                                                );
                                                            } else {
                                                                setSelectedStudents(
                                                                    []
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        className="custom-control-label"
                                                        htmlFor="select-all"
                                                    ></label>
                                                </div>
                                            </th>
                                            <th>Étudiant</th>
                                            <th>Classe</th>
                                            <th>Contact</th>
                                            <th>Naissance</th>
                                            <th>Contact Urgence</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.data.map((student) => (
                                            <tr
                                                key={student.id}
                                                className={
                                                    selectedStudents.includes(
                                                        student.id
                                                    )
                                                        ? "table-active"
                                                        : ""
                                                }
                                            >
                                                <td>
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            id={`select-${student.id}`}
                                                            checked={selectedStudents.includes(
                                                                student.id
                                                            )}
                                                            onChange={() =>
                                                                toggleStudentSelection(
                                                                    student.id
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            className="custom-control-label"
                                                            htmlFor={`select-${student.id}`}
                                                        ></label>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={
                                                                student.photo_url ||
                                                                "/images/default-avatar.png"
                                                            }
                                                            alt={student.name}
                                                            className="img-circle mr-2"
                                                            style={{
                                                                width: "40px",
                                                                height: "40px",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                        <div>
                                                            <strong>
                                                                {student.name}
                                                            </strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {
                                                                    student.matricule
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {student.current_class ? (
                                                        <div>
                                                            <strong>
                                                                {
                                                                    student.current_class
                                                                }
                                                            </strong>
                                                            <br />
                                                            <small className="text-info">
                                                                {
                                                                    student.current_academic_year
                                                                }
                                                            </small>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">
                                                            Non assigné
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div>
                                                        <small className="d-block">
                                                            {student.email}
                                                        </small>
                                                        {student.telephone && (
                                                            <small className="text-muted">
                                                                {
                                                                    student.telephone
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <small className="d-block">
                                                            {
                                                                student.date_naissance_formatted
                                                            }
                                                        </small>
                                                        {student.lieu_naissance && (
                                                            <small className="text-muted">
                                                                {
                                                                    student.lieu_naissance
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <small className="d-block">
                                                            {
                                                                student.parent_name
                                                            }
                                                        </small>
                                                        {student.contact_urgent && (
                                                            <small className="text-muted">
                                                                {
                                                                    student.contact_urgent
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={getStatusBadge(
                                                            student.statut
                                                        )}
                                                    >
                                                        {student.statut}
                                                    </span>
                                                    {student.student_enrollment
                                                        ?.scholarship && (
                                                        <span className="badge badge-info ml-1">
                                                            Boursier
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <Link
                                                            href={route(
                                                                "scolarite.etudiants.show",
                                                                student.id
                                                            )}
                                                            className="btn btn-info"
                                                            title="Voir le profil"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                "scolarite.etudiants.edit",
                                                                student.id
                                                            )}
                                                            className="btn btn-warning"
                                                            title="Modifier"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                "scolarite.etudiants.create",
                                                                student.id
                                                            )}
                                                            className="btn btn-primary"
                                                            title="Voir les présences"
                                                        >
                                                            <i className="fas fa-calendar-check"></i>
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            title="Supprimer"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    student
                                                                )
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
                        {students.last_page > 1 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    Affichage de {students.from} à {students.to}{" "}
                                    sur {students.total} résultats
                                </div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        {students.links.map((link, index) => (
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

            {/* Modal d'export */}
            {showExportModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <i className="fas fa-download mr-2"></i>
                                    Exporter la liste des étudiants
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowExportModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Format d'export</label>
                                    <select
                                        className="form-control"
                                        value={exportFormat}
                                        onChange={(e) =>
                                            setExportFormat(e.target.value)
                                        }
                                    >
                                        <option value="excel">
                                            Excel (.xlsx)
                                        </option>
                                        <option value="csv">CSV</option>
                                        <option value="pdf">PDF</option>
                                    </select>
                                </div>

                                <div className="alert alert-info">
                                    <h6>
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Informations incluses :
                                    </h6>
                                    <ul className="mb-0 small">
                                        <li>
                                            Informations personnelles (nom,
                                            email, téléphone)
                                        </li>
                                        <li>
                                            Données académiques (classe,
                                            matricule, année)
                                        </li>
                                        <li>Statut et date d'inscription</li>
                                        <li>
                                            Contacts famille (parent, urgence)
                                        </li>
                                        {selectedStudents.length > 0 && (
                                            <li>
                                                <strong>
                                                    Seuls les étudiants
                                                    sélectionnés seront exportés
                                                </strong>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="form-group">
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="include-stats"
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="include-stats"
                                        >
                                            Inclure les statistiques d'assiduité
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="include-medical"
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="include-medical"
                                        >
                                            Inclure les informations médicales
                                            (confidentiel)
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowExportModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleExport}
                                >
                                    <i className="fas fa-download mr-1"></i>
                                    Exporter (
                                    {selectedStudents.length > 0
                                        ? selectedStudents.length
                                        : students.total}{" "}
                                    étudiants)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de suppression */}
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
                                    Êtes-vous sûr de vouloir supprimer
                                    l'étudiant{" "}
                                    <strong>{studentToDelete?.name}</strong> ?
                                </p>
                                <p className="text-muted">
                                    Cette action supprimera définitivement
                                    toutes les données associées à cet étudiant
                                    (présences, etc.).
                                </p>
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
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-trash mr-1"></i>
                                            Supprimer définitivement
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'actions groupées */}
            {showBulkModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <i className="fas fa-users mr-2"></i>
                                    Actions groupées
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowBulkModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Sélectionnez l'action à appliquer aux{" "}
                                    {selectedStudents.length} étudiant(s)
                                    sélectionné(s) :
                                </p>
                                <div className="form-group">
                                    <select
                                        className="form-control"
                                        value={bulkAction}
                                        onChange={(e) =>
                                            setBulkAction(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            -- Choisir une action --
                                        </option>
                                        <option value="activate">
                                            Activer
                                        </option>
                                        <option value="suspend">
                                            Suspendre
                                        </option>
                                        <option value="transfer">
                                            Transférer vers une classe
                                        </option>
                                        <option value="mark_attendance">
                                            Marquer présence/absence
                                        </option>
                                        <option value="send_resources">
                                            Envoyer des ressources
                                        </option>
                                    </select>
                                </div>
                                {bulkAction === "transfer" && (
                                    <div className="form-group">
                                        <label>Classe de destination</label>
                                        <select
                                            className="form-control"
                                            required
                                        >
                                            <option value="">
                                                -- Sélectionner une classe --
                                            </option>
                                            {classes.map((schoolClass) => (
                                                <option
                                                    key={schoolClass.id}
                                                    value={schoolClass.id}
                                                >
                                                    {schoolClass.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {bulkAction === "mark_attendance" && (
                                    <div className="form-group">
                                        <label>Statut de présence</label>
                                        <select
                                            className="form-control"
                                            required
                                        >
                                            <option value="">
                                                -- Choisir --
                                            </option>
                                            <option value="present">
                                                Présent
                                            </option>
                                            <option value="absent">
                                                Absent
                                            </option>
                                            <option value="late">
                                                En retard
                                            </option>
                                            <option value="excused">
                                                Absent justifié
                                            </option>
                                        </select>
                                    </div>
                                )}
                                {bulkAction === "send_resources" && (
                                    <div className="form-group">
                                        <label>Type de ressource</label>
                                        <select
                                            className="form-control"
                                            required
                                        >
                                            <option value="">
                                                -- Choisir --
                                            </option>
                                            <option value="assignment">
                                                Devoir
                                            </option>
                                            <option value="exam">
                                                Sujet d'examen
                                            </option>
                                            <option value="course">
                                                Cours
                                            </option>
                                            <option value="correction">
                                                Correction
                                            </option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowBulkModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={confirmBulkAction}
                                    disabled={processing || !bulkAction}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Traitement...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check mr-1"></i>
                                            Appliquer l'action
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showImportModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-secondary">
                                <h4 className="modal-title">
                                    <i className="fas fa-file-excel mr-2"></i>
                                    Importer des étudiants depuis Excel
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => {
                                        setShowImportModal(false);
                                        setImportFile(null);
                                        setImportErrors([]);
                                        setImportSuccess(null);
                                    }}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* Instructions */}
                                <div className="alert alert-info">
                                    <h6>
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Instructions :
                                    </h6>
                                    <ol className="mb-0 small">
                                        <li>
                                            Téléchargez le modèle Excel
                                            ci-dessous
                                        </li>
                                        <li>
                                            Remplissez les informations des
                                            étudiants
                                        </li>
                                        <li>Importez le fichier rempli</li>
                                        <li>
                                            Vérifiez les erreurs éventuelles
                                        </li>
                                    </ol>
                                </div>

                                {/* Bouton de téléchargement du template */}
                                <div className="text-center mb-4">
                                    <button
                                        type="button"
                                        className="btn btn-success btn-lg"
                                        onClick={downloadTemplate}
                                    >
                                        <i className="fas fa-download mr-2"></i>
                                        Télécharger le modèle Excel
                                    </button>
                                    <p className="text-muted mt-2 small">
                                        Le modèle contient toutes les colonnes
                                        nécessaires avec des exemples
                                    </p>
                                </div>

                                <hr />

                                {/* Upload du fichier */}
                                <div className="form-group">
                                    <label>
                                        Sélectionner le fichier Excel rempli
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="custom-file">
                                        <input
                                            type="file"
                                            className="custom-file-input"
                                            id="importFile"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleImportFile}
                                        />
                                        <label
                                            className="custom-file-label"
                                            htmlFor="importFile"
                                        >
                                            {importFile
                                                ? importFile.name
                                                : "Choisir un fichier..."}
                                        </label>
                                    </div>
                                    <small className="form-text text-muted">
                                        Formats acceptés : .xlsx, .xls, .csv
                                        (taille max: 5 Mo)
                                    </small>
                                </div>

                                {/* Colonnes requises */}
                                <div className="alert alert-warning">
                                    <h6>
                                        <i className="fas fa-exclamation-triangle mr-1"></i>
                                        Colonnes obligatoires :
                                    </h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <ul className="small mb-0">
                                                <li>
                                                    <strong>name</strong> - Nom
                                                    et prénom
                                                </li>
                                                <li>
                                                    <strong>email</strong> -
                                                    Email unique
                                                </li>
                                                <li>
                                                    <strong>
                                                        date_naissance
                                                    </strong>{" "}
                                                    - Format: JJ/MM/AAAA
                                                </li>
                                                <li>
                                                    <strong>
                                                        lieu_naissance
                                                    </strong>{" "}
                                                    - Lieu de naissance
                                                </li>
                                                <li>
                                                    <strong>sexe</strong> - M ou
                                                    F
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="col-md-6">
                                            <ul className="small mb-0">
                                                <li>
                                                    <strong>
                                                        school_class_id
                                                    </strong>{" "}
                                                    - ID de la classe
                                                </li>
                                                <li>
                                                    <strong>
                                                        academic_year_id
                                                    </strong>{" "}
                                                    - ID année académique
                                                </li>
                                            </ul>
                                            <p className="small text-info mt-2 mb-0">
                                                <i className="fas fa-lightbulb mr-1"></i>
                                                Les autres colonnes sont
                                                optionnelles
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Erreurs d'import */}
                                {importErrors.length > 0 && (
                                    <div className="alert alert-danger">
                                        <h6>
                                            <i className="fas fa-times-circle mr-1"></i>
                                            Erreurs détectées lors de l'import :
                                        </h6>
                                        <div
                                            className="import-errors"
                                            style={{
                                                maxHeight: "200px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <table className="table table-sm table-bordered mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Ligne</th>
                                                        <th>Erreur</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importErrors.map(
                                                        (error, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    {error.row}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        error.message
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Succès */}
                                {importSuccess && (
                                    <div className="alert alert-success">
                                        <h6>
                                            <i className="fas fa-check-circle mr-1"></i>
                                            Import réussi !
                                        </h6>
                                        <p className="mb-0">{importSuccess}</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowImportModal(false);
                                        setImportFile(null);
                                        setImportErrors([]);
                                        setImportSuccess(null);
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleImport}
                                    disabled={!importFile || processing}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Import en cours...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-upload mr-1"></i>
                                            Importer les étudiants
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .small-box {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .table td {
                    vertical-align: middle;
                }

                .img-circle {
                    border-radius: 50%;
                }

                .modal.show {
                    display: block !important;
                }

                .table-active {
                    background-color: rgba(0, 123, 255, 0.075);
                }

                .btn-lg {
                    font-size: 1rem;
                    padding: 0.75rem 1.25rem;
                }

                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }
            `}</style>
        </AdminLayout>
    );
}
