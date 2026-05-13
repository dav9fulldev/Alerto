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

    const formatDate = (dateValue) => {
        if (!dateValue) return 'Date inconnue';
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return 'Date inconnue';
        return d.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getImageSrc = (report) => {
        const src = report.image_url || report.image || '';
        if (!src) return '';
        if (src.startsWith('data:') || src.startsWith('http')) return src;
        return `${API_BASE}${src}`;
    };

    const getLocationText = (report) => report.location || report.text_location || 'Localisation inconnue';

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
            case 'sent': return t?.status?.sent || 'Envoyé';
            case 'pending': return t?.status?.pending || 'En attente';
            case 'failed': return t?.status?.failed || 'Échec';
            default: return t?.status?.unknown || 'Inconnu';
        }
    };

    if (selectedReport) {
        return (
            <div className="report-detail-premium">
                <header className="detail-header-premium">
                    <button className="back-btn-premium" onClick={() => setSelectedReport(null)}><ChevronLeft size={24} /></button>
                    <h2>{t?.history?.detail_title || "Détail du signalement"}</h2>
                    <button className="more-btn-premium"><MoreVertical size={20} /></button>
                </header>
                
                <div className="detail-scroll-premium">
                    <div className="detail-hero-media">
                        <img 
                            src={getImageSrc(selectedReport)} 
                            alt="Incident" 
                        />
                        <div className={`hero-status-pill ${selectedReport.status}`}>
                            {getStatusIcon(selectedReport.status)} <span>{getStatusText(selectedReport.status)}</span>
                        </div>
                    </div>

                    <div className="detail-info-grid">
                        <div className="info-row">
                            <span className="info-label">{t?.history?.type || "Type"}</span>
                            <span className="info-value">{selectedReport.crisis || selectedReport.crisis_type || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">{t?.submit?.damage_label?.replace('*', '') || "Niveau de dégâts"}</span>
                            <span className="info-value">{selectedReport.damage_level}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">{t?.submit?.infra_label?.replace('*', '') || "Infrastructure"}</span>
                            <span className="info-value">{selectedReport.infrastructure_type || 'Résidentiel'}</span>
                        </div>
                        
                        <div className="info-section">
                            <label>{t?.submit?.location_label || "Localisation"}</label>
                            <div className="loc-display-box">
                                <MapPin size={18} color="#94a3b8" />
                                <span>{getLocationText(selectedReport)}</span>
                            </div>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Date</span>
                            <span className="info-value">{formatDate(selectedReport.created_at)}</span>
                        </div>

                        <div className="info-section">
                            <label>Description</label>
                            <p className="description-text-premium">
                                {selectedReport.description}
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="detail-footer-premium">
                    <button className="btn-share-premium"><Share2 size={20} /> <span>{t?.history?.share || "Partager"}</span></button>
                    <button className="btn-problem-premium"><AlertCircle size={20} /> <span>{t?.history?.report_problem || "Signaler un problème"}</span></button>
                </footer>
            </div>
        );
    }

    return (
        <div className="my-reports-premium">
            <header className="reports-header-premium">
                <button className="back-btn-premium" onClick={onBack}><ChevronLeft size={24} /></button>
                <h1>{t?.nav?.history || "Mes signalements"}</h1>
            </header>

            <div className="reports-filters-premium">
                <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>{t?.history?.all || "Tous"}</button>
                <button className={`filter-pill ${filter === 'sent' ? 'active' : ''}`} onClick={() => setFilter('sent')}>{t?.status?.sent_plural || "Envoyés"}</button>
                <button className={`filter-pill ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>{t?.status?.pending || "En attente"}</button>
                <button className={`filter-pill ${filter === 'failed' ? 'active' : ''}`} onClick={() => setFilter('failed')}>{t?.status?.failed || "Échec"}</button>
            </div>

            <div className="reports-list-premium">
                {filteredReports.map(report => (
                    <div key={report.id} className="report-card-premium" onClick={() => setSelectedReport(report)}>
                        <div className="card-thumb-premium">
                            <img src={getImageSrc(report)} alt="Thumb" />
                        </div>
                        <div className="card-info-premium">
                            <div className="card-header-row">
                                <h3>{report.crisis || report.crisis_type || 'Incident'} - {getLocationText(report).split(',')[0]}</h3>
                                <MoreVertical size={16} color="#475569" />
                            </div>
                            <p className="card-loc-text">{getLocationText(report)}</p>
                            <div className="card-footer-row">
                                <span className="card-time-text">{formatDate(report.created_at)}</span>
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
