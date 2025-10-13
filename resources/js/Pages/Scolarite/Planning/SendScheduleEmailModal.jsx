import React, { useState } from "react";
import { router } from "@inertiajs/react";

export default function SendScheduleEmailModal({
    show,
    onClose,
    type = "general",
    teacherId = null,
    classId = null,
    startDate,
    endDate,
    teachers = [],
    classes = [],
}) {
    const [emailType, setEmailType] = useState(
        type === "teacher"
            ? "teacher"
            : type === "class"
            ? "class"
            : "all_teachers"
    );
    const [selectedTeacher, setSelectedTeacher] = useState(teacherId || "");
    const [selectedClass, setSelectedClass] = useState(classId || "");
    const [includePdf, setIncludePdf] = useState(true);
    const [customMessage, setCustomMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = () => {
        setSending(true);

        const data = {
            type: emailType,
            start_date: startDate,
            end_date: endDate,
            include_pdf: includePdf,
            message: customMessage,
        };

        if (emailType === "teacher" && selectedTeacher) {
            data.teacher_id = selectedTeacher;
        } else if (emailType === "class" && selectedClass) {
            data.class_id = selectedClass;
        }

        router.post(route("planning.send-email"), data, {
            onSuccess: () => {
                setSending(false);
                onClose();
            },
            onError: () => {
                setSending(false);
            },
        });
    };

    if (!show) return null;

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
                            Envoyer le planning par email
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
                        {/* Type d'envoi */}
                        <div className="form-group">
                            <label>
                                <strong>Type d'envoi</strong>
                            </label>
                            <select
                                className="form-control"
                                value={emailType}
                                onChange={(e) => setEmailType(e.target.value)}
                            >
                                <option value="teacher">
                                    Un enseignant spécifique
                                </option>
                                <option value="class">
                                    Une classe spécifique
                                </option>
                                <option value="all_teachers">
                                    Tous les enseignants
                                </option>
                                <option value="all_classes">
                                    Toutes les classes
                                </option>
                            </select>
                        </div>

                        {/* Sélection enseignant */}
                        {emailType === "teacher" && (
                            <div className="form-group">
                                <label>
                                    Enseignant{" "}
                                    <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-control"
                                    value={selectedTeacher}
                                    onChange={(e) =>
                                        setSelectedTeacher(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">-- Sélectionner --</option>
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
                        )}

                        {/* Sélection classe */}
                        {emailType === "class" && (
                            <div className="form-group">
                                <label>
                                    Classe{" "}
                                    <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-control"
                                    value={selectedClass}
                                    onChange={(e) =>
                                        setSelectedClass(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Période */}
                        <div className="alert alert-info">
                            <i className="fas fa-calendar mr-2"></i>
                            <strong>Période :</strong> Du{" "}
                            {new Date(startDate).toLocaleDateString("fr-FR")} au{" "}
                            {new Date(endDate).toLocaleDateString("fr-FR")}
                        </div>

                        {/* Options */}
                        <div className="custom-control custom-checkbox mb-3">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="includePdf"
                                checked={includePdf}
                                onChange={(e) =>
                                    setIncludePdf(e.target.checked)
                                }
                            />
                            <label
                                className="custom-control-label"
                                htmlFor="includePdf"
                            >
                                <strong>Joindre le PDF du planning</strong>
                            </label>
                        </div>

                        {/* Message personnalisé */}
                        <div className="form-group">
                            <label>Message personnalisé (optionnel)</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={customMessage}
                                onChange={(e) =>
                                    setCustomMessage(e.target.value)
                                }
                                placeholder="Ajoutez un message personnalisé qui sera inclus dans l'email..."
                                maxLength="1000"
                            ></textarea>
                            <small className="text-muted">
                                {customMessage.length}/1000 caractères
                            </small>
                        </div>

                        {/* Aperçu destinataires */}
                        <div className="alert alert-warning">
                            <i className="fas fa-info-circle mr-2"></i>
                            <strong>Destinataires :</strong>
                            {emailType === "teacher" && " 1 enseignant"}
                            {emailType === "class" &&
                                " Tous les étudiants de la classe"}
                            {emailType === "all_teachers" &&
                                " Tous les enseignants ayant des cours cette semaine"}
                            {emailType === "all_classes" &&
                                " Tous les étudiants de toutes les classes"}
                        </div>
                    </div>

                    <div className="modal-footer justify-content-between">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={sending}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary btn-lg"
                            onClick={handleSend}
                            disabled={
                                sending ||
                                (emailType === "teacher" && !selectedTeacher) ||
                                (emailType === "class" && !selectedClass)
                            }
                        >
                            {sending ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane mr-2"></i>
                                    Envoyer le planning
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
