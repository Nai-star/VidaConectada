// GestionUsuarios.jsx
import React, { useEffect, useState } from "react";
import {
  obtenerSuscritos,
  obtenerSuscritoPorId,
  eliminarSuscrito,
  buildSearchQuery,
  obtenerParticipaciones,
  obtenerParticipacionesPorSuscrito,
  calcularTipoDonante
} from "../../../services/ServicioSuscripcion";
import { GetTiposSangre } from "../../../services/Servicio_TS";
import { obtenerCampanas } from "../../../services/ServicioCampanas";
import "./GestionUsuarios.css";

/* ---------------- Helpers de fecha ---------------- */

// parsea varias formas y devuelve Date | null
function parseParticipationDate(part) {
  if (!part) return null;

  const candidates = [
    part.fecha_participacion,
    part.fecha_asistencia,
    part.fecha ?? part.Fecha,
    part.created_at,
    part.created ?? part.fecha_creacion,
    part.date,
    part.timestamp,
    part.fecha_registro,
    part.fecha_inscripcion,
    part.date_created
  ];

  for (const c of candidates) {
    if (!c) continue;

    // si ya es Date
    if (c instanceof Date && !isNaN(c.getTime())) return c;

    // número -> timestamp (s o ms)
    if (typeof c === "number") {
      const maybeMs = String(c).length <= 10 ? c * 1000 : c;
      const dnum = new Date(maybeMs);
      if (!isNaN(dnum.getTime())) return dnum;
    }

    const str = String(c).trim();

    // 1) ISO completo con 'T' y opcional zona -> Date estándar (ya incluye zona)
    const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?$/.test(str);
    if (isoLike) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d;
    }

    // 2) Formato "YYYY-MM-DD HH:MM:SS" (sin zona) -> construir Date en HORA LOCAL
    const spaceDateTime = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(str);
    if (spaceDateTime) {
      const [datePart, timePart] = str.split(/[ T]/);
      const [y, mo, day] = datePart.split("-").map(x => parseInt(x, 10));
      const [hh, mm, ss] = timePart.split(":").map(x => parseInt(x.split(".")[0], 10));
      // Crear Date usando constructor local: evita shifts por zona
      const d = new Date(y, mo - 1, day, hh || 0, mm || 0, ss || 0);
      if (!isNaN(d.getTime())) return d;
    }

    // 3) Otros formatos: intentar new Date fallback
    const dfallback = new Date(str);
    if (!isNaN(dfallback.getTime())) return dfallback;
  }

  // nested metadata fallback
  if (part.metadata && typeof part.metadata === "object") {
    const nested = part.metadata.fecha ?? part.metadata.date;
    if (nested) {
      const d = parseParticipationDate({ tmp: nested });
      if (d) return d;
    }
  }

  return null;
}

// Devuelve fecha en formato local "YYYY-MM-DD" (sin conversión a UTC)
function formatLocalISODate(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return null;
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  // aseguramos 2 dígitos
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

// Calcula la última fecha (local) de un array de participaciones; devuelve "YYYY-MM-DD" (local) o null
function calcularUltimaFechaDeParticipaciones(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const fechas = parts.map(parseParticipationDate).filter(Boolean);
  if (fechas.length === 0) return null;
  const ultima = new Date(Math.max(...fechas.map(d => d.getTime())));
  return formatLocalISODate(ultima);
}

// Formatea para mostrar D/M/YYYY (sin ceros líderes en día/mes como pediste)
function formatDateDisplay(isoOrDate) {
  if (!isoOrDate) return null;
  // si es string 'YYYY-MM-DD', podemos partirla directo
  if (typeof isoOrDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) {
    const [y, mo, d] = isoOrDate.split("-");
    return `${parseInt(d, 10)}/${parseInt(mo, 10)}/${y}`;
  }
  // si es Date u otro string, parsear con Date y usar getters LOCALES
  let dObj = null;
  if (isoOrDate instanceof Date) dObj = isoOrDate;
  else dObj = new Date(isoOrDate);
  if (!dObj || isNaN(dObj.getTime())) return null;
  const day = dObj.getDate();
  const month = dObj.getMonth() + 1;
  const year = dObj.getFullYear();
  return `${day}/${month}/${year}`;
}

/* ---------------- Otros helpers (sangre/participación/telefono) ---------------- */

function getSuscritoIdFromParticipation(part) {
  if (!part) return null;
  const raw = part.suscrito ?? part.suscrito_id ?? part.Suscrito ?? part.usuario ?? part.usuario_id ?? part.user ?? null;
  if (raw !== null && raw !== undefined) {
    if (typeof raw === "number" || typeof raw === "string") return String(raw);
    if (typeof raw === "object") {
      const id = raw.id ?? raw.pk ?? raw.ID ?? raw.pk_id ?? raw.suscrito ?? raw.suscrito_id ?? raw.usuario_id ?? raw.user_id ?? null;
      if (id != null) return String(id);
    }
  }
  const email = part.email ?? part.correo ?? part.user_email ?? part.usuario_email ?? (part.usuario && (part.usuario.email ?? part.usuario.correo));
  if (email) return `__email__:${String(email).toLowerCase().trim()}`;
  const ced = part.Numero_cedula ?? part.numero_cedula ?? part.cedula ?? (part.usuario && (part.usuario.Numero_cedula ?? part.usuario.numero_cedula ?? part.usuario.cedula));
  if (ced) return `__ced__:${String(ced).trim()}`;
  const nombre = part.nombre ?? part.name ?? (part.usuario && (part.usuario.nombre ?? part.usuario.name));
  if (nombre) return `__name__:${String(nombre).toLowerCase().trim()}`;
  return null;
}

function getCampaignKey(part) {
  if (!part) return null;
  const cand = part.campana ?? part.campana_id ?? part.campanaId ?? part.campaign ?? part.campaign_id ?? part.campaignId ?? part.Campana ?? null;
  if (cand != null) {
    if (typeof cand === "object") {
      const id = cand.id ?? cand.pk ?? cand.ID ?? cand.pk_id ?? cand.pkId ?? null;
      if (id != null) return String(id);
      const title = cand.titulo ?? cand.Titulo ?? cand.title ?? cand.nombre ?? cand.name ?? null;
      if (title != null) return `title:${String(title).trim()}`;
      try { return `obj:${JSON.stringify(cand)}`; } catch (e) {}
    } else {
      return String(cand);
    }
  }
  const title2 = part.campana_titulo ?? part.campanaTitulo ?? part.campaign_title ?? part.title ?? part.titulo ?? null;
  if (title2) return `title:${String(title2).trim()}`;
  return null;
}

function createBloodMap(bloodTypes) {
  if (!Array.isArray(bloodTypes)) return {};
  const map = {};
  bloodTypes.forEach((type) => {
    const id = type.id ?? type.pk ?? type.ID ?? type.id_tipo_sangre ?? type.id_tipo ?? null;
    const label = type.nombre ?? type.name ?? type.tipo ?? type.tipo_sangre ?? type.blood_type ?? null;
    if (id != null && label != null) map[String(id)] = String(label);
  });
  return map;
}

function extractBlood(item) {
  const candidate = item.Sangre ?? item.sangre ?? item.TipoSangre ?? item.tipo_sangre ?? item.tipo ?? null;
  let sangre_id = null;
  let sangre_label = null;
  if (candidate !== null && candidate !== undefined) {
    if (typeof candidate === "string") sangre_label = candidate;
    else if (typeof candidate === "number") sangre_id = candidate;
    else if (typeof candidate === "object") {
      sangre_id = candidate.id ?? candidate.ID ?? candidate.pk ?? candidate.sangre_id ?? candidate.Sangre_id ?? null;
      sangre_label = candidate.tipo ?? candidate.nombre ?? candidate.name ?? candidate.label ?? candidate.tipo_sangre ?? null;
      if (!sangre_label && typeof candidate.tipo === "object") {
        sangre_label = candidate.tipo?.tipo ?? candidate.tipo?.nombre ?? candidate.tipo?.label ?? null;
      }
    }
  }
  sangre_id = sangre_id ?? item.Sangre_id ?? item.sangre_id ?? item.sangreId ?? null;
  sangre_label = sangre_label ?? item.tipo_sangre ?? item.tipo ?? item.tipoSangre ?? null;
  if (typeof sangre_label === "string") sangre_label = sangre_label.trim();
  return { sangre_id, sangre_label };
}

function resolvePhone(raw = {}, participaciones = []) {
  const keys = ["Telefono", "telefono", "phone", "telefono_movil", "movil", "celular", "phone_number"];
  for (const k of keys) {
    if (raw && (raw[k] !== undefined) && raw[k] !== null && String(raw[k]).trim() !== "") {
      return String(raw[k]).trim();
    }
  }
  if (Array.isArray(participaciones)) {
    for (const p of participaciones) {
      const cand = p.telefono ?? p.Phone ?? p.phone ?? p.telefono_movil ?? p.usuario?.telefono ?? p.usuario?.phone;
      if (cand) return String(cand).trim();
    }
  }
  return "";
}

/* compara participación con suscrito (robusta) */
function matchParticipationToSuscrito(part, sus) {
  if (!part || !sus) return false;
  const key = getSuscritoIdFromParticipation(part);
  if (!key) return false;
  const susId = sus.id ?? sus.pk ?? sus.ID ?? null;
  if (susId != null && String(key) === String(susId)) return true;
  const email = (sus.correo ?? sus.email ?? "").toLowerCase().trim();
  if (email && key === `__email__:${email}`) return true;
  const ced = sus.Numero_cedula ?? sus.numero_cedula ?? sus.cedula ?? null;
  if (ced && key === `__ced__:${String(ced).trim()}`) return true;
  const nombreNorm = (sus.nombre ?? sus.name ?? "").toLowerCase().trim();
  if (nombreNorm && key === `__name__:${nombreNorm}`) return true;
  // fallback comparar sid directo
  if (!key.startsWith("__") && susId != null && String(key) === String(susId)) return true;
  return false;
}

/* ---------------- Component ---------------- */

export default function GestionUsuarios() {
  const [suscritos, setSuscritos] = useState([]);
  const [suscritosOriginales, setSuscritosOriginales] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [bloodMap, setBloodMap] = useState({});
  const [allParticipaciones, setAllParticipaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("suscritos");
  const [selected, setSelected] = useState(null);

  useEffect(() => { cargarDatos(); /* eslint-disable-next-line */ }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [sRaw, cRaw, pRaw, btRaw] = await Promise.all([
        obtenerSuscritos(),
        obtenerCampanas(),
        obtenerParticipaciones(),
        GetTiposSangre().catch(() => [])
      ]);

      const allSus = Array.isArray(sRaw) ? sRaw : [];
      const allParts = Array.isArray(pRaw) ? pRaw : [];
      const allCamp = Array.isArray(cRaw) ? cRaw : [];
      setAllParticipaciones(allParts);

      // indexar suscritos por id/email/cedula/nombre
      const susById = {};
      const susByEmail = {};
      const susByCedula = {};
      const susByName = {};
      allSus.forEach(it => {
        const idRaw = it.id ?? it.pk ?? it.ID ?? it.user_id ?? null;
        const id = idRaw != null ? String(idRaw) : null;
        const email = (it.correo ?? it.email ?? "").toLowerCase().trim() || null;
        const ced = it.Numero_cedula ?? it.numero_cedula ?? it.cedula ?? null;
        const nombreNorm = (it.nombre ?? it.name ?? "").toLowerCase().trim() || null;
        if (id) susById[id] = it;
        if (email) susByEmail[`__email__:${email}`] = it;
        if (ced) susByCedula[`__ced__:${String(ced).trim()}`] = it;
        if (nombreNorm) susByName[`__name__:${nombreNorm}`] = it;
      });

      // agrupar participaciones por suscrito (clave flexible)
      const participBySus = {};
      const unmatched = [];
      allParts.forEach(part => {
        const key = getSuscritoIdFromParticipation(part);
        if (!key) { unmatched.push(part); return; }
        let finalSusId = null;
        if (key.startsWith("__email__:")) {
          const found = susByEmail[key]; if (found) finalSusId = String(found.id ?? found.pk ?? found.ID ?? null);
        } else if (key.startsWith("__ced__:")) {
          const found = susByCedula[key]; if (found) finalSusId = String(found.id ?? found.pk ?? found.ID ?? null);
        } else if (key.startsWith("__name__:")) {
          const found = susByName[key]; if (found) finalSusId = String(found.id ?? found.pk ?? found.ID ?? null);
        } else {
          if (susById[key]) finalSusId = String(key);
          else {
            const alt = Object.keys(susById).find(k => String(k) === String(key));
            if (alt) finalSusId = String(alt);
          }
        }
        if (finalSusId) {
          participBySus[finalSusId] = participBySus[finalSusId] || [];
          participBySus[finalSusId].push(part);
        } else unmatched.push(part);
      });

      // mapa tipos sangre
      setBloodMap(createBloodMap(Array.isArray(btRaw) ? btRaw : []));

      // normalizar suscritos y ligar participaciones (copias)
      const normalized = allSus.map(it => {
        const idRaw = it.id ?? it.pk ?? it.ID ?? it.user_id ?? null;
        const id = idRaw != null ? String(idRaw) : null;
        let particips = id && participBySus[String(id)] ? participBySus[String(id)].slice() : [];
        const email = (it.correo ?? it.email ?? "").toLowerCase().trim() || null;
        const ced = it.Numero_cedula ?? it.numero_cedula ?? it.cedula ?? null;
        if ((!particips || particips.length === 0) && email) {
          const k = Object.keys(participBySus).find(k => {
            const arr = participBySus[k];
            return Array.isArray(arr) && arr.some(p => ((p.email ?? p.correo ?? (p.usuario && (p.usuario.email ?? p.usuario.correo)) ?? "").toLowerCase().trim()) === email);
          });
          if (k) particips = participBySus[k].slice();
        }
        if ((!particips || particips.length === 0) && ced) {
          const k = Object.keys(participBySus).find(k => {
            const arr = participBySus[k];
            return Array.isArray(arr) && arr.some(p => {
              const pc = p.Numero_cedula ?? p.numero_cedula ?? p.cedula ?? (p.usuario && (p.usuario.Numero_cedula ?? p.usuario.numero_cedula ?? p.usuario.cedula)) ?? null;
              return pc && String(pc).trim() === String(ced).trim();
            });
          });
          if (k) particips = participBySus[k].slice();
        }

        const { sangre_id, sangre_label } = extractBlood(it);
        const rawCopy = (() => { try { return JSON.parse(JSON.stringify(it)); } catch (e) { return { ...it }; } })();
        const telefonoLocal = resolvePhone(rawCopy, particips);
        const fechaUltLocalISO = calcularUltimaFechaDeParticipaciones(particips); // local YYYY-MM-DD
        const uniqueCampaigns = new Set((particips || []).map(p => getCampaignKey(p)).filter(k => k != null));

        return {
          id,
          nombre: it.nombre ?? it.name ?? "",
          correo: it.correo ?? it.email ?? "",
          numero_cedula: it.Numero_cedula ?? it.numero_cedula ?? it.cedula ?? "",
          sangre_id: sangre_id != null ? String(sangre_id) : null,
          sangre_label,
          fecha: it.Fecha ?? it.fecha ?? null,
          donor_type: calcularTipoDonante(particips),
          participaciones: Array.isArray(particips) ? particips.slice() : [],
          num_campanas: uniqueCampaigns.size,
          raw: rawCopy,
          telefono: telefonoLocal,
          last_donation_date: fechaUltLocalISO // local YYYY-MM-DD or null
        };
      });

      const byId = {};
      normalized.forEach(u => {
        const key = u && u.id ? String(u.id) : `__noid__:${u?.correo ?? u?.numero_cedula ?? Math.random()}`;
        byId[key] = u;
      });

      const finalList = Object.values(byId);
      setSuscritos(finalList);
      setSuscritosOriginales(finalList);
      setCampanas(allCamp);
    } catch (e) {
      console.error("cargarDatos error:", e);
    } finally {
      setLoading(false);
    }
  }

  // búsqueda simple (usa originales para mantener participaciones)
  function onBuscar(e) {
    const valor = e.target.value ?? "";
    setQ(valor);
    const lower = valor.toLowerCase().trim();
    if (!lower) { setSuscritos(suscritosOriginales); return; }
    const filtered = suscritosOriginales.filter(s =>
      (s.nombre ?? "").toLowerCase().includes(lower) ||
      (s.correo ?? "").toLowerCase().includes(lower) ||
      (String(s.numero_cedula ?? "")).toLowerCase().includes(lower)
    );
    setSuscritos(filtered);
  }

  // ver detalles (abre modal, enriquece y filtra remotas para asegurarnos que sean del suscrito)
  async function verDetalles(obj) {
    const rawCopy = (() => { try { return JSON.parse(JSON.stringify(obj.raw ?? obj)); } catch (e) { return { ...(obj.raw ?? obj) }; } })();
    const localParts = obj.participaciones ?? obj.participations ?? rawCopy?.participaciones ?? [];
    const fechaLocalISO = calcularUltimaFechaDeParticipaciones(localParts);
    const telefonoLocal = obj.telefono ?? resolvePhone(rawCopy, localParts);

    setSelected({
      ...obj,
      raw: rawCopy,
      participaciones: Array.isArray(localParts) ? localParts.slice() : [],
      last_donation_date: fechaLocalISO,
      telefono: telefonoLocal
    });

    const id = obj.id ?? obj.pk ?? null;
    if (!id) return;
    try {
      let remote = await obtenerParticipacionesPorSuscrito(id);
      let partsArray = Array.isArray(remote) ? remote : (remote?.data ?? remote?.results ?? []);
      if (!Array.isArray(partsArray)) partsArray = [];

      // Filtrar robustamente para que solo queden participaciones de este suscrito
      const finalParts = partsArray.filter(p => matchParticipationToSuscrito(p, obj))
                         .length > 0 ? partsArray.filter(p => matchParticipationToSuscrito(p, obj)) :
                         // fallback: coincidencia por campo suscrito directo
                         partsArray.filter(p => {
                           const sid = p.suscrito ?? p.suscrito_id ?? p.Suscrito ?? p.usuario ?? null;
                           if (sid == null) return false;
                           if (typeof sid === "object") {
                             const pid = sid.id ?? sid.pk ?? sid.ID ?? sid.pk_id ?? sid.usuario_id ?? null;
                             if (pid != null) return String(pid) === String(id);
                             return false;
                           }
                           return String(sid) === String(id);
                         });

      const fechaRemotaISO = calcularUltimaFechaDeParticipaciones(finalParts);
      const telefonoRemota = resolvePhone(rawCopy, finalParts);

      setSelected(prev => prev ? {
        ...prev,
        participaciones: Array.isArray(finalParts) ? finalParts.slice() : prev.participaciones,
        num_campanas: new Set((finalParts || []).map(p => getCampaignKey(p))).size,
        last_donation_date: fechaRemotaISO ?? prev.last_donation_date,
        telefono: telefonoRemota || prev.telefono
      } : prev);

      // sincronizar listas principales
      setSuscritos(prev => prev.map(s => {
        if (String(s.id) === String(id)) {
          return {
            ...s,
            participaciones: Array.isArray(finalParts) ? finalParts.slice() : s.participaciones,
            last_donation_date: fechaRemotaISO ?? s.last_donation_date,
            telefono: telefonoRemota || s.telefono,
            num_campanas: new Set((finalParts || []).map(p => getCampaignKey(p))).size
          };
        }
        return s;
      }));
      setSuscritosOriginales(prev => prev.map(s => {
        if (String(s.id) === String(id)) {
          return {
            ...s,
            participaciones: Array.isArray(finalParts) ? finalParts.slice() : s.participaciones,
            last_donation_date: fechaRemotaISO ?? s.last_donation_date,
            telefono: telefonoRemota || s.telefono,
            num_campanas: new Set((finalParts || []).map(p => getCampaignKey(p))).size
          };
        }
        return s;
      }));
    } catch (err) {
      console.warn("obtenerParticipacionesPorSuscrito fallo, aplicando fallback local:", err);
      try {
        const fallbackParts = (allParticipaciones || []).filter(p => matchParticipationToSuscrito(p, obj));
        const fechaFallbackISO = calcularUltimaFechaDeParticipaciones(fallbackParts);
        const telefonoFallback = resolvePhone(rawCopy, fallbackParts);
        setSelected(prev => prev ? {
          ...prev,
          participaciones: Array.isArray(fallbackParts) ? fallbackParts.slice() : prev.participaciones,
          num_campanas: new Set((fallbackParts || []).map(p => getCampaignKey(p))).size,
          last_donation_date: fechaFallbackISO ?? prev.last_donation_date,
          telefono: telefonoFallback || prev.telefono
        } : prev);
      } catch (e2) {
        console.warn("fallback local fallo:", e2);
      }
    }
  }

async function borrar(id) {
  if (!window.confirm("¿Eliminar suscrito? Esta acción no puede revertirse.")) return;

  console.log("Intentando eliminar suscrito id:", id);
  try {
    const resp = await eliminarSuscrito(id);
    // resp === null -> 404 tratado por el servicio
    setSuscritos(prev => prev.filter(p => String(p.id) !== String(id)));
    setSuscritosOriginales(prev => prev.filter(p => String(p.id) !== String(id)));
    if (selected?.id === id) setSelected(null);
    console.info("Suscrito eliminado o no existía:", id, resp);
   
    
  } catch (err) {
    console.error("Error borrar:", err);
    if (err && err.server) console.error("Server payload:", err.server);
    if (err && err.status === 404) {
      setSuscritos(prev => prev.filter(p => String(p.id) !== String(id)));
      setSuscritosOriginales(prev => prev.filter(p => String(p.id) !== String(id)));
      if (selected?.id === id) setSelected(null);
      return;
    }
    const serverMsg = err?.server?.detail || err?.server || err.message || "No se pudo eliminar, revisa consola.";
  
  }
}




  const getBloodTypeBadgeClass = (label) => {
    if (!label) return "";
    const norm = label.toUpperCase().replace(/[^A-Z0-9+-]/g, "");
    if (norm.includes("O-")) return "O-neg";
    if (norm.includes("O+")) return "O-pos";
    if (norm.includes("A-")) return "A-neg";
    if (norm.includes("A+")) return "A-pos";
    if (norm.includes("B-")) return "B-neg";
    if (norm.includes("B+")) return "B-pos";
    if (norm.includes("AB-")) return "AB-neg";
    if (norm.includes("AB+")) return "AB-pos";
    return "";
  };
  const getDonorTypeBadgeClass = (type) => {
    if (!type) return "ocasional";
    const norm = String(type).toLowerCase().replace(/\s/g, "");
    if (norm.includes("primeravez") || norm.includes("primera")) return "primera-vez";
    if (norm.includes("regular")) return "regular";
    if (norm.includes("frecuente")) return "frecuente";
    return "ocasional";
  };

  const items = tab === "inscritos" ? suscritos.filter(s => Array.isArray(s.participaciones) && s.participaciones.length > 0) : suscritos;
  const totalSuscritos = suscritos.length;
  const donantesActivos = suscritos.filter(s => Array.isArray(s.participaciones) && s.participaciones.length > 0).length;

  return (
    <div className="gestion-usuarios-page">
      <div className="admin-content-area">
        <header>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios registrados y participantes de campañas</p>
        </header>

        <div className="search-row">
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="#4C5A6A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 22L20 20" stroke="#4C5A6A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <input placeholder="Buscar por nombre, email o tipo de sangre..." value={q} onChange={onBuscar} />
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <strong>Total Suscritos</strong>
            <div className="stat-number">{totalSuscritos}</div>
            <div className="stat-meta">usuarios registrados</div>
          </div>
          
          <div className="stat-card">
            <strong>Inscritos Campañas</strong>
            <div className="stat-number">{donantesActivos}</div>
            <div className="stat-meta">participantes activos</div>
          </div>
        </div>

        <div className="tabs">
          <button className={tab === "suscritos" ? "active" : ""} onClick={() => setTab("suscritos")}>Suscritos ({totalSuscritos})</button>
          <button className={tab === "inscritos" ? "active" : ""} onClick={() => setTab("inscritos")}>Inscritos a Campañas ({donantesActivos})</button>
        </div>

        <div className="table-wrap">
          {loading ? <div className="loading-state">Cargando...</div> : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Contacto</th>
                  <th>Tipo de Sangre</th>
                  <th>Tipo de Donante</th>
                  <th>Campañas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => {
                  const key = s.id ?? s.correo ?? Math.random();
                  const sangreLabel = s.sangre_label ?? (s.sangre_id ? (bloodMap[s.sangre_id] ?? `ID ${s.sangre_id}`) : "-");
                  return (
                    <tr key={key}>
                      <td>
                        <div className="user-info">
                          <div className="user-icon">{(s.nombre || "U").split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                          <div>
                            <strong>{s.nombre}</strong>
                            {s.numero_cedula && (<div className="meta1 cedula"> Cédula: {s.numero_cedula} </div>)}
                            <div className="meta1">Registro: {s.fecha ? (s.fecha.split?.("T")[0] ?? s.fecha) : "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div className="contact-email-row">
                            <svg
                              className="contact-icon"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span>{s.correo}</span>
                          </div>

                          <div className="contact-cedula-row">
                            <svg
                              className="contact-icon"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>{s.telefono ? s.telefono : "Sin teléfono"}</span>
                          </div>
                        </div>

                      </td>
                      <td>
                        <div className={`badge blood-type-badge ${getBloodTypeBadgeClass(sangreLabel)}`}>
                          <svg className="blood-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35c-3.15-3.04-6.42-6.52-6.42-10.42C5.58 6.47 8.5 3 12 3s6.42 3.47 6.42 7.93c0 3.9-3.27 7.38-6.42 10.42z"/></svg>
                          <span>{sangreLabel}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`badge donor-type-badge ${getDonorTypeBadgeClass(s.donor_type)}`}>
                          {s.donor_type}
                        </div>
                      </td>
                      <td>
                        <div className="campaign-count-badge">{Number(s.num_campanas || 0)}</div>
                      </td>
                      <td className="actions-cell">
  <button className="btn-details" onClick={() => verDetalles(s)}>Ver detalles</button>
  {s.id && (
    <button className="btn-delete" onClick={() => borrar(s.id)} title="Eliminar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12h-11L5 9zm7-7c1.104 0 2 .896 2 2h-4c0-1.104.896-2 2-2z"/>
      </svg>
    </button>
  )}
</td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-detalle-usuario" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Usuario</h3>
              <p>Información completa del registro</p>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="user-overview">
              <div className="user-icon-large">{(selected.nombre||"U").split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
              <div className="user-name-type">
                <strong>{selected.nombre}</strong>
                <span className={`badge donor-type-badge ${getDonorTypeBadgeClass(selected.donor_type)}`}>{selected.donor_type}</span>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">EMAIL</div>
                <div className="value">{selected.correo}</div>
              </div>
              <div className="detail-item">
                <div className="label">TELÉFONO</div>
                <div className="value">{selected.telefono || "Sin teléfono"}</div>
              </div>
              <div className="detail-item">
                <div className="label">TIPO DE SANGRE</div>
                <div className="value"><span className={`badge blood-type-badge ${getBloodTypeBadgeClass(selected.sangre_label)}`}>{selected.sangre_label ?? (selected.sangre_id ? (bloodMap[selected.sangre_id] ?? `ID ${selected.sangre_id}`) : "-")}</span></div>
              </div>
              <div className="detail-item">
                <div className="label">FECHA DE REGISTRO</div>
                <div className="value">{selected.fecha?.split?.("T")[0] ?? selected.fecha ?? "-"}</div>
              </div>
              <div className="detail-item">
                <div className="label">CAMPAÑAS ASISTIDAS</div>
                <div className="value">{selected.num_campanas}</div>
              </div>
              <div className="detail-item">
                <div className="label">ÚLTIMA DONACIÓN</div>
                <div className="value">{formatDateDisplay(selected.last_donation_date) ?? "Sin registro"}</div>
              </div>
            </div>

            {Array.isArray(selected.participaciones) && selected.participaciones.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <strong>Participaciones</strong>
                <ul style={{ marginTop: 8 }}>
                  {selected.participaciones.map((p, i) => (
                    <li key={i}>
                      {formatDateDisplay(calcularUltimaFechaDeParticipaciones([p])) ?? "Sin fecha"} — Campaña: {getCampaignKey(p) ?? (p.campana_id ?? p.campana ?? "N/A")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
