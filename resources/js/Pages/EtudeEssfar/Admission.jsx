import { Link } from "@inertiajs/react";
import { FaFileDownload } from "react-icons/fa";
import SiteLayout from "@/Layouts/SiteLayout";

const niveaux = [
    { nom: "1ère année", fichier: "/pdf/licence.pdf" },
    { nom: "2ème année", fichier: "/pdf/licence.pdf" },
    { nom: "3ème année", fichier: "/pdf/licence.pdf" },
    { nom: "Master 1", fichier: "/pdf/Master.pdf" },
];

const frais = [
    {
        type: "Concours",
        L1: "20 000",
        L2: "20 000",
        L3: "20 000",
        Master: "20 000",
    },
    {
        type: "Inscription Administrative",
        L1: "230 000",
        L2: "230 000",
        L3: "230 000",
        Master: "230 000",
    },
    {
        type: "Scolarité",
        L1: "1 800 000",
        L2: "1 800 000",
        L3: "2 000 000",
        Master: "2 300 000",
    },
];

const Admission = () => {
    const trackDownload = (fileName) => {
        if (window.fbq)
            window.fbq("track", "Download", { content_name: fileName });
    };

    const trackFormClick = () => {
        if (window.fbq)
            window.fbq("track", "Lead", {
                content_name: "Formulaire d'inscription",
            });
    };

    return (
        <SiteLayout>
            {/* Informations Concours */}
            <div className="text-center my-8 px-4">
                <h1 className="text-3xl text-red-500 font-bold mb-6">
                    Informations Concours
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xl text-gray-800">
                    <div className="bg-white shadow-md rounded-xl p-6 border-l-8 border-red-500">
                        <p>
                            <strong>Prochaine date de concours :</strong>{" "}
                            <span className="text-red-500 italic">
                                À définir
                            </span>
                        </p>
                        <p>
                            <strong>Date limite dépôt dossiers :</strong>{" "}
                            <span className="text-red-500 italic">
                                À définir
                            </span>
                        </p>
                    </div>
                    <div className="bg-white shadow-md rounded-xl p-6 border-l-8 border-red-500">
                        <p>
                            <strong>Entrée en Licence :</strong>{" "}
                            <span className="text-red-500 italic">
                                Sur Concours
                            </span>
                        </p>
                        <p>
                            <strong>Entrée en Master :</strong>{" "}
                            <span className="text-red-500 italic">
                                Sur étude de dossiers
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Procédure d'inscription */}
            <div className="text-center my-8 px-4">
                <h2 className="text-2xl text-red-500 font-bold underline mb-6">
                    Procédure d'inscription
                </h2>
                <ol className="list-decimal text-left md:text-center mx-auto max-w-4xl space-y-4 text-lg">
                    <li>
                        Télécharger la fiche d'inscription :
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                            {niveaux.map((niveau) => (
                                <Link
                                    key={niveau.nom}
                                    to={niveau.fichier}
                                    className="text-[#0F8AB1] font-semibold hover:underline flex items-center gap-1"
                                    download={`FICHE D'INSCRIPTION ${niveau.nom}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => trackDownload(niveau.nom)}
                                >
                                    <FaFileDownload /> {niveau.nom}
                                </Link>
                            ))}
                        </div>
                    </li>
                    <li>Compléter soigneusement la fiche d'inscription.</li>
                    <li>Payer les frais d'étude de dossier à la banque.</li>
                    <li>
                        Déposer le dossier complet au campus de l'ESSFAR ou
                        l’envoyer par email à{" "}
                        <span className="text-[#0F8AB1] italic">
                            contact@essfar.com
                        </span>{" "}
                        avec l’objet « Dossier d'inscription ».
                    </li>
                </ol>
            </div>

            <div className="text-center my-8">
                <p className="text-xl">
                    Pour compléter votre inscription, veuillez remplir le{" "}
                    <a
                        href="https://forms.gle/xs9yPkvGhg3qVxASA"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0F8AB1] font-semibold hover:underline"
                        onClick={trackFormClick}
                    >
                        formulaire d'inscription
                    </a>
                    .
                </p>
            </div>

            {/* Frais de scolarité */}
            <div className="relative overflow-x-auto my-12 px-2">
                <h2 className="text-3xl text-red-500 font-bold text-center mb-6">
                    Frais de scolarité
                </h2>
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-white bg-[#0F8AB1]">
                        <tr>
                            <th className="px-4 py-3">Frais</th>
                            <th className="px-6 py-3">Licence 1</th>
                            <th className="px-6 py-3">Licence 2</th>
                            <th className="px-6 py-3">Licence 3</th>
                            <th className="px-6 py-3">Master 1 & 2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {frais.map((item) => (
                            <tr
                                key={item.type}
                                className="bg-white border-b hover:bg-sky-50 transition-colors"
                            >
                                <th className="px-6 py-4 font-medium text-gray-900 flex items-center gap-1">
                                    <FaFileDownload /> {item.type}
                                </th>
                                <td className="px-6 py-4 text-gray-900">
                                    {item.L1}
                                </td>
                                <td className="px-6 py-4 text-gray-900">
                                    {item.L2}
                                </td>
                                <td className="px-6 py-4 text-gray-900">
                                    {item.L3}
                                </td>
                                <td className="px-6 py-4 text-gray-900">
                                    {item.Master}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-white font-bold border-b hover:bg-sky-50 transition-colors">
                            <th className="px-6 py-4 text-gray-900">Totaux</th>
                            <td className="px-6 py-4 text-gray-900">
                                2 030 000
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                                2 030 000
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                                2 230 000
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                                2 530 000
                            </td>
                        </tr>
                    </tbody>
                </table>

                <h3 className="text-2xl text-red-500 font-bold mt-8 mb-4 text-center">
                    Modalités de règlement
                </h3>
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-white bg-[#0F8AB1]">
                        <tr>
                            <th className="px-4 py-3">
                                1<sup>ère</sup> tranche
                            </th>
                            <th className="px-6 py-3">
                                2<sup>e</sup> tranche
                            </th>
                            <th className="px-6 py-3">
                                3<sup>e</sup> tranche
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b hover:bg-sky-50 transition-colors">
                            <th className="px-6 py-4 font-medium text-gray-900">
                                40% en octobre
                            </th>
                            <td className="px-6 py-4 text-gray-900">
                                40% en janvier
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                                20% en mars
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </SiteLayout>
    );
};

export default Admission;
