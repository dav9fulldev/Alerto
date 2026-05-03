/**
 * Configuration centrale de l'API pour ALERTO
 * Bascule automatiquement entre le mode local (port 8000) et production (HTTPS)
 */

const getApiBase = () => {
    // Si on est sur le serveur (en production), on utilise des chemins relatifs
    // pour passer par le reverse proxy Nginx en HTTPS
    if (window.location.protocol === 'https:' || window.location.hostname !== 'localhost') {
        return '';
    }
    
    // En local pour le développement
    return `http://${window.location.hostname}:8000`;
};

export const API_BASE = getApiBase();
