import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ teacher, courses }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT",
        name: teacher.name || "",
        prenom: teacher.prenom || "",
        email: teacher.email || "",
        telephone: teacher.telephone || "",
        adresse: teacher.adresse || "",
        date_naissance: teacher.date_naissance || "",
        lieu_naissance: teacher.lieu_naissance || "",
        sexe: teacher.sexe || "M",
        photo: null,
        specialization: teacher.specialization || "",
        qualification: teacher.qualification || "",
        experience_years: teacher.experience_years || 0,
        hire_date: teacher.hire_date || "",
        statut: teacher.statut || "actif",
        notes_admin: teacher.notes_admin || "",
        courses: teacher.teacherCourses?.map((c) => c.id) || [],
    });

    const [previewPhoto, setPreviewPhoto] = useState(
        teacher.photo ? `/storage/${teacher.photo}` : null
    );

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
        post(route("scolarite.enseignants.update", teacher.id));
    };

    return (
        <AdminLayout title="Modifier l'Enseignant">
            <Head title={`Modifier ${teacher.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-user-edit mr-2 text-primary"></i>
                                Modifier l'Enseignant
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
                                            "scolarite.enseignants.index"
                                        )}
                                    >
                                        Enseignants
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "scolarite.enseignants.show",
                                            teacher.id
                                        )}
                                    >
                                        {teacher.name}
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
                                                {teacher.matricule}
                                            </dd>

                                            <dt>Date de création</dt>
                                            <dd className="text-muted">
                                                {new Date(
                                                    teacher.created_at
                                                ).toLocaleDateString()}
                                            </dd>

                                            <dt>Dernière modification</dt>
                                            <dd className="text-muted">
                                                {new Date(
                                                    teacher.updated_at
                                                ).toLocaleDateString()}
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
                                                        Nom{" "}
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
                                                        Prénom{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${
                                                            errors.prenom
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={data.prenom}
                                                        onChange={(e) =>
                                                            setData(
                                                                "prenom",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {errors.prenom && (
                                                        <span className="invalid-feedback">
                                                            {errors.prenom}
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

                                            <div className="col-md-4">
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

                                            <div className="col-md-4">
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

                                            <div className="col-md-4">
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

                                {/* Informations professionnelles */}
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
                                                        Spécialisation{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${
                                                            errors.specialization
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={
                                                            data.specialization
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "specialization",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {errors.specialization && (
                                                        <span className="invalid-feedback">
                                                            {
                                                                errors.specialization
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>
                                                        Qualification{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </label>
                                                    <select
                                                        className={`form-control ${
                                                            errors.qualification
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={
                                                            data.qualification
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "qualification",
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionner...
                                                        </option>
                                                        <option value="Licence">
                                                            Licence
                                                        </option>
                                                        <option value="Master">
                                                            Master
                                                        </option>
                                                        <option value="Doctorat">
                                                            Doctorat
                                                        </option>
                                                        <option value="PhD">
                                                            PhD
                                                        </option>
                                                        <option value="Agrégation">
                                                            Agrégation
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

                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>
                                                        Années d'expérience
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${
                                                            errors.experience_years
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={
                                                            data.experience_years
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "experience_years",
                                                                e.target.value
                                                            )
                                                        }
                                                        min="0"
                                                    />
                                                    {errors.experience_years && (
                                                        <span className="invalid-feedback">
                                                            {
                                                                errors.experience_years
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>
                                                        Date d'embauche
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className={`form-control ${
                                                            errors.hire_date
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={data.hire_date}
                                                        onChange={(e) =>
                                                            setData(
                                                                "hire_date",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {errors.hire_date && (
                                                        <span className="invalid-feedback">
                                                            {errors.hire_date}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Statut</label>
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
                                                        <option value="conge">
                                                            En congé
                                                        </option>
                                                    </select>
                                                    {errors.statut && (
                                                        <span className="invalid-feedback">
                                                            {errors.statut}
                                                        </span>
                                                    )}
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

                                {/* Cours assignés */}
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

                                {/* Boutons d'action */}
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <Link
                                                href={route(
                                                    "scolarite.enseignants.show",
                                                    teacher.id
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

            <style>{`
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
            `}</style>
        </AdminLayout>
    );
}
