from pydantic import BaseModel, conlist


class RouteRequest(BaseModel):

    origen: conlist(
        float,
        min_length=2,
        max_length=2
    )

    destino: conlist(
        float,
        min_length=2,
        max_length=2
    )

    modo: str = "particular"