import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Card, FormField, Alert } from "@/Components/UI/Composant";

export default function Create({ academicYears, courses, levels }) {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [totalCredits, setTotalCredits] = useState(0);
    const [totalHours, setTotalHours] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        code: "",
        level: "",
        academic_year_id: academicYears.find((y) => y.is_active)?.id || "",
        capacity: 50,
        description: "",
        specialization: "",
        admission_requirements: "",
        tuition_fee: 0,
    });
    console.log(courses);
    // Générer automatiquement le code de la classe
    useEffect(() => {
        if (data.level && data.specialization && !data.code) {
            const levelCode = data.level.split(" ")[1] || "";
            const specCode = data.specialization.substring(0, 4).toUpperCase();
            const random = Math.floor(Math.random() * 90) + 10;
            setData("code", `L${levelCode}-${specCode}-${random}`);
        }
    }, [data.level, data.specialization]);

    const handleCourseToggle = (courseId) => {
        const newCourses = selectedCourses.includes(courseId)
            ? selectedCourses.filter((id) => id !== courseId)
            : [...selectedCourses, courseId];

        setSelectedCourses(newCourses);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route("scolarite.classes.store"));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
        }).format(amount);
    };

    return (
        <AdminLayout title="Créer une classe">
            <Head title="Créer une classe" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-users mr-2 text-primary"></i>
                                Créer une nouvelle classe
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
                                        href={route("scolarite.classes.index")}
                                    >
                                        Classes
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
                                title="Informations de la classe"
                                icon="fas fa-school"
                            >
                                <div onSubmit={submit}>
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
                                                placeholder="AUTO"
                                                helpText="Généré automatiquement"
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
                                                required
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
                                                min="1"
                                                max="200"
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
                                </div>
                            </Card>

                            {/* Boutons d'action */}
                            <div className="d-flex justify-content-between mt-4">
                                <Link
                                    href={route("scolarite.classes.index")}
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
                                            Créer la classe
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Sidebar avec résumé */}
                        <div className="col-md-4">
                            <Card
                                title="Résumé de la classe"
                                icon="fas fa-info-circle"
                            >
                                <div className="text-center mb-3">
                                    <h4 className="text-primary">
                                        {data.name || "Nouvelle classe"}
                                    </h4>
                                    <p className="text-muted">
                                        {data.code || "Code automatique"}
                                    </p>
                                    <span className="badge badge-secondary">
                                        {data.level}
                                    </span>
                                </div>

                                <div className="row text-center mb-3">
                                    <div className="col-6">
                                        <div className="description-block">
                                            <h5 className="description-header text-info">
                                                {data.capacity}
                                            </h5>
                                            <span className="description-text">
                                                PLACES
                                            </span>
                                        </div>
                                    </div>
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
                            </Card>

                            <Card
                                title="Guide de création"
                                icon="fas fa-question-circle"
                                className="mt-3"
                            >
                                <div className="timeline timeline-sm">
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-success"></div>
                                        <div className="timeline-content">
                                            <h6>Informations de base</h6>
                                            <small>
                                                Nom, niveau et spécialisation
                                            </small>
                                        </div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-info"></div>
                                        <div className="timeline-content">
                                            <h6>Configuration</h6>
                                            <small>
                                                Capacité, durée et frais
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card
                                title="Statistiques système"
                                icon="fas fa-chart-pie"
                                className="mt-3"
                            >
                                <div className="small">
                                    <p>
                                        <strong>Classes existantes :</strong> 12
                                    </p>
                                    <p>
                                        <strong>Étudiants inscrits :</strong>{" "}
                                        450
                                    </p>
                                    <p>
                                        <strong>
                                            Taux de remplissage moyen :
                                        </strong>{" "}
                                        85%
                                    </p>
                                    <div className="progress progress-sm mt-2">
                                        <div
                                            className="progress-bar bg-success"
                                            style={{ width: "85%" }}
                                        ></div>
                                    </div>
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

                .timeline {
                    position: relative;
                    padding-left: 30px;
                }

                .timeline-item {
                    position: relative;
                    padding-bottom: 15px;
                }

                .timeline-item:before {
                    content: "";
                    position: absolute;
                    left: -23px;
                    top: 15px;
                    bottom: -15px;
                    width: 2px;
                    background: #dee2e6;
                }

                .timeline-item:last-child:before {
                    display: none;
                }

                .timeline-marker {
                    position: absolute;
                    left: -30px;
                    top: 0;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </AdminLayout>
    );
}
