from app.services.routing.graph_services import GraphService
from app.services.routing.pathfinding import AStar
import time
import osmnx as ox
import networkx as nx 

class RoutingService:
    def __init__(self):
        self.graph_service = GraphService()

    def validar_modo(self,modo):
        modos_validos = [
            "particular",
            "autobus",
            "camion",
            "ambulancia"
        ]

        if modo not in modos_validos:

            return "particular"

        return modo

    def calcular_ruta(self, origen, destino, modo):
        self.astar = AStar()
        modo = self.validar_modo(modo)
        # cargar el mapa ya esta listo 
        graph = self.graph_service.load_graph()

        # desempaquetado 
        lat_o, lon_0 = origen 
        lat_d, lon_d = destino

        # Obtencion de los nodos
        # conversion a la distancia 
        nodo_origen = ox.distance.nearest_nodes(
            graph,
            X= lon_0,
            Y= lat_o
        )

        # conversion a lo de destino 
        nodo_destino = ox.distance.nearest_nodes(
            graph,
            X= lon_d,
            Y= lat_d
        )


        # Validacion 
        if nodo_origen == nodo_destino:
            return {"error":"Origen y destino demasiado cercanos o fuera del mapa"}
        else:
            # Recreacion de la ruta 
            resultado_astar = self.astar.search(
                graph,
                nodo_origen,
                nodo_destino
                
            )

            if resultado_astar is None:
                return {
                    "error": "No existe una ruta entre los puntos seleccionados"
                }

            ruta = resultado_astar["ruta"]

            nodos_explorados = resultado_astar[
                "nodos_explorados"
            ]
    
            distancia = 0

            for i in range(len(ruta)-1):
            
                origen = ruta[i]
                destino = ruta[i+1]

                edge = graph.get_edge_data(
                    origen,
                    destino
                )[0]

                distancia += edge.get(
                    "length",
                    0
                )
    
            # COnversion de coordenadas
            coordenadas = [
                (graph.nodes[n]['y'], graph.nodes[n]['x'])
                for n in ruta
            ]

            return{
            "origen":origen,
            "destino":destino,
            "nodos":len(graph.nodes),
            "nodo_origen":nodo_origen,
            "nodo_destino":nodo_destino,
            "ruta":ruta,
            "distancia":distancia,
            "coordenadas":coordenadas,
            "modo": modo,
            "status":"ok",
            "nodos_explorados": nodos_explorados,
            "algoritmo": "A* Propio",
        }
    