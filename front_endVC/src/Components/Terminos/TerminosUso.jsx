import React, { useEffect } from 'react';
import Navbar from '../../Components/NavBar/Navbar';
import Footer from '../../Components/Footer/Footer';
import './terminos.css';

function TerminosUso() {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = "/logo.png";
    document.title = "Términos de Uso | VidaConectada";
  }, []);

  return (
    <div className="legal-page">

      <br />
      <br />
      <div className="legal-container">
        <h1>Términos de Uso</h1>

        <p>
          Al acceder y utilizar VidaConectada, aceptas cumplir con los presentes
          Términos de Uso. Si no estás de acuerdo con ellos, debes abstenerte de
          utilizar la plataforma.
        </p>

        <h2>Acceso a la plataforma</h2>
        <p>
          El acceso a VidaConectada es gratuito, sin perjuicio de que algunas
          funcionalidades puedan requerir registro previo. El usuario se
          compromete a utilizar la plataforma de manera responsable.
        </p>

        <h2>Obligaciones del usuario</h2>
        <p>
          El usuario se compromete a no realizar acciones que puedan dañar,
          sobrecargar o afectar el correcto funcionamiento de la plataforma, ni a
          utilizarla para fines ilegales o no autorizados.
        </p>

        <h2>Contenido</h2>
        <p>
          El usuario es responsable de la información que proporcione dentro de
          la plataforma. VidaConectada no garantiza la exactitud o veracidad del
          contenido ingresado por los usuarios.
        </p>

        <h2>Suspensión del servicio</h2>
        <p>
          VidaConectada se reserva el derecho de suspender o restringir el acceso
          a la plataforma cuando detecte un uso indebido o contrario a estos
          Términos de Uso.
        </p>

        <h2>Limitación de responsabilidad</h2>
        <p>
          VidaConectada no será responsable por daños derivados del uso o
          imposibilidad de uso de la plataforma, ni por interrupciones del
          servicio.
        </p>

        <h2>Modificaciones</h2>
        <p>
          VidaConectada podrá modificar estos Términos de Uso en cualquier
          momento. Las modificaciones entrarán en vigor desde su publicación en
          la plataforma.
        </p>
      </div>

      <Footer />
    </div>
  );
}

export default TerminosUso;
