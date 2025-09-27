import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import {
    Card,
    FormField,
    Alert,
    LoadingSpinner,
} from "@/Components/UI/Composant";
import RoleSelector from "@/Components/Auth/RoleSelector";

export default function Create({ roles }) {
    const [showPassword, setShowPassword] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "etudiant",
        telephone: "",
        adresse: "",
        date_naissance: "",
        lieu_naissance: "",
        sexe: "",
        photo: null,
        statut: "actif",
        notes_admin: "",
        send_welcome_email: true,
        generate_password: false,
    });

    // Générer un mot de passe aléatoirement
    const generatePassword = () => {
        const length = 12;
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
        let password = "";

        // Assurer au moins un caractère de chaque type
        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
            Math.floor(Math.random() * 26)
        ]; // Majuscule
        password += "abcdefghijklmnopqrstuvwxyz"[
            Math.floor(Math.random() * 26)
        ]; // Minuscule
        password += "0123456789"[Math.floor(Math.random() * 10)]; // Chiffre
        password += "@#$%&*"[Math.floor(Math.random() * 6)]; // Spécial

        // Compléter avec des caractères aléatoires
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Mélanger les caractères
        password = password
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");

        setGeneratedPassword(password);
        setData("password", password);
        setData("password_confirmation", password);
    };

    // Gérer le changement d'image
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
        }
    };

    // Générer un email automatiquement basé sur le nom
    const generateEmail = (name) => {
        if (!name) return "";
        return (
            name
                .toLowerCase()
                .replace(/\s+/g, ".")
                .replace(/[^a-z0-9.]/g, "") + "@student.essfar.edu"
        );
    };

    // Validation en temps réel
    useEffect(() => {
        if (data.name && !data.email.includes("@")) {
            const generatedEmail = generateEmail(data.name);
            setData("email", generatedEmail);
        }
    }, [data.name]);

    const submit = (e) => {
        e.preventDefault();

        // Validation côté client
        if (
            !data.name ||
            !data.email ||
            (!data.password && !data.generate_password)
        ) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
        }

        if (data.password !== data.password_confirmation) {
            alert("Les mots de passe ne correspondent pas");
            return;
        }

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== "") {
                formData.append(key, data[key]);
            }
        });

        post(route("admin.users.store"), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
                setGeneratedPassword("");
            },
        });
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <AdminLayout title="Créer un utilisateur">
            <Head title="Créer un utilisateur" />

            {/* Content Header */}
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-user-plus mr-2 text-primary"></i>
                                Créer un nouvel utilisateur
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
                                    Créer
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-8">
                            {/* Progress Steps */}
                            <div className="card">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between">
                                        <div
                                            className={`step ${
                                                currentStep >= 1 ? "active" : ""
                                            }`}
                                        >
                                            <div className="step-number">1</div>
                                            <div className="step-title">
                                                Informations de base
                                            </div>
                                        </div>
                                        <div
                                            className={`step ${
                                                currentStep >= 2 ? "active" : ""
                                            }`}
                                        >
                                            <div className="step-number">2</div>
                                            <div className="step-title">
                                                Détails personnels
                                            </div>
                                        </div>
                                        <div
                                            className={`step ${
                                                currentStep >= 3 ? "active" : ""
                                            }`}
                                        >
                                            <div className="step-number">3</div>
                                            <div className="step-title">
                                                Configuration
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Form */}
                            <Card
                                title={`Étape ${currentStep}/3`}
                                icon="fas fa-user-plus"
                            >
                                <div onSubmit={submit}>
                                    {/* Étape 1: Informations de base */}
                                    {currentStep === 1 && (
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
                                                                e.target.value
                                                            )
                                                        }
                                                        error={errors.name}
                                                        required
                                                        icon="fas fa-user"
                                                        placeholder="Ex: Jean Dupont"
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
                                                                e.target.value
                                                            )
                                                        }
                                                        error={errors.email}
                                                        required
                                                        icon="fas fa-envelope"
                                                        placeholder="Ex: jean.dupont@essfar.edu"
                                                        helpText="L'email sera généré automatiquement basé sur le nom"
                                                    />
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-12">
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
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id="generate_password"
                                                                checked={
                                                                    data.generate_password
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setData(
                                                                        "generate_password",
                                                                        e.target
                                                                            .checked
                                                                    );
                                                                    if (
                                                                        e.target
                                                                            .checked
                                                                    ) {
                                                                        generatePassword();
                                                                    } else {
                                                                        setData(
                                                                            "password",
                                                                            ""
                                                                        );
                                                                        setData(
                                                                            "password_confirmation",
                                                                            ""
                                                                        );
                                                                        setGeneratedPassword(
                                                                            ""
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor="generate_password"
                                                            >
                                                                Générer un mot
                                                                de passe
                                                                automatiquement
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    {data.generate_password && (
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                generatePassword
                                                            }
                                                            className="btn btn-outline-primary btn-sm"
                                                        >
                                                            <i className="fas fa-refresh mr-1"></i>
                                                            Régénérer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {!data.generate_password && (
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>
                                                                Mot de passe *
                                                            </label>
                                                            <div className="input-group">
                                                                <input
                                                                    type={
                                                                        showPassword
                                                                            ? "text"
                                                                            : "password"
                                                                    }
                                                                    className={`form-control ${
                                                                        errors.password
                                                                            ? "is-invalid"
                                                                            : ""
                                                                    }`}
                                                                    value={
                                                                        data.password
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setData(
                                                                            "password",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder="Mot de passe sécurisé"
                                                                    required
                                                                />
                                                                <div className="input-group-append">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-secondary"
                                                                        onClick={() =>
                                                                            setShowPassword(
                                                                                !showPassword
                                                                            )
                                                                        }
                                                                    >
                                                                        <i
                                                                            className={`fas fa-eye${
                                                                                showPassword
                                                                                    ? "-slash"
                                                                                    : ""
                                                                            }`}
                                                                        ></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {errors.password && (
                                                                <div className="invalid-feedback d-block">
                                                                    {
                                                                        errors.password
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <FormField
                                                            label="Confirmer le mot de passe"
                                                            name="password_confirmation"
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            value={
                                                                data.password_confirmation
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "password_confirmation",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            error={
                                                                errors.password_confirmation
                                                            }
                                                            required
                                                            icon="fas fa-lock"
                                                            placeholder="Confirmer le mot de passe"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {generatedPassword && (
                                                <Alert type="success">
                                                    <strong>
                                                        Mot de passe généré :
                                                    </strong>
                                                    <code className="ml-2 p-1 bg-light">
                                                        {generatedPassword}
                                                    </code>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success ml-2"
                                                        onClick={() =>
                                                            navigator.clipboard.writeText(
                                                                generatedPassword
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-copy"></i>{" "}
                                                        Copier
                                                    </button>
                                                </Alert>
                                            )}
                                        </div>
                                    )}

                                    {/* Étape 2: Détails personnels */}
                                    {currentStep === 2 && (
                                        <div className="fade-in">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <FormField
                                                        label="Numéro de téléphone"
                                                        name="telephone"
                                                        type="tel"
                                                        value={data.telephone}
                                                        onChange={(e) =>
                                                            setData(
                                                                "telephone",
                                                                e.target.value
                                                            )
                                                        }
                                                        error={errors.telephone}
                                                        icon="fas fa-phone"
                                                        placeholder="+237 XXX XXX XXX"
                                                    />
                                                </div>
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
                                                                e.target.value
                                                            )
                                                        }
                                                        error={
                                                            errors.date_naissance
                                                        }
                                                        icon="fas fa-calendar"
                                                    />
                                                </div>
                                            </div>

                                            <div className="row">
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
                                                                e.target.value
                                                            )
                                                        }
                                                        error={
                                                            errors.lieu_naissance
                                                        }
                                                        icon="fas fa-calendar"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <FormField
                                                        label="Genre"
                                                        name="sexe"
                                                        type="select"
                                                        value={data.sexe}
                                                        onChange={(e) =>
                                                            setData(
                                                                "sexe",
                                                                e.target.value
                                                            )
                                                        }
                                                        error={errors.sexe}
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
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>
                                                            Photo de profil
                                                        </label>
                                                        <div className="custom-file">
                                                            <input
                                                                type="file"
                                                                className="custom-file-input"
                                                                id="photo"
                                                                accept="image/*"
                                                                onChange={
                                                                    handleImageChange
                                                                }
                                                            />
                                                            <label
                                                                className="custom-file-label"
                                                                htmlFor="photo"
                                                            >
                                                                Choisir une
                                                                image...
                                                            </label>
                                                        </div>
                                                        <small className="text-muted">
                                                            Format: JPG, PNG.
                                                            Taille max: 2MB
                                                        </small>
                                                        {errors.photo && (
                                                            <div className="text-danger small">
                                                                {errors.photo}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <FormField
                                                label="Adresse"
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

                                            {imagePreview && (
                                                <div className="text-center mt-3">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="img-thumbnail"
                                                        style={{
                                                            maxWidth: "200px",
                                                            maxHeight: "200px",
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Étape 3: Configuration */}
                                    {currentStep === 3 && (
                                        <div className="fade-in">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <FormField
                                                        label="Statut du compte"
                                                        name="statut"
                                                        type="select"
                                                        value={data.statut}
                                                        onChange={(e) =>
                                                            setData(
                                                                "statut",
                                                                e.target.value
                                                            )
                                                        }
                                                        error={errors.statut}
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
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id="send_welcome_email"
                                                                checked={
                                                                    data.send_welcome_email
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "send_welcome_email",
                                                                        e.target
                                                                            .checked
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor="send_welcome_email"
                                                            >
                                                                Envoyer un email
                                                                de bienvenue
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

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
                                                rows={4}
                                                helpText="Ces notes ne sont visibles que par les administrateurs"
                                            />

                                            {/* Résumé */}
                                            <div className="card bg-light">
                                                <div className="card-header">
                                                    <h5 className="mb-0">
                                                        <i className="fas fa-eye mr-2"></i>
                                                        Résumé des informations
                                                    </h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <p>
                                                                <strong>
                                                                    Nom :
                                                                </strong>{" "}
                                                                {data.name ||
                                                                    "Non renseigné"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Email :
                                                                </strong>{" "}
                                                                {data.email ||
                                                                    "Non renseigné"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Rôle :
                                                                </strong>{" "}
                                                                {roles[
                                                                    data.role
                                                                ] || data.role}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <p>
                                                                <strong>
                                                                    Téléphone :
                                                                </strong>{" "}
                                                                {data.telephone ||
                                                                    "Non renseigné"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Statut :
                                                                </strong>{" "}
                                                                {data.statut}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Email de
                                                                    bienvenue :
                                                                </strong>{" "}
                                                                {data.send_welcome_email
                                                                    ? "Oui"
                                                                    : "Non"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="d-flex justify-content-between mt-4">
                                        <div>
                                            {currentStep > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={prevStep}
                                                    className="btn btn-secondary"
                                                >
                                                    <i className="fas fa-arrow-left mr-1"></i>
                                                    Précédent
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            {currentStep < 3 ? (
                                                <button
                                                    type="button"
                                                    onClick={nextStep}
                                                    className="btn btn-primary"
                                                >
                                                    Suivant
                                                    <i className="fas fa-arrow-right ml-1"></i>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={submit}
                                                    className="btn btn-success"
                                                    disabled={processing}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                                            Création...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-save mr-1"></i>
                                                            Créer l'utilisateur
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar with help and tips */}
                        <div className="col-md-4">
                            <Card
                                title="Aide et conseils"
                                icon="fas fa-lightbulb"
                                className="mb-4"
                            >
                                <div className="timeline">
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-primary"></div>
                                        <div className="timeline-content">
                                            <h6>Informations obligatoires</h6>
                                            <small>
                                                Nom, email et rôle sont requis
                                                pour créer un compte
                                            </small>
                                        </div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-success"></div>
                                        <div className="timeline-content">
                                            <h6>Génération automatique</h6>
                                            <small>
                                                L'email et le matricule peuvent
                                                être générés automatiquement
                                            </small>
                                        </div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-info"></div>
                                        <div className="timeline-content">
                                            <h6>Mot de passe sécurisé</h6>
                                            <small>
                                                Utilisez la génération
                                                automatique pour un mot de passe
                                                fort
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card
                                title="Permissions par rôle"
                                icon="fas fa-shield-alt"
                            >
                                <div className="small">
                                    <div className="mb-2">
                                        <span className="badge badge-info">
                                            Étudiant
                                        </span>
                                        <small className="d-block text-muted">
                                            Accès limité aux cours et notes
                                        </small>
                                    </div>
                                    <div className="mb-2">
                                        <span className="badge badge-success">
                                            Enseignant
                                        </span>
                                        <small className="d-block text-muted">
                                            Gestion des cours et évaluations
                                        </small>
                                    </div>
                                    <div className="mb-2">
                                        <span className="badge badge-warning">
                                            Chef Scolarité
                                        </span>
                                        <small className="d-block text-muted">
                                            Gestion complète des plannings
                                        </small>
                                    </div>
                                    <div>
                                        <span className="badge badge-danger">
                                            Admin
                                        </span>
                                        <small className="d-block text-muted">
                                            Accès complet au système
                                        </small>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    flex: 1;
                }

                .step:not(:last-child):after {
                    content: "";
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    background: #e9ecef;
                    top: 20px;
                    left: 50%;
                    z-index: -1;
                }

                .step.active:not(:last-child):after {
                    background: #007bff;
                }

                .step-number {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #e9ecef;
                    color: #6c757d;
                    font-weight: bold;
                }

                .step.active .step-number {
                    background: #007bff;
                    color: white;
                }

                .step-title {
                    margin-top: 8px;
                    font-size: 0.875rem;
                    color: #6c757d;
                }

                .step.active .step-title {
                    color: #007bff;
                    font-weight: 500;
                }

                .timeline {
                    position: relative;
                }

                .timeline-item {
                    display: flex;
                    margin-bottom: 1rem;
                }

                .timeline-marker {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    margin-right: 1rem;
                    margin-top: 0.25rem;
                }

                .timeline-content h6 {
                    margin-bottom: 0.25rem;
                    font-size: 0.875rem;
                }

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
            `}</style>
        </AdminLayout>
    );
}
