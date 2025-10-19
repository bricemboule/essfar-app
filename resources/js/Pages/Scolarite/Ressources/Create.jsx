import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ subjects, classes, academicYears }) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        type: "",
        subject_id: "",
        school_class_id: "",
        academic_year_id: academicYears.find((y) => y.is_active)?.id || "",
        file: null,
        exam_date: "",
        semester: "",
        duration: "",
        coefficient: "",
        is_public: true,
        available_from: "",
        available_until: "",
        tags: "",
        notes: "",
    });

    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState(0);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier la taille (10 Mo max)
            if (file.size > 10 * 1024 * 1024) {
                alert("Le fichier ne doit pas dépasser 10 Mo");
                return;
            }
            setData("file", file);
            setFileName(file.name);
            setFileSize(file.size);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("scolarite.resources.store"), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout title="Ajouter une ressource">
            <Head title="Nouvelle ressource" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-plus-circle mr-2 text-success"></i>
                                Ajouter une ressource pédagogique
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
                                            "scolarite.resources.index"
                                        )}
                                    >
                                        Ressources
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Ajouter
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            {/* Informations générales */}
                            <div className="card">
                                <div className="card-header bg-primary">
                                    <h3 className="card-title">
                                        Informations générales
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Titre{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${
                                                        errors.title
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={data.title}
                                                    onChange={(e) =>
                                                        setData(
                                                            "title",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Ex: Examen Final Mathématiques 2023"
                                                />
                                                {errors.title && (
                                                    <span className="invalid-feedback">
                                                        {errors.title}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Type{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    className={`form-control ${
                                                        errors.type
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={data.type}
                                                    onChange={(e) =>
                                                        setData(
                                                            "type",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Sélectionner...
                                                    </option>

                                                    <option value="ancien_ds">
                                                        Ancien DS
                                                    </option>
                                                    <option value="session_normale">
                                                        Session Normale
                                                    </option>
                                                    <option value="session_rattrapage">
                                                        Session Rattrapage
                                                    </option>
                                                    <option value="cours">
                                                        Support de cours
                                                    </option>
                                                    <option value="td">
                                                        TD
                                                    </option>
                                                    <option value="tp">
                                                        TP
                                                    </option>
                                                    <option value="correction">
                                                        Correction
                                                    </option>
                                                    <option value="autre">
                                                        Autre
                                                    </option>
                                                </select>
                                                {errors.type && (
                                                    <span className="invalid-feedback">
                                                        {errors.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    value={data.description}
                                                    onChange={(e) =>
                                                        setData(
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Description détaillée de la ressource..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attribution */}
                            <div className="card">
                                <div className="card-header bg-success">
                                    <h3 className="card-title">Attribution</h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-4">
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
                                                    value={data.school_class_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "school_class_id",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Sélectionner...
                                                    </option>
                                                    {classes.map((cls) => (
                                                        <option
                                                            key={cls.id}
                                                            value={cls.id}
                                                        >
                                                            {cls.name} -{" "}
                                                            {cls.level}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.school_class_id && (
                                                    <span className="invalid-feedback">
                                                        {errors.school_class_id}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>
                                                    Matière{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    className={`form-control ${
                                                        errors.subject_id
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={data.subject_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "subject_id",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Sélectionner...
                                                    </option>
                                                    {subjects.map((subject) => (
                                                        <option
                                                            key={subject.id}
                                                            value={subject.id}
                                                        >
                                                            {subject.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.subject_id && (
                                                    <span className="invalid-feedback">
                                                        {errors.subject_id}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
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
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Sélectionner...
                                                    </option>
                                                    {academicYears.map(
                                                        (year) => (
                                                            <option
                                                                key={year.id}
                                                                value={year.id}
                                                            >
                                                                {year.name}{" "}
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
                                    </div>
                                </div>
                            </div>

                            {/* Fichier */}
                            <div className="card">
                                <div className="card-header bg-warning">
                                    <h3 className="card-title">Fichier</h3>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label>
                                            Fichier à télécharger{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
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
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif,.txt"
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
                                            Formats acceptés : PDF, DOC, DOCX,
                                            XLS, XLSX, PPT, PPTX, ZIP, RAR, JPG,
                                            PNG, GIF, TXT
                                            <br />
                                            Taille maximale : 10 Mo
                                            {fileSize > 0 && (
                                                <span className="text-info ml-2">
                                                    | Taille actuelle :{" "}
                                                    {formatFileSize(fileSize)}
                                                </span>
                                            )}
                                        </small>
                                    </div>

                                    {fileName && (
                                        <div className="alert alert-success">
                                            <i className="fas fa-check-circle mr-2"></i>
                                            Fichier sélectionné :{" "}
                                            <strong>{fileName}</strong> (
                                            {formatFileSize(fileSize)})
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Métadonnées */}
                            <div className="card">
                                <div className="card-header bg-info">
                                    <h3 className="card-title">
                                        Métadonnées (optionnel)
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>Date de l'examen</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={data.exam_date}
                                                    onChange={(e) =>
                                                        setData(
                                                            "exam_date",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <small className="text-muted">
                                                    Pour les examens
                                                </small>
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>Semestre</label>
                                                <select
                                                    className="form-control"
                                                    value={data.semester}
                                                    onChange={(e) =>
                                                        setData(
                                                            "semester",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Sélectionner...
                                                    </option>
                                                    <option value="S1">
                                                        S1
                                                    </option>
                                                    <option value="S2">
                                                        S2
                                                    </option>
                                                    <option value="S3">
                                                        S3
                                                    </option>
                                                    <option value="S4">
                                                        S4
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>Durée (minutes)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={data.duration}
                                                    onChange={(e) =>
                                                        setData(
                                                            "duration",
                                                            e.target.value
                                                        )
                                                    }
                                                    min="1"
                                                    placeholder="Ex: 120"
                                                />
                                                <small className="text-muted">
                                                    Pour les examens
                                                </small>
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>Coefficient</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={data.coefficient}
                                                    onChange={(e) =>
                                                        setData(
                                                            "coefficient",
                                                            e.target.value
                                                        )
                                                    }
                                                    min="1"
                                                    placeholder="Ex: 2"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label>
                                                    Tags (séparés par des
                                                    virgules)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={data.tags}
                                                    onChange={(e) =>
                                                        setData(
                                                            "tags",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Ex: algèbre, équations, niveau2"
                                                />
                                                <small className="text-muted">
                                                    Pour faciliter la recherche
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Disponibilité */}
                            <div className="card">
                                <div className="card-header bg-secondary">
                                    <h3 className="card-title">
                                        Disponibilité et visibilité
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Disponible à partir du
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={data.available_from}
                                                    onChange={(e) =>
                                                        setData(
                                                            "available_from",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <small className="text-muted">
                                                    Laisser vide pour
                                                    disponibilité immédiate
                                                </small>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Disponible jusqu'au
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={data.available_until}
                                                    onChange={(e) =>
                                                        setData(
                                                            "available_until",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <small className="text-muted">
                                                    Laisser vide pour
                                                    disponibilité illimitée
                                                </small>
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id="is_public"
                                                        checked={data.is_public}
                                                        onChange={(e) =>
                                                            setData(
                                                                "is_public",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        className="custom-control-label"
                                                        htmlFor="is_public"
                                                    >
                                                        <strong>
                                                            Ressource publique
                                                        </strong>
                                                    </label>
                                                </div>
                                                <small className="text-muted">
                                                    Si décoché, seule
                                                    l'administration pourra voir
                                                    cette ressource
                                                </small>
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label>Notes internes</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="2"
                                                    value={data.notes}
                                                    onChange={(e) =>
                                                        setData(
                                                            "notes",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Notes visibles uniquement par l'administration..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <Link
                                            href={route(
                                                "scolarite.resources.index"
                                            )}
                                            className="btn btn-secondary"
                                        >
                                            <i className="fas fa-arrow-left mr-1"></i>
                                            Annuler
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-success btn-lg"
                                            onClick={handleSubmit}
                                            disabled={processing || !data.file}
                                        >
                                            {processing ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                                    Upload en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save mr-1"></i>
                                                    Enregistrer la ressource
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
