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

export default function PlanningEnseignant({
    teacher,
    schedules,
    startDate,
    endDate,
}) {
    const [selectedDate, setSelectedDate] = useState(startDate);

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

        router.get(route("scolarite.planning.teacher", teacher.id), {
            start_date: newStart,
            end_date: newEnd,
        });
    };

    const sendScheduleEmail = () => {
        if (confirm("Envoyer le planning par email à l'enseignant ?")) {
            router.post(route("scolarite.planning.send-email"), {
                type: "teacher",
                id: teacher.id,
                start_date: startDate,
                end_date: endDate,
            });
        }
    };

    const printSchedule = () => {
        window.print();
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

    // Ajoutez cette fonction dans votre composant TeacherEarningsReport
    // À placer juste avant le return final

    const handlePrint = () => {
        // Créer une nouvelle fenêtre pour l'impression
        const printWindow = window.open("", "_blank");

        // Générer le contenu HTML à imprimer
        const printContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Honoraires Enseignants</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    color: #333;
                    padding: 20px;
                }

                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    border-radius: 8px;
                }

                .print-header h1 {
                    font-size: 24px;
                    margin-bottom: 10px;
                }

                .print-header .period {
                    font-size: 14px;
                    font-weight: bold;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;
                }

                .summary-card {
                    padding: 15px;
                    background: #f8f9fa;
                    border: 2px solid #dee2e6;
                    border-radius: 8px;
                    text-align: center;
                }

                .summary-card .value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #28a745;
                    margin-bottom: 5px;
                }

                .summary-card .label {
                    font-size: 11px;
                    color: #6c757d;
                    text-transform: uppercase;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }

                table thead {
                    background-color: #6c757d;
                    color: white;
                }

                table thead th {
                    padding: 12px 8px;
                    text-align: center;
                    font-weight: bold;
                    border: 1px solid #495057;
                }

                table tbody td {
                    padding: 10px 8px;
                    border: 1px solid #dee2e6;
                }

                table tbody tr:nth-child(even) {
                    background-color: #f8f9fa;
                }

                .text-center {
                    text-align: center;
                }

                .text-right {
                    text-align: right;
                }

                .font-bold {
                    font-weight: bold;
                }

                .badge {
                    display: inline-block;
                    padding: 4px 10px;
                    background-color: #17a2b8;
                    color: white;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: bold;
                }

                .total-row {
                    background-color: #28a745 !important;
                    color: white;
                    font-weight: bold;
                }

                .total-row td {
                    padding: 14px 8px;
                    border: 2px solid #1e7e34;
                    font-size: 13px;
                }

                .observations {
                    margin-top: 30px;
                    padding: 20px;
                    background-color: #e7f3ff;
                    border-left: 4px solid #17a2b8;
                    border-radius: 5px;
                }

                .observations h3 {
                    font-size: 16px;
                    margin-bottom: 15px;
                    color: #17a2b8;
                }

                .observations ul {
                    margin-left: 20px;
                }

                .observations li {
                    margin-bottom: 8px;
                    line-height: 1.5;
                }

                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #dee2e6;
                    text-align: center;
                    font-size: 11px;
                    color: #6c757d;
                }

                @media print {
                    body {
                        padding: 10px;
                    }
                    
                    .summary-grid {
                        page-break-inside: avoid;
                    }
                    
                    table {
                        page-break-inside: auto;
                    }
                    
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>📊 Rapport des Honoraires Enseignants</h1>
                <div class="period">
                    Période : Du ${formatDate(startDate)} au ${formatDate(
            endDate
        )}
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-card">
                    <div class="value">${formatCurrency(totalEarnings)}</div>
                    <div class="label">Total Honoraires</div>
                </div>
                <div class="summary-card">
                    <div class="value">${totalHours.toFixed(0)}h</div>
                    <div class="label">Total Heures</div>
                </div>
                <div class="summary-card">
                    <div class="value">${earnings.length}</div>
                    <div class="label">Enseignants Actifs</div>
                </div>
                <div class="summary-card">
                    <div class="value">${formatCurrency(
                        averageHourlyRate
                    )}</div>
                    <div class="label">Tarif Moyen/h</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 35%;">Enseignant</th>
                        <th style="width: 20%;">Heures effectuées</th>
                        <th style="width: 20%;">Tarif horaire moyen</th>
                        <th style="width: 20%;">Total à payer</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedEarnings
                        .map(
                            (earning, index) => `
                        <tr>
                            <td class="text-center">${index + 1}</td>
                            <td class="font-bold">${earning.name}</td>
                            <td class="text-center">
                                <span class="badge">${parseFloat(
                                    earning.total_hours
                                ).toFixed(2)} h</span>
                            </td>
                            <td class="text-center">
                                ${formatCurrency(earning.avg_hourly_rate)}
                            </td>
                            <td class="text-right font-bold">
                                ${formatCurrency(earning.total_earnings)}
                            </td>
                        </tr>
                    `
                        )
                        .join("")}
                    
                    <tr class="total-row">
                        <td colspan="2" class="text-right">TOTAL GÉNÉRAL</td>
                        <td class="text-center">${totalHours.toFixed(2)} h</td>
                        <td class="text-center">${formatCurrency(
                            averageHourlyRate
                        )}</td>
                        <td class="text-right">${formatCurrency(
                            totalEarnings
                        )}</td>
                    </tr>
                </tbody>
            </table>

            <div class="observations">
                <h3>📋 Résumé et Observations</h3>
                <ul>
                    <li>
                        <strong>Budget total :</strong> ${formatCurrency(
                            totalEarnings
                        )} 
                        versés à ${
                            earnings.length
                        } enseignant(s) pour ${totalHours.toFixed(
            0
        )} heures de cours.
                    </li>
                    <li>
                        <strong>Tarif horaire moyen :</strong> ${formatCurrency(
                            averageHourlyRate
                        )}
                    </li>
                    <li>
                        <strong>Enseignant le mieux rémunéré :</strong> 
                        ${
                            sortedEarnings.sort(
                                (a, b) =>
                                    parseFloat(b.total_earnings) -
                                    parseFloat(a.total_earnings)
                            )[0]?.name
                        } 
                        avec ${formatCurrency(
                            sortedEarnings[0]?.total_earnings
                        )}
                    </li>
                    <li>
                        <strong>Moyenne heures/enseignant :</strong> 
                        ${(totalHours / earnings.length).toFixed(1)}h
                    </li>
                    <li style="margin-top: 10px; color: #6c757d; font-weight: bold;">
                        ℹ️ Ce rapport inclut uniquement les séances marquées comme terminées durant la période sélectionnée.
                    </li>
                </ul>
            </div>

            <div class="footer">
                <p>Document généré le ${new Date().toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })}</p>
                <p>Système de Gestion Scolaire - Rapport confidentiel</p>
            </div>
        </body>
        </html>
    `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Attendre que le contenu soit chargé avant d'imprimer
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            // Optionnel: fermer la fenêtre après impression
            // printWindow.close();
        };
    };

    return (
        <AdminLayout>
            <Head title={`Planning - ${teacher.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-user-tie mr-2 text-primary"></i>
                                Planning de {teacher.name}
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
                                        href={route(
                                            "scolarite.planning.schedules.index"
                                        )}
                                    >
                                        Plannings
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    {teacher.name}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Informations enseignant */}
                    <div className="row mb-4">
                        <div className="col-md-8">
                            <Card className="card-primary card-outline">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-3 text-center">
                                            <img
                                                src={
                                                    teacher.photo_url ||
                                                    "/images/default-avatar.png"
                                                }
                                                alt={teacher.name}
                                                className="img-circle img-fluid"
                                                style={{
                                                    width: "120px",
                                                    height: "120px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                        <div className="col-md-9">
                                            <h3 className="mb-3">
                                                {teacher.name}
                                            </h3>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <p className="mb-2">
                                                        <i className="fas fa-envelope mr-2 text-muted"></i>
                                                        {teacher.email}
                                                    </p>
                                                    {teacher.telephone && (
                                                        <p className="mb-2">
                                                            <i className="fas fa-phone mr-2 text-muted"></i>
                                                            {teacher.telephone}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <p className="mb-2">
                                                        <i className="fas fa-id-badge mr-2 text-muted"></i>
                                                        Matricule:{" "}
                                                        {teacher.matricule ||
                                                            "N/A"}
                                                    </p>
                                                    <p className="mb-2">
                                                        <i className="fas fa-graduation-cap mr-2 text-muted"></i>
                                                        Spécialité:{" "}
                                                        {teacher.speciality ||
                                                            "N/A"}
                                                    </p>
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
                                        onClick={handlePrint} // Changez ici
                                    >
                                        <i className="fas fa-print mr-1"></i>
                                        Imprimer
                                    </button>
                                    <Link
                                        href={route(
                                            "scolarite.planning.schedules.index"
                                        )}
                                        className="btn btn-secondary"
                                    >
                                        <i className="fas fa-arrow-left mr-1"></i>
                                        Retour aux plannings
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Planning hebdomadaire */}
                    <Card title="Planning de la semaine" icon="fas fa-calendar">
                        {schedules.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle mr-2"></i>
                                Aucune séance programmée pour cette semaine.
                            </div>
                        ) : (
                            <div className="row">
                                {Object.entries(weekSchedules).map(
                                    ([day, data]) => (
                                        <div
                                            key={day}
                                            className="col-md-12 mb-3"
                                        >
                                            <div className="card bg-light">
                                                <div className="card-header">
                                                    <h5 className="card-title mb-0">
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
                                                                                className="schedule-item mb-3 p-3 border rounded"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        "white",
                                                                                }}
                                                                            >
                                                                                <div className="row align-items-center">
                                                                                    <div className="col-md-2">
                                                                                        <div className="time-badge bg-primary text-white text-center p-2 rounded">
                                                                                            <div
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "1.2rem",
                                                                                                    fontWeight:
                                                                                                        "bold",
                                                                                                }}
                                                                                            >
                                                                                                {formatTime(
                                                                                                    schedule.start_time
                                                                                                )}
                                                                                            </div>
                                                                                            <div
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "0.9rem",
                                                                                                }}
                                                                                            >
                                                                                                {formatTime(
                                                                                                    schedule.end_time
                                                                                                )}
                                                                                            </div>
                                                                                            <div
                                                                                                className="mt-1"
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "0.8rem",
                                                                                                }}
                                                                                            >
                                                                                                {
                                                                                                    duration
                                                                                                }{" "}
                                                                                                min
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-md-7">
                                                                                        <h5 className="mb-2">
                                                                                            <i className="fas fa-book mr-2 text-primary"></i>
                                                                                            {
                                                                                                schedule
                                                                                                    .course
                                                                                                    ?.name
                                                                                            }
                                                                                        </h5>
                                                                                        <div className="mb-1">
                                                                                            <i className="fas fa-users mr-2 text-muted"></i>
                                                                                            <strong>
                                                                                                Classe:
                                                                                            </strong>{" "}
                                                                                            {
                                                                                                schedule
                                                                                                    .school_class
                                                                                                    ?.name
                                                                                            }
                                                                                        </div>
                                                                                        <div className="mb-1">
                                                                                            <i className="fas fa-door-open mr-2 text-muted"></i>
                                                                                            <strong>
                                                                                                Salle:
                                                                                            </strong>{" "}
                                                                                            {
                                                                                                schedule
                                                                                                    .classroom
                                                                                                    ?.name
                                                                                            }
                                                                                        </div>
                                                                                        {schedule.notes && (
                                                                                            <div className="mt-2">
                                                                                                <i className="fas fa-sticky-note mr-2 text-warning"></i>
                                                                                                <em>
                                                                                                    {
                                                                                                        schedule.notes
                                                                                                    }
                                                                                                </em>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="col-md-3 text-right">
                                                                                        <div className="mb-2">
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
                                                                                                    <i className="fas fa-repeat"></i>{" "}
                                                                                                    Récurrent
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="btn-group-vertical btn-group-sm">
                                                                                            <Link
                                                                                                href={route(
                                                                                                    "scolarite.planning.schedules.show",
                                                                                                    schedule.id
                                                                                                )}
                                                                                                className="btn btn-info"
                                                                                            >
                                                                                                <i className="fas fa-eye mr-1"></i>
                                                                                                Détails
                                                                                            </Link>
                                                                                            {schedule.can_be_modified && (
                                                                                                <Link
                                                                                                    href={route(
                                                                                                        "scolarite.planning.schedules.edit",
                                                                                                        schedule.id
                                                                                                    )}
                                                                                                    className="btn btn-warning"
                                                                                                >
                                                                                                    <i className="fas fa-edit mr-1"></i>
                                                                                                    Modifier
                                                                                                </Link>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Statistiques détaillées */}
                    <div className="row">
                        <div className="col-md-6">
                            <Card
                                title="Répartition par statut"
                                icon="fas fa-chart-pie"
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
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>

                        <div className="col-md-6">
                            <Card
                                title="Répartition par cours"
                                icon="fas fa-book-open"
                            >
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Cours</th>
                                                <th className="text-right">
                                                    Séances
                                                </th>
                                                <th className="text-right">
                                                    Heures
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.values(
                                                schedules.reduce(
                                                    (acc, schedule) => {
                                                        const courseName =
                                                            schedule.course
                                                                ?.name || "N/A";
                                                        if (!acc[courseName]) {
                                                            acc[courseName] = {
                                                                name: courseName,
                                                                count: 0,
                                                                hours: 0,
                                                            };
                                                        }
                                                        acc[courseName].count++;
                                                        const duration =
                                                            (new Date(
                                                                schedule.end_time
                                                            ) -
                                                                new Date(
                                                                    schedule.start_time
                                                                )) /
                                                            (1000 * 60 * 60);
                                                        acc[courseName].hours +=
                                                            duration;
                                                        return acc;
                                                    },
                                                    {}
                                                )
                                            ).map((course, index) => (
                                                <tr key={index}>
                                                    <td>{course.name}</td>
                                                    <td className="text-right">
                                                        <span className="badge badge-primary">
                                                            {course.count}
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <strong>
                                                            {course.hours.toFixed(
                                                                2
                                                            )}
                                                            h
                                                        </strong>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .img-circle {
                    border-radius: 50%;
                    border: 3px solid #007bff;
                }

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

                .info-box-content {
                    padding: 5px 10px;
                }

                .info-box-text {
                    display: block;
                    font-size: 0.875rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .info-box-number {
                    display: block;
                    font-weight: bold;
                    font-size: 1.5rem;
                }

                .schedule-item {
                    transition: all 0.3s ease;
                    border-left: 4px solid #007bff !important;
                }

                .schedule-item:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }

                .time-badge {
                    font-weight: bold;
                }

                .timeline {
                    position: relative;
                }

                @media print {
                    .btn, .btn-group, .card-header .btn-group {
                        display: none !important;
                    }
                    
                    .content-header, .breadcrumb {
                        display: none !important;
                    }
                    
                    .schedule-item {
                        page-break-inside: avoid;
                    }
                }

                .btn-group-vertical {
                    display: flex;
                    flex-direction: column;
                }

                .btn-group-vertical .btn {
                    border-radius: 0.25rem !important;
                    margin-bottom: 0.25rem;
                }
            `}</style>
        </AdminLayout>
    );
}
