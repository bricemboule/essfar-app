import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EventsSection() {
    const events = [
        {
            title: "Concours 2025",
            date: "06 Mars 2025",
            desc: "Les inscriptions pour le concours d’entrée sont ouvertes. Ne manquez pas cette opportunité.",
            img: "/Images/partners/douala.jpeg",
        },
        {
            title: "Webinaire Gestion des Risques",
            date: "15 Avril 2025",
            desc: "Un événement en ligne avec des experts de renommée internationale dans le domaine.",
            img: "/Images/partners/euria.jpeg",
        },
        {
            title: "Journée Portes Ouvertes",
            date: "10 Juin 2025",
            desc: "Venez découvrir notre campus, rencontrer nos enseignants et échanger avec nos étudiants.",
            img: "/Images/partners/estia.png",
        },
        {
            title: "Forum de l'Innovation",
            date: "Septembre 2025",
            desc: "Une journée dédiée aux projets innovants et aux partenariats académiques et professionnels.",
            img: "/Images/partners/ubo.png",
        },
    ];

    const [index, setIndex] = useState(0);

    // Défilement automatique toutes les 5 sec
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % events.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [events.length]);

    const nextSlide = () => setIndex((prev) => (prev + 1) % events.length);
    const prevSlide = () =>
        setIndex((prev) => (prev - 1 + events.length) % events.length);

    return (
        <section className="py-20 px-6 bg-gray-50">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-12">
                    Actualités & Événements
                </h2>

                <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-white">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <img
                                src={events[index].img}
                                alt={events[index].title}
                                className="w-full h-64 object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                                {events[index].date}
                            </div>

                            <div className="p-6 text-left">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {events[index].title}
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    {events[index].desc}
                                </p>
                                <button className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                                    En savoir plus →
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Boutons navigation */}
                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white"
                    >
                        ◀
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white"
                    >
                        ▶
                    </button>
                </div>

                {/* Indicateurs */}
                <div className="flex justify-center mt-4 gap-2">
                    {events.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`w-3 h-3 rounded-full ${
                                i === index ? "bg-blue-600" : "bg-gray-300"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
