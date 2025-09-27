import React, { useState, useEffect } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";

export default function AdminLayout({ children, title = "Dashboard" }) {
    const { auth, menu, flash, permissions } = usePage().props;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Initialize AdminLTE features after component mount
        if (window.$ && window.AdminLTE) {
            // Initialize tooltips
            window.$('[data-toggle="tooltip"]').tooltip();

            // Initialize overlay scrollbars
            if (window.$.fn.overlayScrollbars) {
                window.$(".sidebar .nav-sidebar").overlayScrollbars({
                    scrollbars: {
                        autoHide: "leave",
                        autoHideDelay: 800,
                    },
                });
            }
        }
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
        document.body.classList.toggle("sidebar-collapse");
    };

    const toggleSubmenu = (index) => {
        setOpenMenus((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const getRoleDisplayName = (role) => {
        const roles = {
            etudiant: "Étudiant",
            enseignant: "Enseignant",
            chef_scolarite: "Chef Scolarité",
            gestionnaire_scolarite: "Gestionnaire Scolarité",
            directeur_academique: "Directeur Académique",
            directeur_general: "Directeur Général",
            comptable: "Comptable",
            communication: "Communication",
            admin: "Administrateur",
        };
        return roles[role] || role;
    };

    const getRoleBadgeClass = (role) => {
        return `role-${role}`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    };

    const handleLogout = (e) => {
        e.preventDefault();
        if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
            router.post(route("logout"));
        }
    };

    return (
        <>
            <Head title={`${title} - ESSFAR`} />

            <div
                className={`wrapper ${
                    sidebarCollapsed ? "sidebar-collapse" : ""
                }`}
            >
                {/* Preloader */}
                <div
                    className="preloader flex-column justify-content-center align-items-center"
                    style={{ display: "none" }}
                >
                    <img
                        className="animation__shake"
                        src="/Images/Logo.jpeg"
                        alt="ESSFAR Logo"
                        height="60"
                        width="60"
                    />
                    <h4 className="mt-2 text-white">ESSFAR</h4>
                </div>

                {/* Navbar */}
                <nav className="main-header navbar navbar-expand navbar-white navbar-light">
                    {/* Left navbar links */}
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link"
                                onClick={toggleSidebar}
                                style={{ border: "none", background: "none" }}
                            >
                                <i className="fas fa-bars"></i>
                            </button>
                        </li>
                        <li className="nav-item d-none d-sm-inline-block">
                            <Link href="/" className="nav-link">
                                <i className="fas fa-home mr-1"></i>
                                Accueil
                            </Link>
                        </li>
                    </ul>

                    {/* Center - Date and Time */}
                    <div className="navbar-nav mx-auto d-none d-md-block">
                        <div className="nav-item text-center">
                            <div
                                className="text-sm text-muted"
                                id="current-date"
                            >
                                {formatDate(currentTime)}
                            </div>
                            <div className="font-weight-bold" id="current-time">
                                {formatTime(currentTime)}
                            </div>
                        </div>
                    </div>

                    {/* Right navbar links */}
                    <ul className="navbar-nav ml-auto">
                        {/* Notifications */}
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link"
                                data-toggle="dropdown"
                                href="#"
                            >
                                <i className="far fa-bell"></i>
                                <span className="badge badge-warning navbar-badge">
                                    3
                                </span>
                            </a>
                            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                                <span className="dropdown-item dropdown-header">
                                    3 Notifications
                                </span>
                                <div className="dropdown-divider"></div>
                                <a href="#" className="dropdown-item">
                                    <i className="fas fa-calendar mr-2"></i>{" "}
                                    Nouveau cours programmé
                                    <span className="float-right text-muted text-sm">
                                        Il y a 3 min
                                    </span>
                                </a>
                                <div className="dropdown-divider"></div>
                                <a href="#" className="dropdown-item">
                                    <i className="fas fa-users mr-2"></i> 5
                                    nouveaux étudiants
                                    <span className="float-right text-muted text-sm">
                                        Il y a 12 min
                                    </span>
                                </a>
                                <div className="dropdown-divider"></div>
                                <a
                                    href="#"
                                    className="dropdown-item dropdown-footer"
                                >
                                    Voir toutes les notifications
                                </a>
                            </div>
                        </li>

                        {/* User Menu */}
                        <li className="nav-item dropdown user-menu">
                            <a
                                href="#"
                                className="nav-link dropdown-toggle"
                                data-toggle="dropdown"
                            >
                                <img
                                    src={"/Images/ia.jpeg"}
                                    className="user-image img-circle elevation-2"
                                    alt="User Image"
                                />
                                <span className="d-none d-md-inline">
                                    {auth.user.name}
                                </span>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                                {/* User image */}
                                <li className="user-header bg-primary">
                                    <img
                                        src={"/Images/ia.jpeg"}
                                        className="img-circle elevation-2"
                                        alt="User Image"
                                    />
                                    <p>
                                        {auth.user.name}
                                        <small
                                            className={`badge ${getRoleBadgeClass(
                                                auth.user.role
                                            )} mt-1`}
                                        >
                                            {getRoleDisplayName(auth.user.role)}
                                        </small>
                                        <br />
                                        <small>
                                            Matricule: {auth.user.matricule}
                                        </small>
                                    </p>
                                </li>

                                {/* Menu Body */}
                                <li className="user-body">
                                    <div className="row">
                                        <div className="col-4 text-center">
                                            <Link href={route("profile.edit")}>
                                                <i className="fas fa-user"></i>{" "}
                                                Profil
                                            </Link>
                                        </div>
                                        <div className="col-4 text-center">
                                            <a href="#">
                                                <i className="fas fa-cog"></i>{" "}
                                                Paramètres
                                            </a>
                                        </div>
                                        <div className="col-4 text-center">
                                            <a href="#">
                                                <i className="fas fa-question-circle"></i>{" "}
                                                Aide
                                            </a>
                                        </div>
                                    </div>
                                </li>

                                {/* Menu Footer */}
                                <li className="user-footer">
                                    <Link
                                        href={route("profile.edit")}
                                        className="btn btn-default btn-flat"
                                    >
                                        <i className="fas fa-user-edit mr-1"></i>
                                        Profil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-default btn-flat float-right"
                                    >
                                        <i className="fas fa-sign-out-alt mr-1"></i>
                                        Déconnexion
                                    </button>
                                </li>
                            </ul>
                        </li>

                        {/* Control Sidebar */}
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                data-widget="control-sidebar"
                                data-slide="true"
                                href="#"
                                role="button"
                            >
                                <i className="fas fa-th-large"></i>
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Main Sidebar */}
                <aside className="main-sidebar sidebar-dark-primary elevation-4">
                    {/* Brand Logo */}
                    <Link href="/" className="brand-link">
                        <img
                            src="/Images/ia.jpeg"
                            alt="ESSFAR Logo"
                            className="brand-image img-circle elevation-3"
                            style={{ opacity: 0.8 }}
                        />
                        <span className="brand-text font-weight-light">
                            ESSFAR
                        </span>
                    </Link>

                    {/* Sidebar */}
                    <div className="sidebar">
                        {/* Sidebar user panel */}
                        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                            <div className="image">
                                <img
                                    src={"/Images/ia.jpeg"}
                                    className="img-circle elevation-2"
                                    alt="User Image"
                                />
                            </div>
                            <div className="info">
                                <Link
                                    href={route("profile.edit")}
                                    className="d-block text-white"
                                >
                                    {auth.user.name}
                                </Link>
                                <small
                                    className={`badge ${getRoleBadgeClass(
                                        auth.user.role
                                    )} mt-1`}
                                >
                                    {getRoleDisplayName(auth.user.role)}
                                </small>
                            </div>
                        </div>

                        {/* SidebarSearch Form */}
                        <div className="form-inline">
                            <div
                                className="input-group"
                                data-widget="sidebar-search"
                            >
                                <input
                                    className="form-control form-control-sidebar"
                                    type="search"
                                    placeholder="Rechercher..."
                                />
                                <div className="input-group-append">
                                    <button className="btn btn-sidebar">
                                        <i className="fas fa-search fa-fw"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Menu */}
                        <nav className="mt-2">
                            <ul
                                className="nav nav-pills nav-sidebar flex-column"
                                data-widget="treeview"
                                role="menu"
                            >
                                {menu &&
                                    menu.map((item, index) => (
                                        <li
                                            key={index}
                                            className={`nav-item ${
                                                item.children &&
                                                openMenus[index]
                                                    ? "menu-open"
                                                    : ""
                                            }`}
                                        >
                                            {item.children ? (
                                                <>
                                                    <button
                                                        className="nav-link btn btn-link text-left w-100"
                                                        onClick={() =>
                                                            toggleSubmenu(index)
                                                        }
                                                        style={{
                                                            border: "none",
                                                            background: "none",
                                                            color: "#c2c7d0",
                                                        }}
                                                    >
                                                        <i
                                                            className={`nav-icon ${item.icon}`}
                                                        ></i>
                                                        <p>
                                                            {item.title}
                                                            <i className="fas fa-angle-left right"></i>
                                                        </p>
                                                    </button>
                                                    <ul
                                                        className="nav nav-treeview"
                                                        style={{
                                                            display: openMenus[
                                                                index
                                                            ]
                                                                ? "block"
                                                                : "none",
                                                        }}
                                                    >
                                                        {item.children.map(
                                                            (
                                                                child,
                                                                childIndex
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        childIndex
                                                                    }
                                                                    className="nav-item"
                                                                >
                                                                    <Link
                                                                        href={
                                                                            child.url
                                                                        }
                                                                        className="nav-link"
                                                                    >
                                                                        <i className="far fa-circle nav-icon"></i>
                                                                        <p>
                                                                            {
                                                                                child.title
                                                                            }
                                                                        </p>
                                                                    </Link>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </>
                                            ) : (
                                                <Link
                                                    href={item.url}
                                                    className={`nav-link ${
                                                        window.location
                                                            .pathname ===
                                                        item.url
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                >
                                                    <i
                                                        className={`nav-icon ${item.icon}`}
                                                    ></i>
                                                    <p>{item.title}</p>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                            </ul>
                        </nav>
                    </div>
                </aside>

                {/* Content Wrapper */}
                <div className="content-wrapper">
                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="alert alert-success alert-dismissible fade-in mx-3 mt-3">
                            <button
                                type="button"
                                className="close"
                                data-dismiss="alert"
                                aria-label="Close"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <i className="fas fa-check-circle mr-2"></i>
                            {flash.success}
                        </div>
                    )}

                    {flash.error && (
                        <div className="alert alert-danger alert-dismissible fade-in mx-3 mt-3">
                            <button
                                type="button"
                                className="close"
                                data-dismiss="alert"
                                aria-label="Close"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {flash.error}
                        </div>
                    )}

                    {flash.warning && (
                        <div className="alert alert-warning alert-dismissible fade-in mx-3 mt-3">
                            <button
                                type="button"
                                className="close"
                                data-dismiss="alert"
                                aria-label="Close"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {flash.warning}
                        </div>
                    )}

                    {flash.info && (
                        <div className="alert alert-info alert-dismissible fade-in mx-3 mt-3">
                            <button
                                type="button"
                                className="close"
                                data-dismiss="alert"
                                aria-label="Close"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <i className="fas fa-info-circle mr-2"></i>
                            {flash.info}
                        </div>
                    )}

                    {children}
                </div>

                {/* Footer */}
                <footer className="main-footer">
                    <strong>
                        Copyright &copy; {new Date().getFullYear()}
                        <a href="https://essfar.edu" className="text-primary">
                            {" "}
                            ESSFAR
                        </a>
                        .
                    </strong>
                    Tous droits réservés.
                    <div className="float-right d-none d-sm-inline-block">
                        <b>Version</b> 1.0.0 |<b> Dernière connexion:</b>{" "}
                        {auth.user.derniere_connexion
                            ? new Date(
                                  auth.user.derniere_connexion
                              ).toLocaleDateString("fr-FR")
                            : "Première connexion"}
                    </div>
                </footer>

                {/* Control Sidebar */}
                <aside className="control-sidebar control-sidebar-dark">
                    <div className="p-3">
                        <h5>Paramètres d'affichage</h5>
                        <hr className="mb-2" />

                        <div className="mb-4">
                            <input type="checkbox" className="mr-1" />
                            <span>Mode sombre</span>
                        </div>

                        <div className="mb-4">
                            <input
                                type="checkbox"
                                className="mr-1"
                                defaultChecked
                            />
                            <span>Sidebar fixe</span>
                        </div>

                        <div className="mb-4">
                            <input type="checkbox" className="mr-1" />
                            <span>Navbar fixe</span>
                        </div>

                        <h6>Couleur de la sidebar</h6>
                        <div className="d-flex flex-wrap">
                            {[
                                "primary",
                                "info",
                                "success",
                                "warning",
                                "danger",
                                "indigo",
                                "navy",
                                "purple",
                                "pink",
                                "dark",
                            ].map((color) => (
                                <button
                                    key={color}
                                    className={`btn bg-${color} btn-sm m-1`}
                                    style={{ width: "30px", height: "30px" }}
                                    onClick={() => {
                                        document.querySelector(
                                            ".main-sidebar"
                                        ).className = `main-sidebar sidebar-dark-${color} elevation-4`;
                                    }}
                                ></button>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}
