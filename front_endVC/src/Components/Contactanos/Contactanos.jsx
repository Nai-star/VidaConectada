import React, { useState } from "react";
import "./contactanos.css"
import { FiMapPin, FiClock, FiPhone, FiMail, FiInfo } from "react-icons/fi";



const hospitales = [
  { hospital: "Hospital San Rafael de Alajuela", dias: "L-V", hora: "6:00 a.m. - 11:00 a.m.", tel: "2436-1121", notas: "" },
  { hospital: "Hospital Max Peralta Cartago", dias: "L-V", hora: "6:00 a.m. - 9:00 a.m.", tel: "2550-1121", notas: "" },
  { hospital: "Hospital Max Peralta Cartago", dias: "V, S y feriados", hora: "6:00 a.m. - 8:30 a.m.", tel: "2550-1830", notas: "" },
  { hospital: "Hospital de Golfito", dias: "L-V", hora: "6:00 a.m. - 11:00 a.m.", tel: "2775-7871", notas: "Solo con cita previa" },
  { hospital: "Hospital de San Ramón", dias: "L-V", hora: "6:00 a.m. - 8:30 a.m.", tel: "2456-9693", notas: "Solo con cita previa" },
  { hospital: "Hospital Escalante Pradilla", dias: "L-V", hora: "7:00 a.m. - 11:00 a.m.", tel: "2785-0731", notas: "Solo con cita previa" },
  { hospital: "Hospital de San Carlos", dias: "L-J", hora: "7:00 a.m. - 12:00 m.d.", tel: "2401-1254", notas: "" },
  { hospital: "Hospital de San Carlos", dias: "V", hora: "7:00 a.m. - 10:00 a.m.", tel: "", notas: "" },
  { hospital: "Hospital de San Vito", dias: "L-V", hora: "7:00 a.m. - 9:30 a.m.", tel: "2773-1156", notas: "" },
  { hospital: "Hospital Calderón Guardia", dias: "L-V", hora: "6:30 a.m. - 5:30 p.m.", tel: "2212-1242", notas: "" },
  { hospital: "Hospital Calderón Guardia", dias: "L-J", hora: "6:30 a.m. - 4:30 p.m.", tel: "7126-6543", notas: "" },
  { hospital: "Hospital Calderón Guardia", dias: "V", hora: "7:00 a.m. - 3:30 p.m.", tel: "", notas: "" },
  { hospital: "Hospital Calderón Guardia", dias: "D y feriados", hora: "7:00 a.m. - 12:00 m.d.", tel: "", notas: "" },
  { hospital: "Hospital Monseñor Sanabria", dias: "L-D", hora: "7:00 a.m. - 11:30 a.m.", tel: "2630-8045", notas: "" },
  { hospital: "Hospital México", dias: "L-V", hora: "7:00 a.m. - 5:00 p.m.", tel: "", notas: "" },
  { hospital: "Hospital México", dias: "S, D, feriados", hora: "7:00 a.m. - 12:30 p.m.", tel: "", notas: "" },
  { hospital: "CAIS Cañas", dias: "L-V", hora: "7:00 a.m. - 11:00 a.m.", tel: "2668-4364", notas: "" },
  { hospital: "Hospital Ciudad Neilly", dias: "L-V", hora: "6:30 a.m. - 10:00 a.m.", tel: "2785-9649", notas: "" },
  { hospital: "Hospital San Francisco de Asís", dias: "L-V", hora: "7:00 a.m. - 10:00 a.m.", tel: "2437-9557", notas: "" },
  { hospital: "Hospital Nacional de Niños", dias: "L-V", hora: "6:30 a.m. - 11:00 a.m.", tel: "2523-3600 ext. 4451 o 4452", notas: "" },
  { hospital: "Hospital Nacional de Niños", dias: "V", hora: "6:30 a.m. - 10:30 a.m.", tel: "", notas: "" },
  { hospital: "Hospital Dr Tony Facio", dias: "L-S", hora: "7:00 a.m. - 11:00 a.m.", tel: "2793-6253 / 2793-6786", notas: "" },
  { hospital: "Hospital San Juan de Dios", dias: "L-S", hora: "7:00 a.m. - 4:00 p.m.", tel: "2547-8430 / 8803-4245", notas: "" },
  { hospital: "Hospital William Allen Taylor", dias: "L-V", hora: "7:30 a.m. - 11:30 a.m.", tel: "2586-8616", notas: "Donantes de reposición con cita" },
  { hospital: "Hospital de la Anexión", dias: "L-D y feriados", hora: "7:00 a.m. - 11:00 a.m.", tel: "2685-8451", notas: "" },
];

function Contactanos() {
    const [tablaAbierta, setTablaAbierta] = useState(false);



  return (
    <div className="contacto">

        <p>Contactenos</p>
        <h1>por nuestros diferentes medios</h1>
        <hr />

        <p>Sede</p>
        <h2>Banco de Sangre Daniel Fernández Keith</h2>
        <br />
       {/*  <h3>Hospital Monseñor Sanabria</h3> */}
        
        <section className="datos-contacto">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22332.54807239191!2d-84.74600362750287!3d9.980777798395795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0311b7e1e640f%3A0xbc07e55d09e7cbc!2sHospital%20Monse%C3%B1or%20Sanabria%20Mart%C3%ADnez%20-%20Puntarenas%2C%20CCSS!5e0!3m2!1ses-419!2scr!4v1763052454994!5m2!1ses-419!2scr"
            title="Mapa Banco de Sangre"
            allowFullScreen
            loading="lazy"
            width="350"
            height="200"
            style={{ borderRadius: 7 }}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        {/* 3 columnas como en la imagen */}
      <section className="info-grid">
        <div className="info-col">
          <h4>Ubicación</h4>
          <span className="subline" />
          <ul className="info-list">
            <li>
              <FiMapPin className="ic" />
              Hospital Monseñor Sanabria
              <br />
            </li>
          </ul>
        </div>

        <div className="info-col">
          <h4>Horarios</h4>
          <span className="subline" />
          <ul className="info-list">
            <li>
              <FiClock className="ic" />
              Lunes a Domingo
              <br />
              7:00 am. a  11:30 am.
              <br />
            </li>
          </ul>
        </div>

        <div className="info-col">
          <h4>Información de contacto</h4>
          <span className="subline" />
          <ul className="info-list">
            <li><FiPhone className="ic" />Teléfono Banco de sangre: 2630 8045</li>
            <li><FiPhone className="ic" />Teléfono Central: 2630 8000 ext. 1783 y 1784</li>
            <li><FiMail className="ic" />vidaconectadacr@gmail.com</li>
          </ul>
        </div>
      </section>

{/* ---------- Red de bancos y horarios (plegable) ---------- */}
      <div className="tabla-header">
        <h2 className="tabla-title">Red de bancos y horarios</h2>

        <button
          className="btn-toggle-tabla"
          onClick={() => setTablaAbierta((v) => !v)}
          aria-expanded={tablaAbierta}
          aria-controls="tabla-bancos"
        >
          {tablaAbierta ? "Ocultar" : "Ver"}
        </button>
      </div>
      <br />
      <br />

      <div
        id="tabla-bancos"
        className={`tabla-collapsible ${tablaAbierta ? "open" : ""}`}
      >
        <div className="tabla-wrap">
          <table className="hosp-table">
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Horario (Días)</th>
                <th>Horario (Hora)</th>
                <th>Contacto (Teléfono)</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {hospitales.map((h, i) => (
                <tr key={i}>
                  <td data-label="Hospital">
                    <FiMapPin className="ic-sm" /> {h.hospital}
                  </td>
                  <td data-label="Días">{h.dias}</td>
                  <td data-label="Hora">{h.hora}</td>
                  <td data-label="Teléfono">{h.tel || "-"}</td>
                  <td data-label="Notas">
                    {h.notas ? (
                      <>
                        <FiInfo className="ic-sm" /> {h.notas}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>     


    </div>
  )
}

export default Contactanos 