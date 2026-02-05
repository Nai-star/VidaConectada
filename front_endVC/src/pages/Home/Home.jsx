import { useEffect } from "react";
import { useGlobalRefresh } from "../../context/GlobalRefreshContext";

import Navbar from '../../Components/Pagehome/NavBar/Navbar'
import Carrusel from '../../Components/Pagehome/Carrusel/Carrusel'
import TiposSangreEscasez from '../../Components/Pagehome/TiposSangreEscasez/TiposSangreEscasez'
import TarjetasTipoSangre from '../../Components/Pagehome/TarjetasTipoSangre/TarjetasTipoSangre'
import RequisitosDonacion from '../../Components/Pagehome/RequisitosDonacion/RequisitosDonacion'
import BeneficiosDonar from '../../Components/Pagehome/Beneficios/BeneficiosDonar'
import PreguntasFrecuentes from '../../Components/Pagehome/FAQ/PreguntasFrecuentes'
import Footer from "../../Components/Pagehome/Footer/Footer"
import Barrainfo from "../../Components/Pagehome/BarraInfo/Barrainfo"
import Contactanos from "../../Components/Pagehome/Contactanos/Contactanos"
import Campanas from "../../Components/Pagehome/Campanas/Campanas"
import Galeria from "../../Components/Pagehome/Galeria/Galeria"
import Testimonios from "../../Components/Pagehome/Testimonios/Testimonios"

import "./Home.css"

function Home() {

  // Escucha global de cambios
  const refreshKey = useGlobalRefresh();

  useEffect(() => {
    // No hace nada aquí.
    // Solo fuerza que los hijos se re-sincronicen
  }, [refreshKey]);

  // Favicon y título
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = "/logo_vidaconectada.png";
    document.title = "Vida Conectada";
  }, []);

  const stats = [
    { id: 1, value: "10 min", label: "Duración promedio" },
    { id: 2, value: "450 ml", label: "Cantidad donada" },
    { id: 3, value: "3 vidas", label: "Puedes salvar" },
  ];

  return (
    <div>
      <Barrainfo/>
      <Navbar />
      <Carrusel/>
      <TiposSangreEscasez/>

      <p className="alerta-sangre">
        <b className="alerta-roja">¡Tu ayuda es crucial!</b> Estos tipos de sangre tienen niveles críticos en los bancos de sangre de Costa Rica. Una donación puede salvar vidas hoy mismo.
      </p>

      <Testimonios/>
      <TarjetasTipoSangre/>

      <div className="info-box">
        <p>¿Sabías que?</p>
        <ul>
          <li>El tipo O- es donante universal</li>
          <li>El tipo AB+ es receptor universal</li>
          <li>Solo el 7% de la población tiene sangre O-</li>
        </ul>
      </div>

      <RequisitosDonacion />
      <BeneficiosDonar/>

      <hr className="hr-brillo" />
      <br /><br />
      <Campanas/>
      <hr className="hr-brillo" />

      <section className="cta-hero">
        <h3 className="cta-title">¿Listo para ser un héroe?</h3>
        <p className="cta-subtitle">
          Tu donación puede marcar la diferencia.
        </p>

        <div className="cta-stats">
          {stats.map((s) => (
            <div className="stat-card" key={s.id}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Galeria/>
      <PreguntasFrecuentes/>
      <Contactanos/>
      <Footer/>
    </div>
  );
}

export default Home;
