import React from "react";
import { motion } from "framer-motion";
import { FileText, PieChart, Eye } from "lucide-react";

function Apropo() {
    return (
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Image */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <img
                        src="/Images/dg.png"
                        alt="Qui sommes-nous"
                        className="rounded-2xl shadow-2xl border border-gray-200 hover:scale-105 transition-transform duration-500"
                    />
                </motion.div>

                {/* Contenu */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl font-bold text-[#0F8AB1] mb-4">
                        Qui sommes-nous ?
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                        Institut spécialisé dans la finance, l’actuariat et la
                        gestion des masses de données, reconnu par l'Etat du
                        Cameroun. Nous plaçons l’excellence académique et
                        l’insertion professionnelle au cœur de notre mission.
                    </p>

                    {/* Carte réutilisable */}
                    {[
                        {
                            icon: <FileText className="text-red-600 w-6 h-6" />,
                            bg: "bg-red-100",
                            title: "Notre Mission",
                            text: "Former des experts capables d’anticiper, de modéliser et de gérer les risques pour répondre aux défis économiques et sociaux.",
                        },
                        {
                            icon: (
                                <PieChart className="text-blue-600 w-6 h-6" />
                            ),
                            bg: "bg-blue-100",
                            title: "Nos Valeurs",
                            text: "Innovation, rigueur scientifique et engagement pour le développement durable, au service des étudiants et des entreprises.",
                        },
                        {
                            icon: <Eye className="text-green-600 w-6 h-6" />,
                            bg: "bg-green-100",
                            title: "Notre Vision",
                            text: "Devenir une référence africaine en matière de formation en actuariat, assurance et gestion des risques, en préparant les leaders de demain.",
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{
                                y: -10,
                                rotate: 1,
                                boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                            }}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-6 flex items-start mb-4 cursor-pointer"
                        >
                            <div className={`p-3 ${item.bg} rounded-lg mr-4`}>
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {item.text}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

export default Apropo;
