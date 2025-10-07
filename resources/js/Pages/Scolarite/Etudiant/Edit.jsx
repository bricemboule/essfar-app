import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FaStudiovinari } from "react-icons/fa";

export default function Edit({ student, academicYears, classes }) {
    console.log(student.date_naissance_formatted);
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT",
        name: student.name || "",
        email: student.email || "",
        telephone: student.telephone || "",
        adresse: student.adresse || "",
        date_naissance: student.date_naissance_formatted || "",
        lieu_naissance: student.lieu_naissance || "",
        sexe: student.sexe || "M",
        photo: student.photo || "",
        school_class_id: student.student_enrollment?.school_class_id || "",
        academic_year_id: student.student_enrollment?.academic_year_id || "",
        parent_name: student.parent_name || "",
        parent_phone: student.parent_phone || "",
        parent_email: student.parent_email || "",
        previous_school: student.previous_school || "",
        scholarship: student.student_enrollment?.scholarship || false,
        contact_urgent: student.contact_urgent || "",
        medical_info: student.medical_info || "",
        notes_admin: student.notes_admin || "",
        statut: student.statut || "actif",
    });

    console.log(data.date_naissance);
    const [previewPhoto, setPreviewPhoto] = useState(student.photo_url || null);

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
        post(route("academic.etudiants.update", student.id));
    };

    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 16);

    return (
        <AdminLayout title="Modifier l'étudiant">
            <Head title={`Modifier ${student.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-user-edit mr-2 text-primary"></i>
                                Modifier l'étudiant
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
                                        href={route("academic.etudiants.index")}
                                    >
                                        Étudiants
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "academic.etudiants.show",
                                            student.id
                                        )}
                                    >
                                        {student.name}
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
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            {/* Colonne gauche */}
                            <div className="col-md-4">
                                <div className="card card-primary">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            Photo de profil
                                        </h3>
                                    </div>
                                    <div className="card-body text-center">
                                        <img
                                            src={
                                                previewPhoto ||
                                                "/images/default-avatar.png"
                                            }
                                            alt="Photo"
                                            className="img-circle mb-3"
                                            style={{
                                                width: "200px",
                                                height: "200px",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <div>
                                            <label className="btn btn-primary">
                                                <i className="fas fa-camera mr-1"></i>
                                                Changer la photo
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePhotoChange}
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

                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            Informations du compte
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <dl>
                                            <dt>Matricule</dt>
                                            <dd className="text-muted">
                                                {student.matricule}
                                            </dd>

                                            <dt>Date de création</dt>
                                            <dd className="text-muted">
                                                {new Date(
                                                    student.created_at
                                                ).toLocaleDateString()}
                                            </dd>

                                            <dt>Dernière modification</dt>
                                            <dd className="text-muted">
                                                {new Date(
                                                    student.updated_at
                                                ).toLocaleDateString()}
                                            </dd>

                                            <dt>Statut</dt>
                                            <dd>
                                                <select
                                                    className={`form-control ${
                                                        errors.statut
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={data.statut}
                                                    onChange={(e) =>
                                                        setData(
                                                            "statut",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="actif">
                                                        Actif
                                                    </option>
                                                    <option value="inactif">
                                                        Inactif
                                                    </option>
                                                    <option value="suspendu">
                                                        Suspendu
                                                    </option>
                                                    <option value="exclu">
                                                        Exclu
                                                    </option>
                                                </select>
                                                {errors.statut && (
                                                    <span className="invalid-feedback">
                                                        {errors.statut}
                                                    </span>
                                                )}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            {/* Colonne droite */}
                            <div className="col-md-8">
                                {/* Informations personnelles */}
                                <div className="card">
                                    <div className="card-header bg-primary">
                                        <h3 className="card-title">
                                            Informations Personnelles
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
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
                                                                e.target.value
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
                                                                e.target.value
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
                                                                e.target.value
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
                                                    <label>Téléphone</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${
                                                            errors.telephone
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={data.telephone}
                                                        onChange={(e) =>
                                                            setData(
                                                                "telephone",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {errors.telephone && (
                                                        <span className="invalid-feedback">
                                                            {errors.telephone}
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
                                                                e.target.value
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
                                                                e.target.value
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
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations académiques */}
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
                                                                    key={
                                                                        year.id
                                                                    }
                                                                    value={
                                                                        year.id
                                                                    }
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
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionner...
                                                        </option>
                                                        {classes.map(
                                                            (schoolClass) => (
                                                                <option
                                                                    key={
                                                                        schoolClass.id
                                                                    }
                                                                    value={
                                                                        schoolClass.id
                                                                    }
                                                                    disabled={
                                                                        schoolClass.current_students >=
                                                                            schoolClass.capacity &&
                                                                        schoolClass.id !==
                                                                            student
                                                                                .student_enrollment
                                                                                ?.school_class_id
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
                                                                        schoolClass.id !==
                                                                            student
                                                                                .student_enrollment
                                                                                ?.school_class_id &&
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
                                                        Établissement précédent
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
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Année du Bac</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={data.bac_year}
                                                        onChange={(e) =>
                                                            setData(
                                                                "bac_year",
                                                                e.target.value
                                                            )
                                                        }
                                                        min="2000"
                                                        max={new Date().getFullYear()}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>
                                                        Mention au Bac
                                                    </label>
                                                    <select
                                                        className="form-control"
                                                        value={data.bac_grade}
                                                        onChange={(e) =>
                                                            setData(
                                                                "bac_grade",
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            -- Sélectionner --
                                                        </option>
                                                        <option value="Passable">
                                                            Passable
                                                        </option>
                                                        <option value="Assez bien">
                                                            Assez bien
                                                        </option>
                                                        <option value="Bien">
                                                            Bien
                                                        </option>
                                                        <option value="Très bien">
                                                            Très bien
                                                        </option>
                                                    </select>
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations famille */}
                                <div className="card">
                                    <div className="card-header bg-info">
                                        <h3 className="card-title">
                                            Informations Famille
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>
                                                        Nom du parent/tuteur
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={data.parent_name}
                                                        onChange={(e) =>
                                                            setData(
                                                                "parent_name",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>
                                                        Téléphone parent
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={
                                                            data.parent_phone
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "parent_phone",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Email parent</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        value={
                                                            data.parent_email
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "parent_email",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>
                                                        Contact d'urgence
                                                    </label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="2"
                                                        value={
                                                            data.emergency_contact
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "emergency_contact",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Nom, lien de parenté, téléphone..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations complémentaires */}
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
                                                        Informations médicales
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
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>
                                                        Notes administratives
                                                    </label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="3"
                                                        value={data.notes_admin}
                                                        onChange={(e) =>
                                                            setData(
                                                                "notes_admin",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Boutons d'action */}
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <Link
                                                href={route(
                                                    "academic.etudiants.show",
                                                    student.id
                                                )}
                                                className="btn btn-secondary"
                                            >
                                                <i className="fas fa-arrow-left mr-1"></i>
                                                Retour
                                            </Link>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
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
                                                        Enregistrer les
                                                        modifications
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </AdminLayout>
    );
}
