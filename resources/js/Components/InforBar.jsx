import React from "react";
import Marquee from "react-fast-marquee";

export default function InfoBar() {
    const infos = [
        "Inscription ouvertes jusqu'en octobre ",
        "Inscription Lincence sur concours, Master sur étude de dossier",
        "Rentée Cycle Licence : 29 Septembre 2025",
        "Rentée Cycle Master : 13 Octobre 2025",
    ];

    return (
        <div className="bg-gray-100 border-y border-gray-300 flex items-center">
            {/* Label à gauche */}
            <div className="bg-sky-600 text-white italic px-4 py-2 font-semibold whitespace-nowrap">
                Informations Utiles
            </div>

            {/* Texte défilant */}
            <Marquee
                gradient={false}
                speed={60}
                pauseOnHover={true}
                pauseOnClick={true}
                className=" font-medium text-sm sm:text-base"
            >
                {infos.map((info, index) => (
                    <span key={index} className="mx-8 text-[#C82327]">
                        {info}
                    </span>
                ))}
            </Marquee>
        </div>
    );
}
