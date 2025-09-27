// Section Agenda
export default function AgendaSection() {
    const events = [
        {
            id: 1,
            image: "/Images/Visuel.png",
            title: "Concours session du mois d'Aout",
            date: "Jeudi 27 Aout 2025",
            inscription: "Clôture des inscriptions 15 septembre 2025",
            link: "#",
        },
        {
            id: 2,
            image: "/Images/Visuel.png",
            title: "Concours session du mois d'Aout",
            date: "Jeudi 27 Aout 2025",
            inscription: "Clôture des inscriptions 15 septembre 2025",
            link: "#",
        },
        {
            id: 3,
            image: "/Images/Visuel.png",
            title: "Concours session du mois d'Aout",
            date: "Jeudi 27 Aout 2025",
            inscription: "Clôture des inscriptions 15 septembre 2025",
            link: "#",
        },
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                {/* Titre */}
                <h2 className="text-3xl md:text-4xl font-bold text-[#0F8AB1] mb-12 text-center">
                    📅 Agenda ESSFAR
                </h2>

                {/* Grille des événements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2"
                        >
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-64 object-cover"
                            />
                            <div className="p-6 flex flex-col justify-between h-56">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {event.title}
                                </h3>
                                <p className="text-sm text-[#0F8AB1] font-medium">
                                    {event.date}
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    {event.inscription}
                                </p>
                                <a
                                    href={event.link}
                                    className="block w-full text-center bg-[#C82327] text-white py-2 rounded-xl font-medium hover:bg-[#0F8AB1] transition"
                                >
                                    En savoir plus
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lien vers tous les évènements */}
                <div className="text-center mt-10">
                    <a
                        href="#"
                        className="text-[#0F8AB1] font-medium hover:underline"
                    >
                        Voir tous les évènements
                    </a>
                </div>
            </div>
        </section>
    );
}
