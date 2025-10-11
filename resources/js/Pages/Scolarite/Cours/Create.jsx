import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Card, FormField, Alert, StatsCard } from "@/Components/UI/Composant";

export default function CreateCourse({ academicYears, teachers, classes }) {
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [totalCost, setTotalCost] = useState(0);
    console.log(teachers);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        code: "",
        description: "",
        credits: 3,
        total_hours: 30,
        taux_horaire: 10000,
        academic_year_id: academicYears.find((y) => y.is_active)?.id || "",
        teacher_ids: [],
        class_ids: [],
    });

    // Calculer le coût total
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
    };

    const submit = (e) => {
        e.preventDefault();

        if (selectedTeachers.length === 0) {
            alert("Veuillez sélectionner au moins un enseignant");
            return;
        }

        if (selectedClasses.length === 0) {
            alert("Veuillez sélectionner au moins une classe");
            return;
        }

        post(route("academic.courses.store"));
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
                                        href={route("academic.courses.index")}
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
                    <div className="row">
                        <div className="col-md-8">
                            <Card
                                title="Informations du cours"
                                icon="fas fa-book-open"
                            >
                                <div onSubmit={submit}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormField
                                                label="Nom du cours"
                                                name="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.name}
                                                required
                                                icon="fas fa-book"
                                                placeholder="Ex: Programmation Orientée Objet"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <FormField
                                                label="Code du cours"
                                                name="code"
                                                type="text"
                                                value={data.code}
                                                onChange={(e) =>
                                                    setData(
                                                        "code",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.code}
                                                required
                                                icon="fas fa-barcode"
                                                placeholder=""
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormField
                                                label="Nombre de crédits"
                                                name="credits"
                                                type="number"
                                                value={data.credits}
                                                onChange={(e) =>
                                                    setData(
                                                        "credits",
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                error={errors.credits}
                                                required
                                                icon="fas fa-medal"
                                                min="1"
                                                max="10"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <FormField
                                                label="Total d'heures"
                                                name="total_hours"
                                                type="number"
                                                value={data.total_hours}
                                                onChange={(e) =>
                                                    setData(
                                                        "total_hours",
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                error={errors.total_hours}
                                                required
                                                icon="fas fa-clock"
                                                min="1"
                                                max="200"
                                            />
                                        </div>
                                    </div>

                                    <FormField
                                        label="Année académique"
                                        name="academic_year_id"
                                        type="select"
                                        value={data.academic_year_id}
                                        onChange={(e) =>
                                            setData(
                                                "academic_year_id",
                                                e.target.value
                                            )
                                        }
                                        error={errors.academic_year_id}
                                        required
                                        options={academicYears.map((year) => ({
                                            value: year.id,
                                            label: `${year.name} ${
                                                year.is_active ? "(Active)" : ""
                                            }`,
                                        }))}
                                    />
                                </div>
                            </Card>

                            {/* Assignation des enseignants */}
                            <Card
                                title="Enseignants assignés"
                                icon="fas fa-chalkboard-teacher"
                                className="mt-4"
                            >
                                {teachers.length === 0 ? (
                                    <Alert type="warning">
                                        Aucun enseignant disponible.
                                        <Link
                                            href={route(
                                                "academic.enseignants.create"
                                            )}
                                            className="alert-link ml-1"
                                        >
                                            Créer un enseignant
                                        </Link>
                                    </Alert>
                                ) : (
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
                                                            ? "card-primary card-outline"
                                                            : "card-outline"
                                                    }`}
                                                    onClick={() =>
                                                        handleTeacherToggle(
                                                            teacher.id
                                                        )
                                                    }
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="custom-control custom-checkbox mr-3">
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
                                                                ></label>
                                                            </div>
                                                            <div className="flex-grow-1">
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
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.teacher_ids && (
                                    <div className="text-danger small">
                                        {errors.teacher_ids}
                                    </div>
                                )}
                                <div className="col-md-8">
                                    <FormField
                                        label="Tarif horaire (XAF)"
                                        name="taux_horaire"
                                        type="number"
                                        value={data.taux_horaire}
                                        onChange={(e) =>
                                            setData(
                                                "taux_horaire",
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        error={errors.taux_horaire}
                                        required
                                        icon="fas fa-money-bill"
                                        min="0"
                                        step="1000"
                                    />
                                </div>
                            </Card>

                            {/* Assignation des classes */}
                            <Card
                                title="Classes concernées"
                                icon="fas fa-users"
                                className="mt-4"
                            >
                                {classes.length === 0 ? (
                                    <Alert type="warning">
                                        Aucune classe disponible.
                                        <Link
                                            href={route(
                                                "academic.classes.create"
                                            )}
                                            className="alert-link ml-1"
                                        >
                                            Créer une classe
                                        </Link>
                                    </Alert>
                                ) : (
                                    <div className="row">
                                        {classes.map((schoolClass) => (
                                            <div
                                                key={schoolClass.id}
                                                className="col-md-6 mb-3"
                                            >
                                                <div
                                                    className={`card cursor-pointer ${
                                                        selectedClasses.includes(
                                                            schoolClass.id
                                                        )
                                                            ? "card-success card-outline"
                                                            : "card-outline"
                                                    }`}
                                                    onClick={() =>
                                                        handleClassToggle(
                                                            schoolClass.id
                                                        )
                                                    }
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="custom-control custom-checkbox mr-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="custom-control-input"
                                                                    id={`class-${schoolClass.id}`}
                                                                    checked={selectedClasses.includes(
                                                                        schoolClass.id
                                                                    )}
                                                                    onChange={() => {}}
                                                                />
                                                                <label
                                                                    className="custom-control-label"
                                                                    htmlFor={`class-${schoolClass.id}`}
                                                                ></label>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <h6 className="mb-0">
                                                                    {
                                                                        schoolClass.name
                                                                    }
                                                                </h6>
                                                                <small className="text-muted">
                                                                    {
                                                                        schoolClass.level
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        schoolClass.capacity
                                                                    }{" "}
                                                                    places
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.class_ids && (
                                    <div className="text-danger small">
                                        {errors.class_ids}
                                    </div>
                                )}
                            </Card>

                            {/* Boutons d'action */}
                            <div className="d-flex justify-content-between mt-4">
                                <Link
                                    href={route("academic.courses.index")}
                                    className="btn btn-secondary"
                                >
                                    <i className="fas fa-arrow-left mr-1"></i>
                                    Annuler
                                </Link>

                                <button
                                    type="button"
                                    onClick={submit}
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

                        {/* Sidebar with summary */}
                        <div className="col-md-4">
                            <Card
                                title="Résumé du cours"
                                icon="fas fa-info-circle"
                            >
                                <div className="text-center mb-3">
                                    <h4 className="text-primary">
                                        {data.name || "Nouveau cours"}
                                    </h4>
                                    <p className="text-muted">
                                        {data.code || "Code automatique"}
                                    </p>
                                </div>

                                <div className="row text-center">
                                    <div className="col-6">
                                        <div className="description-block">
                                            <h5 className="description-header text-info">
                                                {data.credits}
                                            </h5>
                                            <span className="description-text">
                                                CRÉDITS
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="description-block">
                                            <h5 className="description-header text-success">
                                                {data.total_hours}h
                                            </h5>
                                            <span className="description-text">
                                                DURÉE
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="text-center">
                                    <h6>Coût total estimé</h6>
                                    <h4 className="text-success">
                                        {formatCurrency(totalCost)}
                                    </h4>
                                    <small className="text-muted">
                                        {data.total_hours}h ×{" "}
                                        {formatCurrency(data.taux_horaire)}/h
                                    </small>
                                </div>

                                <hr />

                                <div>
                                    <p>
                                        <strong>Enseignants :</strong>{" "}
                                        {selectedTeachers.length}
                                    </p>
                                    <p>
                                        <strong>Classes :</strong>{" "}
                                        {selectedClasses.length}
                                    </p>
                                    <p>
                                        <strong>Étudiants concernés :</strong>{" "}
                                        {classes
                                            .filter((c) =>
                                                selectedClasses.includes(c.id)
                                            )
                                            .reduce(
                                                (sum, c) =>
                                                    sum + c.student_count,
                                                0
                                            )}
                                    </p>
                                </div>
                            </Card>

                            <Card
                                title="Conseils"
                                icon="fas fa-lightbulb"
                                className="mt-3"
                            >
                                <ul className="list-unstyled small">
                                    <li>
                                        <i className="fas fa-check text-success mr-2"></i>
                                        Le code est généré automatiquement
                                    </li>
                                    <li>
                                        <i className="fas fa-check text-success mr-2"></i>
                                        Assignez au moins un enseignant
                                    </li>
                                    <li>
                                        <i className="fas fa-check text-success mr-2"></i>
                                        Sélectionnez les classes appropriées
                                    </li>
                                    <li>
                                        <i className="fas fa-check text-success mr-2"></i>
                                        Définissez des objectifs clairs
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </div>
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
            `}</style>
        </AdminLayout>
    );
}
