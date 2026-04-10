import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { translations } from '../services/i18n';
import './MapView.css';

const API_URL = 'http://localhost:8000/reports';

const getMarkerOptions = (level) => {
    switch (level) {
        case 'complet': return { color: '#f43f5e', radius: 12, fillOpacity: 0.8 };
        case 'partiel': return { color: '#fbbf24', radius: 8, fillOpacity: 0.6 };
        case 'minime': return { color: '#10b981', radius: 6, fillOpacity: 0.4 };
        default: return { color: '#3b82f6', radius: 10, fillOpacity: 0.5 };
    }
};

// Composant pour centrer la carte sur les données
const RecenterMap = ({ reports }) => {
    const map = useMap();
    useEffect(() => {
        if (reports.length > 0) {
            const bounds = L.latLngBounds(reports.map(r => [r.location.coordinates[1], r.location.coordinates[0]]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [reports, map]);
    return null;
};

const MapView = ({ lang = 'fr' }) => {
    const t = translations[lang] || translations.fr;
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(API_URL);
                setReports(response.data);
            } catch (error) {
                console.error("Erreur chargement rapports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    return (
        <div className="map-page">
            <div className="map-header">
                <h1>{lang === 'fr' ? 'Carte Stratégique SIG' : 'Strategic GIS Map'}</h1>
                <div className="map-legend">
                    <div className="legend-item"><span className="dot critical"></span> {t.options.damage.complet}</div>
                    <div className="legend-item"><span className="dot partial"></span> {t.options.damage.partiel}</div>
                    <div className="legend-item"><span className="dot minimal"></span> {t.options.damage.minime}</div>
                </div>
            </div>
            
            <MapContainer center={[5, -5]} zoom={3} className="leaflet-container">
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />
                <RecenterMap reports={reports} />
                
                {reports.map((report) => {
                    const coords = report.location.coordinates;
                    const options = getMarkerOptions(report.damage_level);
                    
                    return (
                        <CircleMarker 
                            key={report._id} 
                            center={[coords[1], coords[0]]}
                            pathOptions={options}
                        >
                            <Popup className="custom-popup">
                                <div className="popup-content">
                                    <h3>{report.infrastructure_type}</h3>
                                    <div className={`damage-tag ${report.damage_level}`}>
                                        {t.options.damage[report.damage_level]}
                                    </div>
                                    <p><strong>{lang === 'fr' ? 'Crise' : 'Crisis'}:</strong> {report.crisis_type}</p>
                                    <p className="description">{report.description}</p>
                                    <p className="location-text">📍 {report.text_location}</p>
                                    <div className="popup-footer">
                                        <span className="timestamp">{new Date(report.created_at).toLocaleDateString()}</span>
                                        {report.source === 'offline' && <span className="offline-pill">SYNCED</span>}
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapView;
