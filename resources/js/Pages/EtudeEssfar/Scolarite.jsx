import SiteLayout from "@/Layouts/SiteLayout";
import React from "react";
import { FaFileInvoiceDollar, FaBook, FaMoneyBillWave } from "react-icons/fa";

const fraisParNiveau = {
    L1: { Concours: 20000, Inscription: 230000, Scolarité: 1800000 },
    L2: { Concours: 20000, Inscription: 230000, Scolarité: 1800000 },
    L3: { Concours: 20000, Inscription: 230000, Scolarité: 2000000 },
    Master: { Concours: 20000, Inscription: 230000, Scolarité: 2300000 },
};

const niveauCouleur = {
    L1: "#0F8AB1",
    L2: "#17A2B8",
    L3: "#6610F2",
    Master: "#C82327",
};

const Scolarite = () => {
    return (
        <SiteLayout>
            <div className="mx-4 my-8">
                <h1 className="text-center text-3xl text-[#C82327] font-bold mb-8">
                    Frais de Scolarité
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.keys(fraisParNiveau).map((niveau) => {
                        const total =
                            fraisParNiveau[niveau].Concours +
                            fraisParNiveau[niveau].Inscription +
                            fraisParNiveau[niveau].Scolarité;
                        return (
                            <div
                                key={niveau}
                                className="border rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition"
                                style={{ borderColor: niveauCouleur[niveau] }}
                            >
                                <h2
                                    className="text-xl font-bold mb-4 text-center"
                                    style={{ color: niveauCouleur[niveau] }}
                                >
                                    {niveau}
                                </h2>
                                <div className="space-y-3">
                                    <p className="flex items-center gap-2">
                                        <FaBook className="text-[#0F8AB1]" />{" "}
                                        Concours:{" "}
                                        <span className="font-semibold">
                                            {fraisParNiveau[
                                                niveau
                                            ].Concours.toLocaleString()}{" "}
                                            FCFA
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <FaFileInvoiceDollar className="text-[#17A2B8]" />{" "}
                                        Inscription Administrative:{" "}
                                        <span className="font-semibold">
                                            {fraisParNiveau[
                                                niveau
                                            ].Inscription.toLocaleString()}{" "}
                                            FCFA
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <FaMoneyBillWave className="text-[#C82327]" />{" "}
                                        Scolarité:{" "}
                                        <span className="font-semibold">
                                            {fraisParNiveau[
                                                niveau
                                            ].Scolarité.toLocaleString()}{" "}
                                            FCFA
                                        </span>
                                    </p>
                                </div>
                                <div className="mt-6 text-center font-bold text-lg">
                                    Total: {total.toLocaleString()} FCFA
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <h2 className="text-2xl text-[#C82327] font-bold mb-4">
                        Modalités de paiement
                    </h2>
                    <div className="flex justify-center gap-6 flex-wrap">
                        <div className="bg-[#0F8AB1] text-white px-6 py-3 rounded-lg">
                            40% en octobre
                        </div>
                        <div className="bg-[#17A2B8] text-white px-6 py-3 rounded-lg">
                            40% en janvier
                        </div>
                        <div className="bg-[#C82327] text-white px-6 py-3 rounded-lg">
                            20% en mars
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
};

export default Scolarite;
