"use client";
import SiteLayout from "@/Layouts/SiteLayout";
import { motion } from "framer-motion";
import { GraduationCap, Users } from "lucide-react";

const membresConseil = [
    {
        nom: "Patrick SEUMEN TONOU",
        role: "Président du Conseil Scientifique",
        photo: "/Images/dg.png",
    },
    {
        nom: "Etienne TSAMO",
        role: "Membre du Conseil Scientifique",
        photo: "/Images/dac.png",
    },
    {
        nom: "Gabriel NGUETSENG",
        role: "Membre du Conseil Scientifique",
        photo: "/Images/Nguetseng.png",
    },
    {
        nom: "Siméon FOTSO",
        role: "Membre du Conseil Scientifique",
        photo: "/Images/Fotso.png",
    },
];

const membresDirection = [
    {
        nom: "Patrick SEUMEN TONOU",
        role: "Directeur Général",
        photo: "/Images/dg.png",
    },
    {
        nom: "Etienne TSAMO",
        role: "Directrice Académique",
        photo: "/Images/dac.png",
    },
    {
        nom: "Myriam MAKON",
        role: "Manager de la communication et relation avec les entreprises",
        photo: "/Images/Makon.png",
    },
    {
        nom: "Donald MBAPOU",
        role: "Responsable scolarité",
        photo: "/Images/dg.png",
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 60, rotateY: 90 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        rotateY: 0,
        transition: {
            delay: i * 0.25,
            duration: 0.8,
            ease: "easeOut",
        },
    }),
};

const Gouvernance = () => {
    return (
        <SiteLayout>
            <div className="bg-[#F8F9FA]">
                {/* HERO */}
                <section className="bg-gradient-to-r from-[#0F8AB1] to-[#31B6DD] text-white text-center py-20 px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Gouvernance de l’ESSFAR
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        La gouvernance repose sur un{" "}
                        <span className="font-semibold">
                            Conseil Scientifique
                        </span>{" "}
                        garant de l’excellence académique, et une{" "}
                        <span className="font-semibold">Direction</span> qui
                        pilote la stratégie et le développement.
                    </motion.p>
                </section>

                {/* TIMELINE */}
                <section className="relative py-20 px-6 max-w-6xl mx-auto">
                    {/* Ligne verticale de la timeline */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-[900px] bg-gradient-to-b from-[#31B6DD] to-[#C82327]"></div>

                    {/* Étape Conseil Scientifique */}
                    <div className="relative mb-20">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-[#31B6DD] text-white p-4 rounded-full shadow-lg mb-6">
                                <GraduationCap size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-[#31B6DD] mb-6">
                                Conseil Scientifique
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                                {membresConseil.map((membre, idx) => (
                                    <motion.div
                                        key={idx}
                                        custom={idx}
                                        variants={cardVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.2 }}
                                        whileHover={{ scale: 1.07, rotateY: 5 }}
                                        className="bg-white rounded-xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-[0_0_25px_#31B6DD50]"
                                    >
                                        <div className="overflow-hidden rounded-full w-32 h-32 mx-auto mb-4 border-4 border-[#31B6DD]">
                                            <motion.img
                                                src={membre.photo}
                                                alt={membre.nom}
                                                className="w-full h-full object-cover"
                                                whileHover={{ scale: 1.15 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <h4 className="text-lg font-semibold text-[#212529]">
                                            {membre.nom}
                                        </h4>
                                        <p className="text-[#6C757D] text-sm">
                                            {membre.role}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Étape Direction */}
                    <div className="relative">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-[#C82327] text-white p-4 rounded-full shadow-lg mb-6">
                                <Users size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-[#C82327] mb-6">
                                Direction de l’École
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                                {membresDirection.map((membre, idx) => (
                                    <motion.div
                                        key={idx}
                                        custom={idx}
                                        variants={cardVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.2 }}
                                        whileHover={{
                                            scale: 1.07,
                                            rotateY: -5,
                                        }}
                                        className="bg-white rounded-xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-[0_0_25px_#C8232750]"
                                    >
                                        <div className="overflow-hidden rounded-full w-32 h-32 mx-auto mb-4 border-4 border-[#C82327]">
                                            <motion.img
                                                src={membre.photo}
                                                alt={membre.nom}
                                                className="w-full h-full object-cover"
                                                whileHover={{ scale: 1.15 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <h4 className="text-lg font-semibold text-[#212529]">
                                            {membre.nom}
                                        </h4>
                                        <p className="text-[#6C757D] text-sm">
                                            {membre.role}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </SiteLayout>
    );
};

export default Gouvernance;
