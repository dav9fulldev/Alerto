import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart3, AlertTriangle, CheckCircle2, Download, Table, Trash2 } from 'lucide-react';
import './Dashboard.css';

const API_BASE = `http://${window.location.hostname}:8000`;

const Dashboard = ({ lang = 'fr' }) => {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({
        total_reports: 0,
        critical_zones: 0,
        duplicates_detected: 0,
        infrastructure_distribution: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);

    const getMediaUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return `${API_BASE}${url}`;
        return `${API_BASE}/uploads/${url}`;
    };

    const openMedia = (type, url) => setSelectedMedia({ type, url: getMediaUrl(url) });
    const closeMedia = () => setSelectedMedia(null);

    const exportToCSV = () => {
        const headers = [
            "ID", "Type de Crise", "Niveau Dégâts", "Infrastructure", 
            "Latitude", "Longitude", "Localisation", 
            "Description (FR)", "Description (EN/AI)", 
            "Électricité", "Santé", "Besoins Urgents", 
            "Lien Image", "Date Signalement"
        ];
        
        const rows = reports.map(r => [
            r._id, 
            r.crisis_type, 
            r.damage_level, 
            r.infrastructure_type, 
            r.location.coordinates[1], 
            r.location.coordinates[0], 
            `"${r.text_location || ''}"`, 
            `"${r.description || ''}"`, 
            `"${r.translated_description || ''}"`,
            r.electricity_status || 'N/A',
            r.health_services_status || 'N/A',
            `"${(r.urgent_needs || []).join(', ')}"`,
            r.image_url || 'N/A',
            new Date(r.created_at).toISOString().split('T')[0] + " " + new Date(r.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ALERTO_UN_REPORT_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const exportToGeoJSON = () => {
        const geojson = {
            type: "FeatureCollection",
            metadata: {
                generated_at: new Date().toISOString(),
                source: "ALERTO Disaster Response Platform",
                project: "UNDP / PNUD TRL 4 Validation"
            },
            features: reports.map(r => ({
                type: "Feature",
                geometry: r.location,
                properties: {
                    report_id: r._id,
                    crisis: r.crisis_type,
                    damage_level: r.damage_level,
                    infrastructure: r.infrastructure_type,
                    description: r.description,
                    address: r.text_location,
                    timestamp: r.created_at,
                    needs: r.needs || [],
                    is_ai_classified: true
                }
            }))
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `ALERTO_SIG_EXPORT_${new Date().toLocaleDateString()}.geojson`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleDeleteReport = async (id) => {
        if (!window.confirm(lang === 'fr' ? 'Supprimer ce rapport définitivement ?' : 'Delete this report permanently?')) return;
        
        const token = localStorage.getItem('alerto_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            await axios.delete(`${API_BASE}/reports/${id}`, { headers });
            window.location.reload(); 
        } catch (err) {
            alert("Erreur lors de la suppression: " + (err.response?.data?.detail || err.message));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('alerto_token');
            if (!token) {
                setError("Session expirée. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                console.log("📡 Récupération des données du Dashboard...");
                
                // 1. Fetch Stats Sécurisées (timeout de 8s)
                const statsResponse = await axios.get(`${API_BASE}/analytics/stats`, { 
                    headers,
                    timeout: 8000 
                });
                setStats(statsResponse.data);
                
                // 2. Fetch Liste des Rapports
                const reportsResponse = await axios.get(`${API_BASE}/reports/`, { 
                    headers,
                    timeout: 8000
                });
                setReports(reportsResponse.data);
                
            } catch (err) {
                console.error("Erreur Dashboard:", err);
                const msg = err.response?.data?.detail || err.message || "Erreur de connexion au serveur";
                setError(msg);
                
                if (err.response?.status === 401) {
                    localStorage.removeItem('alerto_token');
                    setTimeout(() => window.location.reload(), 2000);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        
        // Rafraîchissement automatique toutes les 30 secondes (Mode LIVE)
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '20px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(244, 63, 94, 0.1)', borderTop: '4px solid #f43f5e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#94a3b8' }}>{lang === 'fr' ? 'Chargement des analyses...' : 'Loading analytics...'}</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div className="error-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center', padding: '20px' }}>
            <AlertTriangle size={48} color="#f43f5e" style={{ marginBottom: '20px' }} />
            <h2 style={{ color: '#fff', marginBottom: '10px' }}>Impossible de charger les données</h2>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#f43f5e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Réessayer
            </button>
        </div>
    );

    return (
        <>
        <div className="dashboard-container">
            <header className="dash-header">
                <div>
                    <h1>{lang === 'fr' ? 'Analyse ALERTO' : 'ALERTO Analysis'}</h1>
                    <div className="export-actions">
                        <button onClick={exportToCSV} className="export-btn csv">
                            <Table size={14} /> CSV
                        </button>
                        <button onClick={exportToGeoJSON} className="export-btn geojson">
                            <Download size={14} /> GeoJSON
                        </button>
                    </div>
                </div>
                <div className="status-badge">LIVE</div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total"><BarChart3 /></div>
                    <div className="stat-info">
                        <h3>{lang === 'fr' ? 'Total Signalements' : 'Total Reports'}</h3>
                        <p className="stat-value">{stats.total_reports}</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon critical"><AlertTriangle /></div>
                    <div className="stat-info">
                        <h3>{lang === 'fr' ? 'Zones Critiques' : 'Critical Zones'}</h3>
                        <p className="stat-value">{stats.critical_zones}</p>
                        <span className="stat-sub">{lang === 'fr' ? 'Dégâts complets' : 'Complete damage'}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon duplicates"><CheckCircle2 /></div>
                    <div className="stat-info">
                        <h3>{lang === 'fr' ? 'Doublons Détectés' : 'Duplicates Detected'}</h3>
                        <p className="stat-value">{stats.duplicates_detected}</p>
                        <span className="stat-sub">{lang === 'fr' ? 'Optimisation data' : 'Data optimization'}</span>
                    </div>
                </div>
            </div>

            <div className="charts-grid-layout">
                <div className="chart-card">
                    <h2>{lang === 'fr' ? 'Répartition par Infrastructure' : 'Infrastructure Distribution'}</h2>
                    <div className="type-list">
                        {Object.entries(stats.infrastructure_distribution || {}).map(([type, count]) => (
                            <div key={type} className="type-item">
                                <span className="type-name">{type}</span>
                                <div className="type-bar-bg">
                                    <div 
                                        className="type-bar-fill" 
                                        style={{ width: `${(count / stats.total_reports) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="type-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="feed-card">
                    <h2>{lang === 'fr' ? 'Preuves Visuelles Récentes' : 'Recent Visual Evidence'}</h2>
                    <div className="feed-list">
                        {[...reports].reverse().slice(0, 5).map((r) => (
                            <div key={r._id} className={`feed-item ${r.damage_level}`}>
                                <div className="feed-img">
                                    {r.video_url ? (
                                        <div className="media-thumb" onClick={() => openMedia('video', r.video_url)} title="Cliquer pour regarder">
                                            <video 
                                                src={getMediaUrl(r.video_url)} 
                                                muted 
                                                preload="metadata"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', pointerEvents: 'none' }}
                                            />
                                            <div className="play-overlay">▶</div>
                                        </div>
                                    ) : r.image_url ? (
                                        <div className="media-thumb" onClick={() => openMedia('image', r.image_url)} title="Cliquer pour agrandir">
                                            <img src={getMediaUrl(r.image_url)} alt="Evidence" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'4px' }} />
                                            <div className="zoom-overlay">🔍</div>
                                        </div>
                                    ) : (
                                        <div className="img-placeholder">📸</div>
                                    )}
                                </div>

                                <div className="feed-info">
                                    <div className="feed-meta">
                                        <span className="feed-type">{r.crisis_type}</span>
                                        <span className="feed-time">
                                            {new Date(r.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <button 
                                            className="delete-report-btn" 
                                            onClick={() => handleDeleteReport(r._id)}
                                            title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <p className="feed-desc">{r.description || (lang === 'fr' ? "Pas de description" : "No description")}</p>
                                    <div className="feed-location">📍 {r.text_location || "Unknown"}</div>
                                    {r.contact_phone && (
                                        <div className="feed-phone">
                                            <a href={`tel:${r.contact_phone}`} className="call-tactical-btn">
                                                📞 {r.contact_phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* ── Modal Lecteur Média ── */}
        {selectedMedia && (
            <div className="media-modal-overlay" onClick={closeMedia}>
                <div className="media-modal-box" onClick={e => e.stopPropagation()}>
                    <button className="media-modal-close" onClick={closeMedia}>✕</button>
                    {selectedMedia.type === 'video' ? (
                        <video 
                            src={selectedMedia.url} 
                            controls 
                            autoPlay
                            style={{ width: '100%', maxHeight: '80vh', borderRadius: '12px', background: '#000' }}
                        />
                    ) : (
                        <img 
                            src={selectedMedia.url} 
                            alt="Preuve visuelle"
                            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }}
                        />
                    )}
                    <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '12px', fontSize: '0.8rem' }}>
                        {lang === 'fr' ? 'Cliquer en dehors pour fermer' : 'Click outside to close'}
                    </p>
                </div>
            </div>
        )}
        </>
    );
};

export default Dashboard;
