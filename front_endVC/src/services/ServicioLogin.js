
import axios from 'axios';

// URL de tu API de login de Django
const LOGIN_API_URL = 'http://localhost:8000/api/login/admin/'; 

/**
 * Función que maneja la lógica de inicio de sesión de un administrador.
 * @param {string} email - Correo electrónico o nombre de usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<object>} Objeto con los datos del usuario y tokens, o lanza un error.
 */
export const loginAdmin = async (email, password) => {
    try {
        const response = await axios.post(LOGIN_API_URL, {
            email,
            password,
        });

        // Si la llamada es exitosa (código 200)
        const { access, refresh, user_id, user_email } = response.data;
        
        // Almacena los tokens en el almacenamiento local
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        // Retorna los datos del usuario para el estado de la aplicación
        return {
            userId: user_id,
            email: user_email,
            accessToken: access
        };
        
    } catch (error) {
        // Manejo de errores 401 (Credenciales inválidas) o 403 (No es admin)
        const errorMessage = error.response?.data?.detail 
                           || 'Error de conexión. Verifica la API.';
                           
        // Lanza un error para que el componente lo capture
        throw new Error(errorMessage);
    }
};

/**
 * Función simple para cerrar sesión (opcional).
 */
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // En una aplicación real, podrías invalidar el token en el backend.
};