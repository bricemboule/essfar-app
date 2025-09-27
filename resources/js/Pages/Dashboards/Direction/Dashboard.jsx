import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({
    executiveOverview,
    financialSummary,
    strategicMetrics,
    majorDecisions,
    departmentPerformance,
    riskAssessment,
    marketAnalysis,
    boardReports,
    alerts,
}) {
    const [activeView, setActiveView] = useState("executive");
    const [timeRange, setTimeRange] = useState("current_year");
    const [refreshing, setRefreshing] = useState(false);

    const refreshExecutiveData = async () => {
        setRefreshing(true);
        try {
            setTimeout(() => {
                setRefreshing(false);
            }, 2000);
        } catch (error) {
            console.error("Error refreshing executive data:", error);
            setRefreshing(false);
        }
    };

    const ExecutiveMetricCard = ({
        title,
        value,
        icon,
        color,
        trend,
        target,
        description,
        critical = false,
    }) => (
        <div className="col-lg-3 col-6">
            <div
                className={`small-box ${color} ${
                    critical ? "border border-warning border-3" : ""
                }`}
            >
                <div className="inner">
                    <h3>
                        {value}
                        {trend && (
                            <sup className="small">
                                <i
                                    className={`fas fa-arrow-${
                                        trend.direction === "up" ? "up" : "down"
                                    } ${
                                        trend.direction === "up"
                                            ? "text-success"
                                            : "text-danger"
                                    }`}
                                ></i>
                                {trend.percentage}%
                            </sup>
                        )}
                        {critical && (
                            <span className="badge badge-warning ml-1">
                                <i className="fas fa-exclamation-triangle"></i>
                            </span>
                        )}
                    </h3>
                    <p>{title}</p>
                    {target && (
                        <div
                            className="progress mt-1"
                            style={{ height: "4px" }}
                        >
                            <div
                                className={`progress-bar bg-${
                                    trend?.direction === "up"
                                        ? "success"
                                        : "warning"
                                }`}
                                style={{
                                    width: `${Math.min(
                                        (parseFloat(value) /
                                            parseFloat(target)) *
                                            100,
                                        100
                                    )}%`,
                                }}
                            ></div>
                        </div>
                    )}
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

    const StrategicDecisionCard = ({ decision, onApprove, onReview }) => (
        <div
            className={`card card-outline ${
                decision.impact === "critical"
                    ? "card-danger"
                    : decision.impact === "major"
                    ? "card-warning"
                    : decision.impact === "moderate"
                    ? "card-info"
                    : "card-primary"
            }`}
        >
            <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                    <h3 className="card-title">
                        <i className={`fas fa-${decision.icon} mr-2`}></i>
                        {decision.title}
                    </h3>
                    <div className="card-tools">
                        <span
                            className={`badge badge-${
                                decision.impact === "critical"
                                    ? "danger"
                                    : decision.impact === "major"
                                    ? "warning"
                                    : decision.impact === "moderate"
                                    ? "info"
                                    : "primary"
                            }`}
                        >
                            Impact {decision.impact.toUpperCase()}
                        </span>
                        <span className="badge badge-secondary ml-1">
                            {decision.financial_impact}
                        </span>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <p className="text-dark">{decision.description}</p>
                <div className="row">
                    <div className="col-md-6">
                        <div className="decision-metrics">
                            <div className="metric-item mb-2">
                                <small className="text-muted">
                                    Coût estimé:
                                </small>
                                <div className="font-weight-bold text-primary">
                                    {decision.estimated_cost}
                                </div>
                            </div>
                            <div className="metric-item mb-2">
                                <small className="text-muted">
                                    ROI attendu:
                                </small>
                                <div className="font-weight-bold text-success">
                                    {decision.expected_roi}
                                </div>
                            </div>
                            <div className="metric-item mb-2">
                                <small className="text-muted">
                                    Délai de mise en œuvre:
                                </small>
                                <div className="font-weight-bold">
                                    {decision.implementation_time}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="risk-assessment">
                            <small className="text-muted">
                                Analyse des risques:
                            </small>
                            <div className="risk-levels mt-1">
                                <div
                                    className={`badge badge-${
                                        decision.risk_level === "high"
                                            ? "danger"
                                            : decision.risk_level === "medium"
                                            ? "warning"
                                            : "success"
                                    } mr-1`}
                                >
                                    Risque {decision.risk_level}
                                </div>
                            </div>
                            <div className="stakeholders mt-2">
                                <small className="text-muted">
                                    Parties prenantes:
                                </small>
                                <div className="mt-1">
                                    {decision.stakeholders?.map(
                                        (stakeholder, index) => (
                                            <span
                                                key={index}
                                                className="badge badge-outline-primary mr-1"
                                            >
                                                {stakeholder}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <small className="text-muted">
                            Soumis par: <strong>{decision.submitted_by}</strong>{" "}
                            • Département:{" "}
                            <strong>{decision.department}</strong> • Date
                            limite: <strong>{decision.deadline}</strong>
                        </small>
                    </div>
                    <div className="btn-group">
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => onApprove(decision.id)}
                        >
                            <i className="fas fa-check mr-1"></i>
                            Approuver
                        </button>
                        <button
                            className="btn btn-info btn-sm"
                            onClick={() => onReview(decision.id)}
                        >
                            <i className="fas fa-search mr-1"></i>
                            Analyser
                        </button>
                        <button className="btn btn-secondary btn-sm">
                            <i className="fas fa-clock mr-1"></i>
                            Reporter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Dashboard Directeur Général">
            <Head title="Direction Générale" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-crown mr-2 text-warning"></i>
                                Direction Générale
                            </h1>
                            <p className="text-muted">
                                Vision stratégique et gouvernance
                            </p>
                        </div>
                        <div className="col-sm-6">
                            <div className="float-sm-right">
                                <button
                                    onClick={refreshExecutiveData}
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
                                    <button
                                        className={`btn btn-sm ${
                                            timeRange === "current_year"
                                                ? "btn-primary"
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() =>
                                            setTimeRange("current_year")
                                        }
                                    >
                                        Année en cours
                                    </button>
                                    <button
                                        className={`btn btn-sm ${
                                            timeRange === "comparison"
                                                ? "btn-primary"
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() =>
                                            setTimeRange("comparison")
                                        }
                                    >
                                        Comparaison
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Critical Alerts */}
                    {alerts &&
                        alerts.filter((alert) => alert.priority === "critical")
                            .length > 0 && (
                            <div className="row mb-3">
                                <div className="col-12">
                                    <div className="alert alert-danger alert-dismissible border-left-danger">
                                        <button
                                            type="button"
                                            className="close"
                                            data-dismiss="alert"
                                        >
                                            ×
                                        </button>
                                        <h5>
                                            <i className="fas fa-exclamation-triangle"></i>
                                            Alertes Critiques Nécessitant une
                                            Attention Immédiate
                                        </h5>
                                        {alerts
                                            .filter(
                                                (alert) =>
                                                    alert.priority ===
                                                    "critical"
                                            )
                                            .map((alert, index) => (
                                                <div
                                                    key={index}
                                                    className="mt-2"
                                                >
                                                    <strong>
                                                        {alert.title}:
                                                    </strong>{" "}
                                                    {alert.message}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Executive KPIs */}
                    <div className="row">
                        <ExecutiveMetricCard
                            title="Chiffre d'Affaires"
                            value={financialSummary?.revenue || "0€"}
                            icon="fas fa-euro-sign"
                            color="bg-success"
                            trend={financialSummary?.revenue_trend}
                            target={financialSummary?.revenue_target}
                            description="Objectif annuel"
                            critical={financialSummary?.revenue_critical}
                        />
                        <ExecutiveMetricCard
                            title="Rentabilité"
                            value={`${financialSummary?.profitability || 0}%`}
                            icon="fas fa-chart-line"
                            color="bg-primary"
                            trend={financialSummary?.profitability_trend}
                            description="Marge bénéficiaire"
                            critical={financialSummary?.profitability < 15}
                        />
                        <ExecutiveMetricCard
                            title="Satisfaction Globale"
                            value={`${
                                strategicMetrics?.overall_satisfaction || 0
                            }%`}
                            icon="fas fa-heart"
                            color="bg-info"
                            trend={strategicMetrics?.satisfaction_trend}
                            description="Tous stakeholders"
                        />
                        <ExecutiveMetricCard
                            title="Performance Stratégique"
                            value={`${
                                strategicMetrics?.strategic_goals_achievement ||
                                0
                            }%`}
                            icon="fas fa-bullseye"
                            color="bg-warning"
                            trend={strategicMetrics?.strategic_trend}
                            description="Objectifs atteints"
                            critical={
                                strategicMetrics?.strategic_goals_achievement <
                                70
                            }
                        />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card card-primary card-tabs">
                                <div className="card-header p-0 pt-1">
                                    <ul className="nav nav-tabs" role="tablist">
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeView === "executive"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveView("executive")
                                                }
                                                role="tab"
                                            >
                                                <i className="fas fa-tachometer-alt mr-1"></i>
                                                Vue Executive
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeView === "financial"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveView("financial")
                                                }
                                                role="tab"
                                            >
                                                <i className="fas fa-chart-pie mr-1"></i>
                                                Financier
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeView === "strategic"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveView("strategic")
                                                }
                                                role="tab"
                                            >
                                                <i className="fas fa-chess mr-1"></i>
                                                Stratégique
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    activeView === "decisions"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveView("decisions")
                                                }
                                                role="tab"
                                            >
                                                <i className="fas fa-gavel mr-1"></i>
                                                Décisions Majeures
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body">
                                    {activeView === "executive" && (
                                        <div className="executive-overview">
                                            <div className="row">
                                                <div className="col-md-8">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h3 className="card-title">
                                                                <i className="fas fa-building mr-1"></i>
                                                                Performance des
                                                                Départements
                                                            </h3>
                                                        </div>
                                                        <div className="card-body">
                                                            {departmentPerformance?.departments?.map(
                                                                (
                                                                    dept,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="department-performance-row mb-3 p-3 border rounded"
                                                                    >
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <div>
                                                                                <h5 className="mb-1">
                                                                                    {
                                                                                        dept.name
                                                                                    }
                                                                                </h5>
                                                                                <small className="text-muted">
                                                                                    Responsable:{" "}
                                                                                    {
                                                                                        dept.manager
                                                                                    }{" "}
                                                                                    •
                                                                                    Budget:{" "}
                                                                                    {
                                                                                        dept.budget
                                                                                    }{" "}
                                                                                    •
                                                                                    Équipe:{" "}
                                                                                    {
                                                                                        dept.staff_count
                                                                                    }
                                                                                </small>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div
                                                                                    className={`badge badge-lg badge-${
                                                                                        dept.performance >=
                                                                                        90
                                                                                            ? "success"
                                                                                            : dept.performance >=
                                                                                              75
                                                                                            ? "info"
                                                                                            : dept.performance >=
                                                                                              60
                                                                                            ? "warning"
                                                                                            : "danger"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        dept.performance
                                                                                    }
                                                                                    %
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-2">
                                                                            <div className="row">
                                                                                <div className="col-md-3">
                                                                                    <small className="text-muted">
                                                                                        Revenus
                                                                                    </small>
                                                                                    <div className="font-weight-bold text-success">
                                                                                        {
                                                                                            dept.revenue
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-3">
                                                                                    <small className="text-muted">
                                                                                        Efficacité
                                                                                    </small>
                                                                                    <div className="font-weight-bold">
                                                                                        {
                                                                                            dept.efficiency
                                                                                        }
                                                                                        %
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-3">
                                                                                    <small className="text-muted">
                                                                                        Satisfaction
                                                                                    </small>
                                                                                    <div className="font-weight-bold">
                                                                                        {
                                                                                            dept.satisfaction
                                                                                        }
                                                                                        %
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-3">
                                                                                    <small className="text-muted">
                                                                                        Croissance
                                                                                    </small>
                                                                                    <div
                                                                                        className={`font-weight-bold ${
                                                                                            dept.growth >
                                                                                            0
                                                                                                ? "text-success"
                                                                                                : "text-danger"
                                                                                        }`}
                                                                                    >
                                                                                        {dept.growth >
                                                                                        0
                                                                                            ? "+"
                                                                                            : ""}
                                                                                        {
                                                                                            dept.growth
                                                                                        }
                                                                                        %
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h3 className="card-title">
                                                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                                                Analyse des
                                                                Risques
                                                            </h3>
                                                        </div>
                                                        <div className="card-body">
                                                            {riskAssessment?.risks?.map(
                                                                (
                                                                    risk,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="risk-item mb-3 p-2 border-left-4 border-left-danger"
                                                                    >
                                                                        <div className="d-flex justify-content-between">
                                                                            <h6 className="font-weight-bold">
                                                                                {
                                                                                    risk.title
                                                                                }
                                                                            </h6>
                                                                            <span
                                                                                className={`badge badge-${
                                                                                    risk.level ===
                                                                                    "critical"
                                                                                        ? "danger"
                                                                                        : risk.level ===
                                                                                          "high"
                                                                                        ? "warning"
                                                                                        : risk.level ===
                                                                                          "medium"
                                                                                        ? "info"
                                                                                        : "success"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    risk.level
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-muted mb-1">
                                                                            {
                                                                                risk.description
                                                                            }
                                                                        </p>
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <small className="text-muted">
                                                                                Impact:{" "}
                                                                                {
                                                                                    risk.impact
                                                                                }{" "}
                                                                                •
                                                                                Probabilité:{" "}
                                                                                {
                                                                                    risk.probability
                                                                                }
                                                                                %
                                                                            </small>
                                                                            <button className="btn btn-outline-primary btn-xs">
                                                                                <i className="fas fa-eye"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeView === "financial" && (
                                        <div className="financial-overview">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h3 className="card-title">
                                                                <i className="fas fa-chart-bar mr-1"></i>
                                                                Résultats
                                                                Financiers
                                                            </h3>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="financial-metrics">
                                                                <div className="metric-row d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                                                    <div>
                                                                        <h6 className="mb-0">
                                                                            Chiffre
                                                                            d'Affaires
                                                                        </h6>
                                                                        <small className="text-muted">
                                                                            Total
                                                                            annuel
                                                                        </small>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="h4 text-success mb-0">
                                                                            {financialSummary?.total_revenue ||
                                                                                "0€"}
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            vs{" "}
                                                                            {financialSummary?.target_revenue ||
                                                                                "0€"}{" "}
                                                                            objectif
                                                                        </small>
                                                                    </div>
                                                                </div>

                                                                <div className="metric-row d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                                                    <div>
                                                                        <h6 className="mb-0">
                                                                            Charges
                                                                            Opérationnelles
                                                                        </h6>
                                                                        <small className="text-muted">
                                                                            Coûts
                                                                            totaux
                                                                        </small>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="h4 text-info mb-0">
                                                                            {financialSummary?.operating_costs ||
                                                                                "0€"}
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {financialSummary?.costs_percentage ||
                                                                                0}
                                                                            % du
                                                                            CA
                                                                        </small>
                                                                    </div>
                                                                </div>

                                                                <div className="metric-row d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                                                    <div>
                                                                        <h6 className="mb-0">
                                                                            Bénéfice
                                                                            Net
                                                                        </h6>
                                                                        <small className="text-muted">
                                                                            Après
                                                                            impôts
                                                                        </small>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="h4 text-primary mb-0">
                                                                            {financialSummary?.net_profit ||
                                                                                "0€"}
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            Marge:{" "}
                                                                            {financialSummary?.profit_margin ||
                                                                                0}
                                                                            %
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h3 className="card-title">
                                                                <i className="fas fa-coins mr-1"></i>
                                                                Centres de
                                                                Profit
                                                            </h3>
                                                        </div>
                                                        <div className="card-body">
                                                            {financialSummary?.profit_centers?.map(
                                                                (
                                                                    center,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="profit-center-item mb-3"
                                                                    >
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <div>
                                                                                <h6 className="mb-0">
                                                                                    {
                                                                                        center.name
                                                                                    }
                                                                                </h6>
                                                                                <small className="text-muted">
                                                                                    {
                                                                                        center.category
                                                                                    }
                                                                                </small>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div
                                                                                    className={`font-weight-bold ${
                                                                                        center.profit >
                                                                                        0
                                                                                            ? "text-success"
                                                                                            : "text-danger"
                                                                                    }`}
                                                                                >
                                                                                    {center.profit >
                                                                                    0
                                                                                        ? "+"
                                                                                        : ""}
                                                                                    {
                                                                                        center.profit
                                                                                    }
                                                                                </div>
                                                                                <small className="text-muted">
                                                                                    {
                                                                                        center.margin
                                                                                    }
                                                                                    %
                                                                                    marge
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            className="progress mt-2"
                                                                            style={{
                                                                                height: "6px",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                className={`progress-bar bg-${
                                                                                    center.performance >=
                                                                                    100
                                                                                        ? "success"
                                                                                        : center.performance >=
                                                                                          80
                                                                                        ? "info"
                                                                                        : center.performance >=
                                                                                          60
                                                                                        ? "warning"
                                                                                        : "danger"
                                                                                }`}
                                                                                style={{
                                                                                    width: `${Math.min(
                                                                                        center.performance,
                                                                                        100
                                                                                    )}%`,
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            Performance:{" "}
                                                                            {
                                                                                center.performance
                                                                            }
                                                                            % de
                                                                            l'objectif
                                                                        </small>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeView === "strategic" && (
                                        <div className="strategic-overview">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h3 className="card-title">
                                                                <i className="fas fa-chess-king mr-1"></i>
                                                                Objectifs
                                                                Stratégiques
                                                            </h3>
                                                        </div>
                                                        <div className="card-body">
                                                            {strategicMetrics?.strategic_objectives?.map(
                                                                (
                                                                    objective,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="strategic-objective mb-4 p-3 border rounded"
                                                                    >
                                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                                            <div>
                                                                                <h5 className="font-weight-bold text-primary mb-1">
                                                                                    {
                                                                                        objective.title
                                                                                    }
                                                                                </h5>
                                                                                <p className="text-muted mb-2">
                                                                                    {
                                                                                        objective.description
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <span
                                                                                    className={`badge badge-lg badge-${
                                                                                        objective.progress >=
                                                                                        90
                                                                                            ? "success"
                                                                                            : objective.progress >=
                                                                                              70
                                                                                            ? "info"
                                                                                            : objective.progress >=
                                                                                              50
                                                                                            ? "warning"
                                                                                            : "danger"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        objective.progress
                                                                                    }
                                                                                    %
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            className="progress mb-2"
                                                                            style={{
                                                                                height: "10px",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                className={`progress-bar bg-${
                                                                                    objective.progress >=
                                                                                    90
                                                                                        ? "success"
                                                                                        : objective.progress >=
                                                                                          70
                                                                                        ? "info"
                                                                                        : objective.progress >=
                                                                                          50
                                                                                        ? "warning"
                                                                                        : "danger"
                                                                                }`}
                                                                                style={{
                                                                                    width: `${objective.progress}%`,
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="col-md-3">
                                                                                <small className="text-muted">
                                                                                    Responsable
                                                                                </small>
                                                                                <div className="font-weight-bold">
                                                                                    {
                                                                                        objective.owner
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <small className="text-muted">
                                                                                    Échéance
                                                                                </small>
                                                                                <div className="font-weight-bold">
                                                                                    {
                                                                                        objective.deadline
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <small className="text-muted">
                                                                                    Budget
                                                                                    alloué
                                                                                </small>
                                                                                <div className="font-weight-bold">
                                                                                    {
                                                                                        objective.budget
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <small className="text-muted">
                                                                                    Impact
                                                                                    attendu
                                                                                </small>
                                                                                <div className="font-weight-bold text-success">
                                                                                    {
                                                                                        objective.expected_impact
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeView === "decisions" && (
                                        <div className="major-decisions">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h4>
                                                    <i className="fas fa-gavel mr-2"></i>
                                                    Décisions Stratégiques
                                                    Majeures
                                                </h4>
                                                <span className="badge badge-warning badge-lg">
                                                    {majorDecisions?.pending_count ||
                                                        0}{" "}
                                                    en attente
                                                </span>
                                            </div>
                                            {majorDecisions?.decisions?.map(
                                                (decision, index) => (
                                                    <StrategicDecisionCard
                                                        key={index}
                                                        decision={decision}
                                                        onApprove={(id) =>
                                                            console.log(
                                                                "Approve strategic decision:",
                                                                id
                                                            )
                                                        }
                                                        onReview={(id) =>
                                                            console.log(
                                                                "Review decision:",
                                                                id
                                                            )
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Executive Actions */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="fas fa-rocket mr-1"></i>
                                        Actions Exécutives
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-2">
                                            <Link
                                                href="/executive/reports"
                                                className="btn btn-app bg-primary w-100"
                                            >
                                                <i className="fas fa-chart-line"></i>
                                                Rapports Exécutifs
                                            </Link>
                                        </div>
                                        <div className="col-md-2">
                                            <Link
                                                href="/executive/budget"
                                                className="btn btn-app bg-success w-100"
                                            >
                                                <i className="fas fa-euro-sign"></i>
                                                Budget Global
                                            </Link>
                                        </div>
                                        <div className="col-md-2">
                                            <Link
                                                href="/executive/strategy"
                                                className="btn btn-app bg-info w-100"
                                            >
                                                <i className="fas fa-chess"></i>
                                                Planification
                                            </Link>
                                        </div>
                                        <div className="col-md-2">
                                            <Link
                                                href="/executive/board"
                                                className="btn btn-app bg-warning w-100"
                                            >
                                                <i className="fas fa-users"></i>
                                                Conseil Admin
                                            </Link>
                                        </div>
                                        <div className="col-md-2">
                                            <Link
                                                href="/executive/risks"
                                                className="btn btn-app bg-danger w-100"
                                            >
                                                <i className="fas fa-shield-alt"></i>
                                                Gestion Risques
                                            </Link>
                                        </div>
                                        <div className="col-md-2">
                                            <Link
                                                href="/executive/market"
                                                className="btn btn-app bg-secondary w-100"
                                            >
                                                <i className="fas fa-globe"></i>
                                                Analyse Marché
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
                .nav-link {
                    cursor: pointer;
                }

                .department-performance-row:hover {
                    background-color: #f8f9fa;
                    border-color: #007bff !important;
                }

                .risk-item {
                    transition: all 0.2s ease;
                }

                .risk-item:hover {
                    background-color: #f8f9fa;
                }

                .border-left-4 {
                    border-left-width: 4px !important;
                }

                .border-left-danger {
                    border-left-color: #dc3545 !important;
                }

                .badge-lg {
                    font-size: 1rem;
                    padding: 0.5rem 0.75rem;
                }

                .strategic-objective:hover {
                    background-color: #f8f9fa;
                    border-color: #007bff !important;
                }

                .metric-row:hover {
                    background-color: #e9ecef !important;
                }

                .profit-center-item:hover {
                    background-color: #f8f9fa;
                }

                .btn-xs {
                    padding: 0.125rem 0.25rem;
                    font-size: 0.75rem;
                    line-height: 1.5;
                    border-radius: 0.15rem;
                }

                .border-left-warning {
                    border-left: 4px solid #ffc107 !important;
                }

                .border-3 {
                    border-width: 3px !important;
                }
            `}</style>
        </AdminLayout>
    );
}
