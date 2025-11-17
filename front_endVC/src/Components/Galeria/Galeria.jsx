import React, { useEffect, useState } from "react";
import "./Galeria.css";
import { obtenerGaleriaActiva } from "../../services/ServicioGaleria";


function Galeria({ limit = 8 }) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [light, setLight] = useState({ open: false, idx: 0 });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await obtenerGaleriaActiva();
        if (!alive) return;
        setItems(data);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Error cargando galería");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const visible = items.slice(0, limit);

  return (
    
    <section className="gal-wrap">
        
      <p className="gal-note">Agradecemos a nuestros donantes de sangre</p>
      <h2 className="gal-title">Cada donación nos permite salvar vidas</h2>
      <div className="gal-underline" />

      {loading && <div className="gal-loading">Cargando fotos…</div>}
      {err && <div className="gal-error">{err}</div>}

      <div className="gal-grid">
        {visible.map((it, i) => (
          <button
            key={it.id || i}
            className="gal-item"
            onClick={() => setLight({ open: true, idx: i })}
            aria-label={it.title || `Foto ${i + 1}`}
          >
            <img src={it.image} alt={it.title ?? `Foto ${i + 1}`} loading="lazy" />
            <div className="gal-hover">
              <span className="gal-hover-title">{it.title}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="gal-actions">
        <a className="gal-btn" href="/galeriavermas">Ver más fotos →</a>
      </div>

      {/* Lightbox simple */}
      {light.open && (
        <div className="gal-lightbox" role="dialog" aria-modal="true" onClick={() => setLight({ open: false, idx: 0 })}>
          <div className="gal-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="gal-close" onClick={() => setLight({ open: false, idx: 0 })} aria-label="Cerrar">✕</button>
            <img src={visible[light.idx]?.image ?? items[light.idx]?.image} alt={visible[light.idx]?.title} />
            <div className="gal-caption">
              <h4>{visible[light.idx]?.title ?? items[light.idx]?.title}</h4>
              <p>{visible[light.idx]?.caption ?? items[light.idx]?.caption}</p>
            </div>
          </div>
        </div>
      )}
       
    </section>
  );
}

export default Galeria