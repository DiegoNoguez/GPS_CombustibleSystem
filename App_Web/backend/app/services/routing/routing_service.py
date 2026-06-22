from app.services.routing.graph_services import GraphService
from app.services.routing.pathfinding import AStar

import time
import osmnx as ox


class RoutingService:

    def __init__(self):
        self.graph_service = GraphService()
        self.astar = AStar()

    def validar_modo(self, modo):

        modos_validos = [
            "particular",
            "autobus",
            "camion",
            "ambulancia"
        ]

        if modo not in modos_validos:
            return "particular"

        return modo

    def calcular_ruta(
        self,
        origen,
        destino,
        modo="particular"
    ):

        modo = self.validar_modo(modo)

        graph = self.graph_service.load_graph()

        lat_o, lon_o = origen
        lat_d, lon_d = destino

        nodo_origen = ox.distance.nearest_nodes(
            graph,
            X=lon_o,
            Y=lat_o
        )

        nodo_destino = ox.distance.nearest_nodes(
            graph,
            X=lon_d,
            Y=lat_d
        )

        if nodo_origen == nodo_destino:

            return {
                "error": "Origen y destino demasiado cercanos o fuera del mapa"
            }

        inicio = time.perf_counter()

        resultado_astar = self.astar.search(
            graph,
            nodo_origen,
            nodo_destino,
            modo
        )

        fin = time.perf_counter()

        if resultado_astar is None:

            return {
                "error": "No existe una ruta entre los puntos seleccionados"
            }

        ruta = resultado_astar["ruta"]

        nodos_explorados = resultado_astar[
            "nodos_explorados"
        ]

        distancia = 0

        for i in range(len(ruta) - 1):

            nodo_actual = ruta[i]
            nodo_siguiente = ruta[i + 1]

            edge_data = graph.get_edge_data(
                nodo_actual,
                nodo_siguiente
            )

            if not edge_data:
                continue

            edge = min(
                edge_data.values(),
                key=lambda e: e.get(
                    "length",
                    float("inf")
                )
            )

            distancia += edge.get(
                "length",
                0
            )

        coordenadas = [
            (
                graph.nodes[n]["y"],
                graph.nodes[n]["x"]
            )
            for n in ruta
        ]

        return {
            "status": "ok",

            "algoritmo": "A* Propio",
            "modo": modo,

            "origen": origen,
            "destino": destino,

            "nodo_origen": nodo_origen,
            "nodo_destino": nodo_destino,

            "nodos_grafo": len(graph.nodes),
            "nodos_explorados": nodos_explorados,
            "nodos_ruta": len(ruta),

            "distancia_m": round(distancia, 2),
            "distancia_km": round(distancia / 1000, 3),

            "tiempo_ms": round(
                (fin - inicio) * 1000,
                3
            ),

            "coordenadas": coordenadas
        }