<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetContentSecurityPolicy
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        $response->headers->set('Content-Security-Policy', $this->getPolicy());
        
        return $response;
    }

    /**
     * Get the CSP policy based on environment.
     */
    private function getPolicy(): string
    {
        $directives = [
            "default-src 'self'",
            $this->getScriptSrc(),
            $this->getStyleSrc(),
            $this->getFontSrc(),
            $this->getImgSrc(),
            $this->getConnectSrc(),
        ];

        return implode('; ', array_filter($directives));
    }

    /**
     * Get script-src directive.
     */
    private function getScriptSrc(): string
    {
        $sources = [
            "'self'",
            "https://cdnjs.cloudflare.com",
        ];

        // En développement local
        if (app()->environment('local', 'development')) {
            $sources[] = "'unsafe-eval'"; // Pour Vite
            $sources[] = "'unsafe-inline'"; // Pour le HMR de Vite
            $sources[] = "http://127.0.0.1:5173";
            $sources[] = "http://localhost:5173";
        }

        return "script-src " . implode(' ', $sources);
    }

    /**
     * Get style-src directive.
     */
    private function getStyleSrc(): string
    {
        $sources = [
            "'self'",
            "'unsafe-inline'", // Nécessaire pour les styles inline
            "https://fonts.googleapis.com",
            "https://cdnjs.cloudflare.com",
        ];

        return "style-src " . implode(' ', $sources);
    }

    /**
     * Get font-src directive.
     */
    private function getFontSrc(): string
    {
        return "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com";
    }

    /**
     * Get img-src directive.
     */
    private function getImgSrc(): string
    {
        return "img-src 'self' data: https:";
    }

    /**
     * Get connect-src directive.
     */
    private function getConnectSrc(): string
    {
        $sources = ["'self'"];

        // En développement local (pour Vite HMR)
        if (app()->environment('local', 'development')) {
            $sources[] = "http://127.0.0.1:5173";
            $sources[] = "http://localhost:5173";
            $sources[] = "ws://127.0.0.1:5173";
            $sources[] = "ws://localhost:5173";
        }

        return "connect-src " . implode(' ', $sources);
    }
}