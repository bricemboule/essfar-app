export default function GallerySection() {
    const images = [
        "/Images/Visuel.png",
        "/Images/assurance.jpeg",
        "/Images/finance.jpeg",
        "/Images/ia.jpeg",
        "/Images/Visuel.png",
        "/Images/Visuel.png",
        "/Images/assurance.jpeg",
        "/Images/salaire.avif",
    ];

    return (
        <section className="py-4 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-[#0F8AB1] text-center mb-12">
                    Galerie
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-4 gap-6">
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-xl shadow-lg group"
                        >
                            <img
                                src={img}
                                alt={`Gallery ${i + 1}`}
                                className="w-full h-64 object-cover transform group-hover:scale-110 transition duration-500"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium text-lg transition">
                                Voir plus
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
