import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, CloudOff, AlertCircle, ChevronRight, MapPin, X, Phone, Mail, Box } from 'lucide-react';
import './MyReports.css';
import { API_BASE } from '../services/api';

const MyReports = () => {
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
        switch (status) {
            case 'sent': return 'Envoyé';
            case 'pending': return 'En attente';
            case 'failed': return 'Échec';
            default: return 'Inconnu';
        }
    };

    return (
        <div className="history-container">
            <header className="page-header">
                <h1>Mes Alertes</h1>
                <p>Consultez et suivez vos signalements.</p>
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
                                    <span>{new Date(report.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
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
                        <h3>Aucun signalement</h3>
                        <p>Vos alertes apparaîtront ici.</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedReport && (
                <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
                    <div className="detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Détails du Signalement</h2>
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
                                        <label>Crise</label>
                                        <p>{selectedReport.crisis}</p>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <MapPin size={18} color="#0ea5e9" />
                                    <div>
                                        <label>Localisation</label>
                                        <p>{selectedReport.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <label>Description</label>
                                <p className="detail-description">{selectedReport.description || "Aucune description fournie."}</p>
                            </div>

                            <div className="detail-grid">
                                <div className="grid-item">
                                    <label>Dégâts</label>
                                    <div className="status-indicator">{selectedReport.damage_level}</div>
                                </div>
                                <div className="grid-item">
                                    <label>Électricité</label>
                                    <div className="status-progress">
                                        <div className="progress-fill" style={{width: `${selectedReport.electricity_status}%`}}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section contact-info-box">
                                <h3>Coordonnées de contact</h3>
                                <div className="detail-row">
                                    <Phone size={16} color="#64748b" />
                                    <p>{selectedReport.contact_phone || 'Non renseigné'}</p>
                                </div>
                                <div className="detail-row">
                                    <Box size={16} color="#64748b" />
                                    <p>{selectedReport.allow_contact ? 'Autorisation de contact accordée' : 'Contact non autorisé'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(5px);
                    z-index: 2000;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                }
                .detail-modal {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    height: 90vh;
                    border-radius: 30px 30px 0 0;
                    display: flex;
                    flex-direction: column;
                    animation: slideUp 0.3s ease-out;
                }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                
                .modal-header {
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                }
                .modal-header h2 { font-size: 1.1rem; font-weight: 800; }
                .close-modal { background: #f1f5f9; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                
                .modal-scroll-content { padding: 20px; overflow-y: auto; }
                .detail-img { width: 100%; height: 200px; object-fit: cover; border-radius: 20px; margin-bottom: 20px; }
                .detail-section { margin-bottom: 25px; }
                .detail-row { display: flex; gap: 12px; margin-bottom: 15px; }
                .detail-row label { display: block; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
                .detail-row p { font-size: 0.95rem; font-weight: 600; color: #1e293b; }
                
                .detail-description { background: #f8fafc; padding: 15px; border-radius: 15px; font-size: 0.9rem; color: #475569; line-height: 1.5; }
                
                .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
                .grid-item label { font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 8px; display: block; }
                .status-indicator { background: #e0f2fe; color: #0ea5e9; padding: 6px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 800; text-align: center; }
                .status-progress { height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; margin-top: 10px; }
                .progress-fill { height: 100%; background: #10b981; }
                
                .contact-info-box { background: #f1f5f9; padding: 20px; border-radius: 20px; }
                .contact-info-box h3 { font-size: 0.85rem; font-weight: 800; margin-bottom: 15px; }
            `}</style>
        </div>
    );
};

export default MyReports;
