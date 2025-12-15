import { obtenerCampanas } from "./ServicioCampanas";
import { listarBuzon, listarRespuestas } from "./ServicioBuzon";
import { obtenerTiposSangreUrgentes } from "./Servicio_TS";
import { obtenerSuscritos, obtenerParticipaciones } from "./ServicioSuscripcion";

/* ============================================================
   HELPERS FECHAS
============================================================ */

function normalizarFecha(fecha) {
  if (!fecha) return null;

  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const d = new Date(fecha);
  return isNaN(d.getTime()) ? null : d;
}

function getMesKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getUltimos6Meses() {
  const meses = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    meses.push({
      key: getMesKey(d),
      label: d.toLocaleDateString("es-CR", { month: "short" }),
      total: 0,
    });
  }

  return meses;
}

function getSuscritoKey(p) {
  return (
    p?.suscrito ??
    p?.suscrito_id ??
    p?.usuario ??
    p?.usuario_id ??
    null
  );
}

/* ============================================================
   MÉTRICAS PRINCIPALES
============================================================ */

export async function obtenerMetricasDashboard() {
  const [
    campanas,
    buzon,
    respuestas,
    urgentes,
    suscritos,
  ] = await Promise.all([
    obtenerCampanas(),
    listarBuzon(),
    listarRespuestas(),
    obtenerTiposSangreUrgentes(),
    obtenerSuscritos(),
  ]);

  return {
    campañasActivas: Array.isArray(campanas)
      ? campanas.filter(c => c.Activo === true).length
      : 0,

    preguntasPendientes: Array.isArray(buzon)
      ? buzon.filter(
          b => !Array.isArray(respuestas) || !respuestas.some(r => r.Buzon === b.id)
        ).length
      : 0,

    stockCritico: Array.isArray(urgentes)
      ? urgentes.filter(u => String(u.urgencia).toLowerCase() === "urgente").length
      : 0,

    donantesRegistrados: Array.isArray(suscritos)
      ? suscritos.length
      : 0,
  };
}

/* ============================================================
   CAMPAÑAS POR MES
============================================================ */

export async function obtenerCampanasPorMes() {
  const campanas = await obtenerCampanas();
  const meses = getUltimos6Meses();

  if (!Array.isArray(campanas)) return meses;

  campanas.forEach(c => {
    const fecha = normalizarFecha(c?.Fecha_inicio);
    if (!fecha) return;

    const mes = meses.find(m => m.key === getMesKey(fecha));
    if (mes) mes.total += 1;
  });

  return meses;
}

/* ============================================================
   CAMPAÑAS RECIENTES
============================================================ */

export async function obtenerCampanasRecientes(limit = 3) {
  const campanas = await obtenerCampanas();
  if (!Array.isArray(campanas)) return [];

  return campanas
    .filter(c => typeof c?.id === "number")
    .sort((a, b) => b.id - a.id)
    .slice(0, limit);
}

/* ============================================================
   DONANTES ACTIVOS POR MES  ✅ CORRECTO
============================================================ */

export async function obtenerDonantesActivosPorMes() {
  const participaciones = await obtenerParticipaciones();
  const meses = getUltimos6Meses();

  if (!Array.isArray(participaciones)) return meses;

  participaciones.forEach(p => {
    const fecha = normalizarFecha(
      p.fecha_participacion ||
      p.fecha_asistencia ||
      p.fecha ||
      p.created_at ||
      p.created
    );

    const suscritoId = getSuscritoKey(p);
    if (!fecha || !suscritoId) return;

    const mes = meses.find(m => m.key === getMesKey(fecha));
    if (!mes) return;

    if (!mes._donantes) mes._donantes = new Set();
    mes._donantes.add(String(suscritoId));
  });

  return meses.map(m => ({
    key: m.key,
    label: m.label,
    total: m._donantes ? m._donantes.size : 0,
  }));
}
