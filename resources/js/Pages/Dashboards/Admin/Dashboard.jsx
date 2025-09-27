import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({
    statistics,
    monthlyRegistrations,
    roleDistribution,
    recentUsers,
    systemStats,
    alerts,
}) {
    console.log({
        statistics,
        monthlyRegistrations,
        roleDistribution,
        recentUsers,
        systemStats,
        alerts,
    });
    const [currentStats, setCurrentStats] = useState(statistics || {});
    const [refreshing, setRefreshing] = useState(false);

    // Refresh data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshStats();
        }, 30000);

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
    }) => (
        <div className="col-lg-3 col-6">
            <div className={`small-box ${color}`}>
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
                        Plus d'infos{" "}
                        <i className="fas fa-arrow-circle-right"></i>
                    </Link>
                )}
            </div>
        </div>
    );

    const AlertCard = ({ type, title, message, time, action }) => (
        <div className={`alert alert-${type} alert-dismissible`}>
            <button type="button" className="close" data-dismiss="alert">
                ×
            </button>
            <h5>
                <i
                    className={`fas fa-${
                        type === "danger"
                            ? "ban"
                            : type === "warning"
                            ? "exclamation-triangle"
                            : "info-circle"
                    }`}
                ></i>{" "}
                {title}
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
        <AdminLayout title="Dashboard Administrateur">
            <Head title="Dashboard Admin" />

            {/* Content Header */}
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-tachometer-alt mr-2 text-primary"></i>
                                Dashboard Administrateur
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <div className="float-sm-right">
                                <button
                                    onClick={refreshStats}
                                    className={`btn btn-outline-primary btn-sm ${
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
                            title="Étudiants Inscrits"
                            value={currentStats.total_students || 0}
                            icon="fas fa-user-graduate"
                            color="bg-info"
                            change={12}
                            link="/admin/users?role=etudiant"
                            description="Actifs cette année"
                        />
                        <StatCard
                            title="Corps Enseignant"
                            value={currentStats.total_teachers || 0}
                            icon="fas fa-chalkboard-teacher"
                            color="bg-success"
                            change={5}
                            link="/admin/users?role=enseignant"
                            description="Enseignants actifs"
                        />
                        <StatCard
                            title="Personnel Admin"
                            value={currentStats.total_staff || 0}
                            icon="fas fa-users-cog"
                            color="bg-warning"
                            change={-2}
                            link="/admin/users?role=staff"
                            description="Staff administratif"
                        />
                        <StatCard
                            title="Cours Programmés"
                            value={currentStats.total_schedules_today || 0}
                            icon="fas fa-calendar-check"
                            color="bg-danger"
                            change={8}
                            link="/schedules"
                            description="Aujourd'hui"
                        />
                    </div>

                    {/* Main Dashboard Row */}
                    <div className="row">
                        {/* Left Column */}
                        <div className="col-md-8">
                            {/* Monthly Registrations Chart */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-chart-line mr-1"></i>
                                        Évolution des Inscriptions 2025
                                    </h3>
                                    <div className="card-tools">
                                        <button
                                            type="button"
                                            className="btn btn-tool"
                                            data-card-widget="collapse"
                                        >
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-tool"
                                            data-card-widget="maximize"
                                        >
                                            <i className="fas fa-expand"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div
                                        className="chart-container"
                                        style={{
                                            position: "relative",
                                            height: "300px",
                                        }}
                                    >
                                        {/* Advanced Chart with gradient bars */}
                                        <div className="d-flex align-items-end justify-content-between h-100 p-3">
                                            {monthlyRegistrations &&
                                                monthlyRegistrations.map(
                                                    (data, index) => {
                                                        const maxValue =
                                                            Math.max(
                                                                ...monthlyRegistrations.map(
                                                                    (d) =>
                                                                        d.registrations
                                                                )
                                                            );
                                                        const height = Math.max(
                                                            (data.registrations /
                                                                maxValue) *
                                                                250,
                                                            10
                                                        );
                                                        const percentage = (
                                                            (data.registrations /
                                                                maxValue) *
                                                            100
                                                        ).toFixed(0);

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="text-center position-relative"
                                                                style={{
                                                                    width: "8%",
                                                                }}
                                                            >
                                                                <div
                                                                    className="rounded mb-1 position-relative"
                                                                    style={{
                                                                        height: `${height}px`,
                                                                        background: `linear-gradient(180deg, 
                                                                    ${
                                                                        percentage >
                                                                        80
                                                                            ? "#28a745"
                                                                            : percentage >
                                                                              60
                                                                            ? "#17a2b8"
                                                                            : percentage >
                                                                              40
                                                                            ? "#ffc107"
                                                                            : "#dc3545"
                                                                    } 0%, 
                                                                    ${
                                                                        percentage >
                                                                        80
                                                                            ? "#20c997"
                                                                            : percentage >
                                                                              60
                                                                            ? "#20c997"
                                                                            : percentage >
                                                                              40
                                                                            ? "#fd7e14"
                                                                            : "#e83e8c"
                                                                    } 100%)`,
                                                                        transition:
                                                                            "all 0.5s ease",
                                                                        cursor: "pointer",
                                                                    }}
                                                                    title={`${data.month}: ${data.registrations} inscriptions (${percentage}%)`}
                                                                    onMouseEnter={(
                                                                        e
                                                                    ) => {
                                                                        e.target.style.transform =
                                                                            "scale(1.05)";
                                                                        e.target.style.boxShadow =
                                                                            "0 4px 8px rgba(0,0,0,0.2)";
                                                                    }}
                                                                    onMouseLeave={(
                                                                        e
                                                                    ) => {
                                                                        e.target.style.transform =
                                                                            "scale(1)";
                                                                        e.target.style.boxShadow =
                                                                            "none";
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="position-absolute text-white font-weight-bold"
                                                                        style={{
                                                                            top: "50%",
                                                                            left: "50%",
                                                                            transform:
                                                                                "translate(-50%, -50%)",
                                                                            fontSize:
                                                                                "10px",
                                                                        }}
                                                                    >
                                                                        {
                                                                            data.registrations
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <small className="text-muted font-weight-bold">
                                                                    {data.month}
                                                                </small>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-6">
                                            <div className="description-block">
                                                <h5 className="description-header text-success">
                                                    {monthlyRegistrations
                                                        ? monthlyRegistrations.reduce(
                                                              (sum, m) =>
                                                                  sum +
                                                                  m.registrations,
                                                              0
                                                          )
                                                        : 0}
                                                </h5>
                                                <span className="description-text">
                                                    TOTAL INSCRIPTIONS
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="description-block">
                                                <h5 className="description-header text-info">
                                                    {monthlyRegistrations
                                                        ? Math.round(
                                                              monthlyRegistrations.reduce(
                                                                  (sum, m) =>
                                                                      sum +
                                                                      m.registrations,
                                                                  0
                                                              ) /
                                                                  monthlyRegistrations.length
                                                          )
                                                        : 0}
                                                </h5>
                                                <span className="description-text">
                                                    MOYENNE MENSUELLE
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-history mr-1"></i>
                                        Activités Récentes
                                    </h3>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Utilisateur</th>
                                                    <th>Action</th>
                                                    <th>Date</th>
                                                    <th>Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentUsers &&
                                                    recentUsers.map(
                                                        (user, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    <div className="user-block">
                                                                        <img
                                                                            className="img-circle img-bordered-sm"
                                                                            src={
                                                                                user.photo_url ||
                                                                                "/images/default-avatar.png"
                                                                            }
                                                                            alt="User Image"
                                                                            width="30"
                                                                        />
                                                                        <span className="username ml-2">
                                                                            {
                                                                                user.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className="text-muted">
                                                                        <i className="fas fa-user-plus text-success mr-1"></i>
                                                                        Inscription
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">
                                                                        <i className="fas fa-clock mr-1"></i>
                                                                        {
                                                                            user.created_at
                                                                        }
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    <span className="badge badge-success">
                                                                        Actif
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <Link
                                        href="/admin/users"
                                        className="btn btn-sm btn-primary"
                                    >
                                        <i className="fas fa-eye mr-1"></i>
                                        Voir tous les utilisateurs
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-md-4">
                            {/* Role Distribution */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-users mr-1"></i>
                                        Répartition par Rôle
                                    </h3>
                                </div>
                                <div className="card-body">
                                    {roleDistribution &&
                                        roleDistribution.map((role, index) => {
                                            const colors = [
                                                "info",
                                                "success",
                                                "warning",
                                                "primary",
                                                "danger",
                                                "secondary",
                                            ];
                                            const percentage =
                                                currentStats.total_staff > 0
                                                    ? (role.count /
                                                          currentStats.total_staff) *
                                                      100
                                                    : 0;

                                            return (
                                                <div
                                                    key={index}
                                                    className="mb-3"
                                                >
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-sm font-weight-bold">
                                                            {role.role}
                                                        </span>
                                                        <span className="font-weight-bold text-primary">
                                                            {role.count} (
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
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-server mr-1"></i>
                                        État du Système
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="info-box mb-3">
                                        <span className="info-box-icon bg-success">
                                            <i className="fas fa-hdd"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Espace Disque
                                            </span>
                                            <span className="info-box-number">
                                                {systemStats &&
                                                systemStats.disk_usage
                                                    ? `${systemStats.disk_usage.used}%`
                                                    : "N/A"}
                                            </span>
                                            <div className="progress">
                                                <div
                                                    className="progress-bar bg-success"
                                                    style={{
                                                        width: `${
                                                            systemStats
                                                                ?.disk_usage
                                                                ?.used || 0
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-box mb-3">
                                        <span className="info-box-icon bg-info">
                                            <i className="fas fa-memory"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Mémoire
                                            </span>
                                            <span className="info-box-number">
                                                {systemStats?.memory_usage
                                                    ?.current || "N/A"}
                                            </span>
                                            <span className="progress-description">
                                                Peak:{" "}
                                                {systemStats?.memory_usage
                                                    ?.peak || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-box">
                                        <span className="info-box-icon bg-warning">
                                            <i className="fas fa-users"></i>
                                        </span>
                                        <div className="info-box-content">
                                            <span className="info-box-text">
                                                Sessions Actives
                                            </span>
                                            <span className="info-box-number">
                                                {systemStats?.active_sessions ||
                                                    0}
                                            </span>
                                        </div>
                                    </div>
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
                                        <div className="col-6 mb-3">
                                            <Link
                                                href="/admin/users/create"
                                                className="btn btn-app bg-success w-100"
                                            >
                                                <i className="fas fa-user-plus"></i>
                                                Utilisateur
                                            </Link>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <Link
                                                href="/schedules/create"
                                                className="btn btn-app bg-info w-100"
                                            >
                                                <i className="fas fa-calendar-plus"></i>
                                                Planning
                                            </Link>
                                        </div>
                                        <div className="col-6">
                                            <Link
                                                href="/reports"
                                                className="btn btn-app bg-warning w-100"
                                            >
                                                <i className="fas fa-chart-bar"></i>
                                                Rapports
                                            </Link>
                                        </div>
                                        <div className="col-6">
                                            <Link
                                                href="/admin/settings"
                                                className="btn btn-app bg-danger w-100"
                                            >
                                                <i className="fas fa-cogs"></i>
                                                Config
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
