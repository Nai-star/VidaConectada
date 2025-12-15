import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TIEMPO_MAX = 90 * 1000; // 1:30 minutos

export default function UsuarioInactividad() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const cerrarSesion = () => {
    localStorage.removeItem("usuarioLogueado");
    navigate("/login", { replace: true });
  };

  const reiniciarTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      cerrarSesion();
    }, TIEMPO_MAX);
  };

  useEffect(() => {
    const eventos = ["mousemove", "keydown", "click", "scroll"];

    eventos.forEach(evento =>
      window.addEventListener(evento, reiniciarTimer)
    );

    reiniciarTimer(); // inicia el contador al entrar

    return () => {
      eventos.forEach(evento =>
        window.removeEventListener(evento, reiniciarTimer)
      );
      clearTimeout(timerRef.current);
    };
  }, []);
}
