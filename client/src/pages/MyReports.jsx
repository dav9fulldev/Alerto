import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, CloudOff, AlertCircle, ChevronRight, MapPin, X, Phone, Mail } from 'lucide-react';
import './MyReports.css';
import { API_BASE } from '../services/api';
import { useTranslation } from '../services/i18n';

const MyReports = () => {
    const { t, lang } = useTranslation();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('alerto_my_reports') || '[]');
        setReports(history);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent': return <CheckCircle2 size={16} color="#10b981" />;
            case 'pending': return <CloudOff size={16} color="#f59e0b" />;
            case 'failed': return <AlertCircle size={16} color="#ef4444" />;
            default: return null;
        }
    };

    const getStatusText = (status) => {
        if (lang === 'fr') {
            switch (status) {
                case 'sent': return 'Envoyé';
                case 'pending': return 'En attente';
                case 'failed': return 'Échec';
                default: return 'Inconnu';
            }
        }
        switch (status) {
            case 'sent': return 'Sent';
            case 'pending': return 'Pending';
            case 'failed': return 'Failed';
            default: return 'Unknown';
        }
    };

    return (
        <div className="history-container">
            <header className="page-header">
                <h1>{t.nav.history}</h1>
                <p>{lang === 'fr' ? 'Consultez et suivez vos signalements.' : 'View and track your reports.'}</p>
            </header>

            <div className="history-list">
                {reports.length > 0 ? (
                    reports.map(report => (
                        <div key={report.id} className="history-card" onClick={() => setSelectedReport(report)}>
                            <div className="card-status">
                                {getStatusIcon(report.status)}
                                <span className={`status-badge ${report.status}`}>{getStatusText(report.status)}</span>
                            </div>
                            
                            <div className="card-main">
                                <div className="crisis-type-badge">{report.crisis}</div>
                                <h3 className="location-summary">{report.location}</h3>
                                <div className="date-row">
                                    <Clock size={12} />
                                    <span>{new Date(report.date).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            
                            <div className="card-action">
                                <ChevronRight size={20} color="#94a3b8" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-history">
                        <div className="empty-icon-bg">
                            <AlertCircle size={40} color="#cbd5e1" />
                        </div>
                        <h3>{lang === 'fr' ? 'Aucun signalement' : 'No reports'}</h3>
                        <p>{lang === 'fr' ? 'Vos alertes apparaîtront ici.' : 'Your alerts will appear here.'}</p>
                    </div>
                )}
            </div>

            {selectedReport && (
                <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
                    <div className="detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{lang === 'fr' ? 'Détails du Signalement' : 'Report Details'}</h2>
                            <button className="close-modal" onClick={() => setSelectedReport(null)}><X /></button>
                        </div>
                        
                        <div className="modal-scroll-content">
                            {selectedReport.image_url && (
                                <img 
                                    src={selectedReport.image_url.startsWith('http') ? selectedReport.image_url : `${API_BASE}${selectedReport.image_url}`} 
                                    alt="Evidence" 
                                    className="detail-img"
                                />
                            )}
                            
                            <div className="detail-section">
                                <div className="detail-row">
                                    <AlertCircle size={18} color="#0ea5e9" />
                                    <div>
                                        <label>{t.crisis_label}</label>
                                        <p>{selectedReport.crisis}</p>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <MapPin size={18} color="#0ea5e9" />
                                    <div>
                                        <label>{t.location_label}</label>
                                        <p>{selectedReport.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <label>{t.description_label}</label>
                                <p className="detail-description">{selectedReport.description || "..."}</p>
                            </div>

                            <div className="detail-grid">
                                <div className="grid-item">
                                    <label>{t.damage_label}</label>
                                    <div className="status-indicator">{t.options?.damage?.[selectedReport.damage_level] || selectedReport.damage_level}</div>
                                </div>
                                <div className="grid-item">
                                    <label>{t.electricity}</label>
                                    <div className="status-progress">
                                        <div className="progress-fill" style={{width: `${selectedReport.electricity_status}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReports;
