import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, AlertCircle, ChevronLeft, MapPin, X, 
  MoreVertical, Navigation, Share2, HelpCircle, Hourglass, XCircle
} from 'lucide-react';
import './MyReports.css';
import { API_BASE } from '../services/api';
import { useTranslation } from '../services/i18n';

const MyReports = ({ onBack }) => {
    const { t, lang } = useTranslation();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('alerto_my_reports') || '[]');
        setReports(history);
    }, []);

    const filteredReports = reports.filter(r => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent': return <CheckCircle2 size={14} />;
            case 'pending': return <Hourglass size={14} />;
            case 'failed': return <XCircle size={14} />;
            default: return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'sent': return 'Envoyé';
            case 'pending': return 'En attente';
            case 'failed': return 'Échec';
            default: return 'Inconnu';
        }
    };

    if (selectedReport) {
        return (
            <div className="report-detail-premium">
                <header className="detail-header-premium">
                    <button className="back-btn-premium" onClick={() => setSelectedReport(null)}><ChevronLeft size={24} /></button>
                    <h2>Détail du signalement</h2>
                    <button className="more-btn-premium"><MoreVertical size={20} /></button>
                </header>
                
                <div className="detail-scroll-premium">
                    <div className="detail-hero-media">
                        <img 
                            src={selectedReport.image_url?.startsWith('http') ? selectedReport.image_url : `${API_BASE}${selectedReport.image_url}`} 
                            alt="Incident" 
                        />
                        <div className="hero-status-pill sent">
                            <CheckCircle2 size={16} /> <span>Envoyé</span>
                        </div>
                    </div>

                    <div className="detail-info-grid">
                        <div className="info-row">
                            <span className="info-label">Type</span>
                            <span className="info-value">{selectedReport.crisis}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Niveau de dégâts</span>
                            <span className="info-value">{selectedReport.damage_level?.charAt(0).toUpperCase() + selectedReport.damage_level?.slice(1)}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Infrastructure</span>
                            <span className="info-value">{selectedReport.infrastructure_type || 'Résidentiel'}</span>
                        </div>
                        
                        <div className="info-section">
                            <label>Localisation</label>
                            <div className="loc-display-box">
                                <MapPin size={18} color="#94a3b8" />
                                <span>{selectedReport.location}</span>
                            </div>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Date</span>
                            <span className="info-value">03 Août 2024 - 10:24</span>
                        </div>

                        <div className="info-section">
                            <label>Description</label>
                            <p className="description-text-premium">
                                {selectedReport.description || "Inondation importante dans le quartier..."}
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="detail-footer-premium">
                    <button className="btn-share-premium"><Share2 size={20} /> <span>Partager</span></button>
                    <button className="btn-problem-premium"><AlertCircle size={20} /> <span>Signaler un problème</span></button>
                </footer>
            </div>
        );
    }

    return (
        <div className="my-reports-premium">
            <header className="reports-header-premium">
                <button className="back-btn-premium" onClick={onBack}><ChevronLeft size={24} /></button>
                <h1>Mes signalements</h1>
            </header>

            <div className="reports-filters-premium">
                <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tous</button>
                <button className={`filter-pill ${filter === 'sent' ? 'active' : ''}`} onClick={() => setFilter('sent')}>Envoyés</button>
                <button className={`filter-pill ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>En attente</button>
                <button className={`filter-pill ${filter === 'failed' ? 'active' : ''}`} onClick={() => setFilter('failed')}>Échec</button>
            </div>

            <div className="reports-list-premium">
                {filteredReports.map(report => (
                    <div key={report.id} className="report-card-premium" onClick={() => setSelectedReport(report)}>
                        <div className="card-thumb-premium">
                            <img src={report.image_url?.startsWith('http') ? report.image_url : `${API_BASE}${report.image_url}`} alt="Thumb" />
                        </div>
                        <div className="card-info-premium">
                            <div className="card-header-row">
                                <h3>{report.crisis} - {report.location.split(',')[0]}</h3>
                                <MoreVertical size={16} color="#475569" />
                            </div>
                            <p className="card-loc-text">{report.location}</p>
                            <div className="card-footer-row">
                                <span className="card-time-text">03 Août 2024 - 10:24</span>
                                <div className={`card-status-badge ${report.status}`}>
                                    {getStatusIcon(report.status)}
                                    <span>{getStatusText(report.status)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyReports;
