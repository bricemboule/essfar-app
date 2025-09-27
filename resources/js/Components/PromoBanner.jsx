import { motion } from "framer-motion";

export default function PromoBanner() {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="rounded-2xl shadow-lg overflow-hidden"
                >
                    <motion.img
                        src="/Images/Visuel.png"
                        alt="Concours ou promotion"
                        className="w-full h-auto object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 10,
                        }}
                    />
                </motion.div>
            </div>
        </section>
    );
}
