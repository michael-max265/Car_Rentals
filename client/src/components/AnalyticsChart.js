import React from 'react';

/**
 * Reusable horizontal bar chart — pure SVG/CSS, zero dependencies.
 * @param {string}   title
 * @param {Array}    data    – [{ label, value }]
 * @param {string}   color   – CSS color for bars
 * @param {string}   unit    – prefix unit, e.g. '$'
 */
export function HorizontalBarChart({ title, data = [], color = '#2563eb', unit = '' }) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="analytics-chart">
      {title && <h4 className="analytics-chart-title">{title}</h4>}
      <div className="hbar-list">
        {data.map((item, i) => (
          <div key={i} className="hbar-row">
            <span className="hbar-label" title={item.label}>{item.label}</span>
            <div className="hbar-track">
              <div
                className="hbar-fill"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  background: color,
                }}
              />
            </div>
            <span className="hbar-value">{unit}{item.value.toLocaleString()}</span>
          </div>
        ))}
        {data.length === 0 && <p className="analytics-empty">No data yet</p>}
      </div>
    </div>
  );
}

/**
 * Donut chart — pure SVG. Shows up to 6 segments.
 * @param {string}  title
 * @param {Array}   data  – [{ label, value, color }]
 */
export function DonutChart({ title, data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const segments = data.map((item) => {
    const pct  = item.value / total;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const seg  = { ...item, dash, gap, offset, pct };
    offset += dash;
    return seg;
  });

  return (
    <div className="analytics-chart donut-chart-wrapper">
      {title && <h4 className="analytics-chart-title">{title}</h4>}
      <div className="donut-inner">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* background ring */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e2e8f0" strokeWidth="20" />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="20"
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={circumference / 4 - seg.offset}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          ))}
          {/* centre text */}
          <text x={cx} y={cy - 6}  textAnchor="middle" fontSize="22" fontWeight="700" fill="#1e293b">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8">total</text>
        </svg>

        <div className="donut-legend">
          {segments.map((seg, i) => (
            <div key={i} className="donut-legend-item">
              <span className="donut-legend-dot" style={{ background: seg.color }} />
              <span className="donut-legend-label">{seg.label}</span>
              <span className="donut-legend-value">{seg.value}</span>
            </div>
          ))}
          {data.length === 0 && <p className="analytics-empty">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
