import axios from 'axios';
import { getOfflineReports, clearOfflineReports } from './storage';

const SYNC_URL = 'http://localhost:8000/reports/sync-offline';

export const syncOfflineData = async () => {
    const reports = await getOfflineReports();
    if (reports.length === 0) return;

    console.log(`📡 Tentative de synchronisation de ${reports.length} rapports...`);
    
    try {
        // We ensure the "source" is set to "offline" for each report in the batch
        const reportsWithSource = reports.map(r => ({
            ...r,
            source: 'offline'
        }));

        const response = await axios.post(SYNC_URL, { reports: reportsWithSource });
        
        if (response.status === 200) {
            await clearOfflineReports();
            console.log("✅ Synchronisation réussie ! File d'attente vidée.");
            return true;
        }
    } catch (error) {
        console.error("❌ Échec de la synchronisation. Les données sont conservées pour une tentative ultérieure:", error);
        // We DO NOT clear here. The window 'online' event or a manual trigger will try again.
        return false;
    }
};

// Retry logic: try every 2 minutes if still online and data remains
setInterval(() => {
    if (navigator.onLine) {
        syncOfflineData();
    }
}, 120000); 

window.addEventListener('online', syncOfflineData);
