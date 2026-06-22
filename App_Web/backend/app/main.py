from fastapi import FastAPI
from app.api.routes import router

app = FastAPI()

@app.get("/")
def root():
    return[{"message":"Servidor iniciado y funcionando"}]

app.include_router(router)