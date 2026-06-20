import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './VehicleTrackingMap.css';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom car icon for the map
const createCarIcon = (isMoving) =>
  L.divIcon({
    className: 'vehicle-marker',
    html: `<div style="
      font-size: 24px;
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      background: ${isMoving ? '#10b981' : '#f59e0b'};
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">🚗</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });

// Map center – Lagos, Nigeria
const CENTER = [6.5244, 3.3792];

/**
 * Simulate vehicle positions around the city center.
 * Each active booking gets a random position that drifts periodically.
 */
function generateVehiclePositions(bookings, cars) {
  return bookings
    .filter(b => b.status === 'active' || b.status === 'confirmed')
    .map((booking, i) => {
      const car = cars.find(c => c.id === booking.carId);
      // Spread vehicles in a ~10km radius around center
      const angle = (i / Math.max(bookings.length, 1)) * 2 * Math.PI + Math.random() * 0.5;
      const radius = 0.02 + Math.random() * 0.04;
      const lat = CENTER[0] + Math.sin(angle) * radius;
      const lng = CENTER[1] + Math.cos(angle) * radius;
      const isMoving = Math.random() > 0.4; // 60% chance moving

      return {
        id: booking.id,
        carName: car?.name || `Car ${booking.carId?.slice(-6)}`,
        bookingId: booking.id.slice(-6).toUpperCase(),
        userId: booking.userId?.slice(-6) || '—',
        lat,
        lng,
        isMoving,
        speed: isMoving ? Math.floor(20 + Math.random() * 80) : 0,
      };
    });
}

/**
 * VehicleTrackingMap – Admin tracking tab.
 * Props: bookings (array), cars (array)
 */
export default function VehicleTrackingMap({ bookings, cars }) {
  const [vehicles, setVehicles] = useState([]);
  const intervalRef = useRef(null);

  // Generate initial positions
  useEffect(() => {
    setVehicles(generateVehiclePositions(bookings, cars));
  }, [bookings, cars]);

  // Simulate movement every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVehicles(prev =>
        prev.map(v => ({
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 0.002,
          lng: v.lng + (Math.random() - 0.5) * 0.002,
          isMoving: Math.random() > 0.35,
          speed: Math.random() > 0.35 ? Math.floor(20 + Math.random() * 80) : 0,
        }))
      );
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const movingCount = vehicles.filter(v => v.isMoving).length;
  const parkedCount = vehicles.length - movingCount;

  if (vehicles.length === 0) {
    return (
      <div className="tracking-empty">
        <div className="empty-icon">🗺️</div>
        <h3>No Active Vehicles</h3>
        <p>Vehicle positions will appear here when bookings are active or confirmed.</p>
      </div>
    );
  }

  return (
    <div className="tracking-section">
      <div className="tracking-header">
        <h2>Live Vehicle Tracking</h2>
        <div className="tracking-stats">
          <span className="tracking-stat">
            <span className="dot total"></span> {vehicles.length} Vehicles
          </span>
          <span className="tracking-stat">
            <span className="dot active"></span> {movingCount} Moving
          </span>
          <span className="tracking-stat">
            <span className="dot parked"></span> {parkedCount} Parked
          </span>
        </div>
      </div>

      <div className="tracking-map-container">
        <MapContainer center={CENTER} zoom={12} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vehicles.map(v => (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={createCarIcon(v.isMoving)}>
              <Popup>
                <div className="vehicle-popup">
                  <h4>🚗 {v.carName}</h4>
                  <div className="popup-row">
                    <span className="label">Booking</span>
                    <span className="value">#{v.bookingId}</span>
                  </div>
                  <div className="popup-row">
                    <span className="label">Renter</span>
                    <span className="value">...{v.userId}</span>
                  </div>
                  <div className="popup-row">
                    <span className="label">Speed</span>
                    <span className="value">{v.speed} km/h</span>
                  </div>
                  <span className={`popup-status ${v.isMoving ? 'moving' : 'parked'}`}>
                    {v.isMoving ? '● Moving' : '● Parked'}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="tracking-vehicle-list">
        {vehicles.map(v => (
          <div key={v.id} className="tracking-vehicle-card">
            <div className="tracking-vehicle-icon">🚗</div>
            <div className="tracking-vehicle-info">
              <h4>{v.carName}</h4>
              <p>Booking #{v.bookingId} • Speed: {v.speed} km/h</p>
            </div>
            <span className={`tracking-vehicle-status ${v.isMoving ? 'moving' : 'parked'}`}>
              {v.isMoving ? 'Moving' : 'Parked'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
