import React from "react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";

function SiteLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-24">{children}</main>
            <Footer />
        </div>
    );
}

export default SiteLayout;
