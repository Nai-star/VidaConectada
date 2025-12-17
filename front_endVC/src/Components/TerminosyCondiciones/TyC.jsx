import React, { useEffect } from 'react';
import Navbar from '../../Components/NavBar/Navbar';
import Footer from '../../Components/Footer/Footer';
import './tyC.css';

function TYC() {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = "/logo.png";
    document.title = "Términos y Condiciones | VidaConectada";
  }, []);

  return (
    <div className="legal-page">
      <Navbar />
      <br />
      <br />
      <div className="legal-container">
        <h1>Términos y Condiciones</h1>
        <p>
          Bienvenido/a a VidaConectada. Al acceder, navegar o utilizar esta
          plataforma, aceptas de manera expresa y sin reservas los presentes
          Términos y Condiciones. Si no estás de acuerdo con alguno de ellos,
          debes abstenerte de utilizar el sitio.
        </p>

        <h2>Objeto de la plataforma</h2>
        <p>
          VidaConectada es una plataforma digital destinada a la gestión,
          visualización y administración de campañas, requisitos e información
          relacionada con servicios sociales y comunitarios. El contenido tiene
          fines informativos y operativos.
        </p>

        <h2>Uso adecuado</h2>
        <p>
          El usuario se compromete a utilizar la plataforma de forma lícita,
          responsable y conforme a la legislación vigente. Queda prohibido el
          uso de VidaConectada para fines fraudulentos, ilegales o que puedan
          causar daño a la plataforma, a otros usuarios o a terceros.
        </p>

        <h2>Registro y cuentas de usuario</h2>
        <p>
          Para acceder a determinadas funcionalidades, el usuario podrá requerir
          un registro previo. El usuario garantiza que la información
          proporcionada es veraz, completa y actualizada, y es responsable de
          mantener la confidencialidad de sus credenciales de acceso.
        </p>

        <h2>Disponibilidad del servicio</h2>
        <p>
          VidaConectada no garantiza la disponibilidad continua e ininterrumpida
          del servicio. La plataforma podrá suspenderse temporalmente por motivos
          técnicos, de mantenimiento o de fuerza mayor, sin que ello genere
          responsabilidad alguna.
        </p>

        <h2>Protección de datos personales</h2>
        <p>
          El tratamiento de los datos personales se realiza conforme a la
          normativa aplicable y a nuestra Política de Privacidad. VidaConectada
          adopta las medidas necesarias para proteger la información personal de
          los usuarios.
        </p>

        <h2>Propiedad intelectual</h2>
        <p>
          Todos los contenidos de VidaConectada, incluyendo textos, bases de
          datos, imágenes, logotipos, diseños y software, son propiedad de la
          plataforma o de sus respectivos titulares y están protegidos por las
          leyes de propiedad intelectual.
        </p>

        <h2>Limitación de responsabilidad</h2>
        <p>
          VidaConectada no será responsable por daños directos o indirectos
          derivados del uso o la imposibilidad de uso de la plataforma, ni por
          errores, omisiones o desactualización de la información publicada.
        </p>

        <h2>Modificaciones</h2>
        <p>
          VidaConectada se reserva el derecho de modificar estos Términos y
          Condiciones en cualquier momento. Las modificaciones entrarán en vigor
          desde su publicación en la plataforma.
        </p>

        <h2>Legislación aplicable</h2>
        <p>
          Estos Términos y Condiciones se rigen por la legislación vigente, y
          cualquier controversia será sometida a las autoridades competentes.
        </p>
      </div>

      <Footer />
    </div>
  );
}

export default TyC;
