import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Circle,
    CircleMarker,
    Popup,
    useMap,
    useMapEvents
} from "react-leaflet";
import { useEffect } from "react";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";

const origenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const destinoIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const casetaIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

function ClickHandler({
    origen,
    destino,
    modoRiesgo,
    setModoRiesgo,
    setOrigen,
    setDestino,
    setZonasRiesgo
}) {
    useMapEvents({
        click(e) {
            const punto = [e.latlng.lat, e.latlng.lng];

            if (modoRiesgo) {
                const nombre = prompt("Nombre de la zona:");
                if (!nombre || !nombre.trim()) return;

                const radioInput = prompt("Radio en kilómetros (número entero):", "5");
                if (radioInput === null) return;
                
                const radio = Number(radioInput);
                if (!Number.isInteger(radio) || radio < 1) {
                    toast.error("El radio debe ser un número entero mayor a 0");
                    return;
                }

                const nivelInput = prompt("Nivel de riesgo (1-5, número entero):", "3");
                if (nivelInput === null) return;
                
                const nivel = Number(nivelInput);
                if (!Number.isInteger(nivel) || nivel < 1 || nivel > 5) {
                    toast.error("El nivel debe ser un entero entre 1 y 5");
                    return;
                }

                setZonasRiesgo((prev) => [
                    ...prev,
                    {
                        nombre: nombre.trim(),
                        lat: punto[0],
                        lon: punto[1],
                        radio_km: radio,
                        nivel
                    }
                ]);

                toast.success(`Zona "${nombre}" agregada`);
                setModoRiesgo(false);
                return;
            }

            if (!origen) {
                setOrigen(punto);
                return;
            }

            if (!destino) {
                setDestino(punto);
                return;
            }

            setOrigen(punto);
            setDestino(null);
        }
    });

    return null;
}

function FitBounds({ ruta }) {
    const map = useMap();

    useEffect(() => {
        if (!ruta?.length) return;

        const puntos = ruta.flat();
        if (!puntos.length) return;

        map.fitBounds(puntos, { padding: [50, 50] });
    }, [ruta, map]);

    return null;
}

function MapView({
    origen,
    destino,
    ruta = [],
    riesgos = [],
    casetas = [],
    zonasRiesgo = [],
    modoRiesgo,
    setModoRiesgo,
    setZonasRiesgo,
    setOrigen,
    setDestino
}) {
    return (
        <MapContainer
            center={[19.4326, -99.1332]}
            zoom={5}
            style={{ height: "100vh", width: "100vw" }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ClickHandler
                origen={origen}
                destino={destino}
                modoRiesgo={modoRiesgo}
                setModoRiesgo={setModoRiesgo}
                setOrigen={setOrigen}
                setDestino={setDestino}
                setZonasRiesgo={setZonasRiesgo}
            />

            <FitBounds ruta={ruta} />

            {origen && <Marker position={origen} icon={origenIcon} />}
            {destino && <Marker position={destino} icon={destinoIcon} />}

            {ruta.map((segmento, index) => (
                <Polyline
                    key={index}
                    positions={segmento}
                    weight={6}
                    opacity={0.9}
                    color="#3b82f6"
                    lineCap="round"
                    lineJoin="round"
                />
            ))}

            {riesgos.map((riesgo, index) => (
                <CircleMarker
                    key={index}
                    center={[riesgo.lat, riesgo.lon]}
                    radius={8}
                    color="red"
                >
                    <Popup>
                        <strong>{riesgo.nombre}</strong>
                        <br />
                        Nivel: {riesgo.nivel}
                    </Popup>
                </CircleMarker>
            ))}

            {zonasRiesgo.map((zona, index) => (
                <Circle
                    key={`zona-${index}`}
                    center={[zona.lat, zona.lon]}
                    radius={zona.radio_km * 1000}
                    pathOptions={{
                        color: "orange",
                        fillColor: "orange",
                        fillOpacity: 0.2
                    }}
                >
                    <Popup>
                        <strong>{zona.nombre}</strong>
                        <br />
                        Nivel: {zona.nivel}
                        <br />
                        Radio: {zona.radio_km} km
                        <br />
                        <br />
                        <button
                            className="popup-delete-btn"
                            onClick={() =>
                                setZonasRiesgo((prev) =>
                                    prev.filter((_, i) => i !== index)
                                )
                            }
                        >
                            Eliminar
                        </button>
                    </Popup>
                </Circle>
            ))}

            {casetas.map((caseta, index) => (
                <Marker
                    key={`caseta-${index}`}
                    position={[caseta.lat, caseta.lon]}
                    icon={casetaIcon}
                >
                    <Popup>
                        <strong>{caseta.nombre}</strong>
                        <br />
                        Costo:{" "}
                        {new Intl.NumberFormat("es-MX", {
                            style: "currency",
                            currency: "MXN"
                        }).format(caseta.costo || 0)}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default MapView;