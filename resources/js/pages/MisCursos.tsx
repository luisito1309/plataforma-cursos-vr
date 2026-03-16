import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MisCursos() {

    const [cursos, setCursos] = useState([]);

    useEffect(() => {
        obtenerCursos();
    }, []);

    const obtenerCursos = () => {

        axios.get("/api/mis-cursos")
            .then(response => {

                setCursos(response.data);

            });

    };

    return (

        <div style={{ padding: "40px" }}>

            <h1>Mis Cursos</h1>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "20px"
            }}>

                {cursos.map((curso) => (

                    <div key={curso.id} style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px"
                    }}>

                        <h2>{curso.titulo}</h2>

                        <p>{curso.descripcion}</p>

                    </div>

                ))}

            </div>

        </div>

    );
}