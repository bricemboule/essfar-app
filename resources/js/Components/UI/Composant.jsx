import React from "react";

// Composant Card professionnel
export function Card({
    title,
    subtitle,
    children,
    icon,
    actions,
    loading = false,
    className = "",
}) {
    return (
        <div className={`card ${className}`}>
            {title && (
                <div className="card-header">
                    <h3 className="card-title">
                        {icon && <i className={`${icon} mr-2`}></i>}
                        {title}
                        {subtitle && (
                            <small className="text-muted ml-2">
                                {subtitle}
                            </small>
                        )}
                    </h3>
                    {actions && <div className="card-tools">{actions}</div>}
                </div>
            )}
            <div className="card-body">
                {loading ? (
                    <div className="text-center py-4">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="sr-only">Chargement...</span>
                        </div>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

// Composant DataTable professionnel
export function DataTable({
    columns,
    data,
    loading = false,
    pagination,
    onSort,
    onFilter,
    actions,
    emptyMessage = "Aucune donnée disponible",
}) {
    const [sortBy, setSortBy] = React.useState("");
    const [sortOrder, setSortOrder] = React.useState("asc");

    const handleSort = (column) => {
        const newOrder =
            sortBy === column && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(column);
        setSortOrder(newOrder);
        if (onSort) onSort(column, newOrder);
    };

    if (loading) {
        return (
            <div className="table-responsive">
                <table className="table table-striped">
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i}>
                                {columns.map((_, j) => (
                                    <td key={j}>
                                        <div className="placeholder-glow">
                                            <span className="placeholder col-8"></span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-striped table-hover">
                <thead className="thead-light">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={
                                    column.sortable
                                        ? "cursor-pointer user-select-none"
                                        : ""
                                }
                                onClick={() =>
                                    column.sortable && handleSort(column.key)
                                }
                            >
                                {column.label}
                                {column.sortable && (
                                    <i
                                        className={`fas fa-sort${
                                            sortBy === column.key
                                                ? sortOrder === "asc"
                                                    ? "-up"
                                                    : "-down"
                                                : ""
                                        } ml-1`}
                                    ></i>
                                )}
                            </th>
                        ))}
                        {actions && <th className="text-center">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex}>
                                        {column.render
                                            ? column.render(
                                                  row[column.key],
                                                  row
                                              )
                                            : row[column.key]}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="text-center">
                                        <div className="btn-group btn-group-sm">
                                            {actions(row)}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length + (actions ? 1 : 0)}
                                className="text-center py-4"
                            >
                                <div className="text-muted">
                                    <i className="fas fa-inbox fa-3x mb-3"></i>
                                    <p>{emptyMessage}</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {pagination && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        <small className="text-muted">
                            Affichage de {pagination.from} à {pagination.to} sur{" "}
                            {pagination.total} résultats
                        </small>
                    </div>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            {pagination.links &&
                                pagination.links.map((link, index) => (
                                    <li
                                        key={index}
                                        className={`page-item ${
                                            link.active ? "active" : ""
                                        } ${!link.url ? "disabled" : ""}`}
                                    >
                                        {link.url ? (
                                            <a
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
                                ))}
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
}

// Composant Modal professionnel
export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    footer,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="modal d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className={`modal-dialog modal-${size}`}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{title}</h4>
                        <button
                            type="button"
                            className="close"
                            onClick={onClose}
                        >
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">{children}</div>
                    {footer && <div className="modal-footer">{footer}</div>}
                </div>
            </div>
        </div>
    );
}

// Composant Form Field professionnel
export function FormField({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    required = false,
    placeholder,
    options = [],
    rows = 3,
    helpText,
    icon,
    disabled = false,
}) {
    const inputId = `field-${name}`;

    const renderInput = () => {
        switch (type) {
            case "textarea":
                return (
                    <textarea
                        id={inputId}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={`form-control ${error ? "is-invalid" : ""}`}
                        placeholder={placeholder}
                        rows={rows}
                        disabled={disabled}
                        required={required}
                    />
                );
            case "select":
                return (
                    <select
                        id={inputId}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={`form-control ${error ? "is-invalid" : ""}`}
                        disabled={disabled}
                        required={required}
                    >
                        <option value="">Sélectionner...</option>
                        {options.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                return (
                    <input
                        type={type}
                        id={inputId}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={`form-control ${error ? "is-invalid" : ""}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                    />
                );
        }
    };

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={inputId} className="form-label">
                    {icon && <i className={`${icon} mr-2`}></i>}
                    {label}
                    {required && <span className="text-danger ml-1">*</span>}
                </label>
            )}

            {icon && type !== "textarea" && type !== "select" ? (
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text">
                            <i className={icon}></i>
                        </span>
                    </div>
                    {renderInput()}
                </div>
            ) : (
                renderInput()
            )}

            {error && <div className="invalid-feedback d-block">{error}</div>}
            {helpText && !error && (
                <small className="form-text text-muted">{helpText}</small>
            )}
        </div>
    );
}

// Composant Stats Card professionnel
export function StatsCard({
    title,
    value,
    subtitle,
    icon,
    color = "primary",
    trend,
    onClick,
    loading = false,
}) {
    const cardClass = `small-box bg-${color}`;

    if (loading) {
        return (
            <div className="col-lg-3 col-6">
                <div className="small-box bg-light">
                    <div className="inner">
                        <div className="placeholder-glow">
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </div>
                    </div>
                    <div className="icon">
                        <i className="fas fa-circle-notch fa-spin"></i>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="col-lg-3 col-6">
            <div
                className={cardClass}
                onClick={onClick}
                style={{ cursor: onClick ? "pointer" : "default" }}
            >
                <div className="inner">
                    <h3>
                        {typeof value === "number"
                            ? value.toLocaleString()
                            : value}
                        {trend && (
                            <sup className="small ml-1">
                                <i
                                    className={`fas fa-arrow-${
                                        trend.direction === "up" ? "up" : "down"
                                    }`}
                                ></i>
                                {trend.value}%
                            </sup>
                        )}
                    </h3>
                    <p>{title}</p>
                    {subtitle && (
                        <small className="text-white-50">{subtitle}</small>
                    )}
                </div>
                <div className="icon">
                    <i className={icon}></i>
                </div>
                {onClick && (
                    <div className="small-box-footer">
                        Plus d'infos{" "}
                        <i className="fas fa-arrow-circle-right"></i>
                    </div>
                )}
            </div>
        </div>
    );
}

// Composant Progress Bar professionnel
export function ProgressBar({
    percentage,
    label,
    color = "primary",
    size = "md",
    showPercentage = true,
    animated = false,
}) {
    const sizeClass =
        size === "sm" ? "progress-sm" : size === "lg" ? "progress-lg" : "";

    return (
        <div className="mb-3">
            {label && (
                <div className="d-flex justify-content-between mb-1">
                    <span className="text-sm">{label}</span>
                    {showPercentage && (
                        <span className="text-sm font-weight-bold">
                            {percentage}%
                        </span>
                    )}
                </div>
            )}
            <div className={`progress ${sizeClass}`}>
                <div
                    className={`progress-bar bg-${color} ${
                        animated ? "progress-bar-animated" : ""
                    }`}
                    role="progressbar"
                    style={{ width: `${percentage}%` }}
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>
        </div>
    );
}

// Composant Alert professionnel
export function Alert({
    type = "info",
    title,
    children,
    dismissible = true,
    onDismiss,
}) {
    const [visible, setVisible] = React.useState(true);

    const handleDismiss = () => {
        setVisible(false);
        if (onDismiss) onDismiss();
    };

    if (!visible) return null;

    return (
        <div
            className={`alert alert-${type} ${
                dismissible ? "alert-dismissible" : ""
            } fade show`}
        >
            {dismissible && (
                <button type="button" className="close" onClick={handleDismiss}>
                    <span>&times;</span>
                </button>
            )}
            {title && (
                <h5>
                    <strong>{title}</strong>
                </h5>
            )}
            {children}
        </div>
    );
}

// Composant Loading Spinner
export function LoadingSpinner({
    size = "md",
    text = "Chargement...",
    center = true,
}) {
    const sizeClass = size === "sm" ? "spinner-border-sm" : "";

    const spinner = (
        <div
            className={`spinner-border text-primary ${sizeClass}`}
            role="status"
        >
            <span className="sr-only">{text}</span>
        </div>
    );

    if (center) {
        return (
            <div className="d-flex justify-content-center align-items-center py-4">
                <div className="text-center">
                    {spinner}
                    {text && <div className="mt-2 text-muted">{text}</div>}
                </div>
            </div>
        );
    }

    return spinner;
}

// Composant Badge professionnel
export function Badge({
    children,
    variant = "primary",
    size = "md",
    pill = false,
    icon,
}) {
    const sizeClass =
        size === "sm" ? "badge-sm" : size === "lg" ? "badge-lg" : "";

    return (
        <span
            className={`badge badge-${variant} ${sizeClass} ${
                pill ? "badge-pill" : ""
            }`}
        >
            {icon && <i className={`${icon} mr-1`}></i>}
            {children}
        </span>
    );
}

// Composant Breadcrumb professionnel
export function Breadcrumb({ items }) {
    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                {items.map((item, index) => (
                    <li
                        key={index}
                        className={`breadcrumb-item ${
                            index === items.length - 1 ? "active" : ""
                        }`}
                    >
                        {index === items.length - 1 ? (
                            item.label
                        ) : (
                            <a href={item.url}>{item.label}</a>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
