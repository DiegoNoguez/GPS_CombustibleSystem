import { useState, useRef, useEffect } from "react";
import MapView from "./MapView";
import Geocoder from "./components/Geocoder";
import { crearRuta, obtenerEstado } from "./services/api";
import {
    Navigation,
    MapPin,
    Route,
    Clock,
    Cpu,
    Gauge,
    Trash2,
    Loader2,
    Fuel,
    ShieldAlert,
    Receipt,
    AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import "./App.css";

function obtenerMensajeProgreso(progress = 0) {
    if (progress < 20) return "Cargando grafos...";
    if (progress < 45) return "Buscando nodos cercanos...";
    if (progress < 75) return "Calculando la mejor ruta...";
    if (progress < 100) return "Construyendo geometría y métricas...";
    return "Ruta completada";
}

function App() {
    const [origen, setOrigen] = useState(null);
    const [destino, setDestino] = useState(null);
    const [ruta, setRuta] = useState([]);
    const [riesgos, setRiesgos] = useState([]);
    const [casetas, setCasetas] = useState([]);
    const [zonasRiesgo, setZonasRiesgo] = useState([]);
    const [modoRiesgo, setModoRiesgo] = useState(false);
    const [modo, setModo] = useState("particular");
    const [infoRuta, setInfoRuta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [geocoderKey, setGeocoderKey] = useState(0);
    const pollingRef = useRef(null);
    const requestInProgress = useRef(false);

    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    async function calcularRuta() {
        if (!origen || !destino) {
            toast.error("Seleccione origen y destino");
            return;
        }
        
        const origenValido = Array.isArray(origen) && origen.length === 2;
        const destinoValido = Array.isArray(destino) && destino.length === 2;
        
        if (!origenValido || !destinoValido) {
            toast.error("Coordenadas inválidas");
            return;
        }
        
        if (loading) return;

        setLoading(true);
        setRuta([]);
        setRiesgos([]);
        setInfoRuta(null);
        setGeocoderKey((k) => k + 1);

        try {
            const job = await crearRuta({
                origen: [Number(origen[0]), Number(origen[1])],
                destino: [Number(destino[0]), Number(destino[1])],
                modo,
                zonas_riesgo: zonasRiesgo
            });
            const jobId = job.job_id;

            pollingRef.current = setInterval(async () => {
                if (requestInProgress.current) return;
                requestInProgress.current = true;

                try {
                    const data = await obtenerEstado(jobId);
                    setInfoRuta(data);

                    if (data.status === "done") {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                        setRuta(data.result?.coordenadas || []);
                        setRiesgos(data.result?.riesgos || []);
                        setCasetas(data.result?.casetas || []);
                        toast.success("Ruta calculada");
                        setLoading(false);
                        return;
                    }

                    if (data.status === "error") {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                        toast.error(data.message || "Error calculando ruta");
                        setLoading(false);
                    }
                } catch (error) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    toast.error("Error consultando estado");
                    setLoading(false);
                } finally {
                    requestInProgress.current = false;
                }
            }, 1000);
        } catch (error) {
            toast.error(error.message || "Error creando ruta");
            setLoading(false);
        }
    }

    function limpiarRuta() {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        requestInProgress.current = false;
        setLoading(false);
        setOrigen(null);
        setDestino(null);
        setRuta([]);
        setRiesgos([]);
        setCasetas([]);
        setZonasRiesgo([]);
        setModoRiesgo(false);
        setInfoRuta(null);
        setGeocoderKey((k) => k + 1);
    }

    const formatTiempo = (minutos) => {
        const horas = Math.floor(minutos / 60);
        const mins = Math.round(minutos % 60);
        return `${horas} h ${mins} min`;
    };

    const formatMoney = (cantidad) =>
        new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN"
        }).format(cantidad || 0);

    return (
        <>
            <MapView
                origen={origen}
                destino={destino}
                ruta={ruta}
                riesgos={riesgos}
                casetas={casetas}
                zonasRiesgo={zonasRiesgo}
                modoRiesgo={modoRiesgo}
                setModoRiesgo={setModoRiesgo}
                setZonasRiesgo={setZonasRiesgo}
                setOrigen={setOrigen}
                setDestino={setDestino}
            />

            <div className="panel">
                <div className="header">
                    <Navigation size={22} />
                    <h3>Smart GPS</h3>
                </div>

                <div className="search-container">
                    <div className="search-field">
                        <div className="search-icon origen">
                            <MapPin size={14} />
                        </div>
                        <Geocoder
                            key={`origen-${geocoderKey}`}
                            placeholder="Buscar origen..."
                            onSelect={setOrigen}
                        />
                    </div>

                    <div className="search-field">
                        <div className="search-icon destino">
                            <MapPin size={14} />
                        </div>
                        <Geocoder
                            key={`destino-${geocoderKey}`}
                            placeholder="Buscar destino..."
                            onSelect={setDestino}
                        />
                    </div>
                </div>

                <div className="instructions-hint">
                    <small>O haz click directamente en el mapa</small>
                </div>

                <select
                    className="select"
                    value={modo}
                    onChange={(e) => setModo(e.target.value)}
                >
                    <option value="particular">Particular</option>
                    <option value="autobus">Autobús</option>
                    <option value="camion">Camión</option>
                    <option value="ambulancia">Ambulancia</option>
                </select>

                <button
                    className={`btn ${modoRiesgo ? "primary risk-active" : "secondary"}`}
                    onClick={() => setModoRiesgo(!modoRiesgo)}
                >
                    <ShieldAlert size={16} />
                    {modoRiesgo
                        ? "Cancelar zona de riesgo"
                        : "Agregar zona de riesgo"}
                </button>

                <button
                    className="btn primary"
                    onClick={calcularRuta}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="spin" size={16} />
                            Calculando
                        </>
                    ) : (
                        "Calcular ruta"
                    )}
                </button>

                {loading && (
                    <div className="progress-container">
                        <div className="progress-header">
                            <span>Calculando ruta...</span>
                            <span>{infoRuta?.progress || 0}%</span>
                        </div>

                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${infoRuta?.progress || 0}%` }}
                            />
                        </div>

                        <small className="progress-text">
                            {infoRuta?.message || obtenerMensajeProgreso(infoRuta?.progress)}
                        </small>
                    </div>
                )}

                <button className="btn secondary" onClick={limpiarRuta}>
                    <Trash2 size={16} />
                    Limpiar
                </button>

                {infoRuta && (
                    <div className="metrics">
                        <div className="metric-card">
                            <Route size={18} />
                            <div>
                                <span>Distancia</span>
                                <strong>{infoRuta.distancia_km || 0} km</strong>
                            </div>
                        </div>

                        <div className="metric-card">
                            <Clock size={18} />
                            <div>
                                <span>Tiempo estimado</span>
                                <strong>
                                    {formatTiempo(infoRuta.tiempo_estimado_min || 0)}
                                </strong>
                            </div>
                        </div>

                        <div className="metric-card">
                            <Fuel size={18} />
                            <div>
                                <span>Combustible</span>
                                <strong>{infoRuta.combustible?.litros || 0} L</strong>
                                <small>{formatMoney(infoRuta.combustible?.costo)}</small>
                            </div>
                        </div>

                        <div className="metric-card">
                            <Receipt size={18} />
                            <div>
                                <span>Casetas</span>
                                <strong>{formatMoney(infoRuta.costo_casetas)}</strong>
                                <small>
                                    {infoRuta.result?.casetas?.length || 0} encontradas
                                </small>
                            </div>
                        </div>

                        <div
                            className={`metric-card risk ${
                                infoRuta.nivel_riesgo || "bajo"
                            }`}
                        >
                            <ShieldAlert size={18} />
                            <div>
                                <span>Zonas de riesgo</span>
                                <strong>{infoRuta.riesgo_total || 0}</strong>
                                <small>
                                    Riesgo {infoRuta.nivel_riesgo || "bajo"}
                                </small>
                            </div>
                        </div>

                        <div className="metric-card">
                            <Cpu size={18} />
                            <div>
                                <span>Nodos explorados</span>
                                <strong>
                                    {(infoRuta.nodos_explorados || 0).toLocaleString()}
                                </strong>
                            </div>
                        </div>

                        <div className="metric-card">
                            <Gauge size={18} />
                            <div>
                                <span>Progreso</span>
                                <strong>{infoRuta.progress || 0}%</strong>
                            </div>
                        </div>

                        {infoRuta.riesgo_total > 0 && (
                            <div className="risk-warning">
                                <AlertTriangle size={18} />
                                <div>
                                    <strong>Se detectaron zonas de riesgo</strong>
                                    <ul>
                                        {infoRuta.result?.riesgos?.map((riesgo) => (
                                            <li key={riesgo.nombre}>
                                                {riesgo.nombre}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default App;