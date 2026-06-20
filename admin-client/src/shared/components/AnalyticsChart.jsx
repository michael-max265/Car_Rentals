// src/shared/components/AnalyticsChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export const HorizontalBarChart = ({ title, data, color = "#4f46e5", unit = "" }) => (
  <div className="chart-card glass card">
    <h3 className="chart-title">{title}</h3>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
        <XAxis type="number" tickFormatter={v => `${unit}${v}`} />
        <YAxis dataKey="label" type="category" />
        <Tooltip formatter={(v) => `${unit}${v}`} />
        <Bar dataKey="value" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const DonutChart = ({ title, data }) => {
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"]; // generic palette
  return (
    <div className="chart-card glass card">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={60} outerRadius={80} label>
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
