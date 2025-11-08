import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    server: {
        host: "127.0.0.1", // forcer IPv4 au lieu de [::1]
        port: 5173,         // port par défaut Vite
    },
    plugins: [
        laravel({
            input: [
                "resources/js/app.jsx",
                "resources/css/adminlte.css",
                "resources/js/adminlte.jsx",
            ],
            refresh: true,
        }),
        react(),
    ],
});
