import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Enseignant({ course, teachers }) {
    return (
        <AdminLayout title={`Enseignants du cours ${course.name}`}>
            <Head title={`Enseignants - ${course.name}`} />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1>
                            <i className="fas fa-chalkboard-teacher mr-2 text-primary"></i>
                            Enseignants du cours : {course.name}
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
                {teachers.length === 0 ? (
                    <p>Aucun enseignant n’est assigné à ce cours.</p>
                ) : (
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Date d’assignation</th>
                                <th>Année académique</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher) => (
                                <tr key={teacher.id}>
                                    <td>{teacher.name}</td>
                                    <td>{teacher.email}</td>
                                    <td>
                                        {teacher.assigned_at
                                            ? new Date(
                                                  teacher.assigned_at
                                              ).toLocaleDateString("fr-FR")
                                            : "-"}
                                    </td>
                                    <td>{teacher.academic_year}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
}
