import heapq
from math import radians, sin, cos, sqrt, atan2


class AStar:

    def haversine(
        self,
        lat1,
        lon1,
        lat2,
        lon2
    ):
        R = 6371000

        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)

        a = (
            sin(dlat / 2) ** 2
            + cos(radians(lat1))
            * cos(radians(lat2))
            * sin(dlon / 2) ** 2
        )

        c = 2 * atan2(
            sqrt(a),
            sqrt(1 - a)
        )

        return R * c

    def heuristic(
        self,
        graph,
        node,
        goal
    ):
        lat1 = graph.nodes[node]["y"]
        lon1 = graph.nodes[node]["x"]

        lat2 = graph.nodes[goal]["y"]
        lon2 = graph.nodes[goal]["x"]

        return self.haversine(
            lat1,
            lon1,
            lat2,
            lon2
        )

    def reconstruct_path(
        self,
        came_from,
        current
    ):
        path = [current]

        while current in came_from:
            current = came_from[current]
            path.append(current)

        path.reverse()

        return path

    def search(
        self,
        graph,
        start,
        goal
    ):

        open_set = []

        heapq.heappush(
            open_set,
            (0, start)
        )

        came_from = {}

        g_score = {
            start: 0
        }

        closed_set = set()

        nodos_explorados = 0

        while open_set:

            current = heapq.heappop(
                open_set
            )[1]

            if current in closed_set:
                continue

            closed_set.add(current)

            nodos_explorados += 1

            if current == goal:

                ruta = self.reconstruct_path(
                    came_from,
                    current
                )

                return {
                    "ruta": ruta,
                    "nodos_explorados": nodos_explorados
                }

            for neighbor in graph.neighbors(current):

                edge_data = graph.get_edge_data(
                    current,
                    neighbor
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

                distance = edge.get(
                    "length",
                    1
                )

                tentative_g = (
                    g_score[current]
                    + distance
                )

                if (
                    neighbor not in g_score
                    or tentative_g
                    < g_score[neighbor]
                ):

                    came_from[neighbor] = current

                    g_score[neighbor] = tentative_g

                    f_score = (
                        tentative_g
                        + self.heuristic(
                            graph,
                            neighbor,
                            goal
                        )
                    )

                    heapq.heappush(
                        open_set,
                        (
                            f_score,
                            neighbor
                        )
                    )

        return None