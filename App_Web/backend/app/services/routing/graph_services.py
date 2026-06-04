import osmnx as ox


class GraphService:
    def __init__(self):
        self.graph = None

    def load_graph(self):
        if self.graph is None:
            print(f'Cargando grafo')
            self.graph = ox.graph_from_point(
                (19.4326, -99.1332),
                dist=2000,
                network_type='drive'
            )
        print(f'{id(self.graph)}')
        return self.graph