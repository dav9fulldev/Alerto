import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart3, AlertTriangle, CheckCircle2, Download, Table, Trash2, Shield, Eye, MapPin, Zap, HeartPulse, Trash } from 'lucide-react';
import './Dashboard.css';

import { API_BASE } from '../services/api';

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
            "ID", "Type de Crise", "Niveau Dégâts", "Infrastructure", "Nom Infra",
            "Latitude", "Longitude", "Localisation", "Debris",
            "Description", "Électricité (%)", "Santé (%)", "Contact", "Date"
        ];
        
        const rows = reports.map(r => [
            r._id, 
            r.crisis_type, 
            r.damage_level, 
            r.infrastructure_type, 
            `"${r.infrastructure_name || ''}"`,
            r.location.coordinates[1], 
            r.location.coordinates[0], 
            `"${r.text_location || ''}"`, 
            r.debris_present || 'no',
            `"${(r.description || '').replace(/"/g, '""')}"`, 
            r.electricity_status || 0,
            r.health_services_status || 0,
            `"${r.contact_phone || ''}"`,
            new Date(r.created_at).toISOString()
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ALERTO_PNUD_EXPORT_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const handleDeleteReport = async (id) => {
        if (!window.confirm(lang === 'fr' ? 'Supprimer ce rapport ?' : 'Delete report?')) return;
        const token = localStorage.getItem('alerto_token');
        try {
            await axios.delete(`${API_BASE}/reports/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setReports(reports.filter(r => r._id !== id));
        } catch (err) { alert("Erreur: " + err.message); }
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('alerto_token');
            if (!token) { setError("Session expirée"); setLoading(false); return; }
            try {
                const [statsRes, reportsRes] = await Promise.all([
                    axios.get(`${API_BASE}/analytics/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${API_BASE}/reports/`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                setStats(statsRes.data);
                setReports(reportsRes.data);
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <div className="dashboard-container">Chargement...</div>;

    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <div>
                    <h1>Tableau de Bord PNUD</h1>
                    <div className="export-actions">
                        <button onClick={exportToCSV} className="export-btn csv"><Table size={14} /> CSV</button>
                        <button className="export-btn geojson"><Download size={14} /> SIG</button>
                    </div>
                </div>
                <div className="status-badge">SYSTÈME OPÉRATIONNEL</div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total"><Shield /></div>
                    <div className="stat-info">
                        <h3>Total Signalements</h3>
                        <p className="stat-value">{stats.total_reports}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon critical"><AlertTriangle /></div>
                    <div className="stat-info">
                        <h3>Zones Critiques</h3>
                        <p className="stat-value">{stats.critical_zones}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon duplicates"><CheckCircle2 /></div>
                    <div className="stat-info">
                        <h3>Fiabilité Données</h3>
                        <p className="stat-value">98%</p>
                    </div>
                </div>
            </div>

            <div className="charts-grid-layout">
                <div className="chart-card">
                    <h2>Répartition par Infrastructure</h2>
                    <div className="type-list">
                        {Object.entries(stats.infrastructure_distribution || {}).map(([type, count]) => (
                            <div key={type} className="type-item">
                                <span className="type-name">{type}</span>
                                <div className="type-bar-bg">
                                    <div className="type-bar-fill" style={{ width: `${(count / stats.total_reports) * 100}%` }}></div>
                                </div>
                                <span className="type-count">{count} rapports</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="feed-card">
                    <h2>Flux de Crise en Temps Réel</h2>
                    <div className="feed-list">
                        {reports.slice(0, 10).map((r) => (
                            <div key={r._id} className="feed-item">
                                <div className="feed-img" onClick={() => openMedia('image', r.image_url)}>
                                    {r.image_url ? (
                                        <img src={getMediaUrl(r.image_url)} alt="Evidence" />
                                    ) : (
                                        <div className="img-placeholder">📸</div>
                                    )}
                                </div>
                                <div className="feed-info">
                                    <div className="feed-meta">
                                        <span className="feed-type">{r.crisis_type}</span>
                                        <span className="feed-time">{new Date(r.created_at).toLocaleTimeString()}</span>
                                        <button className="delete-report-btn" onClick={() => handleDeleteReport(r._id)} style={{marginLeft: 'auto'}}><Trash2 size={14}/></button>
                                    </div>
                                    
                                    <h4 style={{fontSize: '0.9rem', marginBottom: '5px'}}>{r.infrastructure_name || r.infrastructure_type}</h4>
                                    <p className="feed-desc">{r.description}</p>
                                    
                                    <div className="tactical-details" style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#64748b'}}>
                                            <Zap size={12} color="#f59e0b" /> {r.electricity_status}%
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#64748b'}}>
                                            <HeartPulse size={12} color="#ef4444" /> {r.health_services_status}%
                                        </div>
                                        {r.debris_present === 'yes' && (
                                            <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#ef4444', fontWeight: 700}}>
                                                <Trash size={12} /> DEBRIS
                                            </div>
                                        )}
                                    </div>

                                    <div className="feed-location" style={{marginTop: '8px'}}><MapPin size={10} /> {r.text_location}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedMedia && (
                <div className="media-modal-overlay" onClick={closeMedia}>
                    <div className="media-modal-box">
                        <img src={selectedMedia.url} alt="Large" style={{maxWidth: '100%', maxHeight: '80vh', borderRadius: '15px'}} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
