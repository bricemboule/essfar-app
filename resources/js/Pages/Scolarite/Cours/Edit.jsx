import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Card, FormField, Alert } from "@/Components/UI/ProfessionalComponents";

export default function Edit({
    course,
    academicYears,
    teachers,
    classes,
    assignedTeachers,
    assignedClasses,
}) {
    const [selectedTeachers, setSelectedTeachers] = useState(
        assignedTeachers || []
    );
    const [selectedClasses, setSelectedClasses] = useState(
        assignedClasses || []
    );
    const [totalCost, setTotalCost] = useState(0);
    const [hasChanges, setHasChanges] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: course.name || "",
        code: course.code || "",
        description: course.description || "",
        credits: course.credits || 3,
        total_hours: course.total_hours || 30,
        hourly_rate: course.hourly_rate || 25000,
        academic_year_id: course.academic_year_id || "",
        teacher_ids: selectedTeachers,
        class_ids: selectedClasses,
        objectives: course.objectives || "",
        prerequisites: course.prerequisites || "",
        evaluation_method: course.evaluation_method || "",
        resources: course.resources || "",
    });

    // Détecter les changements
    useEffect(() => {
        const originalData = {
            name: course.name || "",
            code: course.code || "",
            description: course.description || "",
            credits: course.credits || 3,
            total_hours: course.total_hours || 30,
            hourly_rate: course.hourly_rate || 25000,
            academic_year_id: course.academic_year_id || "",
            objectives: course.objectives || "",
            prerequisites: course.prerequisites || "",
            evaluation_method: course.evaluation_method || "",
            resources: course.resources || "",
        };

        const currentData = {
            name: data.name,
            code: data.code,
            description: data.description,
            credits: data.credits,
            total_hours: data.total_hours,
            hourly_rate: data.hourly_rate,
            academic_year_id: data.academic_year_id,
            objectives: data.objectives,
            prerequisites: data.prerequisites,
            evaluation_method: data.evaluation_method,
            resources: data.resources,
        };

        const originalTeachers = [...assignedTeachers].sort();
        const currentTeachers = [...selectedTeachers].sort();
        const originalClasses = [...assignedClasses].sort();
        const currentClasses = [...selectedClasses].sort();

        const dataChanged =
            JSON.stringify(originalData) !== JSON.stringify(currentData);
        const teachersChanged =
            JSON.stringify(originalTeachers) !==
            JSON.stringify(currentTeachers);
        const classesChanged =
            JSON.stringify(originalClasses) !== JSON.stringify(currentClasses);

        setHasChanges(dataChanged || teachersChanged || classesChanged);
    }, [
        data,
        selectedTeachers,
        selectedClasses,
        course,
        assignedTeachers,
        assignedClasses,
    ]);

    // Calculer le coût total
    useEffect(() => {
        const cost = (data.total_hours || 0) * (data.hourly_rate || 0);
        setTotalCost(cost);
    }, [data.total_hours, data.hourly_rate]);

    // Mettre à jour les IDs dans le form
    useEffect(() => {
        setData((prev) => ({
            ...prev,
            teacher_ids: selectedTeachers,
            class_ids: selectedClasses,
        }));
    }, [selectedTeachers, selectedClasses]);

    const handleTeacherToggle = (teacherId) => {
        const newTeachers = selectedTeachers.includes(teacherId)
            ? selectedTeachers.filter((id) => id !== teacherId)
            : [...selectedTeachers, teacherId];

        setSelectedTeachers(newTeachers);
    };

    const handleClassToggle = (classId) => {
        const newClasses = selectedClasses.includes(classId)
            ? selectedClasses.filter((id) => id !== classId)
            : [...selectedClasses, classId];

        setSelectedClasses(newClasses);
    };

    const handleReset = () => {
        reset();
        setSelectedTeachers(assignedTeachers || []);
        setSelectedClasses(assignedClasses || []);
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

        put(route("academic.courses.update", course.id));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
        }).format(amount);
    };

    const getStudentCount = () => {
        return classes
            .filter((c) => selectedClasses.includes(c.id))
            .reduce((sum, c) => sum + (c.student_count || 0), 0);
    };

    return (
        <AdminLayout title={`Modifier ${course.name}`}>
            <Head title={`Modifier ${course.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-edit mr-2 text-warning"></i>
                                Modifier le cours
                            </h1>
                            <small className="text-muted">
                                {course.name} - {course.code}
                            </small>
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
                                <li className="breadcrumb-item">
                                    <Link
                                        href={route(
                                            "academic.courses.show",
                                            course.id
                                        )}
                                    >
                                        {course.name}
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

                    {course.schedules_count > 0 && (
                        <Alert type="warning" className="mb-4">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            Ce cours a{" "}
                            <strong>
                                {course.schedules_count} planning(s)
                            </strong>{" "}
                            associé(s). Soyez prudent lors de la modification
                            des enseignants et des classes.
                        </Alert>
                    )}

                    <div className="row">
                        <div className="col-md-8">
                            <Card
                                title="Informations du cours"
                                icon="fas fa-book-open"
                            >
                                <form onSubmit={submit}>
                                    <div className="row">
                                        <div className="col-md-8">
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
                                        <div className="col-md-4">
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
                                                placeholder="Ex: PRO-123"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
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
                                        <div className="col-md-4">
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
                                        <div className="col-md-4">
                                            <FormField
                                                label="Tarif horaire (XAF)"
                                                name="hourly_rate"
                                                type="number"
                                                value={data.hourly_rate}
                                                onChange={(e) =>
                                                    setData(
                                                        "hourly_rate",
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                error={errors.hourly_rate}
                                                required
                                                icon="fas fa-money-bill"
                                                min="0"
                                                step="1000"
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
                                        disabled={course.schedules_count > 0}
                                        helpText={
                                            course.schedules_count > 0
                                                ? "Ne peut pas être modifiée (plannings existants)"
                                                : "Année académique du cours"
                                        }
                                    />

                                    <FormField
                                        label="Description du cours"
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
                                        rows={4}
                                        placeholder="Description détaillée du contenu du cours..."
                                    />

                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormField
                                                label="Objectifs pédagogiques"
                                                name="objectives"
                                                type="textarea"
                                                value={data.objectives}
                                                onChange={(e) =>
                                                    setData(
                                                        "objectives",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.objectives}
                                                rows={3}
                                                placeholder="Objectifs que les étudiants atteindront..."
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <FormField
                                                label="Prérequis"
                                                name="prerequisites"
                                                type="textarea"
                                                value={data.prerequisites}
                                                onChange={(e) =>
                                                    setData(
                                                        "prerequisites",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.prerequisites}
                                                rows={3}
                                                placeholder="Connaissances requises avant ce cours..."
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormField
                                                label="Méthode d'évaluation"
                                                name="evaluation_method"
                                                type="textarea"
                                                value={data.evaluation_method}
                                                onChange={(e) =>
                                                    setData(
                                                        "evaluation_method",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.evaluation_method}
                                                rows={3}
                                                placeholder="Comment les étudiants seront évalués..."
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <FormField
                                                label="Ressources nécessaires"
                                                name="resources"
                                                type="textarea"
                                                value={data.resources}
                                                onChange={(e) =>
                                                    setData(
                                                        "resources",
                                                        e.target.value
                                                    )
                                                }
                                                error={errors.resources}
                                                rows={3}
                                                placeholder="Matériel, logiciels, livres requis..."
                                            />
                                        </div>
                                    </div>
                                </form>
                            </Card>

                            {/* Assignation des enseignants */}
                            <Card
                                title="Enseignants assignés"
                                icon="fas fa-chalkboard-teacher"
                                className="mt-4"
                            >
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0">
                                                Enseignants sélectionnés (
                                                {selectedTeachers.length} /{" "}
                                                {teachers.length})
                                            </h6>
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() =>
                                                        setSelectedTeachers(
                                                            teachers.map(
                                                                (t) => t.id
                                                            )
                                                        )
                                                    }
                                                >
                                                    Tout sélectionner
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() =>
                                                        setSelectedTeachers([])
                                                    }
                                                >
                                                    Tout déselectionner
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {teachers.length === 0 ? (
                                    <Alert type="warning">
                                        Aucun enseignant disponible.
                                        <Link
                                            href={route("admin.users.create")}
                                            className="alert-link ml-1"
                                        >
                                            Créer un enseignant
                                        </Link>
                                    </Alert>
                                ) : (
                                    <div className="row">
                                        {teachers.map((teacher) => {
                                            const isOriginal =
                                                assignedTeachers.includes(
                                                    teacher.id
                                                );
                                            const isSelected =
                                                selectedTeachers.includes(
                                                    teacher.id
                                                );

                                            return (
                                                <div
                                                    key={teacher.id}
                                                    className="col-md-6 mb-3"
                                                >
                                                    <div
                                                        className={`card cursor-pointer position-relative ${
                                                            isSelected
                                                                ? "card-primary card-outline"
                                                                : "card-outline"
                                                        }`}
                                                        onClick={() =>
                                                            handleTeacherToggle(
                                                                teacher.id
                                                            )
                                                        }
                                                    >
                                                        {isOriginal && (
                                                            <span
                                                                className="badge badge-info position-absolute"
                                                                style={{
                                                                    top: "5px",
                                                                    right: "5px",
                                                                    zIndex: 10,
                                                                }}
                                                            >
                                                                Actuel
                                                            </span>
                                                        )}
                                                        <div className="card-body p-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="custom-control custom-checkbox mr-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="custom-control-input"
                                                                        id={`teacher-${teacher.id}`}
                                                                        checked={
                                                                            isSelected
                                                                        }
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
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.teacher_ids && (
                                    <div className="text-danger small">
                                        {errors.teacher_ids}
                                    </div>
                                )}
                            </Card>

                            {/* Assignation des classes */}
                            <Card
                                title="Classes concernées"
                                icon="fas fa-users"
                                className="mt-4"
                            >
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0">
                                                Classes sélectionnées (
                                                {selectedClasses.length} /{" "}
                                                {classes.length})
                                            </h6>
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-success"
                                                    onClick={() =>
                                                        setSelectedClasses(
                                                            classes.map(
                                                                (c) => c.id
                                                            )
                                                        )
                                                    }
                                                >
                                                    Tout sélectionner
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() =>
                                                        setSelectedClasses([])
                                                    }
                                                >
                                                    Tout déselectionner
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

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
                                        {classes.map((schoolClass) => {
                                            const isOriginal =
                                                assignedClasses.includes(
                                                    schoolClass.id
                                                );
                                            const isSelected =
                                                selectedClasses.includes(
                                                    schoolClass.id
                                                );

                                            return (
                                                <div
                                                    key={schoolClass.id}
                                                    className="col-md-6 mb-3"
                                                >
                                                    <div
                                                        className={`card cursor-pointer position-relative ${
                                                            isSelected
                                                                ? "card-success card-outline"
                                                                : "card-outline"
                                                        }`}
                                                        onClick={() =>
                                                            handleClassToggle(
                                                                schoolClass.id
                                                            )
                                                        }
                                                    >
                                                        {isOriginal && (
                                                            <span
                                                                className="badge badge-info position-absolute"
                                                                style={{
                                                                    top: "5px",
                                                                    right: "5px",
                                                                    zIndex: 10,
                                                                }}
                                                            >
                                                                Actuel
                                                            </span>
                                                        )}
                                                        <div className="card-body p-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="custom-control custom-checkbox mr-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="custom-control-input"
                                                                        id={`class-${schoolClass.id}`}
                                                                        checked={
                                                                            isSelected
                                                                        }
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
                                            );
                                        })}
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
                                    href={route(
                                        "academic.courses.show",
                                        course.id
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

                        {/* Sidebar avec informations */}
                        <div className="col-md-4">
                            <Card
                                title="État du cours"
                                icon="fas fa-info-circle"
                            >
                                <div className="text-center mb-3">
                                    <h4 className="text-primary">
                                        {data.name || course.name}
                                    </h4>
                                    <p className="text-muted">
                                        {data.code || course.code}
                                    </p>
                                </div>

                                <div className="row text-center mb-3">
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

                                <div className="text-center mb-3">
                                    <h6>Coût total</h6>
                                    <h4 className="text-success">
                                        {formatCurrency(totalCost)}
                                    </h4>
                                    <small className="text-muted">
                                        {data.total_hours}h ×{" "}
                                        {formatCurrency(data.hourly_rate)}/h
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
                                        <strong>Étudiants :</strong>{" "}
                                        {getStudentCount()}
                                    </p>
                                    <p>
                                        <strong>Plannings :</strong>{" "}
                                        {course.schedules_count || 0}
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

                            <Card
                                title="Changements détectés"
                                icon="fas fa-history"
                                className="mt-3"
                            >
                                {hasChanges ? (
                                    <div>
                                        <div className="small">
                                            <p>
                                                <strong>
                                                    Modifications en cours :
                                                </strong>
                                            </p>
                                            <ul className="mb-0">
                                                {data.name !== course.name && (
                                                    <li>
                                                        Nom du cours modifié
                                                    </li>
                                                )}
                                                {data.code !== course.code && (
                                                    <li>Code modifié</li>
                                                )}
                                                {data.credits !==
                                                    course.credits && (
                                                    <li>
                                                        Nombre de crédits
                                                        modifié
                                                    </li>
                                                )}
                                                {data.total_hours !==
                                                    course.total_hours && (
                                                    <li>
                                                        Heures totales modifiées
                                                    </li>
                                                )}
                                                {data.hourly_rate !==
                                                    course.hourly_rate && (
                                                    <li>
                                                        Tarif horaire modifié
                                                    </li>
                                                )}
                                                {JSON.stringify(
                                                    [...selectedTeachers].sort()
                                                ) !==
                                                    JSON.stringify(
                                                        [
                                                            ...assignedTeachers,
                                                        ].sort()
                                                    ) && (
                                                    <li>
                                                        Enseignants modifiés
                                                    </li>
                                                )}
                                                {JSON.stringify(
                                                    [...selectedClasses].sort()
                                                ) !==
                                                    JSON.stringify(
                                                        [
                                                            ...assignedClasses,
                                                        ].sort()
                                                    ) && (
                                                    <li>Classes modifiées</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted small">
                                        <i className="fas fa-check-circle mr-1"></i>
                                        Aucune modification détectée
                                    </div>
                                )}
                            </Card>

                            <Card
                                title="Actions rapides"
                                icon="fas fa-lightning-bolt"
                                className="mt-3"
                            >
                                <div className="d-grid gap-2">
                                    <Link
                                        href={route(
                                            "academic.courses.show",
                                            course.id
                                        )}
                                        className="btn btn-outline-info btn-sm"
                                    >
                                        <i className="fas fa-eye mr-1"></i>
                                        Voir les détails
                                    </Link>
                                    <Link
                                        href={route(
                                            "academic.schedules.index",
                                            { course_id: course.id }
                                        )}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        <i className="fas fa-calendar mr-1"></i>
                                        Emplois du temps
                                    </Link>
                                    {course.schedules_count === 0 && (
                                        <Link
                                            href={route(
                                                "academic.schedules.create",
                                                { course_id: course.id }
                                            )}
                                            className="btn btn-outline-success btn-sm"
                                        >
                                            <i className="fas fa-calendar-plus mr-1"></i>
                                            Créer un planning
                                        </Link>
                                    )}
                                </div>
                            </Card>

                            {/* Enseignants actuels vs nouveaux */}
                            {selectedTeachers.length > 0 && (
                                <Card
                                    title="Enseignants sélectionnés"
                                    icon="fas fa-chalkboard-teacher"
                                    className="mt-3"
                                >
                                    <div
                                        style={{
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {teachers
                                            .filter((t) =>
                                                selectedTeachers.includes(t.id)
                                            )
                                            .map((teacher) => {
                                                const isOriginal =
                                                    assignedTeachers.includes(
                                                        teacher.id
                                                    );
                                                return (
                                                    <div
                                                        key={teacher.id}
                                                        className={`d-flex justify-content-between align-items-center p-2 mb-1 rounded ${
                                                            isOriginal
                                                                ? "bg-light"
                                                                : "bg-success text-white"
                                                        }`}
                                                    >
                                                        <div>
                                                            <small className="font-weight-bold">
                                                                {teacher.name}
                                                            </small>
                                                        </div>
                                                        <div>
                                                            {isOriginal ? (
                                                                <span className="badge badge-info">
                                                                    Actuel
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-light text-dark">
                                                                    Nouveau
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </Card>
                            )}

                            {/* Classes actuelles vs nouvelles */}
                            {selectedClasses.length > 0 && (
                                <Card
                                    title="Classes sélectionnées"
                                    icon="fas fa-users"
                                    className="mt-3"
                                >
                                    <div
                                        style={{
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {classes
                                            .filter((c) =>
                                                selectedClasses.includes(c.id)
                                            )
                                            .map((schoolClass) => {
                                                const isOriginal =
                                                    assignedClasses.includes(
                                                        schoolClass.id
                                                    );
                                                return (
                                                    <div
                                                        key={schoolClass.id}
                                                        className={`d-flex justify-content-between align-items-center p-2 mb-1 rounded ${
                                                            isOriginal
                                                                ? "bg-light"
                                                                : "bg-success text-white"
                                                        }`}
                                                    >
                                                        <div>
                                                            <small className="font-weight-bold">
                                                                {
                                                                    schoolClass.name
                                                                }
                                                            </small>
                                                            <br />
                                                            <small
                                                                className={
                                                                    isOriginal
                                                                        ? "text-muted"
                                                                        : "text-light"
                                                                }
                                                            >
                                                                {
                                                                    schoolClass.level
                                                                }
                                                            </small>
                                                        </div>
                                                        <div>
                                                            {isOriginal ? (
                                                                <span className="badge badge-info">
                                                                    Actuel
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-light text-dark">
                                                                    Nouveau
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </Card>
                            )}

                            <Card
                                title="Conseils de modification"
                                icon="fas fa-lightbulb"
                                className="mt-3"
                            >
                                <div className="small">
                                    <p>
                                        <strong>Modifications sûres :</strong>
                                    </p>
                                    <ul>
                                        <li>Description et objectifs</li>
                                        <li>Prérequis et ressources</li>
                                        <li>Méthode d'évaluation</li>
                                    </ul>

                                    <p>
                                        <strong>Attention :</strong>
                                    </p>
                                    <ul className="text-warning">
                                        <li>
                                            Modifier les heures peut affecter
                                            les plannings
                                        </li>
                                        <li>
                                            Changer les enseignants peut
                                            impacter les emplois du temps
                                        </li>
                                        <li>
                                            L'année académique ne peut pas être
                                            modifiée s'il y a des plannings
                                        </li>
                                    </ul>
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
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .description-block {
                    display: block;
                }

                .description-header {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin: 0;
                }

                .description-text {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    font-weight: 600;
                    color: #6c757d;
                }

                .card-outline {
                    border: 1px solid #dee2e6;
                }

                .card-primary.card-outline {
                    border-color: #007bff;
                }

                .card-success.card-outline {
                    border-color: #28a745;
                }

                .position-absolute {
                    position: absolute !important;
                }

                .d-grid {
                    display: grid;
                }

                .gap-2 {
                    gap: 0.5rem;
                }
            `}</style>
        </AdminLayout>
    );
}
