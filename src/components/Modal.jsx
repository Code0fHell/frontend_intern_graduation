import React from "react";

function Modal({ open, onClose, children, width = 400 }) {
    if (!open) return null;
    return (
        <div
            className="modal-portal"
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 1000,
            }}
        >
            {/* Backdrop */}
            <div
                className="modal-backdrop"
                style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.25)",
                    zIndex: 1001,
                }}
                onClick={onClose}
            />
            {/* Modal content */}
            <div
                className="modal-content"
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 24,
                    width,
                    maxWidth: "95vw",
                    position: "fixed",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1002,
                    boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "none",
                        border: "none",
                        fontSize: 20,
                        cursor: "pointer"
                    }}
                    aria-label="Đóng"
                >×</button>
                {children}
            </div>
        </div>
    );
}

export default Modal;