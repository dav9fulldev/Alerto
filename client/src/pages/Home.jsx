import React from 'react';
import { AlertCircle, Map as MapIcon, Clock, ShieldCheck, Navigation, Camera, FileText, ChevronDown, Menu, Bell, ClipboardList } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import './Home.css';

const Home = ({ onNavigate, onMenuClick }) => {
    const { t, lang, setLang } = useTranslation();

    return (
        <div className="home-container-premium">
            <header className="home-header-maquette">
                <button className="menu-btn-maquette" onClick={onMenuClick}><Menu size={24} /></button>
                <h1 className="brand-alerto-maquette">ALERTO</h1>
                <div className="header-actions-vertical-maquette">
                    <div className="lang-pill-maquette" onClick={() => {
                        const langs = ['fr', 'en', 'es', 'ar', 'zh', 'ru'];
                        const nextIdx = (langs.indexOf(lang) + 1) % langs.length;
                        setLang(langs[nextIdx]);
                    }}>
                        <span>{lang.toUpperCase()}</span>
                        <ChevronDown size={14} />
                    </div>
                    <div className="notif-wrapper-maquette" onClick={() => onNavigate('notifications')}>
                        <Bell size={24} />
                        <span className="notif-badge-maquette">3</span>
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
                        <h3>Nouveau signalement</h3>
                        <p>Signaler un incident ou des dégâts</p>
                    </div>
                </div>

                <div className="home-card-maquette navy" onClick={() => onNavigate('map')}>
                    <div className="card-icon-circle-maquette">
                        <MapIcon size={26} color="#1e293b" />
                    </div>
                    <div className="card-content-maquette">
                        <h3>Carte des alertes</h3>
                        <p>Voir les incidents signalés sur la carte</p>
                    </div>
                </div>

                <div className="home-card-maquette teal" onClick={() => onNavigate('history')}>
                    <div className="card-icon-circle-maquette">
                        <ClipboardList size={26} color="#115e59" />
                    </div>
                    <div className="card-content-maquette">
                        <h3>Mes signalements</h3>
                        <p>Voir l'historique de vos signalements</p>
                    </div>
                </div>
            </div>

            <div className="home-status-box-maquette">
                <div className="status-dot-maquette"></div>
                <div className="status-text-maquette">
                    <span className="status-main-maquette">En ligne</span>
                    <span className="status-sub-maquette">Tous les systèmes opérationnels</span>
                </div>
            </div>
        </div>
    );
};

export default Home;
