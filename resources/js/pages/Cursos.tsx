import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Cursos() {

    const [cursos, setCursos] = useState([]);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [imagen, setImagen] = useState(null);

    useEffect(() => {
        obtenerCursos();
    }, []);

    const obtenerCursos = () => {
        axios.get("/api/cursos")
            .then(response => {
                setCursos(response.data);
            })
            .catch(error => {
                console.error("Error cargando cursos:", error);
            });
    };

    const crearCurso = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("descripcion", descripcion);
        if (imagen) {
            formData.append("imagen", imagen);
        }

        axios.post("/api/cursos", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
            .then(() => {
                obtenerCursos();
                setTitulo("");
                setDescripcion("");
                setImagen(null);
                const fileInput = document.getElementById("imagenInput");
                if (fileInput) fileInput.value = "";
            })
            .catch(error => {
                console.error("Error creando curso:", error);
            });
    };

    const inscribirse = (curso_id) => {
        axios.post("/api/inscribirse", {
            curso_id: curso_id
        })
            .then(response => {
                alert("Te inscribiste al curso");
                console.log(response.data);
            })
            .catch(error => {
                console.error("Error al inscribirse:", error);
            });
    };

    const eliminarCurso = (id) => {
        if (!confirm("¿Eliminar curso?")) return;

        axios.delete(`/api/cursos/${id}`)
            .then(() => {
                obtenerCursos();
            })
            .catch(error => {
                console.error("Error eliminando curso:", error);
            });
    };

    const editarCurso = (curso) => {
        const nuevoTitulo = prompt("Nuevo título:", curso.titulo);
        const nuevaDescripcion = prompt("Nueva descripción:", curso.descripcion);

        if (!nuevoTitulo || !nuevaDescripcion) return;

        axios.put(`/api/cursos/${curso.id}`, {
            titulo: nuevoTitulo,
            descripcion: nuevaDescripcion
        })
            .then(() => {
                obtenerCursos();
            })
            .catch(error => {
                console.error("Error editando curso:", error);
            });
    };

    return (

        <div style={{ padding: "40px" }}>

            {/* HEADER */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <h1>Plataforma de Cursos VR</h1>

                <a href="/mis-cursos">
                    <button
                        style={{
                            background: "#ff9800",
                            color: "white",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "5px"
                        }}>
                        Mis Cursos
                    </button>
                </a>
            </div>

            <hr style={{ margin: "20px 0" }} />

            {/* FORMULARIO CREAR CURSO */}
            <form onSubmit={crearCurso} style={{ marginBottom: "40px" }}>
                <h2>Crear Curso</h2>

                <input
                    type="text"
                    placeholder="Título"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    style={{
                        padding: "10px",
                        width: "300px"
                    }}
                />

                <br /><br />

                <textarea
                    placeholder="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    style={{
                        padding: "10px",
                        width: "300px"
                    }}
                />

                <br /><br />

                <input
                    id="imagenInput"
                    type="file"
                    onChange={(e) => setImagen(e.target.files[0])}
                />

                <br /><br />

                <button
                    type="submit"
                    style={{
                        background: "#6c63ff",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "5px"
                    }}>
                    Crear Curso
                </button>
            </form>

            {/* LISTA DE CURSOS */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "20px"
            }}>

                {cursos.map((curso) => (

                    <div
                        key={`${curso.id}-${curso.titulo}`}
                        style={{
                            border: "1px solid #ddd",
                            padding: "20px",
                            borderRadius: "10px",
                            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
                        }}
                    >

                        {/* IMAGEN DEL CURSO */}
                        {curso.imagen && (
                            <img
                                src={`/storage/${curso.imagen}`}
                                style={{
                                    width: "100%",
                                    height: "150px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    marginBottom: "10px"
                                }}
                            />
                        )}

                        <h2>{curso.titulo}</h2>
                        <p>{curso.descripcion}</p>

                        <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "10px",
                            flexWrap: "wrap"
                        }}>

                            <a href={`/curso/${curso.id}`}>
                                <button
                                    style={{
                                        background: "#6c63ff",
                                        color: "white",
                                        border: "none",
                                        padding: "10px",
                                        borderRadius: "5px"
                                    }}>
                                    Ver Curso
                                </button>
                            </a>

                            <button
                                onClick={() => inscribirse(curso.id)}
                                style={{
                                    background: "#28a745",
                                    color: "white",
                                    border: "none",
                                    padding: "10px",
                                    borderRadius: "5px"
                                }}>
                                Inscribirse
                            </button>

                            <button
                                onClick={() => editarCurso(curso)}
                                style={{
                                    background: "#ffc107",
                                    color: "black",
                                    border: "none",
                                    padding: "10px",
                                    borderRadius: "5px"
                                }}>
                                Editar
                            </button>

                            <button
                                onClick={() => eliminarCurso(curso.id)}
                                style={{
                                    background: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    padding: "10px",
                                    borderRadius: "5px"
                                }}>
                                Eliminar
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );
}