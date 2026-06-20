import React, { useEffect, useState, Suspense } from 'react';
import api from '../shared/api';
import { HorizontalBarChart, DonutChart } from '../shared/components/AnalyticsChart';
import './Analytics.css';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('Failed to load analytics');
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="analytics"><p>Loading analytics…</p></div>;
  if (error) return <div className="analytics"><p className="error">{error}</p></div>;

  const {
    carCount,
    bookingCount,
    totalRevenue,
    revenueByCarData = [],
    statusData = [],
    insuranceData = [],
    timelineData = [],
  } = stats;

  return (
    <div className="analytics glass card">
      <h2 className="analytics-title">Analytics Dashboard</h2>
      <div className="kpi-grid">
        <div className="kpi-card card glass">
          <span className="kpi-icon">🚗</span>
          <span className="kpi-value">{carCount ?? '-'}</span>
          <span className="kpi-label">Cars in fleet</span>
        </div>
        <div className="kpi-card card glass">
          <span className="kpi-icon">💰</span>
          <span className="kpi-value">{totalRevenue?.toLocaleString() ?? '-'}</span>
          <span className="kpi-label">Total revenue</span>
        </div>
        <div className="kpi-card card glass">
          <span className="kpi-icon">📅</span>
          <span className="kpi-value">{bookingCount ?? '-'}</span>
          <span className="kpi-label">Bookings</span>
        </div>
      </div>
      <Suspense fallback={<div className="chart-loading">Loading charts…</div>}>
        <div className="analytics-grid">
          <HorizontalBarChart title="Revenue by Car" data={revenueByCarData} unit="$" />
          <DonutChart title="Bookings by Status" data={statusData} />
          <HorizontalBarChart title="Insurance Types" data={insuranceData} unit="×" />
          <HorizontalBarChart title="Bookings Over Time" data={timelineData} />
        </div>
      </Suspense>
    </div>
  );
}
