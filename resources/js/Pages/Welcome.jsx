import InfoBar from "@/Components/InforBar";
import SiteLayout from "@/Layouts/SiteLayout";
import { useState, useEffect } from "react";
import GallerySection from "@/Components/GallerySection";
import ProfilsSection from "@/Components/ProfilsSection";
import AgendaSection from "@/Components/AgendaSection";
import VieEtudiante from "@/Components/VieEtudiante";
import Certifications from "@/Components/Certifications";
import PromoBanner from "@/Components/PromoBanner";
import PartenairesSection from "@/Components/PartenairesSection";
import Apropo from "@/Components/Apropo";
import Chiffre from "@/Components/Chiffre";
import Specialite from "@/Components/Specialite";

export default function Welcome() {
    const slides = [
        {
            image: "/Images/finance.jpeg",
            title: "Leader en formation financière, assurance & risques",
            description:
                "Programmes adaptés aux étudiants, salariés ou en reconversion.",
            btn1: { text: "Découvrir les formations", href: "/formations" },
            btn2: { text: "Postuler maintenant", href: "/concours" },
        },
        {
            image: "/Images/assurance.jpeg",
            title: "Maîtrisez les fondamentaux de l’actuariat",
            description:
                "Des cours interactifs et des formateurs expérimentés.",
            btn1: { text: "Voir nos programmes", href: "" },
            btn2: { text: "S'inscrire", href: "" },
        },
        {
            image: "/Images/ia.jpeg",
            title: "Gérez efficacement les volumes de données des entreprises",
            description: "Formations pratiques pour une carrière solide.",
            btn1: { text: "Explorer les cursus", href: "" },
            btn2: { text: "Rejoindre maintenant", href: "" },
        },
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000); // change toutes les 5s
        return () => clearInterval(timer);
    }, [slides.length]);
    return (
        <SiteLayout>
            {/* Hero */}
            <section className="relative h-[40vh] sm:h-[50vh] lg:h-[65vh] w-full overflow-hidden">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === current ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="h-full w-full object-cover"
                        />
                        {/* Overlay sombre */}
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-6">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4">
                                {slide.title}
                            </h1>
                            <p className="text-lg md:text-xl mb-6">
                                {slide.description}
                            </p>
                            <div className="space-x-4">
                                <a
                                    href={slide.btn1.href}
                                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded font-semibold"
                                >
                                    {slide.btn1.text}
                                </a>
                                <a
                                    href={slide.btn2.href}
                                    className="bg-white text-[#0F8AB1] hover:bg-gray-200 px-6 py-3 rounded font-semibold"
                                >
                                    {slide.btn2.text}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Indicateurs */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`w-3 h-3 rounded-full ${
                                index === current ? "bg-red-600" : "bg-white/60"
                            }`}
                            onClick={() => setCurrent(index)}
                        />
                    ))}
                </div>
            </section>
            <div>
                <InfoBar />

                {/* Nos specialites */}
                <Specialite />
                {/* Profils */}
                <ProfilsSection />
                <AgendaSection />

                {/*Nos chiffres */}
                <Chiffre />
                {/* Agenda & annonces */}

                {/* À propos */}
                <Apropo />

                {/* Certifications */}
                <Certifications />
                <PromoBanner />
                {/* Vie etudiante */}
                <VieEtudiante />
                {/* Partenaires */}
                <PartenairesSection />

                {/*Galerie */}
                <GallerySection />
            </div>
        </SiteLayout>
    );
}
