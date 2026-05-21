import React, { useState, useEffect } from 'react';
import { AlertCircle, Map as MapIcon, Clock, ShieldCheck, Navigation, Camera, FileText, ChevronDown, Menu, Bell, ClipboardList } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import './Home.css';

const Home = ({ onNavigate, onMenuClick }) => {
    const { t } = useTranslation();
    const [pendingCount, setPendingCount] = useState(0);

    const refreshPending = () => {
        try {
            const history = JSON.parse(localStorage.getItem('alerto_my_reports') || '[]');
            setPendingCount(history.filter((r) => r.status === 'pending').length);
        } catch {
            setPendingCount(0);
        }
    };

    useEffect(() => {
        refreshPending();
        window.addEventListener('alerto-sync-complete', refreshPending);
        window.addEventListener('focus', refreshPending);
        return () => {
            window.removeEventListener('alerto-sync-complete', refreshPending);
            window.removeEventListener('focus', refreshPending);
        };
    }, []);

    return (
        <div className="home-container-premium">
            <header className="home-header-maquette">
                <button className="menu-btn-maquette" onClick={onMenuClick}><Menu size={24} /></button>
                <h1 className="brand-alerto-maquette">ALERTO</h1>
                <div className="header-actions-vertical-maquette">
                    <div className="notif-wrapper-maquette" onClick={() => onNavigate('history')} title={t?.nav?.history || 'Mes signalements'}>
                        <Bell size={24} />
                        {pendingCount > 0 && (
                            <span className="notif-badge-maquette">{pendingCount > 9 ? '9+' : pendingCount}</span>
                        )}
                    </div>
                </div>
            </header>
            
            <p className="home-subtitle-maquette">{t?.home?.subtitle || "Que souhaitez-vous faire ?"}</p>
                
            <div className="home-grid-maquette">
                <div className="home-card-maquette red" onClick={() => onNavigate('report')}>
                    <div className="card-icon-circle-maquette">
                        <Camera size={26} color="#ef4444" />
                    </div>
                    <div className="card-content-maquette">
                        <h3>{t?.home?.cards?.new_report || "Nouveau signalement"}</h3>
                        <p>{t?.home?.cards?.new_report_desc || "Signaler un incident ou des dégâts"}</p>
                    </div>
                </div>

                <div className="home-card-maquette navy" onClick={() => onNavigate('map')}>
                    <div className="card-icon-circle-maquette">
                        <MapIcon size={26} color="#1e293b" />
                    </div>
                    <div className="card-content-maquette">
                        <h3>{t?.home?.cards?.map || "Carte des alertes"}</h3>
                        <p>{t?.home?.cards?.map_desc || "Voir les incidents signalés sur la carte"}</p>
                    </div>
                </div>

                <div className="home-card-maquette teal" onClick={() => onNavigate('history')}>
                    <div className="card-icon-circle-maquette">
                        <ClipboardList size={26} color="#115e59" />
                    </div>
                    <div className="card-content-maquette">
                        <h3>{t?.home?.cards?.history || "Mes signalements"}</h3>
                        <p>{t?.home?.cards?.history_desc || "Voir l'historique de vos signalements"}</p>
                    </div>
                </div>
            </div>

            <div className="home-status-box-maquette">
                <div className="status-dot-maquette"></div>
                <div className="status-text-maquette">
                    <span className="status-main-maquette">{t?.home?.status?.online || "En ligne"}</span>
                    <span className="status-sub-maquette">{t?.home?.status?.desc || "Tous les systèmes opérationnels"}</span>
                </div>
            </div>
        </div>
    );
};

export default Home;
