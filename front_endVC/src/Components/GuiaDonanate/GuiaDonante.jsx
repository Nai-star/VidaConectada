import React from 'react';
import './guiaDonante.css';

// rfce
function GuiaDonante() {
  return (
    <section className="guia-ccss"id="guia-donante">
        
      <h1>🩸 Guía Oficial para la Donación de Sangre</h1>
      <p className="subtitulo">(Basada en los lineamientos de la CCSS – Costa Rica)</p>

      <p className="intro">
        Donar sangre es un acto voluntario, responsable y solidario. La sangre es un recurso vital que
        no puede fabricarse artificialmente, por lo que la donación segura es esencial para salvar
        vidas y garantizar tratamientos médicos confiables.
      </p>

      <p className="intro">
        La Caja Costarricense de Seguro Social (CCSS) establece criterios basados en evidencia
        científica para proteger tanto a las personas donantes como a quienes reciben la sangre.
      </p>

      <div className="bloque">
        <h2>✅ Requisitos generales para donar</h2>
        <ul>
          <li>Tener entre <strong>18 y 65 años</strong> (hasta 70 si eres donante regular y estás en buen estado de salud).</li>
          <li>Pesar más de <strong>52 kg</strong> y medir al menos <strong>150 cm</strong>.</li>
          <li>Presentar un documento de identificación válido y vigente.</li>
          <li>Estar en buen estado de salud física y mental.</li>
          <li>No presentar enfermedades que pongan en riesgo tu salud o la del receptor.</li>
        </ul>
        <p className="nota">
          La selección se realiza sin ningún tipo de discriminación, respetando la dignidad humana y
          los derechos de todas las personas.
        </p>
      </div>

      <div className="bloque">
        <h2>🍎 Preparación antes de donar</h2>
        <ul>
          <li>No estar en ayuno.</li>
          <li>No dejar pasar más de 3 horas desde la última comida.</li>
          <li>Hidratarse bien (al menos 500 ml de líquidos).</li>
          <li>Consumir alimentos livianos como frutas, pan, galletas o jugos.</li>
          <li>Evitar comidas grasosas.</li>
          <li>Dormir bien y evitar llegar fatigado/a.</li>
        </ul>
      </div>

      <div className="bloque">
        <h2>🏥 Proceso de selección y donación</h2>
        <ol>
          <li><strong>Registro y entrevista confidencial:</strong> recopilación de información personal y antecedentes de salud.</li>
          <li><strong>Valoración de salud:</strong> medición de presión arterial, pulso, temperatura y hemoglobina.</li>
          <li><strong>Donación de sangre o hemocomponentes:</strong> procedimiento seguro realizado por personal capacitado.</li>
          <li><strong>Refrigerio y observación:</strong> verificación del estado de la persona donante antes de retirarse.</li>
        </ol>
      </div>

      <div className="bloque">
        <h2>⏳ Intervalos entre donaciones</h2>
        <ul>
          <li><strong>Sangre total:</strong> cada 8 semanas.</li>
          <li><strong>Máximo anual:</strong> 4 donaciones en hombres y 3 en mujeres.</li>
          <li><strong>Plaquetas o plasma por aféresis:</strong> intervalos mínimos de 48 horas, según el tipo de donación.</li>
        </ul>
        <p className="nota">
          Estos tiempos permiten que el cuerpo se recupere adecuadamente.
        </p>
      </div>

      <div className="bloque">
        <h2>⚠️ Recomendaciones después de donar</h2>
        <ul>
          <li>Descansar el resto del día.</li>
          <li>Mantener una buena hidratación.</li>
          <li>Evitar ejercicio intenso durante 24 horas.</li>
          <li>No cargar peso con el brazo de la punción.</li>
          <li>Evitar consumir alcohol el mismo día.</li>
        </ul>
      </div>

      <p className="cierre">
        ❤️ Donar sangre es un acto de vida. Tu donación puede salvar hasta <strong>tres vidas</strong>.
        <br />
        Gracias por donar de forma responsable y segura.
      </p>
    </section>
  );
}

export default GuiaDonante;
