import React, { useState, useEffect } from 'react';
import './SubmitReport.css';
import { 
  MapPin, Camera, Video, X, Check, Loader2, 
  ChevronRight, AlertTriangle, Zap, HeartPulse,
  Droplets, Flame, ShieldAlert, Bomb, PlusCircle,
  Construction, Building2, Store, Landmark, Factory, Users, Navigation, 
  Search, ShieldCheck, Activity, ChevronLeft, Clock
} from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../services/api';
import { useTranslation } from '../services/i18n';

const SubmitReport = ({ lang, onClose }) => {
    const { t } = useTranslation();
    const [formStep, setFormStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); 
    const [selectedFile, setSelectedFile] = useState(null);
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiProgress, setAiProgress] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        damage_level: 'partiel', 
        infrastructure_type: 'Résidentiel',
        crisis_type: 'Inondation',
        text_location: 'Recherche de localisation...',
        electricity_status: 'Partiellement disponible',
        health_services_status: 'Non fonctionnels',
        urgent_needs: []
    });

    const handleBack = () => {
        if (formStep > 1) {
            setFormStep(formStep - 1);
        } else {
            onClose();
        }
    };

    useEffect(() => {
        getGPS();
    }, []);

    const getGPS = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => updateLocation(position.coords.latitude, position.coords.longitude),
                (error) => {
                    console.error("GPS Error", error);
                    setFormData(prev => ({ ...prev, text_location: 'Localisation manuelle requise' }));
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    };

    const updateLocation = async (lat, lng) => {
        setLocation({ lat, lng });
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.data && res.data.display_name) {
                setFormData(prev => ({ ...prev, text_location: res.data.display_name }));
            }
        } catch (e) { 
            console.error(e);
            setFormData(prev => ({ ...prev, text_location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
        }
    };

    const needsOptions = ['Eau potable', 'Nourriture', 'Abris', 'Médicaments', 'Vêtements', 'Électricité', 'Autre', 'Déblaiement des routes'];

    const handleMediaCapture = (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'video' ? 'video/*' : 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setSelectedFile(file);
                setMediaType(type);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaPreview(reader.result);
                    startAiAnalysis();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const startAiAnalysis = () => {
        setAiAnalyzing(true);
        setAiProgress(0);
        const interval = setInterval(() => {
            setAiProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setAiAnalyzing(false), 500);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    const toggleNeed = (need) => {
        setFormData(prev => ({
            ...prev,
            urgent_needs: prev.urgent_needs.includes(need) 
                ? prev.urgent_needs.filter(n => n !== need)
                : [...prev.urgent_needs, need]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsSuccess(true);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="success-overlay-premium">
                <div className="success-card-premium">
                    <div className="confetti-bg"></div>
                    <div className="success-icon-circle-large">
                        <Check size={48} color="white" strokeWidth={4} />
                    </div>
                    <h2>{t?.submit?.success_title || "Signalement envoyé !"}</h2>
                    <p className="success-sub-text">{t?.submit?.success_msg || "Merci pour votre contribution. Votre signalement a été transmis avec succès."}</p>
                    <div className="success-id-container">ID : #ALR-2024-08-03-00124</div>
                    <button className="btn-success-final" onClick={() => { setIsSuccess(false); setFormStep(1); setMediaPreview(null); }}>OK</button>
                </div>
            </div>
        );
    }

    return (
        <div className="submit-report-premium">
            <header className="report-header-premium">
                <button className="header-back-btn" onClick={handleBack}>
                    <ChevronLeft size={24} />
                </button>
                <div className="header-center-info">
                    <div className="step-count-label">{t?.submit?.step || "Étape"} {formStep}/2</div>
                    <div className="gradient-progress-container">
                        <div className="gradient-progress-fill" style={{ width: `${formStep === 1 ? '50%' : '100%'}` }}></div>
                    </div>
                </div>
                <button className="header-clock-btn"><Clock size={20} /></button>
            </header>

            <div className="report-content-scroll">
                {formStep === 1 && !mediaPreview && (
                    <div className="media-step-premium">
                        <h1 className="step-title-premium">{t?.submit?.take_photo || "Prenez une photo ou vidéo"}</h1>
                        <div className="media-grid-premium">
                            <div className="media-option photo" onClick={() => handleMediaCapture('image')}>
                                <div className="option-icon-box"><Camera size={32} /></div>
                                <span>{t?.submit?.photo || "PHOTO"}</span>
                            </div>
                            <div className="media-option video" onClick={() => handleMediaCapture('video')}>
                                <div className="option-icon-box"><Video size={32} /></div>
                                <span>{t?.submit?.video || "VIDÉO"}</span>
                            </div>
                        </div>
                    </div>
                )}

                {formStep === 1 && mediaPreview && (
                    <div className="form-step-premium">
                        <div className="preview-card-premium">
                            <img src={mediaPreview} alt="Capture" />
                            <button className="close-preview-btn" onClick={() => setMediaPreview(null)}><X size={16} /></button>
                        </div>
                        
                        {aiAnalyzing ? (
                            <div className="ai-analysis-card-premium">
                                <div className="ai-status-row">
                                    <Activity size={18} />
                                    <span>{t?.submit?.ai_analyzing || "Analyse IA en cours..."}</span>
                                </div>
                                <p className="ai-sub-status">{t?.submit?.ai_sub || "Détection d'éléments et pré-classification"}</p>
                                <div className="ai-progress-track">
                                    <div className="ai-progress-bar-fill" style={{ width: `${aiProgress}%` }}></div>
                                </div>
                                <div className="ai-percentage-text">{aiProgress}%</div>
                            </div>
                        ) : (
                            <div className="fields-stack-premium">
                                <h1 className="step-title-premium">{t?.submit?.describe || "Décrivez la situation"}</h1>
                                <div className="field-group-premium">
                                    <label>{t?.submit?.description_label || "Description du sinistre *"} </label>
                                    <textarea 
                                        placeholder={t?.submit?.description_placeholder || "Inondation importante..."}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                    <div className="char-indicator">{formData.description.length}/500</div>
                                </div>

                                <div className="field-group-premium">
                                    <label>{t?.submit?.damage_label || "Niveau de dégâts *"}</label>
                                    <div className="damage-grid-premium">
                                        <div className={`damage-box minime ${formData.damage_level === 'minime' ? 'active' : ''}`} onClick={() => setFormData({...formData, damage_level: 'minime'})}>
                                            <ShieldCheck size={20} /> <span>{t?.options?.damage?.minime || "Minime"}</span>
                                        </div>
                                        <div className={`damage-box partiel ${formData.damage_level === 'partiel' ? 'active' : ''}`} onClick={() => setFormData({...formData, damage_level: 'partiel'})}>
                                            <AlertTriangle size={20} /> <span>{t?.options?.damage?.partiel || "Partiel"}</span>
                                        </div>
                                        <div className={`damage-box complet ${formData.damage_level === 'complet' ? 'active' : ''}`} onClick={() => setFormData({...formData, damage_level: 'complet'})}>
                                            <Flame size={20} /> <span>{t?.options?.damage?.complet || "Complet"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="field-group-premium">
                                    <label>{t?.submit?.infra_label || "Type d'infrastructure *"}</label>
                                    <select value={formData.infrastructure_type} onChange={(e) => setFormData({...formData, infrastructure_type: e.target.value})}>
                                        {(t?.options?.infra || []).map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="field-group-premium">
                                    <label className="label-with-badge">
                                        {t?.submit?.location_label || "Localisation"} 
                                        <span className="gps-pill-green"><div className="dot-blink"></div> {t?.submit?.gps_active || "GPS actif"}</span>
                                    </label>
                                    <div className="location-box-premium">
                                        <div className="location-text-wrap">
                                            {formData.text_location}
                                        </div>
                                        <button className="edit-loc-btn"><Navigation size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {formStep === 2 && (
                    <div className="additional-step-premium">
                        <h1 className="step-title-premium">{t?.submit?.extra_info || "Informations complémentaires"}</h1>
                        
                        <div className="field-group-premium">
                            <label>{t?.submit?.electricity || "Électricité"}</label>
                            <select value={formData.electricity_status} onChange={(e) => setFormData({...formData, electricity_status: e.target.value})}>
                                <option>{t?.submit?.elec_part || "Partiellement disponible"}</option>
                                <option>{t?.submit?.elec_none || "Totalement indisponible"}</option>
                                <option>{t?.submit?.elec_stable || "Stable"}</option>
                            </select>
                        </div>

                        <div className="field-group-premium">
                            <label>{t?.submit?.health || "Services de santé"}</label>
                            <select value={formData.health_services_status} onChange={(e) => setFormData({...formData, health_services_status: e.target.value})}>
                                <option>{t?.submit?.health_none || "Non fonctionnels"}</option>
                                <option>{t?.submit?.health_part || "Partiellement fonctionnels"}</option>
                                <option>{t?.submit?.health_full || "Fonctionnels"}</option>
                            </select>
                        </div>

                        <div className="field-group-premium">
                            <label>{t?.submit?.needs_label || "Besoins les plus urgents"}</label>
                            <div className="needs-tag-grid-premium">
                                {needsOptions.map(need => (
                                    <div 
                                        key={need} 
                                        className={`need-tag-premium ${formData.urgent_needs.includes(need) ? 'active' : ''}`}
                                        onClick={() => toggleNeed(need)}
                                    >
                                        {need}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <footer className="report-footer-premium">
                <div className="footer-actions-row">
                    <button className="btn-cancel-premium" onClick={handleBack}>{t?.submit?.btn_back || "Annuler"}</button>
                    {formStep === 1 ? (
                        <button className="btn-next-premium" disabled={!mediaPreview || aiAnalyzing} onClick={() => setFormStep(2)}>
                            {t?.submit?.btn_next || "Suivant"} <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button className="btn-submit-premium" disabled={loading} onClick={handleSubmit}>
                            {loading ? <Loader2 className="spinner" /> : (
                                <>
                                    <span>{t?.submit?.btn_submit || "Envoyer le signalement"}</span>
                                    <Navigation size={20} style={{ transform: 'rotate(90deg)' }} />
                                </>
                            )}
                        </button>
                    )}
                </div>
                <div className="footer-status-row">
                    <div className="status-dot-green"></div>
                    <span>{t?.home?.status?.online || "En ligne"} — {t?.submit?.ready || "Prêt à envoyer"}</span>
                </div>
            </footer>
        </div>
    );
};

export default SubmitReport;
