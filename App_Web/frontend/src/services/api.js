const API_URL = "https://subdominio.springyblock6devdanl.dpdns.org";

// crear job
export async function crearRuta(payload) {
    const res = await fetch(`${API_URL}/ruta`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error creando ruta");

    return data; // { job_id }
}

// consultar estado
export async function obtenerEstado(jobId) {
    const res = await fetch(`${API_URL}/ruta/status/${jobId}`);

    const data = await res.json();

    if (!res.ok) throw new Error("Error status");

    return data;
}
