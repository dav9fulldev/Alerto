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

const SubmitReport = () => {
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
        urgent_needs: ['Eau potable', 'Nourriture']
    });

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
        // Simulation d'envoi pour la démo maquette
        setTimeout(() => {
            setLoading(false);
            setIsSuccess(true);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="success-overlay">
                <div className="success-card-tactical">
                    <div className="success-icon-bg">
                        <Check size={48} strokeWidth={3} />
                    </div>
                    <h2>Signalement envoyé !</h2>
                    <p className="success-sub">Merci pour votre contribution.<br/>Votre signalement a été transmis avec succès.</p>
                    <div className="success-id-badge">ID : #ALR-2024-08-03-00124</div>
                    <button className="btn-success-ok" onClick={() => { setIsSuccess(false); setFormStep(1); setMediaPreview(null); }}>OK</button>
                </div>
            </div>
        );
    }

    return (
        <div className="submit-report-modern">
            <header className="report-tactical-header">
                <button className="back-btn" onClick={() => formStep > 1 ? setFormStep(formStep - 1) : null}>
                    <ChevronLeft size={24} />
                </button>
                <div className="header-center">
                    <div className="step-label">Étape {formStep}/2</div>
                    <div className="step-progress-bar">
                        <div className="progress-fill" style={{ width: `${formStep === 1 ? '50%' : '100%'}` }}></div>
                    </div>
                </div>
                <button className="timer-btn"><Clock size={20} /></button>
            </header>

            <div className="report-content">
                {formStep === 1 && !mediaPreview && (
                    <div className="media-choice-step">
                        <h1>Prenez une photo ou vidéo</h1>
                        <div className="media-buttons">
                            <div className="media-btn" onClick={() => handleMediaCapture('image')}>
                                <div className="media-icon-box"><Camera size={32} /></div>
                                <span>PHOTO</span>
                            </div>
                            <div className="media-btn" onClick={() => handleMediaCapture('video')}>
                                <div className="media-icon-box"><Video size={32} /></div>
                                <span>VIDÉO</span>
                            </div>
                        </div>
                    </div>
                )}

                {formStep === 1 && mediaPreview && (
                    <div className="description-step">
                        <div className="media-preview-container">
                            <img src={mediaPreview} alt="Preview" className="main-preview" />
                            <button className="remove-media" onClick={() => setMediaPreview(null)}><X size={16} /></button>
                            
                            {aiAnalyzing && (
                                <div className="ai-overlay">
                                    <div className="ai-header">
                                        <Activity size={16} /> <span>Analyse IA en cours...</span>
                                    </div>
                                    <p>Détection d'éléments et pré-classification</p>
                                    <div className="ai-progress-bar">
                                        <div className="ai-progress-fill" style={{ width: `${aiProgress}%` }}></div>
                                    </div>
                                    <div className="ai-percentage">{aiProgress}%</div>
                                </div>
                            )}
                        </div>

                        {!aiAnalyzing && (
                            <div className="form-fields">
                                <h1>Décrivez la situation</h1>
                                <div className="input-group">
                                    <label>Description du sinistre *</label>
                                    <textarea 
                                        placeholder="Inondation importante dans le quartier, plusieurs maisons sont touchées et les routes sont impraticables."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                    <span className="char-count">{formData.description.length}/500</span>
                                </div>

                                <div className="input-group">
                                    <label>Niveau de dégâts *</label>
                                    <div className="damage-selector">
                                        <div className={`damage-opt minime ${formData.damage_level === 'minime' ? 'active' : ''}`} onClick={() => setFormData({...formData, damage_level: 'minime'})}>
                                            <div className="opt-icon green"><ShieldCheck size={18} /></div> <span>Minime</span>
                                        </div>
                                        <div className={`damage-opt partiel ${formData.damage_level === 'partiel' ? 'active' : ''}`} onClick={() => setFormData({...formData, damage_level: 'partiel'})}>
                                            <div className="opt-icon orange"><AlertTriangle size={18} /></div> <span>Partiel</span>
                                        </div>
                                        <div className={`damage-opt complet ${formData.damage_level === 'complet' ? 'active' : ''}`} onClick={() => setFormData({...formData, damage_level: 'complet'})}>
                                            <div className="opt-icon red"><X size={18} /></div> <span>Complet</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Type d'infrastructure *</label>
                                    <select value={formData.infrastructure_type} onChange={(e) => setFormData({...formData, infrastructure_type: e.target.value})}>
                                        <option>Résidentiel</option>
                                        <option>Commercial</option>
                                        <option>Public / Gouvernemental</option>
                                        <option>Industriel</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Nature de la crise *</label>
                                    <select value={formData.crisis_type} onChange={(e) => setFormData({...formData, crisis_type: e.target.value})}>
                                        <option>Inondation</option>
                                        <option>Incendie</option>
                                        <option>Effondrement</option>
                                        <option>Conflit</option>
                                        <option>Autre</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Localisation <span className="gps-active-badge">● GPS actif</span></label>
                                    <div className="loc-input-box">
                                        <input 
                                            type="text" 
                                            value={formData.text_location} 
                                            onChange={(e) => setFormData({...formData, text_location: e.target.value})} 
                                        />
                                        <Navigation size={18} style={{ transform: 'rotate(45deg)' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {formStep === 2 && (
                    <div className="additional-info-step">
                        <h1>Informations complémentaires</h1>
                        
                        <div className="input-group">
                            <label>Électricité</label>
                            <select value={formData.electricity_status} onChange={(e) => setFormData({...formData, electricity_status: e.target.value})}>
                                <option>Partiellement disponible</option>
                                <option>Totalement indisponible</option>
                                <option>Stable</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Services de santé</label>
                            <select value={formData.health_services_status} onChange={(e) => setFormData({...formData, health_services_status: e.target.value})}>
                                <option>Non fonctionnels</option>
                                <option>Partiellement fonctionnels</option>
                                <option>Fonctionnels</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Besoins les plus urgents (sélectionnez)</label>
                            <div className="needs-grid">
                                {needsOptions.map(need => (
                                    <div 
                                        key={need} 
                                        className={`need-tag ${formData.urgent_needs.includes(need) ? 'active' : ''}`}
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

            <footer className="report-footer">
                {formStep === 1 ? (
                    <button className="btn-next" disabled={!mediaPreview || aiAnalyzing} onClick={() => setFormStep(2)}>
                        Suivant <ChevronRight size={20} />
                    </button>
                ) : (
                    <button className="btn-submit" disabled={loading} onClick={handleSubmit}>
                        {loading ? <Loader2 className="spinner" /> : 'Envoyer le signalement'} <Navigation size={20} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                )}
            </footer>
        </div>
    );
};

export default SubmitReport;
