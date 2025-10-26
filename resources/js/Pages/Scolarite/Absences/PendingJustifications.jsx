import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function PendingJustifications({ attendances }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [validationAction, setValidationAction] = useState(null);

    const { data, setData, post, processing } = useForm({
        approved: false,
        comment: "",
    });

    const openValidationModal = (attendance, action) => {
        setSelectedAttendance(attendance);
        setValidationAction(action);
        setData({
            approved: action === "approve",
            comment: "",
        });
        setShowModal(true);
    };

    const handleValidation = (e) => {
        e.preventDefault();

        post(
            route(
                "scolarite.attendances.validate-justification",
                selectedAttendance.id
            ),
            {
                onSuccess: () => {
                    setShowModal(false);
                    setSelectedAttendance(null);
                },
            }
        );
    };

    const downloadJustification = (attendance) => {
        if (attendance.justification_file_url) {
            window.open(attendance.justification_file_url, "_blank");
        }
    };

    return (
        <AdminLayout title="Justifications en attente">
            <Head title="Justifications en attente" />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-hourglass-half mr-2 text-warning"></i>
                                Justifications en attente
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
                                            "scolarite.attendances.index"
                                        )}
                                    >
                                        Présences
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Justifications
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {attendances.data.length === 0 ? (
                        <div className="alert alert-info">
                            <h5>
                                <i className="icon fas fa-info-circle"></i>{" "}
                                Information
                            </h5>
                            Aucune justification en attente de validation.
                        </div>
                    ) : (
                        <div className="row">
                            {attendances.data.map((attendance) => (
                                <div key={attendance.id} className="col-md-6">
                                    <div className="card">
                                        <div className="card-header">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">
                                                    <img
                                                        src={
                                                            attendance.student
                                                                .photo_url ||
                                                            "/images/default-avatar.png"
                                                        }
                                                        alt={
                                                            attendance.student
                                                                .name
                                                        }
                                                        className="img-circle mr-2"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                        }}
                                                    />
                                                    {attendance.student.name}
                                                </h5>
                                                <span className="badge badge-warning">
                                                    En attente
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="row mb-3">
                                                <div className="col-6">
                                                    <strong>Date:</strong>
                                                    <br />
                                                    {new Date(
                                                        attendance.date
                                                    ).toLocaleDateString(
                                                        "fr-FR"
                                                    )}
                                                </div>
                                                <div className="col-6">
                                                    <strong>Matière:</strong>
                                                    <br />
                                                    {attendance.course.name}
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-6">
                                                    <strong>Classe:</strong>
                                                    <br />
                                                    {
                                                        attendance.school_class
                                                            .name
                                                    }
                                                </div>
                                                <div className="col-6">
                                                    <strong>Type:</strong>
                                                    <br />
                                                    <span
                                                        className={`badge ${
                                                            attendance.type ===
                                                            "absence"
                                                                ? "badge-danger"
                                                                : "badge-warning"
                                                        }`}
                                                    >
                                                        {attendance.type ===
                                                        "absence"
                                                            ? "Absence"
                                                            : "Retard"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <strong>
                                                    Justification de l'étudiant:
                                                </strong>
                                                <div className="border p-2 mt-2 bg-light rounded">
                                                    {
                                                        attendance.student_justification
                                                    }
                                                </div>
                                                <small className="text-muted">
                                                    Soumis le{" "}
                                                    {new Date(
                                                        attendance.justification_date
                                                    ).toLocaleDateString(
                                                        "fr-FR"
                                                    )}{" "}
                                                    à{" "}
                                                    {new Date(
                                                        attendance.justification_date
                                                    ).toLocaleTimeString(
                                                        "fr-FR"
                                                    )}
                                                </small>
                                            </div>

                                            {attendance.justification_file_url && (
                                                <div className="mb-3">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            downloadJustification(
                                                                attendance
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-download mr-1"></i>
                                                        Télécharger le
                                                        justificatif
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-footer">
                                            <div className="btn-group w-100">
                                                <button
                                                    type="button"
                                                    className="btn btn-success"
                                                    onClick={() =>
                                                        openValidationModal(
                                                            attendance,
                                                            "approve"
                                                        )
                                                    }
                                                >
                                                    <i className="fas fa-check mr-1"></i>
                                                    Approuver
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        openValidationModal(
                                                            attendance,
                                                            "reject"
                                                        )
                                                    }
                                                >
                                                    <i className="fas fa-times mr-1"></i>
                                                    Rejeter
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {attendances.last_page > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav>
                                <ul className="pagination">
                                    {attendances.links.map((link, index) => (
                                        <li
                                            key={index}
                                            className={`page-item ${
                                                link.active ? "active" : ""
                                            } ${!link.url ? "disabled" : ""}`}
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
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal de validation */}
            {showModal && selectedAttendance && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleValidation}>
                                <div className="modal-header">
                                    <h4 className="modal-title">
                                        {validationAction === "approve" ? (
                                            <>
                                                <i className="fas fa-check-circle text-success mr-2"></i>
                                                Approuver la justification
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-times-circle text-danger mr-2"></i>
                                                Rejeter la justification
                                            </>
                                        )}
                                    </h4>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <strong>Étudiant:</strong>{" "}
                                        {selectedAttendance.student.name}
                                        <br />
                                        <strong>Date:</strong>{" "}
                                        {new Date(
                                            selectedAttendance.date
                                        ).toLocaleDateString("fr-FR")}
                                        <br />
                                        <strong>Matière:</strong>{" "}
                                        {selectedAttendance.course.name}
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Commentaire{" "}
                                            {validationAction === "reject" && (
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            placeholder={
                                                validationAction === "approve"
                                                    ? "Commentaire optionnel..."
                                                    : "Expliquez pourquoi la justification est rejetée..."
                                            }
                                            value={data.comment}
                                            onChange={(e) =>
                                                setData(
                                                    "comment",
                                                    e.target.value
                                                )
                                            }
                                            required={
                                                validationAction === "reject"
                                            }
                                        />
                                    </div>

                                    {validationAction === "approve" ? (
                                        <div className="alert alert-success">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            L'absence sera marquée comme
                                            justifiée et l'étudiant sera
                                            notifié.
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            L'étudiant sera notifié du rejet et
                                            pourra soumettre une nouvelle
                                            justification.
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn ${
                                            validationAction === "approve"
                                                ? "btn-success"
                                                : "btn-danger"
                                        }`}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                                Traitement...
                                            </>
                                        ) : (
                                            <>
                                                <i
                                                    className={`fas fa-${
                                                        validationAction ===
                                                        "approve"
                                                            ? "check"
                                                            : "times"
                                                    } mr-1`}
                                                ></i>
                                                {validationAction === "approve"
                                                    ? "Approuver"
                                                    : "Rejeter"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
