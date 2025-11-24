import React, { useState, useEffect } from "react";
// Importación de estilos requerida
import "./contactanos.css"; 
// Importaciones de íconos
import { FiMapPin, FiClock, FiPhone, FiMail, FiInfo } from "react-icons/fi";
// Importamos la función del servicio (Asegúrate de ajustar la ruta si es necesario)
import { obtenerRedDeBancos } from "../../services/ServiciosHospitales"; 


function Contactanos() {
    // Estados para la funcionalidad de la tabla colapsable
    const [tablaAbierta, setTablaAbierta] = useState(false);
    
    // Estados para cargar datos de la API de hospitales
    const [hospitales, setHospitales] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Efecto para cargar los datos de los hospitales
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // Llamada al servicio para obtener los datos de la red de bancos
                const datos = await obtenerRedDeBancos();
                setHospitales(datos);
            } catch (err) {
                console.error("Error al cargar la red de bancos:", err);
                setError("No se pudo cargar la red de bancos y horarios. Intente más tarde.");
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []); 

    return (
        <div className="contacto">
            {/* Títulos Principales */}
            <p>Contactenos</p>
            <h1>por nuestros diferentes medios</h1>
            <hr />

            <p>Sede</p>
            <h2>Banco de Sangre Daniel Fernández Keith</h2>
            <br />

            {/* Sección del Mapa (datos-contacto) */}
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

            {/* Información de Contacto (info-grid) */}
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
                            7:00 am. a  11:30 am.
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

            {/* ---------- Red de bancos y horarios (Sección Colapsable) ---------- */}
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
                    
                    {/* Renderizado de Carga y Error */}
                    {cargando && <p>Cargando información de la red de bancos...</p>}
                    
                    {error && <p style={{ color: 'red', padding: '10px' }}>🚨 {error}</p>}
                    
                    {!cargando && !error && hospitales.length === 0 && (
                        <p>No hay hospitales disponibles en este momento.</p>
                    )}

                    {/* Tabla de Hospitales */}
                    {!cargando && !error && hospitales.length > 0 && (
                        <table className="hosp-table">
                            <thead>
                                <tr>
                                    <th>Hospital</th>
                                    <th data-label="Horario (Días)">Horario (Días)</th>
                                    <th data-label="Horario (Hora)">Horario (Hora)</th>
                                    <th data-label="Contacto (Teléfono)">Contacto (Teléfono)</th>
                                    <th data-label="Notas">Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Mapeo sobre el estado 'hospitales' */}
                                {hospitales.map((h, i) => (
                                    <tr key={i}>
                                        <td data-label="Hospital">
                                            <FiMapPin className="ic-sm" /> {h.nombre_hospi}
                                        </td>
                                        <td data-label="Horario (Días)">{h.horarios}</td>
                                        <td data-label="Horario (Hora)">{h.hora}</td>
                                        <td data-label="Contacto (Teléfono)">{h.Contacto || "-"}</td>
                                        <td data-label="Notas">
                                            {h.Notas ? (
                                                <>
                                                    <FiInfo className="ic-sm" /> {h.Notas}
                                                </>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div> 
        </div>
    )
}

export default Contactanos; 