import { useState } from "react"
import Navbar from '../../Components/NavBar/Navbar'
import Carrusel from '../../Components/Carrusel/Carrusel'
import TiposSangreEscasez from '../../Components/TiposSangreEscasez/TiposSangreEscasez'
import TarjetasTipoSangre from '../../Components/TarjetasTipoSangre/TarjetasTipoSangre'
import RequisitosDonacion from '../../Components/RequisitosDonacion/RequisitosDonacion'
import BeneficiosDonar from '../../Components/Beneficios/BeneficiosDonar'
import PreguntasFrecuentes from '../../Components/FAQ/PreguntasFrecuentes'
import BuzonPreguntas from '../../Components/Buzon/BuzonPreguntas'
import Footer from "../../Components/Footer/Footer"
import Barrainfo from "../../Components/BarraInfo/Barrainfo"
import Contactanos from "../../Components/Contactanos/Contactanos"
import Campanas from "../../Components/Campanas/Campanas"
import Galeria from "../../Components/Galeria/Galeria"
import Testimonios from "../../Components/Testimonios/Testimonios"
import GuiaDonante from "../../Components/GuiaDonanate/GuiaDonante"



import "./Home.css"






function Home() {


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

        <p className="alerta-sangre"><b className="alerta-roja">¡Tu ayuda es crucial!</b> Estos tipos de sangre tienen niveles críticos en los bancos de sangre de Costa Rica. Una donación puede salvar vidas hoy mismo.</p>
        

        <Testimonios/>


        <TarjetasTipoSangre/>

        <div className="info-box">
        <p>¿Sabías que?</p>
        <ul>
          <li>El tipo O- es donante universal, puede donar a todos los tipos</li>
          <li>El tipo AB+ es receptor universal, puede recibir de todos los tipos</li>
          <li>Solo el 7% de la población tiene sangre tipo O-</li>
        </ul>
        </div>
   
        <RequisitosDonacion />

        <BeneficiosDonar/>
        
        <hr className="hr-brillo" />
        <Campanas/>
        <hr className="hr-brillo" />

                <section className="cta-hero">
          <h3 className="cta-title">¿Listo para ser un héroe?</h3>
          <p className="cta-subtitle">
            Miles de personas en Costa Rica necesitan transfusiones cada año. Tu donación puede
            marcar la diferencia entre la vida y la muerte.
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
  )
}

export default Home