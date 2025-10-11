import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({
    statistics,
    todaySchedules,
    upcomingSchedules,
    studentEnrollments,
    classReports,
    recentNotifications,
    myTasks,
    alerts,
}) {
    console.log({
        statistics,
        todaySchedules,
        upcomingSchedules,
        studentEnrollments,
        classReports,
        recentNotifications,
        myTasks,
        alerts,
    });

    const [currentStats, setCurrentStats] = useState(statistics || {});
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            refreshStats();
        }, 120000);

        return () => clearInterval(interval);
    }, []);

    const refreshStats = async () => {
        setRefreshing(true);
        try {
            setTimeout(() => {
                setRefreshing(false);
            }, 1000);
        } catch (error) {
            console.error("Error refreshing stats:", error);
            setRefreshing(false);
        }
    };

    const StatCard = ({
        title,
        value,
        icon,
        color,
        link,
        description,
        action,
    }) => (
        <div className="col-lg-3 col-6">
            <div className={`small-box ${color}`}>
                <div className="inner">
                    <h3>
                        {typeof value === "number"
                            ? value.toLocaleString()
                            : value}
                    </h3>
                    <p>{title}</p>
                    {description && (
                        <small className="text-white-50">{description}</small>
                    )}
                </div>
                <div className="icon">
                    <i className={icon}></i>
                </div>
                {link && (
                    <Link href={link} className="small-box-footer">
                        {action || "Gérer"}{" "}
                        <i className="fas fa-arrow-circle-right"></i>
                    </Link>
                )}
            </div>
        </div>
    );

    const TaskCard = ({ task, onComplete }) => (
        <div
            className={`card card-outline card-${
                task.priority === "high"
                    ? "danger"
                    : task.priority === "medium"
                    ? "warning"
                    : "primary"
            }`}
        >
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                        <h6 className="card-title mb-1">
                            <i className={`fas fa-${task.icon} mr-2`}></i>
                            {task.title}
                        </h6>
                        <p
                            className="card-text text-muted mb-2"
                            style={{ fontSize: "13px" }}
                        >
                            {task.description}
                        </p>
                        <div className="d-flex align-items-center">
                            <span
                                className={`badge badge-${
                                    task.priority === "high"
                                        ? "danger"
                                        : task.priority === "medium"
                                        ? "warning"
                                        : "info"
                                } mr-2`}
                            >
                                {task.priority === "high"
                                    ? "Urgent"
                                    : task.priority === "medium"
                                    ? "Important"
                                    : "Normal"}
                            </span>
                            <small className="text-muted">
                                <i className="fas fa-clock mr-1"></i>
                                {task.deadline}
                            </small>
                        </div>
                    </div>
                    <div className="ml-2">
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => onComplete(task.id)}
                        >
                            <i className="fas fa-check"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const ScheduleCard = ({ schedule }) => (
        <div className="schedule-item mb-2 p-3 border rounded">
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <h6 className="mb-1 font-weight-bold text-primary">
                        {schedule.course_name}
                    </h6>
                    <div className="text-muted">
                        <small>
                            <i className="fas fa-clock mr-1"></i>
                            {schedule.start_time} - {schedule.end_time}
                        </small>
                        <br />
                        <small>
                            <i className="fas fa-door-open mr-1"></i>
                            {schedule.classroom}
                        </small>
                        <br />
                        <small>
                            <i className="fas fa-users mr-1"></i>
                            {schedule.students_count} étudiants
                        </small>
                    </div>
                </div>
                <div className="text-right">
                    <span
                        className={`badge badge-${
                            schedule.status === "active"
                                ? "success"
                                : schedule.status === "cancelled"
                                ? "danger"
                                : "warning"
                        }`}
                    >
                        {schedule.status === "active"
                            ? "Actif"
                            : schedule.status === "cancelled"
                            ? "Annulé"
                            : "En attente"}
                    </span>
                    <div className="mt-1">
                        <div className="btn-group">
                            <button className="btn btn-outline-primary btn-xs">
                                <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn btn-outline-info btn-xs">
                                <i className="fas fa-bell"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Dashboard Gestionnaire Scolarité">
            <Head title="Gestionnaire Scolarité" />

            {/* Content Header */}
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-tasks mr-2 text-primary"></i>
                                Gestionnaire de Scolarité
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <div className="float-sm-right">
                                <button
                                    onClick={refreshStats}
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
                                        href="/schedules/create"
                                        className="btn btn-success btn-sm"
                                    >
                                        <i className="fas fa-plus mr-1"></i>
                                        Créer Planning
                                    </Link>
                                    <Link
                                        href="/notifications/send"
                                        className="btn btn-info btn-sm"
                                    >
                                        <i className="fas fa-paper-plane mr-1"></i>
                                        Notification
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <section className="content">
                <div className="container-fluid">
                    {/* Alerts Section */}
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

                    {/* Statistics Cards */}
                    <div className="row">
                        <StatCard
                            title="Plannings Aujourd'hui"
                            value={currentStats.schedules_today || 0}
                            icon="fas fa-calendar-day"
                            color="bg-info"
                            link="/schedules/today"
                            description="Cours programmés"
                            action="Consulter"
                        />
                        <StatCard
                            title="Nouvelles Inscriptions"
                            value={currentStats.new_enrollments || 0}
                            icon="fas fa-user-plus"
                            color="bg-success"
                            link="/enrollments"
                            description="Cette semaine"
                            action="Traiter"
                        />
                        <StatCard
                            title="Tâches En Cours"
                            value={currentStats.pending_tasks || 0}
                            icon="fas fa-clipboard-list"
                            color="bg-warning"
                            link="#tasks"
                            description="À compléter"
                            action="Voir"
                        />
                        <StatCard
                            title="Notifications Envoyées"
                            value={currentStats.notifications_sent || 0}
                            icon="fas fa-paper-plane"
                            color="bg-primary"
                            link="/notifications"
                            description="Aujourd'hui"
                            action="Historique"
                        />
                    </div>

                    {/* Main Dashboard Row */}
                    <div className="row">
                        {/* Left Column */}
                        <div className="col-md-8">
                            {/* Today's Schedule */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-calendar-day mr-1"></i>
                                        Planning d'Aujourd'hui
                                    </h3>
                                    <div className="card-tools">
                                        <span className="badge badge-info">
                                            {todaySchedules?.length || 0} cours
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-tool"
                                            data-card-widget="maximize"
                                        >
                                            <i className="fas fa-expand"></i>
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className="card-body"
                                    style={{
                                        maxHeight: "400px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {todaySchedules &&
                                    todaySchedules.length > 0 ? (
                                        <div className="timeline">
                                            {todaySchedules.map(
                                                (schedule, index) => (
                                                    <div
                                                        key={index}
                                                        className="time-label"
                                                    >
                                                        <ScheduleCard
                                                            schedule={schedule}
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <i className="fas fa-calendar-times fa-3x mb-3"></i>
                                            <div>
                                                Aucun cours programmé
                                                aujourd'hui
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer">
                                    <div className="row">
                                        <div className="col-6">
                                            <Link
                                                href="/schedules/create"
                                                className="btn btn-primary btn-sm"
                                            >
                                                <i className="fas fa-plus mr-1"></i>
                                                Ajouter Cours
                                            </Link>
                                        </div>
                                        <div className="col-6 text-right">
                                            <Link
                                                href="/schedules"
                                                className="btn btn-outline-secondary btn-sm"
                                            >
                                                <i className="fas fa-calendar mr-1"></i>
                                                Tous les plannings
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Student Enrollments Management */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-users mr-1"></i>
                                        Gestion des Inscriptions
                                    </h3>
                                    <div className="card-tools">
                                        <span className="badge badge-success">
                                            {studentEnrollments?.length || 0}{" "}
                                            inscriptions
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Étudiant</th>
                                                    <th>Classe</th>
                                                    <th>Statut</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentEnrollments &&
                                                studentEnrollments.length >
                                                    0 ? (
                                                    studentEnrollments
                                                        .slice(0, 8)
                                                        .map(
                                                            (
                                                                enrollment,
                                                                index
                                                            ) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        <div className="user-block">
                                                                            <img
                                                                                className="img-circle img-bordered-sm"
                                                                                src={
                                                                                    enrollment
                                                                                        .student
                                                                                        .photo_url ||
                                                                                    "/images/default-avatar.png"
                                                                                }
                                                                                alt="Student"
                                                                                width="30"
                                                                            />
                                                                            <span className="username ml-2">
                                                                                {
                                                                                    enrollment
                                                                                        .student
                                                                                        .name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge badge-info">
                                                                            {
                                                                                enrollment.class_name
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className={`badge badge-${
                                                                                enrollment.status ===
                                                                                "completed"
                                                                                    ? "success"
                                                                                    : enrollment.status ===
                                                                                      "pending"
                                                                                    ? "warning"
                                                                                    : "secondary"
                                                                            }`}
                                                                        >
                                                                            {enrollment.status ===
                                                                            "completed"
                                                                                ? "Complète"
                                                                                : enrollment.status ===
                                                                                  "pending"
                                                                                ? "En attente"
                                                                                : "Brouillon"}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <small className="text-muted">
                                                                            {
                                                                                enrollment.created_at
                                                                            }
                                                                        </small>
                                                                    </td>
                                                                    <td>
                                                                        <div className="btn-group">
                                                                            <button
                                                                                className="btn btn-primary btn-xs"
                                                                                title="Modifier"
                                                                            >
                                                                                <i className="fas fa-edit"></i>
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-info btn-xs"
                                                                                title="Détails"
                                                                            >
                                                                                <i className="fas fa-eye"></i>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            className="text-center text-muted py-3"
                                                        >
                                                            <i className="fas fa-inbox fa-2x mb-2"></i>
                                                            <div>
                                                                Aucune
                                                                inscription
                                                                récente
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <Link
                                        href="/enrollments"
                                        className="btn btn-success btn-sm"
                                    >
                                        <i className="fas fa-list mr-1"></i>
                                        Toutes les inscriptions
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-md-4">
                            {/* My Tasks */}
                            <div className="card" id="tasks">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-tasks mr-1"></i>
                                        Mes Tâches
                                    </h3>
                                    <div className="card-tools">
                                        <span className="badge badge-warning">
                                            {myTasks?.filter(
                                                (t) => !t.completed
                                            ).length || 0}{" "}
                                            en attente
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className="card-body p-2"
                                    style={{
                                        maxHeight: "350px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {myTasks && myTasks.length > 0 ? (
                                        myTasks
                                            .filter((task) => !task.completed)
                                            .map((task, index) => (
                                                <TaskCard
                                                    key={index}
                                                    task={task}
                                                    onComplete={(taskId) =>
                                                        console.log(
                                                            "Complete task:",
                                                            taskId
                                                        )
                                                    }
                                                />
                                            ))
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <i className="fas fa-check-circle fa-3x mb-3 text-success"></i>
                                            <div>
                                                Toutes les tâches sont terminées
                                                !
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Schedules */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-clock mr-1"></i>
                                        Prochains Cours
                                    </h3>
                                </div>
                                <div
                                    className="card-body p-2"
                                    style={{
                                        maxHeight: "300px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {upcomingSchedules &&
                                    upcomingSchedules.length > 0 ? (
                                        upcomingSchedules
                                            .slice(0, 5)
                                            .map((schedule, index) => (
                                                <div
                                                    key={index}
                                                    className="upcoming-schedule mb-2 p-2 border-left border-primary"
                                                >
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <h6 className="mb-1">
                                                                {
                                                                    schedule.course_name
                                                                }
                                                            </h6>
                                                            <small className="text-muted">
                                                                {schedule.date}{" "}
                                                                à{" "}
                                                                {
                                                                    schedule.start_time
                                                                }
                                                            </small>
                                                        </div>
                                                        <div className="text-right">
                                                            <small className="badge badge-outline-primary">
                                                                {
                                                                    schedule.classroom
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-center py-3 text-muted">
                                            <i className="fas fa-calendar-check fa-2x mb-2"></i>
                                            <div>Aucun cours programmé</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Class Reports */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-chart-bar mr-1"></i>
                                        Rapports de Classes
                                    </h3>
                                </div>
                                <div className="card-body">
                                    {classReports && classReports.length > 0 ? (
                                        classReports
                                            .slice(0, 4)
                                            .map((report, index) => (
                                                <div
                                                    key={index}
                                                    className="info-box mb-2"
                                                >
                                                    <span className="info-box-icon bg-info">
                                                        <i className="fas fa-users"></i>
                                                    </span>
                                                    <div className="info-box-content">
                                                        <span className="info-box-text">
                                                            {report.class_name}
                                                        </span>
                                                        <span className="info-box-number">
                                                            {
                                                                report.student_count
                                                            }
                                                        </span>
                                                        <div className="progress">
                                                            <div
                                                                className="progress-bar bg-info"
                                                                style={{
                                                                    width: `${
                                                                        (report.student_count /
                                                                            report.capacity) *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="progress-description">
                                                            {report.capacity}{" "}
                                                            places max
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-center py-3 text-muted">
                                            <i className="fas fa-chart-bar fa-2x mb-2"></i>
                                            <div>Aucun rapport disponible</div>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer">
                                    <Link
                                        href="/reports/classes"
                                        className="btn btn-info btn-sm btn-block"
                                    >
                                        <i className="fas fa-chart-line mr-1"></i>
                                        Tous les rapports
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-bolt mr-1"></i>
                                        Actions Rapides
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-6 mb-2">
                                            <Link
                                                href="/schedules/create"
                                                className="btn btn-app bg-success w-100"
                                            >
                                                <i className="fas fa-calendar-plus"></i>
                                                Planning
                                            </Link>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <Link
                                                href="/enrollments/new"
                                                className="btn btn-app bg-info w-100"
                                            >
                                                <i className="fas fa-user-plus"></i>
                                                Inscription
                                            </Link>
                                        </div>
                                        <div className="col-6">
                                            <Link
                                                href="/notifications/send"
                                                className="btn btn-app bg-primary w-100"
                                            >
                                                <i className="fas fa-paper-plane"></i>
                                                Notification
                                            </Link>
                                        </div>
                                        <div className="col-6">
                                            <Link
                                                href="/schedules/update"
                                                className="btn btn-app bg-warning w-100"
                                            >
                                                <i className="fas fa-edit"></i>
                                                Modifier
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
                .schedule-item {
                    transition: all 0.2s ease;
                }

                .schedule-item:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .upcoming-schedule {
                    transition: all 0.2s ease;
                }

                .upcoming-schedule:hover {
                    background-color: #f8f9fa;
                }

                .btn-xs {
                    padding: 0.25rem 0.4rem;
                    font-size: 0.75rem;
                    line-height: 1.5;
                    border-radius: 0.2rem;
                }

                .badge-outline-primary {
                    color: #007bff;
                    border: 1px solid #007bff;
                    background-color: transparent;
                }
            `}</style>
        </AdminLayout>
    );
}
