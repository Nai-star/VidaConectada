import React, { useState } from "react";
import { actualizarBannerAdmin } from "../../../services/ServicioCarrusel";
import "./ModalEditar.css";

export default function ModalEditar({ cerrar, recargar, banner }) {
  const [texto, setTexto] = useState(banner?.text || banner?.texto || "");
  const [mostrarTexto, setMostrarTexto] = useState(
    banner?.showText ?? banner?.mostrar_texto ?? true
  );
  const [filtroOscuro, setFiltroOscuro] = useState(
    banner?.darkFilter ?? banner?.filtro_oscuro ?? false
  );

  const handleGuardar = async () => {
    try {
      // Usar las claves que espera el servicio: showText y darkFilter
      await actualizarBannerAdmin(banner.id, {
        texto,
        showText: mostrarTexto,
        darkFilter: filtroOscuro,
      });

      recargar();
      cerrar();
    } catch (error) {
      console.error("Error guardando banner:", error);

    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Editar Banner</h2>

        <label>Texto</label>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={mostrarTexto}
            onChange={(e) => setMostrarTexto(e.target.checked)}
          />
          Mostrar texto
        </label>

        <label>
          <input
            type="checkbox"
            checked={filtroOscuro}
            onChange={(e) => setFiltroOscuro(e.target.checked)}
          />
          Filtro oscuro
        </label>

        <div className="modal-actions">
          <button className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>
          <button className="btn-guardar" onClick={handleGuardar}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
