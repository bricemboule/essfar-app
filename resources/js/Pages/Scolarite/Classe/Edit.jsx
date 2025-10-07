import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Card, FormField, Alert } from "@/Components/UI/Composant";

export default function Edit({ class: schoolClass, academicYears, levels }) {
    // Tous les cours (actuels + disponibles)
    const allCourses = [...(schoolClass.courses || [])];

    const [hasChanges, setHasChanges] = useState("");

    const { data, setData, put, processing, errors, reset } = useForm({
        name: schoolClass.name || "",
        code: schoolClass.code || "",
        level: schoolClass.level || "",
        academic_year_id: schoolClass.academic_year_id || "",
        capacity: schoolClass.capacity || 50,
        description: schoolClass.description || "",
        specialization: schoolClass.specialization || "",
        admission_requirements: schoolClass.admission_requirements || "",
        tuition_fee: schoolClass.tuition_fee || 0,
    });

    // Surveiller les changements
    useEffect(() => {
        const originalData = {
            name: schoolClass.name || "",
            code: schoolClass.code || "",
            level: schoolClass.level || "",
            academic_year_id: schoolClass.academic_year_id || "",
            capacity: schoolClass.capacity || 50,
            description: schoolClass.description || "",
            specialization: schoolClass.specialization || "",
            admission_requirements: schoolClass.admission_requirements || "",
            tuition_fee: schoolClass.tuition_fee || 0,
        };

        const currentData = {
            name: data.name,
            code: data.code,
            level: data.level,
            academic_year_id: data.academic_year_id,
            capacity: data.capacity,
            description: data.description,
            specialization: data.specialization,
            admission_requirements: data.admission_requirements,
            tuition_fee: data.tuition_fee,
        };

        const dataChanged =
            JSON.stringify(originalData) !== JSON.stringify(currentData);

        setHasChanges(dataChanged);
    }, [data, schoolClass]);

    const submit = (e) => {
        e.preventDefault();

        put(route("academic.classes.update", schoolClass.id));
    };

    const handleReset = () => {
        reset();
        setSelectedCourses(
            schoolClass.courses ? schoolClass.courses.map((c) => c.id) : []
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
        }).format(amount);
    };

    // Statistiques actuelles de la classe
    const currentStudents = schoolClass.students_count || 0;
    const occupationRate = Math.round((currentStudents / data.capacity) * 100);

    return (
        <AdminLayout title={`Modifier ${schoolClass.name}`}>
            <Head title={`Modifier ${schoolClass.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-edit mr-2 text-warning"></i>
                                Modifier la classe
                            </h1>
                            <small className="text-muted">
                                {schoolClass.name} - {schoolClass.code}
                            </small>
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
                                        href={route("academic.classes.index")}
                                    >
                                        Classes
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "academic.classes.show",
                                            schoolClass.id
                                        )}
                                    >
                                        {schoolClass.name}
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
                    {/* Alertes */}
                    {currentStudents > 0 && (
                        <Alert type="warning" className="mb-4">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            Cette classe contient actuellement{" "}
                            <strong>{currentStudents} étudiant(s)</strong>.
                            Soyez prudent lors de la modification de la capacité
                            ou des cours.
                        </Alert>
                    )}

                    {hasChanges && (
                        <Alert type="info" className="mb-4">
                            <i className="fas fa-info-circle mr-2"></i>
                            Vous avez des modifications non sauvegardées.
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-info ml-2"
                                onClick={handleReset}
                            >
                                <i className="fas fa-undo mr-1"></i>
                                Annuler les modifications
                            </button>
                        </Alert>
                    )}

                    <div className="row">
                        <div className="col-md-8">
                            <Card
                                title="Informations de la classe"
                                icon="fas fa-school"
                            >
                                <form onSubmit={submit}>
                                    <div className="row">
                                        <div className="col-md-8">
                                            <FormField
                                                label="Nom de la classe"
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
                                                icon="fas fa-graduation-cap"
                                                placeholder="Ex: Licence 1 Informatique A"
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <FormField
                                                label="Code de la classe"
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
                                                placeholder="Code unique"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormField
                                                label="Niveau d'étude"
                                                name="level"
                                                type="select"
                                                value={data.level}
                                                onChange={(e) =>
                                                    setData(
                                                        "level",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.level}
                                                required
                                                options={levels.map(
                                                    (level) => ({
                                                        value: level,
                                                        label: level,
                                                    })
                                                )}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <FormField
                                                label="Spécialisation"
                                                name="specialization"
                                                type="text"
                                                value={data.specialization}
                                                onChange={(e) =>
                                                    setData(
                                                        "specialization",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.specialization}
                                                icon="fas fa-brain"
                                                placeholder="Ex: Informatique, Mathématiques..."
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormField
                                                label="Capacité maximale"
                                                name="capacity"
                                                type="number"
                                                value={data.capacity}
                                                onChange={(e) =>
                                                    setData(
                                                        "capacity",
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                error={errors.capacity}
                                                required
                                                icon="fas fa-users"
                                                min={currentStudents} // Ne peut pas être inférieure au nombre d'étudiants actuels
                                                max="200"
                                                helpText={
                                                    currentStudents > 0
                                                        ? `Minimum ${currentStudents} (étudiants actuels)`
                                                        : "Nombre maximum d'étudiants"
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6">
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
                                                options={academicYears.map(
                                                    (year) => ({
                                                        value: year.id,
                                                        label: `${year.name} ${
                                                            year.is_active
                                                                ? "(Active)"
                                                                : ""
                                                        }`,
                                                    })
                                                )}
                                                disabled={currentStudents > 0}
                                                helpText={
                                                    currentStudents > 0
                                                        ? "Ne peut pas être modifiée (étudiants inscrits)"
                                                        : "Année académique de la classe"
                                                }
                                            />
                                        </div>
                                    </div>

                                    <FormField
                                        label="Description de la classe"
                                        name="description"
                                        type="textarea"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        error={errors.description}
                                        rows={3}
                                        placeholder="Description du programme et des objectifs de la classe..."
                                    />

                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormField
                                                label="Conditions d'admission"
                                                name="admission_requirements"
                                                type="textarea"
                                                value={
                                                    data.admission_requirements
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "admission_requirements",
                                                        e.target.value
                                                    )
                                                }
                                                error={
                                                    errors.admission_requirements
                                                }
                                                rows={3}
                                                placeholder="Diplômes requis, prérequis académiques..."
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <FormField
                                                label="Frais de scolarité (XAF)"
                                                name="tuition_fee"
                                                type="number"
                                                value={data.tuition_fee}
                                                onChange={(e) =>
                                                    setData(
                                                        "tuition_fee",
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                error={errors.tuition_fee}
                                                icon="fas fa-money-bill"
                                                min="0"
                                                step="10000"
                                                placeholder="Coût annuel de la formation"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </Card>

                            {/* Boutons d'action */}
                            <div className="d-flex justify-content-between mt-4">
                                <Link
                                    href={route(
                                        "academic.classes.show",
                                        schoolClass.id
                                    )}
                                    className="btn btn-secondary"
                                >
                                    <i className="fas fa-arrow-left mr-1"></i>
                                    Retour aux détails
                                </Link>

                                <div className="btn-group">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="btn btn-outline-secondary"
                                        disabled={!hasChanges}
                                    >
                                        <i className="fas fa-undo mr-1"></i>
                                        Réinitialiser
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submit}
                                        className="btn btn-warning"
                                        disabled={processing || !hasChanges}
                                    >
                                        {processing ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                                Mise à jour...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save mr-1"></i>
                                                Sauvegarder les modifications
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar avec informations actuelles */}
                        <div className="col-md-4">
                            <Card
                                title="État actuel de la classe"
                                icon="fas fa-info-circle"
                            >
                                <div className="text-center mb-3">
                                    <h4 className="text-primary">
                                        {schoolClass.name}
                                    </h4>
                                    <p className="text-muted">
                                        {schoolClass.code}
                                    </p>
                                    <span className="badge badge-secondary">
                                        {schoolClass.level}
                                    </span>
                                </div>

                                <div className="row text-center mb-3">
                                    <div className="col-6">
                                        <div className="description-block">
                                            <h5
                                                className={`description-header ${
                                                    occupationRate >= 90
                                                        ? "text-danger"
                                                        : occupationRate >= 75
                                                        ? "text-warning"
                                                        : "text-success"
                                                }`}
                                            >
                                                {currentStudents}/
                                                {data.capacity}
                                            </h5>
                                            <span className="description-text">
                                                ÉTUDIANTS
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="description-block">
                                            <h5
                                                className={`description-header ${
                                                    occupationRate >= 90
                                                        ? "text-danger"
                                                        : occupationRate >= 75
                                                        ? "text-warning"
                                                        : "text-success"
                                                }`}
                                            >
                                                {occupationRate}%
                                            </h5>
                                            <span className="description-text">
                                                OCCUPATION
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="progress mb-3">
                                    <div
                                        className={`progress-bar ${
                                            occupationRate >= 90
                                                ? "bg-danger"
                                                : occupationRate >= 75
                                                ? "bg-warning"
                                                : "bg-success"
                                        }`}
                                        style={{
                                            width: `${Math.min(
                                                occupationRate,
                                                100
                                            )}%`,
                                        }}
                                    ></div>
                                </div>

                                <hr />

                                {data.tuition_fee > 0 && (
                                    <>
                                        <hr />
                                        <div className="text-center">
                                            <h6>Frais de scolarité</h6>
                                            <h4 className="text-success">
                                                {formatCurrency(
                                                    data.tuition_fee
                                                )}
                                            </h4>
                                            <small className="text-muted">
                                                Par année académique
                                            </small>
                                        </div>
                                    </>
                                )}

                                <hr />

                                <div>
                                    <p>
                                        <strong>Spécialisation :</strong>{" "}
                                        {data.specialization || "Non définie"}
                                    </p>

                                    {hasChanges && (
                                        <Alert type="info" className="mt-3">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            <small>
                                                Des modifications sont en cours
                                            </small>
                                        </Alert>
                                    )}
                                </div>
                            </Card>

                            {/* Cours actuellement assignés */}
                            {schoolClass.courses &&
                                schoolClass.courses.length > 0 && (
                                    <Card
                                        title="Cours actuels"
                                        icon="fas fa-list"
                                        className="mt-3"
                                    >
                                        <div
                                            style={{
                                                maxHeight: "300px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            {schoolClass.courses.map(
                                                (course) => (
                                                    <div
                                                        key={course.id}
                                                        className={`d-flex justify-content-between align-items-center p-2 mb-1 rounded ${
                                                            selectedCourses.includes(
                                                                course.id
                                                            )
                                                                ? "bg-success text-white"
                                                                : "bg-light"
                                                        }`}
                                                    >
                                                        <div>
                                                            <small className="font-weight-bold">
                                                                {course.name}
                                                            </small>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </Card>
                                )}

                            <Card
                                title="Actions rapides"
                                icon="fas fa-lightning-bolt"
                                className="mt-3"
                            >
                                <div className="d-grid gap-2">
                                    <Link
                                        href={route(
                                            "academic.classes.show",
                                            schoolClass.id
                                        )}
                                        className="btn btn-outline-info btn-sm"
                                    >
                                        <i className="fas fa-eye mr-1"></i>
                                        Voir les détails
                                    </Link>

                                    {currentStudents > 0 && (
                                        <Link
                                            href={route("students.index", {
                                                class_id: schoolClass.id,
                                            })}
                                            className="btn btn-outline-success btn-sm"
                                        >
                                            <i className="fas fa-users mr-1"></i>
                                            Liste des étudiants
                                        </Link>
                                    )}
                                </div>
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

                .progress {
                    height: 8px;
                    border-radius: 4px;
                }

                .card-outline {
                    border: 1px solid #dee2e6;
                }

                .card-success.card-outline {
                    border-color: #28a745;
                }

                .description-block {
                    display: block;
                }

                .description-header {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                }

                .description-text {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    font-weight: 600;
                    color: #6c757d;
                }

                .d-grid {
                    display: grid;
                }

                .gap-2 {
                    gap: 0.5rem;
                }

                .position-absolute {
                    position: absolute !important;
                }
            `}</style>
        </AdminLayout>
    );
}
