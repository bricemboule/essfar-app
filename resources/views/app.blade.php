<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'ESSFAR') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="/favicon.ico">

        <!-- Google Font: Source Sans Pro -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
        
        <!-- Font Awesome Icons -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        
        <!-- overlayScrollbars -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/overlayscrollbars/1.13.3/css/OverlayScrollbars.min.css">
        
        <!-- AdminLTE Theme style -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/admin-lte/3.2.0/css/adminlte.min.css">
        
        <!-- Custom CSS pour ESSFAR -->
        <style>
            /* Couleurs personnalisées ESSFAR */
            :root {
                --essfar-primary: #0F8AB1;
                --essfar-secondary: #17a2b8;
                --essfar-success: #28a745;
                --essfar-danger: #dc3545;
                --essfar-warning: #ffc107;
                --essfar-info: #17a2b8;
                --essfar-dark: #343a40;
                --essfar-light: #f8f9fa;
            }

            /* Brand customization */
            .brand-link {
                background-color: var(--essfar-primary) !important;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }

            .brand-text {
                color: white !important;
                font-weight: 400 !important;
            }

            /* Sidebar customization */
            .main-sidebar {
                background: linear-gradient(180deg, var(--essfar-primary) 0%, #0d7494 100%) !important;
            }

            .sidebar-dark-primary .nav-sidebar > .nav-item > .nav-link {
                color: rgba(255,255,255,0.9);
                border-radius: 6px;
                margin: 2px 8px;
            }

            .sidebar-dark-primary .nav-sidebar > .nav-item > .nav-link:hover {
                background-color: rgba(255,255,255,0.1);
                color: white;
            }

            .sidebar-dark-primary .nav-sidebar > .nav-item > .nav-link.active {
                background-color: var(--essfar-success) !important;
                color: white !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            /* Header/Navbar */
            .main-header.navbar {
                background-color: white !important;
                border-bottom: 1px solid #dee2e6;
                box-shadow: 0 2px 4px rgba(0,0,0,0.04);
            }

            /* Cards */
            .card {
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.04);
                border: none;
            }

            .card-header {
                background-color: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
                border-radius: 8px 8px 0 0 !important;
            }

            /* Buttons */
            .btn-primary {
                background-color: var(--essfar-primary);
                border-color: var(--essfar-primary);
            }

            .btn-primary:hover {
                background-color: #0d7494;
                border-color: #0d7494;
            }

            /* Small boxes */
            .small-box {
                border-radius: 8px;
                overflow: hidden;
            }

            /* Badges personnalisés pour les rôles */
            .role-etudiant { 
                background: linear-gradient(45deg, #17a2b8, #20c997) !important;
                color: white !important;
            }
            .role-enseignant { 
                background: linear-gradient(45deg, #28a745, #20c997) !important;
                color: white !important;
            }
            .role-chef_scolarite { 
                background: linear-gradient(45deg, #ffc107, #fd7e14) !important;
                color: #000 !important;
            }
            .role-directeur_academique { 
                background: linear-gradient(45deg, #6f42c1, #007bff) !important;
                color: white !important;
            }
            .role-directeur_general { 
                background: linear-gradient(45deg, #dc3545, #e83e8c) !important;
                color: white !important;
            }
            .role-comptable { 
                background: linear-gradient(45deg, #6610f2, #6f42c1) !important;
                color: white !important;
            }
            .role-communication { 
                background: linear-gradient(45deg, #e83e8c, #fd7e14) !important;
                color: white !important;
            }
            .role-admin { 
                background: linear-gradient(45deg, #343a40, #6c757d) !important;
                color: white !important;
            }

            /* Animations */
            .fade-in {
                animation: fadeIn 0.3s ease-in;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Loading spinner personnalisé */
            .preloader {
                background: linear-gradient(45deg, var(--essfar-primary), #17a2b8) !important;
            }

            .preloader .animation__shake {
                animation: shake 1s infinite;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }

            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .card {
                    background-color: #2d3748;
                    color: #e2e8f0;
                }
                
                .card-header {
                    background-color: #4a5568;
                    border-bottom-color: #2d3748;
                }
            }

            /* Responsive improvements */
            @media (max-width: 767.98px) {
                .content-wrapper {
                    margin-left: 0 !important;
                }
                
                .main-sidebar {
                    margin-left: -250px;
                }
                
                .sidebar-open .main-sidebar {
                    margin-left: 0;
                }
            }

            /* Print styles */
            @media print {
                .main-sidebar,
                .main-header,
                .main-footer {
                    display: none !important;
                }
                
                .content-wrapper {
                    margin: 0 !important;
                    padding: 0 !important;
                }
            }
        </style>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', 'resources/css/app.css'])
        @inertiaHead
    </head>
    <body class="hold-transition sidebar-mini layout-fixed layout-navbar-fixed">
        @inertia

        <!-- REQUIRED SCRIPTS -->
        <!-- jQuery -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        
        <!-- Bootstrap -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/js/bootstrap.bundle.min.js"></script>
        
        <!-- overlayScrollbars -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/overlayscrollbars/1.13.3/js/jquery.overlayScrollbars.min.js"></script>
        
        <!-- AdminLTE App -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/admin-lte/3.2.0/js/adminlte.min.js"></script>

        <!-- Custom JavaScript pour ESSFAR -->
        <script>
            // Configuration AdminLTE
            $(function () {
                // Initialize OverlayScrollbars
                if (typeof $.fn.overlayScrollbars !== 'undefined') {
                    $('.sidebar .nav-sidebar').overlayScrollbars({
                        scrollbars: {
                            autoHide: 'leave',
                            autoHideDelay: 800
                        }
                    });
                }

                // Auto-hide alerts after 5 seconds
                setTimeout(function() {
                    $('.alert-dismissible').fadeOut('slow');
                }, 5000);

                // Confirm delete actions
                $(document).on('click', '[data-confirm-delete]', function(e) {
                    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
                        e.preventDefault();
                        return false;
                    }
                });

                // Tooltips initialization
                $('[data-toggle="tooltip"]').tooltip({
                    trigger: 'hover'
                });

                // Auto-focus first input in modals
                $('.modal').on('shown.bs.modal', function () {
                    $(this).find('input, textarea, select').filter(':visible').first().focus();
                });

                // Real-time clock in navbar
                function updateClock() {
                    const now = new Date();
                    const timeString = now.toLocaleTimeString('fr-FR');
                    const dateString = now.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    $('#current-time').text(timeString);
                    $('#current-date').text(dateString);
                }

                // Update clock every second
                setInterval(updateClock, 1000);
                updateClock(); // Initial call

                // Smooth scrolling for anchor links
                $('a[href^="#"]').on('click', function(event) {
                    var target = $(this.getAttribute('href'));
                    if( target.length ) {
                        event.preventDefault();
                        $('html, body').stop().animate({
                            scrollTop: target.offset().top - 100
                        }, 500);
                    }
                });
            });

            // Global ESSFAR utilities
            window.ESSFAR = {
                // Show loading spinner
                showLoader: function() {
                    if (!$('.loading-overlay').length) {
                        $('body').append('<div class="loading-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;"><div class="spinner-border text-primary" role="status"><span class="sr-only">Chargement...</span></div></div>');
                    }
                },

                // Hide loading spinner
                hideLoader: function() {
                    $('.loading-overlay').remove();
                },

                // Show notification
                notify: function(type, title, message) {
                    const alertClass = type === 'success' ? 'alert-success' : 
                                     type === 'error' ? 'alert-danger' : 
                                     type === 'warning' ? 'alert-warning' : 'alert-info';
                    
                    const alert = $(`
                        <div class="alert ${alertClass} alert-dismissible fade show" role="alert" style="position:fixed;top:20px;right:20px;z-index:9999;min-width:300px;">
                            <strong>${title}</strong> ${message}
                            <button type="button" class="close" data-dismiss="alert">
                                <span>&times;</span>
                            </button>
                        </div>
                    `);
                    
                    $('body').append(alert);
                    
                    setTimeout(() => {
                        alert.fadeOut('slow', () => alert.remove());
                    }, 5000);
                },

                // Format currency
                formatCurrency: function(amount) {
                    return new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XAF'
                    }).format(amount);
                },

                // Format date
                formatDate: function(dateString) {
                    return new Date(dateString).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                },

                // Copy to clipboard
                copyToClipboard: function(text) {
                    navigator.clipboard.writeText(text).then(() => {
                        this.notify('success', 'Copié!', 'Le texte a été copié dans le presse-papiers.');
                    }).catch(() => {
                        this.notify('error', 'Erreur', 'Impossible de copier le texte.');
                    });
                }
            };
        </script>
    </body>
</html>