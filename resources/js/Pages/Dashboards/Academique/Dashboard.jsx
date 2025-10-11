import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({
    academicOverview,
    teacherPerformance,
    programsStatus,
    curriculumMetrics,
    pendingDecisions,
    academicReports,
    performanceAnalytics,
    alerts,
}) {
    const [currentView, setCurrentView] = useState("overview");
    const [selectedPeriod, setSelectedPeriod] = useState("current");
    const [refreshing, setRefreshing] = useState(false);

    const refreshData = async () => {
        setRefreshing(true);
        try {
            setTimeout(() => {
                setRefreshing(false);
            }, 1500);
        } catch (error) {
            console.error("Error refreshing data:", error);
            setRefreshing(false);
        }
    };

    const MetricCard = ({
        title,
        value,
        icon,
        color,
        trend,
        description,
        onClick,
    }) => (
        <div className="col-lg-3 col-6">
            <div
                className={`small-box ${color} ${
                    onClick ? "cursor-pointer" : ""
                }`}
                onClick={onClick}
            >
                <div className="inner">
                    <h3>
                        {value}
                        {trend && (
                            <sup className="small">
                                <i
                                    className={`fas fa-arrow-${
                                        trend > 0 ? "up" : "down"
                                    } ${
                                        trend > 0
                                            ? "text-success"
                                            : "text-danger"
                                    }`}
                                ></i>
                                {Math.abs(trend)}%
                            </sup>
                        )}
                    </h3>
                    <p>{title}</p>
                    {description && (
                        <small className="text-white-50">{description}</small>
                    )}
                </div>
                <div className="icon">
                    <i className={icon}></i>
                </div>
                {onClick && (
                    <div className="small-box-footer">
                        Analyser <i className="fas fa-arrow-circle-right"></i>
                    </div>
                )}
            </div>
        </div>
    );

    const DecisionCard = ({ decision, onApprove, onReject }) => (
        <div
            className={`card card-outline card-${
                decision.priority === "high"
                    ? "danger"
                    : decision.priority === "medium"
                    ? "warning"
                    : "primary"
            }`}
        >
            <div className="card-header">
                <h3 className="card-title">
                    <i className={`fas fa-${decision.icon} mr-2`}></i>
                    {decision.title}
                </h3>
                <div className="card-tools">
                    <span
                        className={`badge badge-${
                            decision.priority === "high"
                                ? "danger"
                                : decision.priority === "medium"
                                ? "warning"
                                : "info"
                        }`}
                    >
                        {decision.priority === "high"
                            ? "URGENT"
                            : decision.priority === "medium"
                            ? "IMPORTANT"
                            : "NORMAL"}
                    </span>
                </div>
            </div>
            <div className="card-body">
                <p className="text-muted">{decision.description}</p>
                <div className="row">
                    <div className="col-6">
                        <small>
                            <strong>Demandeur:</strong> {decision.requester}
                            <br />
                            <strong>Date:</strong> {decision.created_at}
                            <br />
                            <strong>Impact:</strong> {decision.impact}
                        </small>
                    </div>
                    <div className="col-6">
                        <small>
                            <strong>Département:</strong> {decision.department}
                            <br />
                            <strong>Coût estimé:</strong>{" "}
                            {decision.estimated_cost}
                            <br />
                            <strong>Échéance:</strong> {decision.deadline}
                        </small>
                    </div>
                </div>
            </div>
            <div className="card-footer">
                <div className="btn-group float-right">
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => onApprove(decision.id)}
                    >
                        <i className="fas fa-check mr-1"></i>
                        Approuver
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onReject(decision.id)}
                    >
                        <i className="fas fa-times mr-1"></i>
                        Rejeter
                    </button>
                    <button className="btn btn-info btn-sm">
                        <i className="fas fa-eye mr-1"></i>
                        Détails
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Dashboard Directeur Académique">
            <Head title="Direction Académique" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-university mr-2 text-primary"></i>
                                Direction Académique
                            </h1>
                            <p className="text-muted">
                                Supervision et pilotage pédagogique
                            </p>
                        </div>
                        <div className="col-sm-6">
                            <div className="float-sm-right">
                                <button
                                    onClick={refreshData}
                                    className={`btn btn-outline-primary btn-sm mr-2 ${
                                        refreshing ? "disabled" : ""
                                    }`}
                                    disabled={refreshing}
                                >
                                    <i
                                        className={`fas fa-sync-alt ${
                                            refreshing ? "fa-spin" : ""
                                        } mr-1`}
                                    ></i>
                                    {refreshing
                                        ? "Actualisation..."
                                        : "Actualiser"}
                                </button>
                                <div className="btn-group">
                                    <Link
                                        href="/academic/reports"
                                        className="btn btn-info btn-sm"
                                    >
                                        <i className="fas fa-chart-line mr-1"></i>
                                        Rapports
                                    </Link>
                                    <Link
                                        href="/academic/decisions"
                                        className="btn btn-warning btn-sm"
                                    >
                                        <i className="fas fa-gavel mr-1"></i>
                                        Décisions
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Alerts */}
                    {alerts && alerts.length > 0 && (
                        <div className="row mb-3">
                            <div className="col-12">
                                {alerts.map((alert, index) => (
                                    <div
                                        key={index}
                                        className={`alert alert-${alert.type} alert-dismissible`}
                                    >
                                        <button
                                            type="button"
                                            className="close"
                                            data-dismiss="alert"
                                        >
                                            ×
                                        </button>
                                        <h5>
                                            <i
                                                className={`fas fa-${alert.icon}`}
                                            ></i>{" "}
                                            {alert.title}
                                        </h5>
                                        {alert.message}
                                        {alert.action && (
                                            <div className="mt-2">
                                                <button className="btn btn-outline-dark btn-sm">
                                                    {alert.action}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Metrics */}
                    <div className="row">
                        <MetricCard
                            title="Performance Académique"
                            value={`${
                                academicOverview?.overall_performance || 0
                            }%`}
                            icon="fas fa-graduation-cap"
                            color="bg-primary"
                            trend={academicOverview?.performance_trend}
                            description="Moyenne institutionnelle"
                            onClick={() => setCurrentView("performance")}
                        />
                        <MetricCard
                            title="Enseignants Évalués"
                            value={teacherPerformance?.evaluated_teachers || 0}
                            icon="fas fa-chalkboard-teacher"
                            color="bg-success"
                            trend={teacherPerformance?.evaluation_trend}
                            description={`Sur ${
                                teacherPerformance?.total_teachers || 0
                            } enseignants`}
                            onClick={() => setCurrentView("teachers")}
                        />
                        <MetricCard
                            title="Programmes Actifs"
                            value={programsStatus?.active_programs || 0}
                            icon="fas fa-book-open"
                            color="bg-info"
                            trend={programsStatus?.programs_trend}
                            description="Certifications en cours"
                            onClick={() => setCurrentView("programs")}
                        />
                        <MetricCard
                            title="Décisions Pendantes"
                            value={pendingDecisions?.count || 0}
                            icon="fas fa-gavel"
                            color="bg-warning"
                            description="Nécessitent approbation"
                            onClick={() => setCurrentView("decisions")}
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-8">
                            {currentView === "overview" && (
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chart-area mr-1"></i>
                                            Performance Académique Globale
                                        </h3>
                                        <div className="card-tools">
                                            <div className="btn-group">
                                                <button
                                                    className={`btn btn-sm ${
                                                        selectedPeriod ===
                                                        "current"
                                                            ? "btn-primary"
                                                            : "btn-outline-primary"
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedPeriod(
                                                            "current"
                                                        )
                                                    }
                                                >
                                                    Année Courante
                                                </button>
                                                <button
                                                    className={`btn btn-sm ${
                                                        selectedPeriod ===
                                                        "comparison"
                                                            ? "btn-primary"
                                                            : "btn-outline-primary"
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedPeriod(
                                                            "comparison"
                                                        )
                                                    }
                                                >
                                                    Comparaison
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="performance-overview">
                                            <div className="row">
                                                {performanceAnalytics?.by_department?.map(
                                                    (dept, index) => (
                                                        <div
                                                            key={index}
                                                            className="col-md-6 mb-3"
                                                        >
                                                            <div className="info-box">
                                                                <span
                                                                    className={`info-box-icon bg-${
                                                                        dept.performance >=
                                                                        85
                                                                            ? "success"
                                                                            : dept.performance >=
                                                                              70
                                                                            ? "info"
                                                                            : dept.performance >=
                                                                              60
                                                                            ? "warning"
                                                                            : "danger"
                                                                    }`}
                                                                >
                                                                    <i className="fas fa-users"></i>
                                                                </span>
                                                                <div className="info-box-content">
                                                                    <span className="info-box-text">
                                                                        {
                                                                            dept.name
                                                                        }
                                                                    </span>
                                                                    <span className="info-box-number">
                                                                        {
                                                                            dept.performance
                                                                        }
                                                                        %
                                                                    </span>
                                                                    <div className="progress">
                                                                        <div
                                                                            className={`progress-bar bg-${
                                                                                dept.performance >=
                                                                                85
                                                                                    ? "success"
                                                                                    : dept.performance >=
                                                                                      70
                                                                                    ? "info"
                                                                                    : dept.performance >=
                                                                                      60
                                                                                    ? "warning"
                                                                                    : "danger"
                                                                            }`}
                                                                            style={{
                                                                                width: `${dept.performance}%`,
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="progress-description">
                                                                        {
                                                                            dept.student_count
                                                                        }{" "}
                                                                        étudiants
                                                                        •{" "}
                                                                        {
                                                                            dept.teacher_count
                                                                        }{" "}
                                                                        enseignants
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentView === "performance" && (
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">
                                            <i className="fas fa-chart-line mr-1"></i>
                                            Analyse de Performance Détaillée
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="performance-metrics">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <h5>Top Performers</h5>
                                                    {performanceAnalytics?.top_performers?.map(
                                                        (performer, index) => (
                                                            <div
                                                                key={index}
                                                                className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded"
                                                            >
                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            performer.name
                                                                        }
                                                                    </strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {
                                                                            performer.department
                                                                        }
                                                                    </small>
                                                                </div>
                                                                <span className="badge badge-success badge-lg">
                                                                    {
                                                                        performer.score
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <h5>Attention Requise</h5>
                                                    {performanceAnalytics?.needs_attention?.map(
                                                        (item, index) => (
                                                            <div
                                                                key={index}
                                                                className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded"
                                                            >
                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {
                                                                            item.issue
                                                                        }
                                                                    </small>
                                                                </div>
                                                                <span className="badge badge-warning">
                                                                    Action
                                                                    requise
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentView === "decisions" && (
                                <div className="decisions-section">
                                    <h4 className="mb-3">
                                        <i className="fas fa-gavel mr-2"></i>
                                        Décisions en Attente d'Approbation
                                    </h4>
                                    {pendingDecisions?.items?.map(
                                        (decision, index) => (
                                            <DecisionCard
                                                key={index}
                                                decision={decision}
                                                onApprove={(id) =>
                                                    console.log("Approve:", id)
                                                }
                                                onReject={(id) =>
                                                    console.log("Reject:", id)
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-star mr-1"></i>
                                        Performance Enseignants
                                    </h3>
                                </div>
                                <div
                                    className="card-body"
                                    style={{
                                        maxHeight: "350px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {teacherPerformance?.rankings?.map(
                                        (teacher, index) => (
                                            <div
                                                key={index}
                                                className="teacher-performance-item mb-3"
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className={`ranking-badge badge badge-${
                                                                index < 3
                                                                    ? "success"
                                                                    : index < 6
                                                                    ? "info"
                                                                    : "secondary"
                                                            } mr-2`}
                                                        >
                                                            #{index + 1}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">
                                                                {teacher.name}
                                                            </h6>
                                                            <small className="text-muted">
                                                                {
                                                                    teacher.department
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-weight-bold text-primary">
                                                            {teacher.rating}/5
                                                        </span>
                                                        <br />
                                                        <div className="rating-stars">
                                                            {[...Array(5)].map(
                                                                (_, i) => (
                                                                    <i
                                                                        key={i}
                                                                        className={`fas fa-star ${
                                                                            i <
                                                                            Math.floor(
                                                                                teacher.rating
                                                                            )
                                                                                ? "text-warning"
                                                                                : "text-muted"
                                                                        }`}
                                                                    ></i>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <small className="text-muted">
                                                        Classes:{" "}
                                                        {teacher.classes_count}{" "}
                                                        • Étudiants:{" "}
                                                        {teacher.students_count}{" "}
                                                        • Expérience:{" "}
                                                        {teacher.experience}
                                                    </small>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-book mr-1"></i>
                                        Programmes Académiques
                                    </h3>
                                </div>
                                <div className="card-body">
                                    {programsStatus?.programs?.map(
                                        (program, index) => (
                                            <div
                                                key={index}
                                                className="program-item mb-3 p-2 border rounded"
                                            >
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h6 className="font-weight-bold mb-1">
                                                            {program.name}
                                                        </h6>
                                                        <small className="text-muted">
                                                            {program.level}
                                                        </small>
                                                    </div>
                                                    <span
                                                        className={`badge badge-${
                                                            program.status ===
                                                            "excellent"
                                                                ? "success"
                                                                : program.status ===
                                                                  "good"
                                                                ? "info"
                                                                : program.status ===
                                                                  "needs_improvement"
                                                                ? "warning"
                                                                : "danger"
                                                        }`}
                                                    >
                                                        {program.status_label}
                                                    </span>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <small>
                                                                <i className="fas fa-users mr-1"></i>
                                                                {
                                                                    program.enrolled_students
                                                                }{" "}
                                                                étudiants
                                                            </small>
                                                        </div>
                                                        <div className="col-6">
                                                            <small>
                                                                <i className="fas fa-percentage mr-1"></i>
                                                                {
                                                                    program.success_rate
                                                                }
                                                                % réussite
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-bolt mr-1"></i>
                                        Actions Stratégiques
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-6 mb-2">
                                            <Link
                                                href="/academic/curriculum"
                                                className="btn btn-app bg-primary w-100"
                                            >
                                                <i className="fas fa-book-open"></i>
                                                Curriculum
                                            </Link>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <Link
                                                href="/academic/evaluations"
                                                className="btn btn-app bg-success w-100"
                                            >
                                                <i className="fas fa-chart-bar"></i>
                                                Évaluations
                                            </Link>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <Link
                                                href="/academic/teachers"
                                                className="btn btn-app bg-info w-100"
                                            >
                                                <i className="fas fa-users"></i>
                                                Corps Enseignant
                                            </Link>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <Link
                                                href="/academic/programs"
                                                className="btn btn-app bg-warning w-100"
                                            >
                                                <i className="fas fa-graduation-cap"></i>
                                                Programmes
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .cursor-pointer {
                    cursor: pointer;
                }

                .teacher-performance-item {
                    transition: all 0.2s ease;
                }

                .teacher-performance-item:hover {
                    background-color: #f8f9fa;
                }

                .ranking-badge {
                    min-width: 35px;
                    text-align: center;
                }

                .rating-stars .fa-star {
                    font-size: 12px;
                }

                .program-item:hover {
                    background-color: #f8f9fa;
                    border-color: #007bff !important;
                }

                .performance-overview .info-box {
                    margin-bottom: 0;
                }

                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }
            `}</style>
        </AdminLayout>
    );
}
