import { motion } from "framer-motion";

function Specialite() {
    const items = [
        { title: "Actuariat", image: "/Images/assurance.jpeg" },
        {
            title: "Statistiques, Big Data et Intelligence Artificielle",
            image: "/Images/ia.jpeg",
        },
        { title: "Ingénierie Financière", image: "/Images/finance.jpeg" },
        { title: "Systèmes d'Information", image: "/Images/ia.jpeg" },
    ];

    // Variantes pour l’animation des lettres
    const letterAnimation = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.08, // décalage par lettre
                duration: 0.5,
                ease: "easeOut",
            },
        }),
    };

    const title = "Nos spécialités";

    return (
        <section className="relative py-20 overflow-hidden bg-gray-50">
            {/* Particules flottantes */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(25)].map((_, i) => (
                    <span
                        key={i}
                        className="absolute w-2 h-2 bg-[#0F8AB1] rounded-full opacity-70 animate-float"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${5 + Math.random() * 10}s`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>

            {/* Contenu */}
            <div className="relative z-10">
                {/* Titre animé */}
                <motion.h2
                    className="text-4xl md:text-5xl text-[#0F8AB1] font-extrabold text-center mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {title.split("").map((char, i) => (
                        <motion.span
                            key={i}
                            custom={i}
                            variants={letterAnimation}
                            className="inline-block"
                        >
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </motion.h2>

                {/* Grille de spécialités */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-6">
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center text-center 
                                hover:shadow-2xl hover:-translate-y-3 transition-all duration-500"
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.7,
                                delay: index * 0.2,
                                ease: "easeOut",
                            }}
                            viewport={{ once: false, amount: 0.3 }}
                        >
                            <motion.img
                                src={item.image}
                                alt={item.title}
                                className="w-28 h-28 object-cover mb-6 rounded-full border-4 border-gray-100 shadow-md"
                                whileHover={{ scale: 1.1, rotate: 3 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            />
                            <h3 className="text-lg font-semibold text-gray-800">
                                {item.title}
                            </h3>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Specialite;
