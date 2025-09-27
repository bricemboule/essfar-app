import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Card, FormField, Alert } from "@/Components/UI/Composant";

export default function Create({ buildings, equipmentOptions }) {
    const [selectedEquipment, setSelectedEquipment] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        code: "",
        capacity: 30,
        building: "",
        floor: "",
        equipment: [],
        is_available: true,
    });

    // Générer automatiquement le code de la salle
    useEffect(() => {
        if (data.building && data.floor && !data.code) {
            const buildingCode = data.building.substring(0, 1).toUpperCase();
            const floorCode = data.floor.replace(/[^0-9]/g, "");
            const random = Math.floor(Math.random() * 99) + 1;
            const randomPadded = random.toString().padStart(2, "0");
            setData("code", `${buildingCode}${floorCode}${randomPadded}`);
        }
    }, [data.building, data.floor]);

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
        post(route("academic.classrooms.store"));
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
        <AdminLayout title="Créer une salle">
            <Head title="Créer une salle" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-door-open mr-2 text-primary"></i>
                                Créer une nouvelle salle
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
                                <li className="breadcrumb-item active">
                                    Créer
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
                                                placeholder="AUTO"
                                                helpText="Généré automatiquement"
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
                                                className={`card ${
                                                    selectedEquipment.includes(
                                                        equipment
                                                    )
                                                        ? "card-success card-outline"
                                                        : "card-outline"
                                                }`}
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
                                                            className="custom-control-label cursor-pointer w-100"
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
                                <Link
                                    href={route("academic.classrooms.index")}
                                    className="btn btn-secondary"
                                >
                                    <i className="fas fa-arrow-left mr-1"></i>
                                    Annuler
                                </Link>

                                <button
                                    type="button"
                                    onClick={submit}
                                    className="btn btn-success"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save mr-1"></i>
                                            Créer la salle
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
                                title="Conseils"
                                icon="fas fa-lightbulb"
                                className="mt-3"
                            >
                                <div className="small">
                                    <div className="mb-2">
                                        <strong>Capacité recommandée :</strong>
                                        <ul className="mt-1">
                                            <li>
                                                Cours magistraux : 50-100 places
                                            </li>
                                            <li>
                                                Travaux dirigés : 20-30 places
                                            </li>
                                            <li>Laboratoires : 15-25 places</li>
                                            <li>
                                                Salles de réunion : 6-20 places
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="mb-2">
                                        <strong>
                                            Équipements essentiels :
                                        </strong>
                                        <ul className="mt-1">
                                            <li>Projecteur pour les cours</li>
                                            <li>Tableau blanc/interactif</li>
                                            <li>Wifi et prises électriques</li>
                                        </ul>
                                    </div>
                                </div>
                            </Card>

                            <Card
                                title="Statistiques"
                                icon="fas fa-chart-bar"
                                className="mt-3"
                            >
                                <div className="small">
                                    <p>
                                        <strong>Salles existantes :</strong> 45
                                    </p>
                                    <p>
                                        <strong>Capacité totale :</strong> 1,250
                                        places
                                    </p>
                                    <p>
                                        <strong>
                                            Taux d'occupation moyen :
                                        </strong>{" "}
                                        78%
                                    </p>
                                    <div className="progress progress-sm">
                                        <div
                                            className="progress-bar bg-info"
                                            style={{ width: "78%" }}
                                        ></div>
                                    </div>
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
            `}</style>
        </AdminLayout>
    );
}
