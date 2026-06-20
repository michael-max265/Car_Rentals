import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import useCarStore from '../store/useCarStore';
import useBookingStore from '../store/useBookingStore';
import useAuthStore from '../store/useAuthStore';
import './AdminDashboard.css';

const VehicleTrackingMap = lazy(() => import('../components/VehicleTrackingMap'));

const parseDate = (val) => {
  if (!val) return new Date();
  if (val._seconds) return new Date(val._seconds * 1000);
  if (val.seconds) return new Date(val.seconds * 1000);
  return new Date(val);
};

// Lazy‑load heavy chart components – they only load when the Analytics tab is active
const HorizontalBarChart = lazy(() =>
  import('../components/AnalyticsChart').then(m => ({ default: m.HorizontalBarChart }))
);
const DonutChart = lazy(() =>
  import('../components/AnalyticsChart').then(m => ({ default: m.DonutChart }))
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const { user } = useAuthStore();
  const { cars, fetchCars, createCar, updateCar, deleteCar } = useCarStore();
  const { bookings, fetchAllBookings, updateBookingStatus } = useBookingStore();

  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const initialForm = { name: '', description: '', price: '', color: '', image: '', modelUrl: '', range: '', gearbox: '', seat: '' };
  const [carForm, setCarForm] = useState(initialForm);

  // Initial data fetch
  useEffect(() => {
    fetchCars();
    if (user) fetchAllBookings();
  }, [fetchCars, fetchAllBookings, user]);

  // Analytics data – memoised for performance
  const analytics = useMemo(() => {
    const totalRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const cancellationRate = totalBookings ? Math.round((cancelled / totalBookings) * 100) : 0;

    // Revenue per car
    const revenueByCarId = {};
    bookings.forEach(b => {
      revenueByCarId[b.carId] = (revenueByCarId[b.carId] || 0) + (b.totalPrice || 0);
    });
    const revenueByCarData = Object.entries(revenueByCarId)
      .map(([carId, value]) => ({
        label: cars.find(c => c.id === carId)?.name || carId.slice(-6),
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Bookings by status
    const statusCounts = { pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => { if (statusCounts[b.status] !== undefined) statusCounts[b.status]++; });
    const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#10b981', active: '#3b82f6', completed: '#8b5cf6', cancelled: '#ef4444' };
    const statusData = Object.entries(statusCounts)
      .filter(([, v]) => v > 0)
      .map(([label, value]) => ({ label, value, color: STATUS_COLORS[label] }));

    // Insurance breakdown
    const insuranceCounts = { basic: 0, standard: 0, premium: 0 };
    bookings.forEach(b => { if (b.insuranceType && insuranceCounts[b.insuranceType] !== undefined) insuranceCounts[b.insuranceType]++; });
    const insuranceData = [
      { label: 'Basic', value: insuranceCounts.basic },
      { label: 'Standard', value: insuranceCounts.standard },
      { label: 'Premium', value: insuranceCounts.premium },
    ].filter(d => d.value > 0);

    // Bookings over the last 6 months
    const monthMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthMap[key] = { label, value: 0 };
    }
    bookings.forEach(b => {
      const d = parseDate(b.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) monthMap[key].value++;
    });
    const timelineData = Object.values(monthMap);

    return { totalRevenue, totalBookings, activeBookings, cancellationRate, revenueByCarData, statusData, insuranceData, timelineData };
  }, [bookings, cars]);

  // Handlers
  const handleTabChange = tab => setActiveTab(tab);
  const handleEditClick = car => { 
    setEditingCar(car); 
    setCarForm({
      ...car,
      image: car.image || '',
      range: car.specs?.range || '',
      gearbox: car.specs?.transmission || '',
      seat: car.specs?.seats || '',
    }); 
    setShowCarModal(true); 
  };
  const handleDeleteClick = async id => { if (window.confirm('Delete this car?')) await deleteCar(id); };
  const handleCarSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...carForm,
      specs: {
        ...(carForm.specs || {}),
        range: carForm.range,
        transmission: carForm.gearbox,
        seats: carForm.seat,
      }
    };
    // Remove the flat properties before saving
    delete payload.range;
    delete payload.gearbox;
    delete payload.seat;

    if (editingCar) await updateCar(editingCar.id, payload);
    else await createCar(payload);
    setShowCarModal(false);
    setEditingCar(null);
    setCarForm(initialForm);
  };
  const handleApproveBooking = async id => {
    await updateBookingStatus(id, 'confirmed');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
      </header>

      <nav className="admin-tabs">
        <button className={activeTab === 'inventory' ? 'tab active' : 'tab'} onClick={() => handleTabChange('inventory')}>Car Inventory</button>
        <button className={activeTab === 'bookings' ? 'tab active' : 'tab'} onClick={() => handleTabChange('bookings')}>All Bookings</button>
        <button className={activeTab === 'tracking' ? 'tab active' : 'tab'} onClick={() => handleTabChange('tracking')}>🗺️ Tracking</button>
        <button className={activeTab === 'analytics' ? 'tab active' : 'tab'} onClick={() => handleTabChange('analytics')}>📊 Analytics</button>
      </nav>

      {/* Inventory */}
      {activeTab === 'inventory' && (
        <section className="admin-section">
          <div className="section-header">
            <h2>Manage Inventory</h2>
            <button className="action-btn" onClick={() => { setEditingCar(null); setCarForm(initialForm); setShowCarModal(true); }}>+ Add New Car</button>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Price</th><th>Color</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id} className="row">
                    <td>{car.name}</td>
                    <td>{car.price}</td>
                    <td><div className="color-badge" style={{ backgroundColor: car.color }} /></td>
                    <td className="action-cell">
                      <button className="edit-btn" onClick={() => handleEditClick(car)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteClick(car.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {cars.length === 0 && (<tr className="empty-row"><td colSpan="4">No cars in inventory</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <section className="admin-section">
          <h2 className="section-title">Platform Analytics</h2>
          <div className="kpi-row">
            <div className="kpi-card"><div className="kpi-icon">💰</div><div className="kpi-label">Total Revenue</div><div className="kpi-value">${analytics.totalRevenue.toLocaleString()}</div></div>
            <div className="kpi-card"><div className="kpi-icon">📋</div><div className="kpi-label">Total Bookings</div><div className="kpi-value">{analytics.totalBookings}</div></div>
            <div className="kpi-card"><div className="kpi-icon">🚗</div><div className="kpi-label">Active / Confirmed</div><div className="kpi-value">{analytics.activeBookings}</div></div>
            <div className="kpi-card"><div className="kpi-icon">❌</div><div className="kpi-label">Cancellation Rate</div><div className="kpi-value">{analytics.cancellationRate}%</div></div>
          </div>
          <Suspense fallback={<div className="chart-loading">Loading charts...</div>}>
            <div className="analytics-grid">
              <HorizontalBarChart title="Revenue by Car" data={analytics.revenueByCarData} color="#2563eb" unit="$" />
              <DonutChart title="Bookings by Status" data={analytics.statusData} />
              <HorizontalBarChart title="Insurance Tier Breakdown" data={analytics.insuranceData} color="#7c3aed" />
              <HorizontalBarChart title="Bookings Over Time" data={analytics.timelineData} color="#059669" />
            </div>
          </Suspense>
        </section>
      )}

      {/* Bookings */}
      {activeTab === 'bookings' && (
        <section className="admin-section">
          <h2 className="section-title">Global Bookings</h2>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Car ID</th><th>User ID</th><th>Dates</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="row">
                    <td className="small">{b.id.slice(-6)}</td>
                    <td className="small">{b.carId.slice(-6)}</td>
                    <td className="small">{b.userId.slice(-6)}</td>
                    <td className="small">{parseDate(b.startDate).toLocaleDateString()} - {parseDate(b.endDate).toLocaleDateString()}</td>
                    <td className="price">${b.totalPrice}</td>
                    <td className="small" style={{ textTransform: 'capitalize' }}>{b.paymentProvider || 'stripe'}</td>
                    <td className="small"><span className={b.status === 'active' || b.status === 'confirmed' ? 'badge success' : 'badge warning'}>{b.status}</span></td>
                    <td className="action-cell">
                      {b.status === 'pending' && (
                        <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleApproveBooking(b.id)}>Approve</button>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (<tr className="empty-row"><td colSpan="8">No bookings found</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tracking */}
      {activeTab === 'tracking' && (
        <section className="admin-section">
          <Suspense fallback={<div className="chart-loading">Loading tracking map...</div>}>
            <VehicleTrackingMap bookings={bookings} cars={cars} />
          </Suspense>
        </section>
      )}

      {/* Car Modal */}
      {showCarModal && (
        <div className="modal-overlay" onClick={() => setShowCarModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editingCar ? 'Edit Car' : 'Add New Car'}</h2>
            <form onSubmit={handleCarSubmit} className="modal-form">
              <div className="form-group full-width"><label>Name</label><input required type="text" value={carForm.name} onChange={e => setCarForm({ ...carForm, name: e.target.value })} /></div>
              <div className="form-group"><label>Price (e.g., $50/day)</label><input required type="text" value={carForm.price} onChange={e => setCarForm({ ...carForm, price: e.target.value })} /></div>
              <div className="form-group"><label>Color (Hex/Name)</label><input required type="text" value={carForm.color} onChange={e => setCarForm({ ...carForm, color: e.target.value })} /></div>
              <div className="form-group"><label>Image URL</label><input required type="url" placeholder="https://..." value={carForm.image || ''} onChange={e => setCarForm({ ...carForm, image: e.target.value })} /></div>
              <div className="form-group"><label>Range (e.g., 300 mi)</label><input type="text" value={carForm.range || ''} onChange={e => setCarForm({ ...carForm, range: e.target.value })} /></div>
              <div className="form-group"><label>Gearbox</label><input type="text" value={carForm.gearbox || ''} onChange={e => setCarForm({ ...carForm, gearbox: e.target.value })} /></div>
              <div className="form-group"><label>Seats</label><input type="number" value={carForm.seat || ''} onChange={e => setCarForm({ ...carForm, seat: e.target.value })} /></div>
              <div className="form-group"><label>3D Model URL (optional)</label><input type="text" value={carForm.modelUrl || ''} onChange={e => setCarForm({ ...carForm, modelUrl: e.target.value })} /></div>
              <div className="form-group full-width"><label>Description</label><textarea required value={carForm.description} onChange={e => setCarForm({ ...carForm, description: e.target.value })} /></div>
              <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setShowCarModal(false)}>Cancel</button><button type="submit" className="btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
