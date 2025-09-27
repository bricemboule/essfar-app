import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import {
    Card,
    FormField,
    Alert,
    LoadingSpinner,
    Modal,
} from "@/Components/UI/Composant";
import RoleSelector, {
    RoleBadge,
    StatusBadge,
} from "@/Components/Auth/RoleSelector";

export default function EditUser({ user, roles }) {
    const [imagePreview, setImagePreview] = useState(user.photo_url);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [hasChanges, setHasChanges] = useState(false);

    const { data, setData, put, processing, errors, reset, isDirty } = useForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "etudiant",
        telephone: user.telephone || "",
        adresse: user.adresse || "",
        date_naissance: user.date_naissance || "",
        lieu_naissance: user.lieu_naissance || "",
        sexe: user.sexe || "",
        photo: null,
        statut: user.statut || "actif",
        notes_admin: user.notes_admin || "",
        remove_photo: false,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        put: updatePassword,
        processing: passwordProcessing,
        errors: passwordErrors,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
        force_password_change: false,
    });

    // Détecter les changements
    useEffect(() => {
        setHasChanges(isDirty);
    }, [isDirty]);

    // Gérer l'upload d'image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2048000) {
                // 2MB
                alert("La taille de l'image ne doit pas dépasser 2MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
            setData("photo", file);
            setData("remove_photo", false);
        }
    };

    // Supprimer la photo
    const removePhoto = () => {
        setImagePreview("/images/default-avatar.png");
        setData("photo", null);
        setData("remove_photo", true);
    };

    // Soumettre le formulaire principal
    const submit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== "") {
                formData.append(key, data[key]);
            }
        });

        put(route("admin.users.update", user.id), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                setHasChanges(false);
            },
        });
    };

    // Soumettre le changement de mot de passe
    const submitPasswordChange = (e) => {
        e.preventDefault();

        updatePassword(route("admin.users.reset-password", user.id), {
            onSuccess: () => {
                setShowPasswordModal(false);
                setPasswordData({
                    current_password: "",
                    password: "",
                    password_confirmation: "",
                    force_password_change: false,
                });
            },
        });
    };

    // Générer un nouveau mot de passe
    const generatePassword = () => {
        const length = 12;
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
        let password = "";

        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
            Math.floor(Math.random() * 26)
        ];
        password += "abcdefghijklmnopqrstuvwxyz"[
            Math.floor(Math.random() * 26)
        ];
        password += "0123456789"[Math.floor(Math.random() * 10)];
        password += "@#$%&*"[Math.floor(Math.random() * 6)];

        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        password = password
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");

        setPasswordData("password", password);
        setPasswordData("password_confirmation", password);
    };

    // Calculer l'âge
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }
        return age;
    };

    return (
        <AdminLayout title="Modifier l'utilisateur">
            <Head title={`Modifier ${user.name}`} />

            {/* Content Header */}
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-user-edit mr-2 text-primary"></i>
                                Modifier l'utilisateur
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link href={route("admin.dashboard")}>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link href={route("admin.users.index")}>
                                        Utilisateurs
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    {user.name}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        {/* Sidebar avec infos utilisateur */}
                        <div className="col-md-4">
                            <Card
                                title="Informations utilisateur"
                                icon="fas fa-user"
                            >
                                <div className="text-center mb-3">
                                    <div className="position-relative d-inline-block">
                                        <img
                                            src={imagePreview}
                                            alt={user.name}
                                            className="img-circle elevation-2"
                                            style={{
                                                width: "120px",
                                                height: "120px",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <div
                                            className="position-absolute"
                                            style={{ bottom: "0", right: "0" }}
                                        >
                                            <label
                                                htmlFor="photo-upload"
                                                className="btn btn-sm btn-primary rounded-circle"
                                            >
                                                <i className="fas fa-camera"></i>
                                                <input
                                                    type="file"
                                                    id="photo-upload"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    style={{ display: "none" }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    {imagePreview !==
                                        "/images/default-avatar.png" && (
                                        <div className="mt-2">
                                            <button
                                                type="button"
                                                onClick={removePhoto}
                                                className="btn btn-sm btn-outline-danger"
                                            >
                                                <i className="fas fa-trash mr-1"></i>
                                                Supprimer la photo
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center">
                                    <h4>{user.name}</h4>
                                    <p className="text-muted">{user.email}</p>

                                    <div className="mb-2">
                                        <RoleBadge role={user.role} />
                                    </div>

                                    <div className="mb-2">
                                        <StatusBadge status={user.statut} />
                                    </div>

                                    <p className="text-sm text-muted">
                                        <strong>Matricule:</strong>{" "}
                                        {user.matricule}
                                        <br />
                                        <strong>Créé le:</strong>{" "}
                                        {new Date(
                                            user.created_at
                                        ).toLocaleDateString("fr-FR")}
                                        <br />
                                        {user.derniere_connexion && (
                                            <>
                                                <strong>
                                                    Dernière connexion:
                                                </strong>
                                                <br />
                                                {new Date(
                                                    user.derniere_connexion
                                                ).toLocaleString("fr-FR")}
                                            </>
                                        )}
                                    </p>
                                </div>

                                <hr />

                                <div className="btn-group-vertical w-100">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswordModal(true)
                                        }
                                        className="btn btn-warning mb-2"
                                    >
                                        <i className="fas fa-key mr-2"></i>
                                        Changer le mot de passe
                                    </button>

                                    <Link
                                        href={route(
                                            "admin.users.show",
                                            user.id
                                        )}
                                        className="btn btn-info mb-2"
                                    >
                                        <i className="fas fa-eye mr-2"></i>
                                        Voir le profil complet
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(true)}
                                        className="btn btn-danger"
                                    >
                                        <i className="fas fa-trash mr-2"></i>
                                        Supprimer l'utilisateur
                                    </button>
                                </div>
                            </Card>

                            {/* Statistiques */}
                            {(user.role === "etudiant" ||
                                user.role === "enseignant") && (
                                <Card
                                    title="Statistiques"
                                    icon="fas fa-chart-bar"
                                    className="mt-3"
                                >
                                    {user.role === "etudiant" && (
                                        <div>
                                            <p>
                                                <strong>Classes:</strong>{" "}
                                                {user.enrollments_count || 0}
                                            </p>
                                            <p>
                                                <strong>Cours suivis:</strong>{" "}
                                                {user.courses_count || 0}
                                            </p>
                                        </div>
                                    )}
                                    {user.role === "enseignant" && (
                                        <div>
                                            <p>
                                                <strong>
                                                    Cours enseignés:
                                                </strong>{" "}
                                                {user.teaching_courses_count ||
                                                    0}
                                            </p>
                                            <p>
                                                <strong>
                                                    Heures effecuées:
                                                </strong>{" "}
                                                {user.completed_hours || 0}h
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            )}
                        </div>

                        {/* Formulaire principal */}
                        <div className="col-md-8">
                            {hasChanges && (
                                <Alert type="warning" dismissible={false}>
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    Vous avez des modifications non
                                    sauvegardées.
                                </Alert>
                            )}

                            <Card>
                                {/* Onglets */}
                                <div className="card-header p-0">
                                    <ul className="nav nav-tabs" role="tablist">
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${
                                                    activeTab === "general"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveTab("general")
                                                }
                                                type="button"
                                            >
                                                <i className="fas fa-user mr-1"></i>
                                                Informations générales
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${
                                                    activeTab === "personal"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveTab("personal")
                                                }
                                                type="button"
                                            >
                                                <i className="fas fa-address-card mr-1"></i>
                                                Détails personnels
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${
                                                    activeTab === "admin"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setActiveTab("admin")
                                                }
                                                type="button"
                                            >
                                                <i className="fas fa-cogs mr-1"></i>
                                                Administration
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                <div className="card-body">
                                    <div onSubmit={submit}>
                                        {/* Onglet Informations générales */}
                                        {activeTab === "general" && (
                                            <div className="fade-in">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <FormField
                                                            label="Nom complet"
                                                            name="name"
                                                            type="text"
                                                            value={data.name}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            error={errors.name}
                                                            required
                                                            icon="fas fa-user"
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <FormField
                                                            label="Adresse email"
                                                            name="email"
                                                            type="email"
                                                            value={data.email}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "email",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            error={errors.email}
                                                            required
                                                            icon="fas fa-envelope"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <RoleSelector
                                                        roles={roles}
                                                        selectedRole={data.role}
                                                        onRoleChange={(role) =>
                                                            setData(
                                                                "role",
                                                                role
                                                            )
                                                        }
                                                    />
                                                    {errors.role && (
                                                        <div className="text-danger small">
                                                            {errors.role}
                                                        </div>
                                                    )}

                                                    {data.role !==
                                                        user.role && (
                                                        <Alert type="warning">
                                                            <strong>
                                                                Attention :
                                                            </strong>{" "}
                                                            Changer le rôle
                                                            modifiera les
                                                            permissions et le
                                                            matricule de
                                                            l'utilisateur.
                                                        </Alert>
                                                    )}
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <FormField
                                                            label="Téléphone"
                                                            name="telephone"
                                                            type="tel"
                                                            value={
                                                                data.telephone
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "telephone",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            error={
                                                                errors.telephone
                                                            }
                                                            icon="fas fa-phone"
                                                            placeholder="+237 XXX XXX XXX"
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <FormField
                                                            label="Statut du compte"
                                                            name="statut"
                                                            type="select"
                                                            value={data.statut}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "statut",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            error={
                                                                errors.statut
                                                            }
                                                            required
                                                            options={[
                                                                {
                                                                    value: "actif",
                                                                    label: "Actif",
                                                                },
                                                                {
                                                                    value: "inactif",
                                                                    label: "Inactif",
                                                                },
                                                                {
                                                                    value: "suspendu",
                                                                    label: "Suspendu",
                                                                },
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Onglet Détails personnels */}
                                        {activeTab === "personal" && (
                                            <div className="fade-in">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <FormField
                                                            label="Date de naissance"
                                                            name="date_naissance"
                                                            type="date"
                                                            value={
                                                                data.date_naissance
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "date_naissance",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            error={
                                                                errors.date_naissance
                                                            }
                                                            icon="fas fa-calendar"
                                                        />
                                                        {data.date_naissance && (
                                                            <small className="text-muted">
                                                                Âge:{" "}
                                                                {calculateAge(
                                                                    data.date_naissance
                                                                )}{" "}
                                                                ans
                                                            </small>
                                                        )}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <FormField
                                                            label="Lieu de naissance"
                                                            name="lieu_naissance"
                                                            type="text"
                                                            value={
                                                                data.lieu_naissance
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "lieu_naissance",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            error={
                                                                errors.lieu_naissance
                                                            }
                                                            icon="fas fa-calendar"
                                                        />
                                                        {data.lieu_naissance && (
                                                            <small className="text-muted">
                                                                Âge:{" "}
                                                                {calculateAge(
                                                                    data.lieu_naissance
                                                                )}{" "}
                                                                ans
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <FormField
                                                            label="Genre"
                                                            name="genre"
                                                            type="select"
                                                            value={data.genre}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "genre",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            error={errors.genre}
                                                            options={[
                                                                {
                                                                    value: "M",
                                                                    label: "Masculin",
                                                                },
                                                                {
                                                                    value: "F",
                                                                    label: "Féminin",
                                                                },
                                                            ]}
                                                        />
                                                    </div>
                                                </div>

                                                <FormField
                                                    label="Adresse complète"
                                                    name="adresse"
                                                    type="textarea"
                                                    value={data.adresse}
                                                    onChange={(e) =>
                                                        setData(
                                                            "adresse",
                                                            e.target.value
                                                        )
                                                    }
                                                    error={errors.adresse}
                                                    placeholder="Adresse complète..."
                                                    rows={3}
                                                />

                                                {/* Informations de compte */}
                                                <div className="card bg-light">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            Informations du
                                                            compte
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <p>
                                                                    <strong>
                                                                        Matricule:
                                                                    </strong>{" "}
                                                                    {
                                                                        user.matricule
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <strong>
                                                                        Compte
                                                                        créé le:
                                                                    </strong>{" "}
                                                                    {new Date(
                                                                        user.created_at
                                                                    ).toLocaleDateString(
                                                                        "fr-FR"
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <p>
                                                                    <strong>
                                                                        Email
                                                                        vérifié:
                                                                    </strong>{" "}
                                                                    {user.email_verified_at
                                                                        ? "Oui"
                                                                        : "Non"}
                                                                </p>
                                                                <p>
                                                                    <strong>
                                                                        Dernière
                                                                        modification:
                                                                    </strong>{" "}
                                                                    {new Date(
                                                                        user.updated_at
                                                                    ).toLocaleDateString(
                                                                        "fr-FR"
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Onglet Administration */}
                                        {activeTab === "admin" && (
                                            <div className="fade-in">
                                                <FormField
                                                    label="Notes administratives"
                                                    name="notes_admin"
                                                    type="textarea"
                                                    value={data.notes_admin}
                                                    onChange={(e) =>
                                                        setData(
                                                            "notes_admin",
                                                            e.target.value
                                                        )
                                                    }
                                                    error={errors.notes_admin}
                                                    placeholder="Notes internes sur cet utilisateur..."
                                                    rows={5}
                                                    helpText="Ces notes ne sont visibles que par les administrateurs"
                                                />

                                                {/* Historique des modifications */}
                                                <div className="card bg-light">
                                                    <div className="card-header">
                                                        <h6 className="mb-0">
                                                            <i className="fas fa-history mr-2"></i>
                                                            Historique
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="timeline timeline-sm">
                                                            <div className="timeline-item">
                                                                <div className="timeline-marker bg-success"></div>
                                                                <div className="timeline-content">
                                                                    <strong>
                                                                        Compte
                                                                        créé
                                                                    </strong>
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {new Date(
                                                                            user.created_at
                                                                        ).toLocaleString(
                                                                            "fr-FR"
                                                                        )}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                            {user.derniere_connexion && (
                                                                <div className="timeline-item">
                                                                    <div className="timeline-marker bg-info"></div>
                                                                    <div className="timeline-content">
                                                                        <strong>
                                                                            Dernière
                                                                            connexion
                                                                        </strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {new Date(
                                                                                user.derniere_connexion
                                                                            ).toLocaleString(
                                                                                "fr-FR"
                                                                            )}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {user.updated_at !==
                                                                user.created_at && (
                                                                <div className="timeline-item">
                                                                    <div className="timeline-marker bg-warning"></div>
                                                                    <div className="timeline-content">
                                                                        <strong>
                                                                            Dernière
                                                                            modification
                                                                        </strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {new Date(
                                                                                user.updated_at
                                                                            ).toLocaleString(
                                                                                "fr-FR"
                                                                            )}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Boutons d'action */}
                                        <div className="d-flex justify-content-between mt-4">
                                            <Link
                                                href={route(
                                                    "admin.users.index"
                                                )}
                                                className="btn btn-secondary"
                                            >
                                                <i className="fas fa-arrow-left mr-1"></i>
                                                Retour à la liste
                                            </Link>

                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => reset()}
                                                    className="btn btn-outline-secondary mr-2"
                                                    disabled={!hasChanges}
                                                >
                                                    <i className="fas fa-undo mr-1"></i>
                                                    Annuler les modifications
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={submit}
                                                    className="btn btn-primary"
                                                    disabled={
                                                        processing ||
                                                        !hasChanges
                                                    }
                                                >
                                                    {processing ? (
                                                        <>
                                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                                            Sauvegarde...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-save mr-1"></i>
                                                            Sauvegarder les
                                                            modifications
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal Changement de mot de passe */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Changer le mot de passe"
                size="md"
                footer={
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(false)}
                            className="btn btn-secondary mr-2"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={submitPasswordChange}
                            className="btn btn-warning"
                            disabled={passwordProcessing}
                        >
                            {passwordProcessing
                                ? "Modification..."
                                : "Changer le mot de passe"}
                        </button>
                    </div>
                }
            >
                <div onSubmit={submitPasswordChange}>
                    <Alert type="info">
                        <strong>Nouveau mot de passe pour {user.name}</strong>
                        <br />
                        L'utilisateur devra se reconnecter après cette
                        modification.
                    </Alert>

                    <div className="row mb-3">
                        <div className="col-12">
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="btn btn-outline-primary btn-sm"
                            >
                                <i className="fas fa-key mr-1"></i>
                                Générer un mot de passe sécurisé
                            </button>
                        </div>
                    </div>

                    <FormField
                        label="Nouveau mot de passe"
                        name="password"
                        type="password"
                        value={passwordData.password}
                        onChange={(e) =>
                            setPasswordData("password", e.target.value)
                        }
                        error={passwordErrors.password}
                        required
                        icon="fas fa-lock"
                    />

                    <FormField
                        label="Confirmer le mot de passe"
                        name="password_confirmation"
                        type="password"
                        value={passwordData.password_confirmation}
                        onChange={(e) =>
                            setPasswordData(
                                "password_confirmation",
                                e.target.value
                            )
                        }
                        error={passwordErrors.password_confirmation}
                        required
                        icon="fas fa-lock"
                    />

                    <div className="form-group">
                        <div className="custom-control custom-checkbox">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="force_password_change"
                                checked={passwordData.force_password_change}
                                onChange={(e) =>
                                    setPasswordData(
                                        "force_password_change",
                                        e.target.checked
                                    )
                                }
                            />
                            <label
                                className="custom-control-label"
                                htmlFor="force_password_change"
                            >
                                Forcer le changement de mot de passe à la
                                prochaine connexion
                            </label>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal Confirmation suppression */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Supprimer l'utilisateur"
                size="md"
                footer={
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="btn btn-secondary mr-2"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                router.delete(
                                    route("admin.users.destroy", user.id)
                                );
                            }}
                            className="btn btn-danger"
                        >
                            <i className="fas fa-trash mr-1"></i>
                            Supprimer définitivement
                        </button>
                    </div>
                }
            >
                <Alert type="danger">
                    <h5>
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Attention !
                    </h5>
                    Vous êtes sur le point de supprimer définitivement
                    l'utilisateur <strong>{user.name}</strong>.
                </Alert>

                <p>
                    Cette action est <strong>irréversible</strong> et supprimera
                    :
                </p>
                <ul>
                    <li>Toutes les données personnelles</li>
                    <li>L'historique des connexions</li>
                    <li>Les notes administratives</li>
                </ul>

                <div className="form-group mt-3">
                    <label>
                        Pour confirmer, tapez le nom de l'utilisateur :
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={user.name}
                        onChange={(e) => {
                            const deleteButton =
                                document.querySelector("#confirm-delete");
                            if (deleteButton) {
                                deleteButton.disabled =
                                    e.target.value !== user.name;
                            }
                        }}
                    />
                </div>
            </Modal>

            <style jsx>{`
                .fade-in {
                    animation: fadeIn 0.3s ease-in;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .timeline {
                    position: relative;
                    padding-left: 30px;
                }

                .timeline-item {
                    position: relative;
                    padding-bottom: 20px;
                }

                .timeline-item:before {
                    content: "";
                    position: absolute;
                    left: -23px;
                    top: 20px;
                    bottom: -20px;
                    width: 2px;
                    background: #dee2e6;
                }

                .timeline-item:last-child:before {
                    display: none;
                }

                .timeline-marker {
                    position: absolute;
                    left: -30px;
                    top: 0;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </AdminLayout>
    );
}
