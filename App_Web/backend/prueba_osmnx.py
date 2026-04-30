import osmnx as ox

# Configuración (opcional)
ox.settings.log_console = True
ox.settings.use_cache = True

# Descargar mapa de una zona (ejemplo: Ciudad de México)
lugar = "Mexico City, Mexico"

G = ox.graph_from_place(lugar, network_type='drive')

print("Nodos:", len(G.nodes))
print("Aristas:", len(G.edges))

# Coordenadas reales (lat, lon)
origen = (19.4326, -99.1332)
destino = (19.4270, -99.1677)

# Obtener nodo más cercano
orig_node = ox.distance.nearest_nodes(G, origen[1], origen[0])
dest_node = ox.distance.nearest_nodes(G, destino[1], destino[0])

import networkx as nx

def manhattan(n1, n2):
    x1, y1 = G.nodes[n1]['x'], G.nodes[n1]['y']
    x2, y2 = G.nodes[n2]['x'], G.nodes[n2]['y']
    return abs(x1 - x2) + abs(y1 - y2)

ruta = nx.astar_path(G, orig_node, dest_node, heuristic=manhattan, weight='length')


distancia = nx.astar_path_length(G, orig_node, dest_node, weight='length')

print("Distancia (metros):", distancia)


coordenadas = [(G.nodes[n]['y'], G.nodes[n]['x']) for n in ruta]