import React from "react";

export default function RoleSelector({
    roles,
    selectedRole,
    onRoleChange,
    disabled = false,
    showDescription = true,
}) {
    const roleDescriptions = {
        etudiant: "Accès aux cours, notes et planning personnel",
        enseignant: "Gestion des cours, planning et évaluations",
        gestionnaire_scolarite: "Gestion des inscriptions et planning",
        chef_scolarite: "Supervision complète de la scolarité",
        directeur_academique: "Supervision académique et pédagogique",
        directeur_general: "Direction générale et stratégique",
        comptable: "Gestion financière et comptabilité",
        communication: "Gestion de la communication institutionnelle",
        admin: "Administration système complète",
    };

    const roleColors = {
        etudiant: "bg-blue-50 border-blue-200 text-blue-800",
        enseignant: "bg-green-50 border-green-200 text-green-800",
        gestionnaire_scolarite:
            "bg-yellow-50 border-yellow-200 text-yellow-800",
        chef_scolarite: "bg-orange-50 border-orange-200 text-orange-800",
        directeur_academique: "bg-purple-50 border-purple-200 text-purple-800",
        directeur_general: "bg-red-50 border-red-200 text-red-800",
        comptable: "bg-indigo-50 border-indigo-200 text-indigo-800",
        communication: "bg-pink-50 border-pink-200 text-pink-800",
        admin: "bg-gray-50 border-gray-200 text-gray-800",
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                Rôle de l'utilisateur *
            </label>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(roles).map(([roleKey, roleName]) => (
                    <div key={roleKey} className="relative">
                        <input
                            type="radio"
                            id={`role-${roleKey}`}
                            name="role"
                            value={roleKey}
                            checked={selectedRole === roleKey}
                            onChange={(e) => onRoleChange(e.target.value)}
                            disabled={disabled}
                            className="sr-only"
                        />
                        <label
                            htmlFor={`role-${roleKey}`}
                            className={`
                                block w-full p-4 border-2 rounded-lg cursor-pointer transition-all
                                ${
                                    selectedRole === roleKey
                                        ? `${roleColors[roleKey]} border-opacity-100`
                                        : "bg-white border-gray-200 hover:border-gray-300"
                                }
                                ${
                                    disabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }
                            `}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div
                                        className={`
                                        w-4 h-4 border-2 rounded-full
                                        ${
                                            selectedRole === roleKey
                                                ? "border-current bg-current"
                                                : "border-gray-300"
                                        }
                                    `}
                                    >
                                        {selectedRole === roleKey && (
                                            <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                                        )}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {roleName}
                                    </p>
                                    {showDescription &&
                                        roleDescriptions[roleKey] && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {roleDescriptions[roleKey]}
                                            </p>
                                        )}
                                </div>
                            </div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Composant Badge de rôle
export function RoleBadge({ role }) {
    const roleConfig = {
        etudiant: {
            label: "Étudiant",
            color: "bg-blue-100 text-blue-800",
            icon: "fas fa-user-graduate",
        },
        enseignant: {
            label: "Enseignant",
            color: "bg-green-100 text-green-800",
            icon: "fas fa-chalkboard-teacher",
        },
        gestionnaire_scolarite: {
            label: "Gestionnaire Scolarité",
            color: "bg-yellow-100 text-yellow-800",
            icon: "fas fa-user-tie",
        },
        chef_scolarite: {
            label: "Chef Scolarité",
            color: "bg-orange-100 text-orange-800",
            icon: "fas fa-user-cog",
        },
        directeur_academique: {
            label: "Directeur Académique",
            color: "bg-purple-100 text-purple-800",
            icon: "fas fa-university",
        },
        directeur_general: {
            label: "Directeur Général",
            color: "bg-red-100 text-red-800",
            icon: "fas fa-crown",
        },
        comptable: {
            label: "Comptable",
            color: "bg-indigo-100 text-indigo-800",
            icon: "fas fa-calculator",
        },
        communication: {
            label: "Communication",
            color: "bg-pink-100 text-pink-800",
            icon: "fas fa-bullhorn",
        },
        admin: {
            label: "Administrateur",
            color: "bg-gray-100 text-gray-800",
            icon: "fas fa-cogs",
        },
    };

    const config = roleConfig[role] || {
        label: role,
        color: "bg-gray-100 text-gray-800",
        icon: "fas fa-user",
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
        >
            <i className={`${config.icon} mr-1`}></i>
            {config.label}
        </span>
    );
}

// Composant Status Badge
export function StatusBadge({ status }) {
    const statusConfig = {
        actif: {
            label: "Actif",
            color: "bg-green-100 text-green-800",
            icon: "fas fa-check-circle",
        },
        inactif: {
            label: "Inactif",
            color: "bg-gray-100 text-gray-800",
            icon: "fas fa-pause-circle",
        },
        suspendu: {
            label: "Suspendu",
            color: "bg-red-100 text-red-800",
            icon: "fas fa-ban",
        },
    };

    const config = statusConfig[status] || statusConfig["inactif"];

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
        >
            <i className={`${config.icon} mr-1`}></i>
            {config.label}
        </span>
    );
}
