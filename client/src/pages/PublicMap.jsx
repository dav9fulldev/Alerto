import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { API_BASE } from '../services/api';
import { AlertTriangle, MapPin, Navigation, Droplets, Flame, Car, Home, ShieldAlert, Bomb, PlusCircle } from 'lucide-react';
import { translations } from '../services/i18n';
import './PublicMap.css';
import { renderToStaticMarkup } from 'react-dom/server';

const PublicMap = ({ lang = 'fr' }) => {
    const t = translations[lang] || translations.fr;
    const [reports, setReports] = useState([]);
    const [center, setCenter] = useState([5.3484, -4.0305]); // Abidjan default

    const icons = {
        'Inondation': <Droplets size={20} color="white" />,
        'Incendie': <Flame size={20} color="white" />,
        'Accident': <Car size={20} color="white" />,
        'Séisme': <Home size={20} color="white" />,
        'Conflit': <ShieldAlert size={20} color="white" />,
        'Explosion': <Bomb size={20} color="white" />,
        'Autre': <PlusCircle size={20} color="white" />,
        'Flood': <Droplets size={20} color="white" />,
        'Fire': <Flame size={20} color="white" />,
        'Earthquake': <Home size={20} color="white" />,
        'Conflict': <ShieldAlert size={20} color="white" />
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
                backgroundColor: color, 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                border: '2px solid white'
            }}>
                {icons[type] || <AlertTriangle size={16} color="white" />}
            </div>
        );
        
        return L.divIcon({
            className: 'custom-leaflet-icon',
            html: iconMarkup,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
    };

    useEffect(() => {
        fetchReports();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.error(err)
            );
        }
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${API_BASE}/reports/`);
            setReports(res.data);
        } catch (err) {
            console.error("Error fetching reports", err);
        }
    };

    return (
        <div className="public-map-container">
            <header className="map-header-overlay">
                <div className="map-search-mock">
                    <Navigation size={18} color="#0ea5e9" />
                    <span>{lang === 'fr' ? 'Explorer les alertes...' : 'Explore alerts...'}</span>
                </div>
            </header>

            <MapContainer center={center} zoom={13} zoomControl={false} style={{ height: '100vh', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {reports.map((report) => (
                    <Marker 
                        key={report._id} 
                        position={[report.location.coordinates[1], report.location.coordinates[0]]}
                        icon={createIcon(report.crisis_type, report.damage_level)}
                    >
                        <Popup className="modern-popup">
                            <div className="popup-card">
                                {report.image_url && <img src={report.image_url.startsWith('http') ? report.image_url : `${API_BASE}${report.image_url}`} alt="Evidence" />}
                                <div className="popup-info">
                                    <div className="popup-badge" style={{ background: getDamageColor(report.damage_level) }}>
                                        {t.options?.damage?.[report.damage_level] || report.damage_level?.toUpperCase()}
                                    </div>
                                    <h3>{report.crisis_type}</h3>
                                    <p className="popup-loc"><MapPin size={12} /> {report.text_location}</p>
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
