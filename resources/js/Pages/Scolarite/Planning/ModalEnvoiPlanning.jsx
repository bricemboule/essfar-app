import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

// Composant Modal d'envoi d'email - À intégrer dans votre Index.jsx
export default function ModalEnvoiPlanning({
    show,
    onClose,
    type, // 'teacher', 'class', 'bulk'
    recipients, // teacher, class, ou array de schedules
    startDate,
    endDate,
}) {
    const [emailOptions, setEmailOptions] = useState({
        include_attachments: true,
        send_copy_to_admin: false,
        format: "pdf", // pdf, excel, both
        message: "",
    });

    const { post, processing } = useForm();

    const handleSend = () => {
        const data = {
            type: type,
            start_date: startDate,
            end_date: endDate,
            options: emailOptions,
        };

        // Ajouter les destinataires selon le type
        if (type === "teacher") {
            data.teacher_id = recipients.id;
        } else if (type === "class") {
            data.class_id = recipients.id;
        } else if (type === "bulk") {
            data.schedule_ids = recipients.map((s) => s.id);
        }

        post(route("planning.send-email"), data, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    if (!show) return null;

    // Calculer le nombre de destinataires
    const getRecipientCount = () => {
        if (type === "teacher") {
            return 1;
        } else if (type === "class") {
            return (
                recipients.students_count || recipients.students?.length || 0
            );
        } else if (type === "bulk") {
            // Compter les enseignants uniques
            const uniqueTeachers = [
                ...new Set(recipients.map((s) => s.teacher_id)),
            ];
            return uniqueTeachers.length;
        }
        return 0;
    };

    const recipientCount = getRecipientCount();

    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h4 className="modal-title">
                            <i className="fas fa-envelope mr-2"></i>
                            Envoyer l'emploi du temps par email
                        </h4>
                        <button
                            type="button"
                            className="close text-white"
                            onClick={onClose}
                        >
                            <span>&times;</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        {/* Informations sur l'envoi */}
                        <div className="alert alert-info">
                            <h6>
                                <i className="fas fa-info-circle mr-2"></i>
                                Informations sur l'envoi
                            </h6>
                            <ul className="mb-0">
                                <li>
                                    <strong>Type :</strong>{" "}
                                    {type === "teacher" &&
                                        "Planning enseignant"}
                                    {type === "class" && "Planning de classe"}
                                    {type === "bulk" && "Envoi groupé"}
                                </li>
                                <li>
                                    <strong>Destinataires :</strong>{" "}
                                    {recipientCount} personne(s)
                                </li>
                                <li>
                                    <strong>Période :</strong>{" "}
                                    {new Date(startDate).toLocaleDateString(
                                        "fr-FR"
                                    )}{" "}
                                    au{" "}
                                    {new Date(endDate).toLocaleDateString(
                                        "fr-FR"
                                    )}
                                </li>
                            </ul>
                        </div>

                        {/* Détails des destinataires */}
                        <div className="form-group">
                            <label className="font-weight-bold">
                                <i className="fas fa-users mr-2"></i>
                                Destinataires
                            </label>
                            <div className="border rounded p-3 bg-light">
                                {type === "teacher" && (
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={
                                                recipients.photo_url ||
                                                "/images/default-avatar.png"
                                            }
                                            alt={recipients.name}
                                            className="img-circle mr-3"
                                            width="40"
                                            height="40"
                                        />
                                        <div>
                                            <strong>{recipients.name}</strong>
                                            <br />
                                            <small className="text-muted">
                                                {recipients.email}
                                            </small>
                                        </div>
                                    </div>
                                )}

                                {type === "class" && (
                                    <div>
                                        <h6 className="mb-2">
                                            <i className="fas fa-graduation-cap mr-2"></i>
                                            {recipients.name}
                                        </h6>
                                        <p className="mb-0">
                                            <small className="text-muted">
                                                L'email sera envoyé à tous les{" "}
                                                {recipientCount} étudiants de
                                                cette classe
                                            </small>
                                        </p>
                                    </div>
                                )}

                                {type === "bulk" && (
                                    <div>
                                        <p className="mb-2">
                                            <strong>{recipients.length}</strong>{" "}
                                            séance(s) sélectionnée(s)
                                        </p>
                                        <p className="mb-0">
                                            <small className="text-muted">
                                                L'email sera envoyé aux{" "}
                                                {recipientCount} enseignant(s)
                                                concerné(s)
                                            </small>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Options d'envoi */}
                        <div className="form-group">
                            <label className="font-weight-bold">
                                <i className="fas fa-cog mr-2"></i>
                                Options d'envoi
                            </label>

                            <div className="custom-control custom-checkbox mb-2">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="include_attachments"
                                    checked={emailOptions.include_attachments}
                                    onChange={(e) =>
                                        setEmailOptions({
                                            ...emailOptions,
                                            include_attachments:
                                                e.target.checked,
                                        })
                                    }
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="include_attachments"
                                >
                                    Inclure le planning en pièce jointe
                                </label>
                            </div>

                            <div className="custom-control custom-checkbox mb-3">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="send_copy_to_admin"
                                    checked={emailOptions.send_copy_to_admin}
                                    onChange={(e) =>
                                        setEmailOptions({
                                            ...emailOptions,
                                            send_copy_to_admin:
                                                e.target.checked,
                                        })
                                    }
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="send_copy_to_admin"
                                >
                                    M'envoyer une copie
                                </label>
                            </div>

                            {emailOptions.include_attachments && (
                                <div className="form-group">
                                    <label>Format de la pièce jointe</label>
                                    <select
                                        className="form-control"
                                        value={emailOptions.format}
                                        onChange={(e) =>
                                            setEmailOptions({
                                                ...emailOptions,
                                                format: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="pdf">
                                            PDF uniquement
                                        </option>
                                        <option value="excel">
                                            Excel uniquement
                                        </option>
                                        <option value="both">
                                            PDF + Excel
                                        </option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Message personnalisé */}
                        <div className="form-group">
                            <label className="font-weight-bold">
                                <i className="fas fa-comment mr-2"></i>
                                Message personnalisé (optionnel)
                            </label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Ajoutez un message personnalisé qui sera inclus dans l'email..."
                                value={emailOptions.message}
                                onChange={(e) =>
                                    setEmailOptions({
                                        ...emailOptions,
                                        message: e.target.value,
                                    })
                                }
                            ></textarea>
                            <small className="text-muted">
                                Ce message apparaîtra en haut de l'email, avant
                                le planning
                            </small>
                        </div>

                        {/* Aperçu du contenu */}
                        <div className="alert alert-light border">
                            <h6 className="font-weight-bold mb-2">
                                <i className="fas fa-eye mr-2"></i>
                                Aperçu du contenu de l'email
                            </h6>
                            <ul className="mb-0 small">
                                <li>
                                    Planning de la semaine du{" "}
                                    {new Date(startDate).toLocaleDateString(
                                        "fr-FR"
                                    )}
                                </li>
                                <li>
                                    Détails des séances (horaires, salles,
                                    cours)
                                </li>
                                <li>Informations de contact</li>
                                {emailOptions.include_attachments && (
                                    <li>
                                        Pièce(s) jointe(s) :{" "}
                                        {emailOptions.format === "both"
                                            ? "PDF et Excel"
                                            : emailOptions.format.toUpperCase()}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="modal-footer justify-content-between">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={processing}
                        >
                            <i className="fas fa-times mr-1"></i>
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSend}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane mr-1"></i>
                                    Envoyer à {recipientCount} destinataire(s)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .modal.show {
                    display: block !important;
                }

                .img-circle {
                    border-radius: 50%;
                    object-fit: cover;
                }
            `}</style>
        </div>
    );
}
