import React from "react";
import {
  FiHeart,
  FiCheckCircle,
  FiCoffee,
  FiClipboard,
  FiClock,
  FiAlertTriangle,
  FiDroplet,
} from "react-icons/fi";
import "./guiaDonante.css";

function GuiaDonante() {
  return (
    <section className="guia-ccss" id="guia-donante">
      <h1 className="titulo1">
        <FiDroplet className="icon-titulo" />
        Guía Oficial para la Donación de Sangre
      </h1>

      <p className="subtitulo1">
        (Basada en los lineamientos de la CCSS – Costa Rica)
      </p>

      <p className="intro">
        Donar sangre es un acto voluntario, responsable y solidario. La sangre es
        un recurso vital que no puede fabricarse artificialmente.
      </p>

      <p className="intro">
        La Caja Costarricense de Seguro Social (CCSS) establece criterios basados
        en evidencia científica para proteger a donantes y receptores.
      </p>

      
      <div className="contenedor-bloques">

      <div className="bloque">
        <h2>
          <FiCheckCircle /> Requisitos generales para donar
        </h2>
        <ul>
          <li>Edad entre <strong>18 y 65 años</strong>.</li>
          <li>Peso mayor a <strong>52 kg</strong> y estatura mínima <strong>150 cm</strong>.</li>
          <li>Documento de identificación vigente.</li>
          <li>Buen estado de salud física y mental.</li>
        </ul>
        <p className="nota">
          La selección se realiza sin discriminación, respetando la dignidad humana.
        </p>
      </div>


      <div className="bloque">
        <h2>
          <FiCoffee /> Preparación antes de donar
        </h2>
        <ul>
          <li>No acudir en ayuno.</li>
          <li>Hidratarse bien antes de la donación.</li>
          <li>Consumir alimentos livianos.</li>
          <li>Evitar comidas grasosas.</li>
        </ul>
      </div>

      <div className="bloque">
        <h2>
          <FiClipboard /> Proceso de selección y donación
        </h2>
        <ol>
          <li>Registro y entrevista confidencial.</li>
          <li>Valoración de signos vitales.</li>
          <li>Extracción segura de sangre.</li>
          <li>Refrigerio y observación.</li>
        </ol>
      </div>

      <div className="bloque">
        <h2>
          <FiClock /> Intervalos entre donaciones
        </h2>
        <ul>
          <li>Sangre total: cada 8 semanas.</li>
          <li>Máximo anual: 4 hombres / 3 mujeres.</li>
          <li>Plaquetas o plasma: según criterio médico.</li>
        </ul>
      </div>

      <div className="bloque">
        <h2>
          <FiAlertTriangle /> Recomendaciones después de donar
        </h2>
        <ul>
          <li>Descansar el resto del día.</li>
          <li>Mantener buena hidratación.</li>
          <li>Evitar ejercicio intenso por 24 horas.</li>
          <li>No consumir alcohol el mismo día.</li>
        </ul>
      </div>
      </div>

      <p className="cierre">
        <FiHeart className="icon-corazon" />
        Donar sangre es un acto de vida. Tu donación puede salvar hasta{" "}
        <strong>tres vidas</strong>.
      </p>
    </section>
  );
}

export default GuiaDonante;
