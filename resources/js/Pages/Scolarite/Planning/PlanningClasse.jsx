import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

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

export default function PlanningClasse({
    class: schoolClass,
    schedules,
    startDate,
    endDate,
}) {
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

    const changeWeek = (direction) => {
        const current = new Date(startDate);
        const newDate = new Date(current);
        newDate.setDate(current.getDate() + direction * 7);

        const newStart = newDate.toISOString().split("T")[0];
        const endWeek = new Date(newDate);
        endWeek.setDate(newDate.getDate() + 6);
        const newEnd = endWeek.toISOString().split("T")[0];

        router.get(route("planning.class", schoolClass.id), {
            start_date: newStart,
            end_date: newEnd,
        });
    };

    const sendScheduleEmail = () => {
        if (
            confirm(
                "Envoyer le planning par email à tous les étudiants de la classe ?"
            )
        ) {
            router.post(route("planning.send-email"), {
                type: "class",
                id: schoolClass.id,
                start_date: startDate,
                end_date: endDate,
            });
        }
    };

    const exportPdf = () => {
        window.open(
            route("planning.class.export-pdf", {
                class: schoolClass.id,
                start_date: startDate,
                end_date: endDate,
            }),
            "_blank"
        );
    };

    const printSchedule = () => {
        const printWindow = window.open("", "_blank");

        const weekSchedulesArray = Object.entries(weekSchedules);

        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Planning ${schoolClass.name}</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; padding: 20px; background: #007bff; color: white; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background: #6c757d; color: white; }
                .day-cell { background: #f8f9fa; font-weight: bold; width: 120px; }
                .course-card { background: #e9ecef; padding: 10px; margin: 5px 0; border-left: 4px solid #007bff; }
                .time { color: #007bff; font-weight: bold; }
                @media print { body { padding: 10px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📅 Emploi du temps - ${schoolClass.name}</h1>
                <p>Du ${formatDate(startDate)} au ${formatDate(endDate)}</p>
            </div>
            <table>
                <thead><tr><th>Jour</th><th>Cours</th></tr></thead>
                <tbody>
                    ${weekSchedulesArray
                        .map(
                            ([day, data]) => `
                        <tr>
                            <td class="day-cell">${data.name}<br/><small>${
                                data.schedules.length
                            } cours</small></td>
                            <td>
                                ${
                                    data.schedules.length === 0
                                        ? "<em>Pas de cours</em>"
                                        : data.schedules
                                              .sort(
                                                  (a, b) =>
                                                      new Date(a.start_time) -
                                                      new Date(b.start_time)
                                              )
                                              .map(
                                                  (s) => `
                                        <div class="course-card">
                                            <div class="time">${formatTime(
                                                s.start_time
                                            )} - ${formatTime(s.end_time)}</div>
                                            <strong>${
                                                s.course?.name
                                            }</strong><br/>
                                            <small>👤 ${s.teacher?.name} | 🚪 ${
                                                      s.classroom?.name
                                                  }</small>
                                        </div>
                                    `
                                              )
                                              .join("")
                                }
                            </td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
            </table>
            <p style="text-align: center; color: #6c757d; margin-top: 30px;">
                Généré le ${new Date().toLocaleString("fr-FR")}
            </p>
        </body>
        </html>
    `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    };

    // Grouper par jour
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
            const dayOfWeek = new Date(schedule.start_time).getDay() || 7;
            if (days[dayOfWeek]) {
                days[dayOfWeek].schedules.push(schedule);
            }
        });

        return days;
    };

    const weekSchedules = groupByDay(schedules);
    const totalHours = schedules.reduce((sum, schedule) => {
        const start = new Date(schedule.start_time);
        const end = new Date(schedule.end_time);
        return sum + (end - start) / (1000 * 60 * 60);
    }, 0);

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

    // Compter les cours par matière
    const courseStats = schedules.reduce((acc, schedule) => {
        const courseName = schedule.course?.name || "N/A";
        if (!acc[courseName]) {
            acc[courseName] = { count: 0, hours: 0 };
        }
        acc[courseName].count++;
        const duration =
            (new Date(schedule.end_time) - new Date(schedule.start_time)) /
            (1000 * 60 * 60);
        acc[courseName].hours += duration;
        return acc;
    }, {});

    return (
        <AdminLayout>
            <Head title={`Planning - ${schoolClass.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-users mr-2 text-primary"></i>
                                Planning de {schoolClass.name}
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
                                    <Link href={route("planning.index")}>
                                        Plannings
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    {schoolClass.name}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Informations classe */}
                    <div className="row mb-4">
                        <div className="col-md-8">
                            <Card className="card-primary card-outline">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h3 className="mb-3">
                                                <i className="fas fa-graduation-cap mr-2"></i>
                                                {schoolClass.name}
                                            </h3>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <p className="mb-2">
                                                        <i className="fas fa-calendar-alt mr-2 text-muted"></i>
                                                        <strong>
                                                            Année académique :
                                                        </strong>{" "}
                                                        {
                                                            schoolClass
                                                                .academic_year
                                                                ?.name
                                                        }
                                                    </p>
                                                    {schoolClass.level && (
                                                        <p className="mb-2">
                                                            <i className="fas fa-layer-group mr-2 text-muted"></i>
                                                            <strong>
                                                                Niveau :
                                                            </strong>{" "}
                                                            {schoolClass.level}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    {schoolClass.capacity && (
                                                        <p className="mb-2">
                                                            <i className="fas fa-users mr-2 text-muted"></i>
                                                            <strong>
                                                                Capacité :
                                                            </strong>{" "}
                                                            {
                                                                schoolClass.capacity
                                                            }{" "}
                                                            étudiants
                                                        </p>
                                                    )}
                                                    {schoolClass.class_prefect && (
                                                        <p className="mb-2">
                                                            <i className="fas fa-user-tie mr-2 text-muted"></i>
                                                            <strong>
                                                                Délégué :
                                                            </strong>{" "}
                                                            {
                                                                schoolClass.class_prefect
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="col-md-4">
                            <div className="info-box bg-info">
                                <span className="info-box-icon">
                                    <i className="fas fa-clock"></i>
                                </span>
                                <div className="info-box-content">
                                    <span className="info-box-text">
                                        Heures cette semaine
                                    </span>
                                    <span className="info-box-number">
                                        {totalHours.toFixed(2)}h
                                    </span>
                                </div>
                            </div>

                            <div className="info-box bg-success">
                                <span className="info-box-icon">
                                    <i className="fas fa-calendar-check"></i>
                                </span>
                                <div className="info-box-content">
                                    <span className="info-box-text">
                                        Séances programmées
                                    </span>
                                    <span className="info-box-number">
                                        {schedules.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation semaine */}
                    <Card
                        title="Navigation"
                        icon="fas fa-calendar-week"
                        className="mb-4"
                    >
                        <div className="row align-items-center">
                            <div className="col-md-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => changeWeek(-1)}
                                >
                                    <i className="fas fa-chevron-left mr-2"></i>
                                    Semaine précédente
                                </button>
                            </div>
                            <div className="col-md-4 text-center">
                                <h5 className="mb-0">
                                    Du {formatDate(startDate)} au{" "}
                                    {formatDate(endDate)}
                                </h5>
                            </div>
                            <div className="col-md-4 text-right">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => changeWeek(1)}
                                >
                                    Semaine suivante
                                    <i className="fas fa-chevron-right ml-2"></i>
                                </button>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-12">
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-info"
                                        onClick={() => {
                                            router.post(
                                                route("planning.send-email"),
                                                {
                                                    type: "class",
                                                    class_id: schoolClass.id,
                                                    start_date: startDate,
                                                    end_date: endDate,
                                                    include_pdf: true,
                                                }
                                            );
                                        }}
                                    >
                                        <i className="fas fa-envelope mr-1"></i>
                                        Envoyer aux étudiants
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={exportPdf}
                                    >
                                        <i className="fas fa-file-pdf mr-1"></i>
                                        Export PDF
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        onClick={printSchedule}
                                    >
                                        <i className="fas fa-print mr-1"></i>
                                        Imprimer
                                    </button>
                                    <Link
                                        href={route("planning.index")}
                                        className="btn btn-secondary"
                                    >
                                        <i className="fas fa-arrow-left mr-1"></i>
                                        Retour aux plannings
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Planning hebdomadaire - Vue Emploi du temps */}
                    <Card
                        title="Emploi du temps de la semaine"
                        icon="fas fa-calendar"
                    >
                        {schedules.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle mr-2"></i>
                                Aucune séance programmée pour cette semaine.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered schedule-table">
                                    <thead className="thead-light">
                                        <tr>
                                            <th style={{ width: "15%" }}>
                                                Jour
                                            </th>
                                            <th>Planning des cours</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(weekSchedules).map(
                                            ([day, data]) => (
                                                <tr key={day}>
                                                    <td className="day-cell">
                                                        <div className="day-header">
                                                            <i className="far fa-calendar mr-2"></i>
                                                            <strong>
                                                                {data.name}
                                                            </strong>
                                                        </div>
                                                        <div className="day-count">
                                                            <span className="badge badge-primary">
                                                                {
                                                                    data
                                                                        .schedules
                                                                        .length
                                                                }{" "}
                                                                cours
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {data.schedules
                                                            .length === 0 ? (
                                                            <p className="text-muted mb-0 p-2">
                                                                <i className="fas fa-info-circle mr-1"></i>
                                                                Aucun cours
                                                                programmé
                                                            </p>
                                                        ) : (
                                                            <div className="courses-container">
                                                                {data.schedules
                                                                    .sort(
                                                                        (
                                                                            a,
                                                                            b
                                                                        ) =>
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
                                                                        ) => {
                                                                            const duration =
                                                                                (new Date(
                                                                                    schedule.end_time
                                                                                ) -
                                                                                    new Date(
                                                                                        schedule.start_time
                                                                                    )) /
                                                                                (1000 *
                                                                                    60);

                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        schedule.id
                                                                                    }
                                                                                    className="course-card"
                                                                                >
                                                                                    <div className="row align-items-center">
                                                                                        <div className="col-md-2">
                                                                                            <div className="time-badge-compact">
                                                                                                <div className="time-start">
                                                                                                    {formatTime(
                                                                                                        schedule.start_time
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="time-separator">
                                                                                                    -
                                                                                                </div>
                                                                                                <div className="time-end">
                                                                                                    {formatTime(
                                                                                                        schedule.end_time
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="time-duration">
                                                                                                    {
                                                                                                        duration
                                                                                                    }{" "}
                                                                                                    min
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-md-7">
                                                                                            <h6 className="mb-1 course-title">
                                                                                                <i className="fas fa-book mr-2 text-primary"></i>
                                                                                                {
                                                                                                    schedule
                                                                                                        .course
                                                                                                        ?.name
                                                                                                }
                                                                                            </h6>
                                                                                            <div className="course-details">
                                                                                                <span className="detail-item">
                                                                                                    <i className="fas fa-user-tie mr-1"></i>
                                                                                                    {
                                                                                                        schedule
                                                                                                            .teacher
                                                                                                            ?.name
                                                                                                    }
                                                                                                </span>
                                                                                                <span className="detail-item">
                                                                                                    <i className="fas fa-door-open mr-1"></i>
                                                                                                    {
                                                                                                        schedule
                                                                                                            .classroom
                                                                                                            ?.name
                                                                                                    }
                                                                                                </span>
                                                                                            </div>
                                                                                            {schedule.notes && (
                                                                                                <div className="course-notes">
                                                                                                    <i className="fas fa-sticky-note mr-1 text-warning"></i>
                                                                                                    <em>
                                                                                                        {
                                                                                                            schedule.notes
                                                                                                        }
                                                                                                    </em>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="col-md-3 text-right">
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
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    {/* Statistiques détaillées */}
                    {schedules.length > 0 && (
                        <div className="row">
                            <div className="col-md-6">
                                <Card
                                    title="Répartition par matière"
                                    icon="fas fa-chart-bar"
                                >
                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Matière</th>
                                                    <th className="text-center">
                                                        Séances
                                                    </th>
                                                    <th className="text-right">
                                                        Heures
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(courseStats)
                                                    .sort(
                                                        ([, a], [, b]) =>
                                                            b.hours - a.hours
                                                    )
                                                    .map(
                                                        ([
                                                            courseName,
                                                            stats,
                                                        ]) => (
                                                            <tr
                                                                key={courseName}
                                                            >
                                                                <td>
                                                                    <i className="fas fa-book mr-2 text-primary"></i>
                                                                    {courseName}
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className="badge badge-primary">
                                                                        {
                                                                            stats.count
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="text-right">
                                                                    <strong>
                                                                        {stats.hours.toFixed(
                                                                            2
                                                                        )}
                                                                        h
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                            </tbody>
                                            <tfoot className="thead-light">
                                                <tr>
                                                    <td>
                                                        <strong>TOTAL</strong>
                                                    </td>
                                                    <td className="text-center">
                                                        <strong className="badge badge-primary">
                                                            {schedules.length}
                                                        </strong>
                                                    </td>
                                                    <td className="text-right">
                                                        <strong>
                                                            {totalHours.toFixed(
                                                                2
                                                            )}
                                                            h
                                                        </strong>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </Card>
                            </div>

                            <div className="col-md-6">
                                <Card
                                    title="Répartition par statut"
                                    icon="fas fa-tasks"
                                >
                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <span className="badge badge-primary">
                                                            Programmé
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <strong>
                                                            {
                                                                schedules.filter(
                                                                    (s) =>
                                                                        s.status ===
                                                                        "scheduled"
                                                                ).length
                                                            }
                                                        </strong>
                                                    </td>
                                                    <td className="text-right">
                                                        <div
                                                            className="progress"
                                                            style={{
                                                                height: "20px",
                                                                width: "100px",
                                                            }}
                                                        >
                                                            <div
                                                                className="progress-bar bg-primary"
                                                                style={{
                                                                    width: `${
                                                                        (schedules.filter(
                                                                            (
                                                                                s
                                                                            ) =>
                                                                                s.status ===
                                                                                "scheduled"
                                                                        )
                                                                            .length /
                                                                            schedules.length) *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span className="badge badge-success">
                                                            Terminé
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <strong>
                                                            {
                                                                schedules.filter(
                                                                    (s) =>
                                                                        s.status ===
                                                                        "completed"
                                                                ).length
                                                            }
                                                        </strong>
                                                    </td>
                                                    <td className="text-right">
                                                        <div
                                                            className="progress"
                                                            style={{
                                                                height: "20px",
                                                                width: "100px",
                                                            }}
                                                        >
                                                            <div
                                                                className="progress-bar bg-success"
                                                                style={{
                                                                    width: `${
                                                                        (schedules.filter(
                                                                            (
                                                                                s
                                                                            ) =>
                                                                                s.status ===
                                                                                "completed"
                                                                        )
                                                                            .length /
                                                                            schedules.length) *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span className="badge badge-warning">
                                                            Reporté
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <strong>
                                                            {
                                                                schedules.filter(
                                                                    (s) =>
                                                                        s.status ===
                                                                        "rescheduled"
                                                                ).length
                                                            }
                                                        </strong>
                                                    </td>
                                                    <td className="text-right">
                                                        <div
                                                            className="progress"
                                                            style={{
                                                                height: "20px",
                                                                width: "100px",
                                                            }}
                                                        >
                                                            <div
                                                                className="progress-bar bg-warning"
                                                                style={{
                                                                    width: `${
                                                                        (schedules.filter(
                                                                            (
                                                                                s
                                                                            ) =>
                                                                                s.status ===
                                                                                "rescheduled"
                                                                        )
                                                                            .length /
                                                                            schedules.length) *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span className="badge badge-danger">
                                                            Annulé
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <strong>
                                                            {
                                                                schedules.filter(
                                                                    (s) =>
                                                                        s.status ===
                                                                        "cancelled"
                                                                ).length
                                                            }
                                                        </strong>
                                                    </td>
                                                    <td className="text-right">
                                                        <div
                                                            className="progress"
                                                            style={{
                                                                height: "20px",
                                                                width: "100px",
                                                            }}
                                                        >
                                                            <div
                                                                className="progress-bar bg-danger"
                                                                style={{
                                                                    width: `${
                                                                        (schedules.filter(
                                                                            (
                                                                                s
                                                                            ) =>
                                                                                s.status ===
                                                                                "cancelled"
                                                                        )
                                                                            .length /
                                                                            schedules.length) *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                .info-box {
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border-radius: 5px;
                    margin-bottom: 1rem;
                    min-height: 80px;
                }

                .info-box-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    width: 90px;
                }

                .schedule-table {
                    background: white;
                }

                .day-cell {
                    background-color: #f8f9fa;
                    vertical-align: middle;
                    text-align: center;
                }

                .day-header {
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }

                .day-count {
                    margin-top: 0.5rem;
                }

                .courses-container {
                    padding: 0.5rem;
                }

                .course-card {
                    background: #f8f9fa;
                    border-left: 4px solid #007bff;
                    padding: 1rem;
                    margin-bottom: 0.75rem;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .course-card:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transform: translateX(3px);
                }

                .course-card:last-child {
                    margin-bottom: 0;
                }

                .time-badge-compact {
                    background: #007bff;
                    color: white;
                    padding: 0.5rem;
                    border-radius: 5px;
                    text-align: center;
                    font-weight: bold;
                }

                .time-start, .time-end {
                    font-size: 1.1rem;
                }

                .time-separator {
                    margin: 0.2rem 0;
                    font-size: 0.9rem;
                }

                .time-duration {
                    font-size: 0.75rem;
                    margin-top: 0.3rem;
                    opacity: 0.9;
                }

                .course-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #333;
                }

                .course-details {
                    font-size: 0.875rem;
                    color: #666;
                    margin-top: 0.25rem;
                }

                .detail-item {
                    margin-right: 1rem;
                    display: inline-block;
                }

                .course-notes {
                    margin-top: 0.5rem;
                    font-size: 0.85rem;
                    color: #856404;
                    padding: 0.25rem 0.5rem;
                    background: #fff3cd;
                    border-radius: 3px;
                    display: inline-block;
                }

                @media print {
                    .btn, .btn-group, .breadcrumb, .content-header {
                        display: none !important;
                    }
                    
                    .course-card {
                        page-break-inside: avoid;
                    }
                    
                    .card {
                        page-break-inside: avoid;
                    }
                }

                .progress {
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </AdminLayout>
    );
}
