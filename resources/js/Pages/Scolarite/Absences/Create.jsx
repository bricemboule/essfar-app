import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";

export default function Create({
    classes,
    subjects,
    academicYears,
    students: initialStudents,
    preselected_class,
}) {
    const [selectedClass, setSelectedClass] = useState(preselected_class || "");
    const [students, setStudents] = useState(initialStudents || []);
    const [attendances, setAttendances] = useState({});

    const { data, setData, post, processing, errors } = useForm({
        date: new Date().toISOString().split("T")[0],
        course_id: "",
        school_class_id: selectedClass,
        academic_year_id: academicYears[0]?.id || "",
        attendances: [],
    });

    // Charger les étudiants quand la classe change
    useEffect(() => {
        if (selectedClass) {
            router.get(
                route("scolarite.attendances.create"),
                { class_id: selectedClass },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ["students"],
                    onSuccess: (page) => {
                        setStudents(page.props.students || []);
                        // Initialiser tous les étudiants comme présents
                        const initialAttendances = {};
                        (page.props.students || []).forEach((student) => {
                            initialAttendances[student.id] = {
                                student_id: student.id,
                                type: "presence",
                                delay_minutes: "",
                                notes: "",
                            };
                        });
                        setAttendances(initialAttendances);
                    },
                }
            );
        }
    }, [selectedClass]);

    const handleClassChange = (classId) => {
        setSelectedClass(classId);
        setData("school_class_id", classId);
    };

    const handleAttendanceChange = (studentId, field, value) => {
        setAttendances((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
            },
        }));
    };

    const markAll = (type) => {
        const updated = {};
        students.forEach((student) => {
            updated[student.id] = {
                student_id: student.id,
                type: type,
                delay_minutes:
                    type === "retard"
                        ? attendances[student.id]?.delay_minutes || ""
                        : "",
                notes: attendances[student.id]?.notes || "",
            };
        });
        setAttendances(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const attendanceArray = Object.values(attendances);

        router.post(
            route("scolarite.attendances.store"),
            {
                date: data.date,
                course_id: data.course_id,
                school_class_id: data.school_class_id,
                academic_year_id: data.academic_year_id,
                attendances: attendanceArray,
            },
            {
                preserveScroll: true,
            }
        );
    };

    const getRowClass = (type) => {
        const classes = {
            presence: "",
            absence: "table-danger",
            retard: "table-warning",
        };
        return classes[type] || "";
    };

    const getSummary = () => {
        const types = Object.values(attendances);
        return {
            presences: types.filter((a) => a.type === "presence").length,
            absences: types.filter((a) => a.type === "absence").length,
            retards: types.filter((a) => a.type === "retard").length,
        };
    };

    const summary = getSummary();

    return (
        <AdminLayout title="Saisir les présences">
            <Head title="Saisir présences" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-clipboard-check mr-2 text-success"></i>
                                Saisir les présences
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
                                            "scolarite.attendances.index"
                                        )}
                                    >
                                        Présences
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Saisir
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <form onSubmit={handleSubmit}>
                        {/* Informations générales */}
                        <div className="card mb-4">
                            <div className="card-header bg-primary">
                                <h3 className="card-title">
                                    Informations du cours
                                </h3>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>
                                                Date{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="date"
                                                className={`form-control ${
                                                    errors.date
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                value={data.date}
                                                onChange={(e) =>
                                                    setData(
                                                        "date",
                                                        e.target.value
                                                    )
                                                }
                                                max={
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                            />
                                            {errors.date && (
                                                <span className="invalid-feedback">
                                                    {errors.date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-3">
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
                                                value={selectedClass}
                                                onChange={(e) =>
                                                    handleClassChange(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Sélectionner une classe
                                                </option>
                                                {classes.map((cls) => (
                                                    <option
                                                        key={cls.id}
                                                        value={cls.id}
                                                    >
                                                        {cls.name} - {cls.level}
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
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>
                                                Matière{" "}
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
                                            >
                                                <option value="">
                                                    Sélectionner une matière
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
                                            {errors.course_id && (
                                                <span className="invalid-feedback">
                                                    {errors.course_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Année académique</label>
                                            <select
                                                className="form-control"
                                                value={data.academic_year_id}
                                                onChange={(e) =>
                                                    setData(
                                                        "academic_year_id",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {academicYears.map((year) => (
                                                    <option
                                                        key={year.id}
                                                        value={year.id}
                                                    >
                                                        {year.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Liste des étudiants */}
                        {students.length > 0 && (
                            <>
                                {/* Actions rapides */}
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <label className="mr-3">
                                                    Marquer tous comme :
                                                </label>
                                                <div className="btn-group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-success"
                                                        onClick={() =>
                                                            markAll("presence")
                                                        }
                                                    >
                                                        <i className="fas fa-check mr-1"></i>
                                                        Présents
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() =>
                                                            markAll("absence")
                                                        }
                                                    >
                                                        <i className="fas fa-times mr-1"></i>
                                                        Absents
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-warning"
                                                        onClick={() =>
                                                            markAll("retard")
                                                        }
                                                    >
                                                        <i className="fas fa-clock mr-1"></i>
                                                        Retards
                                                    </button>
                                                </div>

                                                <div className="float-right">
                                                    <span className="badge badge-success badge-lg mr-2">
                                                        Présents:{" "}
                                                        {summary.presences}
                                                    </span>
                                                    <span className="badge badge-danger badge-lg mr-2">
                                                        Absents:{" "}
                                                        {summary.absences}
                                                    </span>
                                                    <span className="badge badge-warning badge-lg">
                                                        Retards:{" "}
                                                        {summary.retards}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            Liste des étudiants (
                                            {students.length})
                                        </h3>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th
                                                            style={{
                                                                width: "5%",
                                                            }}
                                                        >
                                                            #
                                                        </th>
                                                        <th
                                                            style={{
                                                                width: "25%",
                                                            }}
                                                        >
                                                            Étudiant
                                                        </th>
                                                        <th
                                                            style={{
                                                                width: "20%",
                                                            }}
                                                        >
                                                            Statut
                                                        </th>
                                                        <th
                                                            style={{
                                                                width: "15%",
                                                            }}
                                                        >
                                                            Retard (min)
                                                        </th>
                                                        <th
                                                            style={{
                                                                width: "35%",
                                                            }}
                                                        >
                                                            Notes
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {students.map(
                                                        (student, index) => (
                                                            <tr
                                                                key={student.id}
                                                                className={getRowClass(
                                                                    attendances[
                                                                        student
                                                                            .id
                                                                    ]?.type
                                                                )}
                                                            >
                                                                <td>
                                                                    {index + 1}
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        <img
                                                                            src={
                                                                                student.photo ||
                                                                                "/images/default-avatar.png"
                                                                            }
                                                                            alt={
                                                                                student.name
                                                                            }
                                                                            className="img-circle mr-2"
                                                                            style={{
                                                                                width: "35px",
                                                                                height: "35px",
                                                                            }}
                                                                        />
                                                                        <div>
                                                                            <strong>
                                                                                {
                                                                                    student.name
                                                                                }
                                                                            </strong>
                                                                            <br />
                                                                            <small className="text-muted">
                                                                                {
                                                                                    student.matricule
                                                                                }
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group btn-group-sm w-100">
                                                                        <button
                                                                            type="button"
                                                                            className={`btn ${
                                                                                attendances[
                                                                                    student
                                                                                        .id
                                                                                ]
                                                                                    ?.type ===
                                                                                "presence"
                                                                                    ? "btn-success"
                                                                                    : "btn-outline-success"
                                                                            }`}
                                                                            onClick={() =>
                                                                                handleAttendanceChange(
                                                                                    student.id,
                                                                                    "type",
                                                                                    "presence"
                                                                                )
                                                                            }
                                                                            title="Présent"
                                                                        >
                                                                            <i className="fas fa-check"></i>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className={`btn ${
                                                                                attendances[
                                                                                    student
                                                                                        .id
                                                                                ]
                                                                                    ?.type ===
                                                                                "absence"
                                                                                    ? "btn-danger"
                                                                                    : "btn-outline-danger"
                                                                            }`}
                                                                            onClick={() =>
                                                                                handleAttendanceChange(
                                                                                    student.id,
                                                                                    "type",
                                                                                    "absence"
                                                                                )
                                                                            }
                                                                            title="Absent"
                                                                        >
                                                                            <i className="fas fa-times"></i>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className={`btn ${
                                                                                attendances[
                                                                                    student
                                                                                        .id
                                                                                ]
                                                                                    ?.type ===
                                                                                "retard"
                                                                                    ? "btn-warning"
                                                                                    : "btn-outline-warning"
                                                                            }`}
                                                                            onClick={() =>
                                                                                handleAttendanceChange(
                                                                                    student.id,
                                                                                    "type",
                                                                                    "retard"
                                                                                )
                                                                            }
                                                                            title="Retard"
                                                                        >
                                                                            <i className="fas fa-clock"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm"
                                                                        placeholder="Minutes"
                                                                        min="1"
                                                                        value={
                                                                            attendances[
                                                                                student
                                                                                    .id
                                                                            ]
                                                                                ?.delay_minutes ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleAttendanceChange(
                                                                                student.id,
                                                                                "delay_minutes",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            attendances[
                                                                                student
                                                                                    .id
                                                                            ]
                                                                                ?.type !==
                                                                            "retard"
                                                                        }
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control form-control-sm"
                                                                        placeholder="Notes optionnelles..."
                                                                        value={
                                                                            attendances[
                                                                                student
                                                                                    .id
                                                                            ]
                                                                                ?.notes ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleAttendanceChange(
                                                                                student.id,
                                                                                "notes",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {students.length === 0 && selectedClass && (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle mr-2"></i>
                                Aucun étudiant trouvé dans cette classe.
                            </div>
                        )}

                        {!selectedClass && (
                            <div className="alert alert-warning">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Veuillez sélectionner une classe pour commencer.
                            </div>
                        )}

                        {/* Actions */}
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <Link
                                        href={route(
                                            "scolarite.attendances.index"
                                        )}
                                        className="btn btn-secondary"
                                    >
                                        <i className="fas fa-arrow-left mr-1"></i>
                                        Annuler
                                    </Link>
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        disabled={
                                            processing ||
                                            students.length === 0 ||
                                            !data.course_id
                                        }
                                    >
                                        {processing ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                                Enregistrement...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save mr-1"></i>
                                                Enregistrer les présences
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            <style>{`
                .table-danger {
                    background-color: #f8d7da !important;
                }
                .table-warning {
                    background-color: #fff3cd !important;
                }
                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }
            `}</style>
        </AdminLayout>
    );
}
