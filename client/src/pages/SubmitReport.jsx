import React, { useState, useEffect, useRef } from 'react';
import './SubmitReport.css';
import { 
  MapPin, Camera, Video, X, Check, Info, Phone, Mail, Loader2, 
  ChevronRight, AlertTriangle, Zap, HeartPulse, Trash,
  Droplets, Flame, Car, Home, ShieldAlert, Bomb, PlusCircle,
  Construction, Building2, Store, Landmark, Factory, Bus, Users, Palmtree,
  Crosshair, Navigation, Edit3, Mountain, Waves, Wind, Trees, CloudLightning
} from 'lucide-react';
import axios from 'axios';
import { saveReportOffline } from '../services/storage';
import { syncOfflineData } from '../services/sync';
import { API_BASE } from '../services/api';
import { translations } from '../services/i18n';

const API_URL = `${API_BASE}/reports/`;

const SubmitReport = ({ lang = 'fr' }) => {
    const t = translations[lang] || translations.fr;
    const [formStep, setFormStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [isManual, setIsManual] = useState(false);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); 
    const [selectedFile, setSelectedFile] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [gpsError, setGpsError] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        damage_level: 'minime', 
        infrastructure_type: (t.options && t.options.infra) ? t.options.infra[0] : '',
        infrastructure_name: '',
        crisis_type: '',
        crisis_type_other: '',
        debris_present: 'no',
        text_location: '',
        contact_phone: '',
        contact_email: '',
        allow_contact: true,
        electricity_status: 50,
        health_services_status: 50,
        urgent_needs: []
    });

    const icons = {
        // FR
        'Tremblement de terre': <Mountain size={24} />,
        'Inondation': <Droplets size={24} />,
        'Tsunami': <Waves size={24} />,
        'Ouragan / Cyclone': <Wind size={24} />,
        'Feu de forêt': <Trees size={24} />,
        'Explosion': <Bomb size={24} />,
        'Incident chimique': <Factory size={24} />,
        'Conflit': <ShieldAlert size={24} />,
        'Troubles civils': <Users size={24} />,
        
        // EN
        'Earthquake': <Mountain size={24} />,
        'Flood': <Droplets size={24} />,
        'Hurricane / Cyclone': <Wind size={24} />,
        'Wildfire': <Flame size={24} />,
        'Chemical Incident': <Factory size={24} />,
        'Conflict': <ShieldAlert size={24} />,
        'Civil Unrest': <Users size={24} />,
        
        // ES
        'Terremoto': <Mountain size={24} />,
        'Inundación': <Droplets size={24} />,
        'Huracán / Ciclón': <Wind size={24} />,
        'Incendio forestal': <Trees size={24} />,
        'Explosión': <Bomb size={24} />,
        'Incidente químico': <Factory size={24} />,
        'Conflicto': <ShieldAlert size={24} />,
        'Disturbios civiles': <Users size={24} />,
        
        // AR
        'زلزال': <Mountain size={24} />,
        'فيضان': <Droplets size={24} />,
        'إعصار': <Wind size={24} />,
        'حريق غابات': <Trees size={24} />,
        'انفجار': <Bomb size={24} />,
        'حادث كيميائي': <Factory size={24} />,
        'صراع': <ShieldAlert size={24} />,
        'اضطرابات مدنية': <Users size={24} />,
        
        // ZH
        '地震': <Mountain size={24} />,
        '洪水': <Droplets size={24} />,
        '飓风 / 台风': <Wind size={24} />,
        '海啸': <Waves size={24} />,
        '森林火灾': <Trees size={24} />,
        '爆炸': <Bomb size={24} />,
        '化学事故': <Factory size={24} />,
        '冲突': <ShieldAlert size={24} />,
        '内乱': <Users size={24} />,
        
        // RU
        'Землетрясение': <Mountain size={24} />,
        'Наводнение': <Droplets size={24} />,
        'Ураган / Циклон': <Wind size={24} />,
        'Цунами': <Waves size={24} />,
        'Лесной пожар': <Trees size={24} />,
        'Взрыв': <Bomb size={24} />,
        'Химический инцидент': <Factory size={24} />,
        'Конфликт': <ShieldAlert size={24} />,
        'Гражданские беспорядки': <Users size={24} />,
        
        'Autre': <PlusCircle size={24} />,
        'Other': <PlusCircle size={24} />,
        'Otro': <PlusCircle size={24} />
    };

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
        setGpsError(false);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    updateLocation(latitude, longitude);
                },
                () => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude),
                        () => {
                            setGpsError(true);
                            setIsManual(true);
                        },
                        { enableHighAccuracy: false, timeout: 5000 }
                    );
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    };

    const updateLocation = async (lat, lng) => {
        setLocation({ lat, lng });
        setGpsError(false);
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.data && res.data.display_name) {
                setFormData(prev => ({ ...prev, text_location: res.data.display_name }));
            }
        } catch (e) { console.error(e); }
    };

    const handleMediaCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const type = file.type.startsWith('video') ? 'video' : 'image';
            setMediaType(type);
            const reader = new FileReader();
            reader.onloadend = () => setMediaPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData.crisis_type) { alert("Veuillez choisir un type de crise."); return; }
        if (!formData.text_location) { alert("Veuillez renseigner le lieu."); return; }
        
        setLoading(true);

        try {
            let mediaUrl = "";
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);
                const res = await axios.post(`${API_BASE}/reports/upload`, uploadData);
                mediaUrl = res.data.url;
            }

            const coords = location ? [location.lng, location.lat] : [-4.0305, 5.3484];

            const payload = {
                ...formData,
                image_url: mediaUrl,
                media_type: mediaType,
                location: {
                    type: "Point",
                    coordinates: coords
                },
                user_id: localStorage.getItem('alerto_user_id')
            };

            if (navigator.onLine) {
                await axios.post(API_URL, payload);
                alert(t.online_success);
            } else {
                await saveReportOffline(payload);
                alert(t.offline_success);
            }
            resetForm();
        } catch (error) {
            alert("Erreur de soumission.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            description: '',
            damage_level: 'minime',
            infrastructure_type: (t.options && t.options.infra) ? t.options.infra[0] : '',
            infrastructure_name: '',
            crisis_type: '',
            crisis_type_other: '',
            debris_present: 'no',
            text_location: '',
            contact_phone: '',
            contact_email: '',
            allow_contact: true,
            electricity_status: 50,
            health_services_status: 50,
            urgent_needs: []
        });
        setMediaPreview(null);
        setSelectedFile(null);
        setMediaType(null);
        setFormStep(1);
        setIsManual(false);
    };

    return (
        <div className="report-container">
            <div className="report-card">
                <div className={`location-section-v4 ${gpsError ? 'error-bg' : ''}`}>
                    <div className="location-info-compact">
                        <div className={`loc-icon-circle ${gpsError ? 'error-icon' : ''}`}>
                            <Navigation size={20} className={(!location && !gpsError) ? 'pulse-icon' : ''} />
                        </div>
                        <div className="loc-texts" style={{ width: '100%' }}>
                            <span className="loc-label">LIEU DU SINISTRE</span>
                            {isManual ? (
                                <input 
                                    className="manual-loc-input"
                                    placeholder="Saisir l'adresse ou le quartier..."
                                    value={formData.text_location}
                                    onChange={(e) => setFormData({...formData, text_location: e.target.value})}
                                    autoFocus
                                />
                            ) : (
                                <span className="loc-address" onClick={() => setIsManual(true)}>
                                    {formData.text_location || (location ? 'Position verrouillée' : 'Acquisition GPS...')}
                                </span>
                            )}
                        </div>
                    </div>
                    <button type="button" className="edit-loc-btn" onClick={() => setIsManual(!isManual)}>
                        {isManual ? <Check size={18} /> : <Edit3 size={18} />}
                    </button>
                </div>

                <div className="form-body">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (formStep === 1) setFormStep(2);
                        else handleSubmit(e);
                    }}>
                        {formStep === 1 ? (
                            <>
                                <h2 className="form-section-title">{t.crisis_label}</h2>
                                <div className="crisis-grid">
                                    {t.options?.crisis?.map((label, idx) => {
                                        if (label.startsWith('---')) return <div key={idx} className="grid-category-header">{label.replace(/---/g, '')}</div>;
                                        return (
                                            <div 
                                                key={idx} 
                                                className={`crisis-item ${formData.crisis_type === label ? 'active' : ''}`}
                                                onClick={() => setFormData({...formData, crisis_type: label})}
                                            >
                                                <div className="crisis-icon-bg">{icons[label] || <PlusCircle size={22} />}</div>
                                                <span>{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="input-group">
                                    <label className="input-label">{t.infrastructure_label}</label>
                                    <select className="input-modern" value={formData.infrastructure_type} onChange={(e) => setFormData({...formData, infrastructure_type: e.target.value})}>
                                        {t.options?.infra?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="photo-box" onClick={() => document.getElementById('media-input').click()}>
                                    {mediaPreview ? (
                                        mediaType === 'video' ? <video src={mediaPreview} className="preview-media" controls /> : <img src={mediaPreview} alt="Preview" className="preview-media" />
                                    ) : (
                                        <div className="capture-placeholder">
                                            <Camera size={32} />
                                            <span>PHOTO / VIDÉO</span>
                                        </div>
                                    )}
                                    <input id="media-input" type="file" accept="image/*,video/*" capture="environment" hidden onChange={handleMediaCapture} />
                                </div>

                                <div style={{marginTop: '25px'}}>
                                    <label className="input-label">{t.description_label}</label>
                                    <textarea className="input-modern" rows="3" placeholder={t.description_placeholder} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="form-section-title">Analyse PNUD</h2>
                                <div className="slider-group">
                                    <label className="input-label"><Zap size={14}/> Électricité</label>
                                    <input type="range" min="0" max="100" value={formData.electricity_status} onChange={(e) => setFormData({...formData, electricity_status: parseInt(e.target.value)})} />
                                </div>
                                <div className="slider-group">
                                    <label className="input-label"><HeartPulse size={14}/> Santé</label>
                                    <input type="range" min="0" max="100" value={formData.health_services_status} onChange={(e) => setFormData({...formData, health_services_status: parseInt(e.target.value)})} />
                                </div>
                            </>
                        )}

                        <div className="btn-row">
                            {formStep === 2 && <button type="button" className="btn-back" onClick={() => setFormStep(1)}>Retour</button>}
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? <Loader2 className="spinner" /> : (formStep === 1 ? 'SUIVANT' : 'ENVOYER LE RAPPORT')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubmitReport;
