import React, { useEffect, useState } from "react";
import { obtenerGaleriaPaginada } from "../../services/ServicioGaleria";
import Navbar from "../NavBar/Navbar";
import Footer from "../Footer/Footer";
import Barrainfo from "../../Components/BarraInfo/Barrainfo";
import "./GaleriaVermas.css";

function GaleriaVermas() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { items: fetched, next: nxt } = await obtenerGaleriaPaginada(1, 24);
        if (!alive) return;
        // filtrar nulos y asegurarse de que image_url or video_url exista
        const clean = fetched.filter(Boolean).map(it => ({
          id: it.id,
          title: it.title ?? "",
          caption: it.caption ?? "",
          image_url: it.image_url ?? "",
          video_url: it.video_url ?? ""
        }));
        setItems(clean);
        setNext(nxt);
        setPage(1);
        // DEBUG: ver primeros registros en consola
        console.log("Galeria items loaded:", clean.slice(0, 6));
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError(e.message || "Error al cargar la galería");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  async function cargarMas() {
    if (!next) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { items: fetched, next: nxt } = await obtenerGaleriaPaginada(nextPage, 24);
      const clean = fetched.filter(Boolean).map(it => ({
        id: it.id,
        title: it.title ?? "",
        caption: it.caption ?? "",
        image_url: it.image_url ?? "",
        video_url: it.video_url ?? ""
      }));
      setItems(prev => [...prev, ...clean]);
      setNext(nxt);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error cargando más");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div>
      <Barrainfo />
      <Navbar />
      <main className="gp-wrap">
        <div className="gp-header">
          <h1>Galería</h1>
          <p className="gp-sub">
            Hemos recopilado fotografías y videos de nuestras campañas de donación.
          </p>
        </div>

        {loading && <div className="gp-loading">Cargando galería…</div>}
        {error && <div className="gp-error">{error}</div>}

        <div className="gp-masonry">
          {items.map((it, idx) => (
            <figure
              className="gp-item"
              key={it.id ?? idx}
              tabIndex={0}
              aria-label={it.title || `Foto ${idx + 1}`}
              data-caption={it.caption || ""}
            >
              {it.video_url ? (
                <video
                  className="gp-media"
                  src={it.video_url}
                  controls
                  preload="metadata"
                />
              ) : it.image_url ? (
                <img
                  className="gp-media"
                  src={it.image_url}
                  alt={it.title || `Foto ${idx + 1}`}
                  loading="lazy"
                />
              ) : (
                <div className="gp-media-placeholder">Sin contenido</div>
              )}

              <figcaption className="gp-caption" role="group" aria-hidden="false">
                <div className="gp-caption-inner">
                  <h3>{it.title}</h3>
                  {it.caption ? <p>{it.caption}</p> : <p className="gp-caption-empty">No hay descripción</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="gp-actions">
          {next ? (
            <button className="gp-btn" onClick={cargarMas} disabled={loadingMore}>
              {loadingMore ? "Cargando..." : "Cargar más"}
            </button>
          ) : (
            <p className="gp-end">Has llegado al final de la galería.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default GaleriaVermas;
