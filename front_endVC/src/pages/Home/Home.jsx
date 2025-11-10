import React from 'react'
import Navbar from '../../Components/NavBar/Navbar'
import Carrusel from '../../Components/Carrusel/Carrusel'
import TiposSangreEscasez from '../../Components/TiposSangreEscasez/TiposSangreEscasez'
import TarjetasTipoSangre from '../../Components/TarjetasTipoSangre/TarjetasTipoSangre'
import RequisitosDonacion from '../../Components/RequisitosDonacion/RequisitosDonacion'
import "./Home.css";


function Home() {


  return (
    <div>
        <Navbar/>
        <Carrusel/>
        <TiposSangreEscasez/>
        <p className="alerta-sangre"><b className="alerta-roja">¡Tu ayuda es crucial!</b> Estos tipos de sangre tienen niveles críticos en los bancos de sangre de Costa Rica. Una donación puede salvar vidas hoy mismo.</p>
        <TarjetasTipoSangre/>
        <div className="info-box">
        <p>¿Sabías que?</p>
        <ul>
          <li>El tipo O- es donante universal, puede donar a todos los tipos</li>
          <li>El tipo AB+ es receptor universal, puede recibir de todos los tipos</li>
          <li>Solo el 7% de la población tiene sangre tipo O-</li>
        </ul>
        </div>
        <RequisitosDonacion/>

    </div>
  )
}

export default Home