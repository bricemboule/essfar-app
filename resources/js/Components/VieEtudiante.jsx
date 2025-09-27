"use client";
import { useState, useEffect } from "react";

export default function VieEtudiante() {
    const images = [
        "/Images/Visuel.png",
        "/Images/Visuel.png",
        "/Images/Visuel.png",
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 4000); // défile toutes les 4s
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Images défilantes */}
                <div className="relative h-80 md:h-96 overflow-hidden rounded-2xl shadow-lg">
                    {images.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`Vie étudiante ${index + 1}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                                index === current ? "opacity-100" : "opacity-0"
                            }`}
                        />
                    ))}
                </div>

                {/* Texte */}
                <div>
                    <h3 className="text-3xl font-bold text-[#0F8AB1] mb-4">
                        Vie Étudiante
                    </h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Étudiez dans un campus moderne avec salles équipées,
                        médiathèque, espaces verts et restauration. Bénéficiez
                        de clubs actifs et d'un réseau alumni de +500
                        professionnels pour votre épanouissement.
                    </p>
                    <a
                        href="#"
                        className="inline-block px-6 py-3 bg-[#C82327] text-white rounded-xl font-medium shadow hover:bg-[#0F8AB1] transition"
                    >
                        DÉCOUVRIR NOTRE EXPÉRIENCE ÉTUDIANTE
                    </a>
                </div>
            </div>
        </section>
    );
}
