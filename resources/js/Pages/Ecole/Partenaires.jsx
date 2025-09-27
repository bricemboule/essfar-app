"use client";
import SiteLayout from "@/Layouts/SiteLayout";
import { motion } from "framer-motion";

const partenairesPro = [
    { name: "CNPS", logo: "/Images/partners/cnps.jpeg" },
    { name: "INS", logo: "/Images/partners/ins.jpg" },
    { name: "Université de Buea", logo: "/Images/partners/prudential.jpg" },
];

const partenairesAca = [
    { name: "Université de Douala", logo: "/Images/partners/douala.jpeg" },
    { name: "EURIA Brest", logo: "/Images/partners/euria.jpeg" },
    { name: "ESTIA", logo: "/Images/partners/estia.png" },
    { name: "Paris Dauphine", logo: "/Images/partners/dauphine.png" },
    {
        name: "Université Bretagne Occidentale",
        logo: "/Images/partners/ubo.png",
    },
];

export default function Partenaires() {
    return (
        <SiteLayout>
            {/* Section Hero */}
            <section className="bg-gradient-to-r from-[#0F8AB1] to-[#31B6DD] text-white py-20 text-center px-6">
                <motion.h1
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                >
                    Nos Partenaires
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg md:text-xl max-w-3xl mx-auto"
                >
                    ESSFAR collabore avec des entreprises et des institutions
                    académiques de renom pour offrir des opportunités uniques à
                    ses étudiants.
                </motion.p>
            </section>

            {/* Partenaires Professionnels */}
            <section className="bg-[#F8F9FA] py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl font-bold text-center text-[#0F8AB1] mb-12"
                    >
                        Partenaires Professionnels
                    </motion.h2>

                    {/* Carrousel logos pro */}
                    <div className="overflow-hidden">
                        <div className="flex gap-12 animate-slide">
                            {[...partenairesPro, ...partenairesPro].map(
                                (p, index) => (
                                    <div
                                        key={index}
                                        className="flex-shrink-0 w-40 h-40 flex items-center justify-center bg-white rounded-full shadow-md"
                                    >
                                        <img
                                            src={p.logo}
                                            alt={p.nom}
                                            className="object-contain w-28 h-28"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Partenaires Académiques */}
            <section className="bg-white py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl font-bold text-center text-[#C82327] mb-12"
                    >
                        Partenaires Académiques
                    </motion.h2>

                    {/* Carrousel logos académiques */}
                    <div className="overflow-hidden">
                        <div className="flex gap-12 animate-slide-reverse">
                            {[...partenairesAca, ...partenairesAca].map(
                                (p, index) => (
                                    <div
                                        key={index}
                                        className="flex-shrink-0 w-40 h-40 flex items-center justify-center bg-[#F8F9FA] rounded-full shadow-md"
                                    >
                                        <img
                                            src={p.logo}
                                            alt={p.nom}
                                            className="object-contain w-28 h-28"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#F8F9FA] py-16 px-6 text-center">
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-2xl font-bold text-[#0F8AB1] mb-4"
                >
                    Vous souhaitez devenir partenaire ?
                </motion.h3>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-[#6C757D] mb-6 max-w-2xl mx-auto"
                >
                    Rejoignez notre réseau d’entreprises et institutions et
                    contribuez à former les leaders de demain.
                </motion.p>
                <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/contact"
                    className="inline-block bg-[#C82327] hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-md shadow-md transition-all duration-300"
                >
                    Contactez-nous
                </motion.a>
            </section>
        </SiteLayout>
    );
}
