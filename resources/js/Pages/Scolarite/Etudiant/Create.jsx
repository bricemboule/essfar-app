import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ academicYears, classes }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        telephone: "",
        adresse: "",
        date_naissance: "",
        lieu_naissance: "",
        sexe: "M",
        photo: null,
        school_class_id: "",
        academic_year_id: academicYears.find((ay) => ay.is_active)?.id || "",
        parent_name: "",
        parent_phone: "",
        parent_email: "",
        previous_school: "",
        scholarship: false,
        contact_urgent: "",
        medical_info: "",
        notes_admin: "",
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [previewPhoto, setPreviewPhoto] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("photo", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Bonjour");
        post(route("scolarite.etudiants.store"));
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <AdminLayout title="Inscrire un étudiant">
            <Head title="Nouvel étudiant" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-user-plus mr-2 text-success"></i>
                                Inscrire un étudiant
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
                                            "scolarite.etudiants.index"
                                        )}
                                    >
                                        Étudiants
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Inscrire
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12">
                                {/* Progress Steps */}
                                <div className="card">
                                    <div className="card-body">
                                        <div className="steps-progress">
                                            <div
                                                className={`step ${
                                                    currentStep >= 1
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <span className="step-number">
                                                    1
                                                </span>
                                                <span className="step-title">
                                                    Informations personnelles
                                                </span>
                                            </div>
                                            <div
                                                className={`step ${
                                                    currentStep >= 2
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <span className="step-number">
                                                    2
                                                </span>
                                                <span className="step-title">
                                                    Informations académiques
                                                </span>
                                            </div>
                                            <div
                                                className={`step ${
                                                    currentStep >= 3
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <span className="step-number">
                                                    3
                                                </span>
                                                <span className="step-title">
                                                    Informations famille
                                                </span>
                                            </div>
                                            <div
                                                className={`step ${
                                                    currentStep >= 4
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <span className="step-number">
                                                    4
                                                </span>
                                                <span className="step-title">
                                                    Informations complémentaires
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 1: Informations personnelles */}
                                {currentStep === 1 && (
                                    <div className="card">
                                        <div className="card-header bg-primary">
                                            <h3 className="card-title">
                                                Informations Personnelles
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-12 text-center mb-4">
                                                    <div className="photo-upload">
                                                        <img
                                                            src={
                                                                previewPhoto ||
                                                                "/images/default-avatar.png"
                                                            }
                                                            alt="Photo"
                                                            className="img-circle"
                                                            style={{
                                                                width: "150px",
                                                                height: "150px",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                        <div className="mt-2">
                                                            <label className="btn btn-primary btn-sm">
                                                                <i className="fas fa-camera mr-1"></i>
                                                                Choisir une
                                                                photo
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={
                                                                        handlePhotoChange
                                                                    }
                                                                    className="d-none"
                                                                />
                                                            </label>
                                                        </div>
                                                        {errors.photo && (
                                                            <span className="text-danger d-block mt-2">
                                                                {errors.photo}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Nom et Prenom{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${
                                                                errors.name
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={data.name}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Nom et prenom"
                                                        />
                                                        {errors.name && (
                                                            <span className="invalid-feedback">
                                                                {errors.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Sexe{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            className={`form-control ${
                                                                errors.sexe
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={data.sexe}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "sexe",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Sélectionner...
                                                            </option>
                                                            <option value="M">
                                                                Masculin
                                                            </option>
                                                            <option value="F">
                                                                Féminin
                                                            </option>
                                                        </select>
                                                        {errors.genre && (
                                                            <span className="invalid-feedback">
                                                                {errors.sexe}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Date de naissance{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className={`form-control ${
                                                                errors.date_naissance
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={
                                                                data.date_naissance
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "date_naissance",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        {errors.date_naissance && (
                                                            <span className="invalid-feedback">
                                                                {
                                                                    errors.date_naissance
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Lieu de naissance{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={
                                                                data.lieu_naissance
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "lieu_naissance",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Ville, Pays"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Téléphone</label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${
                                                                errors.telephone
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={
                                                                data.telephone
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "telephone",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="+237 6XX XXX XXX"
                                                        />
                                                        {errors.telephone && (
                                                            <span className="invalid-feedback">
                                                                {
                                                                    errors.telephone
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Email{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className={`form-control ${
                                                                errors.email
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={data.email}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "email",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="email@exemple.com"
                                                        />
                                                        {errors.email && (
                                                            <span className="invalid-feedback">
                                                                {errors.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label>
                                                            Adresse complète
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="2"
                                                            value={data.adresse}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "adresse",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Quartier, rue, ville..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Informations académiques */}
                                {currentStep === 2 && (
                                    <div className="card">
                                        <div className="card-header bg-success">
                                            <h3 className="card-title">
                                                Informations Académiques
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Année académique{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            className={`form-control ${
                                                                errors.academic_year_id
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={
                                                                data.academic_year_id
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "academic_year_id",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Sélectionner...
                                                            </option>
                                                            {academicYears.map(
                                                                (year) => (
                                                                    <option
                                                                        key={
                                                                            year.id
                                                                        }
                                                                        value={
                                                                            year.id
                                                                        }
                                                                    >
                                                                        {
                                                                            year.name
                                                                        }{" "}
                                                                        {year.is_active &&
                                                                            "(Actuelle)"}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                        {errors.academic_year_id && (
                                                            <span className="invalid-feedback">
                                                                {
                                                                    errors.academic_year_id
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Classe{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            className={`form-control ${
                                                                errors.school_class_id
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={
                                                                data.school_class_id
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "school_class_id",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Sélectionner...
                                                            </option>
                                                            {classes.map(
                                                                (
                                                                    schoolClass
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            schoolClass.id
                                                                        }
                                                                        value={
                                                                            schoolClass.id
                                                                        }
                                                                        disabled={
                                                                            schoolClass.current_students >=
                                                                            schoolClass.capacity
                                                                        }
                                                                    >
                                                                        {
                                                                            schoolClass.name
                                                                        }{" "}
                                                                        -{" "}
                                                                        {
                                                                            schoolClass.level
                                                                        }
                                                                        (
                                                                        {
                                                                            schoolClass.current_students
                                                                        }
                                                                        /
                                                                        {
                                                                            schoolClass.capacity
                                                                        }
                                                                        )
                                                                        {schoolClass.current_students >=
                                                                            schoolClass.capacity &&
                                                                            " - COMPLET"}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                        {errors.school_class_id && (
                                                            <span className="invalid-feedback">
                                                                {
                                                                    errors.school_class_id
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Établissement
                                                            précédent
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={
                                                                data.previous_school
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "previous_school",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Nom de l'établissement"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id="scholarship"
                                                                checked={
                                                                    data.scholarship
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "scholarship",
                                                                        e.target
                                                                            .checked
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor="scholarship"
                                                            >
                                                                <strong>
                                                                    Étudiant
                                                                    boursier
                                                                </strong>
                                                            </label>
                                                        </div>
                                                        <small className="text-muted">
                                                            Cochez si l'étudiant
                                                            bénéficie d'une
                                                            bourse d'études
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Informations famille */}
                                {currentStep === 3 && (
                                    <div className="card">
                                        <div className="card-header bg-info">
                                            <h3 className="card-title">
                                                Informations Famille
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <h5 className="text-primary">
                                                        Parent / Tuteur légal
                                                    </h5>
                                                    <hr />
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>
                                                            Nom complet
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={
                                                                data.parent_name
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "parent_name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Nom et prénom du parent"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Téléphone</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={
                                                                data.parent_phone
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "parent_phone",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="+237 6XX XXX XXX"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Email</label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            value={
                                                                data.parent_email
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "parent_email",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="parent@email.com"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-12 mt-3">
                                                    <h5 className="text-danger">
                                                        Contact d'urgence
                                                    </h5>
                                                    <hr />
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label>
                                                            Personne à contacter
                                                            en cas d'urgence
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="2"
                                                            value={
                                                                data.contact_urgent
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "contact_urgent",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Nom, lien de parenté, téléphone..."
                                                        />
                                                        <small className="text-muted">
                                                            Indiquez le nom, le
                                                            lien de parenté et
                                                            les coordonnées
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Informations complémentaires */}
                                {currentStep === 4 && (
                                    <div className="card">
                                        <div className="card-header bg-warning">
                                            <h3 className="card-title">
                                                Informations Complémentaires
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label>
                                                            Informations
                                                            médicales
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="3"
                                                            value={
                                                                data.medical_info
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "medical_info",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Allergies, traitements médicaux, conditions particulières..."
                                                        />
                                                        <small className="text-muted">
                                                            Ces informations
                                                            resteront
                                                            confidentielles
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label>
                                                            Notes
                                                            administratives
                                                            (usage interne)
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="3"
                                                            value={
                                                                data.notes_admin
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "notes_admin",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Notes pour l'administration..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="alert alert-info">
                                                        <h5>
                                                            <i className="icon fas fa-info-circle"></i>{" "}
                                                            Récapitulatif
                                                        </h5>
                                                        <ul className="mb-0">
                                                            <li>
                                                                <strong>
                                                                    Étudiant :
                                                                </strong>{" "}
                                                                {data.name}{" "}
                                                                {data.prenom}
                                                            </li>
                                                            <li>
                                                                <strong>
                                                                    Email :
                                                                </strong>{" "}
                                                                {data.email}
                                                            </li>
                                                            <li>
                                                                <strong>
                                                                    Classe :
                                                                </strong>{" "}
                                                                {classes.find(
                                                                    (c) =>
                                                                        c.id ==
                                                                        data.school_class_id
                                                                )?.name ||
                                                                    "Non sélectionnée"}
                                                            </li>
                                                            <li>
                                                                <strong>
                                                                    Année
                                                                    académique :
                                                                </strong>{" "}
                                                                {academicYears.find(
                                                                    (y) =>
                                                                        y.id ==
                                                                        data.academic_year_id
                                                                )?.name ||
                                                                    "Non sélectionnée"}
                                                            </li>
                                                            {data.scholarship && (
                                                                <li className="text-success">
                                                                    <strong>
                                                                        Statut :
                                                                    </strong>{" "}
                                                                    Boursier
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                {currentStep > 1 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={prevStep}
                                                    >
                                                        <i className="fas fa-arrow-left mr-1"></i>
                                                        Précédent
                                                    </button>
                                                )}
                                            </div>
                                            <div>
                                                <Link
                                                    href={route(
                                                        "scolarite.etudiants.index"
                                                    )}
                                                    className="btn btn-outline-secondary mr-2"
                                                >
                                                    Annuler
                                                </Link>
                                                {currentStep < 4 ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={nextStep}
                                                    >
                                                        Suivant
                                                        <i className="fas fa-arrow-right ml-1"></i>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        className="btn btn-success"
                                                        disabled={processing}
                                                    >
                                                        {processing ? (
                                                            <>
                                                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                                                Inscription en
                                                                cours...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-check mr-1"></i>
                                                                Confirmer
                                                                l'inscription
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            <style>{`
                .steps-progress {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    margin: 20px 0;
                }

                .step {
                    flex: 1;
                    text-align: center;
                    position: relative;
                    z-index: 1;
                }

                .step-number {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    line-height: 40px;
                    border-radius: 50%;
                    background: #e9ecef;
                    color: #6c757d;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .step.active .step-number {
                    background: #28a745;
                    color: white;
                }

                .step-title {
                    display: block;
                    font-size: 12px;
                    color: #6c757d;
                }

                .photo-upload {
                    text-align: center;
                }

                .img-circle {
                    border: 3px solid #e9ecef;
                }
            `}</style>
        </AdminLayout>
    );
}
