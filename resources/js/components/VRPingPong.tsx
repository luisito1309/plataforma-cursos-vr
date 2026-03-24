import React from "react";

/**
 * Componente que carga el mini juego VR de Ping Pong (A-Frame)
 * en un iframe. Se muestra en VerCurso cuando el curso tiene mini_juego === "pingpong".
 */
export default function VRPingPong() {
    return (
        <section style={{ marginTop: "24px", marginBottom: "24px" }}>
            <h2 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "18px",
                fontWeight: 600,
                color: "#e8e6ff",
                marginBottom: "12px",
            }}>
                Mini Juego VR del Curso
            </h2>
            <iframe
                src="/vrgames/pingpong/index.html"
                title="Ping Pong VR"
                width="100%"
                height="600"
                allow="xr-spatial-tracking; fullscreen"
                style={{ border: "none", borderRadius: "8px", background: "#0a0b12" }}
            />
        </section>
    );
}
