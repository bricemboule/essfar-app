import { useState } from "react";
import { FaFileDownload } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SiteLayout from "@/Layouts/SiteLayout";

const L1 = [
    {
        session: "Session Mars 2025",
        sujet: [
            {
                intitule: "Epreuve de Mathématiques VF",
                fichier:
                    "/pdf/sujet/L1/Concours ESSFAR L1 Session Mars 2025 - Mathématiques VF.pdf",
            },
            {
                intitule: "Epreuve de Mathématiques VA",
                fichier:
                    "/pdf/sujet/L1/Concours ESSFAR L1 Session Mars 2025 - Mathématiques VA.pdf",
            },
        ],
    },
    {
        session: "Session Janvier 2025",
        sujet: [
            {
                intitule: "Epreuve de Mathématiques VF",
                fichier:
                    "/pdf/sujet/L1/Concours ESSFAR L1 Session Janvier 2025 - Mathématiques VF.pdf",
            },
            { intitule: "Epreuve de Mathématiques VA", fichier: "" },
        ],
    },
    // ajoute toutes les autres sessions L1 ici
];

const L2 = [
    {
        session: "Session Exemple L2",
        sujet: [
            { intitule: "Epreuve de Mathématiques VF", fichier: "" },
            { intitule: "Epreuve de Mathématiques VA", fichier: "" },
        ],
    },
];

const L3 = [
    {
        session: "Session Avril 2020",
        sujet: [
            {
                intitule: "Epreuve de Mathématiques VF",
                fichier:
                    "/pdf/sujet/L3/Concours ESSFAR L3 Session Avril 2020 - Mathematiques VF.pdf",
            },
            { intitule: "Epreuve de Mathématiques VA", fichier: "" },
        ],
    },
    // ajoute toutes les autres sessions L3 ici
];

const Act = [
    {
        session: "Concours Master Actuariat",
        sujet: [
            {
                intitule: "Epreuve de Mathématiques Septembre 2019",
                fichier:
                    "/pdf/sujet/act/Concours d'entree en Master I - Session de septembre - Mathematiques.pdf",
            },
            {
                intitule: "Epreuve de Mathématiques Septembre 2020",
                fichier:
                    "/pdf/sujet/act/Concours ESSFAR M1 Session Septembre 2020- Maths.pdf",
            },
            // ajoute toutes les autres sessions
        ],
    },
];

const Big = [
    {
        session: "Concours Master Big Data",
        sujet: [
            { intitule: "Epreuve d'informatique VF", fichier: "" },
            { intitule: "Epreuve d'informatique VA", fichier: "" },
        ],
    },
];

const Inf = [
    {
        session: "Concours Master Ingénierie Financière",
        sujet: [
            { intitule: "Epreuve d'IF VF", fichier: "" },
            { intitule: "Epreuve d'IF VA", fichier: "" },
        ],
    },
];

// Niveaux et sujets simplifiés
const niveaux = [
    { id: "un", intitule: "1ERE ANNEE", sujets: L1 },
    { id: "deux", intitule: "2EME ANNEE", sujets: L2 },
    { id: "trois", intitule: "3EME ANNEE", sujets: L3 },
    { id: "quatre", intitule: "MASTER I ACTUARIAT", sujets: Act },
    { id: "cinq", intitule: "MASTER I BIG DATA", sujets: Big },
    { id: "six", intitule: "MASTER I INGENIERIE FINANCIERE", sujets: Inf },
];

// Composant pour chaque sujet
const SujetCard = ({ intitule, fichier }) => {
    const isVA = intitule.toLowerCase().includes("va");
    const bgColor = isVA ? "bg-[#0F8AB1]/20" : "bg-[#C82327]/20";
    return (
        <div
            className={`flex justify-between items-center p-3 rounded-lg shadow-md ${bgColor} mb-2`}
        >
            <p className="font-medium">{intitule}</p>
            {fichier && (
                <a
                    href={fichier}
                    download={intitule}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C82327] hover:text-[#0F8AB1]"
                >
                    <FaFileDownload size={20} />
                </a>
            )}
        </div>
    );
};

// Composant pour chaque session
const SessionCard = ({ session, filtre }) => {
    const [open, setOpen] = useState(false);

    const sujetsFiltres = session.sujet.filter((sujet) => {
        if (!filtre || filtre === "Tous") return true;
        return sujet.intitule.toLowerCase().includes(filtre.toLowerCase());
    });

    if (!sujetsFiltres.length) return null;

    return (
        <motion.div
            layout
            className="border rounded-xl shadow-lg mb-4 overflow-hidden"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left px-4 py-3 bg-[#0F8AB1] text-white font-semibold hover:bg-[#0F6F91] flex justify-between items-center"
            >
                <span>{session.session || "Session"}</span>
                <span className="text-xl">{open ? "−" : "+"}</span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-white"
                    >
                        {sujetsFiltres.map((sujet, idx) => (
                            <SujetCard
                                key={idx}
                                intitule={sujet.intitule}
                                fichier={sujet.fichier}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const Sujet = () => {
    const [activeNiveau, setActiveNiveau] = useState("un");
    const [filtre, setFiltre] = useState("Tous");

    const types = ["Tous", "VF", "VA"];

    return (
        <SiteLayout>
            <div className="my-8 px-4">
                <h1 className="text-5xl text-center font-tangeri mb-8 text-[#0F8AB1]">
                    Anciennes Epreuves
                </h1>

                {/* Navigation niveaux */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                    {niveaux.map((niveau) => (
                        <button
                            key={niveau.id}
                            className={`py-2 px-3 rounded-md text-white font-medium transition ${
                                activeNiveau === niveau.id
                                    ? "bg-[#C82327]"
                                    : "bg-[#0F8AB1] hover:bg-[#0F6F91]"
                            }`}
                            onClick={() => setActiveNiveau(niveau.id)}
                        >
                            {niveau.intitule}
                        </button>
                    ))}
                </div>

                {/* Filtre VA/VF */}
                <div className="flex justify-center gap-3 mb-6">
                    {types.map((type) => (
                        <button
                            key={type}
                            className={`py-1 px-3 rounded-md border transition ${
                                filtre === type
                                    ? "bg-[#0F8AB1] text-white border-[#0F8AB1]"
                                    : "bg-white text-black border-gray-300"
                            }`}
                            onClick={() => setFiltre(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Contenu dynamique des sujets */}
                {niveaux
                    .filter((niveau) => niveau.id === activeNiveau)
                    .map((niveau) => (
                        <div key={niveau.id}>
                            {niveau.sujets.map((session, idx) => (
                                <SessionCard
                                    key={idx}
                                    session={session}
                                    filtre={filtre}
                                />
                            ))}
                        </div>
                    ))}
            </div>
        </SiteLayout>
    );
};

export default Sujet;
