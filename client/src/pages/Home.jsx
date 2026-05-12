import React from 'react';
import { AlertCircle, Map as MapIcon, Clock, ShieldCheck, Navigation, Camera, FileText, ChevronDown } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import './Home.css';

const Home = ({ onNavigate }) => {
    const { t } = useTranslation();

    return (
        <div className="home-container">
            <header className="home-header-top">
                <div className="logo-group">
                    <div className="logo-box-mini"><ShieldCheck size={22} fill="white" /></div>
                    <span className="brand-name">ALERTO</span>
                </div>
                <div className="lang-selector-white">
                    <span>FR</span>
                    <ChevronDown size={14} />
                </div>
            </header>
            
            <h2 className="home-main-title">Que souhaitez-vous faire ?</h2>
                
            <div className="home-grid">
                <div className="home-card primary-red" onClick={() => onNavigate('report')}>
                    <div className="card-icon-box">
                        <Camera size={28} />
                    </div>
                    <div className="card-content">
                        <h3>Nouveau signalement</h3>
                        <p>Signaler un incident ou des dégâts</p>
                    </div>
                </div>

                <div className="home-card tactical-dark" onClick={() => onNavigate('map')}>
                    <div className="card-icon-box">
                        <MapIcon size={28} />
                    </div>
                    <div className="card-content">
                        <h3>Carte des alertes</h3>
                        <p>Voir les incidents signalés sur la carte</p>
                    </div>
                </div>

                <div className="home-card tactical-dark" onClick={() => onNavigate('history')}>
                    <div className="card-icon-box">
                        <FileText size={28} />
                    </div>
                    <div className="card-content">
                        <h3>Mes signalements</h3>
                        <p>Voir l'historique de vos signalements</p>
                    </div>
                </div>
            </div>

            <div className="home-status-bar">
                <div className="status-indicator online"></div>
                <span>En ligne — Tous les systèmes opérationnels</span>
            </div>

            <div className="home-footer-info">
                <div className="info-item">
                    <ShieldCheck size={20} />
                    <div>
                        <h4>Données sécurisées</h4>
                        <p>Vos données sont protégées et utilisées pour sauver des vies</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
