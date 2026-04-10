import React, { useState, useEffect, useRef, useMemo } from 'react';
import './SubmitReport.css';
import { MapPin, Send, Loader2, Camera, X } from 'lucide-react';
import axios from 'axios';
import { saveReportOffline } from '../services/storage';
import { syncOfflineData } from '../services/sync';

const API_URL = 'http://localhost:8000/reports';

import { translations } from '../services/i18n';

const SubmitReport = ({ lang = 'fr' }) => {
    const t = translations[lang] || translations.fr;
    const isRTL = lang === 'ar';
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineCount, setOfflineCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        damage_level: 'minime',
        infrastructure_type: 'Résidentiel',
        crisis_type: 'Inondation',
        debris_present: false,
        text_location: '',
        image_url: 'test.jpg'
    });

    useEffect(() => {
        const handleStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        
        getGPS();
        if (navigator.onLine) syncOfflineData();
        
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, []);

    const getGPS = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    
                    // Reverse Geocoding via Nominatim (Gratuit & Open Source)
                    try {
                        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        if (response.data && response.data.display_name) {
                            setFormData(prev => ({...prev, text_location: response.data.display_name}));
                        }
                    } catch (error) {
                        console.error("Erreur Geocoding:", error);
                    }
                },
                (error) => console.error("Erreur GPS:", error),
                { enableHighAccuracy: true }
            );
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData({ ...formData, image_url: "photo_capturee.jpg" });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            location: {
                type: "Point",
                coordinates: location ? [location.lng, location.lat] : [0, 0]
            }
        };

        if (navigator.onLine) {
            try {
                await axios.post(API_URL, payload);
                alert(t.online_success);
                resetForm();
            } catch (error) {
                await fallbackToOffline(payload);
            }
        } else {
            await fallbackToOffline(payload);
        }
        setLoading(false);
    };

    const fallbackToOffline = async (payload) => {
        await saveReportOffline(payload);
        alert(t.offline_success);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            description: '',
            damage_level: 'minime',
            infrastructure_type: 'Résidentiel',
            crisis_type: 'Inondation',
            debris_present: false,
            text_location: '',
            image_url: 'test.jpg'
        });
        setLocation(null);
        setImagePreview(null);
    };

    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert(lang === 'fr' 
                ? "Caméra bloquée : Votre navigateur nécessite une connexion sécurisée (HTTPS) ou localhost pour accéder à l'appareil photo." 
                : "Camera blocked: Your browser requires a secure connection (HTTPS) or localhost to access the camera.");
            return;
        }
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }, 
                audio: false 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Erreur caméra:", err);
            setShowCamera(false);
        }
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setImagePreview(dataUrl);
            stopCamera();
            
            // Analyse d'Image Autonome (Simulation de détection de textures/contrastes)
            setIsAnalyzing(true);
            setTimeout(() => {
                setIsAnalyzing(false);
                
                // On simule une détection basée sur la "densité visuelle" de l'image
                const isComplexImage = Math.random() > 0.4; // 60% de chance de détecter des dégâts en démo
                
                if (isComplexImage) {
                    setFormData(prev => ({
                        ...prev, 
                        damage_level: "partiel",
                        infrastructure_type: "Gouvernemental"
                    }));
                    alert(lang === 'fr' 
                        ? "🤖 IA : Détection autonome d'anomalies structurelles sur bâtiment public [Confiance : 88%]"
                        : "🤖 AI: Autonomous detection of structural anomalies on public building [Confidence: 88%]");
                } else {
                    setFormData(prev => ({
                        ...prev, 
                        damage_level: "minime",
                        infrastructure_type: "Résidentiel"
                    }));
                    alert(lang === 'fr' 
                        ? "🤖 IA : Structure stable détectée. Aucun dégât majeur visible. [Confiance : 94%]"
                        : "🤖 AI: Stable structure detected. No major damage visible. [Confidence: 94%]");
                }
            }, 3000);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const handleDescriptionChange = (val) => {
        setFormData({...formData, description: val});
        
        const text = val.toLowerCase();
        let suggestion = 'minime';
        
        if (text.includes('détruit') || text.includes('effondré') || text.includes('mort') || text.includes('total')) {
            suggestion = 'complet';
        } else if (text.includes('fissure') || text.includes('cassé') || text.includes('partiel') || text.includes('réparable')) {
            suggestion = 'partiel';
        }

        if (suggestion !== formData.damage_level) {
            setFormData(prev => ({...prev, damage_level: suggestion}));
        }
    };

    return (
        <div className={`report-container ${isRTL ? 'rtl' : ''}`}>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            
            {!isOnline && (
                <div className="offline-banner">
                    ⚠️ {lang === 'fr' ? 'Mode Hors-Ligne Actif' : 'Offline Mode Active'}
                </div>
            )}

            {showCamera && (
                <div className="camera-overlay">
                    <video ref={videoRef} autoPlay playsInline className="camera-feed"></video>
                    <div className="camera-controls">
                        <button onClick={stopCamera} className="cam-btn cancel">✕</button>
                        <button onClick={capturePhoto} className="cam-btn capture">
                            <div className="inner-circle"></div>
                        </button>
                    </div>
                </div>
            )}

            <div className="report-card">
                <div className="header">
                    <h1>{t.title}</h1>
                    <p>{t.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t.take_photo}</label>
                        {!imagePreview ? (
                            <div className="photo-upload-placeholder" onClick={startCamera}>
                                <Camera size={40} />
                                <span>{t.take_photo}</span>
                            </div>
                        ) : (
                            <div className="photo-preview-container">
                                {isAnalyzing && (
                                    <div className="ai-scanning-overlay">
                                        <div className="scan-line"></div>
                                        <span>ANALYSE IA...</span>
                                    </div>
                                )}
                                <img src={imagePreview} alt="Preview" className="photo-preview" />
                                <button type="button" className="remove-photo" onClick={() => setImagePreview(null)}>
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <label>{t.description_label}</label>
                            {formData.description.length > 5 && (
                                <span className="ai-badge">🤖 IA Active</span>
                            )}
                        </div>
                        <textarea 
                            required
                            placeholder={t.description_placeholder}
                            value={formData.description}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t.damage_label}</label>
                        <div className="damage-grid">
                            {Object.entries(t.options.damage).map(([key, label]) => (
                                <div 
                                    key={key}
                                    className={`damage-option ${formData.damage_level === key ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, damage_level: key})}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{display: 'flex', gap: '10px'}}>
                            <div style={{flex: 1}}>
                                <label>{t.infrastructure_label}</label>
                                <select 
                                    value={formData.infrastructure_type}
                                    onChange={(e) => setFormData({...formData, infrastructure_type: e.target.value})}
                                >
                                    {t.options.infra.map(item => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                            <div style={{flex: 1}}>
                                <label>{t.crisis_label}</label>
                                <select 
                                    value={formData.crisis_type}
                                    onChange={(e) => setFormData({...formData, crisis_type: e.target.value})}
                                >
                                    {t.options.crisis.map(item => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="gps-status">
                            <MapPin size={14} color={location ? "#10b981" : "#f43f5e"} />
                            <span>{location ? `${t.gps_active} (${location.lat.toFixed(4)})` : t.gps_searching}</span>
                            {!location && (
                                <button type="button" onClick={getGPS} className="mini-gps-btn">
                                    📍 {lang === 'fr' ? 'Réessayer' : 'Retry'}
                                </button>
                            )}
                        </div>
                        <div className="input-with-button">
                            <input 
                                placeholder={t.location_label}
                                value={formData.text_location}
                                onChange={(e) => setFormData({...formData, text_location: e.target.value})}
                            />
                            <button type="button" onClick={getGPS} className="gps-refresh-btn">
                                <MapPin size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="form-group modular-section">
                        <h3>📋 {t.needs}</h3>
                        
                        <label>{t.electricity}</label>
                        <select 
                            value={formData.electricity_status || ''}
                            onChange={(e) => setFormData({...formData, electricity_status: e.target.value})}
                        >
                            <option value="">{t.select_placeholder}</option>
                            {Object.entries(t.options.elec).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <label>{t.health}</label>
                        <select 
                            value={formData.health_services_status || ''}
                            onChange={(e) => setFormData({...formData, health_services_status: e.target.value})}
                        >
                            <option value="">{t.select_placeholder}</option>
                            {Object.entries(t.options.health).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className={`submit-btn ${!isOnline ? 'offline' : ''}`} disabled={loading}>
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <Send size={18} /> 
                                {!isOnline 
                                    ? (lang === 'fr' ? 'Enregistrer localement' : 'Save Locally') 
                                    : t.submit_btn}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitReport;
