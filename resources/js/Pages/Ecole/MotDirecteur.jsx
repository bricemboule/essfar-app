import SiteLayout from "@/Layouts/SiteLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function MotDirecteur() {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <SiteLayout>
            <section className="bg-[#F8F9FA] relative min-h-[40vh] sm:min-h-[50vh] lg:min-h-[65vh] w-full overflow-hidden py-16">
                {/* Titre */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h1 className="text-4xl font-bold text-[#0F8AB1]">
                        Mot du Directeur
                    </h1>
                    <div className="w-20 h-1 bg-[#C82327] mx-auto mt-3 rounded-full"></div>
                </motion.div>

                {/* Contenu */}
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        {/* Photo */}
                        <motion.div
                            className="flex justify-center"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-center">
                                <img
                                    src="/Images/dg.png"
                                    alt="Directeur"
                                    className="w-64 h-64 object-cover rounded-full shadow-lg border-4 border-white mx-auto mb-4"
                                />
                                <div className="bg-white p-4 rounded-lg shadow-md">
                                    <h3 className="font-semibold text-[#0F8AB1] text-lg">
                                        Dr. Patrick Seumen Tonou
                                    </h3>
                                    <p className="text-[#6C757D] text-sm">
                                        Directeur Général ESSFAR
                                    </p>
                                    <p className="text-[#6C757D] text-xs mt-1">
                                        Docteur en Mathématiques
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Texte */}
                        <motion.div
                            className="bg-white p-8 rounded-2xl shadow-md"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            {/* Intro */}
                            <div>
                                <p className="text-[#212529] text-lg leading-relaxed mb-4">
                                    Le monde actuel vit une période de
                                    changements sans précédent. L’arrivée à
                                    maturité, de façon quasi simultanée, de
                                    nouvelles technologies numériques génère de
                                    nouveaux usages et transforme radicalement
                                    les métiers dans tous les secteurs
                                    d’activité.
                                </p>
                                <blockquote className="border-l-4 border-[#C82327] pl-4 italic text-[#6C757D] mb-6">
                                    « Notre priorité : l'excellence académique
                                    et l'insertion professionnelle. »
                                </blockquote>
                            </div>

                            {/* Contenu complet */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            ease: "easeInOut",
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-gray-200 pt-6 mt-6 space-y-4 text-[#212529] text-lg leading-relaxed text-justify">
                                            <p>
                                                Ce changement oblige les
                                                organisations à accélérer leur
                                                transformation pour saisir de
                                                nouvelles opportunités,
                                                concevoir de nouveaux services,
                                                repenser leurs modèles
                                                économiques et adapter les
                                                compétences de leurs cadres.
                                            </p>
                                            <p>
                                                Pour le continent Africain,
                                                l’enjeu est de taille. C’est en
                                                Afrique que se situe l’un des
                                                plus grands marchés du numérique
                                                et des services innovants. Les
                                                nouvelles technologies modifient
                                                plus vite les besoins et les
                                                métiers que dans des pays plus
                                                matures. Réussir la 3e
                                                révolution industrielle n’est
                                                pas du « nice to have », mais du
                                                « must to have » : le principal
                                                levier du progrès économique et
                                                social de l’Afrique est
                                                inéluctablement les technologies
                                                digitales et plus
                                                particulièrement celles liées
                                                aux big data.
                                            </p>
                                            <p>
                                                Cette économie du 21e siècle
                                                nécessite à la fois des
                                                compétences techniques et
                                                personnelles (soft skills) :
                                                modélisation mathématique et
                                                informatique, traitement et
                                                analyse des données massives,
                                                travail en équipe, agilité,
                                                adaptabilité, créativité, esprit
                                                critique, curiosité, ouverture
                                                d’esprit…
                                            </p>
                                            <p>
                                                L’ESSFAR a pour mission d’être
                                                l’école de cette Afrique qui
                                                change en formant ici-même en
                                                Afrique des futurs cadres et
                                                managers de haut niveau, dotés
                                                de ces compétences, pour
                                                accompagner les évolutions de
                                                nos sociétés et de nos
                                                entreprises, en particulier dans
                                                les secteurs de la banque, la
                                                finance et l’assurance.
                                            </p>
                                            <p>
                                                Notre ambition est de devenir
                                                l’école régionale d’excellence
                                                dans les mathématiques
                                                appliquées et l’informatique au
                                                service des organisations et de
                                                l’innovation. Si ces domaines
                                                vous attirent, n’hésitez pas à
                                                nous rejoindre pour que votre
                                                objectif devienne aussi notre
                                                objectif : construire votre
                                                avenir et votre pays.
                                            </p>

                                            <div className="text-right mt-6 pt-4 border-t border-gray-200">
                                                <p className="font-semibold text-[#0F8AB1]">
                                                    Dr. Patrick Seumen Tonou
                                                </p>
                                                <p className="text-sm text-[#6C757D]">
                                                    Directeur Général ESSFAR
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Bouton Lire plus/moins */}
                            <motion.button
                                onClick={toggleExpanded}
                                className="inline-flex items-center bg-[#C82327] hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-md shadow-md transition-all duration-300 mt-4"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isExpanded ? (
                                    <>
                                        <span>Lire moins</span>
                                        <ChevronUpIcon className="w-5 h-5 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        <span>Lire la suite</span>
                                        <ChevronDownIcon className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
