import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";
import GuiaDonante from "./GuiaDonante";
import "./modalGuiaDonante.css";

function ModalGuiaDonante({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>

        <GuiaDonante />
      </div>
    </div>
  );
}

export default ModalGuiaDonante;
