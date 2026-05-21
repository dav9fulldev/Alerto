/** Catégories carte (maquette) ↔ types de crise soumis (formulaire / i18n). */

export const MAP_CATEGORIES = ['Inondation', 'Incendie', 'Effondrement', 'Conflit', 'Autre'];

export const defaultFilterTypesState = () =>
    Object.fromEntries(MAP_CATEGORIES.map((c) => [c, true]));

/**
 * Regroupe les libellés backend/i18n en 5 familles pour filtres et marqueurs.
 */
export function normalizeCrisisCategory(crisisType) {
    const c = (crisisType || '').toLowerCase();

    if (c.includes('inond') || c.includes('flood') || c.includes('tsunami')) return 'Inondation';
    if (
        c.includes('feu') ||
        c.includes('incend') ||
        c.includes('fire') ||
        c.includes('foret') ||
        c.includes('wildfire') ||
        c.includes('cyclone') ||
        c.includes('ouragan') ||
        c.includes('hurricane')
    ) {
        return 'Incendie';
    }
    if (
        c.includes('trembl') ||
        c.includes('earth') ||
        c.includes('effond') ||
        c.includes('explos') ||
        c.includes('chimique') ||
        c.includes('chemical')
    ) {
        return 'Effondrement';
    }
    if (c.includes('conflit') || c.includes('conflict') || c.includes('trouble') || c.includes('civil')) {
        return 'Conflit';
    }
    return 'Autre';
}

export function isWithinMapPeriod(createdAt, filterPeriod) {
    if (!createdAt) return true;
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return true;
    const limits = {
        '24h': 24 * 60 * 60 * 1000,
        '7_days': 7 * 24 * 60 * 60 * 1000,
        '30_days': 30 * 24 * 60 * 60 * 1000
    };
    const windowMs = limits[filterPeriod] ?? limits['7_days'];
    return Date.now() - d.getTime() <= windowMs;
}
