import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Card, FormField, Alert } from "@/Components/UI/Composant";

export default function Create() {
    const [dateWarnings, setDateWarnings] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        start_date: "",
        end_date: "",
        is_active: false,
    });

    // Suggestions automatiques de nom
    useEffect(() => {
        if (!data.name) {
            const newSuggestions = [
                `${currentYear}-${nextYear}`,
                `Année ${currentYear}/${nextYear}`,
                `Année académique ${currentYear}-${nextYear}`,
                `Session ${currentYear}-${nextYear}`,
            ];
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [data.name, currentYear, nextYear]);

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

            // Vérifier si les dates sont dans une période raisonnable
            const yearOfStart = startDate.getFullYear();
            if (
                yearOfStart < currentYear - 2 ||
                yearOfStart > currentYear + 2
            ) {
                warnings.push(
                    "Les dates semblent être dans une période inhabituelle"
                );
            }
        }

        setDateWarnings(warnings);
    }, [data.start_date, data.end_date, data.is_active, currentYear]);

    // Générer automatiquement les dates pour l'année courante
    const generateCurrentYearDates = () => {
        const startDate = new Date(currentYear, 8, 1); // 1er septembre
        const endDate = new Date(nextYear, 5, 30); // 30 juin de l'année suivante

        setData({
            ...data,
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
            name: data.name || `${currentYear}-${nextYear}`,
        });
    };

    // Générer des dates pour l'année suivante
    const generateNextYearDates = () => {
        const startDate = new Date(nextYear, 8, 1); // 1er septembre année suivante
        const endDate = new Date(nextYear + 1, 5, 30); // 30 juin année d'après

        setData({
            ...data,
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
            name: data.name || `${nextYear}-${nextYear + 1}`,
        });
    };

    const submit = (e) => {
        e.preventDefault();

        if (dateWarnings.length > 0) {
            const confirmMessage =
                "Il y a des avertissements concernant les dates. Voulez-vous continuer ?";
            if (!confirm(confirmMessage)) {
                return;
            }
        }

        post(route("scolarite.years.store"));
    };

    const handleSuggestionClick = (suggestion) => {
        setData("name", suggestion);
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

    const getPreviewStatus = () => {
        if (!data.start_date || !data.end_date) return null;

        const today = new Date();
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);

        if (data.is_active) {
            return {
                status: "Sera active",
                color: "success",
                icon: "fas fa-star",
            };
        } else if (endDate < today) {
            return {
                status: "Sera terminée",
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
                status: "En cours (inactive)",
                color: "warning",
                icon: "fas fa-pause",
            };
        }
    };

    const previewStatus = getPreviewStatus();

    return (
        <AdminLayout title="Créer une année académique">
            <Head title="Créer une année académique" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-plus mr-2 text-success"></i>
                                Créer une année académique
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
                                    <Link href={route("scolarite.years.index")}>
                                        Années académiques
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
                    {/* Alertes */}
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

                                            {/* Suggestions de noms */}
                                            {suggestions.length > 0 && (
                                                <div className="mt-2">
                                                    <small className="text-muted">
                                                        Suggestions :
                                                    </small>
                                                    <div className="mt-1">
                                                        {suggestions.map(
                                                            (
                                                                suggestion,
                                                                index
                                                            ) => (
                                                                <button
                                                                    key={index}
                                                                    type="button"
                                                                    className="btn btn-outline-secondary btn-sm mr-2 mb-1"
                                                                    onClick={() =>
                                                                        handleSuggestionClick(
                                                                            suggestion
                                                                        )
                                                                    }
                                                                >
                                                                    {suggestion}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Génération rapide des dates */}
                                    <Card
                                        title="Génération rapide"
                                        icon="fas fa-magic"
                                        className="mb-4"
                                    >
                                        <div className="row">
                                            <div className="col-md-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-block"
                                                    onClick={
                                                        generateCurrentYearDates
                                                    }
                                                >
                                                    <i className="fas fa-calendar mr-1"></i>
                                                    Année {currentYear}-
                                                    {nextYear}
                                                    <small className="d-block">
                                                        Sept {currentYear} -
                                                        Juin {nextYear}
                                                    </small>
                                                </button>
                                            </div>
                                            <div className="col-md-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-info btn-block"
                                                    onClick={
                                                        generateNextYearDates
                                                    }
                                                >
                                                    <i className="fas fa-calendar-plus mr-1"></i>
                                                    Année {nextYear}-
                                                    {nextYear + 1}
                                                    <small className="d-block">
                                                        Sept {nextYear} - Juin{" "}
                                                        {nextYear + 1}
                                                    </small>
                                                </button>
                                            </div>
                                        </div>
                                    </Card>

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
                                                    <div className="d-flex justify-content-between align-items-center">
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
                                                        {previewStatus && (
                                                            <div>
                                                                <span
                                                                    className={`badge badge-${previewStatus.color}`}
                                                                >
                                                                    <i
                                                                        className={`${previewStatus.icon} mr-1`}
                                                                    ></i>
                                                                    {
                                                                        previewStatus.status
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
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

                            {/* Conseils pour la création */}
                            <Card
                                title="Guide de création"
                                icon="fas fa-question-circle"
                                className="mt-4"
                            >
                                <div className="timeline timeline-sm">
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-primary"></div>
                                        <div className="timeline-content">
                                            <h6>1. Nom de l'année</h6>
                                            <small>
                                                Choisissez un nom unique et
                                                descriptif (ex: 2023-2024)
                                            </small>
                                        </div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-info"></div>
                                        <div className="timeline-content">
                                            <h6>2. Dates académiques</h6>
                                            <small>
                                                Définissez la période officielle
                                                (généralement septembre à juin)
                                            </small>
                                        </div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-success"></div>
                                        <div className="timeline-content">
                                            <h6>3. Statut d'activation</h6>
                                            <small>
                                                Activez si c'est l'année en
                                                cours, sinon laissez inactive
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-light rounded">
                                    <h6>
                                        <i className="fas fa-lightbulb text-warning mr-2"></i>
                                        Bonnes pratiques
                                    </h6>
                                    <ul className="mb-0 small">
                                        <li>
                                            Une année académique commence
                                            généralement en septembre et se
                                            termine en juin
                                        </li>
                                        <li>
                                            Utilisez un format de nom cohérent
                                            (ex: YYYY-YYYY)
                                        </li>
                                        <li>
                                            N'activez que l'année en cours
                                            d'utilisation
                                        </li>
                                        <li>
                                            Vérifiez que les dates n'entrent pas
                                            en conflit avec les années
                                            existantes
                                        </li>
                                    </ul>
                                </div>
                            </Card>

                            {/* Boutons d'action */}
                            <div className="d-flex justify-content-between mt-4">
                                <Link
                                    href={route("scolarite.years.index")}
                                    className="btn btn-secondary"
                                >
                                    <i className="fas fa-arrow-left mr-1"></i>
                                    Retour à la liste
                                </Link>

                                <div className="btn-group">
                                    <button
                                        type="button"
                                        onClick={() => reset()}
                                        className="btn btn-outline-secondary"
                                    >
                                        <i className="fas fa-undo mr-1"></i>
                                        Réinitialiser
                                    </button>
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
                                                Créer l'année académique
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar avec aperçu */}
                        <div className="col-md-4">
                            <Card title="Aperçu" icon="fas fa-eye">
                                <div className="text-center mb-3">
                                    <h4 className="text-primary">
                                        {data.name ||
                                            "Nouvelle année académique"}
                                    </h4>
                                    {previewStatus && (
                                        <span
                                            className={`badge badge-${previewStatus.color} badge-lg`}
                                        >
                                            <i
                                                className={`${previewStatus.icon} mr-1`}
                                            ></i>
                                            {previewStatus.status}
                                        </span>
                                    )}
                                </div>

                                {data.start_date && data.end_date && (
                                    <>
                                        <div className="row text-center mb-3">
                                            <div className="col-6">
                                                <div className="description-block">
                                                    <h6 className="description-header text-info">
                                                        {formatDate(
                                                            data.start_date
                                                        )}
                                                    </h6>
                                                    <span className="description-text">
                                                        DÉBUT
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="description-block">
                                                    <h6 className="description-header text-warning">
                                                        {formatDate(
                                                            data.end_date
                                                        )}
                                                    </h6>
                                                    <span className="description-text">
                                                        FIN
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center mb-3">
                                            <div className="description-block">
                                                <h5 className="description-header text-success">
                                                    {getDuration()}
                                                </h5>
                                                <span className="description-text">
                                                    DURÉE TOTALE
                                                </span>
                                            </div>
                                        </div>

                                        <hr />
                                    </>
                                )}

                                <div>
                                    <p>
                                        <strong>Nom :</strong>{" "}
                                        {data.name || "Non défini"}
                                    </p>
                                    <p>
                                        <strong>Statut :</strong>
                                        <span
                                            className={`badge ml-2 ${
                                                data.is_active
                                                    ? "badge-success"
                                                    : "badge-secondary"
                                            }`}
                                        >
                                            {data.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Type :</strong> Nouvelle année
                                        académique
                                    </p>
                                </div>
                            </Card>

                            <Card
                                title="Années existantes"
                                icon="fas fa-list"
                                className="mt-3"
                            >
                                <div className="small">
                                    <p>
                                        <strong>
                                            Dernières années créées :
                                        </strong>
                                    </p>
                                    <ul>
                                        <li>
                                            {currentYear - 1}-{currentYear}{" "}
                                            <span className="text-muted">
                                                (Précédente)
                                            </span>
                                        </li>
                                        <li>
                                            {currentYear}-{nextYear}{" "}
                                            <span className="text-success">
                                                (Suggérée)
                                            </span>
                                        </li>
                                        <li>
                                            {nextYear}-{nextYear + 1}{" "}
                                            <span className="text-info">
                                                (Future)
                                            </span>
                                        </li>
                                    </ul>
                                    <p className="text-muted mb-0">
                                        Assurez-vous que votre nouvelle année ne
                                        fait pas doublon.
                                    </p>
                                </div>
                            </Card>

                            <Card
                                title="Étapes suivantes"
                                icon="fas fa-tasks"
                                className="mt-3"
                            >
                                <div className="small">
                                    <p>
                                        Après création de l'année académique :
                                    </p>
                                    <ol>
                                        <li>
                                            Créer les classes pour cette année
                                        </li>
                                        <li>Définir les cours et programmes</li>
                                        <li>Établir les emplois du temps</li>
                                        <li>
                                            Procéder aux inscriptions
                                            d'étudiants
                                        </li>
                                    </ol>
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
                    font-size: 1rem;
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
            `}</style>
        </AdminLayout>
    );
}
