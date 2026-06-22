import { useMapEvents } from "react-leaflet";

function ClickHandler({
    origen,
    destino,
    setOrigen,
    setDestino
}) {

    useMapEvents({

        click(e) {

            const punto = [
                e.latlng.lat,
                e.latlng.lng
            ];

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

export default ClickHandler;