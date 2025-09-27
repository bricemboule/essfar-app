"use client";
import SiteLayout from "@/Layouts/SiteLayout";
import { motion } from "framer-motion";
import { ArrowRightCircle } from "lucide-react";
import { Link } from "@inertiajs/react";

const programmes = {
    Certifications: [
        {
            title: "BANQUE – FINANCE",
            url: route("formation.mathematiques_economie"),
        },
        {
            title: "LEADERSHIP ET GESTION DE PROJETS",
            url: route("formation.informatiques_des_organisations"),
        },
        {
            title: "ASSURANCE ET RISQUES",
            url: route("formation.informatiques_des_organisations"),
        },

        {
            title: "STATISTIQUES, BIG DATA ET INTELLIGENCE ARTIFICIELLE",
            url: route("formation.informatiques_des_organisations"),
        },

        {
            title: "Développeur Fullstack web & Mobile",
            url: route("formation.informatiques_des_organisations"),
        },
        {
            title: "Architecte Big Data et IA dans le Cloud",
            url: route("formation.informatiques_des_organisations"),
        },
        {
            title: "Developpeur SQL Avancé",
            url: route("formation.informatiques_des_organisations"),
        },
        {
            title: "Architecte de l'IA & Big Data",
            url: route("formation.informatiques_des_organisations"),
        },
    ],
    Master: [
        {
            title: "Master 2 (Master of Sciences) Européen en IA & Big Data",
            url: route("formation.big_data"),
        },
    ],
};

const ProgrammeCard = ({ title, url }) => (
    <Link href={url} className="block">
        <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 shadow-md rounded-xl p-6 flex items-center justify-between cursor-pointer hover:shadow-lg hover:border-[#0F8AB1]"
        >
            <span className="font-semibold text-gray-800">{title}</span>
            <ArrowRightCircle className="text-[#0F8AB1]" size={24} />
        </motion.div>
    </Link>
);

export default function Salarier() {
    return (
        <SiteLayout>
            <div className="bg-gradient-to-b from-[#F8F9FA] to-white py-20 px-6">
                {/* HERO */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold text-[#0F8AB1] mb-4">
                        Nos Programmes
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Choisissez le programme qui correspond à votre avenir.
                        Licences et Masters professionnels adaptés au marché
                        africain.
                    </p>
                </div>

                {/* Licences */}
                <section className="max-w-6xl mx-auto mb-20">
                    <h2 className="text-2xl font-bold text-[#C82327] mb-8 flex items-center gap-3">
                        <span className="w-10 h-1 bg-[#C82327] inline-block"></span>
                        Certifications Professionnelles
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {programmes.Certifications.map((item, idx) => (
                            <ProgrammeCard
                                key={idx}
                                title={item.title}
                                url={item.url}
                            />
                        ))}
                    </div>
                </section>

                {/* Masters */}
                <section className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-[#C82327] mb-8 flex items-center gap-3">
                        <span className="w-10 h-1 bg-[#C82327] inline-block"></span>
                        Masters Specialisé
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {programmes.Master.map((item, idx) => (
                            <ProgrammeCard
                                key={idx}
                                title={item.title}
                                url={item.url}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </SiteLayout>
    );
}
