import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    BarChart3, AlertTriangle, CheckCircle2, Download, Table, Trash2, 
    MapPin, Zap, HeartPulse, Trash, ExternalLink, ShieldAlert, 
    LogOut, ShieldCheck, Globe
} from 'lucide-react';
import './Dashboard.css';

import { API_BASE } from '../services/api';
import { useTranslation } from '../services/i18n';

const Dashboard = ({ onLogout }) => {
    const { translations, lang, setLang } = useTranslation();
    
    // Force Dashboard to FR or EN only
    const dashLang = (lang === 'fr') ? 'fr' : 'en';
    const t = translations[dashLang];
    const dashT = t.dashboard;

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

    // Infrastructure Normalizer (returns translated string based on mapping)
    const getTranslatedInfra = (type) => {
        if (!type) return t.options.infra[7]; // Autre
        const t_lower = type.toLowerCase();
        if (t_lower.includes('resid')) return t.options.infra[0];
        if (t_lower.includes('comm')) return t.options.infra[1];
        if (t_lower.includes('gouv')) return t.options.infra[2];
        if (t_lower.includes('public')) return t.options.infra[3];
        if (t_lower.includes('trans')) return t.options.infra[4];
        if (t_lower.includes('commu')) return t.options.infra[5];
        return t.options.infra[7];
    };

    const getMediaUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_BASE}${url}`;
    };

    const openMedia = (url) => setSelectedMedia(getMediaUrl(url));
    const closeMedia = () => setSelectedMedia(null);

    const exportToCSV = () => {
        const headers = ["ID", "Crise", "Dégâts", "Infra", "Lat", "Lon", "Date"];
        const rows = reports.map(r => [
            r._id, r.crisis_type, r.damage_level, getTranslatedInfra(r.infrastructure_type),
            r.location.coordinates[1], r.location.coordinates[0], new Date(r.created_at).toISOString()
        ]);
        let csv = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csv));
        link.setAttribute("download", `ALERTO_EXPORT_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const exportToGeoJSON = () => {
        const features = reports.map(r => ({
            type: "Feature",
            geometry: r.location,
            properties: {
                id: r._id,
                crisis: r.crisis_type,
                damage: r.damage_level,
                infra: r.infrastructure_type,
                date: r.created_at,
                description: r.description
            }
        }));
        const geojson = {
            type: "FeatureCollection",
            features: features
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `ALERTO_SIG_${new Date().getTime()}.geojson`);
        document.body.appendChild(link);
        link.click();
    };

    const handleDeleteReport = async (id) => {
        if (!window.confirm(lang === 'fr' ? "Supprimer ce rapport ?" : "Delete this report?")) return;
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
                
                // Aggregate data for translated distribution chart
                const translatedDist = {};
                Object.entries(statsRes.data.infrastructure_distribution).forEach(([key, val]) => {
                    const trans = getTranslatedInfra(key);
                    translatedDist[trans] = (translatedDist[trans] || 0) + val;
                });
                
                setStats({...statsRes.data, infrastructure_distribution: translatedDist});
                setReports(reportsRes.data);
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [lang]); // Re-fetch or re-calculate when language changes

    if (loading) return <div className="dashboard-loading">{dashT.loading}</div>;

    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <div className="dash-brand">
                    <ShieldCheck size={28} color="#0ea5e9" />
                    <div>
                        <h1>{dashT.title}</h1>
                        <p>{dashT.subtitle}</p>
                    </div>
                </div>
                <div className="dash-actions">
                    <div className="dash-lang-switcher">
                        <button 
                            className={`lang-pill ${dashLang === 'fr' ? 'active' : ''}`} 
                            onClick={() => setLang('fr')}
                        >FR</button>
                        <button 
                            className={`lang-pill ${dashLang === 'en' ? 'active' : ''}`} 
                            onClick={() => setLang('en')}
                        >EN</button>
                    </div>
                    <button onClick={exportToCSV} className="dash-btn-outline"><Table size={16} /> {dashT.btn_csv}</button>
                    <button onClick={exportToGeoJSON} className="dash-btn-outline"><Globe size={16} /> {dashT.btn_geojson}</button>
                    <button onClick={onLogout} className="dash-btn-danger"><LogOut size={16} /> {dashT.btn_logout}</button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total"><AlertTriangle size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.total_reports}</span>
                        <p>{dashT.stat_total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon critical"><Trash2 size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.critical_zones}</span>
                        <p>{dashT.stat_critical}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon reliability"><CheckCircle2 size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">98.4%</span>
                        <p>{dashT.stat_reliability}</p>
                    </div>
                </div>
                <div className={`stat-card ${stats.nsfw_flagged > 0 ? 'pulse-alert' : ''}`} onClick={() => setViewMode('flagged')}>
                    <div className="stat-icon nsfw"><ShieldAlert size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.nsfw_flagged}</span>
                        <p>{dashT.stat_flagged}</p>
                    </div>
                </div>
            </div>

            <div className="charts-grid-layout">
                <aside className="chart-card">
                    <h2>{dashT.chart_sectors}</h2>
                    <div className="type-list">
                        {Object.entries(stats.infrastructure_distribution).map(([type, count]) => (
                            <div key={type} className="type-item">
                                <span className="type-name">{type}</span>
                                <div className="type-bar-bg">
                                    <div className="type-bar-fill" style={{ width: `${(count / stats.total_reports) * 100}%` }}></div>
                                </div>
                                <span className="type-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="feed-card">
                    <div className="feed-header">
                        <h2>{viewMode === 'all' ? dashT.feed_tactical : dashT.feed_security}</h2>
                        <div className="feed-tabs">
                            <button className={viewMode === 'all' ? 'active' : ''} onClick={() => setViewMode('all')}>{dashT.tab_all}</button>
                            <button className={viewMode === 'flagged' ? 'active alert' : ''} onClick={() => setViewMode('flagged')}>{dashT.tab_flagged}</button>
                        </div>
                    </div>
                    <div className="feed-list">
                        {reports
                            .filter(r => viewMode === 'all' || r.is_flagged)
                            .map((r) => (
                            <div key={r._id} className="feed-item">
                                <div className="feed-media" onClick={() => openMedia(r.image_url)}>
                                    <img src={getMediaUrl(r.image_url)} alt="Media" />
                                </div>
                                <div className="feed-body">
                                    <div className="feed-meta">
                                        <span className="badge-crisis">{r.crisis_type}</span>
                                        <div className="feed-ctrl">
                                            {r.is_flagged && (
                                                <button className="btn-approve" title={dashT.btn_approve} onClick={() => handleModerate(r._id, false)}><CheckCircle2 size={14} /></button>
                                            )}
                                            <button className="btn-delete" onClick={() => handleDeleteReport(r._id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <h3>{r.infrastructure_name || getTranslatedInfra(r.infrastructure_type)}</h3>
                                    <p>{r.description}</p>
                                    <div className="feed-indicators">
                                        <div className="indicator"><Zap size={12} /> {t.electricity}: {r.electricity_status}%</div>
                                        <div className="indicator"><HeartPulse size={12} /> {t.health}: {r.health_services_status}%</div>
                                        {r.is_flagged && <div className="indicator safety"><ShieldAlert size={12} /> NSFW</div>}
                                    </div>
                                    <div className="feed-loc"><MapPin size={12} /> {r.text_location}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {selectedMedia && (
                <div className="media-modal" onClick={closeMedia}>
                    <img src={selectedMedia} alt="Full view" />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
