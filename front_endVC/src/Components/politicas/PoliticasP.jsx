import React, { useEffect } from 'react';
import Navbar from '../../Components/NavBar/Navbar';
import Footer from '../../Components/Footer/Footer';
import './LegalPages.css';

function PoliticasP() {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = "/logo.png";
    document.title = "Política de Privacidad | VidaConectada";
  }, []);

  return (
    <div className="legal-page">
      <Navbar />
      <br />
      <br />
      <div className="legal-container">
        <h1>Política de Privacidad</h1>

        <p>
          En VidaConectada valoramos y respetamos la privacidad de nuestros
          usuarios. Esta Política de Privacidad describe cómo recopilamos,
          utilizamos y protegemos la información personal que se obtiene a través
          de nuestra plataforma.
        </p>

        <h2>Información que recopilamos</h2>
        <p>
          Podemos recopilar información personal como nombre, correo electrónico,
          datos de contacto y otra información necesaria para el correcto
          funcionamiento de la plataforma. Asimismo, se podrá recopilar
          información técnica relacionada con el uso del sitio.
        </p>

        <h2>Uso de la información</h2>
        <p>
          La información recopilada se utiliza exclusivamente para brindar y
          mejorar nuestros servicios, gestionar campañas, comunicarnos con los
          usuarios y garantizar el correcto funcionamiento de VidaConectada.
        </p>

        <h2>Protección de los datos</h2>
        <p>
          VidaConectada adopta medidas técnicas y organizativas razonables para
          proteger la información personal contra accesos no autorizados,
          pérdidas, alteraciones o divulgaciones indebidas.
        </p>

        <h2>Compartición de información</h2>
        <p>
          No compartimos información personal con terceros, salvo cuando sea
          estrictamente necesario para la prestación del servicio o cuando exista
          una obligación legal.
        </p>

        <h2>Derechos del usuario</h2>
        <p>
          Los usuarios tienen derecho a acceder, rectificar, actualizar o
          solicitar la eliminación de su información personal, conforme a la
          legislación aplicable.
        </p>

        <h2>Modificaciones</h2>
        <p>
          VidaConectada se reserva el derecho de modificar esta Política de
          Privacidad en cualquier momento. Los cambios serán publicados en esta
          página y entrarán en vigor desde su publicación.
        </p>
      </div>

      <Footer />
    </div>
  );
}

export default PoliticasP
