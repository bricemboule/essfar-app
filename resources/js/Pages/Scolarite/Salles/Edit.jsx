import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Card, FormField } from "@/Components/UI/Composant";

export default function Edit({ classroom, buildings, equipmentOptions }) {
    const [selectedEquipment, setSelectedEquipment] = useState(
        classroom.equipment || []
    );

    const { data, setData, put, processing, errors } = useForm({
        name: classroom.name || "",
        code: classroom.code || "",
        capacity: classroom.capacity || 30,
        building: classroom.building || "",
        floor: classroom.floor || "",
        equipment: classroom.equipment || [],
        is_available:
            classroom.is_available !== undefined
                ? classroom.is_available
                : true,
    });

    // Synchroniser l'équipement sélectionné
    useEffect(() => {
        setData("equipment", selectedEquipment);
    }, [selectedEquipment]);

    const handleEquipmentToggle = (equipment) => {
        const newEquipment = selectedEquipment.includes(equipment)
            ? selectedEquipment.filter((item) => item !== equipment)
            : [...selectedEquipment, equipment];

        setSelectedEquipment(newEquipment);
    };

    const submit = (e) => {
        e.preventDefault();
        put(route("academic.classrooms.update", classroom.id));
    };

    const getCapacityCategory = (capacity) => {
        if (capacity >= 100)
            return { label: "Très grande salle", color: "text-success" };
        if (capacity >= 50)
            return { label: "Grande salle", color: "text-info" };
        if (capacity >= 20)
            return { label: "Salle moyenne", color: "text-warning" };
        return { label: "Petite salle", color: "text-secondary" };
    };

    const capacityCategory = getCapacityCategory(data.capacity);

    return (
        <AdminLayout title="Modifier une salle">
            <Head title={`Modifier ${classroom.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-edit mr-2 text-warning"></i>
                                Modifier la salle
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
                                            "academic.classrooms.index"
                                        )}
                                    >
                                        Salles
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "academic.classrooms.show",
                                            classroom.id
                                        )}
                                    >
                                        {classroom.name}
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Modifier
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-8">
                            <Card
                                title="Informations de la salle"
                                icon="fas fa-door-open"
                            >
                                <form onSubmit={submit}>
                                    <div className="row">
                                        <div className="col-md-8">
                                            <FormField
                                                label="Nom de la salle"
                                                name="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.name}
                                                required
                                                icon="fas fa-door-open"
                                                placeholder="Ex: Salle de conférence A"
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <FormField
                                                label="Code de la salle"
                                                name="code"
                                                type="text"
                                                value={data.code}
                                                onChange={(e) =>
                                                    setData(
                                                        "code",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.code}
                                                required
                                                icon="fas fa-barcode"
                                                placeholder="Code unique"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <FormField
                                                label="Capacité"
                                                name="capacity"
                                                type="number"
                                                value={data.capacity}
                                                onChange={(e) =>
                                                    setData(
                                                        "capacity",
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                error={errors.capacity}
                                                required
                                                icon="fas fa-users"
                                                min="1"
                                                max="500"
                                                placeholder="Nombre de places"
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <FormField
                                                label="Bâtiment"
                                                name="building"
                                                type="text"
                                                value={data.building}
                                                onChange={(e) =>
                                                    setData(
                                                        "building",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.building}
                                                icon="fas fa-building"
                                                placeholder="Ex: Bâtiment A"
                                                list="buildings-list"
                                            />
                                            <datalist id="buildings-list">
                                                {buildings.map(
                                                    (building, index) => (
                                                        <option
                                                            key={index}
                                                            value={building}
                                                        />
                                                    )
                                                )}
                                            </datalist>
                                        </div>
                                        <div className="col-md-4">
                                            <FormField
                                                label="Étage"
                                                name="floor"
                                                type="text"
                                                value={data.floor}
                                                onChange={(e) =>
                                                    setData(
                                                        "floor",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.floor}
                                                icon="fas fa-layer-group"
                                                placeholder="Ex: 1er étage, RDC"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <div className="custom-control custom-switch">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="is_available"
                                                checked={data.is_available}
                                                onChange={(e) =>
                                                    setData(
                                                        "is_available",
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            <label
                                                className="custom-control-label"
                                                htmlFor="is_available"
                                            >
                                                Salle disponible pour
                                                réservation
                                            </label>
                                        </div>
                                        {errors.is_available && (
                                            <div className="text-danger small">
                                                {errors.is_available}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </Card>

                            {/* Équipements */}
                            <Card
                                title="Équipements disponibles"
                                icon="fas fa-tools"
                                className="mt-4"
                            >
                                <div className="row">
                                    {equipmentOptions.map((equipment) => (
                                        <div
                                            key={equipment}
                                            className="col-md-4 mb-3"
                                        >
                                            <div
                                                className={`card cursor-pointer ${
                                                    selectedEquipment.includes(
                                                        equipment
                                                    )
                                                        ? "card-success card-outline"
                                                        : "card-outline"
                                                }`}
                                                onClick={() =>
                                                    handleEquipmentToggle(
                                                        equipment
                                                    )
                                                }
                                            >
                                                <div className="card-body p-3">
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            id={`equipment-${equipment}`}
                                                            checked={selectedEquipment.includes(
                                                                equipment
                                                            )}
                                                            onChange={() =>
                                                                handleEquipmentToggle(
                                                                    equipment
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            className="custom-control-label cursor-pointer"
                                                            htmlFor={`equipment-${equipment}`}
                                                        >
                                                            {equipment}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.equipment && (
                                    <div className="text-danger small">
                                        {errors.equipment}
                                    </div>
                                )}
                            </Card>

                            {/* Boutons d'action */}
                            <div className="d-flex justify-content-between mt-4">
                                <div>
                                    <Link
                                        href={route(
                                            "academic.classrooms.show",
                                            classroom.id
                                        )}
                                        className="btn btn-secondary mr-2"
                                    >
                                        <i className="fas fa-arrow-left mr-1"></i>
                                        Retour
                                    </Link>
                                    <Link
                                        href={route(
                                            "academic.classrooms.index"
                                        )}
                                        className="btn btn-outline-secondary"
                                    >
                                        <i className="fas fa-list mr-1"></i>
                                        Liste des salles
                                    </Link>
                                </div>

                                <button
                                    type="button"
                                    onClick={submit}
                                    className="btn btn-warning"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Modification...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save mr-1"></i>
                                            Modifier la salle
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Sidebar avec résumé */}
                        <div className="col-md-4">
                            <Card
                                title="Aperçu de la salle"
                                icon="fas fa-info-circle"
                            >
                                <div className="text-center mb-3">
                                    <h4 className="text-primary">
                                        {data.name || "Nouvelle salle"}
                                    </h4>
                                    <p className="text-muted">
                                        {data.code || "Code automatique"}
                                    </p>
                                    {data.building && (
                                        <span className="badge badge-info">
                                            {data.building}
                                            {data.floor && ` - ${data.floor}`}
                                        </span>
                                    )}
                                </div>

                                <div className="text-center mb-3">
                                    <div className="description-block">
                                        <h5
                                            className={`description-header ${capacityCategory.color}`}
                                        >
                                            <i className="fas fa-users mr-1"></i>
                                            {data.capacity}
                                        </h5>
                                        <span className="description-text">
                                            PLACES
                                        </span>
                                        <p className="small text-muted">
                                            {capacityCategory.label}
                                        </p>
                                    </div>
                                </div>

                                <hr />

                                <div>
                                    <p>
                                        <strong>Statut :</strong>{" "}
                                        {data.is_available ? (
                                            <span className="badge badge-success">
                                                Disponible
                                            </span>
                                        ) : (
                                            <span className="badge badge-danger">
                                                Indisponible
                                            </span>
                                        )}
                                    </p>

                                    <p>
                                        <strong>Équipements :</strong>{" "}
                                        {selectedEquipment.length}
                                    </p>

                                    {selectedEquipment.length > 0 && (
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Équipements sélectionnés :
                                            </small>
                                            <ul className="list-unstyled mt-1">
                                                {selectedEquipment
                                                    .slice(0, 4)
                                                    .map((item, index) => (
                                                        <li
                                                            key={index}
                                                            className="small"
                                                        >
                                                            <i className="fas fa-check text-success mr-1"></i>
                                                            {item}
                                                        </li>
                                                    ))}
                                                {selectedEquipment.length >
                                                    4 && (
                                                    <li className="small text-muted">
                                                        ... et{" "}
                                                        {selectedEquipment.length -
                                                            4}{" "}
                                                        autre(s)
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card
                                title="Historique des modifications"
                                icon="fas fa-history"
                                className="mt-3"
                            >
                                <div className="timeline timeline-sm">
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-info"></div>
                                        <div className="timeline-content">
                                            <h6>Salle créée</h6>
                                            <small className="text-muted">
                                                {new Date(
                                                    classroom.created_at
                                                ).toLocaleDateString("fr-FR")}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-warning"></div>
                                        <div className="timeline-content">
                                            <h6>Dernière modification</h6>
                                            <small className="text-muted">
                                                {new Date(
                                                    classroom.updated_at
                                                ).toLocaleDateString("fr-FR")}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card
                                title="Actions rapides"
                                icon="fas fa-bolt"
                                className="mt-3"
                            >
                                <div className="d-grid gap-2">
                                    <Link
                                        href={route(
                                            "academic.classrooms.show",
                                            classroom.id
                                        )}
                                        className="btn btn-outline-info btn-block"
                                    >
                                        <i className="fas fa-eye mr-1"></i>
                                        Voir les détails
                                    </Link>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-block"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fas fa-print mr-1"></i>
                                        Imprimer la fiche
                                    </button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .cursor-pointer {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .cursor-pointer:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .description-block {
                    display: block;
                    margin: 10px 0;
                    text-align: center;
                }

                .description-header {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin: 0;
                }

                .description-text {
                    text-transform: uppercase;
                    font-size: 0.8em;
                    font-weight: 600;
                }

                .timeline {
                    position: relative;
                    padding-left: 30px;
                }

                .timeline-item {
                    position: relative;
                    padding-bottom: 15px;
                }

                .timeline-item:before {
                    content: "";
                    position: absolute;
                    left: -23px;
                    top: 15px;
                    bottom: -15px;
                    width: 2px;
                    background: #dee2e6;
                }

                .timeline-item:last-child:before {
                    display: none;
                }

                .timeline-marker {
                    position: absolute;
                    left: -30px;
                    top: 0;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .d-grid .btn + .btn {
                    margin-top: 0.5rem;
                }
            `}</style>
        </AdminLayout>
    );
}
