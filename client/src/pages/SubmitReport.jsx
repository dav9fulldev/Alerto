import React, { useState, useEffect, useRef } from 'react';
import './SubmitReport.css';
import { 
  MapPin, Camera, Video, X, Check, Info, Phone, Mail, Loader2, 
  ChevronRight, AlertTriangle, Zap, HeartPulse, Trash,
  Droplets, Flame, Car, Home, ShieldAlert, Bomb, PlusCircle,
  Construction, Building2, Store, Landmark, Factory, Bus, Users, Palmtree,
  Crosshair
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { saveReportOffline } from '../services/storage';
import { syncOfflineData } from '../services/sync';
import { API_BASE } from '../services/api';
import { translations } from '../services/i18n';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = `${API_BASE}/reports/`;

const MapController = ({ location, setLocation, setAddress }) => {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
        map.setView([location.lat, location.lng], 15);
        // Force refresh leaflet size to fix broken tiles in some containers
        setTimeout(() => map.invalidateSize(), 200);
    }
  }, [location, map]);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });
      try {
        setAddress("Localisation...");
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (res.data && res.data.display_name) {
          setAddress(res.data.display_name);
        }
      } catch (err) { console.error(err); }
    },
  });

  return null;
};

const SubmitReport = ({ lang = 'fr' }) => {
    const t = translations[lang] || translations.fr;
    const [formStep, setFormStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); 
    const [selectedFile, setSelectedFile] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const deferredPrompt = useRef(null);

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
        'Séisme': <Home size={22} />, 'Inondation': <Droplets size={22} />, 'Cyclone': <Users size={22} />, 'Tsunami': <Droplets size={22} />,
        'Incendie de forêt': <Flame size={22} />, 'Explosion': <Bomb size={22} />, 'Incident chimique': <ShieldAlert size={22} />,
        'Conflit': <ShieldAlert size={22} />, 'Troubles civils': <Users size={22} />, 'Autre': <PlusCircle size={22} />,
        'Earthquake': <Home size={22} />, 'Flood': <Droplets size={22} />, 'Hurricane / Cyclone': <Users size={22} />,
        'Wildfire': <Flame size={22} />, 'Chemical Incident': <ShieldAlert size={22} />, 'Conflict': <ShieldAlert size={22} />,
        'Civil Unrest': <Users size={22} />, 'Other': <PlusCircle size={22} />,
        'Terremoto': <Home size={22} />, 'Inundación': <Droplets size={22} />, 'Huracán / Ciclón': <Users size={22} />,
        'Incendio forestal': <Flame size={22} />, 'Explosión': <Bomb size={22} />, 'Incidente químico': <ShieldAlert size={22} />,
        'Conflicto': <ShieldAlert size={22} />, 'Disturbios civiles': <Users size={22} />, 'Otro': <PlusCircle size={22} />,
        'زلزال': <Home size={22} />, 'فيضان': <Droplets size={22} />, 'إعصار': <Users size={22} />, 'حريق غابات': <Flame size={22} />, 'انفجار': <Bomb size={22} />, 'حادث كيميائي': <ShieldAlert size={22} />, 'صراع': <ShieldAlert size={22} />, 'اضطرابات مدنية': <Users size={22} />,
        '地震': <Home size={22} />, '洪水': <Droplets size={22} />, '飓风 / 台风': <Users size={22} />, '海啸': <Droplets size={22} />, '森林火灾': <Flame size={22} />, '爆炸': <Bomb size={22} />, '化学事故': <ShieldAlert size={22} />, '冲突': <ShieldAlert size={22} />, '内乱': <Users size={22} />,
        'Землетрясение': <Home size={22} />, 'Наводнение': <Droplets size={22} />, 'Ураган / Циклон': <Users size={22} />, 'Цунами': <Droplets size={22} />, 'Лесной пожар': <Flame size={22} />, 'Взрыв': <Bomb size={22} />, 'Химический инцидент': <ShieldAlert size={22} />, 'Конфликт': <ShieldAlert size={22} />, 'Гражданские беспорядки': <Users size={22} />
    };

    useEffect(() => {
        const handleStatus = () => setIsOnline(navigator.onLine);
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            deferredPrompt.current = e;
            setShowInstallPrompt(true);
        };

        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        
        getGPS();
        if (navigator.onLine) syncOfflineData();
        
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const getGPS = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    updateLocation(latitude, longitude);
                },
                () => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude),
                        null,
                        { enableHighAccuracy: false, timeout: 5000 }
                    );
                },
                { enableHighAccuracy: true, timeout: 5000 }
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
        if (!formData.crisis_type) { alert("Type de crise requis"); return; }
        if (!location) { alert("Lieu requis"); return; }
        setLoading(true);

        try {
            let mediaUrl = "";
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);
                const res = await axios.post(`${API_BASE}/reports/upload`, uploadData);
                mediaUrl = res.data.url;
            }

            const payload = {
                ...formData,
                image_url: mediaUrl,
                media_type: mediaType,
                location: {
                    type: "Point",
                    coordinates: [location.lng, location.lat]
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
            alert("Erreur de soumission");
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
    };

    return (
        <div className="report-container">
            <div className="report-card">
                <div className="mini-map-container">
                    <MapContainer center={location ? [location.lat, location.lng] : [5.3484, -4.0305]} zoom={14} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {location && <Marker position={[location.lat, location.lng]} />}
                        <MapController location={location} setLocation={setLocation} setAddress={(addr) => setFormData(p => ({...p, text_location: addr}))} />
                    </MapContainer>
                    
                    <button type="button" className="gps-fab" onClick={getGPS} title="Recalibrer">
                        <Crosshair size={22} />
                    </button>

                    <div className="address-overlay-v3">
                        <MapPin size={14} color="#3b82f6" />
                        <span className="address-text">{formData.text_location || 'Localisation terrain...'}</span>
                    </div>
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
                                            <span>CAPTURER PHOTO / VIDÉO</span>
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
                                <h2 className="form-section-title">Analyse Tactique</h2>
                                <div className="slider-group">
                                    <label className="input-label"><Zap size={14}/> État de l'Électricité</label>
                                    <input type="range" min="0" max="100" value={formData.electricity_status} onChange={(e) => setFormData({...formData, electricity_status: parseInt(e.target.value)})} />
                                </div>
                                <div className="slider-group">
                                    <label className="input-label"><HeartPulse size={14}/> Services de Santé</label>
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
