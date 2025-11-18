// src/Components/Galeria/GaleriaPage.jsx
import React, { useEffect, useState } from "react";
import { obtenerGaleriaPaginada } from "../../services/ServicioGaleria";
import Navbar from "../NavBar/Navbar";
import Footer from "../Footer/Footer";
import Barrainfo from "../../Components/BarraInfo/Barrainfo"
import "./GaleriaVermas.css";

/**
 * GaleriaPage
 * - Muestra grid masonry
 * - Hover muestra caption breve (admin)
 * - Soporta paginación "Cargar más"
 */
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
        setItems(fetched);
        setNext(nxt);
        setPage(1);
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
      setItems(prev => [...prev, ...fetched]);
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
        <Barrainfo/>
        <Navbar/>
    <main className="gp-wrap">
        <br /><br /><br />
        
      <div className="gp-header">
        <h1>Galería</h1>
        <p className="gp-sub">Hemos recopilado fotografías y videos de nuestras campañas de donación.</p>
      </div>

      {loading && <div className="gp-loading">Cargando galería…</div>}
      {error && <div className="gp-error">{error}</div>}

      <div className="gp-masonry">
        {items.map((it, idx) => (
          <figure className="gp-item" key={it.id ?? idx}>
            {/* Soporta video y imagen */}
            {it.type && it.type.startsWith("video") ? (
              <video className="gp-media" src={it.mediaUrl} controls preload="metadata" />
            ) : (
              <img className="gp-media" src={it.mediaUrl} alt={it.title || `Foto ${idx + 1}`} loading="lazy" />
            )}

            <figcaption className="gp-caption">
              <div className="gp-caption-inner">
                <h3>{it.title}</h3>
                {it.caption && <p>{it.caption}</p>}
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
    <Footer/> 
    </div>
  );
}
export default GaleriaVermas 