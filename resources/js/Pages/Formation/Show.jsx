import { motion } from "framer-motion";
import { Download, ArrowRightCircle } from "lucide-react";
import { Link } from "@inertiajs/react";
import SiteLayout from "@/Layouts/SiteLayout";

export default function Show({ programme }) {
    return (
        <SiteLayout>
            <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-10 px-4 sm:px-6">
                {/* Grille principale */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Colonne gauche */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-4xl font-bold text-[#0F8AB1]"
                        >
                            {programme.title}
                        </motion.h1>

                        <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                            {programme.description}
                        </p>

                        <div className="bg-[#0F8AB1]/5 p-4 rounded-lg">
                            <p className="font-semibold">
                                Diplôme obtenu :{" "}
                                <span className="text-[#0F8AB1]">
                                    {programme.diplome}
                                </span>
                            </p>
                        </div>

                        {/* Accordéons */}
                        <div className="space-y-4">
                            {programme.sections.map((section, idx) => (
                                <details
                                    key={idx}
                                    className="border rounded-lg overflow-hidden"
                                    open={idx === 0}
                                >
                                    <summary className="bg-[#0F8AB1]/10 px-4 py-3 font-medium cursor-pointer">
                                        {section.title}
                                    </summary>
                                    <div className="px-4 py-3 text-gray-700">
                                        <ul className="list-disc ml-5 space-y-1">
                                            {section.items.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </details>
                            ))}
                        </div>

                        <Link
                            href="/postuler"
                            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[#C82327] text-white font-semibold rounded-lg hover:bg-[#a31b1e] transition"
                        >
                            POSTULER MAINTENANT
                            <ArrowRightCircle className="ml-2" size={22} />
                        </Link>
                    </div>

                    {/* Colonne droite */}
                    <div className="space-y-6">
                        <motion.img
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={programme.image}
                            alt={programme.title}
                            className="w-full rounded-2xl shadow-lg"
                        />

                        <div className="bg-white border rounded-xl shadow p-5">
                            <h3 className="text-xl font-bold text-[#C82327] mb-4">
                                Téléchargements
                            </h3>
                            <ul className="space-y-3">
                                {programme.documents.map((doc, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={doc.url}
                                            className="flex items-center gap-3 text-[#0F8AB1] hover:underline"
                                        >
                                            <Download size={20} /> {doc.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link
                            href="/etudier_a_essfar/etudiant"
                            className="block w-full text-center border border-[#0F8AB1] text-[#0F8AB1] font-medium py-3 rounded-lg hover:bg-[#0F8AB1] hover:text-white transition"
                        >
                            VOIR D'AUTRES FORMATIONS
                        </Link>
                    </div>
                </div>

                {/* Vidéo témoignage en bas, centrée */}
                {programme.video_temoignage && (
                    <div className="mt-10 flex justify-center">
                        <div className="w-full md:w-2/3 lg:w-1/2 bg-[#0F8AB1]/5 p-4 rounded-lg">
                            <h2 className="text-2xl font-semibold text-[#0F8AB1] mb-2 text-center">
                                {programme.video_temoignage.titre}
                            </h2>
                            <p className="text-gray-700 mb-4 text-center">
                                {programme.video_temoignage.description}
                            </p>

                            <video
                                controls
                                className="w-full rounded-lg shadow-lg"
                                src={programme.video_temoignage.url} // Exemple : "/videos/temoignage.mp4"
                            >
                                Votre navigateur ne supporte pas la vidéo.
                            </video>
                        </div>
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
