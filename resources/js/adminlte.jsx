// Import des dépendances AdminLTE
import "admin-lte/dist/js/adminlte.min.js";

// Fonctions utilitaires pour l'interface
window.AdminLTE = {
    // Initialisation des tooltips
    initTooltips() {
        if (typeof $ !== "undefined") {
            $('[data-toggle="tooltip"]').tooltip();
        }
    },

    // Gestion des notifications
    showNotification(type, title, message) {
        if (typeof toastr !== "undefined") {
            toastr[type](message, title);
        } else {
            // Fallback avec alert
            alert(`${title}: ${message}`);
        }
    },

    // Confirmation de suppression
    confirmDelete(url, itemName = "cet élément") {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${itemName} ?`)) {
            // Ici vous pouvez utiliser Inertia ou fetch pour la suppression
            window.location.href = url;
        }
    },

    // Gestion du sidebar mobile
    initMobileSidebar() {
        const body = document.body;
        const sidebarToggle = document.querySelector(
            '[data-widget="pushmenu"]'
        );

        if (sidebarToggle) {
            sidebarToggle.addEventListener("click", function (e) {
                e.preventDefault();
                body.classList.toggle("sidebar-open");
                body.classList.toggle("sidebar-collapse");
            });
        }
    },

    // Mise à jour des badges de notification
    updateNotificationBadges(notifications) {
        const badge = document.querySelector(".navbar-badge");
        if (badge && notifications) {
            badge.textContent = notifications.length;
            badge.style.display = notifications.length > 0 ? "inline" : "none";
        }
    },

    // Formatage des dates
    formatDate(dateString) {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString("fr-FR", options);
    },

    // Animation de chargement
    showLoader() {
        const preloader = document.querySelector(".preloader");
        if (preloader) {
            preloader.style.display = "flex";
        }
    },

    hideLoader() {
        const preloader = document.querySelector(".preloader");
        if (preloader) {
            preloader.style.display = "none";
        }
    },

    // Gestion des menus déroulants
    initTreeMenu() {
        const menuItems = document.querySelectorAll(
            ".nav-item.has-treeview > .nav-link"
        );

        menuItems.forEach((item) => {
            item.addEventListener("click", function (e) {
                e.preventDefault();
                const parent = this.parentElement;
                const submenu = parent.querySelector(".nav-treeview");

                if (submenu) {
                    parent.classList.toggle("menu-open");

                    if (parent.classList.contains("menu-open")) {
                        submenu.style.display = "block";
                    } else {
                        submenu.style.display = "none";
                    }
                }
            });
        });
    },
};

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
    AdminLTE.initTooltips();
    AdminLTE.initMobileSidebar();
    AdminLTE.initTreeMenu();

    // Masquer le preloader après 1 seconde
    setTimeout(() => {
        AdminLTE.hideLoader();
    }, 1000);
});

// Export pour utilisation dans d'autres fichiers
export default AdminLTE;
