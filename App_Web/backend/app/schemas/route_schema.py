from pydantic import BaseModel

# Clase para validacion de datos en numeros
class RouteRequest(BaseModel):
    origen: list[float]
    destino: list[float]