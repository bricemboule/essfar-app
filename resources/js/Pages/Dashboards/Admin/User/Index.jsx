import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    Card,
    DataTable,
    StatsCard,
    Alert,
    Badge,
    FormField,
} from "@/Components/UI/Composant";
import { RoleBadge, StatusBadge } from "@/Components/Auth/RoleSelector";

export default function Index({ users, filters, roles, stats }) {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [bulkAction, setBulkAction] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const columns = [
        {
            key: "select",
            label: (
                <input
                    type="checkbox"
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedUsers(users.data.map((u) => u.id));
                        } else {
                            setSelectedUsers([]);
                        }
                    }}
                    checked={
                        selectedUsers.length === users.data.length &&
                        users.data.length > 0
                    }
                />
            ),
            render: (value, user) => (
                <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                            setSelectedUsers(
                                selectedUsers.filter((id) => id !== user.id)
                            );
                        }
                    }}
                />
            ),
        },
        {
            key: "photo",
            label: "",
            render: (value, user) => (
                <img
                    src={user.photo_url || "/images/default-avatar.png"}
                    alt={user.name}
                    className="img-circle"
                    width="40"
                    height="40"
                />
            ),
        },
        {
            key: "name",
            label: "Utilisateur",
            sortable: true,
            render: (value, user) => (
                <div>
                    <div className="font-weight-bold">{user.name}</div>
                    <small className="text-muted">{user.email}</small>
                    <br />
                    <Badge variant="secondary" size="sm">
                        {user.matricule}
                    </Badge>
                </div>
            ),
        },
        {
            key: "role",
            label: "Rôle",
            sortable: true,
            render: (value, user) => <RoleBadge role={user.role} />,
        },
        {
            key: "statut",
            label: "Statut",
            sortable: true,
            render: (value, user) => <StatusBadge status={user.statut} />,
        },
        {
            key: "telephone",
            label: "Téléphone",
            render: (value) =>
                value || <span className="text-muted">Non renseigné</span>,
        },
        {
            key: "derniere_connexion",
            label: "Dernière connexion",
            sortable: true,
            render: (value) =>
                value ? (
                    new Date(value).toLocaleDateString("fr-FR")
                ) : (
                    <span className="text-muted">Jamais</span>
                ),
        },
        {
            key: "created_at",
            label: "Inscription",
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString("fr-FR"),
        },
    ];

    const handleFilter = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        router.get(route("admin.users.index"), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleBulkAction = () => {
        if (selectedUsers.length === 0) {
            alert("Veuillez sélectionner au moins un utilisateur");
            return;
        }

        if (!bulkAction) {
            alert("Veuillez sélectionner une action");
            return;
        }

        const actionLabels = {
            activate: "activer",
            deactivate: "désactiver",
            suspend: "suspendre",
            delete: "supprimer",
        };

        if (
            confirm(
                `Voulez-vous vraiment ${actionLabels[bulkAction]} ${selectedUsers.length} utilisateur(s) ?`
            )
        ) {
            router.post(route("admin.users.bulk-action"), {
                action: bulkAction,
                user_ids: selectedUsers,
            });
        }
    };

    const renderActions = (user) => (
        <>
            <Link
                href={route("admin.users.show", user.id)}
                className="btn btn-info btn-sm"
                title="Voir"
            >
                <i className="fas fa-eye"></i>
            </Link>

            <Link
                href={route("admin.users.edit", user.id)}
                className="btn btn-warning btn-sm ml-1"
                title="Modifier"
            >
                <i className="fas fa-edit"></i>
            </Link>

            <button
                onClick={() => {
                    router.post(route("admin.users.toggle-status", user.id));
                }}
                className={`btn ${
                    user.statut === "actif" ? "btn-secondary" : "btn-success"
                } btn-sm ml-1`}
                title={user.statut === "actif" ? "Désactiver" : "Activer"}
            >
                <i
                    className={`fas ${
                        user.statut === "actif" ? "fa-pause" : "fa-play"
                    }`}
                ></i>
            </button>

            <button
                onClick={() => {
                    if (
                        confirm(
                            `Voulez-vous vraiment supprimer l'utilisateur ${user.name} ?`
                        )
                    ) {
                        router.delete(route("admin.users.destroy", user.id));
                    }
                }}
                className="btn btn-danger btn-sm ml-1"
                title="Supprimer"
            >
                <i className="fas fa-trash"></i>
            </button>
        </>
    );

    return (
        <AdminLayout title="Gestion des Utilisateurs">
            <Head title="Gestion des Utilisateurs" />

            {/* Content Header */}
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">
                                <i className="fas fa-users mr-2 text-primary"></i>
                                Gestion des Utilisateurs
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <div className="float-sm-right">
                                <Link
                                    href={route("admin.users.create")}
                                    className="btn btn-primary"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Nouvel Utilisateur
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Statistics Cards */}
                    <div className="row mb-4">
                        <StatsCard
                            title="Total Utilisateurs"
                            value={stats.total}
                            icon="fas fa-users"
                            color="info"
                            onClick={() => handleFilter("statut", "")}
                        />
                        <StatsCard
                            title="Utilisateurs Actifs"
                            value={stats.active}
                            icon="fas fa-user-check"
                            color="success"
                            onClick={() => handleFilter("statut", "actif")}
                        />
                        <StatsCard
                            title="Étudiants"
                            value={stats.by_role.etudiant || 0}
                            icon="fas fa-user-graduate"
                            color="primary"
                            onClick={() => handleFilter("role", "etudiant")}
                        />
                        <StatsCard
                            title="Personnel"
                            value={stats.total - (stats.by_role.etudiant || 0)}
                            icon="fas fa-user-tie"
                            color="warning"
                            onClick={() => handleFilter("role", "staff")}
                        />
                    </div>

                    {/* Filters */}
                    <Card
                        title="Filtres de recherche"
                        icon="fas fa-filter"
                        className="mb-4"
                        actions={
                            <button
                                type="button"
                                className="btn btn-tool"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <i
                                    className={`fas ${
                                        showFilters ? "fa-minus" : "fa-plus"
                                    }`}
                                ></i>
                            </button>
                        }
                    >
                        {showFilters && (
                            <div className="row">
                                <div className="col-md-3">
                                    <FormField
                                        label="Recherche"
                                        name="search"
                                        type="text"
                                        value={filters.search || ""}
                                        onChange={(e) =>
                                            handleFilter(
                                                "search",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nom, email, matricule..."
                                        icon="fas fa-search"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <FormField
                                        label="Rôle"
                                        name="role"
                                        type="select"
                                        value={filters.role || ""}
                                        onChange={(e) =>
                                            handleFilter("role", e.target.value)
                                        }
                                        options={Object.entries(roles).map(
                                            ([key, label]) => ({
                                                value: key,
                                                label,
                                            })
                                        )}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <FormField
                                        label="Statut"
                                        name="statut"
                                        type="select"
                                        value={filters.statut || ""}
                                        onChange={(e) =>
                                            handleFilter(
                                                "statut",
                                                e.target.value
                                            )
                                        }
                                        options={[
                                            { value: "actif", label: "Actif" },
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
                                <div className="col-md-3 d-flex align-items-end">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            router.get(
                                                route("admin.users.index")
                                            )
                                        }
                                    >
                                        <i className="fas fa-undo mr-1"></i>
                                        Réinitialiser
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                        <Alert type="info" dismissible={false}>
                            <div className="d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>{selectedUsers.length}</strong>{" "}
                                    utilisateur(s) sélectionné(s)
                                </span>
                                <div className="d-flex align-items-center">
                                    <select
                                        className="form-control form-control-sm mr-2"
                                        value={bulkAction}
                                        onChange={(e) =>
                                            setBulkAction(e.target.value)
                                        }
                                        style={{ width: "auto" }}
                                    >
                                        <option value="">
                                            Action groupée...
                                        </option>
                                        <option value="activate">
                                            Activer
                                        </option>
                                        <option value="deactivate">
                                            Désactiver
                                        </option>
                                        <option value="suspend">
                                            Suspendre
                                        </option>
                                        <option value="delete">
                                            Supprimer
                                        </option>
                                    </select>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={handleBulkAction}
                                    >
                                        Exécuter
                                    </button>
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Users Table */}
                    <Card
                        title={`Liste des utilisateurs (${users.total} au total)`}
                        icon="fas fa-list"
                        actions={
                            <div className="btn-group">
                                <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-download mr-1"></i>
                                    Exporter
                                </button>
                                <button className="btn btn-sm btn-outline-success">
                                    <i className="fas fa-file-excel mr-1"></i>
                                    Excel
                                </button>
                            </div>
                        }
                    >
                        <DataTable
                            columns={columns}
                            data={users.data}
                            pagination={users}
                            actions={renderActions}
                            emptyMessage="Aucun utilisateur trouvé"
                        />
                    </Card>
                </div>
            </section>
        </AdminLayout>
    );
}
