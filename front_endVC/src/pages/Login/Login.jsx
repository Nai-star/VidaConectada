// LoginComponent.jsx
import React, { useState } from 'react';
import { AiOutlineMail, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCloseCircle } from 'react-icons/ai';
import { loginAdmin } from '../../services/ServicioLogin'; // Importa el servicio
import './Login.css'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Llama a la función de servicio, toda la lógica de la API está oculta aquí
            const userData = await loginAdmin(email, password);
            
            console.log('Login exitoso. Datos del usuario:', userData);
            
            // Lógica de redirección después del login
            // Ejemplo: history.push('/admin-dashboard');

        } catch (err) {
            // El servicio lanza un error con el mensaje de la API
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <a href="/" className="login-home-link">Home</a>
            
            {/* Contenido principal dividido en dos grandes secciones */}
            <div className="login-content">
                
                {/* 1. Panel Izquierdo: Solo Título */}
                <div className="login-left-panel-title">
                    <h1 className="login-title">
                        Inicia sesión<br />
                        en <span>VidaConectada</span>
                    </h1>
                </div>
                
                {/* 2. Panel Derecho: Imagen + Formulario + Descripción */}
                <div className="login-right-panel-content">

                    {/* Contenedor del Formulario y la Descripción */}
                    <div className="login-form-container">
                        <form className="login-form" onSubmit={handleLogin}>
                            {/* Input de Correo */}
                            <div className="login-input-group">
                                <input
                                    className="login-input"
                                    type="text"
                                    placeholder="Ingresa correo"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                {/* ¡IMPORTANTE! Usamos el checkmark/círculo que se ve en la imagen */}
                                <div className="login-input-icon-end">
                                    {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg> */}
                                </div>
                                <AiOutlineMail className="login-input-icon-start" /> {/* Solo si quieres un icono al inicio */}
                                </div>

                            {/* Input de Contraseña */}
                            <div className="login-input-group">
                                <input
                                    className="login-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {showPassword ? (
                                    <AiOutlineEyeInvisible 
                                        className="login-input-icon-end" 
                                        onClick={() => setShowPassword(false)}
                                    />
                                ) : (
                                    <AiOutlineEye 
                                        className="login-input-icon-end" 
                                        onClick={() => setShowPassword(true)}
                                    />
                                )}
                            </div>

                            {/* Botón de Iniciar Sesión */}
                            <button 
                                className="login-button" 
                                type="submit" 
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : 'Iniciar'}
                            </button>
                            
                            {/* Mensaje de Error */}
                            {error && (
                                <div className="error-message">
                                    <AiOutlineCloseCircle style={{ marginRight: '5px' }} />
                                    {error}
                                </div>
                            )}
                        </form>

                        {/* Descripción */}
                        <p className="login-description">
                            Accede al panel de administración de VidaConectada para gestionar usuarios, campañas y contenido de la plataforma de forma segura y eficiente.
                        </p>
                    </div>

                    {/* Imagen de Fondo (Se usa CSS para posicionarla) */}
                    <div className="login-image-background">
                        {/* Esta div estará detrás de todo el contenido del panel derecho */}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;