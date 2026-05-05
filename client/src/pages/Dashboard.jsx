import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart3, AlertTriangle, CheckCircle2, Download, Table, Trash2, MapPin, Zap, HeartPulse, Trash, ExternalLink, ShieldAlert } from 'lucide-react';
import './Dashboard.css';

import { API_BASE } from '../services/api';

const Dashboard = ({ lang = 'fr' }) => {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({
        total_reports: 0,
        critical_zones: 0,
        duplicates_detected: 0,
        nsfw_flagged: 0,
        nsfw_detected: 0,
        infrastructure_distribution: {}
    });
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'flagged'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);

    // Infrastructure Normalizer (to avoid language mix in chart)
    const normalizeInfra = (type) => {
        if (!type) return "Autre";
        const t = type.toLowerCase();
        if (t.includes('resid') || t.includes('住宅') || t.includes('residencial')) return "Résidentiel";
        if (t.includes('comm') || t.includes('商业') || t.includes('comercial')) return "Commercial";
        if (t.includes('gouv') || t.includes('政府') || t.includes('gubernamental')) return "Gouvernemental";
        if (t.includes('public') || t.includes('公共') || t.includes('servicios p')) return "Services Publics";
        if (t.includes('trans') || t.includes('交通') || t.includes('transporte')) return "Transport";
        if (t.includes('commu') || t.includes('社区') || t.includes('comunitario')) return "Communautaire";
        return "Autre";
    };

    const getMediaUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return `${API_BASE}${url}`;
        return `${API_BASE}/uploads/${url}`;
    };

    const openMedia = (url) => setSelectedMedia(getMediaUrl(url));
    const closeMedia = () => setSelectedMedia(null);

    const exportToCSV = () => {
        const headers = ["ID", "Crise", "Dégâts", "Infra", "Lat", "Lon", "Date"];
        const rows = reports.map(r => [
            r._id, r.crisis_type, r.damage_level, normalizeInfra(r.infrastructure_type),
            r.location.coordinates[1], r.location.coordinates[0], new Date(r.created_at).toISOString()
        ]);
        let csv = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csv));
        link.setAttribute("download", "ALERTO_EXPORT.csv");
        document.body.appendChild(link);
        link.click();
    };

    const handleDeleteReport = async (id) => {
        if (!window.confirm("Supprimer ?")) return;
        try {
            await axios.delete(`${API_BASE}/reports/${id}`, { 
                headers: { 'Authorization': `Bearer ${localStorage.getItem('alerto_token')}` } 
            });
            setReports(reports.filter(r => r._id !== id));
        } catch (err) { alert(err.message); }
    };

    const handleModerate = async (id, isFlagged) => {
        const token = localStorage.getItem('alerto_token');
        try {
            await axios.patch(`${API_BASE}/reports/${id}/moderate`, 
                { is_flagged: isFlagged },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setReports(reports.map(r => r._id === id ? { ...r, is_flagged: isFlagged } : r));
            // Update stats too
            setStats(prev => ({
                ...prev,
                nsfw_flagged: isFlagged ? prev.nsfw_flagged + 1 : prev.nsfw_flagged - 1
            }));
        } catch (err) { alert(err.message); }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('alerto_token');
            if (!token) { setError("Session expirée"); setLoading(false); return; }
            try {
                const [statsRes, reportsRes] = await Promise.all([
                    axios.get(`${API_BASE}/analytics/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${API_BASE}/reports/admin/all`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                // Aggregate normalized infra stats
                const normalizedStats = {};
                Object.entries(statsRes.data.infrastructure_distribution).forEach(([key, val]) => {
                    const norm = normalizeInfra(key);
                    normalizedStats[norm] = (normalizedStats[norm] || 0) + val;
                });
                
                setStats({...statsRes.data, infrastructure_distribution: normalizedStats});
                setReports(reportsRes.data);
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <div className="dashboard-container">Analyse en cours...</div>;

    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <div>
                    <h1>Plateforme ALERTO PNUD</h1>
                    <p style={{fontSize: '0.8rem', color: 'var(--text-dim)'}}>Surveillance tactique et évaluation des dommages</p>
                </div>
                <div className="export-actions">
                    <button onClick={exportToCSV} className="export-btn csv"><Table size={14} /> CSV</button>
                    <button className="export-btn geojson"><Download size={14} /> GeoJSON</button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total"><AlertTriangle size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.total_reports}</span>
                        <p style={{fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700}}>RAPPORTS TOTAUX</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon critical"><Trash2 size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.critical_zones}</span>
                        <p style={{fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700}}>DÉGÂTS COMPLETS</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon duplicates"><CheckCircle2 size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">98.4%</span>
                        <p style={{fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700}}>FIABILITÉ IA</p>
                    </div>
                </div>
                <div className={`stat-card ${stats.nsfw_flagged > 0 ? 'pulse-alert' : ''}`} style={{cursor: 'pointer'}} onClick={() => setViewMode('flagged')}>
                    <div className="stat-icon nsfw"><ShieldAlert size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value" style={{color: stats.nsfw_flagged > 0 ? '#ef4444' : 'inherit'}}>{stats.nsfw_flagged}</span>
                        <p style={{fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700}}>CONTENUS SIGNALÉS</p>
                    </div>
                </div>
            </div>

            <div className="charts-grid-layout">
                <aside className="chart-card">
                    <h2>Répartition par Secteur</h2>
                    <div className="type-list">
                        {Object.entries(stats.infrastructure_distribution).map(([type, count]) => (
                            <div key={type} className="type-item">
                                <span className="type-name">{type}</span>
                                <div className="type-bar-bg">
                                    <div className="type-bar-fill" style={{ width: `${(count / stats.total_reports) * 100}%` }}></div>
                                </div>
                                <span className="type-count">{count} reports</span>
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="feed-card">
                    <div className="feed-header-row">
                        <h2>{viewMode === 'all' ? 'Flux de Crise Tactique' : 'Revue de Sécurité (Signalés)'}</h2>
                        <div className="feed-filter-btns">
                            <button className={`filter-chip ${viewMode === 'all' ? 'active' : ''}`} onClick={() => setViewMode('all')}>Tous</button>
                            <button className={`filter-chip ${viewMode === 'flagged' ? 'active danger' : ''}`} onClick={() => setViewMode('flagged')}>Signalés {stats.nsfw_flagged > 0 && `(${stats.nsfw_flagged})`}</button>
                        </div>
                    </div>
                    <div className="feed-list">
                        {reports
                            .filter(r => viewMode === 'all' || r.is_flagged)
                            .slice(0, 15).map((r) => (
                            <div key={r._id} className="feed-item">
                                <div className="feed-img-box" onClick={() => openMedia(r.image_url)}>
                                    <img src={getMediaUrl(r.image_url)} alt="Media" />
                                </div>
                                
                                <div className="feed-info">
                                    <div className="feed-top">
                                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                            <span className="feed-type-tag">{r.crisis_type}</span>
                                            <span className="feed-time-tag">{new Date(r.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className="feed-actions">
                                            {r.is_flagged && (
                                                <button 
                                                    className="mod-btn approve" 
                                                    title="Marquer comme sûr"
                                                    onClick={() => handleModerate(r._id, false)}
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                            )}
                                            <button className="delete-btn" onClick={() => handleDeleteReport(r._id)}><Trash2 size={14}/></button>
                                        </div>
                                    </div>

                                    <h4 className="infra-title">{r.infrastructure_name || normalizeInfra(r.infrastructure_type)}</h4>
                                    <p className="feed-description">{r.description}</p>
                                    
                                    <div className="tactical-badges">
                                        <div className="t-badge elec">
                                            <Zap size={12} /> {r.electricity_status > 50 ? 'Stable' : 'Coupé'} ({r.electricity_status}%)
                                        </div>
                                        <div className="t-badge health">
                                            <HeartPulse size={12} /> {r.health_services_status > 50 ? 'Opérationnel' : 'HS'} ({r.health_services_status}%)
                                        </div>
                                        
                                        {/* AI & SAFETY INSIGHTS */}
                                        {r.ai_suggested_level && (
                                            <div className="t-badge ai-insight">
                                                <BarChart3 size={12} /> IA: {r.ai_suggested_level.toUpperCase()}
                                            </div>
                                        )}
                                        {r.is_flagged && (
                                            <div className="t-badge safety-flag">
                                                <ShieldAlert size={12} /> SÉCURITÉ / NSFW
                                            </div>
                                        )}

                                        {r.debris_present === 'yes' && (
                                            <div className="t-badge debris">
                                                <Trash size={12} /> DÉBRIS PRÉSENTS
                                            </div>
                                        )}
                                    </div>

                                    <div className="feed-location-bar">
                                        <MapPin size={10} /> {r.text_location || 'Lieu inconnu'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {selectedMedia && (
                <div className="modal-overlay-dash" onClick={closeMedia}>
                    <img src={selectedMedia} alt="Evidence" style={{maxWidth: '90%', maxHeight: '90%', borderRadius: '20px'}} />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
