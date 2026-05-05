import React from 'react';
import { HelpCircle, Phone, ChevronRight, FileText, Settings, ShieldCheck } from 'lucide-react';
import './HelpCenter.css';
import { useTranslation } from '../services/i18n';

const HelpCenter = () => {
    const { t } = useTranslation();
    const helpT = t.help;

    const sections = [
        {
            title: helpT.citizen_guide,
            icon: <FileText size={20} />,
            items: [helpT.q1, helpT.q2, helpT.q3]
        },
        {
            title: helpT.admin_guide,
            icon: <ShieldCheck size={20} />,
            items: [helpT.q4, helpT.q5, helpT.q6]
        },
        {
            title: helpT.transparency,
            icon: <Settings size={20} />,
            items: [helpT.q7, helpT.q8, helpT.q9]
        }
    ];

    return (
        <div className="help-container">
            <header className="page-header help-header">
                <h1>{helpT.title}</h1>
                <p>{helpT.subtitle}</p>
                
                <div className="search-bar-mock">
                    <HelpCircle size={18} color="#94a3b8" />
                    <span>{helpT.search}</span>
                </div>
            </header>

            <div className="help-content">
                <div className="help-grid">
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
                </div>

                <div className="contact-support-card">
                    <div className="support-icon-bg">
                        <Phone size={24} color="white" />
                    </div>
                    <div className="support-info">
                        <h3>{helpT.support_title}</h3>
                        <p>{helpT.support_subtitle}</p>
                        <button className="contact-btn">{helpT.support_btn}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
