class CostEngine:

    def get_cost(
        self,
        edge,
        modo="particular"
    ):

        distancia = edge.get(
            "length",
            1
        )

        highway = edge.get(
            "highway",
            ""
        )

        # Particular
        if modo == "particular":

            return distancia

        # Autobús
        elif modo == "autobus":

            if highway in [
                "motorway",
                "trunk"
            ]:
                return distancia * 0.90

            return distancia

        # Camión
        elif modo == "camion":

            if highway in [
                "residential",
                "living_street"
            ]:
                return distancia * 1.30

            return distancia

        # Ambulancia
        elif modo == "ambulancia":

            if highway in [
                "motorway",
                "trunk",
                "primary"
            ]:
                return distancia * 0.80

            return distancia

        return distancia