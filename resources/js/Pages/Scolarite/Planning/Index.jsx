import React, { useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import SendScheduleEmailModal from "./ModalEnvoiPlanning";
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
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filterTeacher, setFilterTeacher] = useState(
        filters.teacher_id || ""
    );
    const [filterClass, setFilterClass] = useState(filters.class_id || "");
    const [filterStatus, setFilterStatus] = useState(filters.status || "");
    const [viewMode, setViewMode] = useState("list");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [selectedSchedules, setSelectedSchedules] = useState([]);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [scheduleToCancel, setScheduleToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkAction, setBulkAction] = useState("");
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [scheduleToComplete, setScheduleToComplete] = useState(null);
    const [completedData, setCompletedData] = useState({
        hours: 0,
        minutes: 0,
        notes: "",
    });

    const { delete: destroy, processing, post } = useForm();

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
            post(
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

    const toggleScheduleSelection = (scheduleId) => {
        setSelectedSchedules((prev) =>
            prev.includes(scheduleId)
                ? prev.filter((id) => id !== scheduleId)
                : [...prev, scheduleId]
        );
    };

    const handleBulkAction = () => {
        if (selectedSchedules.length === 0) {
            alert("Veuillez sélectionner au moins une séance");
            return;
        }
        setShowBulkModal(true);
    };

    const confirmBulkAction = () => {
        post(
            route("planning.bulk-action"),
            {
                action: bulkAction,
                schedule_ids: selectedSchedules,
                reason: bulkAction === "cancel" ? cancelReason : null,
            },
            {
                onSuccess: () => {
                    setShowBulkModal(false);
                    setSelectedSchedules([]);
                    setBulkAction("");
                    setCancelReason("");
                },
            }
        );
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
            duration_hours: durationHours, // valeur par défaut, mais modifiable
            duration_minutes: durationMinutes, // optionnel
        });
        setShowCompletedModal(true);
    };

    const confirmMarkCompleted = () => {
        if (scheduleToComplete) {
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

    const parseUTCDate = (datetime) => {
        return Date.parse(datetime.split(".")[0] + "Z");
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
            timeZone: "UTC",
        });
    };

    const formatDate = (datetime) => {
        return new Date(datetime).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
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

    const weekSchedules = groupByDay(schedules.data || []);

    return (
        <AdminLayout>
            <Head title="Gestion des Plannings" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                                Gestion des Plannings de Cours
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("scolarite.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Plannings
                                </li>
                            </ol>
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
                                    <p>Total des séances</p>
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
                                    <p>Séances terminées</p>
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
                                    <p>Séances à venir</p>
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
                                    <p>Séances annulées</p>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-times-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Accès rapide aux plannings */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <Card
                                title="Planning Enseignants"
                                icon="fas fa-user-tie"
                                className="card-outline card-info"
                            >
                                <div className="form-group mb-2">
                                    <select
                                        className="form-control"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                router.visit(
                                                    route(
                                                        "planning.teacher",
                                                        e.target.value
                                                    )
                                                );
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="">
                                            -- Sélectionner un enseignant --
                                        </option>
                                        {teachers.map((teacher) => (
                                            <option
                                                key={teacher.id}
                                                value={teacher.id}
                                            >
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-muted mb-0 small">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Accédez au planning détaillé d'un enseignant
                                </p>
                            </Card>
                        </div>
                        <div className="col-md-6">
                            <Card
                                title="Planning Classes"
                                icon="fas fa-users"
                                className="card-outline card-success"
                            >
                                <div className="form-group mb-2">
                                    <select
                                        className="form-control"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                router.visit(
                                                    route(
                                                        "planning.class",
                                                        e.target.value
                                                    )
                                                );
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="">
                                            -- Sélectionner une classe --
                                        </option>
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-muted mb-0 small">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Accédez à l'emploi du temps d'une classe
                                </p>
                            </Card>
                        </div>
                    </div>
                    {/* Actions principales */}
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
                            <div className="col-md-12">
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-success"
                                        onClick={() => setShowEmailModal(true)}
                                    >
                                        <i className="fas fa-envelope mr-1"></i>
                                        Envoyer par email
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-info"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fas fa-download mr-1"></i>
                                        Exporter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Filtres */}
                    <Card
                        title="Recherche et filtres"
                        icon="fas fa-filter"
                        className="mb-4"
                    >
                        <div className="row">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Enseignant</label>
                                    <div className="input-group">
                                        <select
                                            className="form-control"
                                            value={filterTeacher}
                                            onChange={(e) =>
                                                setFilterTeacher(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Tous les enseignants
                                            </option>
                                            {teachers.map((teacher) => (
                                                <option
                                                    key={teacher.id}
                                                    value={teacher.id}
                                                >
                                                    {teacher.name}
                                                </option>
                                            ))}
                                        </select>
                                        {filterTeacher && (
                                            <div className="input-group-append">
                                                <Link
                                                    href={route(
                                                        "planning.teacher",
                                                        filterTeacher
                                                    )}
                                                    className="btn btn-info"
                                                    title="Voir le planning de cet enseignant"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Classe</label>
                                    <div className="input-group">
                                        <select
                                            className="form-control"
                                            value={filterClass}
                                            onChange={(e) =>
                                                setFilterClass(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Toutes les classes
                                            </option>
                                            {classes.map((cls) => (
                                                <option
                                                    key={cls.id}
                                                    value={cls.id}
                                                >
                                                    {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                        {filterClass && (
                                            <div className="input-group-append">
                                                <Link
                                                    href={route(
                                                        "planning.class",
                                                        filterClass
                                                    )}
                                                    className="btn btn-info"
                                                    title="Voir le planning de cette classe"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
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
                                        <option value="">
                                            Tous les statuts
                                        </option>
                                        <option value="scheduled">
                                            Programmé
                                        </option>
                                        <option value="completed">
                                            Terminé
                                        </option>
                                        <option value="cancelled">
                                            Annulé
                                        </option>
                                        <option value="rescheduled">
                                            Reporté
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <div className="form-group mb-0 w-100">
                                    <div className="btn-group w-100">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleSearch}
                                        >
                                            <i className="fas fa-search mr-1"></i>
                                            Rechercher
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={clearFilters}
                                        >
                                            <i className="fas fa-times mr-1"></i>
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sélection multiple et actions */}
                        <div className="row mt-3">
                            <div className="col-md-6">
                                {selectedSchedules.length > 0 && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-warning mr-2"
                                            onClick={handleBulkAction}
                                        >
                                            <i className="fas fa-edit mr-1"></i>
                                            Actions groupées (
                                            {selectedSchedules.length})
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-info mr-2"
                                            onClick={() =>
                                                setShowEmailModal(true)
                                            }
                                        >
                                            <i className="fas fa-envelope mr-1"></i>
                                            Envoyer sélection
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="col-md-6 text-right">
                                {selectedSchedules.length > 0 && (
                                    <span className="badge badge-primary badge-lg">
                                        {selectedSchedules.length} séance(s)
                                        sélectionnée(s)
                                    </span>
                                )}
                                <div className="row mt-3">
                                    <div className="col-md-12">
                                        <div className="btn-group">
                                            <button
                                                type="button"
                                                className={`btn ${
                                                    viewMode === "list"
                                                        ? "btn-primary"
                                                        : "btn-outline-primary"
                                                }`}
                                                onClick={() =>
                                                    setViewMode("list")
                                                }
                                            >
                                                <i className="fas fa-list mr-1"></i>
                                                Liste
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${
                                                    viewMode === "week"
                                                        ? "btn-primary"
                                                        : "btn-outline-primary"
                                                }`}
                                                onClick={() =>
                                                    setViewMode("week")
                                                }
                                            >
                                                <i className="fas fa-calendar-week mr-1"></i>
                                                Semaine
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${
                                                    viewMode === "calendar"
                                                        ? "btn-primary"
                                                        : "btn-outline-primary"
                                                }`}
                                                onClick={() =>
                                                    setViewMode("calendar")
                                                }
                                            >
                                                <i className="fas fa-calendar mr-1"></i>
                                                Calendrier
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Affichage en liste */}
                    {viewMode === "list" && (
                        <Card title="Liste des séances" icon="fas fa-list">
                            {schedules.data.length === 0 ? (
                                <Alert type="info">
                                    Aucune séance programmée pour le moment.
                                </Alert>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            id="select-all"
                                                            checked={
                                                                selectedSchedules.length ===
                                                                    schedules
                                                                        .data
                                                                        .length &&
                                                                schedules.data
                                                                    .length > 0
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    setSelectedSchedules(
                                                                        schedules.data.map(
                                                                            (
                                                                                s
                                                                            ) =>
                                                                                s.id
                                                                        )
                                                                    );
                                                                } else {
                                                                    setSelectedSchedules(
                                                                        []
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            className="custom-control-label"
                                                            htmlFor="select-all"
                                                        ></label>
                                                    </div>
                                                </th>
                                                <th>Date & Heure</th>
                                                <th>Cours</th>
                                                <th>Enseignant</th>
                                                <th>Classe</th>
                                                <th>Salle</th>
                                                <th>Statut</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedules.data.map((schedule) => (
                                                <tr
                                                    key={schedule.id}
                                                    className={
                                                        selectedSchedules.includes(
                                                            schedule.id
                                                        )
                                                            ? "table-active"
                                                            : ""
                                                    }
                                                >
                                                    <td>
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id={`select-${schedule.id}`}
                                                                checked={selectedSchedules.includes(
                                                                    schedule.id
                                                                )}
                                                                onChange={() =>
                                                                    toggleScheduleSelection(
                                                                        schedule.id
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor={`select-${schedule.id}`}
                                                            ></label>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>
                                                                {formatDate(
                                                                    schedule.start_time
                                                                )}
                                                            </strong>
                                                            <br />
                                                            <span className="text-muted">
                                                                {formatTime(
                                                                    schedule.start_time
                                                                )}{" "}
                                                                -{" "}
                                                                {formatTime(
                                                                    schedule.end_time
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {
                                                                schedule.course
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
                                                                schedule.teacher
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
                                                    <td>
                                                        <i className="fas fa-door-open mr-1"></i>
                                                        {
                                                            schedule.classroom
                                                                ?.name
                                                        }
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
                                                        {schedule.is_recurring && (
                                                            <span className="badge badge-info ml-1">
                                                                <i className="fas fa-repeat"></i>
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <Link
                                                                href={route(
                                                                    "planning.show",
                                                                    schedule.id
                                                                )}
                                                                className="btn btn-info"
                                                                title="Voir"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <Link
                                                                href={route(
                                                                    "planning.edit",
                                                                    schedule.id
                                                                )}
                                                                className="btn btn-warning"
                                                                title="Modifier"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                title="Supprimer"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        schedule
                                                                    )
                                                                }
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                            {schedule.status?.toLowerCase() ===
                                                                "scheduled" &&
                                                                new Date(
                                                                    schedule.start_time.replace(
                                                                        "Z",
                                                                        ""
                                                                    )
                                                                ) <=
                                                                    new Date() && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-success"
                                                                            title="Marquer terminé"
                                                                            onClick={() =>
                                                                                markAsCompleted(
                                                                                    schedule
                                                                                )
                                                                            }
                                                                        >
                                                                            <i className="fas fa-check"></i>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary"
                                                                            title="Annuler"
                                                                            onClick={() =>
                                                                                handleCancel(
                                                                                    schedule
                                                                                )
                                                                            }
                                                                        >
                                                                            <i className="fas fa-ban"></i>
                                                                        </button>
                                                                    </>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {schedules.last_page > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        Affichage de {schedules.from} à{" "}
                                        {schedules.to} sur {schedules.total}{" "}
                                        résultats
                                    </div>
                                    <nav>
                                        <ul className="pagination pagination-sm mb-0">
                                            {schedules.links.map(
                                                (link, index) => (
                                                    <li
                                                        key={index}
                                                        className={`page-item ${
                                                            link.active
                                                                ? "active"
                                                                : ""
                                                        } ${
                                                            !link.url
                                                                ? "disabled"
                                                                : ""
                                                        }`}
                                                    >
                                                        {link.url ? (
                                                            <Link
                                                                href={link.url}
                                                                className="page-link"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        ) : (
                                                            <span
                                                                className="page-link"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        )}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Affichage en semaine */}
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
                                                            programmée
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
                                                                                        |{" "}
                                                                                        <i className="fas fa-users mr-1"></i>
                                                                                        {
                                                                                            schedule
                                                                                                .school_class
                                                                                                ?.name
                                                                                        }{" "}
                                                                                        |{" "}
                                                                                        <i className="fas fa-door-open mr-1"></i>
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

                    {/* Affichage en calendrier */}
                    {viewMode === "calendar" && (
                        <Card title="Vue Calendrier" icon="fas fa-calendar">
                            {schedules.data.length === 0 ? (
                                <Alert type="info">
                                    Aucun planning n'a encore été enregistré.
                                </Alert>
                            ) : (
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin]}
                                    initialView="timeGridWeek"
                                    firstDay={1}
                                    locale="fr"
                                    timeZone="local"
                                    allDaySlot={false}
                                    slotMinTime="07:30:00"
                                    slotMaxTime="22:00:00"
                                    height="auto"
                                    events={schedules.data.map((schedule) => ({
                                        title: `${
                                            schedule.course?.name || "Cours"
                                        } - ${schedule.teacher?.name || ""}`,
                                        start: schedule.start_time.replace(
                                            "Z",
                                            ""
                                        ),
                                        end: schedule.end_time?.replace(
                                            "Z",
                                            ""
                                        ),
                                        color:
                                            schedule.status === "completed"
                                                ? "#28a745"
                                                : schedule.status ===
                                                  "cancelled"
                                                ? "#dc3545"
                                                : schedule.status ===
                                                  "rescheduled"
                                                ? "#ffc107"
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
                            <div className="modal-footer justify-content-between">
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
                                <p>
                                    Vous êtes sur le point d'annuler cette
                                    séance :
                                </p>
                                <div className="alert alert-info">
                                    <strong>Cours :</strong>{" "}
                                    {scheduleToCancel?.course?.name}
                                    <br />
                                    <strong>Date :</strong>{" "}
                                    {formatDate(scheduleToCancel?.start_time)}
                                    <br />
                                    <strong>Heure :</strong>{" "}
                                    {formatTime(scheduleToCancel?.start_time)} -{" "}
                                    {formatTime(scheduleToCancel?.end_time)}
                                </div>
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
                                        placeholder="Veuillez indiquer la raison de l'annulation..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer justify-content-between">
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
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Annulation...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-ban mr-1"></i>
                                            Confirmer l'annulation
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'actions groupées */}
            {showBulkModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <i className="fas fa-tasks mr-2"></i>
                                    Actions groupées
                                </h4>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowBulkModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Sélectionnez l'action à appliquer aux{" "}
                                    <strong>{selectedSchedules.length}</strong>{" "}
                                    séance(s) sélectionnée(s) :
                                </p>
                                <div className="form-group">
                                    <label>Action</label>
                                    <select
                                        className="form-control"
                                        value={bulkAction}
                                        onChange={(e) =>
                                            setBulkAction(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            -- Choisir une action --
                                        </option>
                                        <option value="complete">
                                            Marquer comme terminées
                                        </option>
                                        <option value="cancel">Annuler</option>
                                        <option value="delete">
                                            Supprimer
                                        </option>
                                    </select>
                                </div>

                                {bulkAction === "cancel" && (
                                    <div className="form-group">
                                        <label>
                                            Raison de l'annulation{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={cancelReason}
                                            onChange={(e) =>
                                                setCancelReason(e.target.value)
                                            }
                                            placeholder="Indiquez la raison de l'annulation..."
                                            required
                                        ></textarea>
                                    </div>
                                )}

                                {bulkAction && (
                                    <div className="alert alert-warning">
                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                        <strong>Attention :</strong> Cette
                                        action sera appliquée à toutes les
                                        séances sélectionnées.
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowBulkModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={confirmBulkAction}
                                    disabled={
                                        processing ||
                                        !bulkAction ||
                                        (bulkAction === "cancel" &&
                                            !cancelReason)
                                    }
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Traitement...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check mr-1"></i>
                                            Appliquer l'action
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de séance terminée */}
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
                                    Marquer la séance comme terminée
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
                                {/* Informations de la séance */}
                                <div className="alert alert-success">
                                    <h5 className="mb-3">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        Informations de la séance
                                    </h5>
                                    {/* ... ton contenu existant ... */}
                                </div>

                                {/* Saisie manuelle de la durée */}
                                <div className="card bg-light border-success mb-3">
                                    <div className="card-body">
                                        <h5>Saisir la durée effectuée</h5>
                                        <div className="row">
                                            <div className="col-md-8">
                                                <label>Heures</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min={0}
                                                    className="form-control"
                                                    value={
                                                        completedData?.duration_hours ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setCompletedData({
                                                            ...completedData,
                                                            duration_hours:
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ),
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    <strong>Attention :</strong> Cette action
                                    marquera définitivement la séance comme
                                    terminée. Les heures seront comptabilisées
                                    pour l'enseignant et le rapport d'heures du
                                    cours.
                                </div>
                            </div>

                            <div className="modal-footer justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCompletedModal(false)}
                                >
                                    <i className="fas fa-times mr-1"></i>
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success btn-lg"
                                    onClick={confirmMarkCompleted}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check-circle mr-1"></i>
                                            Confirmer - Séance terminée
                                        </>
                                    )}
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
                    type={selectedSchedules.length > 0 ? "bulk" : "general"}
                    recipients={
                        selectedSchedules.length > 0
                            ? schedules.data.filter((s) =>
                                  selectedSchedules.includes(s.id)
                              )
                            : schedules.data
                    }
                    startDate={
                        filters.week_start ||
                        new Date().toISOString().split("T")[0]
                    }
                    endDate={
                        filters.week_end ||
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split("T")[0]
                    }
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

                .btn-lg {
                    font-size: 1rem;
                    padding: 0.75rem 1.25rem;
                }

                .badge-lg {
                    font-size: 0.9rem;
                    padding: 0.5rem 0.75rem;
                }

                .time-badge {
                    color: white;
                    padding: 8px 12px;
                    border-radius: 5px;
                    font-weight: bold;
                    text-align: center;
                }

                .fc .fc-toolbar-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .fc-daygrid-event {
                    border-radius: 6px;
                    font-size: 0.9rem;
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

                .btn-group {
                    gap: 0.25rem;
                }

                .table td a.teacher-link,
.table td a.class-link {
    text-decoration: none;
    font-weight: 500;
}

.table td a.teacher-link:hover,
.table td a.class-link:hover {
    text-decoration: underline;
}

.input-group-append .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.card-outline.card-info .card-header {
    border-color: #17a2b8;
}

.card-outline.card-success .card-header {
    border-color: #28a745;
}
            `}</style>
        </AdminLayout>
    );
}
