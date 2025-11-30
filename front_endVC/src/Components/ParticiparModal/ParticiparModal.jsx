import React, { useEffect, useState } from "react";
import "../Suscripciones/modalSuscripcion.css";
import { registrarParticipacion } from "../../services/ServicioParticipacion";
import { obtenerSuscritos, crearSuscripcion } from "../../services/ServicioSuscripcion";
import { GetTiposSangre } from "../../services/Servicio_TS";

/*
  ParticiparModal (corrección para que las <option> de tipo de sangre funcionen):
  - Asegura que `form.tipo_sangre` contiene el ID del tipo de sangre (no el label).
  - Renderiza las opciones según estructura flexible del API (id / id_tipo_sangre / labels variados).
*/

function ParticiparModal({ isOpen, onClose, campaign, onParticipateSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    cedula: "",
    tipo_sangre: "", // aquí guardamos el ID (string) — importante
    telefono: "",
  });
  const [tiposSangre, setTiposSangre] = useState([]); // guardamos la respuesta tal cual
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [suscritoExistente, setSuscritoExistente] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSuscritoExistente(null);
      setMsg({ type: "", text: "" });
      setForm({ nombre: "", correo: "", cedula: "", tipo_sangre: "", telefono: "" });
    }
  }, [isOpen]);

  // Cargar tipos de sangre (guardamos lo que venga)
  useEffect(() => {
    async function load() {
      try {
        const data = await GetTiposSangre();
        if (!Array.isArray(data)) return setTiposSangre([]);
        setTiposSangre(data);
      } catch (e) {
        console.error("Error cargando tipos de sangre", e);
        setTiposSangre([]);
      }
    }
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefono") {
      const cleaned = (value || "").replace(/[^0-9+]/g, "").slice(0, 15);
      setForm((f) => ({ ...f, telefono: cleaned }));
      setMsg({ type: "", text: "" });
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "cedula") setMsg({ type: "", text: "" });
  };

  const normalize = (s) => (s == null ? "" : String(s).trim().toLowerCase());

  const findMatchingSuscrito = (list, cedulaBuscada) => {
    if (!Array.isArray(list)) return null;
    const target = normalize(cedulaBuscada);
    return (
      list.find((item) => {
        if (!item || typeof item !== "object") return false;
        const candidates = [
          item.Numero_cedula,
          item.numero_cedula,
          item.NumeroCedula,
          item.cedula,
          item.Cedula,
        ];
        for (const cand of candidates) {
          if (cand != null && normalize(cand) === target) return true;
        }
        // try nested objects
        for (const key of Object.keys(item)) {
          const val = item[key];
          if (typeof val === "string" && normalize(val) === target) return true;
          if (val && typeof val === "object") {
            const nested = val.Numero_cedula ?? val.cedula ?? val.numero_cedula;
            if (nested && normalize(nested) === target) return true;
          }
        }
        return false;
      }) || null
    );
  };

  // Helper: obtener label del tipo de sangre (por su id)
  const getTipoLabelById = (id) => {
    if (id == null || id === "") return "";
    const found = tiposSangre.find((t) => {
      const tid = t.id_tipo_sangre ?? t.id;
      return String(tid) === String(id);
    });
    if (!found) return "";
    return found.blood_type ?? found.nombre ?? found.tipo ?? found.tipo_sangre ?? "";
  };

  const handleBuscarCedula = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    const ced = (form.cedula || "").trim();
    if (!ced) return setMsg({ type: "error", text: "Ingrese la cédula." });

    setLoading(true);
    try {
      const res = await obtenerSuscritos(`Numero_cedula=${encodeURIComponent(ced)}`);
      let lista = [];
      if (Array.isArray(res)) lista = res;
      else if (res == null) lista = [];
      else if (typeof res === "object") {
        if (Array.isArray(res.results)) lista = res.results;
        else if (Array.isArray(res.data)) lista = res.data;
        else lista = [res];
      }

      const encontrado = findMatchingSuscrito(lista, ced);

      if (encontrado) {
        // Obtener ID de sangre (si viene como objeto o id)
        const sangreId = encontrado.Sangre ?? encontrado.Sangre_id ?? (encontrado.Sangre && encontrado.Sangre.id) ?? null;

        setSuscritoExistente(encontrado);

        setForm((f) => ({
          ...f,
          nombre: encontrado.nombre ?? f.nombre,
          correo: encontrado.correo ?? f.correo,
          telefono: encontrado.Telefono ?? f.telefono ?? "",
          // Guardamos EL ID (no el texto). Esto es la corrección clave.
          tipo_sangre: sangreId != null ? String(sangreId) : "",
          cedula: ced,
        }));

        setMsg({ type: "success", text: "Suscrito encontrado. Revisa los datos (bloqueados) y confirma participación." });
        setStep(2);
      } else {
        setSuscritoExistente(null);
        setMsg({ type: "info", text: "No se encontró la cédula. Complete los datos para crear el suscrito." });
        setStep(2);
      }
    } catch (err) {
      console.error("Error buscando suscrito:", err);
      setSuscritoExistente(null);
      setMsg({ type: "info", text: "No se encontró la cédula (o hubo un error). Complete los datos para crear el suscrito." });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);

    try {
      const cedula = (form.cedula || "").trim();
      if (!cedula) {
        setMsg({ type: "error", text: "La cédula es requerida." });
        setLoading(false);
        return;
      }

      const tel = (form.telefono || "").trim();
      if (tel && (tel.length < 6 || tel.length > 15)) {
        setMsg({ type: "error", text: "El teléfono debe tener entre 6 y 15 caracteres." });
        setLoading(false);
        return;
      }

      // 1) Crear suscrito si no existe
      if (!suscritoExistente) {
        const nuevoPayload = {
          Fecha: new Date().toISOString(),
          Numero_cedula: cedula,
          nombre: form.nombre || null,
          correo: form.correo || null,
          Telefono: tel === "" ? null : tel,
        };

        // si user escogió tipo de sangre, lo enviamos como id (número) o string según tu API
        if (form.tipo_sangre) {
          const parsed = Number(form.tipo_sangre);
          nuevoPayload["Sangre"] = Number.isNaN(parsed) ? form.tipo_sangre : parsed;
        }

        console.log("Payload para crear suscrito:", nuevoPayload);
        const creado = await crearSuscripcion(nuevoPayload);
        console.log("crearSuscripcion - creado:", creado);
      }

      // 2) Registrar participacion
      // IMPORTANTE: aquí enviamos solo los campos que el serializer espera.
      await registrarParticipacion({ cedula, nombre: form.nombre, email: form.correo, campaignId: campaign?.id });

      setMsg({ type: "success", text: "Participación registrada con éxito." });
      onParticipateSuccess?.(campaign);
      setTimeout(() => onClose(), 900);
    } catch (err) {
      console.error("Error finalizando participación:", err);
      const server = err?.server || err?.response?.data;
      const mensaje = server
        ? typeof server === "object"
          ? JSON.stringify(server)
          : server
        : (err.messageDetail || err.message || "Error al registrar.");
      setMsg({ type: "error", text: mensaje });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputsDisabled = !!suscritoExistente;

  return (
    <div className="sub-overlay" onClick={onClose}>
      <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="sub-title">{suscritoExistente ? `¡Hola de nuevo, ${form.nombre || ""}!` : "Participa en la campaña"}</h3>

        {step === 1 && (
          <form className="sub-form" onSubmit={handleBuscarCedula}>
            <div className="sub-row">
              <div className="sub-field">
                <label>Cédula</label>
                <input name="cedula" value={form.cedula} onChange={onChange} />
              </div>
            </div>

            {msg.text && <div className={`sub-alert ${msg.type}`}>{msg.text}</div>}

            <button className="sub-btn" disabled={loading}>
              {loading ? "Buscando..." : "Buscar cédula"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="sub-form" onSubmit={handleFinalizar}>
            {!suscritoExistente ? (
              <>
                <div className="sub-field">
                  <label>Nombre</label>
                  <input name="nombre" value={form.nombre} onChange={onChange} />
                </div>

                <div className="sub-field">
                  <label>Correo</label>
                  <input name="correo" value={form.correo} onChange={onChange} />
                </div>

                <div className="sub-field">
                  <label>Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={onChange} placeholder="Ej: 50688881234" />
                </div>

                <div className="sub-field">
                  <label>Tipo de sangre</label>
                  <select name="tipo_sangre" value={form.tipo_sangre} onChange={onChange}>
                    <option value="">Seleccione</option>
                    {tiposSangre.map((t) => {
                      const id = t.id_tipo_sangre ?? t.id;
                      const label = t.blood_type ?? t.nombre ?? t.tipo ?? t.tipo_sangre ?? String(id);
                      return (
                        <option key={String(id)} value={String(id)}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="sub-field">
                  <label>Nombre</label>
                  <input name="nombre" value={form.nombre} onChange={onChange} disabled={inputsDisabled} />
                </div>

                <div className="sub-field">
                  <label>Correo</label>
                  <input name="correo" value={form.correo} onChange={onChange} disabled={inputsDisabled} />
                </div>

                <div className="sub-field">
                  <label>Teléfono (máx 15 caracteres)</label>
                  <input name="telefono" value={form.telefono} onChange={onChange} placeholder="Ej: 50688881234" disabled={inputsDisabled} />
                </div>

                <div className="sub-field">
                  <label>Tipo de sangre</label>
                  <select name="tipo_sangre" value={form.tipo_sangre} onChange={onChange} disabled={inputsDisabled}>
                    <option value="">Seleccione</option>
                    {tiposSangre.map((t) => {
                      const id = t.id_tipo_sangre ?? t.id;
                      const label = t.blood_type ?? t.nombre ?? t.tipo ?? t.tipo_sangre ?? String(id);
                      return (
                        <option key={String(id)} value={String(id)}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  {/* mostrar la etiqueta textual debajo (opcional) */}
                  {form.tipo_sangre && <small>{getTipoLabelById(form.tipo_sangre)}</small>}
                </div>
              </>
            )}

            {msg.text && <div className={`sub-alert ${msg.type}`}>{msg.text}</div>}

            <button className="sub-btn" disabled={loading}>
              {loading ? "Guardando..." : suscritoExistente ? "Confirmar participación" : "Finalizar participación"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ParticiparModal;
