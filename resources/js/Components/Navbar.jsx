import { useState } from "react";
import { Link } from "@inertiajs/react";
import { menuItems } from "@/Data/MenuItems";
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaYoutube,
    FaXTwitter,
    FaWhatsapp,
} from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { LogIn } from "lucide-react"; // icône optionnelle

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="w-full fixed top-0 left-0 right-0 z-50 shadow bg-white">
            {/* Topbar */}
            <div className="bg-[#0F8AB1] text-white flex justify-between items-center px-4 md:px-12 py-2 text-sm">
                <span className="italic">L'Ecole Autrement !</span>
                <div className="flex gap-3 text-lg">
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

            {/* Navbar principale */}
            <nav className="bg-white flex items-center justify-between px-4 md:px-12 py-3 relative">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href={"/"}>
                        <img
                            src="/Images/Logo-ESSFAR.png"
                            alt="ESSFAR"
                            className="h-12 w-auto"
                        />
                    </Link>
                </div>

                {/* Menu desktop */}
                <ul className="hidden md:flex gap-6 text-gray-800 font-medium">
                    {menuItems.map((item, idx) => (
                        <li
                            key={idx}
                            className="relative group cursor-pointer text-[#0F8AB1] hover:text-red-600 hover:underline flex gap-1"
                        >
                            <span className="cursor-pointer py-2">
                                {item.label}
                            </span>
                            <span className="py-2">+</span>
                            {item.children && (
                                <ul className="absolute left-0 top-full hidden group-hover:block bg-[#0F8AB1] text-white shadow-lg rounded-md py-2 w-48 z-50 border border-gray-200">
                                    {item.children.map((child, cidx) => (
                                        <li
                                            key={cidx}
                                            className="px-4 py-2 hover:bg-red-600 border-b border-gray-400 last:border-b-0"
                                        >
                                            <Link
                                                href={child.href}
                                                className="block w-full h-full"
                                            >
                                                {child.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>

                {/* 🔹 Bouton Se connecter en desktop */}
                <div className="hidden md:flex">
                    <Link
                        href={route("login")}
                        className="flex items-center gap-2 bg-[#0F8AB1] text-white px-4 py-2 rounded-lg hover:bg-[#C82327] transition"
                    >
                        <LogIn size={18} /> Se connecter
                    </Link>
                </div>

                {/* Bouton mobile */}
                <div className="md:hidden">
                    <button
                        className="text-gray-700 text-2xl"
                        onClick={() => setIsOpen(true)}
                    >
                        ☰
                    </button>
                </div>
            </nav>

            {/* Sidebar mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
                onClick={() => setIsOpen(false)}
            >
                <div
                    className="bg-white w-64 h-full shadow-lg p-6 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header du menu */}
                    <div className="flex justify-between items-center mb-6">
                        <img
                            src="/Images/Logo-ESSFAR.png"
                            alt="ESSFAR"
                            className="h-10"
                        />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-2xl"
                        >
                            <IoClose />
                        </button>
                    </div>

                    {/* Menu mobile */}
                    <ul className="flex flex-col gap-4 text-gray-800 font-medium">
                        {menuItems.map((item, idx) => (
                            <li key={idx}>
                                <details>
                                    <summary className="cursor-pointer">
                                        {item.label}
                                    </summary>
                                    {item.children && (
                                        <ul className="ml-4 mt-2 flex flex-col gap-2 text-sm text-gray-600">
                                            {item.children.map(
                                                (child, cidx) => (
                                                    <li key={cidx}>
                                                        <Link href={child.href}>
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    )}
                                </details>
                            </li>
                        ))}
                    </ul>

                    {/* 🔹 Bouton Se connecter en mobile */}
                    <div className="mt-8">
                        <Link
                            href={route("login")}
                            className="flex items-center gap-2 bg-[#0F8AB1] text-white px-4 py-2 rounded-lg hover:bg-[#0D7695] transition"
                        >
                            <LogIn size={18} /> Se connecter
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
