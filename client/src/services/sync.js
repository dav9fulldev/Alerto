import axios from 'axios';
import { getOfflineReports, clearOfflineReports, removeOfflineReportById } from './storage';
import { API_BASE } from './api';

const stripOfflineMeta = (entry) => {
    const {
        id,
        timestamp,
        offline_media,
        offline_media_name,
        offline_media_type,
        local_history_id,
        ...payload
    } = entry;
    return {
        payload: { ...payload, source: 'offline' },
        offline_media,
        offline_media_name,
        offline_media_type,
        local_history_id
    };
};

const markHistoryAsSent = (localIds) => {
    if (!localIds?.length) return;
    try {
        const history = JSON.parse(localStorage.getItem('alerto_my_reports') || '[]');
        const idSet = new Set(localIds);
        const updated = history.map((h) =>
            idSet.has(h.id) ? { ...h, status: 'sent' } : h
        );
        localStorage.setItem('alerto_my_reports', JSON.stringify(updated));
    } catch (e) {
        console.warn('Historique local non mis à jour après sync', e);
    }
};

export const syncOfflineData = async () => {
    const reports = await getOfflineReports();
    if (reports.length === 0) return false;

    console.log(`📡 Synchronisation de ${reports.length} signalement(s) hors ligne…`);

    const syncedLocalIds = [];
    const failed = [];

    for (const entry of reports) {
        const { payload, offline_media, offline_media_name, local_history_id } = stripOfflineMeta(entry);
        const historyId = local_history_id || entry.local_history_id;

        try {
            if (offline_media && typeof offline_media === 'string' && offline_media.startsWith('data:')) {
                const blob = await fetch(offline_media).then((r) => r.blob());
                const fd = new FormData();
                fd.append('file', blob, offline_media_name || `offline-${Date.now()}.jpg`);
                const uploadRes = await axios.post(`${API_BASE}/reports/upload`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                payload.image_url = uploadRes?.data?.url || null;
            }

            const res = await axios.post(`${API_BASE}/reports/`, payload);
            if (historyId) syncedLocalIds.push(historyId);
            if (entry.id != null) await removeOfflineReportById(entry.id);
            console.log('✅ Sync OK', res?.data?.id || '');
        } catch (error) {
            console.error('❌ Échec sync entrée', error?.response?.data || error.message);
            failed.push(entry);
        }
    }

    if (syncedLocalIds.length > 0) {
        markHistoryAsSent(syncedLocalIds);
        window.dispatchEvent(
            new CustomEvent('alerto-sync-complete', {
                detail: { count: syncedLocalIds.length, failed: failed.length }
            })
        );
    }

    if (failed.length === 0 && syncedLocalIds.length === reports.length) {
        await clearOfflineReports();
        console.log("✅ File d'attente hors ligne vidée.");
        return true;
    }

    return syncedLocalIds.length > 0;
};

setInterval(() => {
    if (navigator.onLine) syncOfflineData();
}, 120000);

window.addEventListener('online', () => syncOfflineData());
