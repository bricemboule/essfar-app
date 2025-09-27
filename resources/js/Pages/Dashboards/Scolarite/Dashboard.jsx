import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({
    statistics,
    weeklySchedules,
    courseDistribution,
    classroomUtilization,
    pendingEnrollments,
    scheduleNotifications,
    alerts,
}) {
    console.log({
        statistics,
        weeklySchedules,
        courseDistribution,
        classroomUtilization,
        pendingEnrollments,
        scheduleNotifications,
        alerts,
    });

    const [currentStats, setCurrentStats] = useState(statistics || {});
    const [refreshing, setRefreshing] = useState(false);

    // Refresh data every 5 minutes for schedule-related data
    useEffect(() => {
        const interval = setInterval(() => {
            refreshStats();
        }, 300000); // 5 minutes

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
        change,
        link,
        description,
        urgent = false,
    }) => (
        <div className="col-lg-3 col-6">
            <div
                className={`small-box ${color} ${
                    urgent ? "border border-warning border-2" : ""
                }`}
            >
                <div className="inner">
                    <h3>
                        {typeof value === "number"
                            ? value.toLocaleString()
                            : value}
                        {change && (
                            <sup className="small">
                                <i
                                    className={`fas fa-arrow-${
                                        change > 0 ? "up" : "down"
                                    }`}
                                ></i>
                                {Math.abs(change)}%
                            </sup>
                        )}
                        {urgent && (
                            <span className="badge badge-warning ml-1">!</span>
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
                {link && (
                    <Link href={link} className="small-box-footer">
                        Gérer <i className="fas fa-arrow-circle-right"></i>
                    </Link>
                )}
            </div>
        </div>
    );

    const AlertCard = ({ type, title, message, time, action, priority }) => (
        <div
            className={`alert alert-${type} alert-dismissible ${
                priority === "high" ? "border-left-warning" : ""
            }`}
        >
            <button type="button" className="close" data-dismiss="alert">
                ×
            </button>
            <h5>
                <i
                    className={`fas fa-${
                        type === "danger"
                            ? "exclamation-triangle"
                            : type === "warning"
                            ? "clock"
                            : type === "info"
                            ? "info-circle"
                            : "check-circle"
                    }`}
                ></i>{" "}
                {title}
                {priority === "high" && (
                    <span className="badge badge-danger ml-2">URGENT</span>
                )}
            </h5>
            {message}
            <br />
            <small className="text-muted">
                <i className="fas fa-clock mr-1"></i>
                {time}
            </small>
            {action && (
                <div className="mt-2">
                    <button className="btn btn-outline-dark btn-sm">
                        {action}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <AdminLayout title="Dashboard Chef de Scolarité">
            <Head title="Dashboard Scolarité" />

            {/* Content Header */}
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-school mr-2 text-primary"></i>
                                Tableau de Bord - Scolarité
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
                                <Link
                                    href="/schedules/create"
                                    className="btn btn-success btn-sm"
                                >
                                    <i className="fas fa-plus mr-1"></i>
                                    Nouveau Planning
                                </Link>
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
                                    <AlertCard key={index} {...alert} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="row">
                        <StatCard
                            title="Cours Aujourd'hui"
                            value={currentStats.schedules_today || 0}
                            icon="fas fa-calendar-day"
                            color="bg-info"
                            change={8}
                            link="/schedules/today"
                            description="Planifiés ce jour"
                        />
                        <StatCard
                            title="Salles Occupées"
                            value={`${currentStats.occupied_classrooms || 0}/${
                                currentStats.total_classrooms || 0
                            }`}
                            icon="fas fa-door-open"
                            color="bg-success"
                            change={12}
                            link="/classrooms"
                            description="Taux d'occupation"
                        />
                        <StatCard
                            title="Inscriptions En Attente"
                            value={currentStats.pending_enrollments || 0}
                            icon="fas fa-user-clock"
                            color="bg-warning"
                            change={-5}
                            link="/enrollments/pending"
                            description="À traiter"
                            urgent={currentStats.pending_enrollments > 10}
                        />
                        <StatCard
                            title="Modifications Planning"
                            value={currentStats.schedule_changes || 0}
                            icon="fas fa-edit"
                            color="bg-danger"
                            change={25}
                            link="/schedules/changes"
                            description="À approuver"
                            urgent={currentStats.schedule_changes > 5}
                        />
                    </div>

                    {/* Main Dashboard Row */}
                    <div className="row">
                        {/* Left Column */}
                        <div className="col-md-8">
                            {/* Weekly Schedule Overview */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-calendar-week mr-1"></i>
                                        Planning de la Semaine
                                    </h3>
                                    <div className="card-tools">
                                        <div className="btn-group">
                                            <button className="btn btn-tool btn-sm">
                                                <i className="fas fa-chevron-left"></i>
                                            </button>
                                            <button className="btn btn-tool btn-sm">
                                                Sem. {new Date().getWeek()}
                                            </button>
                                            <button className="btn btn-tool btn-sm">
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-tool"
                                            data-card-widget="maximize"
                                        >
                                            <i className="fas fa-expand"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <div className="schedule-grid">
                                        <div className="schedule-header">
                                            <div className="time-column">
                                                Heure
                                            </div>
                                            {[
                                                "Lundi",
                                                "Mardi",
                                                "Mercredi",
                                                "Jeudi",
                                                "Vendredi",
                                                "Samedi",
                                            ].map((day) => (
                                                <div
                                                    key={day}
                                                    className="day-column"
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="schedule-body">
                                            {weeklySchedules &&
                                                weeklySchedules.map(
                                                    (timeSlot, index) => (
                                                        <div
                                                            key={index}
                                                            className="schedule-row"
                                                        >
                                                            <div className="time-slot">
                                                                <strong>
                                                                    {
                                                                        timeSlot.time
                                                                    }
                                                                </strong>
                                                            </div>
                                                            {timeSlot.days.map(
                                                                (
                                                                    daySchedule,
                                                                    dayIndex
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            dayIndex
                                                                        }
                                                                        className="day-schedule"
                                                                    >
                                                                        {daySchedule.courses?.map(
                                                                            (
                                                                                course,
                                                                                courseIndex
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        courseIndex
                                                                                    }
                                                                                    className={`course-block bg-${
                                                                                        course.color ||
                                                                                        "primary"
                                                                                    } text-white`}
                                                                                    style={{
                                                                                        borderRadius:
                                                                                            "4px",
                                                                                        padding:
                                                                                            "4px 8px",
                                                                                        margin: "1px",
                                                                                        fontSize:
                                                                                            "11px",
                                                                                    }}
                                                                                    title={`${course.name} - Salle ${course.classroom} - ${course.teacher}`}
                                                                                >
                                                                                    <div className="course-name font-weight-bold">
                                                                                        {
                                                                                            course.name
                                                                                        }
                                                                                    </div>
                                                                                    <div className="course-details">
                                                                                        {
                                                                                            course.classroom
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        ) || (
                                                                            <div className="empty-slot text-muted text-center">
                                                                                <small>
                                                                                    Libre
                                                                                </small>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div className="row">
                                        <div className="col-6">
                                            <Link
                                                href="/schedules"
                                                className="btn btn-primary btn-sm"
                                            >
                                                <i className="fas fa-calendar mr-1"></i>
                                                Planning Complet
                                            </Link>
                                        </div>
                                        <div className="col-6 text-right">
                                            <small className="text-muted">
                                                Dernière mise à jour:{" "}
                                                {new Date().toLocaleTimeString()}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Enrollments */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-user-plus mr-1"></i>
                                        Inscriptions en Attente d'Approbation
                                    </h3>
                                    <div className="card-tools">
                                        <span className="badge badge-warning">
                                            {pendingEnrollments?.length || 0} en
                                            attente
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Étudiant</th>
                                                    <th>Classe Demandée</th>
                                                    <th>Date Demande</th>
                                                    <th>Motif</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingEnrollments &&
                                                pendingEnrollments.length >
                                                    0 ? (
                                                    pendingEnrollments.map(
                                                        (enrollment, index) => (
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
                                                                            enrollment.requested_class
                                                                        }
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
                                                                    <small>
                                                                        {
                                                                            enrollment.reason
                                                                        }
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group">
                                                                        <button className="btn btn-success btn-xs">
                                                                            <i className="fas fa-check"></i>
                                                                        </button>
                                                                        <button className="btn btn-danger btn-xs">
                                                                            <i className="fas fa-times"></i>
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
                                                                inscription en
                                                                attente
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
                                        className="btn btn-primary btn-sm"
                                    >
                                        <i className="fas fa-list mr-1"></i>
                                        Toutes les inscriptions
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-md-4">
                            {/* Course Distribution */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-chart-pie mr-1"></i>
                                        Répartition des Cours
                                    </h3>
                                </div>
                                <div className="card-body">
                                    {courseDistribution &&
                                        courseDistribution.map(
                                            (course, index) => {
                                                const colors = [
                                                    "primary",
                                                    "success",
                                                    "info",
                                                    "warning",
                                                    "danger",
                                                    "secondary",
                                                ];
                                                const totalHours =
                                                    courseDistribution.reduce(
                                                        (sum, c) =>
                                                            sum + c.hours,
                                                        0
                                                    );
                                                const percentage =
                                                    totalHours > 0
                                                        ? (course.hours /
                                                              totalHours) *
                                                          100
                                                        : 0;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="mb-3"
                                                    >
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-sm font-weight-bold">
                                                                {course.subject}
                                                            </span>
                                                            <span className="font-weight-bold text-primary">
                                                                {course.hours}h
                                                                (
                                                                {percentage.toFixed(
                                                                    1
                                                                )}
                                                                %)
                                                            </span>
                                                        </div>
                                                        <div className="progress progress-sm mt-1">
                                                            <div
                                                                className={`progress-bar bg-${
                                                                    colors[
                                                                        index %
                                                                            colors.length
                                                                    ]
                                                                }`}
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <small className="text-muted">
                                                            {
                                                                course.classes_count
                                                            }{" "}
                                                            classes •{" "}
                                                            {
                                                                course.teachers_count
                                                            }{" "}
                                                            enseignants
                                                        </small>
                                                    </div>
                                                );
                                            }
                                        )}
                                </div>
                            </div>

                            {/* Classroom Utilization */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-door-open mr-1"></i>
                                        Utilisation des Salles
                                    </h3>
                                </div>
                                <div className="card-body">
                                    {classroomUtilization &&
                                        classroomUtilization.map(
                                            (room, index) => (
                                                <div
                                                    key={index}
                                                    className="info-box mb-3"
                                                >
                                                    <span
                                                        className={`info-box-icon bg-${
                                                            room.utilization >
                                                            80
                                                                ? "danger"
                                                                : room.utilization >
                                                                  60
                                                                ? "warning"
                                                                : room.utilization >
                                                                  40
                                                                ? "info"
                                                                : "success"
                                                        }`}
                                                    >
                                                        <i className="fas fa-door-closed"></i>
                                                    </span>
                                                    <div className="info-box-content">
                                                        <span className="info-box-text">
                                                            {room.name}
                                                        </span>
                                                        <span className="info-box-number">
                                                            {room.utilization}%
                                                        </span>
                                                        <div className="progress">
                                                            <div
                                                                className={`progress-bar bg-${
                                                                    room.utilization >
                                                                    80
                                                                        ? "danger"
                                                                        : room.utilization >
                                                                          60
                                                                        ? "warning"
                                                                        : room.utilization >
                                                                          40
                                                                        ? "info"
                                                                        : "success"
                                                                }`}
                                                                style={{
                                                                    width: `${room.utilization}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="progress-description">
                                                            Capacité:{" "}
                                                            {room.capacity}{" "}
                                                            places
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                </div>
                                <div className="card-footer">
                                    <Link
                                        href="/classrooms"
                                        className="btn btn-info btn-sm btn-block"
                                    >
                                        <i className="fas fa-building mr-1"></i>
                                        Gérer les Salles
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Actions Scolarité */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-bolt mr-1"></i>
                                        Actions Rapides
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <Link
                                                href="/schedules/create"
                                                className="btn btn-app bg-success w-100"
                                            >
                                                <i className="fas fa-calendar-plus"></i>
                                                Nouveau Planning
                                            </Link>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <Link
                                                href="/enrollments/approve"
                                                className="btn btn-app bg-warning w-100"
                                            >
                                                <i className="fas fa-user-check"></i>
                                                Approuver
                                            </Link>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <Link
                                                href="/schedules/notifications"
                                                className="btn btn-app bg-info w-100"
                                            >
                                                <i className="fas fa-bell"></i>
                                                Notifications
                                            </Link>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <Link
                                                href="/reports/academic"
                                                className="btn btn-app bg-primary w-100"
                                            >
                                                <i className="fas fa-chart-line"></i>
                                                Rapports
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Notifications */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-bell mr-1"></i>
                                        Notifications Planning
                                    </h3>
                                    <div className="card-tools">
                                        <span className="badge badge-info">
                                            {scheduleNotifications?.length || 0}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className="card-body p-0"
                                    style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {scheduleNotifications &&
                                    scheduleNotifications.length > 0 ? (
                                        <ul className="list-group list-group-flush">
                                            {scheduleNotifications.map(
                                                (notification, index) => (
                                                    <li
                                                        key={index}
                                                        className="list-group-item"
                                                    >
                                                        <div className="d-flex justify-content-between">
                                                            <div>
                                                                <h6 className="mb-1">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </h6>
                                                                <small className="text-muted">
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </small>
                                                            </div>
                                                            <small className="text-muted">
                                                                {
                                                                    notification.time
                                                                }
                                                            </small>
                                                        </div>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-3 text-muted">
                                            <i className="fas fa-bell-slash fa-2x mb-2"></i>
                                            <div>Aucune notification</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .schedule-grid {
                    display: flex;
                    flex-direction: column;
                    background: #f8f9fa;
                }

                .schedule-header {
                    display: grid;
                    grid-template-columns: 80px repeat(6, 1fr);
                    gap: 1px;
                    background: #fff;
                    font-weight: bold;
                    text-align: center;
                    padding: 8px 0;
                    border-bottom: 2px solid #dee2e6;
                }

                .schedule-body {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .schedule-row {
                    display: grid;
                    grid-template-columns: 80px repeat(6, 1fr);
                    gap: 1px;
                    min-height: 60px;
                }

                .time-slot {
                    background: #fff;
                    padding: 8px 4px;
                    text-align: center;
                    font-size: 12px;
                    border-right: 1px solid #dee2e6;
                }

                .day-schedule {
                    background: #fff;
                    padding: 4px;
                    min-height: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .course-block {
                    border-radius: 4px !important;
                    margin: 1px 0;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .course-block:hover {
                    transform: scale(1.02);
                }

                .empty-slot {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                }

                .border-left-warning {
                    border-left: 4px solid #ffc107 !important;
                }
            `}</style>
        </AdminLayout>
    );
}

// Extension Date pour obtenir le numéro de semaine
Date.prototype.getWeek = function () {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return (
        1 +
        Math.round(
            ((date.getTime() - week1.getTime()) / 86400000 -
                3 +
                ((week1.getDay() + 6) % 7)) /
                7
        )
    );
};
