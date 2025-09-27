import React from "react";
import { Link } from "@inertiajs/react";
function Sidebar() {
    return (
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
            <Link href="/" className="brand-link">
                <img
                    src="/dist/img/AdminLTELogo.png"
                    alt="Logo"
                    className="brand-image img-circle elevation-3"
                    style={{ opacity: 0.8 }}
                />
                <span className="brand-text font-weight-light">Mon École</span>
            </Link>

            <div className="sidebar">
                {/* User Panel */}
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div className="image">
                        <img
                            src="/dist/img/user2-160x160.jpg"
                            className="img-circle elevation-2"
                            alt="User Image"
                        />
                    </div>
                    <div className="info">
                        <Link href="/profile" className="d-block text-white">
                            {auth.user.name}
                        </Link>
                        <small
                            className={`badge ${getRoleBadgeClass(
                                auth.user.role
                            )}`}
                        >
                            {getRoleDisplayName(auth.user.role)}
                        </small>
                    </div>
                </div>

                {/* Search */}
                <div className="form-inline">
                    <div className="input-group" data-widget="sidebar-search">
                        <input
                            className="form-control form-control-sidebar"
                            type="search"
                            placeholder="Rechercher"
                        />
                        <div className="input-group-append">
                            <button className="btn btn-sidebar">
                                <i className="fas fa-search fa-fw"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column">
                        {menu &&
                            menu.map((item, index) => (
                                <li
                                    key={index}
                                    className={`nav-item ${
                                        item.children && openMenus[index]
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
                                                    display: openMenus[index]
                                                        ? "block"
                                                        : "none",
                                                }}
                                            >
                                                {item.children.map(
                                                    (child, childIndex) => (
                                                        <li
                                                            key={childIndex}
                                                            className="nav-item"
                                                        >
                                                            <Link
                                                                href={child.url}
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
                                            className="nav-link"
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
    );
}

export default Sidebar;
