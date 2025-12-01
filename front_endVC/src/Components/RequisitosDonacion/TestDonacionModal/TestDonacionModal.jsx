import React, { useEffect, useRef, useState } from "react";
import "./TestDonacionModal.css";

const initialAnswers = {
  edad: "",
  peso: "",
  embarazada: "",
  salud: "",
  cirugiaMenor: "",
  cirugiaMayor: "",
  tratamiento: "",
  hepatitis: "",
  vih: "",
  parejasRecientes: "",
};

function TestDonacionModal({ isOpen, onClose }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [ineligibleReason, setIneligibleReason] = useState("");
  const [completed, setCompleted] = useState(false);
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement;
      setTimeout(() => firstFieldRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
      resetAll();
    }
    return () => { document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const resetAll = () => {
    setAnswers(initialAnswers);
    setIneligibleReason("");
    setCompleted(false);
  };

  const update = (field, value) => {
    setAnswers((s) => ({ ...s, [field]: value }));
    setIneligibleReason("");
    setCompleted(false);
  };

  // Lógica que determina si procede o no según respuestas actuales.
  // Se evalúa cada vez que se selecciona una opción relevante.
  useEffect(() => {
    // Si edad no es 18-64 => ineligible
    if (!answers.edad) return;
    if (answers.edad === "menor18") {
      setIneligibleReason("No puedes donar: debes tener al menos 18 años.");
      return;
    }
    if (answers.edad === "mayor70" || answers.edad === "65a70") {
      setIneligibleReason("Según el rango de edad seleccionado, no puedes donar.");
      return;
    }

    // Si peso seleccionado y <50 => ineligible
    if (answers.peso === "menos50") {
      setIneligibleReason("No puedes donar: peso menor a 50 kg.");
      return;
    }

    // Embarazo => ineligible
    if (answers.embarazada === "si") {
      setIneligibleReason("No puedes donar si estás embarazada o sospechas que podrías estarlo.");
      return;
    }

    // Salud
    if (answers.salud === "no") {
      setIneligibleReason("No puedes donar si no gozas de buen estado de salud.");
      return;
    }

    // Cirugía menor en última semana
    if (answers.cirugiaMenor === "si") {
      setIneligibleReason("No puedes donar si te sometiste a una cirugía menor en la última semana.");
      return;
    }

    // Cirugía mayor / tatuaje / piercing en últimos 3 meses
    if (answers.cirugiaMayor === "si") {
      setIneligibleReason("No puedes donar si te sometiste a cirugía mayor o te realizaste tatuaje/piercing/microblading en los últimos 3 meses.");
      return;
    }

    // Tratamiento/medicación
    if (answers.tratamiento === "si") {
      setIneligibleReason("Es posible que no puedas donar si estás en tratamiento médico o tomas medicación. Consulta al personal.");
      return;
    }

    // Hepatitis
    if (answers.hepatitis === "si") {
      setIneligibleReason("No puedes donar si has tenido hepatitis alguna vez.");
      return;
    }

    // VIH
    if (answers.vih === "si") {
      setIneligibleReason("No puedes donar si has sido diagnosticado con VIH.");
      return;
    }

    // Parejas recientes
    if (answers.parejasRecientes === "si") {
      setIneligibleReason("No puedes donar si en los últimos 3 meses tuviste más de una pareja sexual o una pareja nueva.");
      return;
    }

    // Si llegamos hasta aquí y todas las preguntas requeridas tienen respuesta => candidato
    // comprobamos que la secuencia necesaria esté respondida:
    const required = [
      "edad",
      "peso",
      "embarazada",
      "salud",
      "cirugiaMenor",
      "cirugiaMayor",
      "tratamiento",
      "hepatitis",
      "vih",
      "parejasRecientes",
    ];
    const allAnswered = required.every((k) => answers[k] !== "");
    if (allAnswered) {
      setCompleted(true);
      setIneligibleReason("");
    }
  }, [answers]);

  if (!isOpen) return null;

  // Helpers para mostrar paso actual según respuestas
  const showPeso = answers.edad === "entre18y64";
  const showEmbarazo = showPeso && answers.peso === "50omas";
  const showSalud = showEmbarazo && (answers.embarazada === "no" || answers.embarazada === "noaplica");
  const showCirugiaMenor = showSalud && answers.salud === "si";
  const showCirugiaMayor = showCirugiaMenor && answers.cirugiaMenor === "no";
  const showTratamiento = showCirugiaMayor && answers.cirugiaMayor === "no";
  const showHepatitis = showTratamiento && answers.tratamiento === "no";
  const showVih = showHepatitis && answers.hepatitis === "no";
  const showParejas = showVih && answers.vih === "no";

  return (
    <div
      className="tdm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tdm-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="tdm-modal" ref={dialogRef} onMouseDown={(e)=> e.stopPropagation()}>
        <header className="tdm-header">
          <h3 id="tdm-title" className="tdm-title">Test de donación</h3>
          <button aria-label="Cerrar" className="tdm-close" onClick={onClose}>✕</button>
        </header>

        <div className="tdm-body">
          <p className="tdm-intro">Responde brevemente las siguientes preguntas. Este cuestionario es orientativo.</p>

          {/* Edad */}
          <div className="tdm-field">
            <label htmlFor="edad">¿Qué edad tenés?</label>
            <select
              id="edad"
              ref={firstFieldRef}
              value={answers.edad}
              onChange={(e) => update("edad", e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="menor18">Menos de 18 años</option>
              <option value="entre18y64">Entre 18 y 64 años</option>
              <option value="65a70">Entre 65 y 70 años</option>
              <option value="mayor70">Más de 70 años</option>
            </select>
          </div>

          {answers.edad === "menor18" && <div className="tdm-alert error">No puedes donar: debes tener al menos 18 años.</div>}
          {(answers.edad === "65a70" || answers.edad === "mayor70") && <div className="tdm-alert error">Según el rango de edad seleccionado, no puedes donar.</div>}

          {/* Peso */}
          {showPeso && (
            <div className="tdm-field">
              <label htmlFor="peso">¿Cuánto pesas?</label>
              <select
                id="peso"
                value={answers.peso}
                onChange={(e) => update("peso", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="menos50">Menos de 50 kg</option>
                <option value="50omas">50 kg o más</option>
              </select>
            </div>
          )}

          {answers.peso === "menos50" && <div className="tdm-alert error">No puedes donar: peso menor a 50 kg.</div>}

          {/* Embarazo */}
          {showEmbarazo && (
            <div className="tdm-field">
              <label htmlFor="embarazada">¿Estás embarazada o piensas que podrías estarlo?</label>
              <select
                id="embarazada"
                value={answers.embarazada}
                onChange={(e) => update("embarazada", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
                <option value="noaplica">No aplica</option>
              </select>
            </div>
          )}

          {answers.embarazada === "si" && <div className="tdm-alert error">No puedes donar si estás embarazada o sospechas que podrías estarlo.</div>}

          {/* Salud */}
          {showSalud && (
            <div className="tdm-field">
              <label htmlFor="salud">¿Gozas de buen estado de salud?</label>
              <select
                id="salud"
                value={answers.salud}
                onChange={(e) => update("salud", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          )}

          {answers.salud === "no" && <div className="tdm-alert error">No puedes donar si no gozas de buen estado de salud.</div>}

          {/* Cirugía menor */}
          {showCirugiaMenor && (
            <div className="tdm-field">
              <label htmlFor="cirugiaMenor">¿Te has sometido a alguna intervención de cirugía menor en la última semana?</label>
              <select
                id="cirugiaMenor"
                value={answers.cirugiaMenor}
                onChange={(e) => update("cirugiaMenor", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          )}

          {answers.cirugiaMenor === "si" && <div className="tdm-alert error">No puedes donar si tuviste cirugía menor en la última semana.</div>}

          {/* Cirugía mayor / tattoo */}
          {showCirugiaMayor && (
            <div className="tdm-field">
              <label htmlFor="cirugiaMayor">¿Te has sometido a cirugía mayor, tatuaje, piercing o microblading en los últimos 3 meses?</label>
              <select
                id="cirugiaMayor"
                value={answers.cirugiaMayor}
                onChange={(e) => update("cirugiaMayor", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          )}

          {answers.cirugiaMayor === "si" && <div className="tdm-alert error">No puedes donar si tuviste cirugía mayor o te realizaste tatuaje/piercing/microblading en los últimos 3 meses.</div>}

          {/* Tratamiento / medicación */}
          {showTratamiento && (
            <div className="tdm-field">
              <label htmlFor="tratamiento">¿Estás en tratamiento médico o tomas alguna medicación actualmente?</label>
              <select
                id="tratamiento"
                value={answers.tratamiento}
                onChange={(e) => update("tratamiento", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          )}

          {answers.tratamiento === "si" && <div className="tdm-alert error">Es posible que no puedas donar si estás en tratamiento o tomas medicación. Consulta al personal.</div>}

          {/* Hepatitis */}
          {showHepatitis && (
            <div className="tdm-field">
              <label htmlFor="hepatitis">¿Has tenido hepatitis alguna vez?</label>
              <select
                id="hepatitis"
                value={answers.hepatitis}
                onChange={(e) => update("hepatitis", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          )}

          {answers.hepatitis === "si" && <div className="tdm-alert error">No puedes donar si has tenido hepatitis.</div>}

          {/* VIH */}
          {showVih && (
            <div className="tdm-field">
              <label htmlFor="vih">¿Has sido diagnosticado con VIH?</label>
              <select
                id="vih"
                value={answers.vih}
                onChange={(e) => update("vih", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          )}

          {answers.vih === "si" && <div className="tdm-alert error">No puedes donar si has sido diagnosticado con VIH.</div>}

          {/* Parejas recientes */}
          {showParejas && (
            <div className="tdm-field">
              <label htmlFor="parejasRecientes">En los últimos 3 meses ¿tuviste más de una pareja sexual o una pareja nueva?</label>
              <select
                id="parejasRecientes"
                value={answers.parejasRecientes}
                onChange={(e) => update("parejasRecientes", e.target.value)}
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          )}

          {/* Resultado final */}
          {ineligibleReason && (
            <div className="tdm-result tdm-result-error">
              <strong>No elegible:</strong> {ineligibleReason}
            </div>
          )}

          {completed && !ineligibleReason && (
            <div className="tdm-result tdm-result-ok">
              <strong>¡Excelente!</strong> Hasta el momento cumples los requisitos básicos para ser donante de sangre.
              <div className="tdm-note">
                Ten en cuenta que este cuestionario es meramente orientativo y que el día que te presentes a donar sangre se van a realizar más preguntas que serán valoradas por los profesionales del banco de sangre para determinar si puedes donar sangre. También se tomarán los signos vitales para asegurarnos de tu estado de salud.
              </div>
            </div>
          )}
        </div>

        <footer className="tdm-footer">
          <button className="tdm-btn outline" onClick={() => { resetAll(); firstFieldRef.current?.focus(); }}>
            Reiniciar
          </button>
          <button className="tdm-btn" onClick={() => { onClose(); }}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
export default TestDonacionModal;