import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Justify({ attendance }) {
    const { data, setData, post, processing, errors } = useForm({
        justification: "",
        file: null,
    });

    const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier la taille (2 Mo max)
            if (file.size > 2 * 1024 * 1024) {
                alert("Le fichier ne doit pas dépasser 2 Mo");
                return;
            }
            setData("file", file);
            setFileName(file.name);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(
            route("etudiant.attendances.submit-justification", attendance.id),
            {
                forceFormData: true,
            }
        );
    };

    return (
        <AdminLayout title="Justifier une absence">
            <Head title="Justifier" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-file-alt mr-2 text-warning"></i>
                                Justifier une absence/retard
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("etudiant.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "etudiant.attendances.index"
                                        )}
                                    >
                                        Absences et retards
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Justifier
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
                            {/* Informations de l'absence */}
                            <div className="card">
                                <div className="card-header bg-info">
                                    <h3 className="card-title">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        Absence à justifier
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <p>
                                                <strong>Date :</strong>
                                                <br />
                                                {new Date(
                                                    attendance.date
                                                ).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                        <div className="col-md-4">
                                            <p>
                                                <strong>Matière :</strong>
                                                <br />
                                                {attendance.course.name}
                                            </p>
                                        </div>
                                        <div className="col-md-4">
                                            <p>
                                                <strong>Type :</strong>
                                                <br />
                                                <span
                                                    className={`badge ${
                                                        attendance.type ===
                                                        "absence"
                                                            ? "badge-danger"
                                                            : "badge-warning"
                                                    }`}
                                                >
                                                    {attendance.type ===
                                                    "absence"
                                                        ? "Absence"
                                                        : "Retard"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Formulaire de justification */}
                            <div className="card">
                                <div className="card-header bg-warning">
                                    <h3 className="card-title">
                                        <i className="fas fa-edit mr-2"></i>
                                        Votre justification
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label>
                                            Motif de l'absence/retard{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            className={`form-control ${
                                                errors.justification
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            rows="6"
                                            value={data.justification}
                                            onChange={(e) =>
                                                setData(
                                                    "justification",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Expliquez les raisons de votre absence ou retard de manière détaillée (minimum 20 caractères)..."
                                        />
                                        {errors.justification && (
                                            <span className="invalid-feedback">
                                                {errors.justification}
                                            </span>
                                        )}
                                        <small className="form-text text-muted">
                                            Soyez précis et honnête. Une
                                            justification claire augmente vos
                                            chances d'approbation.
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Document justificatif (optionnel
                                            mais recommandé)
                                        </label>
                                        <div className="custom-file">
                                            <input
                                                type="file"
                                                className={`custom-file-input ${
                                                    errors.file
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                id="fileInput"
                                                onChange={handleFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                            <label
                                                className="custom-file-label"
                                                htmlFor="fileInput"
                                            >
                                                {fileName ||
                                                    "Choisir un fichier..."}
                                            </label>
                                            {errors.file && (
                                                <span className="invalid-feedback d-block">
                                                    {errors.file}
                                                </span>
                                            )}
                                        </div>
                                        <small className="form-text text-muted">
                                            Formats acceptés : PDF, JPG, PNG |
                                            Taille max : 2 Mo
                                            <br />
                                            Exemples : certificat médical,
                                            convocation, justificatif officiel
                                        </small>
                                    </div>

                                    {fileName && (
                                        <div className="alert alert-success">
                                            <i className="fas fa-check-circle mr-2"></i>
                                            Fichier sélectionné :{" "}
                                            <strong>{fileName}</strong>
                                        </div>
                                    )}

                                    <div className="alert alert-warning">
                                        <h5>
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            Important
                                        </h5>
                                        <ul className="mb-0">
                                            <li>
                                                Votre justification sera
                                                examinée par l'administration
                                            </li>
                                            <li>
                                                Un document justificatif valide
                                                augmente considérablement vos
                                                chances d'approbation
                                            </li>
                                            <li>
                                                Les fausses justifications sont
                                                sanctionnées
                                            </li>
                                            <li>
                                                Vous recevrez une notification
                                                une fois la décision prise
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <Link
                                            href={route(
                                                "etudiant.attendances.show",
                                                attendance.id
                                            )}
                                            className="btn btn-secondary"
                                        >
                                            <i className="fas fa-arrow-left mr-1"></i>
                                            Annuler
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-warning btn-lg"
                                            onClick={handleSubmit}
                                            disabled={
                                                processing ||
                                                data.justification.length < 20
                                            }
                                        >
                                            {processing ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-paper-plane mr-1"></i>
                                                    Soumettre la justification
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Conseils */}
                        <div className="col-md-4">
                            <div className="card bg-gradient-info">
                                <div className="card-body">
                                    <h5 className="text-white">
                                        <i className="fas fa-lightbulb mr-2"></i>
                                        Conseils pour une bonne justification
                                    </h5>
                                    <ul className="text-white mb-0">
                                        <li>Soyez précis et détaillé</li>
                                        <li>
                                            Indiquez la date et l'heure si
                                            pertinent
                                        </li>
                                        <li>Joignez un document officiel</li>
                                        <li>
                                            Évitez les justifications vagues
                                        </li>
                                        <li>
                                            Soumettez rapidement après l'absence
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header bg-success">
                                    <h3 className="card-title">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        Documents acceptés
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <ul className="mb-0">
                                        <li>Certificat médical</li>
                                        <li>Convocation officielle</li>
                                        <li>Justificatif de transport</li>
                                        <li>Document administratif</li>
                                        <li>Attestation parentale</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-gradient-warning">
                                <div className="card-body">
                                    <h5>
                                        <i className="fas fa-clock mr-2"></i>
                                        Délai de traitement
                                    </h5>
                                    <p className="mb-0">
                                        Les justifications sont généralement
                                        traitées sous 48 heures ouvrables.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
