import { Link } from "@inertiajs/react";
import { FaArrowRight } from "react-icons/fa";

export default function Certifications() {
    const certifications = [
        {
            title: "Certification Professionnelle en Finance",
            slug: "certification-professionnelle-en-finance",
        },
        {
            title: "Certification en Risk Management",
            slug: "certification-en-risk-management",
        },
        {
            title: "Certificat de Spécialité en Data",
            slug: "certificat-specialite-data",
        },
        {
            title: "Master spacialisé en IA (eBIHAR)",
            slug: "master-specialise-ia",
        },
    ];

    return (
        <section className="bg-gray-50 py-20 px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                {/* Texte à gauche */}
                <div className="text-center md:text-left">
                    <div className="w-12 h-1 bg-[#C82327] mb-3 mx-auto md:mx-0"></div>
                    <h4 className="text-[#C82327] font-medium text-lg">
                        Votre passeport vers l'excellence
                    </h4>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0F8AB1] mt-2">
                        Boostez votre carrière avec des{" "}
                        <span className="text-[#0F8AB1]">
                            certifications professionnelles.
                        </span>
                    </h2>
                </div>

                {/* Liste à droite */}
                <div className="flex flex-col gap-4">
                    {certifications.map((certif, idx) => (
                        <Link
                            key={idx}
                            href={`/certifications/${certif.slug}`}
                            className="flex justify-between items-center bg-[#0F8AB1] text-white px-6 py-4 rounded-md shadow hover:bg-[#C82327] transition"
                        >
                            {certif.title}
                            <FaArrowRight />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
