/**
 * Valide une URL d'image avant utilisation dans src= (données localStorage / API).
 * Bloque javascript:, data:text/html, chemins traversal, etc.
 */
export function sanitizeImageUrl(raw, apiBase = '') {
    if (!raw || typeof raw !== 'string') return '';

    const src = raw.trim();
    const lower = src.toLowerCase();

    if (
        lower.startsWith('javascript:') ||
        lower.startsWith('vbscript:') ||
        lower.startsWith('data:text/') ||
        lower.includes('<') ||
        lower.includes('>')
    ) {
        return '';
    }

    if (src.startsWith('data:')) {
        return /^data:image\/(jpeg|jpg|png|gif|webp);base64,[a-z0-9+/=]+$/i.test(src) ? src : '';
    }

    if (/^https?:\/\//i.test(src)) {
        try {
            const u = new URL(src);
            if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
        } catch {
            return '';
        }
    }

    if (src.startsWith('/uploads/') && !src.includes('..')) {
        return `${apiBase}${src}`;
    }

    return '';
}

/** Retire les marqueurs obligatoires (*) des libellés i18n. */
export function stripRequiredMarker(label) {
    if (!label || typeof label !== 'string') return '';
    return label.replace(/\*/g, '').trim();
}

/** Statuts autorisés pour classes CSS (évite injection via localStorage). */
export function sanitizeReportStatus(status) {
    const allowed = ['sent', 'pending', 'failed'];
    return allowed.includes(status) ? status : 'pending';
}
