import { Briefcase, RefreshCcw, GraduationCap } from "lucide-react";

export default function ProfilsSection() {
    const profils = [
        {
            id: 1,
            titre: "Je suis salarié(e)",
            description:
                "Formez-vous en continu avec des programmes flexibles.",
            icon: <Briefcase className="w-10 h-10 text-blue-600" />,
            image: "/Images/salaire.avif",
        },
        {
            id: 2,
            titre: "Je suis en reconversion",
            description: "Changez de carrière avec nos parcours accélérés.",
            icon: <RefreshCcw className="w-10 h-10 text-green-600" />,
            image: "/Images/reconversion.avif",
        },
        {
            id: 3,
            titre: "Je suis étudiant(e)",
            description:
                "Intégrez nos Licences et Masters reconnus par l’État.",
            icon: <GraduationCap className="w-10 h-10 text-orange-600" />,
            image: "/Images/etudiant.avif",
        },
    ];

    return (
        <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-[#0F8AB1] mb-12">
                    ESSFAR accompagne tous les profils
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {profils.map((profil) => (
                        <div
                            key={profil.id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2"
                        >
                            <div className="relative">
                                <img
                                    src={profil.image}
                                    alt={profil.titre}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-white p-3 rounded-full shadow">
                                    {profil.icon}
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                    {profil.titre}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {profil.description}
                                </p>
                                <button className="bg-[#C82327] text-white px-5 py-2 rounded-xl font-medium hover:bg-[#0F8AB1] transition">
                                    En savoir plus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
