import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Classes({ course, classes }) {
    return (
        <AdminLayout title={`Classes du cours ${course.name}`}>
            <Head title={`Classes - ${course.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1>
                            <i className="fas fa-users mr-2 text-primary"></i>
                            Classes du cours : {course.name}
                        </h1>
                        <Link
                            href={route("academic.courses.index")}
                            className="btn btn-secondary"
                        >
                            <i className="fas fa-arrow-left mr-1"></i>
                            Retour
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container-fluid">
                {classes.length === 0 ? (
                    <p>Aucune classe n’est associée à ce cours.</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Nom de la classe</th>
                                <th>Niveau</th>
                                <th>Effectif</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((classe) => (
                                <tr key={classe.id}>
                                    <td>{classe.name}</td>
                                    <td>{classe.level || "-"}</td>
                                    <td>{classe.students_count || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
}
