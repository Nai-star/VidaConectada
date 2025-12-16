import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { logout } from "../services/ServicioLogin";

const INACTIVITY_LIMIT = 60 * 1000; // 60 segundos

const PrivateRouting = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // ❌ Si no está autenticado o no es admin
  if (!token || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // 🔁 Reinicia el temporizador
  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      logout();
      navigate("/login", { replace: true });
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    // Eventos que cuentan como actividad
    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer(); // iniciar temporizador

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return <Outlet />;
};

export default PrivateRouting;
