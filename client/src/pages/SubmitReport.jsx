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

// Component to handle map clicks and centering
const MapController = ({ location, setLocation, setAddress }) => {
  const map = useMap();
  
  // Update view when location changes (auto GPS)
  useEffect(() => {
    if (location) map.setView([location.lat, location.lng], 15);
  }, [location, map]);

  // Handle map clicks for manual selection
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });
      try {
        setAddress("Localisation manuelle...");
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
    const [gpsError, setGpsError] = useState(null);

    const [formData, setFormData] = useState({
        description: '',
        damage_level: 'minime', 
        infrastructure_type: (t.options && t.options.infra) ? t.options.infra[0] : '',
        infrastructure_name: '',
        crisis_type: '',
        crisis_type_other: '',
        debris_present: 'no',
        text_location: t.gps_searching || 'Recherche GPS...',
        contact_phone: '',
        contact_email: '',
        allow_contact: true,
        electricity_status: 50,
        health_services_status: 50,
        urgent_needs: []
    });

    const icons = {
        'Séisme': <Home size={22} />,
        'Inondation': <Droplets size={22} />,
        'Cyclone': <Users size={22} />,
        'Tsunami': <Droplets size={22} />,
        'Incendie de forêt': <Flame size={22} />,
        'Explosion': <Bomb size={22} />,
        'Incident chimique': <ShieldAlert size={22} />,
        'Conflit': <ShieldAlert size={22} />,
        'Troubles civils': <Users size={22} />,
        'Autre': <PlusCircle size={22} />
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
        setGpsError(null);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    updateLocation(latitude, longitude);
                },
                (err) => {
                    console.warn("High accuracy GPS failed, retrying with low accuracy...", err);
                    // Retry with low accuracy
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            updateLocation(latitude, longitude);
                        },
                        (err2) => {
                            setGpsError(true);
                            setFormData(prev => ({ ...prev, text_location: "GPS indisponible. Cliquez sur la carte." }));
                        },
                        { enableHighAccuracy: false, timeout: 10000 }
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
        if (!location) { alert("Position requise (cliquez sur la carte si le GPS échoue)"); return; }
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
            alert("Erreur. Rapport mis en attente.");
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
                    <MapContainer center={location ? [location.lat, location.lng] : [5.3484, -4.0305]} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {location && <Marker position={[location.lat, location.lng]} />}
                        <MapController location={location} setLocation={setLocation} setAddress={(addr) => setFormData(p => ({...p, text_location: addr}))} />
                    </MapContainer>
                    
                    {!location && (
                        <div className="map-overlay-searching">
                            <Loader2 className="spinner" />
                            <span>{t.gps_searching}</span>
                            <p style={{fontSize: '0.6rem', marginTop: '5px'}}>Ou cliquez sur la carte</p>
                        </div>
                    )}

                    <div className="map-actions-btns">
                        <button type="button" className="recenter-btn" onClick={getGPS} title="Recalibrer GPS">
                            <Crosshair size={18} />
                        </button>
                    </div>

                    <div className="address-overlay-v3">
                        <MapPin size={14} color="#0ea5e9" />
                        <span className="address-text">{formData.text_location}</span>
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
                                                <div className="crisis-icon-bg">{icons[label] || <PlusCircle size={20} />}</div>
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
                                            <Camera size={28} />
                                            <span>Capture Directe (Photo/Vidéo)</span>
                                        </div>
                                    )}
                                    <input id="media-input" type="file" accept="image/*,video/*" capture="environment" hidden onChange={handleMediaCapture} />
                                </div>

                                <div style={{marginTop: '20px'}}>
                                    <label className="input-label">{t.description_label}</label>
                                    <textarea className="input-modern" rows="3" placeholder={t.description_placeholder} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="form-section-title">Détails Terrain</h2>
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
                                {loading ? <Loader2 className="spinner" /> : (formStep === 1 ? 'Suivant' : 'Envoyer')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubmitReport;
