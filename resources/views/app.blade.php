<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'self'; 
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com http://127.0.0.1:5173 http://localhost:5173; 
        style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; 
        font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com data:;
        img-src 'self' data: https:;
        connect-src 'self' http://127.0.0.1:5173 http://localhost:5173 ws://127.0.0.1:5173 ws://localhost:5173;
    ">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name', 'ESSFAR') }}</title>

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- Google Font -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- overlayScrollbars -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/overlayscrollbars/1.13.3/css/OverlayScrollbars.min.css">
    
    <!-- AdminLTE -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/admin-lte/3.2.0/css/adminlte.min.css">
    
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
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
    
    <!-- AdminLTE -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/admin-lte/3.2.0/js/adminlte.min.js"></script>

    <!-- Custom JS externes -->
    @vite('resources/js/custom.js')
</body>
</html>