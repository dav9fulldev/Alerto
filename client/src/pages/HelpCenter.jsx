import React, { useState, useEffect } from 'react';
import { Clock, HelpCircle, Phone, Globe, ChevronRight, FileText, Settings, ShieldCheck } from 'lucide-react';
import './HelpCenter.css';

const HelpCenter = ({ lang = 'fr' }) => {
    const sections = [
        {
            title: "Guide du Citoyen",
            icon: <FileText size={20} />,
            items: [
                "Comment envoyer un signalement ?",
                "Est-ce que ça fonctionne sans internet ?",
                "Mes données sont-elles anonymes ?"
            ]
        },
        {
            title: "Guide des Autorités (PNUD)",
            icon: <ShieldCheck size={20} />,
            items: [
                "Comment lire le Dashboard ?",
                "Comment utiliser la carte SIG ?",
                "Pourquoi donner accès à mon GPS ?"
            ]
        },
        {
            title: "Transparence & Données",
            icon: <Settings size={20} />,
            items: [
                "Où sont stockées les données ?",
                "Comment supprimer mon historique ?",
                "RGPD et Protection des victimes"
            ]
        }
    ];

    return (
        <div className="help-container">
            <header className="page-header help-header">
                <h1>Centre d'Aide</h1>
                <p>Trouvez des réponses et contactez l'assistance technique.</p>
                
                <div className="search-bar-mock">
                    <HelpCircle size={18} color="#94a3b8" />
                    <span>Rechercher de l'aide...</span>
                </div>
            </header>

            <div className="help-content">
                {sections.map((section, idx) => (
                    <div key={idx} className="help-section">
                        <div className="section-title">
                            {section.icon}
                            <span>{section.title}</span>
                        </div>
                        <div className="section-list modern-card">
                            {section.items.map((item, i) => (
                                <div key={i} className="help-item">
                                    <div className="help-item-icon">?</div>
                                    <span className="help-item-text">{item}</span>
                                    <ChevronRight size={16} color="#cbd5e1" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="contact-support-card">
                    <div className="support-icon-bg">
                        <Phone size={24} color="white" />
                    </div>
                    <div className="support-info">
                        <h3>Besoin d'assistance technique ?</h3>
                        <p>Nos équipes sont disponibles 24/7 pour vous aider.</p>
                        <button className="contact-btn">Contacter le PNUD</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
