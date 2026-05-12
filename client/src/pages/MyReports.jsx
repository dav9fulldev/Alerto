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
                        <header className="modal-header-tactical">
                            <button className="back-btn" onClick={() => setSelectedReport(null)}><X size={24} /></button>
                            <h3>Détail du signalement</h3>
                            <button className="more-btn"><PlusCircle size={24} style={{ transform: 'rotate(45deg)' }} /></button>
                        </header>
                        
                        <div className="modal-scroll-content">
                            {selectedReport.image_url && (
                                <div className="detail-media-container">
                                    <img 
                                        src={selectedReport.image_url.startsWith('http') ? selectedReport.image_url : `${API_BASE}${selectedReport.image_url}`} 
                                        alt="Sinistre" 
                                        className="detail-img-full"
                                    />
                                    <div className="media-status-badge">
                                        <div className="dot-green"></div> <span>Envoyé</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="detail-fields">
                                <div className="detail-field">
                                    <label>Type</label>
                                    <p>{selectedReport.crisis}</p>
                                </div>
                                <div className="detail-field">
                                    <label>Niveau de dégâts</label>
                                    <p style={{ color: selectedReport.damage_level === 'complet' ? '#ef4444' : selectedReport.damage_level === 'partiel' ? '#f59e0b' : '#10b981' }}>
                                        {selectedReport.damage_level?.toUpperCase() || 'PARTIEL'}
                                    </p>
                                </div>
                                <div className="detail-field">
                                    <label>Infrastructure</label>
                                    <p>{selectedReport.infrastructure_type || 'Résidentiel'}</p>
                                </div>
                                <div className="detail-field">
                                    <label>Localisation</label>
                                    <div className="detail-loc-box">
                                        <MapPin size={16} color="#ef4444" />
                                        <span>{selectedReport.location}</span>
                                    </div>
                                </div>
                                <div className="detail-field">
                                    <label>Date</label>
                                    <p>{new Date(selectedReport.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(selectedReport.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="detail-field">
                                    <label>Description</label>
                                    <p className="detail-desc-text">{selectedReport.description || "..."}</p>
                                </div>
                            </div>
                        </div>

                        <footer className="modal-footer-tactical">
                            <button className="btn-share"><Navigation size={20} style={{ transform: 'rotate(90deg)' }} /> <span>Partager</span></button>
                            <button className="btn-report-problem"><AlertCircle size={20} /> <span>Signaler un problème</span></button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReports;
