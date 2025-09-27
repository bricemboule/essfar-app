import React from "react";
import { GraduationCap, Building2, Users, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";

function Chiffre() {
    const Counter = ({ target, label, Icon }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            let start = 0;
            const duration = 2000; // 2s
            const stepTime = Math.abs(Math.floor(duration / target));

            const timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start >= target) clearInterval(timer);
            }, stepTime);

            return () => clearInterval(timer);
        }, [target]);

        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center transition hover:shadow-2xl hover:scale-105 duration-300">
                <Icon className="w-12 h-12 text-[#0F8AB1] mb-4" />
                <h3 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                    {count.toLocaleString()}+
                </h3>
                <p className="text-gray-600 mt-2 text-lg">{label}</p>
            </div>
        );
    };
    return (
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#0F8AB1]">
                    Nos chiffres parlent d’eux-mêmes
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    <Counter
                        target={500}
                        label="Étudiants formés"
                        Icon={GraduationCap}
                    />
                    <Counter
                        target={10}
                        label="Partenaires académiques"
                        Icon={Building2}
                    />
                    <Counter
                        target={200}
                        label="Experts et enseignants"
                        Icon={Users}
                    />
                    <Counter
                        target={98}
                        label="% d’insertion professionnelle"
                        Icon={Briefcase}
                    />
                </div>
            </div>
        </section>
    );
}

export default Chiffre;
