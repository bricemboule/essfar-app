"use client";
import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";
import { BookOpen, Globe2, Briefcase, HeartHandshake } from "lucide-react";
import SiteLayout from "@/Layouts/SiteLayout";

const projet = [
    {
        name: "L’excellence Académique",
        icon: BookOpen,
        color: "from-[#0F8AB1] to-[#31B6DD]",
        items: [
            "La sélection des meilleurs étudiants via des concours,",
            "La sélection des meilleurs enseignants (enquêtes de satisfaction régulières),",
            "Des infrastructures de qualité : bibliothèque physique et numérique, salle informatique, wifi haut débit, restauration.",
        ],
    },
    {
        name: "L’internationalisation",
        icon: Globe2,
        color: "from-[#31B6DD] to-[#0F8AB1]",
        items: [
            "La maîtrise de l’anglais attestée par des certifications,",
            "Le développement des partenariats académiques permettant mobilité et conformité aux standards internationaux,",
            "L’ouverture aux étudiants étrangers.",
        ],
    },
    {
        name: "La professionnalisation",
        icon: Briefcase,
        color: "from-[#C82327] to-[#E30613]",
        items: [
            "Pédagogie alliant théorie et pratique dès la 1ère année,",
            "Intervention de professionnels dans les formations,",
            "Partenariats avec les entreprises pour l’insertion et la formation continue,",
            "Soutien à l’entrepreneuriat et aux projets innovants.",
        ],
    },
    {
        name: "L’inclusion sociale",
        icon: HeartHandshake,
        color: "from-[#6C757D] to-[#ADB5BD]",
        items: [
            "Respect des valeurs de solidarité, d’équité et d’égalité,",
            "Attribution de bourses ou prêts aux étudiants méritants issus de milieux modestes.",
        ],
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
};

const ProjetPedagogique = () => {
    return (
        <SiteLayout>
            <div className="bg-[#F8F9FA]">
                {/* HERO */}
                <section className="bg-gradient-to-r from-[#0F8AB1] to-[#31B6DD] text-white text-center py-16 px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Notre Projet Pédagogique
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-lg md:text-xl max-w-3xl mx-auto"
                    >
                        L’ESSFAR construit son projet pédagogique autour de{" "}
                        <span className="font-semibold">
                            quatre valeurs clés
                        </span>{" "}
                        qui guident la formation de ses étudiants et
                        garantissent son excellence.
                    </motion.p>
                </section>

                {/* VALEURS */}
                <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                    {projet.map((valeur, idx) => (
                        <motion.div
                            key={valeur.name}
                            custom={idx}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            {/* Header coloré */}
                            <div
                                className={`bg-gradient-to-r ${valeur.color} p-6 flex items-center gap-4`}
                            >
                                <valeur.icon className="text-white w-10 h-10" />
                                <h2 className="text-xl font-bold text-white">
                                    {valeur.name}
                                </h2>
                            </div>

                            {/* Contenu */}
                            <div className="p-6">
                                <ul className="list-disc list-inside space-y-3 text-gray-700">
                                    {valeur.items.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.15 }}
                                        >
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </section>
            </div>
        </SiteLayout>
    );
};

export default ProjetPedagogique;
