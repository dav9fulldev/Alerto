import React from 'react';
import { AlertCircle, Map as MapIcon, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { useTranslation } from '../services/i18n';
import './Home.css';

const Home = ({ onNavigate }) => {
    const { t } = useTranslation();

    return (
        <div className="home-container">
            <div className="home-hero">
                <div className="hero-badge">
                    <ShieldCheck size={16} /> <span>Application Officielle</span>
                </div>
                <h1>{t.title || 'ALERTO'}</h1>
                <p>Plateforme communautaire de réponse rapide aux crises</p>
                
                <div className="home-grid">
                    <div className="home-card primary" onClick={() => onNavigate('report')}>
                        <div className="card-icon">
                            <AlertCircle size={32} />
                        </div>
                        <div className="card-content">
                            <h3>Nouveau signalement</h3>
                            <p>Signaler un incident ou des dégâts en temps réel</p>
                        </div>
                        <div className="card-action">
                             <Navigation size={20} />
                        </div>
                    </div>

                    <div className="home-card secondary" onClick={() => onNavigate('map')}>
                        <div className="card-icon">
                            <MapIcon size={32} />
                        </div>
                        <div className="card-content">
                            <h3>Carte des alertes</h3>
                            <p>Voir les incidents signalés sur la carte interactive</p>
                        </div>
                    </div>

                    <div className="home-card tertiary" onClick={() => onNavigate('history')}>
                        <div className="card-icon">
                            <Clock size={32} />
                        </div>
                        <div className="card-content">
                            <h3>Mes signalements</h3>
                            <p>Voir l'historique de vos signalements envoyés</p>
                        </div>
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
