import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ courses, academicYears }) {
    const { data, setData, post, processing, errors } = useForm({
        // Informations personnelles
        name: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        date_naissance: "",
        lieu_naissance: "",
        sexe: "M",
        photo: null,

        // Informations professionnelles
        specialite: "",
        grade: "",
        date_embauche: "",
        status: "actif",
        notes_admin: "",

        // Cours assignés
        courses: [],

        // Informations de contrat
        type_contrat: "horaire",
        taux_horaire: "",
        salaire_mensuel: "",
        contract_start_date: "",
        contract_end_date: "",
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

    const handleCourseToggle = (courseId) => {
        setData(
            "courses",
            data.courses.includes(courseId)
                ? data.courses.filter((id) => id !== courseId)
                : [...data.courses, courseId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("academic.enseignants.store"));
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <AdminLayout title="Créer un Enseignant">
            <Head title="Nouvel Enseignant" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-user-plus mr-2 text-success"></i>
                                Créer un Enseignant
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("admin.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "academic.enseignants.index"
                                        )}
                                    >
                                        Enseignants
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
                                                    Informations
                                                    professionnelles
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
                                                    Cours assignés
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
                                                    Contrat
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
                                                            <span className="text-danger">
                                                                {errors.photo}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Nom et Prénom{" "}
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
                                                            <option value="M">
                                                                Masculin
                                                            </option>
                                                            <option value="F">
                                                                Féminin
                                                            </option>
                                                        </select>
                                                        {errors.sexe && (
                                                            <span className="invalid-feedback">
                                                                {errors.sexe}
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
                                                        />
                                                        {errors.email && (
                                                            <span className="invalid-feedback">
                                                                {errors.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Téléphone{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
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
                                                            Lieu de naissance
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
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label>Adresse</label>
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
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Informations professionnelles */}
                                {currentStep === 2 && (
                                    <div className="card">
                                        <div className="card-header bg-success">
                                            <h3 className="card-title">
                                                Informations Professionnelles
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Grade{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            className={`form-control ${
                                                                errors.grade
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={data.grade}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "grade",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Sélectionner...
                                                            </option>
                                                            <option value="Licence">
                                                                Vacataire
                                                            </option>
                                                            <option value="Master">
                                                                Master
                                                            </option>
                                                            <option value="Pro">
                                                                Professionnel
                                                            </option>
                                                            <option value="Phd">
                                                                Doctorat
                                                            </option>
                                                            <option value="MC">
                                                                Maitre de
                                                                Conférence
                                                            </option>
                                                            <option value="Pr">
                                                                Professeur
                                                            </option>
                                                        </select>
                                                        {errors.qualification && (
                                                            <span className="invalid-feedback">
                                                                {
                                                                    errors.qualification
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Spécialé{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${
                                                                errors.specialite
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={
                                                                data.specialite
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "specialite",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Ex: Mathématiques, Informatique..."
                                                        />
                                                        {errors.specialite && (
                                                            <span className="invalid-feedback">
                                                                {
                                                                    errors.specialite
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Date d'embauche{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className={`form-control ${
                                                                errors.date_embauche
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={
                                                                data.date_embauche
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "date_embauche",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        {errors.date_embauche && (
                                                            <span className="invalid-feedback">
                                                                {
                                                                    errors.date_embauche
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Statut{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            className={`form-control ${
                                                                errors.status
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={data.status}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "status",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="actif">
                                                                Actif
                                                            </option>
                                                            <option value="inactif">
                                                                Inactif
                                                            </option>
                                                            <option value="conge">
                                                                En congé
                                                            </option>
                                                        </select>
                                                        {errors.status && (
                                                            <span className="invalid-feedback">
                                                                {errors.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label>
                                                            Notes
                                                            administratives
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
                                                            placeholder="Notes internes pour l'administration..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Cours assignés */}
                                {currentStep === 3 && (
                                    <div className="card">
                                        <div className="card-header bg-info">
                                            <h3 className="card-title">
                                                Cours Assignés
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            {errors.courses && (
                                                <div className="alert alert-danger">
                                                    {errors.courses}
                                                </div>
                                            )}
                                            <div className="row">
                                                {courses.map((course) => (
                                                    <div
                                                        key={course.id}
                                                        className="col-md-6"
                                                    >
                                                        <div
                                                            className={`course-card ${
                                                                data.courses.includes(
                                                                    course.id
                                                                )
                                                                    ? "selected"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <div className="custom-control custom-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    className="custom-control-input"
                                                                    id={`course-${course.id}`}
                                                                    checked={data.courses.includes(
                                                                        course.id
                                                                    )}
                                                                    onChange={() =>
                                                                        handleCourseToggle(
                                                                            course.id
                                                                        )
                                                                    }
                                                                />
                                                                <label
                                                                    className="custom-control-label"
                                                                    htmlFor={`course-${course.id}`}
                                                                >
                                                                    <div>
                                                                        <strong>
                                                                            {
                                                                                course.name
                                                                            }
                                                                        </strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {
                                                                                course.code
                                                                            }{" "}
                                                                            •{" "}
                                                                            {
                                                                                course.credits
                                                                            }{" "}
                                                                            crédits
                                                                            •{" "}
                                                                            {
                                                                                course.total_hours
                                                                            }
                                                                            h
                                                                        </small>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3">
                                                <span className="badge badge-primary">
                                                    {data.courses.length} cours
                                                    sélectionné(s)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Contrat */}
                                {currentStep === 4 && (
                                    <div className="card">
                                        <div className="card-header bg-warning">
                                            <h3 className="card-title">
                                                Informations de Contrat
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Type de contrat{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            className={`form-control ${
                                                                errors.type_contrat
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={
                                                                data.type_contrat
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "type_contrat",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="horaire">
                                                                Horaire
                                                            </option>
                                                            <option value="projet">
                                                                Projet
                                                            </option>
                                                        </select>
                                                        {errors.type_contrat && (
                                                            <span className="invalid-feedback">
                                                                {
                                                                    errors.type_contrat
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {data.type_contrat ===
                                                "horaire" ? (
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>
                                                                Taux horaire
                                                                (XAF){" "}
                                                                <span className="text-danger">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className={`form-control ${
                                                                    errors.taux_horaire
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }`}
                                                                value={
                                                                    data.taux_horaire
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "taux_horaire",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                min="0"
                                                                step="100"
                                                            />
                                                            {errors.taux_horaire && (
                                                                <span className="invalid-feedback">
                                                                    {
                                                                        errors.taux_horaire
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>
                                                                Salaire mensuel
                                                                (XAF){" "}
                                                                <span className="text-danger">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className={`form-control ${
                                                                    errors.salaire_mensuel
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }`}
                                                                value={
                                                                    data.salaire_mensuel
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "salaire_mensuel",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                min="0"
                                                                step="1000"
                                                            />
                                                            {errors.salaire_mensuel && (
                                                                <span className="invalid-feedback">
                                                                    {
                                                                        errors.salaire_mensuel
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Date de début du
                                                            contrat{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className={`form-control ${
                                                                errors.contract_start_date
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={
                                                                data.contract_start_date
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "contract_start_date",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        {errors.contract_start_date && (
                                                            <span className="invalid-feedback">
                                                                {
                                                                    errors.contract_start_date
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Date de fin du
                                                            contrat
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={
                                                                data.contract_end_date
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "contract_end_date",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        <small className="text-muted">
                                                            Laisser vide pour un
                                                            contrat à durée
                                                            indéterminée
                                                        </small>
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
                                                        "academic.enseignants.index"
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
                                                                Enregistrement...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-save mr-1"></i>
                                                                Créer
                                                                l'enseignant
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
                    background: #007bff;
                    color: white;
                }

                .step-title {
                    display: block;
                    font-size: 12px;
                    color: #6c757d;
                }

                .course-card {
                    padding: 15px;
                    border: 2px solid #e9ecef;
                    border-radius: 5px;
                    margin-bottom: 15px;
                    transition: all 0.3s;
                    cursor: pointer;
                }

                .course-card:hover {
                    border-color: #007bff;
                    box-shadow: 0 2px 5px rgba(0,123,255,0.2);
                }

                .course-card.selected {
                    border-color: #007bff;
                    background-color: rgba(0,123,255,0.05);
                }

                .photo-upload {
                    text-align: center;
                }
            `}</style>
        </AdminLayout>
    );
}
