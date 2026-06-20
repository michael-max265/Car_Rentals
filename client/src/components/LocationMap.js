import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './LocationMap.css';

// Fix default Leaflet marker icons (broken in Webpack/CRA)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Demo pickup/drop-off locations – replace with real data from your backend later
const PICKUP_LOCATIONS = [
  {
    id: 1,
    name: 'CarRental HQ – Victoria Island',
    address: '25 Adeola Odeku St, Victoria Island, Lagos',
    hours: 'Open 24/7',
    lat: 6.4281,
    lng: 3.4219,
  },
  {
    id: 2,
    name: 'CarRental – Ikeja Branch',
    address: '12 Allen Avenue, Ikeja, Lagos',
    hours: '7 AM – 10 PM',
    lat: 6.6018,
    lng: 3.3515,
  },
  {
    id: 3,
    name: 'CarRental – Lekki Branch',
    address: '5 Admiralty Way, Lekki Phase 1, Lagos',
    hours: '8 AM – 9 PM',
    lat: 6.4474,
    lng: 3.4737,
  },
  {
    id: 4,
    name: 'CarRental – Airport Pickup',
    address: 'Murtala Muhammed Intl Airport, Ikeja',
    hours: 'Open 24/7',
    lat: 6.5774,
    lng: 3.3212,
  },
  {
    id: 5,
    name: 'CarRental – Surulere Branch',
    address: '88 Adeniran Ogunsanya St, Surulere, Lagos',
    hours: '8 AM – 8 PM',
    lat: 6.4969,
    lng: 3.3574,
  },
];

// Default map center (Lagos, Nigeria)
const MAP_CENTER = [6.5244, 3.3792];
const MAP_ZOOM = 12;

/**
 * LocationMap – Shows pickup/drop-off locations on a Leaflet map.
 * Props:
 *   variant: 'inline' (for Showroom) or 'home' (for Home page)
 *   locations: optional array to override the default demo locations
 */
export default function LocationMap({ variant = 'inline', locations }) {
  const spots = locations || PICKUP_LOCATIONS;

  if (variant === 'home') {
    return (
      <section className="home-map-section">
        <div className="home-section-inner">
          <div className="section-header">
            <p className="section-eyebrow">Our Locations</p>
            <h2 className="section-title">Find Us Near You</h2>
          </div>
          <div className="home-map-container">
            <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {spots.map(loc => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                  <Popup>
                    <div className="location-popup">
                      <h4>{loc.name}</h4>
                      <p>{loc.address}</p>
                      <p className="popup-hours">{loc.hours}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="location-cards">
            {spots.map(loc => (
              <div key={loc.id} className="location-card">
                <h4>📍 {loc.name}</h4>
                <p>{loc.address}</p>
                <p className="card-hours">{loc.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Inline variant for Showroom
  return (
    <div className="location-map-section">
      <h3>📍 Pickup & Drop-off Locations</h3>
      <div className="location-map-container">
        <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {spots.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="location-popup">
                  <h4>{loc.name}</h4>
                  <p>{loc.address}</p>
                  <p className="popup-hours">{loc.hours}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export { PICKUP_LOCATIONS, MAP_CENTER };
