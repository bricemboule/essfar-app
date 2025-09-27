import React from "react";
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaYoutube,
    FaXTwitter,
    FaWhatsapp,
    FaLocationDot,
    FaPhone,
    FaEnvelope,
} from "react-icons/fa6";

export default function Footer() {
    return (
        <footer className="bg-[#0F8AB1] text-gray-300">
            {/* Sections principales */}
            <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Logo & Présentation */}
                <div>
                    <img
                        src="/Images/Logo-ESSFAR.png"
                        alt="ESSFAR"
                        className="h-12 w-auto"
                    />
                </div>

                {/* Liens utiles */}
                <div>
                    <h3 className="text-white text-xl font-semibold mb-4">
                        Liens utiles
                    </h3>
                    <ul className="space-y-2 text-lg">
                        <li>
                            <a href="#" className="hover:text-white">
                                Accueil
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white">
                                À propos
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white">
                                Nos formations
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white">
                                Admissions
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white">
                                Contacts
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Formations */}
                <div>
                    <h3 className="text-white text-xl font-semibold mb-4">
                        Nos formations
                    </h3>
                    <ul className="space-y-2 text-lg">
                        <li>
                            <a href="#" className="hover:text-white">
                                Licence
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white">
                                Master
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white">
                                Certifications
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white">
                                Formations en ligne
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-4">
                        Contact
                    </h3>
                    <p className="text-lg flex items-center gap-2">
                        <span>
                            Adresse : Yaoundé, Omnisports Mfandena, derrière le
                            Centre des Impôts, rue 1504.
                        </span>
                    </p>

                    <p className="text-lg flex items-center gap-2">
                        <span>Téléphone : 697-03-83-27 / 699-83-53-96</span>
                    </p>

                    <p className="text-lg flex items-center gap-2">
                        <span>Email : contact@essfar.sn</span>
                    </p>

                    <div className="flex gap-3 mt-4 text-xl">
                        <a href="#">
                            <FaWhatsapp />
                        </a>
                        <a href="#">
                            <FaLinkedin />
                        </a>
                        <a href="#">
                            <FaFacebook />
                        </a>
                        <a href="#">
                            <FaInstagram />
                        </a>
                        <a href="#">
                            <FaXTwitter />
                        </a>
                        <a href="#">
                            <FaYoutube />
                        </a>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-[#C82327] py-4 text-center text-sm text-white">
                © {new Date().getFullYear()} ESSFAR - Tous droits réservés.
            </div>
        </footer>
    );
}
