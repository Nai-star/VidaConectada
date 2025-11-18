import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Para crear el modal fuera del DOM principal
import './ParticiparModal.css'; // Estilos para el modal
import { FiX, FiBell } from 'react-icons/fi'; // Iconos de cierre y campana

// Asumiendo que tienes un servicio para interactuar con tu API
import { 
  checkSuscripcion,      // Verifica si el correo ya está suscrito
  registerParticipante   // Registra un nuevo participante
} from '../../services/ServicioParticipacion'; // Ajusta la ruta a tu archivo de servicios

function ParticiparModal({ isOpen, onClose, campaign, onParticipateSuccess }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [message, setMessage] = useState(null); // Para mensajes de éxito/error
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribedUser, setIsSubscribedUser] = useState(false); // Para mostrar "Lo esperamos..."

  // Limpiar el estado cada vez que el modal se abre para una nueva campaña o se cierra
  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setApellido('');
      setCorreo('');
      setTipoSangre('');
      setMessage(null);
      setIsLoading(false);
      setIsSubscribedUser(false);
    }
  }, [isOpen]);

  // Función para manejar la verificación y el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Si ya sabemos que es un usuario suscrito y solo está confirmando su participación
    if (isSubscribedUser) {
        try {
            // Aquí solo registramos la participación sin pedir los datos de nuevo
            await registerParticipante({
                nombre: nombre, // Usamos el nombre que ya sabemos del usuario suscrito
                apellido: apellido,
                correo: correo,
                tipoSangre: tipoSangre, // Si el servicio lo necesita, o se puede omitir
                campaignId: campaign.id,
            });
            setMessage({ type: 'success', text: `¡Gracias, ${nombre}! Tu participación en "${campaign.titulo}" ha sido registrada.` });
            onParticipateSuccess(campaign); // Llama al callback de éxito
            setTimeout(onClose, 3000); // Cierra el modal después de 3 segundos
        } catch (error) {
            console.error('Error al registrar participación:', error);
            setMessage({ type: 'error', text: 'Error al registrar tu participación. Intenta de nuevo.' });
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // --- Lógica cuando no es un usuario suscrito o es la primera vez que ingresa el correo ---

    // Primero, verificar si el correo ya está en la tabla de suscritos
    try {
        const suscrito = await checkSuscripcion(correo); // Esto debería devolver el usuario si existe
        if (suscrito && suscrito.nombre && suscrito.apellido) {
            // Si el usuario ya está suscrito, mostramos el mensaje de bienvenida
            setNombre(suscrito.nombre); // Precargamos el nombre
            setApellido(suscrito.apellido); // Precargamos el apellido
            setTipoSangre(suscrito.tipoSangre || ''); // Si lo tienes en la suscripción
            setIsSubscribedUser(true);
            setMessage({ type: 'info', text: `¡Bienvenido de nuevo, ${suscrito.nombre} ${suscrito.apellido}! ¿Deseas participar en "${campaign.titulo}"?` });
            // Aquí, el botón "Suscribirme" se convertirá en "Confirmar Participación"
        } else {
            // Si no está suscrito, procedemos con el registro completo
            if (!nombre || !apellido || !correo || !tipoSangre) {
              setMessage({ type: 'error', text: 'Por favor, completa todos los campos.' });
              setIsLoading(false);
              return;
            }

            await registerParticipante({
                nombre,
                apellido,
                correo,
                tipoSangre,
                campaignId: campaign.id,
            });
            setMessage({ type: 'success', text: `¡Gracias, ${nombre}! Tu participación en "${campaign.titulo}" ha sido registrada.` });
            onParticipateSuccess(campaign); // Llama al callback de éxito
            setTimeout(onClose, 3000); // Cierra el modal después de 3 segundos
        }
    } catch (error) {
        console.error('Error al verificar suscripción o registrar:', error);
        setMessage({ type: 'error', text: 'Ocurrió un error. Por favor, revisa tu conexión o intenta de nuevo.' });
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <FiX />
        </button>
        <div className="modal-header">
          <FiBell className="modal-icon" />
          <h3 className="modal-title">
            {isSubscribedUser ? `¡Hola de nuevo, ${nombre}!` : 'Suscríbete al Boletín'}
          </h3>
          <p className="modal-subtitle">
            {isSubscribedUser 
              ? `Ya te conocemos. Confirma tu participación en "${campaign.titulo}".`
              : 'Recibe noticias, estadísticas y actualizaciones sobre VidaConectada'}
          </p>
        </div>

        {message && (
          <div className={`modal-message modal-message--${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
            {/* Mostrar campos solo si no es un usuario suscrito confirmado O si es la primera vez que se busca su correo */}
            {!isSubscribedUser && (
                <>
                    <div className="form-group-inline">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre"
                                required={!isSubscribedUser}
                                disabled={isSubscribedUser} // Deshabilitar si ya se precargó el nombre
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                id="apellido"
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                placeholder="Tu apellido"
                                required={!isSubscribedUser}
                                disabled={isSubscribedUser}
                            />
                        </div>
                    </div>
                </>
            )}

            <div className="form-group">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value);
                      setIsSubscribedUser(false); // Resetear estado si el correo cambia
                    }}
                    placeholder="correo@ejemplo.com"
                    required
                    disabled={isSubscribedUser} // Deshabilitar si es un usuario suscrito
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="tipoSangre">Tipo de sangre</label>
                <select
                    id="tipoSangre"
                    value={tipoSangre}
                    onChange={(e) => setTipoSangre(e.target.value)}
                    required
                    disabled={isSubscribedUser && tipoSangre !== ''} // Deshabilitar si precargado
                >
                    <option value="">Selecciona tu tipo de sangre</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
            </div>

            <button type="submit" className="modal-submit-btn" disabled={isLoading}>
                {isLoading 
                  ? 'Procesando...' 
                  : isSubscribedUser 
                    ? 'Confirmar Participación' 
                    : 'Suscribirme'}
            </button>
        </form>

        <div className="modal-footer">
          <p>Enviaremos boletines mensuales con información relevante.</p>
          <p>Tu privacidad es importante. No compartiremos tu información con terceros.</p>
        </div>
      </div>
    </div>,
  document.getElementById('modal-root')
  );
}

export default ParticiparModal;