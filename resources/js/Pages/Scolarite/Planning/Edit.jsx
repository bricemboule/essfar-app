import React, { useState, useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

const Card = ({ title, icon, children, className = "" }) => (
    <div className={`card ${className}`}>
        <div className="card-header">
            <h3 className="card-title">
                {icon && <i className={`${icon} mr-2`}></i>}
                {title}
            </h3>
        </div>
        <div className="card-body">{children}</div>
    </div>
);

export default function Edit({
    schedule,
    courses,
    teachers,
    classes,
    classrooms,
}) {
    const { data, setData, put, processing, errors } = useForm({
        course_id: schedule.course_id || "",
        teacher_id: schedule.teacher_id || "",
        school_class_id: schedule.school_class_id || "",
        classroom_id: schedule.classroom_id || "",
        start_time: schedule.start_time?.split(".")[0] || "",
        end_time: schedule.end_time?.split(".")[0] || "",
        notes: schedule.notes || "",
    });

    const [duration, setDuration] = useState("");

    useEffect(() => {
        if (data.start_time && data.end_time) {
            const start = new Date(data.start_time);
            const end = new Date(data.end_time);
            const diff = end - start;
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor(
                    (diff % (1000 * 60 * 60)) / (1000 * 60)
                );
                setDuration(`${hours}h ${minutes}min`);
            } else {
                setDuration("Invalide");
            }
        }
    }, [data.start_time, data.end_time]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("planning.update", schedule.id));
    };

    const formatDateTime = (datetime) => {
        if (!datetime) return "";
        return datetime.split(".")[0];
    };

    return (
        <AdminLayout>
            <Head title={`Modifier - ${schedule.course?.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-edit mr-2 text-warning"></i>
                                Modifier la séance
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
                                    <Link href={route("planning.index")}>
                                        Plannings
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
                            {/* Formulaire principal */}
                            <div className="col-md-8">
                                <Card
                                    title="Informations de la séance"
                                    icon="fas fa-calendar-alt"
                                    className="card-warning card-outline"
                                >
                                    {!schedule.can_be_modified && (
                                        <div className="alert alert-warning">
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            <strong>Attention :</strong> Cette
                                            séance ne peut normalement plus être
                                            modifiée. Procédez avec prudence.
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Cours{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    className={`form-control ${
                                                        errors.course_id
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={data.course_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "course_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        -- Sélectionner un cours
                                                        --
                                                    </option>
                                                    {courses.map((course) => (
                                                        <option
                                                            key={course.id}
                                                            value={course.id}
                                                        >
                                                            {course.name}{" "}
                                                            {course.code &&
                                                                `(${course.code})`}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.course_id && (
                                                    <div className="invalid-feedback">
                                                        {errors.course_id}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Enseignant{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    className={`form-control ${
                                                        errors.teacher_id
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={data.teacher_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "teacher_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        -- Sélectionner un
                                                        enseignant --
                                                    </option>
                                                    {teachers.map((teacher) => (
                                                        <option
                                                            key={teacher.id}
                                                            value={teacher.id}
                                                        >
                                                            {teacher.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.teacher_id && (
                                                    <div className="invalid-feedback">
                                                        {errors.teacher_id}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
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
                                                    value={data.school_class_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "school_class_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        -- Sélectionner une
                                                        classe --
                                                    </option>
                                                    {classes.map((cls) => (
                                                        <option
                                                            key={cls.id}
                                                            value={cls.id}
                                                        >
                                                            {cls.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.school_class_id && (
                                                    <div className="invalid-feedback">
                                                        {errors.school_class_id}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Salle{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    className={`form-control ${
                                                        errors.classroom_id
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={data.classroom_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "classroom_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        -- Sélectionner une
                                                        salle --
                                                    </option>
                                                    {classrooms.map(
                                                        (classroom) => (
                                                            <option
                                                                key={
                                                                    classroom.id
                                                                }
                                                                value={
                                                                    classroom.id
                                                                }
                                                            >
                                                                {classroom.name}
                                                                {classroom.capacity &&
                                                                    ` (${classroom.capacity} places)`}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                                {errors.classroom_id && (
                                                    <div className="invalid-feedback">
                                                        {errors.classroom_id}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <hr />

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Date et heure de début{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className={`form-control ${
                                                        errors.start_time
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={data.start_time}
                                                    onChange={(e) =>
                                                        setData(
                                                            "start_time",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                />
                                                {errors.start_time && (
                                                    <div className="invalid-feedback">
                                                        {errors.start_time}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Date et heure de fin{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className={`form-control ${
                                                        errors.end_time
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={data.end_time}
                                                    onChange={(e) =>
                                                        setData(
                                                            "end_time",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                />
                                                {errors.end_time && (
                                                    <div className="invalid-feedback">
                                                        {errors.end_time}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {duration && (
                                        <div className="alert alert-info">
                                            <i className="fas fa-clock mr-2"></i>
                                            <strong>Durée calculée :</strong>{" "}
                                            {duration}
                                        </div>
                                    )}

                                    {errors.conflict && (
                                        <div className="alert alert-danger">
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            <strong>Conflit détecté :</strong>{" "}
                                            {errors.conflict}
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Notes / Remarques</label>
                                        <textarea
                                            className={`form-control ${
                                                errors.notes ? "is-invalid" : ""
                                            }`}
                                            rows="4"
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData("notes", e.target.value)
                                            }
                                            placeholder="Ajoutez des notes ou remarques pour cette séance..."
                                        ></textarea>
                                        {errors.notes && (
                                            <div className="invalid-feedback">
                                                {errors.notes}
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Boutons d'action */}
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="btn-group btn-group-lg">
                                            <button
                                                type="submit"
                                                className="btn btn-warning"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                                        Enregistrement...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-save mr-2"></i>
                                                        Enregistrer les
                                                        modifications
                                                    </>
                                                )}
                                            </button>
                                            <Link
                                                href={route(
                                                    "planning.show",
                                                    schedule.id
                                                )}
                                                className="btn btn-secondary"
                                            >
                                                <i className="fas fa-times mr-2"></i>
                                                Annuler
                                            </Link>
                                            <Link
                                                href={route("planning.index")}
                                                className="btn btn-outline-secondary"
                                            >
                                                <i className="fas fa-arrow-left mr-2"></i>
                                                Retour à la liste
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - Informations actuelles */}
                            <div className="col-md-4">
                                <Card
                                    title="Informations actuelles"
                                    icon="fas fa-info-circle"
                                    className="card-info card-outline"
                                >
                                    <div className="info-group mb-3">
                                        <label className="text-muted small">
                                            Statut
                                        </label>
                                        <p className="mb-0">
                                            <span
                                                className={`badge ${
                                                    schedule.status ===
                                                    "scheduled"
                                                        ? "badge-primary"
                                                        : schedule.status ===
                                                          "completed"
                                                        ? "badge-success"
                                                        : schedule.status ===
                                                          "cancelled"
                                                        ? "badge-danger"
                                                        : "badge-warning"
                                                }`}
                                            >
                                                {schedule.status === "scheduled"
                                                    ? "Programmé"
                                                    : schedule.status ===
                                                      "completed"
                                                    ? "Terminé"
                                                    : schedule.status ===
                                                      "cancelled"
                                                    ? "Annulé"
                                                    : "Reporté"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="info-group mb-3">
                                        <label className="text-muted small">
                                            Créée le
                                        </label>
                                        <p className="mb-0">
                                            {new Date(
                                                schedule.created_at
                                            ).toLocaleString("fr-FR")}
                                        </p>
                                    </div>

                                    <div className="info-group mb-3">
                                        <label className="text-muted small">
                                            Dernière modification
                                        </label>
                                        <p className="mb-0">
                                            {new Date(
                                                schedule.updated_at
                                            ).toLocaleString("fr-FR")}
                                        </p>
                                    </div>

                                    {schedule.is_recurring && (
                                        <div className="alert alert-info">
                                            <i className="fas fa-repeat mr-2"></i>
                                            <strong>Séance récurrente</strong>
                                            <p className="mb-0 mt-2 small">
                                                Cette séance fait partie d'une
                                                série récurrente. Les
                                                modifications ne s'appliquent
                                                qu'à cette occurrence.
                                            </p>
                                        </div>
                                    )}
                                </Card>

                                <Card
                                    title="Aide"
                                    icon="fas fa-question-circle"
                                    className="card-secondary"
                                >
                                    <div className="help-section">
                                        <h6>
                                            <i className="fas fa-lightbulb mr-2 text-warning"></i>
                                            Conseils
                                        </h6>
                                        <ul className="small mb-0">
                                            <li>
                                                Vérifiez les disponibilités de
                                                l'enseignant et de la salle
                                            </li>
                                            <li>
                                                Assurez-vous que les horaires ne
                                                chevauchent pas d'autres séances
                                            </li>
                                            <li>
                                                La durée minimale recommandée
                                                est de 30 minutes
                                            </li>
                                            <li>
                                                Ajoutez des notes si nécessaire
                                                pour informer les participants
                                            </li>
                                        </ul>
                                    </div>

                                    <hr />

                                    <div className="help-section">
                                        <h6>
                                            <i className="fas fa-exclamation-triangle mr-2 text-warning"></i>
                                            Attention
                                        </h6>
                                        <p className="small mb-0 text-muted">
                                            Le système vérifie automatiquement
                                            les conflits de disponibilité. Si un
                                            conflit est détecté, un message
                                            d'erreur s'affichera.
                                        </p>
                                    </div>
                                </Card>

                                <Card
                                    title="Raccourcis"
                                    icon="fas fa-link"
                                    className="card-outline card-primary"
                                >
                                    <div className="list-group list-group-flush">
                                        <Link
                                            href={route(
                                                "planning.teacher",
                                                schedule.teacher_id
                                            )}
                                            className="list-group-item list-group-item-action"
                                        >
                                            <i className="fas fa-user-tie mr-2"></i>
                                            Planning de l'enseignant
                                        </Link>
                                        <Link
                                            href={route(
                                                "planning.class",
                                                schedule.school_class_id
                                            )}
                                            className="list-group-item list-group-item-action"
                                        >
                                            <i className="fas fa-users mr-2"></i>
                                            Planning de la classe
                                        </Link>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            <style>{`
                .info-group label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                    display: block;
                    text-transform: uppercase;
                }

                .info-group p {
                    font-size: 0.95rem;
                }

                .btn-group-lg .btn {
                    font-size: 1rem;
                    padding: 0.75rem 1.25rem;
                }

                .help-section h6 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                }

                .help-section ul {
                    padding-left: 1.25rem;
                }

                .help-section ul li {
                    margin-bottom: 0.5rem;
                }

                .list-group-item {
                    border-left: 0;
                    border-right: 0;
                }

                .list-group-item:first-child {
                    border-top: 0;
                }

                .list-group-item:last-child {
                    border-bottom: 0;
                }

                .list-group-item-action:hover {
                    background-color: #f8f9fa;
                }

                input[type="datetime-local"] {
                    min-height: 38px;
                }

                .alert {
                    border-radius: 0.25rem;
                }

                @media (max-width: 768px) {
                    .btn-group-lg {
                        flex-direction: column;
                    }

                    .btn-group-lg .btn {
                        width: 100%;
                        margin-bottom: 0.5rem;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
