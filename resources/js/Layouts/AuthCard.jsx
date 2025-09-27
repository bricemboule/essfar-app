export default function AuthCard({ title, description, children }) {
    return (
        <div className="bg-white shadow-lg rounded-xl flex w-full max-w-4xl overflow-hidden">
            {/* Colonne gauche */}
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#0F8AB1] text-white p-10">
                <img
                    src="/Images/Logo-ESSFAR.png"
                    alt="ESSFAR"
                    className="h-16 mb-6"
                />
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                {description && (
                    <p className="text-center text-sm leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            {/* Colonne droite (contenu injecté) */}
            <div className="flex-1 p-8 md:p-10">{children}</div>
        </div>
    );
}
