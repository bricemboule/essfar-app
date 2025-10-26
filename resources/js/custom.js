$(function () {
    // Initialize OverlayScrollbars
    if (typeof $.fn.overlayScrollbars !== "undefined") {
        $(".sidebar .nav-sidebar").overlayScrollbars({
            scrollbars: { autoHide: "leave", autoHideDelay: 800 },
        });
    }

    // Auto-hide alerts
    setTimeout(() => $(".alert-dismissible").fadeOut("slow"), 5000);

    // Confirm delete
    $(document).on("click", "[data-confirm-delete]", function (e) {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?"))
            e.preventDefault();
    });

    // Tooltips
    $('[data-toggle="tooltip"]').tooltip({ trigger: "hover" });

    // Auto-focus first input in modals
    $(".modal").on("shown.bs.modal", function () {
        $(this)
            .find("input, textarea, select")
            .filter(":visible")
            .first()
            .focus();
    });

    // Real-time clock
    function updateClock() {
        const now = new Date();
        $("#current-time").text(now.toLocaleTimeString("fr-FR"));
        $("#current-date").text(
            now.toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        );
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Smooth scrolling for anchors
    $('a[href^="#"]').on("click", function (event) {
        const target = $(this.getAttribute("href"));
        if (target.length) {
            event.preventDefault();
            $("html, body")
                .stop()
                .animate({ scrollTop: target.offset().top - 100 }, 500);
        }
    });
});
