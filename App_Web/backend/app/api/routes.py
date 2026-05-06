from fastapi import APIRouter
from app.services.routing.routing_service import RoutingService
from app.schemas.route_schema import RouteRequest

router = APIRouter()
service = RoutingService()

@router.get("/test")
def mensaje():
    return [{"message":"Api funcionando sin errores"}]

@router.post("/ruta")
def obtener_ruta(data: RouteRequest):
    origen = data.get.origen
    destino = data.get.destino
    resultado = service.calcular_ruta(origen,destino)
    return resultado
