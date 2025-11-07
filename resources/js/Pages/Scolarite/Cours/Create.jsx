import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";

export default function CreateCourse({ academicYears, teachers, classes }) {
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [classSettings, setClassSettings] = useState({});
    const [totalCost, setTotalCost] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        code: "",
        description: "",
        credits: 3,
        total_hours: 30,
        taux_horaire: 10000,
        academic_year_id: academicYears.find((y) => y.is_active)?.id || "",
        teacher_ids: [],
        class_ids: [],
        class_credits: {},
        class_mandatory: {},
    });

    useEffect(() => {
        const cost = (data.total_hours || 0) * (data.taux_horaire || 0);
        setTotalCost(cost);
    }, [data.total_hours, data.taux_horaire]);

    const handleTeacherToggle = (teacherId) => {
        const newTeachers = selectedTeachers.includes(teacherId)
            ? selectedTeachers.filter((id) => id !== teacherId)
            : [...selectedTeachers, teacherId];

        setSelectedTeachers(newTeachers);
        setData("teacher_ids", newTeachers);
    };

    const handleClassToggle = (classId) => {
        const newClasses = selectedClasses.includes(classId)
            ? selectedClasses.filter((id) => id !== classId)
            : [...selectedClasses, classId];

        setSelectedClasses(newClasses);
        setData("class_ids", newClasses);

        // Initialiser les paramètres de la classe si elle est sélectionnée
        if (!selectedClasses.includes(classId)) {
            setClassSettings((prev) => ({
                ...prev,
                [classId]: {
                    credits: null,
                    is_mandatory: true,
                },
            }));
        }
    };

    const handleClassCreditsChange = (classId, credits) => {
        setClassSettings((prev) => ({
            ...prev,
            [classId]: {
                ...prev[classId],
                credits: credits === "" ? null : parseInt(credits),
            },
        }));

        setData("class_credits", {
            ...data.class_credits,
            [classId]: credits === "" ? null : parseInt(credits),
        });
    };

    const handleClassMandatoryChange = (classId, isMandatory) => {
        setClassSettings((prev) => ({
            ...prev,
            [classId]: {
                ...prev[classId],
                is_mandatory: isMandatory,
            },
        }));

        setData("class_mandatory", {
            ...data.class_mandatory,
            [classId]: isMandatory,
        });
    };

    const submit = (e) => {
        e.preventDefault();

        if (selectedClasses.length === 0) {
            alert("Veuillez sélectionner au moins une classe");
            return;
        }

        post(route("scolarite.courses.store"));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
        }).format(amount);
    };

    return (
        <AdminLayout title="Créer un cours">
            <Head title="Créer un cours" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-book mr-2 text-primary"></i>
                                Créer un nouveau cours
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
                                        href={route("scolarite.courses.index")}
                                    >
                                        Cours
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
                    <form onSubmit={submit}>
                        <div className="row">
                            <div className="col-md-8">
                                {/* Informations du cours */}
                                <div className="card">
                                    <div className="card-header bg-primary">
                                        <h3 className="card-title">
                                            <i className="fas fa-book-open mr-2"></i>
                                            Informations du cours
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>
                                                        Nom du cours{" "}
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
                                                        placeholder="Ex: Programmation Orientée Objet"
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
                                                        Code du cours{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${
                                                            errors.code
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={data.code}
                                                        onChange={(e) =>
                                                            setData(
                                                                "code",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Ex: INF301"
                                                    />
                                                    {errors.code && (
                                                        <span className="invalid-feedback">
                                                            {errors.code}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>
                                                        Crédits par défaut{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${
                                                            errors.credits
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={data.credits}
                                                        onChange={(e) =>
                                                            setData(
                                                                "credits",
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                        min="1"
                                                        max="10"
                                                    />
                                                    <small className="form-text text-muted">
                                                        Peut être personnalisé
                                                        par classe
                                                    </small>
                                                    {errors.credits && (
                                                        <span className="invalid-feedback">
                                                            {errors.credits}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>
                                                        Total d'heures{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${
                                                            errors.total_hours
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={data.total_hours}
                                                        onChange={(e) =>
                                                            setData(
                                                                "total_hours",
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                        min="1"
                                                        max="200"
                                                    />
                                                    {errors.total_hours && (
                                                        <span className="invalid-feedback">
                                                            {errors.total_hours}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>
                                                        Tarif horaire (XAF)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={
                                                            data.taux_horaire
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "taux_horaire",
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                        min="0"
                                                        step="1000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

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
                                                value={data.academic_year_id}
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
                                                {academicYears.map((year) => (
                                                    <option
                                                        key={year.id}
                                                        value={year.id}
                                                    >
                                                        {year.name}{" "}
                                                        {year.is_active
                                                            ? "(Active)"
                                                            : ""}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_year_id && (
                                                <span className="invalid-feedback">
                                                    {errors.academic_year_id}
                                                </span>
                                            )}
                                        </div>

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
                                                placeholder="Décrivez le contenu et les objectifs du cours..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Enseignants (optionnel) */}
                                <div className="card">
                                    <div className="card-header bg-success">
                                        <h3 className="card-title">
                                            <i className="fas fa-chalkboard-teacher mr-2"></i>
                                            Enseignants (optionnel)
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        {teachers.length === 0 ? (
                                            <div className="alert alert-info">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                Aucun enseignant disponible.
                                                Vous pourrez en assigner plus
                                                tard.
                                                <Link
                                                    href={route(
                                                        "scolarite.enseignants.create"
                                                    )}
                                                    className="alert-link ml-2"
                                                >
                                                    Créer un enseignant
                                                </Link>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-muted">
                                                    <i className="fas fa-info-circle mr-1"></i>
                                                    Vous pouvez assigner les
                                                    enseignants maintenant ou
                                                    plus tard
                                                </p>
                                                <div className="row">
                                                    {teachers.map((teacher) => (
                                                        <div
                                                            key={teacher.id}
                                                            className="col-md-6 mb-3"
                                                        >
                                                            <div
                                                                className={`card cursor-pointer ${
                                                                    selectedTeachers.includes(
                                                                        teacher.id
                                                                    )
                                                                        ? "card-success card-outline"
                                                                        : "card-outline"
                                                                }`}
                                                                onClick={() =>
                                                                    handleTeacherToggle(
                                                                        teacher.id
                                                                    )
                                                                }
                                                            >
                                                                <div className="card-body p-3">
                                                                    <div className="custom-control custom-checkbox">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom-control-input"
                                                                            id={`teacher-${teacher.id}`}
                                                                            checked={selectedTeachers.includes(
                                                                                teacher.id
                                                                            )}
                                                                            onChange={() => {}}
                                                                        />
                                                                        <label
                                                                            className="custom-control-label"
                                                                            htmlFor={`teacher-${teacher.id}`}
                                                                        >
                                                                            <h6 className="mb-0">
                                                                                {
                                                                                    teacher.name
                                                                                }
                                                                            </h6>
                                                                            <small className="text-muted">
                                                                                {
                                                                                    teacher.email
                                                                                }
                                                                            </small>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Classes */}
                                <div className="card">
                                    <div className="card-header bg-info">
                                        <h3 className="card-title">
                                            <i className="fas fa-users mr-2"></i>
                                            Classes concernées{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        {classes.length === 0 ? (
                                            <div className="alert alert-warning">
                                                Aucune classe disponible.
                                                <Link
                                                    href={route(
                                                        "scolarite.classes.create"
                                                    )}
                                                    className="alert-link ml-1"
                                                >
                                                    Créer une classe
                                                </Link>
                                            </div>
                                        ) : (
                                            <>
                                                {errors.class_ids && (
                                                    <div className="alert alert-danger">
                                                        {errors.class_ids}
                                                    </div>
                                                )}
                                                <div className="row">
                                                    {classes.map(
                                                        (schoolClass) => (
                                                            <div
                                                                key={
                                                                    schoolClass.id
                                                                }
                                                                className="col-md-12 mb-3"
                                                            >
                                                                <div
                                                                    className={`card ${
                                                                        selectedClasses.includes(
                                                                            schoolClass.id
                                                                        )
                                                                            ? "card-primary card-outline"
                                                                            : "card-outline"
                                                                    }`}
                                                                >
                                                                    <div className="card-body p-3">
                                                                        <div className="row align-items-center">
                                                                            <div className="col-md-6">
                                                                                <div className="custom-control custom-checkbox">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="custom-control-input"
                                                                                        id={`class-${schoolClass.id}`}
                                                                                        checked={selectedClasses.includes(
                                                                                            schoolClass.id
                                                                                        )}
                                                                                        onChange={() =>
                                                                                            handleClassToggle(
                                                                                                schoolClass.id
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    <label
                                                                                        className="custom-control-label cursor-pointer"
                                                                                        htmlFor={`class-${schoolClass.id}`}
                                                                                    >
                                                                                        <h6 className="mb-0">
                                                                                            {
                                                                                                schoolClass.name
                                                                                            }
                                                                                        </h6>
                                                                                        <small className="text-muted">
                                                                                            {
                                                                                                schoolClass.level
                                                                                            }{" "}
                                                                                            •{" "}
                                                                                            {
                                                                                                schoolClass.capacity
                                                                                            }{" "}
                                                                                            places
                                                                                        </small>
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                            {selectedClasses.includes(
                                                                                schoolClass.id
                                                                            ) && (
                                                                                <>
                                                                                    <div className="col-md-3">
                                                                                        <div className="form-group mb-0">
                                                                                            <label className="small">
                                                                                                Crédits
                                                                                                spécifiques
                                                                                            </label>
                                                                                            <input
                                                                                                type="number"
                                                                                                className="form-control form-control-sm"
                                                                                                value={
                                                                                                    classSettings[
                                                                                                        schoolClass
                                                                                                            .id
                                                                                                    ]
                                                                                                        ?.credits ??
                                                                                                    ""
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    handleClassCreditsChange(
                                                                                                        schoolClass.id,
                                                                                                        e
                                                                                                            .target
                                                                                                            .value
                                                                                                    )
                                                                                                }
                                                                                                placeholder={`Défaut: ${data.credits}`}
                                                                                                min="0"
                                                                                                max="10"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-md-3">
                                                                                        <div className="custom-control custom-switch">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                className="custom-control-input"
                                                                                                id={`mandatory-${schoolClass.id}`}
                                                                                                checked={
                                                                                                    classSettings[
                                                                                                        schoolClass
                                                                                                            .id
                                                                                                    ]
                                                                                                        ?.is_mandatory ??
                                                                                                    true
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    handleClassMandatoryChange(
                                                                                                        schoolClass.id,
                                                                                                        e
                                                                                                            .target
                                                                                                            .checked
                                                                                                    )
                                                                                                }
                                                                                            />
                                                                                            <label
                                                                                                className="custom-control-label small"
                                                                                                htmlFor={`mandatory-${schoolClass.id}`}
                                                                                            >
                                                                                                Cours
                                                                                                obligatoire
                                                                                            </label>
                                                                                        </div>
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Boutons d'action */}
                                <div className="d-flex justify-content-between">
                                    <Link
                                        href={route("scolarite.courses.index")}
                                        className="btn btn-secondary"
                                    >
                                        <i className="fas fa-arrow-left mr-1"></i>
                                        Annuler
                                    </Link>

                                    <button
                                        type="submit"
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
                                                Créer le cours
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar - Résumé */}
                            <div className="col-md-4">
                                <div className="card card-primary card-outline sticky-top">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            Résumé
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="text-center mb-3">
                                            <h5 className="text-primary">
                                                {data.name || "Nouveau cours"}
                                            </h5>
                                            <p className="text-muted">
                                                {data.code ||
                                                    "Code automatique"}
                                            </p>
                                        </div>

                                        <hr />

                                        <div className="row text-center">
                                            <div className="col-4">
                                                <h5 className="text-info">
                                                    {data.credits}
                                                </h5>
                                                <small>Crédits</small>
                                            </div>
                                            <div className="col-4">
                                                <h5 className="text-success">
                                                    {data.total_hours}h
                                                </h5>
                                                <small>Durée</small>
                                            </div>
                                            <div className="col-4">
                                                <h5 className="text-warning">
                                                    {selectedClasses.length}
                                                </h5>
                                                <small>Classes</small>
                                            </div>
                                        </div>

                                        {data.taux_horaire > 0 && (
                                            <>
                                                <hr />
                                                <div className="text-center">
                                                    <h6>Coût estimé</h6>
                                                    <h4 className="text-success">
                                                        {formatCurrency(
                                                            totalCost
                                                        )}
                                                    </h4>
                                                    <small className="text-muted">
                                                        {data.total_hours}h ×{" "}
                                                        {formatCurrency(
                                                            data.taux_horaire
                                                        )}
                                                        /h
                                                    </small>
                                                </div>
                                            </>
                                        )}

                                        <hr />

                                        <ul className="list-unstyled">
                                            <li>
                                                <i className="fas fa-chalkboard-teacher text-success mr-2"></i>
                                                <strong>Enseignants:</strong>{" "}
                                                {selectedTeachers.length > 0
                                                    ? `${selectedTeachers.length} assigné(s)`
                                                    : "Aucun (optionnel)"}
                                            </li>
                                            <li>
                                                <i className="fas fa-users text-primary mr-2"></i>
                                                <strong>Classes:</strong>{" "}
                                                {selectedClasses.length > 0
                                                    ? `${selectedClasses.length} sélectionnée(s)`
                                                    : "Aucune"}
                                            </li>
                                            <li>
                                                <i className="fas fa-user-graduate text-info mr-2"></i>
                                                <strong>Étudiants:</strong>{" "}
                                                {classes
                                                    .filter((c) =>
                                                        selectedClasses.includes(
                                                            c.id
                                                        )
                                                    )
                                                    .reduce(
                                                        (sum, c) =>
                                                            sum +
                                                            (c.student_count ||
                                                                0),
                                                        0
                                                    )}
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="card card-warning">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-lightbulb mr-2"></i>
                                            Conseils
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <ul className="list-unstyled small">
                                            <li className="mb-2">
                                                <i className="fas fa-check text-success mr-2"></i>
                                                Les enseignants sont optionnels,
                                                vous pouvez les assigner plus
                                                tard
                                            </li>
                                            <li className="mb-2">
                                                <i className="fas fa-check text-success mr-2"></i>
                                                Les crédits peuvent être
                                                personnalisés par classe
                                            </li>
                                            <li className="mb-2">
                                                <i className="fas fa-check text-success mr-2"></i>
                                                Indiquez si le cours est
                                                obligatoire pour chaque classe
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            <style>{`
                .cursor-pointer {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .cursor-pointer:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                
                .sticky-top {
                    position: sticky;
                    top: 20px;
                    z-index: 1020;
                }
            `}</style>
        </AdminLayout>
    );
}
