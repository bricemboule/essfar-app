import React, { useState, useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "axios";

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

export default function ScheduleCreate({
    courses,
    teachers,
    classes,
    classrooms,
    academicYear,
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        course_id: "",
        teacher_id: "",
        school_class_id: "",
        classroom_id: "",
        start_time: "",
        end_time: "",
        is_recurring: false,
        notes: "",
        replicate_to_other_classes: false,
        replication_interval: 0,
        use_default_classroom: false,
    });

    const [filteredCourses, setFilteredCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [duration, setDuration] = useState(0);
    const [otherClasses, setOtherClasses] = useState([]);
    const [showReplicationOptions, setShowReplicationOptions] = useState(false);

    // Calculer la durée
    useEffect(() => {
        if (data.start_time && data.end_time) {
            const start = new Date(data.start_time);
            const end = new Date(data.end_time);
            const diff = (end - start) / (1000 * 60);
            setDuration(diff > 0 ? diff : 0);
        }
    }, [data.start_time, data.end_time]);

    // Charger les cours de la classe sélectionnée
    useEffect(() => {
        if (data.school_class_id) {
            console.log(
                route(
                    "scolarite.planning.classes.courses",
                    data.school_class_id
                )
            );

            axios
                .get(
                    route(
                        "scolarite.planning.classes.courses",
                        data.school_class_id
                    )
                )
                .then((res) => setFilteredCourses(res.data))
                .catch(() => setFilteredCourses([]));

            setData("course_id", "");
        } else {
            setFilteredCourses([]);
            setData("course_id", "");
        }
    }, [data.school_class_id]);

    // Charger les autres classes ayant le même cours
    useEffect(() => {
        if (data.course_id && data.school_class_id) {
            axios
                .get(
                    route("scolarite.planning.course-classes", {
                        course: data.course_id,
                        class_id: data.school_class_id,
                    })
                )
                .then((res) => {
                    setOtherClasses(res.data);
                    setShowReplicationOptions(res.data.length > 0);
                })
                .catch(() => {
                    setOtherClasses([]);
                    setShowReplicationOptions(false);
                });
        } else {
            setOtherClasses([]);
            setShowReplicationOptions(false);
        }
    }, [data.course_id, data.school_class_id]);

    useEffect(() => {
        if (data.course_id) {
            const course = filteredCourses.find(
                (c) => c.id === parseInt(data.course_id)
            );
            setSelectedCourse(course);
        } else {
            setSelectedCourse(null);
        }
    }, [data.course_id, filteredCourses]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("scolarite.planning.schedules.store"), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const setEndTimeFromDuration = (minutes) => {
        if (data.start_time && minutes > 0) {
            const start = new Date(data.start_time);
            start.setMinutes(start.getMinutes() + minutes);
            const endTime = start.toLocaleString("sv-SE").slice(0, 16);
            setData("end_time", endTime);
        }
    };

    const quickSetDuration = (minutes) => {
        setEndTimeFromDuration(minutes);
    };

    return (
        <AdminLayout>
            <Head title="Programmer une séance" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-calendar-plus mr-2 text-success"></i>
                                Programmer une séance
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
                                            "scolarite.planning.schedules.index"
                                        )}
                                    >
                                        Plannings
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
                                title="Informations de la séance"
                                icon="fas fa-info-circle"
                                className="mb-4"
                            >
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
                                                    Sélectionner une classe
                                                </option>
                                                {classes.map((cls) => (
                                                    <option
                                                        key={cls.id}
                                                        value={cls.id}
                                                    >
                                                        {cls.name} -{" "}
                                                        {
                                                            cls.academic_year
                                                                ?.name
                                                        }
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
                                                disabled={!data.school_class_id}
                                                required
                                            >
                                                <option value="">
                                                    Sélectionner un cours
                                                </option>
                                                {filteredCourses.map(
                                                    (course) => (
                                                        <option
                                                            key={course.id}
                                                            value={course.id}
                                                        >
                                                            {course.name} (
                                                            {course.code})
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                            {errors.course_id && (
                                                <div className="invalid-feedback">
                                                    {errors.course_id}
                                                </div>
                                            )}
                                            {!data.school_class_id && (
                                                <small className="text-muted">
                                                    Veuillez d'abord
                                                    sélectionner une classe
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
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
                                                    Sélectionner un enseignant
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

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>
                                                Salle de classe{" "}
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
                                                    Sélectionner une salle
                                                </option>
                                                {classrooms.map((classroom) => (
                                                    <option
                                                        key={classroom.id}
                                                        value={classroom.id}
                                                    >
                                                        {classroom.name} -
                                                        Capacité:{" "}
                                                        {classroom.capacity}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.classroom_id && (
                                                <div className="invalid-feedback">
                                                    {errors.classroom_id}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>
                                                Début{" "}
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
                                                Fin{" "}
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

                                {duration > 0 && (
                                    <div className="alert alert-info">
                                        <i className="fas fa-clock mr-2"></i>
                                        Durée de la séance :{" "}
                                        <strong>{duration} minutes</strong> (
                                        {(duration / 60).toFixed(2)} heures)
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Durées rapides</label>
                                    <div className="btn-group d-block">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => quickSetDuration(60)}
                                            disabled={!data.start_time}
                                        >
                                            1h
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => quickSetDuration(90)}
                                            disabled={!data.start_time}
                                        >
                                            1h30
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() =>
                                                quickSetDuration(120)
                                            }
                                            disabled={!data.start_time}
                                        >
                                            2h
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() =>
                                                quickSetDuration(150)
                                            }
                                            disabled={!data.start_time}
                                        >
                                            2h30
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() =>
                                                quickSetDuration(180)
                                            }
                                            disabled={!data.start_time}
                                        >
                                            3h
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() =>
                                                quickSetDuration(240)
                                            }
                                            disabled={!data.start_time}
                                        >
                                            4h
                                        </button>
                                    </div>
                                    <small className="text-muted d-block mt-1">
                                        Cliquez pour définir automatiquement
                                        l'heure de fin
                                    </small>
                                </div>

                                <div className="form-group">
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="is_recurring"
                                            checked={data.is_recurring}
                                            onChange={(e) =>
                                                setData(
                                                    "is_recurring",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="is_recurring"
                                        >
                                            Séance récurrente (se répète chaque
                                            semaine)
                                        </label>
                                    </div>
                                    {data.is_recurring && (
                                        <div className="alert alert-warning mt-2">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            Cette séance sera automatiquement
                                            programmée chaque semaine jusqu'à la
                                            fin de l'année académique.
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Notes / Remarques</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData("notes", e.target.value)
                                        }
                                        placeholder="Ajoutez des notes ou remarques concernant cette séance..."
                                    ></textarea>
                                </div>

                                {errors.conflict && (
                                    <div className="alert alert-danger">
                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                        {errors.conflict}
                                    </div>
                                )}
                            </Card>

                            {/* Options de réplication */}
                            {showReplicationOptions && (
                                <Card
                                    title="Options de réplication"
                                    icon="fas fa-copy"
                                    className="card-success mb-4"
                                >
                                    <div className="alert alert-info">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        <strong>{otherClasses.length}</strong>{" "}
                                        autre(s) classe(s) ont ce cours.
                                        Voulez-vous répliquer ce planning ?
                                    </div>

                                    <div className="custom-control custom-switch mb-3">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="replicate_to_other_classes"
                                            checked={
                                                data.replicate_to_other_classes
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "replicate_to_other_classes",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="replicate_to_other_classes"
                                        >
                                            <strong>
                                                Répliquer dans les autres
                                                classes
                                            </strong>
                                        </label>
                                    </div>

                                    {data.replicate_to_other_classes && (
                                        <>
                                            <div className="form-group">
                                                <label>
                                                    Intervalle entre chaque
                                                    classe (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={
                                                        data.replication_interval
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "replication_interval",
                                                            parseInt(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                    min="0"
                                                    step="15"
                                                />
                                                <small className="form-text text-muted">
                                                    Laissez 0 pour utiliser le
                                                    même créneau horaire
                                                </small>
                                            </div>

                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="use_default_classroom"
                                                    checked={
                                                        data.use_default_classroom
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "use_default_classroom",
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    className="custom-control-label"
                                                    htmlFor="use_default_classroom"
                                                >
                                                    Attribuer automatiquement
                                                    les salles disponibles
                                                </label>
                                            </div>

                                            <hr />

                                            <h6>Classes concernées :</h6>
                                            <ul className="list-unstyled">
                                                {otherClasses.map((cls) => (
                                                    <li key={cls.id}>
                                                        <i className="fas fa-users text-success mr-2"></i>
                                                        {cls.name} - {cls.level}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </Card>
                            )}
                        </div>

                        <div className="col-md-4">
                            <Card
                                title="Résumé de la séance"
                                icon="fas fa-clipboard-check"
                                className="mb-4"
                            >
                                {selectedCourse && (
                                    <div className="alert alert-info">
                                        <h6 className="mb-2">
                                            <i className="fas fa-book mr-2"></i>
                                            Informations du cours
                                        </h6>
                                        <p className="mb-1">
                                            <strong>Code :</strong>{" "}
                                            {selectedCourse.code}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Heures totales :</strong>{" "}
                                            {selectedCourse.total_hours}h
                                        </p>
                                    </div>
                                )}

                                <div className="info-box bg-light">
                                    <div className="info-box-content">
                                        <span className="info-box-text">
                                            Année académique
                                        </span>
                                        <span className="info-box-number">
                                            {academicYear?.name}
                                        </span>
                                    </div>
                                </div>

                                {data.school_class_id && (
                                    <div className="info-box bg-primary">
                                        <span className="info-box-icon">
                                            <i className="fas fa-users"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Classe
                                            </span>
                                            <span className="info-box-number">
                                                {
                                                    classes.find(
                                                        (c) =>
                                                            c.id ===
                                                            parseInt(
                                                                data.school_class_id
                                                            )
                                                    )?.name
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {data.teacher_id && (
                                    <div className="info-box bg-success">
                                        <span className="info-box-icon">
                                            <i className="fas fa-user-tie"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Enseignant
                                            </span>
                                            <span className="info-box-number">
                                                {
                                                    teachers.find(
                                                        (t) =>
                                                            t.id ===
                                                            parseInt(
                                                                data.teacher_id
                                                            )
                                                    )?.name
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {duration > 0 && (
                                    <div className="info-box bg-info">
                                        <span className="info-box-icon">
                                            <i className="fas fa-clock"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Durée
                                            </span>
                                            <span className="info-box-number">
                                                {(duration / 60).toFixed(2)}h
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {data.replicate_to_other_classes &&
                                    otherClasses.length > 0 && (
                                        <div className="alert alert-success">
                                            <i className="fas fa-copy mr-2"></i>
                                            Sera répliqué dans{" "}
                                            <strong>
                                                {otherClasses.length}
                                            </strong>{" "}
                                            classe(s)
                                        </div>
                                    )}
                            </Card>

                            <Card title="Actions" icon="fas fa-tasks">
                                <div className="d-grid gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="btn btn-success btn-block btn-lg"
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
                                                Programmer la séance
                                            </>
                                        )}
                                    </button>

                                    <Link
                                        href={route(
                                            "scolarite.planning.schedules.index"
                                        )}
                                        className="btn btn-secondary btn-block"
                                    >
                                        <i className="fas fa-times mr-2"></i>
                                        Annuler
                                    </Link>
                                </div>
                            </Card>

                            <div className="callout callout-info">
                                <h5>
                                    <i className="fas fa-info-circle"></i> Aide
                                </h5>
                                <p className="mb-0 small">
                                    Le système vérifiera automatiquement les
                                    conflits de planning pour l'enseignant et la
                                    salle sélectionnés.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .info-box {
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border-radius: 5px;
                    margin-bottom: 1rem;
                }
                .info-box-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                }
                .d-grid {
                    display: grid;
                }
                .gap-2 {
                    gap: 0.5rem;
                }
                .callout {
                    border-left: 5px solid;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    background-color: #f8f9fa;
                }
                .callout-info {
                    border-left-color: #17a2b8;
                }
                .btn-block {
                    display: block;
                    width: 100%;
                }
            `}</style>
        </AdminLayout>
    );
}
