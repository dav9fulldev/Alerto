import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { API_BASE } from '../services/api';
import { 
  AlertTriangle, MapPin, Navigation, Droplets, Flame, Building2, 
  ShieldAlert, Bomb, PlusCircle, Layers, RefreshCw, X, Filter,
  Plus, Minus, Users
} from 'lucide-react';
import { useTranslation } from '../services/i18n';
import './PublicMap.css';
import { renderToStaticMarkup } from 'react-dom/server';

const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    
    useEffect(() => {
        if (zoom !== undefined) map.setZoom(zoom, { animate: true });
    }, [zoom, map]);

    return null;
};

const MapAutoFixer = ({ trigger }) => {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.invalidateSize();
            const timer = setTimeout(() => map.invalidateSize(), 500);
            return () => clearTimeout(timer);
        }
    }, [map, trigger]);
    return null;
};

const PublicMap = () => {
    const { t, lang } = useTranslation();
    const [reports, setReports] = useState([]);
    const [center, setCenter] = useState([5.3484, -4.0305]); 
    const [zoomLevel, setZoomLevel] = useState(13);
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const icons = {
        'Inondation': <Droplets size={16} color="white" />,
        'Incendie': <Flame size={16} color="white" />,
        'Effondrement': <Building2 size={16} color="white" />,
        'Conflit': <Bomb size={16} color="white" />,
        'Autre': <AlertTriangle size={16} color="white" />
    };

    const colors = {
        'Inondation': '#3b82f6',
        'Incendie': '#ef4444',
        'Effondrement': '#f59e0b',
        'Conflit': '#8b5cf6',
        'Autre': '#10b981'
    };

    const createCustomMarker = (type, count) => {
        const color = colors[type] || '#3b82f6';
        const iconMarkup = renderToStaticMarkup(
            <div className={`map-marker-glow ${type.toLowerCase()}`} style={{ backgroundColor: color }}>
                {count > 1 ? <span className="marker-count">{count}</span> : icons[type] || <AlertTriangle size={14} color="white" />}
            </div>
        );
        return L.divIcon({ className: 'custom-glow-icon', html: iconMarkup, iconSize: [40, 40], iconAnchor: [20, 20] });
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${API_BASE}/reports/`);
            setReports(res.data);
        } catch (err) { console.error("Error fetching reports", err); }
    };

    return (
        <div className="public-map-container-premium">
            <header className="map-header-premium">
                <h1>Carte des alertes</h1>
            </header>

            <div className="map-filters-bar-premium">
                <div className="filters-scroll-premium">
                    {['Tous', 'Inondation', 'Incendie', 'Effondrement', 'Conflit'].map(f => (
                        <button key={f} className={`map-filter-pill ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
                            {f}
                        </button>
                    ))}
                </div>
                <button className="map-settings-btn" onClick={() => setIsFiltersOpen(true)}>
                    <Filter size={18} />
                </button>
            </div>

            <MapContainer center={center} zoom={zoomLevel} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                <MapController center={center} zoom={zoomLevel} />
                <MapAutoFixer trigger={activeFilter} />
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                
                {reports.filter(r => activeFilter === 'Tous' || r.crisis_type === activeFilter).map((report) => (
                    <Marker key={report._id} position={[report.location.coordinates[1], report.location.coordinates[0]]} icon={createCustomMarker(report.crisis_type, 1)}>
                        <Popup className="premium-popup">
                            <div className="popup-card-premium">
                                {report.image_url && <img src={report.image_url.startsWith('http') ? report.image_url : `${API_BASE}${report.image_url}`} alt="Sinistre" />}
                                <div className="popup-info-premium">
                                    <h3>{report.crisis_type}</h3>
                                    <p><MapPin size={12} /> {report.text_location || '...'}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Floating Controls */}
            <button className="my-pos-btn-floating" onClick={() => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        setCenter([pos.coords.latitude, pos.coords.longitude]);
                        setZoomLevel(15);
                    });
                }
            }}>
                <Navigation size={18} /> <span>Ma position</span>
            </button>

            <div className="zoom-ctrl-pill">
                <button className="zoom-btn" onClick={() => setZoomLevel(prev => Math.min(prev + 1, 19))}><Plus size={20} /></button>
                <div className="zoom-divider"></div>
                <button className="zoom-btn" onClick={() => setZoomLevel(prev => Math.max(prev - 1, 3))}><Minus size={20} /></button>
            </div>

            {/* Bottom Legend Bar */}
            <div className="map-legend-bar-premium">
                <div className="legend-item-premium"><div className="icon-box-blue"><Droplets size={14} /></div> <span>Inondation</span></div>
                <div className="legend-item-premium"><div className="icon-box-red"><Flame size={14} /></div> <span>Incendie</span></div>
                <div className="legend-item-premium"><div className="icon-box-orange"><Building2 size={14} /></div> <span>Effondrement</span></div>
                <div className="legend-item-premium"><div className="icon-box-purple"><Users size={14} /></div> <span>Conflit</span></div>
                <div className="legend-item-premium"><div className="icon-box-green"><PlusCircle size={14} /></div> <span>Autre</span></div>
            </div>
        </div>
    );
};

export default PublicMap;
