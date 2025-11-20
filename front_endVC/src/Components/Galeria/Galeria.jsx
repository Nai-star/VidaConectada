import React, { useEffect, useState } from "react";
import "./Galeria.css";
import { obtenerGaleriaActiva } from "../../services/ServicioGaleria";

function Galeria({ limit = 8 }) {
const [items, setItems] = useState([]);
const [err, setErr] = useState("");
const [loading, setLoading] = useState(true);

useEffect(() => {
let alive = true;
(async () => {
try {
const data = await obtenerGaleriaActiva();
if (!alive) return;
// Asegurarse de mapear para que existan los campos correctos
const mapped = data.map(it => ({
id: it.id,
title: it.title ?? "",
caption: it.caption ?? "",
image_url: it.image_url ?? "",
video_url: it.video_url ?? ""
}));
setItems(mapped);
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

return ( <section className="gal-wrap"> <p className="gal-note">Agradecemos a nuestros donantes de sangre</p> <h2 className="gal-title">Cada donación nos permite salvar vidas</h2> <div className="gal-underline" />

  {loading && <div className="gal-loading">Cargando fotos…</div>}
  {err && <div className="gal-error">{err}</div>}

  <div className="gal-grid">
    {visible.map((it, i) => (
      <div key={it.id || i} className="gal-item">
        <img
          src={it.image_url || ""}
          alt={it.title ?? `Foto ${i + 1}`}
          loading="lazy"
        />
        <div className="gal-hover">
          <span className="gal-hover-title">{it.title}</span>
        </div>
      </div>
    ))}
  </div>

  <div className="gal-actions">
    <a className="gal-btn" href="/galeriavermas">Ver más fotos →</a>
  </div>
</section>


);
}

export default Galeria;
