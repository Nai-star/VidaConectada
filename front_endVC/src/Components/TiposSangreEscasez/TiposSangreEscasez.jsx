import React, { useEffect, useState } from "react";
import "./tiposSangreEscasez.css";
import { FaExclamationCircle } from "react-icons/fa";
import { obtenerTiposSangreUrgentes } from "../../services/Servicio_TS"; 

const TiposSangreEscasez = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Obtener los tipos de sangre urgentes ya con nombre real
        const data = await obtenerTiposSangreUrgentes();
        console.log("Datos crudos del servicio:", data);

        // Filtrar solo los que tengan urgencia === "Urgente"
        const filtrados = Array.isArray(data)
          ? data.filter(
              (i) => i.urgencia && i.urgencia.toLowerCase() === "urgente"
            )
          : [];

        setItems(filtrados);
      } catch (e) {
        setErr(e?.message || "No se pudo cargar la información");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderContent = () => {
    if (loading) return <p className="subtitulo">Cargando…</p>;
    if (err) return <p className="subtitulo">Ocurrió un error: {err}</p>;
    if (!items.length) return <p className="subtitulo">¡Excelente! No hay tipos en escasez por ahora.</p>;

    return (
      <div className="tarjetas-container">
        {items.map((it, index) => {
          const tipoSangre = it.blood_type || "—";
          const keyTarjeta = `sangre-${tipoSangre}-${index}`;

          return (
            <div
              className={`tarjeta-sangre tarjeta-sangre--${it.urgencia.toLowerCase()}`}
              key={keyTarjeta}
              data-urgency={it.urgencia}
              aria-label={`Tipo ${tipoSangre} - ${it.urgencia}`}
            >
              {/* Gota decorativa */}
              <div className="gota" aria-hidden="true"></div>

              {/* Tipo de sangre */}
              <h3 className="tipo">{tipoSangre}</h3>

              {/* Urgencia */}
              <p className={`urgente urgente--${it.urgencia.toLowerCase()}`}>
                {it.urgencia || "Urgente"}
              </p>

              {/* Nota / prioridad */}
              <p className="prioridad">{it.nota || "Se necesita con prioridad"}</p>

             
            
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="tipos-sangre-container" id="escasez">
      <h2 className="titulo-seccion">
        <FaExclamationCircle className="icono-alerta" /> Tipos de Sangre en Escasez
      </h2>
      <p className="subtitulo">
        Estos son los tipos de sangre que necesitan donación urgente
      </p>
      {renderContent()}
    </section>
  );
};

export default TiposSangreEscasez;
