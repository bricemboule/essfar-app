import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({
    student,
    todaySchedule,
    weekSchedule,
    recentGrades,
    semesterGrades,
    attendance,
    assignments,
    announcements,
    classmates,
    academicProgress,
}) {
    console.log({
        student,
        todaySchedule,
        weekSchedule,
        recentGrades,
        semesterGrades,
        attendance,
        assignments,
        announcements,
        classmates,
        academicProgress,
    });

    const [activeTab, setActiveTab] = useState("schedule");
    const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week

    const StatCard = ({ title, value, icon, color, description, trend }) => (
        <div className="col-lg-3 col-6">
            <div className={`small-box ${color}`}>
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
            </div>
        </div>
    );

    const ScheduleCard = ({ schedule }) => {
        const now = new Date();
        const startTime = new Date(schedule.start_time);
        const endTime = new Date(schedule.end_time);
        const isNow = now >= startTime && now <= endTime;
        const isUpcoming =
            startTime > now &&
            startTime <= new Date(now.getTime() + 60 * 60 * 1000);

        return (
            <div
                className={`schedule-card p-3 mb-3 border rounded ${
                    isNow
                        ? "border-success bg-light"
                        : isUpcoming
                        ? "border-warning"
                        : "border-secondary"
                }`}
            >
                <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                            <h6 className="mb-0 font-weight-bold text-primary">
                                {schedule.subject_name}
                            </h6>
                            {isNow && (
                                <span className="badge badge-success ml-2 pulse">
                                    EN COURS
                                </span>
                            )}
                            {isUpcoming && (
                                <span className="badge badge-warning ml-2">
                                    BIENTÔT
                                </span>
                            )}
                        </div>
                        <div className="text-muted">
                            <div className="mb-1">
                                <i className="fas fa-clock mr-2"></i>
                                {schedule.start_time} - {schedule.end_time}
                            </div>
                            <div className="mb-1">
                                <i className="fas fa-door-open mr-2"></i>
                                {schedule.classroom}
                            </div>
                            <div className="mb-1">
                                <i className="fas fa-chalkboard-teacher mr-2"></i>
                                {schedule.teacher_name}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="course-type badge badge-info mb-2">
                            {schedule.type}
                        </div>
                        {schedule.assignment_due && (
                            <div className="assignment-alert">
                                <small className="text-warning">
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    Devoir à rendre
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const GradeCard = ({ grade }) => {
        const getGradeColor = (score) => {
            if (score >= 16) return "success";
            if (score >= 14) return "info";
            if (score >= 12) return "warning";
            if (score >= 10) return "secondary";
            return "danger";
        };

        return (
            <div className="grade-item d-flex justify-content-between align-items-center p-3 border rounded mb-2">
                <div>
                    <h6 className="mb-1 font-weight-bold">{grade.subject}</h6>
                    <small className="text-muted">
                        {grade.type} - {grade.date}
                        {grade.coefficient > 1 && (
                            <span className="ml-2 badge badge-outline-primary">
                                Coef. {grade.coefficient}
                            </span>
                        )}
                    </small>
                </div>
                <div className="text-right">
                    <span
                        className={`badge badge-${getGradeColor(
                            grade.score
                        )} badge-lg`}
                    >
                        {grade.score}/20
                    </span>
                    {grade.class_average && (
                        <div className="mt-1">
                            <small className="text-muted">
                                Moy. classe: {grade.class_average}/20
                            </small>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AdminLayout title="Mon Espace Étudiant">
            <Head title="Espace Étudiant" />

            {/* Content Header */}
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-8">
                            <h1 className="m-0">
                                <i className="fas fa-graduation-cap mr-2 text-primary"></i>
                                Bonjour{" "}
                                {student?.name?.split(" ")[0] || "Étudiant"}
                            </h1>
                            <p className="text-muted mb-0">
                                {student?.class_name} - Année académique{" "}
                                {student?.academic_year}
                            </p>
                        </div>
                        <div className="col-sm-4">
                            <div className="float-sm-right text-center">
                                <img
                                    src={
                                        student?.photo_url ||
                                        "/images/default-avatar.png"
                                    }
                                    alt="Photo de profil"
                                    className="img-circle elevation-2"
                                    width="60"
                                    height="60"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <section className="content">
                <div className="container-fluid">
                    {/* Statistics Cards */}
                    <div className="row">
                        <StatCard
                            title="Moyenne Générale"
                            value={academicProgress?.overall_average || "--"}
                            icon="fas fa-chart-line"
                            color="bg-primary"
                            description="Ce semestre"
                            trend={academicProgress?.trend}
                        />
                        <StatCard
                            title="Présence"
                            value={`${attendance?.rate || 0}%`}
                            icon="fas fa-user-check"
                            color="bg-success"
                            description={`${attendance?.present || 0}/${
                                attendance?.total || 0
                            } cours`}
                        />
                        <StatCard
                            title="Devoirs à Rendre"
                            value={assignments?.pending || 0}
                            icon="fas fa-tasks"
                            color="bg-warning"
                            description="À venir cette semaine"
                        />
                        <StatCard
                            title="Rang dans la Classe"
                            value={academicProgress?.class_rank || "--"}
                            icon="fas fa-trophy"
                            color="bg-info"
                            description={`Sur ${
                                student?.class_size || "--"
                            } étudiants`}
                        />
                    </div>

                    <div className="row">
                        {/* Left Column */}
                        <div className="col-md-8">
                            {/* Navigation Tabs */}
                            <div className="card card-primary card-tabs">
                                <div className="card-header p-0 pt-1">
                                    <ul className="nav nav-tabs" role="tablist">
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "schedule"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveTab("schedule")
                                                }
                                                role="tab"
                                            >
                                                <i className="fas fa-calendar mr-1"></i>
                                                Mon Planning
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "grades"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveTab("grades")
                                                }
                                                role="tab"
                                            >
                                                <i className="fas fa-graduation-cap mr-1"></i>
                                                Mes Notes
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeTab === "assignments"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveTab("assignments")
                                                }
                                                role="tab"
                                            >
                                                <i className="fas fa-tasks mr-1"></i>
                                                Devoirs
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body">
                                    {activeTab === "schedule" && (
                                        <div className="schedule-view">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5>
                                                    <i className="fas fa-calendar-day mr-2"></i>
                                                    Planning d'Aujourd'hui
                                                </h5>
                                                <div className="btn-group">
                                                    <button className="btn btn-outline-primary btn-sm">
                                                        <i className="fas fa-chevron-left"></i>
                                                    </button>
                                                    <button className="btn btn-outline-primary btn-sm">
                                                        Aujourd'hui
                                                    </button>
                                                    <button className="btn btn-outline-primary btn-sm">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            {todaySchedule &&
                                            todaySchedule.length > 0 ? (
                                                <div className="today-schedule">
                                                    {todaySchedule.map(
                                                        (schedule, index) => (
                                                            <ScheduleCard
                                                                key={index}
                                                                schedule={
                                                                    schedule
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-5 text-muted">
                                                    <i className="fas fa-calendar-times fa-3x mb-3"></i>
                                                    <div>
                                                        Aucun cours programmé
                                                        aujourd'hui
                                                    </div>
                                                    <small>
                                                        Profitez de cette
                                                        journée libre !
                                                    </small>
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                <Link
                                                    href="/student/schedule"
                                                    className="btn btn-primary"
                                                >
                                                    <i className="fas fa-calendar mr-1"></i>
                                                    Voir le planning complet
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "grades" && (
                                        <div className="grades-view">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5>
                                                    <i className="fas fa-chart-bar mr-2"></i>
                                                    Mes Notes Récentes
                                                </h5>
                                                <div className="academic-summary">
                                                    <span className="badge badge-primary badge-lg">
                                                        Moyenne:{" "}
                                                        {academicProgress?.overall_average ||
                                                            "--"}
                                                        /20
                                                    </span>
                                                </div>
                                            </div>

                                            {recentGrades &&
                                            recentGrades.length > 0 ? (
                                                <div className="grades-list">
                                                    {recentGrades.map(
                                                        (grade, index) => (
                                                            <GradeCard
                                                                key={index}
                                                                grade={grade}
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-5 text-muted">
                                                    <i className="fas fa-clipboard-list fa-3x mb-3"></i>
                                                    <div>
                                                        Aucune note récente
                                                    </div>
                                                    <small>
                                                        Les notes apparaîtront
                                                        ici une fois saisies
                                                    </small>
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                <Link
                                                    href="/student/grades"
                                                    className="btn btn-success"
                                                >
                                                    <i className="fas fa-list mr-1"></i>
                                                    Voir toutes mes notes
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "assignments" && (
                                        <div className="assignments-view">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5>
                                                    <i className="fas fa-tasks mr-2"></i>
                                                    Devoirs à Rendre
                                                </h5>
                                                <span className="badge badge-warning">
                                                    {assignments?.pending || 0}{" "}
                                                    en attente
                                                </span>
                                            </div>

                                            {assignments?.upcoming &&
                                            assignments.upcoming.length > 0 ? (
                                                <div className="assignments-list">
                                                    {assignments.upcoming.map(
                                                        (assignment, index) => (
                                                            <div
                                                                key={index}
                                                                className="assignment-card p-3 mb-3 border rounded"
                                                            >
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div>
                                                                        <h6 className="font-weight-bold text-primary mb-1">
                                                                            {
                                                                                assignment.subject
                                                                            }
                                                                        </h6>
                                                                        <p className="mb-2">
                                                                            {
                                                                                assignment.title
                                                                            }
                                                                        </p>
                                                                        <small className="text-muted">
                                                                            <i className="fas fa-user mr-1"></i>
                                                                            {
                                                                                assignment.teacher
                                                                            }
                                                                        </small>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div
                                                                            className={`badge badge-${
                                                                                assignment.days_left <=
                                                                                1
                                                                                    ? "danger"
                                                                                    : assignment.days_left <=
                                                                                      3
                                                                                    ? "warning"
                                                                                    : "info"
                                                                            } mb-2`}
                                                                        >
                                                                            {
                                                                                assignment.due_date
                                                                            }
                                                                        </div>
                                                                        <div>
                                                                            <small className="text-muted">
                                                                                {assignment.days_left >
                                                                                0
                                                                                    ? `Dans ${assignment.days_left} jour(s)`
                                                                                    : "À rendre aujourd'hui"}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-5 text-muted">
                                                    <i className="fas fa-check-circle fa-3x mb-3 text-success"></i>
                                                    <div>
                                                        Aucun devoir en attente
                                                    </div>
                                                    <small>
                                                        Vous êtes à jour !
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-md-4">
                            {/* Quick Profile */}
                            <div className="card card-widget widget-user">
                                <div className="widget-user-header bg-primary">
                                    <h3 className="widget-user-username">
                                        {student?.name}
                                    </h3>
                                    <h5 className="widget-user-desc">
                                        {student?.class_name}
                                    </h5>
                                </div>
                                <div className="widget-user-image">
                                    <img
                                        className="img-circle elevation-2"
                                        src={
                                            student?.photo_url ||
                                            "/images/default-avatar.png"
                                        }
                                        alt="Photo de profil"
                                    />
                                </div>
                                <div className="card-footer">
                                    <div className="row">
                                        <div className="col-sm-4 border-right">
                                            <div className="description-block">
                                                <h5 className="description-header text-success">
                                                    {academicProgress?.overall_average ||
                                                        "--"}
                                                </h5>
                                                <span className="description-text">
                                                    MOYENNE
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-sm-4 border-right">
                                            <div className="description-block">
                                                <h5 className="description-header text-info">
                                                    {attendance?.rate || 0}%
                                                </h5>
                                                <span className="description-text">
                                                    PRÉSENCE
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="description-block">
                                                <h5 className="description-header text-warning">
                                                    {academicProgress?.class_rank ||
                                                        "--"}
                                                </h5>
                                                <span className="description-text">
                                                    RANG
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <Link
                                            href="/student/profile"
                                            className="btn btn-primary btn-sm btn-block"
                                        >
                                            <i className="fas fa-user-edit mr-1"></i>
                                            Modifier mon profil
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Announcements */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-bullhorn mr-1"></i>
                                        Annonces
                                    </h3>
                                    <div className="card-tools">
                                        <span className="badge badge-info">
                                            {announcements?.length || 0}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className="card-body p-0"
                                    style={{
                                        maxHeight: "250px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {announcements &&
                                    announcements.length > 0 ? (
                                        <ul className="list-group list-group-flush">
                                            {announcements.map(
                                                (announcement, index) => (
                                                    <li
                                                        key={index}
                                                        className="list-group-item"
                                                    >
                                                        <div className="d-flex justify-content-between">
                                                            <div>
                                                                <h6 className="mb-1">
                                                                    {
                                                                        announcement.title
                                                                    }
                                                                </h6>
                                                                <small className="text-muted">
                                                                    {
                                                                        announcement.message
                                                                    }
                                                                </small>
                                                            </div>
                                                            <small className="text-muted">
                                                                {
                                                                    announcement.date
                                                                }
                                                            </small>
                                                        </div>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <i className="fas fa-inbox fa-2x mb-2"></i>
                                            <div>Aucune annonce</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-bolt mr-1"></i>
                                        Accès Rapide
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-6 mb-2">
                                            <Link
                                                href="/student/schedule"
                                                className="btn btn-app bg-primary w-100"
                                            >
                                                <i className="fas fa-calendar"></i>
                                                Planning
                                            </Link>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <Link
                                                href="/student/grades"
                                                className="btn btn-app bg-success w-100"
                                            >
                                                <i className="fas fa-chart-bar"></i>
                                                Notes
                                            </Link>
                                        </div>
                                        <div className="col-6">
                                            <Link
                                                href="/student/profile"
                                                className="btn btn-app bg-info w-100"
                                            >
                                                <i className="fas fa-user"></i>
                                                Profil
                                            </Link>
                                        </div>
                                        <div className="col-6">
                                            <Link
                                                href="/student/help"
                                                className="btn btn-app bg-warning w-100"
                                            >
                                                <i className="fas fa-question-circle"></i>
                                                Aide
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .schedule-card {
                    transition: all 0.3s ease;
                }

                .schedule-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .pulse {
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                .grade-item:hover {
                    background-color: #f8f9fa;
                }

                .assignment-card {
                    transition: all 0.2s ease;
                }

                .assignment-card:hover {
                    background-color: #f8f9fa;
                    border-color: #007bff !important;
                }

                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }

                .nav-link {
                    cursor: pointer;
                }
            `}</style>
        </AdminLayout>
    );
}
