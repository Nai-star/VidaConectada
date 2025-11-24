import React from "react";
import "./beneficiosDonar.css";
import { FaRegHeart, FaUsers, FaAward } from "react-icons/fa";

const BENEFICIOS = [
  {
    id: 1,
    icon: <FaRegHeart />,
    titulo: "Salvas Vidas",
    texto:
      "Una sola donación puede ayudar hasta 3 personas diferentes en situación crítica",
  },
  {
    id: 2,
    icon: <FaUsers />,
    titulo: "Estimula tu Producción Sanguínea",
    texto:
      "Tu cuerpo regenera las células sanguíneas donadas, manteniéndote saludable",
  },
  {
    id: 3,
    icon: <FaAward />,
    titulo: "Contribución Comunitaria",
    texto:
      "Eres parte de una red solidaria que sostiene el sistema de salud de Costa Rica",
  },
];

function BeneficiosDonar() {
  return (
    <section className="ben-container">
      <h2 className="ben-title">Beneficios de Donar Sangre</h2>
      <p className="ben-subtitle">
        Donar sangre no solo ayuda a otros, también beneficia tu propia salud
      </p>

      <div className="ben-grid">
        {BENEFICIOS.map((b) => (
          <article className="ben-card" key={b.id}>
            <div className="ben-icon-wrap">{b.icon}</div>
            <h3 className="ben-card-title">{b.titulo}</h3>
            <p className="ben-card-text">{b.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BeneficiosDonar