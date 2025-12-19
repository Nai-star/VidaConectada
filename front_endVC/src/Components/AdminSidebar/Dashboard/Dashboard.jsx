import React, { useEffect, useState } from "react";
import {
  obtenerMetricasDashboard,
  obtenerCampanasPorMes,
  obtenerCampanasRecientes,
  obtenerDonantesActivosPorMes,
} from "../../../services/ServicioDashboard";


import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./Dashboard.css";

export default function Dashboard() {
  const [metricas, setMetricas] = useState(null);
  const [campanasMes, setCampanasMes] = useState([]);
  const [donantesActivos, setDonantesActivos] = useState([]);
  const [recientes, setRecientes] = useState([]);
  

  useEffect(() => {
    async function cargar() {
      try {
        setMetricas(await obtenerMetricasDashboard());
        setCampanasMes(await obtenerCampanasPorMes());
        setDonantesActivos(await obtenerDonantesActivosPorMes());
        setRecientes(await obtenerCampanasRecientes());
      } catch (e) {
        console.error("Error cargando dashboard:", e);
      }
    }
    cargar();
  }, []);

  /* 🔍 DEBUG */
  useEffect(() => {
    console.log("Campañas por mes:", campanasMes);
    console.log("Donantes activos:", donantesActivos);
  }, [campanasMes, donantesActivos]);

  if (!metricas) return <p>Cargando dashboard…</p>;

  function obtenerEstadoCampana(c) {
  // Estado REAL desde BD
  if (c.Activo === false) return "vencida";

  const hoy = new Date();
  const inicio = new Date(c.Fecha_inicio);
  const fin = new Date(c.Fecha_fin || c.Fecha_inicio);

  if (hoy < inicio) return "programada";
  if (hoy > fin) return "vencida";
  return "activa";
}
const recientesActivas = recientes.filter(c => c.Activo === true);



  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="subtitle">Resumen general de VidaConectada</p>

      {/* CARDS */}
      <div className="cards">
        <Card title="Campañas activas" value={metricas.campañasActivas} badge1="Activo" />
        <Card title="Donantes registrados" value={metricas.donantesRegistrados} />
        <Card title="Stock crítico" value={metricas.stockCritico} badge1="Urgente" />
        <Card title="Preguntas pendientes" value={metricas.preguntasPendientes} badge1="Pendientes" />
      </div>

      {/* GRÁFICAS */}
      <div className="charts">
        <div className="chart-box">
          <h3>Campañas por mes</h3>
          <p>Últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campanasMes}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Donantes activos</h3>
          <p>Tendencia de participación</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={donantesActivos}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CAMPAÑAS RECIENTES */}
      <div className="recientes">
      <h3>Campañas recientes</h3>

      {recientesActivas.length === 0 && (
        <p className="empty">No hay campañas recientes</p>
      )}

      {recientesActivas.map(c => {
        const estado = obtenerEstadoCampana(c);

        return (
          <div key={c.id} className="reciente-item">
            <div>
              <strong>{c.Titulo}</strong>
              <small>{c.Fecha_inicio}</small>
            </div>

            <span className={`estado ${estado}`}>
              {estado === "activa" && "Activa"}
              {estado === "programada" && "Programada"}
              {estado === "vencida" && "Vencida"}
            </span>
          </div>
    );
  })}
</div>

    </div>
  );
}

function Card({ title, value, badge1 }) {
  return (
    <div className="card">
      <span className="value">{value}</span>
      <p>{title}</p>
      {badge1 && <span className={`badge1 ${badge1.toLowerCase()}`}>{badge1}</span>}
    </div>
  );
}
