// ServicioCampanas.js
import { authorizedFetch } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const CLOUDINARY_BASE =
  (import.meta.env.VITE_CLOUDINARY_BASE ||
    "https://res.cloudinary.com/dfhdzszjp")
    .replace(/\/+$/, "");

function buildCloudinaryUrl(value) {
  if (!value) return null;

  // Si ya es URL completa, usarla tal cual
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Limpiar posibles prefijos
  let publicId = value
    .replace(/^\/+/, "")
    .replace(/^image\/upload\//, "")
    .replace(/^v\d+\//, "");

  return `${CLOUDINARY_BASE}/image/upload/${publicId}`;
}

// ================================
// Obtener usuario actual
// ================================
export async function obtenerUsuarioActual() {
  try {
    const id = localStorage.getItem("userId");
    const res = await authorizedFetch(`${API_URL}/usuarios/${id}/`);
    console.log("Status de usuario actual:", res.status);
    if (!res.ok) return null;
    const data = await res.json();
    console.log(data);
    
    console.log("Usuario actual:", data);
    return data?.id ?? data?.pk ?? null;
  } catch (e) {
    console.warn("No se pudo obtener usuario actual:", e);
    return null;
  }
}

// ================================
// Obtener campañas
// ================================
// reemplaza la función obtenerCampanas en ServicioCampanas.js por esta
export async function obtenerCampanas() {
  const res = await authorizedFetch(`${API_URL}/campanas/`);
  if (!res.ok) throw new Error(`Error al obtener campañas: ${res.status}`);
  const data = await res.json();

  const isImageCandidate = (v) => {
    if (!v) return false;
    if (typeof v !== "string") return false;
    const s = v.toLowerCase().trim();
    // cloudinary path or http url or image extension
    if (s.includes("image/upload")) return true;
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("//")) return true;
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/.test(s)) return true;
    return false;
  };

  const extractFromObject = (obj) => {
    // si es string -> candidato directo
    if (typeof obj === "string") {
      if (isImageCandidate(obj)) return obj;
      return null;
    }

    // si es objeto que contiene imagen_url / imagen / url / public_id
    if (obj && typeof obj === "object") {
      const candidates = [
        obj.imagen_url,
        obj.url,
        obj.secure_url,
        obj.imagen,
        obj.imagen_public_id,
        obj.public_id,
        obj.path,
      ];
      for (const c of candidates) {
        if (isImageCandidate(c)) return c;
      }
      // si algunos campos contienen public id (ej: "campanas/xyz.jpg" o "campanas/xyz")
      for (const k of Object.keys(obj)) {
        const val = obj[k];
        if (typeof val === "string" && (val.includes("/") || val.includes("campanas") || val.match(/\w+\.(jpg|jpeg|png|webp|gif)$/i))) {
          if (isImageCandidate(val)) return val;
          // si parece publicId (no incluye image/upload ni http) lo devolvemos para que buildCloudinaryUrl lo normalice
          const maybePid = val.replace(/^\/+/, "");
          if (maybePid && maybePid.length < 200 && !maybePid.includes(" ")) return maybePid;
        }
      }
    }
    return null;
  };

  return (Array.isArray(data) ? data : []).map((item) => {
    // 1) intentar campos específicos conocidos
    const imagenesRaw = item.Imagen_campana ?? item.imagenes ?? (item.Imagenes ?? null);

    let imgs = [];
    if (Array.isArray(imagenesRaw) && imagenesRaw.length > 0) {
      imgs = imagenesRaw.map(i => extractFromObject(i)).filter(Boolean);
    }

    // 2) si no encontró, buscar campos comunes en el objeto
    if (imgs.length === 0) {
      const posibles = [
        item.imagen, item.imagen_url, item.Foto_P, item.Foto, item.foto, item.image
      ];
      for (const p of posibles) {
        if (Array.isArray(p)) {
          imgs.push(...p.map(x => extractFromObject(x)).filter(Boolean));
        } else {
          const e = extractFromObject(p);
          if (e) imgs.push(e);
        }
      }
    }

    // 3) si aún nada, hacer scan completo del objeto (keys y nested shallow)
    if (imgs.length === 0) {
      for (const k of Object.keys(item)) {
        const v = item[k];
        if (!v) continue;
        if (typeof v === "string") {
          if (isImageCandidate(v)) imgs.push(v);
          else {
            // si parece public id (ej: "campanas/xxx.jpg" o "campanas/xxx")
            const maybePid = v.replace(/^\/+/, "");
            if (maybePid.includes("/") && maybePid.length < 200) imgs.push(maybePid);
          }
        } else if (Array.isArray(v) && v.length > 0) {
          for (const el of v) {
            const found = extractFromObject(el);
            if (found) imgs.push(found);
          }
        } else if (typeof v === "object") {
          // shallow search inside object
          const found = extractFromObject(v);
          if (found) imgs.push(found);
        }
        if (imgs.length > 0) break;
      }
    }

    // 4) normalizar cada candidato: si ya es URL completa, usarla; si es publicId, construir Cloudinary URL
    const imagenes = imgs.map(candidate => {
      if (!candidate) return null;
      if (typeof candidate === "string" && /^(https?:)?\/\//i.test(candidate)) {
        if (candidate.startsWith("//")) return `https:${candidate}`;
        return candidate;
      }
      // candidate puede ser 'image/upload/...' o 'v123/...', o 'campanas/xxx.jpg'
      return buildCloudinaryUrl(candidate);
    }).filter(Boolean);

    // debug: si no encontró imágenes, loguear el objeto (para que puedas inspeccionar en consola)
    if (!imagenes || imagenes.length === 0) {
      console.warn(`[obtenerCampanas] No se encontraron imágenes para campaña id=${item.id}. Objeto devuelto:`, item);
    } else {
      console.log("Campaña", item.id, "imagenes:", imagenes);
    }

    return {
      ...item,
      imagenes
    };
  });
}



// ================================
// Helper: YYYY-MM-DD -> DD-MM-YYYY
// ================================
function toBackendDate(fecha) {
  if (!fecha) return null;

  // Si es objeto Date
  if (fecha instanceof Date) {
    if (isNaN(fecha)) return null;
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`; // <-- EL FORMATO CORRECTO
  }

  // Si no es string, intentar convertir a Date y formatear
  if (typeof fecha !== "string") {
    const d = new Date(fecha);
    if (!isNaN(d)) return toBackendDate(d);
    return null;
  }

  const s = fecha.trim();

  // Ya en formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD-MM-YYYY -> convertir
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }

  // YYYY/MM/DD -> YYYY-MM-DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(s)) {
    return s.replace(/\//g, "-");
  }

  // DD/MM/YYYY -> convertir
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Intentar parsear cualquier otra cosa y formatear
  const parsed = new Date(s);
  if (!isNaN(parsed)) return toBackendDate(parsed);

  return null;
}


// ================================
// Crear campaña
// ================================
export async function crearCampana(data) {
  console.log("crearCampana - Datos de entrada:", data);

  if (!data.titulo || !String(data.titulo).trim()) throw new Error("El titulo es requerido");
  if (!data.fecha) throw new Error("La fecha es requerida");
  if (!data.Cantones && data.Cantones !== 0) throw new Error("Debe seleccionar un canton");

  let canton = Array.isArray(data.Cantones) ? data.Cantones[0] : data.Cantones;
  canton = typeof canton === "string" ? parseInt(canton, 10) : canton;
  if (Number.isNaN(canton)) throw new Error("Cantón inválido");

  const Fecha_inicio = toBackendDate(data.fecha);
  const Fecha_fin = toBackendDate(data.fechaFin || data.fecha);

  if (!Fecha_inicio || !Fecha_fin) throw new Error("Formato de fecha inválido");

  const formatHora = (h) => h ? (h.split(":").length === 3 ? h : `${h}:00`) : null;
  const Hora_inicio = formatHora(data.hora);
  const Hora_fin = formatHora(data.horaFin || data.hora);

  const usuarioId = await obtenerUsuarioActual();
  console.log("Usuario ID obtenido:", usuarioId);
  if (!usuarioId) throw new Error("Usuario no autenticado (CustomUser requerido en backend)");

  const tieneArchivo = data.imagen instanceof File;

  if (tieneArchivo) {
    const form = new FormData();
    form.append("Titulo", String(data.titulo).trim());
    form.append("Descripcion", String(data.subtitulo ?? ""));
    form.append("Fecha_inicio", Fecha_inicio);
    form.append("Fecha_fin", Fecha_fin);
    if (Hora_inicio) form.append("Hora_inicio", Hora_inicio);
    if (Hora_fin) form.append("Hora_fin", Hora_fin);
    form.append("direccion_exacta", String(data.lugar ?? ""));
    form.append("Activo", String(data.Activo !== undefined ? data.Activo : true));
    form.append("Contacto", String(data.contacto ?? "info@vidaconectada.cr"));
    form.append("Cantones", String(canton));
    //form.append("CustomUser", String(usuarioId));
    form.append("imagen", data.imagen);

    console.log(form);
    

    console.log("[ServicioCampanas] Enviando FormData (multipart) con imagen");

    const res = await authorizedFetch(`${API_URL}/campanas/`, {
      method: "POST",
      body: form // NO poner Content-Type, browser lo hace
    });

    const texto = await res.text();
    if (!res.ok) {
      try { throw new Error(`Error ${res.status}: ${JSON.stringify(JSON.parse(texto))}`); }
      catch { throw new Error(`Error ${res.status}: ${texto}`); }
    }
    return JSON.parse(texto);
  }

  // JSON normal si no hay archivo
  const body = {
    Titulo: String(data.titulo).trim(),
    Descripcion: String(data.subtitulo ?? ""),
    Fecha_inicio,
    Fecha_fin,
    Hora_inicio,
    Hora_fin,
    direccion_exacta: String(data.lugar ?? ""),
    Activo: data.Activo !== undefined ? data.Activo : true,
    Contacto: String(data.contacto ?? "info@vidaconectada.cr"),
    Cantones: canton,
    //CustomUser: usuarioId
  };

  console.log("Body a enviar:", body);

  const res = await authorizedFetch(`${API_URL}/campanas/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const texto = await res.text();
  if (!res.ok) {
    try { throw new Error(`Error ${res.status}: ${JSON.stringify(JSON.parse(texto))}`); }
    catch { throw new Error(`Error ${res.status}: ${texto}`); }
  }

  return JSON.parse(texto);
}

// ================================
// Actualizar campaña
// ================================

// ================================
// Eliminar campaña
// ================================
export async function eliminarCampana(id) {
  if (id == null) throw new Error("ID inválido para eliminar");

  const base = API_URL.replace(/\/+$/, "");
  const urls = [
    `${base}/campanas/${id}/`,
    `${base}/campanas/${id}`
  ];

  let lastDetail = null;

  for (const url of urls) {
    try {
      const res = await authorizedFetch(url, { method: "DELETE" });

      // Si la respuesta es 204 No Content o 200 OK -> éxito
      if (res.status === 204 || res.status === 200) {
        return true;
      }

      // Si no ok, leer cuerpo (si existe) para mensaje
      const text = await res.text().catch(() => null);
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : text; } catch (e) { parsed = text; }

      lastDetail = { url, status: res.status, body: parsed };

      // Si recibimos 404 podemos intentar la otra URL (siguiente iteración)
      if (res.status === 404) continue;

      // Para otros errores, lanzar con info
      throw new Error(parsed ? (typeof parsed === "string" ? parsed : JSON.stringify(parsed)) : `HTTP ${res.status}`);
    } catch (err) {
      // captura errores de fetch / network o el throw anterior
      lastDetail = lastDetail || { url, error: String(err) };
      // si fue un fallo de red, no insistir en otra URL; romper
      if (String(err).toLowerCase().includes("network") || String(err).toLowerCase().includes("failed")) {
        break;
      }
      // si fue un error con cuerpo lo propago
      throw err;
    }
  }

  console.error("eliminarCampana -> fallo. details:", lastDetail);
  // construir mensaje legible
  const msg = lastDetail?.body ?? lastDetail?.error ?? `No se pudo eliminar (status: ${lastDetail?.status ?? "?"})`;
  throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
}
;

// en ServicioCampanas.js - parche para actualizarCampana:
// ServicioCampanas.js
export async function actualizarCampana(id, data) {
  if (id == null) throw new Error("ID de campaña inválido");

  const base = API_URL.replace(/\/+$/, "");
  const urlsToTry = [
    `${base}/campanas/${id}/`,
    `${base}/campanas/${id}`
  ];

  const isForm = data instanceof FormData;
  const body = isForm ? data : JSON.stringify(data);
  const headers = isForm ? {} : { "Content-Type": "application/json" };

  let lastError = null;
  for (const url of urlsToTry) {
    try {
      const res = await authorizedFetch(url, { method: "PATCH", body, headers });
      if (res.ok) {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      }
      const text = await res.text().catch(() => null);
      lastError = { url, status: res.status, body: text };
      // si responde distinto de 404, devolvemos info (no intentamos PUT)
      if (res.status !== 404) break;
    } catch (err) {
      lastError = { url, error: String(err) };
    }
  }

  console.error("actualizarCampana -> fallo PATCH. details:", lastError);
  const msg = lastError?.body ?? lastError?.error ?? `HTTP ${lastError?.status ?? "?"}`;
  throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
}
export async function actualizarEstadoCampana(id, activo) {
  if (id == null) throw new Error("ID de campaña inválido");

  const base = API_URL.replace(/\/+$/, "");
  const urls = [
    `${base}/campanas/${id}/`,
    `${base}/campanas/${id}`
  ];

  const body = JSON.stringify({ Activo: activo });

  let lastError = null;

  for (const url of urls) {
    try {
      const res = await authorizedFetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body
      });

      if (res.ok) {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      }

      const text = await res.text().catch(() => null);
      lastError = { url, status: res.status, body: text };

      if (res.status !== 404) break;
    } catch (err) {
      lastError = { url, error: String(err) };
    }
  }

  console.error("actualizarEstadoCampana -> error:", lastError);
  throw new Error(
    typeof lastError?.body === "string"
      ? lastError.body
      : `No se pudo actualizar el estado`
  );
}