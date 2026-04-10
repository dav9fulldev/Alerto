import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart3, AlertTriangle, CheckCircle2, Download, Table } from 'lucide-react';
import './Dashboard.css';

const API_URL = 'http://localhost:8000/reports';

const Dashboard = ({ lang = 'fr' }) => {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        critical: 0,
        duplicates: 0,
        byType: {}
    });
    const [loading, setLoading] = useState(true);

    const exportToCSV = () => {
        const headers = ["ID", "Crise", "Dégâts", "Infrastructure", "Lat", "Lng", "Date"];
        const rows = reports.map(r => [
            r._id, r.crisis_type, r.damage_level, r.infrastructure_type, 
            r.location.coordinates[1], r.location.coordinates[0], r.created_at
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "alerto_data_export.csv");
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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(API_URL);
                const data = response.data;
                setReports(data);
                
                const statsMap = {
                    total: data.length,
                    critical: data.filter(r => r.damage_level === 'complet').length,
                    duplicates: data.filter(r => r.is_duplicate).length,
                    byType: data.reduce((acc, r) => {
                        acc[r.infrastructure_type] = (acc[r.infrastructure_type] || 0) + 1;
                        return acc;
                    }, {})
                };
                setStats(statsMap);
            } catch (error) {
                console.error("Erreur stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading">{lang === 'fr' ? 'Chargement des analyses...' : 'Loading analytics...'}</div>;

    return (
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
                        <p className="stat-value">{stats.total}</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon critical"><AlertTriangle /></div>
                    <div className="stat-info">
                        <h3>{lang === 'fr' ? 'Zones Critiques' : 'Critical Zones'}</h3>
                        <p className="stat-value">{stats.critical}</p>
                        <span className="stat-sub">{lang === 'fr' ? 'Dégâts complets' : 'Complete damage'}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon duplicates"><CheckCircle2 /></div>
                    <div className="stat-info">
                        <h3>{lang === 'fr' ? 'Doublons Détectés' : 'Duplicates Detected'}</h3>
                        <p className="stat-value">{stats.duplicates}</p>
                        <span className="stat-sub">{lang === 'fr' ? 'Optimisation data' : 'Data optimization'}</span>
                    </div>
                </div>
            </div>

            <div className="charts-section">
                <div className="chart-card">
                    <h2>{lang === 'fr' ? 'Répartition par Infrastructure' : 'Infrastructure Distribution'}</h2>
                    <div className="type-list">
                        {Object.entries(stats.byType).map(([type, count]) => (
                            <div key={type} className="type-item">
                                <span className="type-name">{type}</span>
                                <div className="type-bar-bg">
                                    <div 
                                        className="type-bar-fill" 
                                        style={{ width: `${(count / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="type-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
