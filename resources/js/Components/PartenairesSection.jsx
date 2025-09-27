import Marquee from "react-fast-marquee";

const PartenairesSection = () => {
    const partenairesEntreprises = [
        { name: "CNPS", logo: "/Images/partners/cnps.jpeg" },
        { name: "INS", logo: "/Images/partners/ins.jpg" },
        { name: "Université de Buea", logo: "/Images/partners/prudential.jpg" },
    ];

    const partenairesInternationaux = [
        { name: "Université de Douala", logo: "/Images/partners/douala.jpeg" },
        { name: "EURIA Brest", logo: "/Images/partners/euria.jpeg" },
        { name: "ESTIA", logo: "/Images/partners/estia.png" },
        { name: "Paris Dauphine", logo: "/Images/partners/dauphine.png" },
        {
            name: "Université Bretagne Occidentale",
            logo: "/Images/partners/ubo.png",
        },
    ];

    // Composant carte
    const Card = ({ src, alt }) => (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4 flex items-center justify-center h-24 w-44">
            <img src={src} alt={alt} className="max-h-16 object-contain" />
        </div>
    );

    return (
        <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#0F8AB1]">
                    Nos Partenaires
                </h2>
                <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
                    ESSFAR collabore avec des entreprises et institutions
                    académiques de renommée, renforçant l’excellence académique
                    et l’insertion professionnelle.
                </p>
            </div>

            {/* Partenaires Entreprises */}
            <div className="bg-[#0F8AB1] py-8 rounded-2xl mb-12 shadow-lg">
                <h3 className="text-center text-white text-2xl font-semibold mb-6">
                    Partenaires Entreprises
                </h3>
                <Marquee pauseOnHover speed={50} gradient={false}>
                    <div className="flex gap-10">
                        {partenairesEntreprises.map((p, idx) => (
                            <Card key={idx} src={p.logo} alt={p.name} />
                        ))}
                    </div>
                </Marquee>
            </div>

            {/* Partenaires Internationaux */}
            <div className="bg-[#C82327] py-8 rounded-2xl shadow-lg">
                <h3 className="text-center text-white text-2xl font-semibold mb-6">
                    Partenaires Académiques Internationaux
                </h3>
                <Marquee
                    pauseOnHover
                    speed={50}
                    gradient={false}
                    direction="right"
                >
                    <div className="flex gap-10">
                        {partenairesInternationaux.map((p, idx) => (
                            <Card key={idx} src={p.logo} alt={p.name} />
                        ))}
                    </div>
                </Marquee>
            </div>
        </section>
    );
};

export default PartenairesSection;
