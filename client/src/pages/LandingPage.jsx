import React from 'react';
import './LandingPage.css';
import { ShieldAlert, BarChart3, Users, ChevronRight } from 'lucide-react';

const LandingPage = ({ onSelectRole }) => {
    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="hero-section">
                    <div className="logo-badge">PROTOTYPE TRL 4</div>
                    <h1>ALERTO</h1>
                    <p className="subtitle">Intelligence collective pour la gestion de crise en temps réel.</p>
                </div>

                <div className="role-grid">
                    <div className="role-card citizen" onClick={() => onSelectRole('citizen')}>
                        <div className="role-icon">
                            <ShieldAlert size={32} />
                        </div>
                        <div className="role-info">
                            <h2>Communauté</h2>
                            <p>Signalez un dommage, capturez une photo et demandez de l'aide.</p>
                        </div>
                        <ChevronRight className="arrow" />
                    </div>

                    <div className="role-card pnud" onClick={() => onSelectRole('pnud_auth')}>
                        <div className="role-icon">
                            <BarChart3 size={32} />
                        </div>
                        <div className="role-info">
                            <h2>PNUD & Autorités</h2>
                            <p>Accédez au centre de commande et analysez les données terrain.</p>
                        </div>
                        <ChevronRight className="arrow" />
                    </div>
                </div>

                <footer className="landing-footer">
                    <div className="partner-logos">
                        <span>Soutenu par le <strong>PNUD Innovation</strong></span>
                    </div>
                    <p>© 2026 ALERTO - Tous droits réservés</p>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
