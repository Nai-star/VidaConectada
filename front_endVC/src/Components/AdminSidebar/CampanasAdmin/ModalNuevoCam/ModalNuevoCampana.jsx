import React, { useEffect, useState } from "react";
import "./ModalNuevoCampana.css";
import { obtenerProvincias, obtenerCantones } from "../../../../services/ServicioProvincias";

export default function ModalCampana({ visible, onClose, onGuardar }) {
    const [provincias, setProvincias] = useState([]);
    const [cantones, setCantones] = useState([]);

    const [idProvincia, setIdProvincia] = useState("");
    const [idCanton, setIdCanton] = useState("");

    useEffect(() => {
        if (!visible) return;
        cargarDatos();
    }, [visible]);

    const cargarDatos = async () => {
        try {
            const prov = await obtenerProvincias();
            setProvincias(prov);

            const cant = await obtenerCantones();
            setCantones(cant);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    const guardar = () => {
        if (!idProvincia || !idCanton) {
            alert("Debe seleccionar provincia y cantón");
            return;
        }

        onGuardar({
            provincia: idProvincia,
            canton: idCanton
        });

        onClose();
    };

    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2 className="modal-title">Crear Campaña</h2>

                {/* PROVINCIA */}
                <label>Provincia</label>
                <select
                    value={idProvincia}
                    onChange={(e) => {
                        setIdProvincia(e.target.value);
                        setIdCanton(""); // limpio cantón al cambiar provincia
                    }}
                    className="modal-select"
                >
                    <option value="">Seleccione una provincia</option>
                    {provincias.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                            {prov.nombre}
                        </option>
                    ))}
                </select>

                {/* CANTONES FILTRADOS */}
                <label>Cantón</label>
                <select
                    value={idCanton}
                    onChange={(e) => setIdCanton(e.target.value)}
                    className="modal-select"
                    disabled={!idProvincia}
                >
                    <option value="">Seleccione un cantón</option>

                    {cantones
                        .filter((c) => String(c.provincia) === String(idProvincia))
                        .map((canton) => (
                            <option key={canton.id} value={canton.id}>
                                {canton.nombre}
                            </option>
                        ))}
                </select>

                <div className="modal-buttons">
                    <button className="btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn-guardar" onClick={guardar}>
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
