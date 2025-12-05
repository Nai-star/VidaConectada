import React, { useEffect, useState } from "react";
import {
  listarBuzon,
  listarRespuestas,
  crearRespuesta,
  obtenerUsuarioActual
} from "../../../services/ServicioBuzon";

export default function AdminBuzon() {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");

  /* =======================================
     CARGA INICIAL
  ======================================== */
  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const u = await obtenerUsuarioActual();
      setUsuario(u);

      const pq = await listarBuzon();
      setPreguntas(pq);

      const rs = await listarRespuestas();
      setRespuestas(rs);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  }

  /* =======================================
     GUARDAR RESPUESTA
  ======================================== */
  async function handleGuardarRespuesta() {
    if (!textoRespuesta.trim()) {
      alert("Debe escribir una respuesta.");
      return;
    }

    if (!usuario) {
      alert("Debe iniciar sesión para responder.");
      return;
    }

    const payload = {
      Respuesta_P: textoRespuesta,
      estado: 1,
      Buzon_id: preguntaSeleccionada.id,
      CustomUser_id: usuario.id
    };

    try {
      await crearRespuesta(payload);

      setTextoRespuesta("");
      setPreguntaSeleccionada(null);

      await cargarDatos();
      alert("Respuesta enviada correctamente.");
    } catch (err) {
      console.error("Error enviando respuesta:", err);
      alert("Error al enviar respuesta.");
    }
  }

  return (
    <div className="admin-buzon">
      <h2>Buzón de consultas</h2>

      {!usuario && (
        <p style={{ color: "red" }}>
          ⚠ Debe iniciar sesión para responder.
        </p>
      )}

      <div className="preguntas-lista">
        {preguntas.map((p) => (
          <div key={p.id} className="pregunta-card">
            <p><strong>{p.nombre}</strong></p>
            <p>{p.pregunta}</p>

            <button onClick={() => setPreguntaSeleccionada(p)}>
              Responder
            </button>

            {/* MOSTRAR RESPUESTAS */}
            {respuestas
              .filter((r) => r.Buzon_id === p.id)
              .map((r) => (
                <div key={r.id} className="respuesta">
                  <strong>Respuesta:</strong> {r.Respuesta_P}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* MODAL DE RESPUESTA */}
      {preguntaSeleccionada && (
        <div className="modal">
          <h3>Responder a:</h3>
          <p>{preguntaSeleccionada.pregunta}</p>

          <textarea
            value={textoRespuesta}
            onChange={(e) => setTextoRespuesta(e.target.value)}
            placeholder="Escriba su respuesta..."
          />

          <button onClick={handleGuardarRespuesta}>Enviar</button>
          <button onClick={() => setPreguntaSeleccionada(null)}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
