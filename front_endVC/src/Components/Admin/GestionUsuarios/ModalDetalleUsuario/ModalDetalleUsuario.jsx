// ModalDetalleUsuario.jsx
import React from "react";
/* import "./ModalDetalleUsuario.css"; */

export default function ModalDetalleUsuario({
  usuario,
  bloodMap,
  onClose,
  getBloodTypeBadgeClass,
  getDonorTypeBadgeClass,
  formatDateDisplay,
  calcularUltimaFechaDeParticipaciones,
  getCampaignKey,
}) {
  if (!usuario) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-detalle-usuario"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Detalles del Usuario</h3>
          <p>Información completa del registro</p>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="user-overview">
          <div className="user-icon-large">
            {(usuario.nombre || "U")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>

          <div className="user-name-type">
            <strong>{usuario.nombre}</strong>
            <span
              className={`badge donor-type-badge ${getDonorTypeBadgeClass(
                usuario.donor_type
              )}`}
            >
              {usuario.donor_type}
            </span>
          </div>
        </div>

        <div className="detail-grid">
          <Detail label="EMAIL" value={usuario.correo} />
          <Detail
            label="TELÉFONO"
            value={usuario.telefono || "Sin teléfono"}
          />

          <Detail
            label="TIPO DE SANGRE"
            value={
              <span
                className={`badge blood-type-badge ${getBloodTypeBadgeClass(
                  usuario.sangre_label
                )}`}
              >
                {usuario.sangre_label ??
                  (usuario.sangre_id
                    ? bloodMap[usuario.sangre_id] ??
                      `ID ${usuario.sangre_id}`
                    : "-")}
              </span>
            }
          />

          <Detail
            label="FECHA DE REGISTRO"
            value={usuario.fecha?.split?.("T")[0] ?? usuario.fecha ?? "-"}
          />

          <Detail
            label="CAMPAÑAS ASISTIDAS"
            value={usuario.num_campanas}
          />

          <Detail
            label="ÚLTIMA DONACIÓN"
            value={
              formatDateDisplay(usuario.last_donation_date) ??
              "Sin registro"
            }
          />
        </div>

        {Array.isArray(usuario.participaciones) &&
          usuario.participaciones.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <strong>Participaciones</strong>
              <ul style={{ marginTop: 8 }}>
                {usuario.participaciones.map((p, i) => (
                  <li key={i}>
                    {formatDateDisplay(
                      calcularUltimaFechaDeParticipaciones([p])
                    ) ?? "Sin fecha"}{" "}
                    — Campaña:{" "}
                    {getCampaignKey(p) ??
                      (p.campana_id ?? p.campana ?? "N/A")}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
