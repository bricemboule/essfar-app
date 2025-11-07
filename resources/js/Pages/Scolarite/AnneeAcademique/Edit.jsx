import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Card, FormField, Alert } from "@/Components/UI/Composant";

export default function Edit({ academicYear }) {
    const [hasChanges, setHasChanges] = useState(false);
    const [dateWarnings, setDateWarnings] = useState([]);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: academicYear.name || "",
        start_date: academicYear.start_date || "",
        end_date: academicYear.end_date || "",
        is_active: academicYear.is_active || false,
    });

    // Surveiller les changements
    useEffect(() => {
        const originalData = {
            name: academicYear.name || "",
            start_date: academicYear.start_date || "",
            end_date: academicYear.end_date || "",
            is_active: academicYear.is_active || false,
        };

        const currentData = {
            name: data.name,
            start_date: data.start_date,
            end_date: data.end_date,
            is_active: data.is_active,
        };

        setHasChanges(
            JSON.stringify(originalData) !== JSON.stringify(currentData)
        );
    }, [data, academicYear]);

    // Validation des dates et alertes
    useEffect(() => {
        const warnings = [];

        if (data.start_date && data.end_date) {
            const startDate = new Date(data.start_date);
            const endDate = new Date(data.end_date);
            const today = new Date();

            // Vérifier que la date de fin est après le début
            if (endDate <= startDate) {
                warnings.push(
                    "La date de fin doit être postérieure à la date de début"
                );
            }

            // Calculer la durée
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffMonths = Math.round(diffDays / 30);

            if (diffMonths < 8) {
                warnings.push(
                    "Une année académique dure généralement entre 8 et 12 mois"
                );
            } else if (diffMonths > 12) {
                warnings.push(
                    "Cette période semble inhabituellement longue pour une année académique"
                );
            }

            // Vérifier les dates par rapport à aujourd'hui
            if (data.is_active && endDate < today) {
                warnings.push(
                    "Une année académique active ne devrait pas avoir une date de fin passée"
                );
            }

            if (startDate > today && data.is_active) {
                warnings.push(
                    "Une année académique active ne peut pas commencer dans le futur"
                );
            }
        }

        setDateWarnings(warnings);
    }, [data.start_date, data.end_date, data.is_active]);

    const submit = (e) => {
        e.preventDefault();

        if (dateWarnings.length > 0) {
            const confirmMessage =
                "Il y a des avertissements concernant les dates. Voulez-vous continuer ?";
            if (!confirm(confirmMessage)) {
                return;
            }
        }

        put(route("scolarite.years.update", academicYear.id));
    };

    const handleReset = () => {
        reset();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getDuration = () => {
        if (!data.start_date || !data.end_date) return "";

        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.round(diffDays / 30);

        return `${diffMonths} mois (${diffDays} jours)`;
    };

    const getStatusInfo = () => {
        const today = new Date();
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);

        if (data.is_active) {
            return {
                status: "Active",
                color: "success",
                icon: "fas fa-star",
            };
        } else if (endDate < today) {
            return {
                status: "Terminée",
                color: "secondary",
                icon: "fas fa-check-circle",
            };
        } else if (startDate > today) {
            return {
                status: "À venir",
                color: "info",
                icon: "fas fa-clock",
            };
        } else {
            return {
                status: "En cours",
                color: "warning",
                icon: "fas fa-play",
            };
        }
    };

    const statusInfo = getStatusInfo();

    // Vérifier s'il y a des dépendances
    const hasDependencies =
        academicYear.classes_count > 0 ||
        academicYear.courses_count > 0 ||
        academicYear.schedules_count > 0;

    return (
        <AdminLayout title={`Modifier ${academicYear.name}`}>
            <Head title={`Modifier ${academicYear.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-edit mr-2 text-warning"></i>
                                Modifier l'année académique
                            </h1>
                            <small className="text-muted">
                                {academicYear.name}
                            </small>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("scolarite.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link href={route("scolarite.years.index")}>
                                        Années académiques
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "scolarite.years.show",
                                            academicYear.id
                                        )}
                                    >
                                        {academicYear.name}
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
                    {/* Alertes */}
                    {hasDependencies && (
                        <Alert type="warning" className="mb-4">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            Cette année académique contient des données
                            associées :
                            <ul className="mt-2 mb-0">
                                {academicYear.classes_count > 0 && (
                                    <li>
                                        {academicYear.classes_count} classe(s)
                                    </li>
                                )}
                                {academicYear.courses_count > 0 && (
                                    <li>{academicYear.courses_count} cours</li>
                                )}
                                {academicYear.schedules_count > 0 && (
                                    <li>
                                        {academicYear.schedules_count} emploi(s)
                                        du temps
                                    </li>
                                )}
                            </ul>
                            Soyez prudent lors de la modification des dates.
                        </Alert>
                    )}

                    {hasChanges && (
                        <Alert type="info" className="mb-4">
                            <i className="fas fa-info-circle mr-2"></i>
                            Vous avez des modifications non sauvegardées.
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-info ml-2"
                                onClick={handleReset}
                            >
                                <i className="fas fa-undo mr-1"></i>
                                Annuler les modifications
                            </button>
                        </Alert>
                    )}

                    {dateWarnings.length > 0 && (
                        <Alert type="warning" className="mb-4">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            <strong>
                                Avertissements concernant les dates :
                            </strong>
                            <ul className="mt-2 mb-0">
                                {dateWarnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    <div className="row">
                        <div className="col-md-8">
                            <Card
                                title="Informations de l'année académique"
                                icon="fas fa-calendar-alt"
                            >
                                <form onSubmit={submit}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <FormField
                                                label="Nom de l'année académique"
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
                                                icon="fas fa-graduation-cap"
                                                placeholder="Ex: 2023-2024, Année 2023/24..."
                                                helpText="Nom unique pour identifier cette année académique"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormField
                                                label="Date de début"
                                                name="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) =>
                                                    setData(
                                                        "start_date",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.start_date}
                                                required
                                                icon="fas fa-play"
                                                helpText="Début officiel de l'année académique"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <FormField
                                                label="Date de fin"
                                                name="end_date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) =>
                                                    setData(
                                                        "end_date",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.end_date}
                                                required
                                                icon="fas fa-stop"
                                                helpText="Fin officielle de l'année académique"
                                            />
                                        </div>
                                    </div>

                                    {/* Affichage de la durée calculée */}
                                    {data.start_date && data.end_date && (
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="alert alert-light">
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <strong>
                                                                Période :
                                                            </strong>{" "}
                                                            {formatDate(
                                                                data.start_date
                                                            )}{" "}
                                                            -{" "}
                                                            {formatDate(
                                                                data.end_date
                                                            )}
                                                        </div>
                                                        <div>
                                                            <strong>
                                                                Durée :
                                                            </strong>{" "}
                                                            {getDuration()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <div className="custom-control custom-switch">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id="is_active"
                                                        checked={data.is_active}
                                                        onChange={(e) =>
                                                            setData(
                                                                "is_active",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        className="custom-control-label"
                                                        htmlFor="is_active"
                                                    >
                                                        <strong>
                                                            Année académique
                                                            active
                                                        </strong>
                                                        <small className="d-block text-muted">
                                                            Seule une année
                                                            académique peut être
                                                            active à la fois.
                                                            L'activation de
                                                            cette année
                                                            désactivera
                                                            automatiquement les
                                                            autres.
                                                        </small>
                                                    </label>
                                                </div>
                                                {errors.is_active && (
                                                    <div className="text-danger small mt-1">
                                                        {errors.is_active}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </Card>

                            {/* Informations sur les dépendances */}
                            {hasDependencies && (
                                <Card
                                    title="Données associées"
                                    icon="fas fa-link"
                                    className="mt-4"
                                >
                                    <div className="row">
                                        {academicYear.classes_count > 0 && (
                                            <div className="col-md-4 mb-3">
                                                <div className="info-box bg-primary">
                                                    <span className="info-box-icon">
                                                        <i className="fas fa-school"></i>
                                                    </span>
                                                    <div className="info-box-content">
                                                        <span className="info-box-text">
                                                            Classes
                                                        </span>
                                                        <span className="info-box-number">
                                                            {
                                                                academicYear.classes_count
                                                            }
                                                        </span>
                                                        <div className="progress">
                                                            <div
                                                                className="progress-bar bg-primary"
                                                                style={{
                                                                    width: "100%",
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="progress-description">
                                                            <Link
                                                                href={route(
                                                                    "scolarite.classes.index",
                                                                    {
                                                                        academic_year_id:
                                                                            academicYear.id,
                                                                    }
                                                                )}
                                                                className="text-white"
                                                            >
                                                                Voir les classes
                                                            </Link>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {academicYear.courses_count > 0 && (
                                            <div className="col-md-4 mb-3">
                                                <div className="info-box bg-warning">
                                                    <span className="info-box-icon">
                                                        <i className="fas fa-book"></i>
                                                    </span>
                                                    <div className="info-box-content">
                                                        <span className="info-box-text">
                                                            Cours
                                                        </span>
                                                        <span className="info-box-number">
                                                            {
                                                                academicYear.courses_count
                                                            }
                                                        </span>
                                                        <div className="progress">
                                                            <div
                                                                className="progress-bar bg-warning"
                                                                style={{
                                                                    width: "100%",
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="progress-description">
                                                            <Link
                                                                href={route(
                                                                    "scolarite.courses.index",
                                                                    {
                                                                        academic_year_id:
                                                                            academicYear.id,
                                                                    }
                                                                )}
                                                                className="text-white"
                                                            >
                                                                Voir les cours
                                                            </Link>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {academicYear.schedules_count > 0 && (
                                            <div className="col-md-4 mb-3">
                                                <div className="info-box bg-danger">
                                                    <span className="info-box-icon">
                                                        <i className="fas fa-calendar-check"></i>
                                                    </span>
                                                    <div className="info-box-content">
                                                        <span className="info-box-text">
                                                            Emplois du temps
                                                        </span>
                                                        <span className="info-box-number">
                                                            {
                                                                academicYear.schedules_count
                                                            }
                                                        </span>
                                                        <div className="progress">
                                                            <div
                                                                className="progress-bar bg-danger"
                                                                style={{
                                                                    width: "100%",
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="progress-description">
                                                            <Link
                                                                href={route(
                                                                    "scolarite.planning.schedules.index",
                                                                    {
                                                                        academic_year_id:
                                                                            academicYear.id,
                                                                    }
                                                                )}
                                                                className="text-white"
                                                            >
                                                                Voir les emplois
                                                                du temps
                                                            </Link>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Alert type="info">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        La modification des dates peut affecter
                                        les emplois du temps et les inscriptions
                                        existantes. Assurez-vous que les
                                        nouvelles dates sont cohérentes avec les
                                        données existantes.
                                    </Alert>
                                </Card>
                            )}

                            {/* Boutons d'action */}
                            <div className="d-flex justify-content-between mt-4">
                                <Link
                                    href={route(
                                        "scolarite.years.show",
                                        academicYear.id
                                    )}
                                    className="btn btn-secondary"
                                >
                                    <i className="fas fa-arrow-left mr-1"></i>
                                    Retour aux détails
                                </Link>

                                <div className="btn-group">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="btn btn-outline-secondary"
                                        disabled={!hasChanges}
                                    >
                                        <i className="fas fa-undo mr-1"></i>
                                        Réinitialiser
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submit}
                                        className="btn btn-warning"
                                        disabled={processing || !hasChanges}
                                    >
                                        {processing ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                                Mise à jour...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save mr-1"></i>
                                                Sauvegarder les modifications
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar avec informations */}
                        <div className="col-md-4">
                            <Card title="État actuel" icon={statusInfo.icon}>
                                <div className="text-center mb-3">
                                    <h4 className="text-primary">
                                        {academicYear.name}
                                    </h4>
                                    <span
                                        className={`badge badge-${statusInfo.color} badge-lg`}
                                    >
                                        <i
                                            className={`${statusInfo.icon} mr-1`}
                                        ></i>
                                        {statusInfo.status}
                                    </span>
                                </div>

                                <div className="row text-center mb-3">
                                    <div className="col-6">
                                        <div className="description-block">
                                            <h5 className="description-header text-info">
                                                {formatDate(
                                                    academicYear.start_date
                                                )}
                                            </h5>
                                            <span className="description-text">
                                                DÉBUT
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="description-block">
                                            <h5 className="description-header text-warning">
                                                {formatDate(
                                                    academicYear.end_date
                                                )}
                                            </h5>
                                            <span className="description-text">
                                                FIN
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div>
                                    <p>
                                        <strong>Nom :</strong>{" "}
                                        {data.name || "Non défini"}
                                    </p>
                                    <p>
                                        <strong>Période :</strong>
                                        {data.start_date && data.end_date ? (
                                            <span className="text-success ml-1">
                                                {getDuration()}
                                            </span>
                                        ) : (
                                            <span className="text-muted ml-1">
                                                Dates incomplètes
                                            </span>
                                        )}
                                    </p>
                                    <p>
                                        <strong>Statut :</strong>
                                        <span
                                            className={`badge badge-${statusInfo.color} ml-2`}
                                        >
                                            {data.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </p>

                                    {hasChanges && (
                                        <Alert type="info" className="mt-3">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            <small>
                                                Des modifications sont en cours
                                            </small>
                                        </Alert>
                                    )}
                                </div>
                            </Card>

                            <Card
                                title="Statistiques"
                                icon="fas fa-chart-bar"
                                className="mt-3"
                            >
                                <div className="row text-center">
                                    <div className="col-4">
                                        <div className="description-block">
                                            <h5 className="description-header text-primary">
                                                {academicYear.classes_count ||
                                                    0}
                                            </h5>
                                            <span className="description-text">
                                                Classes
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="description-block">
                                            <h5 className="description-header text-warning">
                                                {academicYear.courses_count ||
                                                    0}
                                            </h5>
                                            <span className="description-text">
                                                Cours
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="description-block">
                                            <h5 className="description-header text-danger">
                                                {academicYear.schedules_count ||
                                                    0}
                                            </h5>
                                            <span className="description-text">
                                                Emplois
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card
                                title="Actions rapides"
                                icon="fas fa-lightning-bolt"
                                className="mt-3"
                            >
                                <div className="d-grid gap-2">
                                    <Link
                                        href={route(
                                            "scolarite.years.show",
                                            academicYear.id
                                        )}
                                        className="btn btn-outline-info btn-sm"
                                    >
                                        <i className="fas fa-eye mr-1"></i>
                                        Voir les détails complets
                                    </Link>

                                    {academicYear.classes_count > 0 && (
                                        <Link
                                            href={route(
                                                "scolarite.classes.index",
                                                {
                                                    academic_year_id:
                                                        academicYear.id,
                                                }
                                            )}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            <i className="fas fa-school mr-1"></i>
                                            Gérer les classes
                                        </Link>
                                    )}

                                    {academicYear.courses_count > 0 && (
                                        <Link
                                            href={route(
                                                "scolarite.courses.index",
                                                {
                                                    academic_year_id:
                                                        academicYear.id,
                                                }
                                            )}
                                            className="btn btn-outline-warning btn-sm"
                                        >
                                            <i className="fas fa-book mr-1"></i>
                                            Gérer les cours
                                        </Link>
                                    )}

                                    {!academicYear.is_active &&
                                        !data.is_active && (
                                            <button
                                                type="button"
                                                className="btn btn-success btn-sm"
                                                onClick={() => {
                                                    setData("is_active", true);
                                                }}
                                            >
                                                <i className="fas fa-star mr-1"></i>
                                                Activer cette année
                                            </button>
                                        )}
                                </div>
                            </Card>

                            <Card
                                title="Conseils"
                                icon="fas fa-lightbulb"
                                className="mt-3"
                            >
                                <div className="small">
                                    <p>
                                        <strong>Dates :</strong> Assurez-vous
                                        que les dates correspondent au
                                        calendrier académique officiel.
                                    </p>
                                    <p>
                                        <strong>Activation :</strong> Une seule
                                        année peut être active. L'activation
                                        désactive automatiquement les autres.
                                    </p>
                                    <p>
                                        <strong>Modification :</strong> Les
                                        changements de dates peuvent affecter
                                        les emplois du temps existants.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .description-block {
                    display: block;
                }

                .description-header {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin: 0;
                }

                .description-text {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    font-weight: 600;
                    color: #6c757d;
                }

                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }

                .custom-switch .custom-control-label::before {
                    left: -2.25rem;
                    width: 1.75rem;
                    pointer-events: all;
                    border-radius: 0.5rem;
                }

                .custom-switch .custom-control-label::after {
                    top: calc(0.25rem + 2px);
                    left: calc(-2.25rem + 2px);
                    width: calc(1rem - 4px);
                    height: calc(1rem - 4px);
                    border-radius: 0.5rem;
                    transition: transform 0.15s ease-in-out;
                }

                .info-box {
                    display: flex;
                    position: relative;
                    border-radius: 0.25rem;
                    padding: 0.75rem;
                    margin-bottom: 1rem;
                    color: white;
                }

                .info-box-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 70px;
                    height: 70px;
                    border-radius: 0.25rem;
                    font-size: 1.875rem;
                    background: rgba(255, 255, 255, 0.2);
                }

                .info-box-content {
                    flex: 1;
                    padding: 0.5rem 0.75rem;
                }

                .info-box-text {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .info-box-number {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .progress {
                    height: 2px;
                    margin: 0.25rem 0;
                    background: rgba(255, 255, 255, 0.2);
                }

                .progress-description {
                    display: block;
                    font-size: 0.75rem;
                    margin-top: 0.25rem;
                }

                .d-grid {
                    display: grid;
                }

                .gap-2 {
                    gap: 0.5rem;
                }
            `}</style>
        </AdminLayout>
    );
}
