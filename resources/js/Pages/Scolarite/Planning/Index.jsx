import React, { useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import SendScheduleEmailModal from "./SendScheduleEmailModal";
import AdminLayout from "@/Layouts/AdminLayout";

// Composant Card réutilisable
const Card = ({ title, icon, children, className = "" }) => (
    <div className={`card ${className}`}>
        <div className="card-header">
            <h3 className="card-title">
                {icon && <i className={`${icon} mr-2`}></i>}
                {title}
            </h3>
        </div>
        <div className="card-body">{children}</div>
    </div>
);

// Composant Alert
const Alert = ({ type = "info", children }) => (
    <div className={`alert alert-${type}`} role="alert">
        {children}
    </div>
);

export default function Index({
    schedules,
    teachers,
    classes,
    filters,
    stats,
}) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [filterTeacher, setFilterTeacher] = useState(
        filters?.teacher_id || ""
    );
    const [filterClass, setFilterClass] = useState(filters?.class_id || "");
    const [filterStatus, setFilterStatus] = useState(filters?.status || "");
    const [viewMode, setViewMode] = useState("list");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [selectedSchedules, setSelectedSchedules] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [scheduleToCancel, setScheduleToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [scheduleToComplete, setScheduleToComplete] = useState(null);
    const [startDate, setStartDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
    );
    const [completedData, setCompletedData] = useState({
        duration_hours: 0,
        notes: "",
    });

    const { delete: destroy, processing } = useForm();

    const handleSearch = () => {
        router.get(
            route("planning.index"),
            {
                search: searchTerm,
                teacher_id: filterTeacher,
                class_id: filterClass,
                status: filterStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterTeacher("");
        setFilterClass("");
        setFilterStatus("");
        router.get(route("planning.index"));
    };

    const handleDelete = (schedule) => {
        setScheduleToDelete(schedule);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (scheduleToDelete) {
            destroy(route("planning.destroy", scheduleToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setScheduleToDelete(null);
                },
            });
        }
    };

    const handleCancel = (schedule) => {
        setScheduleToCancel(schedule);
        setShowCancelModal(true);
    };

    const confirmCancel = () => {
        if (scheduleToCancel && cancelReason) {
            router.post(
                route("planning.cancel", scheduleToCancel.id),
                { reason: cancelReason },
                {
                    onSuccess: () => {
                        setShowCancelModal(false);
                        setScheduleToCancel(null);
                        setCancelReason("");
                    },
                }
            );
        }
    };

    const markAsCompleted = (schedule) => {
        const startTime = new Date(schedule.start_time);
        const endTime = new Date(schedule.end_time);
        const durationMs = endTime - startTime;

        const durationHours = parseFloat(
            (durationMs / (1000 * 60 * 60)).toFixed(2)
        );
        const durationMinutes = Math.round(durationMs / (1000 * 60));

        setScheduleToComplete(schedule);
        setCompletedData({
            duration_hours: durationHours,
            duration_minutes: durationMinutes,
        });
        setShowCompletedModal(true);
    };

    const confirmMarkCompleted = () => {
        if (scheduleToComplete) {
            console.log(scheduleToComplete);
            console.log(completedData.duration_hours);
            router.post(
                route("planning.mark-completed", scheduleToComplete.id),
                {
                    duration_hours:
                        parseFloat(
                            completedData.duration_hours
                                ?.toString()
                                .replace(",", ".")
                        ) || 0,
                    notes: completedData.notes || "",
                },
                {
                    onSuccess: () => {
                        setShowCompletedModal(false);
                        setScheduleToComplete(null);
                        setCompletedData(null);
                    },
                }
            );
        }
    };

    const toggleScheduleSelection = (scheduleId) => {
        setSelectedSchedules((prev) =>
            prev.includes(scheduleId)
                ? prev.filter((id) => id !== scheduleId)
                : [...prev, scheduleId]
        );
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: "badge-primary",
            completed: "badge-success",
            cancelled: "badge-danger",
            rescheduled: "badge-warning",
        };
        return `badge ${badges[status] || "badge-secondary"}`;
    };

    const getStatusLabel = (status) => {
        const labels = {
            scheduled: "Programmé",
            completed: "Terminé",
            cancelled: "Annulé",
            rescheduled: "Reporté",
        };
        return labels[status] || status;
    };

    const formatTime = (datetime) => {
        return new Date(datetime).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (datetime) => {
        return new Date(datetime).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const groupByDay = (schedules) => {
        const days = {
            1: { name: "Lundi", schedules: [] },
            2: { name: "Mardi", schedules: [] },
            3: { name: "Mercredi", schedules: [] },
            4: { name: "Jeudi", schedules: [] },
            5: { name: "Vendredi", schedules: [] },
            6: { name: "Samedi", schedules: [] },
            7: { name: "Dimanche", schedules: [] },
        };

        schedules.forEach((schedule) => {
            if (days[schedule.day_of_week]) {
                days[schedule.day_of_week].schedules.push(schedule);
            }
        });

        return days;
    };

    // Grouper les cours uniques avec comptage des séances
    const getUniqueSchedules = (schedules) => {
        const uniqueMap = new Map();

        schedules.forEach((schedule) => {
            const key = `${schedule.teacher_id}-${schedule.course_id}-${schedule.school_class_id}`;

            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, {
                    ...schedule,
                    sessionCount: 1,
                    sessions: [schedule],
                });
            } else {
                const existing = uniqueMap.get(key);
                existing.sessionCount++;
                existing.sessions.push(schedule);
                uniqueMap.set(key, existing);
            }
        });

        return Array.from(uniqueMap.values());
    };

    const weekSchedules = groupByDay(schedules?.data || []);
    const uniqueSchedules = getUniqueSchedules(schedules?.data || []);

    return (
        <AdminLayout>
            <Head title="Gestion des Plannings" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                                Gestion des Plannings
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Statistiques */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-info">
                                <div className="inner">
                                    <h3>{stats?.total || 0}</h3>
                                    <p>Total séances</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-calendar"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-success">
                                <div className="inner">
                                    <h3>{stats?.completed || 0}</h3>
                                    <p>Terminées</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-warning">
                                <div className="inner">
                                    <h3>{stats?.upcoming || 0}</h3>
                                    <p>À venir</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-6">
                            <div className="small-box bg-danger">
                                <div className="inner">
                                    <h3>{stats?.cancelled || 0}</h3>
                                    <p>Annulées</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-times-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Card
                        title="Actions rapides"
                        icon="fas fa-tools"
                        className="mb-4"
                    >
                        <div className="row">
                            <div className="col-md-3">
                                <Link
                                    href={route("planning.create")}
                                    className="btn btn-success btn-block btn-lg"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Programmer une séance
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <Link
                                    href={route("planning.hours-report")}
                                    className="btn btn-primary btn-block btn-lg"
                                >
                                    <i className="fas fa-chart-bar mr-2"></i>
                                    Rapport d'heures
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <Link
                                    href={route("planning.honoraire")}
                                    className="btn btn-info btn-block btn-lg"
                                >
                                    <i className="fas fa-money-bill-wave mr-2"></i>
                                    Honoraires enseignants
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <button
                                    type="button"
                                    className="btn btn-warning btn-block btn-lg"
                                    onClick={() => window.print()}
                                >
                                    <i className="fas fa-print mr-2"></i>
                                    Imprimer planning
                                </button>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-3">
                                <button
                                    type="button"
                                    className="btn btn-success btn-block btn-lg"
                                    onClick={() => setShowEmailModal(true)}
                                >
                                    <i className="fas fa-envelope mr-2"></i>
                                    Envoyer plannings
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Filtres */}
                    <Card title="Filtres" icon="fas fa-filter" className="mb-4">
                        <div className="row">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Enseignant</label>
                                    <select
                                        className="form-control"
                                        value={filterTeacher}
                                        onChange={(e) =>
                                            setFilterTeacher(e.target.value)
                                        }
                                    >
                                        <option value="">Tous</option>
                                        {teachers?.map((teacher) => (
                                            <option
                                                key={teacher.id}
                                                value={teacher.id}
                                            >
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Classe</label>
                                    <select
                                        className="form-control"
                                        value={filterClass}
                                        onChange={(e) =>
                                            setFilterClass(e.target.value)
                                        }
                                    >
                                        <option value="">Toutes</option>
                                        {classes?.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Statut</label>
                                    <select
                                        className="form-control"
                                        value={filterStatus}
                                        onChange={(e) =>
                                            setFilterStatus(e.target.value)
                                        }
                                    >
                                        <option value="">Tous</option>
                                        <option value="scheduled">
                                            Programmé
                                        </option>
                                        <option value="completed">
                                            Terminé
                                        </option>
                                        <option value="cancelled">
                                            Annulé
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <div className="btn-group w-100">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSearch}
                                    >
                                        <i className="fas fa-search mr-1"></i>
                                        Rechercher
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={clearFilters}
                                    >
                                        <i className="fas fa-times mr-1"></i>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-12">
                                <div className="btn-group">
                                    <button
                                        className={`btn ${
                                            viewMode === "list"
                                                ? "btn-primary"
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() => setViewMode("list")}
                                    >
                                        <i className="fas fa-list mr-1"></i>
                                        Liste
                                    </button>
                                    <button
                                        className={`btn ${
                                            viewMode === "week"
                                                ? "btn-primary"
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() => setViewMode("week")}
                                    >
                                        <i className="fas fa-calendar-week mr-1"></i>
                                        Semaine
                                    </button>
                                    <button
                                        className={`btn ${
                                            viewMode === "calendar"
                                                ? "btn-primary"
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() => setViewMode("calendar")}
                                    >
                                        <i className="fas fa-calendar mr-1"></i>
                                        Calendrier
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Vue Liste */}
                    {viewMode === "list" && (
                        <Card
                            title="Liste des cours programmés"
                            icon="fas fa-list"
                        >
                            {!uniqueSchedules ||
                            uniqueSchedules.length === 0 ? (
                                <Alert type="info">
                                    Aucune séance programmée.
                                </Alert>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped">
                                        <thead className="thead-dark">
                                            <tr>
                                                <th width="40">#</th>
                                                <th>Cours</th>
                                                <th>Enseignant</th>
                                                <th>Classe</th>
                                                <th className="text-center">
                                                    Nombre de séances
                                                </th>
                                                <th>Statut général</th>
                                                <th width="200">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uniqueSchedules.map(
                                                (schedule, index) => (
                                                    <tr key={`unique-${index}`}>
                                                        <td className="font-weight-bold">
                                                            {index + 1}
                                                        </td>
                                                        <td>
                                                            <strong className="text-info">
                                                                {
                                                                    schedule
                                                                        .course
                                                                        ?.name
                                                                }
                                                            </strong>
                                                        </td>
                                                        <td>
                                                            <Link
                                                                href={route(
                                                                    "planning.teacher",
                                                                    schedule.teacher_id
                                                                )}
                                                                className="text-primary teacher-link"
                                                                title="Voir le planning de cet enseignant"
                                                            >
                                                                {
                                                                    schedule
                                                                        .teacher
                                                                        ?.name
                                                                }
                                                            </Link>
                                                        </td>
                                                        <td>
                                                            <Link
                                                                href={route(
                                                                    "planning.class",
                                                                    schedule.school_class_id
                                                                )}
                                                                className="text-primary class-link"
                                                                title="Voir le planning de cette classe"
                                                            >
                                                                {
                                                                    schedule
                                                                        .school_class
                                                                        ?.name
                                                                }
                                                            </Link>
                                                        </td>
                                                        <td className="text-center">
                                                            <span
                                                                className="badge badge-primary badge-pill"
                                                                style={{
                                                                    fontSize:
                                                                        "1rem",
                                                                    padding:
                                                                        "0.5rem 0.75rem",
                                                                }}
                                                            >
                                                                {
                                                                    schedule.sessionCount
                                                                }{" "}
                                                                séance
                                                                {schedule.sessionCount >
                                                                1
                                                                    ? "s"
                                                                    : ""}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={getStatusBadge(
                                                                    schedule.status
                                                                )}
                                                            >
                                                                {getStatusLabel(
                                                                    schedule.status
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group btn-group-sm">
                                                                <a
                                                                    href={route(
                                                                        "planning.show",
                                                                        schedule.id
                                                                    )}
                                                                    className="btn btn-info"
                                                                    title="Voir détails"
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </a>
                                                                {schedule.status ===
                                                                    "scheduled" && (
                                                                    <>
                                                                        <a
                                                                            href={route(
                                                                                "planning.edit",
                                                                                schedule.id
                                                                            )}
                                                                            className="btn btn-warning"
                                                                            title="Modifier"
                                                                        >
                                                                            <i className="fas fa-edit"></i>
                                                                        </a>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-success"
                                                                            onClick={() =>
                                                                                markAsCompleted(
                                                                                    schedule
                                                                                )
                                                                            }
                                                                            title="Marquer terminé"
                                                                        >
                                                                            <i className="fas fa-check"></i>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary"
                                                                            onClick={() =>
                                                                                handleCancel(
                                                                                    schedule
                                                                                )
                                                                            }
                                                                            title="Annuler"
                                                                        >
                                                                            <i className="fas fa-ban"></i>
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            schedule
                                                                        )
                                                                    }
                                                                    title="Supprimer"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Vue Semaine */}
                    {viewMode === "week" && (
                        <Card
                            title="Planning de la semaine"
                            icon="fas fa-calendar-week"
                        >
                            <div className="row">
                                {Object.entries(weekSchedules).map(
                                    ([day, data]) => (
                                        <div
                                            key={day}
                                            className="col-md-12 mb-4"
                                        >
                                            <div className="card bg-light">
                                                <div className="card-header">
                                                    <h5 className="mb-0">
                                                        <i className="far fa-calendar mr-2"></i>
                                                        {data.name}
                                                        <span className="badge badge-primary ml-2">
                                                            {
                                                                data.schedules
                                                                    .length
                                                            }{" "}
                                                            séance(s)
                                                        </span>
                                                    </h5>
                                                </div>
                                                <div className="card-body">
                                                    {data.schedules.length ===
                                                    0 ? (
                                                        <p className="text-muted mb-0">
                                                            Aucune séance
                                                        </p>
                                                    ) : (
                                                        <div className="timeline">
                                                            {data.schedules
                                                                .sort(
                                                                    (a, b) =>
                                                                        new Date(
                                                                            a.start_time
                                                                        ) -
                                                                        new Date(
                                                                            b.start_time
                                                                        )
                                                                )
                                                                .map(
                                                                    (
                                                                        schedule
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                schedule.id
                                                                            }
                                                                            className="time-label mb-3"
                                                                        >
                                                                            <div className="d-flex align-items-start">
                                                                                <div
                                                                                    className="time-badge bg-primary"
                                                                                    style={{
                                                                                        minWidth:
                                                                                            "80px",
                                                                                    }}
                                                                                >
                                                                                    {formatTime(
                                                                                        schedule.start_time
                                                                                    )}
                                                                                </div>
                                                                                <div className="timeline-item flex-grow-1 ml-3">
                                                                                    <h6 className="mb-1">
                                                                                        {
                                                                                            schedule
                                                                                                .course
                                                                                                ?.name
                                                                                        }
                                                                                    </h6>
                                                                                    <p className="mb-1">
                                                                                        <i className="fas fa-user mr-1"></i>
                                                                                        {
                                                                                            schedule
                                                                                                .teacher
                                                                                                ?.name
                                                                                        }{" "}
                                                                                        |
                                                                                        <i className="fas fa-users ml-2 mr-1"></i>
                                                                                        {
                                                                                            schedule
                                                                                                .school_class
                                                                                                ?.name
                                                                                        }{" "}
                                                                                        |
                                                                                        <i className="fas fa-door-open ml-2 mr-1"></i>
                                                                                        {
                                                                                            schedule
                                                                                                .classroom
                                                                                                ?.name
                                                                                        }
                                                                                    </p>
                                                                                    <span
                                                                                        className={getStatusBadge(
                                                                                            schedule.status
                                                                                        )}
                                                                                    >
                                                                                        {getStatusLabel(
                                                                                            schedule.status
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Vue Calendrier */}
                    {viewMode === "calendar" && (
                        <Card title="Vue Calendrier" icon="fas fa-calendar">
                            {!schedules?.data || schedules.data.length === 0 ? (
                                <Alert type="info">
                                    Aucune séance programmée.
                                </Alert>
                            ) : (
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin]}
                                    initialView="timeGridWeek"
                                    firstDay={1}
                                    locale="fr"
                                    allDaySlot={false}
                                    slotMinTime="07:30:00"
                                    slotMaxTime="22:00:00"
                                    height="auto"
                                    events={schedules.data.map((schedule) => ({
                                        title: `${
                                            schedule.course?.name || "Cours"
                                        } - ${schedule.teacher?.name || ""}`,
                                        start: schedule.start_time,
                                        end: schedule.end_time,
                                        color:
                                            schedule.status === "completed"
                                                ? "#28a745"
                                                : schedule.status ===
                                                  "cancelled"
                                                ? "#dc3545"
                                                : "#007bff",
                                    }))}
                                    headerToolbar={{
                                        left: "prev,next today",
                                        center: "title",
                                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                                    }}
                                    buttonText={{
                                        today: "Aujourd'hui",
                                        month: "Mois",
                                        week: "Semaine",
                                        day: "Jour",
                                    }}
                                />
                            )}
                        </Card>
                    )}
                </div>
            </section>

            {/* Modal de suppression */}
            {showDeleteModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <i className="fas fa-exclamation-triangle text-warning mr-2"></i>
                                    Confirmer la suppression
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Êtes-vous sûr de vouloir supprimer cette
                                    séance ?
                                </p>
                                <div className="alert alert-info">
                                    <strong>Cours :</strong>{" "}
                                    {scheduleToDelete?.course?.name}
                                    <br />
                                    <strong>Date :</strong>{" "}
                                    {formatDate(scheduleToDelete?.start_time)}
                                    <br />
                                    <strong>Heure :</strong>{" "}
                                    {formatTime(scheduleToDelete?.start_time)} -{" "}
                                    {formatTime(scheduleToDelete?.end_time)}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-trash mr-1"></i>
                                            Supprimer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'annulation */}
            {showCancelModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <i className="fas fa-ban text-warning mr-2"></i>
                                    Annuler la séance
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowCancelModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>
                                        Raison de l'annulation{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={cancelReason}
                                        onChange={(e) =>
                                            setCancelReason(e.target.value)
                                        }
                                        placeholder="Veuillez indiquer la raison..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCancelModal(false)}
                                >
                                    Fermer
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={confirmCancel}
                                    disabled={processing || !cancelReason}
                                >
                                    {processing ? "Annulation..." : "Confirmer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal marquer terminé */}
            {showCompletedModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h4 className="modal-title">
                                    <i className="fas fa-check-circle mr-2"></i>
                                    Marquer comme terminée
                                </h4>
                                <button
                                    type="button"
                                    className="close text-white"
                                    onClick={() => setShowCompletedModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Durée (heures)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        value={
                                            completedData.duration_hours || ""
                                        }
                                        onChange={(e) =>
                                            setCompletedData({
                                                ...completedData,
                                                duration_hours: e.target.value,
                                            })
                                        }
                                    />
                                    <small className="text-muted">
                                        Exemple: 1.5 pour 1h30
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label>Notes (optionnel)</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={completedData.notes || ""}
                                        onChange={(e) =>
                                            setCompletedData({
                                                ...completedData,
                                                notes: e.target.value,
                                            })
                                        }
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCompletedModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={confirmMarkCompleted}
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Enregistrement..."
                                        : "Confirmer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'envoi d'email */}
            {showEmailModal && (
                <SendScheduleEmailModal
                    show={showEmailModal}
                    onClose={() => setShowEmailModal(false)}
                    startDate={startDate}
                    endDate={endDate}
                    teachers={teachers}
                    classes={classes}
                />
            )}

            <style>{`
                .small-box {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .table td {
                    vertical-align: middle;
                }
                .modal.show {
                    display: block !important;
                }
                .time-badge {
                    color: white;
                    padding: 8px 12px;
                    border-radius: 5px;
                    font-weight: bold;
                    text-align: center;
                }
                .timeline-item {
                    background: white;
                    padding: 15px;
                    border-radius: 5px;
                    border-left: 3px solid #007bff;
                }
                .table-active {
                    background-color: rgba(0, 123, 255, 0.075);
                }
                .btn-group-sm .btn {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.875rem;
                }
                .thead-dark th {
                    background-color: #343a40;
                    color: white;
                    font-weight: 600;
                }
                .table-hover tbody tr:hover {
                    background-color: rgba(0, 123, 255, 0.05);
                }
            `}</style>
        </AdminLayout>
    );
}
