import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { API_BASE } from '../services/api';
import { 
  AlertTriangle, MapPin, Navigation, Droplets, Flame, Car, Home, 
  ShieldAlert, Bomb, PlusCircle, Layers, Mountain, Wind, Trees
} from 'lucide-react';
import { useTranslation } from '../services/i18n';
import './PublicMap.css';
import { renderToStaticMarkup } from 'react-dom/server';

const MapAutoFixer = ({ trigger }) => {
    const map = useMap();
    const fixMap = useCallback(() => {
        if (map) {
            map.invalidateSize();
            setTimeout(() => map.invalidateSize(), 100);
            setTimeout(() => map.invalidateSize(), 500);
        }
    }, [map]);
    useEffect(() => {
        fixMap();
        window.addEventListener('resize', fixMap);
        return () => window.removeEventListener('resize', fixMap);
    }, [fixMap, trigger]);
    return null;
};

const PublicMap = () => {
    const { t, lang } = useTranslation();
    const [reports, setReports] = useState([]);
    const [center, setCenter] = useState([5.3484, -4.0305]); // Abidjan default
    const [isSatellite, setIsSatellite] = useState(false);

    const icons = {
        'Tremblement de terre': <Mountain size={20} color="white" />, 'Earthquake': <Mountain size={20} color="white" />, 'Землетрясение': <Mountain size={20} color="white" />,
        'Inondation': <Droplets size={20} color="white" />, 'Flood': <Droplets size={20} color="white" />, 'Наводнение': <Droplets size={20} color="white" />,
        'Tsunami': <PlusCircle size={20} color="white" />,
        'Ouragan / Cyclone': <Wind size={20} color="white" />, 'Hurricane / Cyclone': <Wind size={20} color="white" />,
        'Feu de forêt': <Trees size={20} color="white" />, 'Wildfire': <Trees size={20} color="white" />,
        'Explosion': <Bomb size={20} color="white" />,
        'Incident chimique': <ShieldAlert size={20} color="white" />,
        'Conflit': <ShieldAlert size={20} color="white" />,
        'Troubles civils': <PlusCircle size={20} color="white" />
    };

    const getDamageColor = (level) => {
        if (level === 'complet') return '#ef4444';
        if (level === 'partiel') return '#f59e0b';
        return '#10b981';
    };

    const createIcon = (type, level) => {
        const color = getDamageColor(level);
        const iconMarkup = renderToStaticMarkup(
            <div style={{ 
                backgroundColor: color, width: '34px', height: '34px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '2px solid white'
            }}>
                {icons[type] || <AlertTriangle size={18} color="white" />}
            </div>
        );
        return L.divIcon({ className: 'custom-leaflet-icon', html: iconMarkup, iconSize: [34, 34], iconAnchor: [17, 34] });
    };

    useEffect(() => {
        fetchReports();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => setCenter([pos.coords.latitude, pos.coords.longitude]), null, { enableHighAccuracy: true });
        }
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${API_BASE}/reports/`);
            setReports(res.data);
        } catch (err) { console.error("Error fetching reports", err); }
    };

    return (
        <div className="public-map-container">
            <header className="map-header-overlay">
                <div className="map-search-mock">
                    <Navigation size={18} color="#0ea5e9" />
                    <span className="search-text">{t.title} - {t.nav.map}</span>
                </div>
                <div className="map-lang-badge">{lang.toUpperCase()}</div>
            </header>

            <button className={`sat-toggle-btn ${isSatellite ? 'active' : ''}`} onClick={() => setIsSatellite(!isSatellite)}>
                <Layers size={20} />
                <span>{isSatellite ? 'Standard' : 'Satellite'}</span>
            </button>

            <MapContainer key={`${isSatellite ? 'sat' : 'std'}`} center={center} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }} preferCanvas={true}>
                <MapAutoFixer trigger={isSatellite} />
                {isSatellite ? (
                    <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution='&copy; Google' maxZoom={20} />
                ) : (
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' maxZoom={19} />
                )}
                
                {reports.map((report) => (
                    <Marker key={report._id} position={[report.location.coordinates[1], report.location.coordinates[0]]} icon={createIcon(report.crisis_type, report.damage_level)}>
                        <Popup className="modern-popup">
                            <div className="popup-card">
                                {report.image_url && <img src={report.image_url.startsWith('http') ? report.image_url : `${API_BASE}${report.image_url}`} alt="Sinistre" />}
                                <div className="popup-info">
                                    <div className="popup-badge" style={{ background: getDamageColor(report.damage_level) }}>
                                        {t.options?.damage?.[report.damage_level] || report.damage_level?.toUpperCase()}
                                    </div>
                                    <h3>{report.crisis_type}</h3>
                                    <p className="popup-loc"><MapPin size={12} /> {report.text_location || '...'}</p>
                                    <p className="popup-desc">{report.description}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div className="map-legend-fab">
                <div className="legend-item"><span className="dot red"></span> {t.options?.damage?.complet || 'COMPLET'}</div>
                <div className="legend-item"><span className="dot orange"></span> {t.options?.damage?.partiel || 'PARTIEL'}</div>
                <div className="legend-item"><span className="dot green"></span> {t.options?.damage?.minime || 'MINIME'}</div>
            </div>
        </div>
    );
};

export default PublicMap;
