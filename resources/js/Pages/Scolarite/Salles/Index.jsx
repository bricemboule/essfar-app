import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { Card, Alert } from "@/Components/UI/Composant";

export default function Index({ classrooms, stats, filters, buildings, auth }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filterBuilding, setFilterBuilding] = useState(
        filters.building || ""
    );
    const [filterAvailable, setFilterAvailable] = useState(
        filters.is_available || ""
    );
    const [minCapacity, setMinCapacity] = useState(filters.min_capacity || "");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [classroomToDelete, setClassroomToDelete] = useState(null);

    const { delete: destroy, processing } = useForm();

    const handleDelete = (classroom) => {
        setClassroomToDelete(classroom);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (classroomToDelete) {
            destroy(
                route("academic.classrooms.destroy", classroomToDelete.id),
                {
                    onSuccess: () => {
                        setShowDeleteModal(false);
                        setClassroomToDelete(null);
                    },
                }
            );
        }
    };

    const handleSearch = () => {
        router.get(route("academic.classrooms.index"), {
            search: searchTerm,
            building: filterBuilding,
            is_available: filterAvailable,
            min_capacity: minCapacity,
        });
    };

    const handleReset = () => {
        setSearchTerm("");
        setFilterBuilding("");
        setFilterAvailable("");
        setMinCapacity("");
        router.get(route("academic.classrooms.index"));
    };

    const getCapacityColor = (capacity) => {
        if (capacity >= 100) return "text-success";
        if (capacity >= 50) return "text-info";
        if (capacity >= 20) return "text-warning";
        return "text-secondary";
    };

    const getAvailabilityBadge = (isAvailable) => {
        return isAvailable ? (
            <span className="badge badge-success">Disponible</span>
        ) : (
            <span className="badge badge-danger">Indisponible</span>
        );
    };

    return (
        <AdminLayout title="Gestion des salles">
            <Head title="Salles de classe" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-door-open mr-2 text-primary"></i>
                                Gestion des salles
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
                                    Salles
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
                                    <p>Salles totales</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-door-open"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats.available}</h3>
                                    <p>Salles disponibles</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats.total_capacity}</h3>
                                    <p>Capacité totale</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-users"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{stats.buildings.length}</h3>
                                    <p>Bâtiments</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-building"></i>
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
                            <div className="col-md-3">
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
                                            placeholder="Nom, code, bâtiment..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Bâtiment</label>
                                    <select
                                        className="form-control"
                                        value={filterBuilding}
                                        onChange={(e) =>
                                            setFilterBuilding(e.target.value)
                                        }
                                    >
                                        <option value="">Tous</option>
                                        {buildings.map((building) => (
                                            <option
                                                key={building}
                                                value={building}
                                            >
                                                {building}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Disponibilité</label>
                                    <select
                                        className="form-control"
                                        value={filterAvailable}
                                        onChange={(e) =>
                                            setFilterAvailable(e.target.value)
                                        }
                                    >
                                        <option value="">Toutes</option>
                                        <option value="1">Disponibles</option>
                                        <option value="0">Indisponibles</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Capacité min.</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Ex: 20"
                                        value={minCapacity}
                                        onChange={(e) =>
                                            setMinCapacity(e.target.value)
                                        }
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <div className="form-group mb-0 w-100 d-flex gap-2">
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
                                        className="btn btn-secondary"
                                        onClick={handleReset}
                                    >
                                        <i className="fas fa-times mr-1"></i>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-md-12 text-right">
                                <Link
                                    href={route("academic.classrooms.create")}
                                    className="btn btn-success"
                                >
                                    <i className="fas fa-plus mr-1"></i>
                                    Nouvelle salle
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {/* Liste des salles */}
                    <Card title="Liste des salles" icon="fas fa-list">
                        {classrooms.data.length === 0 ? (
                            <Alert type="info">
                                Aucune salle ne correspond aux critères de
                                recherche.
                            </Alert>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Salle</th>
                                            <th>Bâtiment / Étage</th>
                                            <th>Capacité</th>
                                            <th>Équipements</th>
                                            <th>Plannings</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classrooms.data.map((classroom) => (
                                            <tr key={classroom.id}>
                                                <td>
                                                    <div>
                                                        <strong>
                                                            {classroom.name}
                                                        </strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            Code:{" "}
                                                            {classroom.code}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        {classroom.building && (
                                                            <>
                                                                <i className="fas fa-building text-info mr-1"></i>
                                                                {
                                                                    classroom.building
                                                                }
                                                            </>
                                                        )}
                                                        {classroom.floor && (
                                                            <div className="small text-muted">
                                                                Étage:{" "}
                                                                {
                                                                    classroom.floor
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`h5 ${getCapacityColor(
                                                            classroom.capacity
                                                        )}`}
                                                    >
                                                        <i className="fas fa-users mr-1"></i>
                                                        {classroom.capacity}
                                                    </span>
                                                </td>
                                                <td>
                                                    {classroom.equipment &&
                                                    classroom.equipment.length >
                                                        0 ? (
                                                        <div>
                                                            {classroom.equipment
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="badge badge-light mr-1"
                                                                        >
                                                                            {
                                                                                item
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            {classroom.equipment
                                                                .length > 2 && (
                                                                <span className="badge badge-secondary">
                                                                    +
                                                                    {classroom
                                                                        .equipment
                                                                        .length -
                                                                        2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">
                                                            Aucun équipement
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="badge badge-info">
                                                        {
                                                            classroom.schedules_count
                                                        }{" "}
                                                        planning(s)
                                                    </span>
                                                </td>
                                                <td>
                                                    {getAvailabilityBadge(
                                                        classroom.is_available
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <Link
                                                            href={route(
                                                                "academic.classrooms.show",
                                                                classroom.id
                                                            )}
                                                            className="btn btn-info"
                                                            title="Voir les détails"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                "academic.classrooms.edit",
                                                                classroom.id
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
                                                                    classroom
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
                        {classrooms.last_page > 1 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    Affichage de {classrooms.from} à{" "}
                                    {classrooms.to} sur {classrooms.total}{" "}
                                    résultats
                                </div>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        {classrooms.links.map((link, index) => (
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
                                    Êtes-vous sûr de vouloir supprimer la salle{" "}
                                    <strong>{classroomToDelete?.name}</strong> ?
                                </p>
                                <p className="text-muted">
                                    Cette action est irréversible. Tous les
                                    plannings associés seront également
                                    supprimés.
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
                .small-box {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .table td {
                    vertical-align: middle;
                }
                
                .badge {
                    font-size: 0.75em;
                }
                
                .gap-2 > * + * {
                    margin-left: 0.5rem;
                }
                
                .modal.show {
                    display: block !important;
                }
            `}</style>
        </AdminLayout>
    );
}
