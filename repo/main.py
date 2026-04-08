import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from database import (
    agregar_jugador_db,
    actualizar_jugador_db,
    eliminar_jugador_db,
    inicializar_db,
    listar_jugadores_db,
    obtener_jugador_db,
    obtener_ultimos_asistentes,
    registrar_asistencia_db,
    verificar_jugador_db,
)

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
HOME_FILE = STATIC_DIR / "index.html"

if not HOME_FILE.exists():
    fallback_home = STATIC_DIR / "iindex.html"
    if fallback_home.exists():
        HOME_FILE = fallback_home


@asynccontextmanager
async def lifespan(app: FastAPI):
    inicializar_db()
    yield


app = FastAPI(lifespan=lifespan)

# ----------------------------
# ARCHIVOS ESTATICOS
# ----------------------------
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
def home():
    if not HOME_FILE.exists():
        raise HTTPException(status_code=500, detail="No se encontro la interfaz web")
    return FileResponse(str(HOME_FILE))


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "attendance-api",
    }


# ----------------------------
# CORS
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# MODELOS
# ----------------------------
class Jugador(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    edad: int = Field(..., gt=0, le=120)
    tiempo: int = Field(..., ge=0, le=80)


class CheckInRequest(BaseModel):
    codigo: str = Field(..., pattern=r"^\d{4}$")


# ----------------------------
# ENDPOINTS API
# ----------------------------
@app.get("/verificar/{codigo}")
def verificar_jugador(codigo: str):
    """Verifica si un jugador existe por codigo de 4 digitos."""
    try:
        return verificar_jugador_db(codigo)
    except Exception:
        logger.exception("Error verificando jugador")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@app.get("/asistencias/recientes")
def obtener_recientes():
    """Devuelve los ultimos asistentes del dia."""
    try:
        return obtener_ultimos_asistentes()
    except Exception:
        logger.exception("Error obteniendo recientes")
        raise HTTPException(status_code=500, detail="Error obteniendo recientes")


@app.post("/check-in")
def check_in(request: CheckInRequest):
    """Registra la asistencia de un jugador usando su codigo."""
    try:
        resultado = registrar_asistencia_db(request.codigo)
        if not resultado["exito"]:
            raise HTTPException(status_code=404, detail="Codigo no encontrado")
        return {
            "mensaje": "Asistencia registrada",
            "nombre": resultado["nombre"],
            "hora": resultado["hora"],
            "codigo": resultado["codigo"],
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error interno al registrar asistencia")
        raise HTTPException(status_code=500, detail="Error interno al registrar asistencia")


@app.post("/jugadores/", status_code=status.HTTP_201_CREATED)
def crear_jugador(jugador: Jugador):
    try:
        res = agregar_jugador_db(jugador.nombre, jugador.edad, jugador.tiempo)
        if not res["exito"]:
            raise HTTPException(status_code=400, detail=res["mensaje"])
        return {
            "mensaje": "Jugador creado",
            "id": res.get("id"),
            "codigo": res.get("codigo"),
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error al crear jugador")
        raise HTTPException(status_code=500, detail="Error al crear jugador")


@app.get("/jugadores/")
def listar_jugadores():
    try:
        return listar_jugadores_db()
    except Exception:
        logger.exception("Error al listar jugadores")
        raise HTTPException(status_code=500, detail="Error al listar jugadores")


@app.get("/jugadores/{jugador_id}")
def obtener_jugador(jugador_id: int):
    try:
        jugador = obtener_jugador_db(jugador_id)
        if not jugador:
            raise HTTPException(status_code=404, detail="Jugador no encontrado")
        return jugador
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error al obtener jugador")
        raise HTTPException(status_code=500, detail="Error al obtener jugador")


@app.put("/jugadores/{jugador_id}")
def actualizar_jugador(jugador_id: int, jugador: Jugador):
    try:
        res = actualizar_jugador_db(jugador_id, jugador.nombre, jugador.edad, jugador.tiempo)
        if not res["exito"]:
            if res["mensaje"] == "Jugador no encontrado":
                raise HTTPException(status_code=404, detail=res["mensaje"])
            raise HTTPException(status_code=400, detail=res["mensaje"])
        return {"mensaje": "Jugador actualizado"}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error al actualizar jugador")
        raise HTTPException(status_code=500, detail="Error al actualizar jugador")


@app.delete("/jugadores/{jugador_id}")
def eliminar_jugador(jugador_id: int):
    try:
        res = eliminar_jugador_db(jugador_id)
        if not res["exito"]:
            raise HTTPException(status_code=404, detail=res["mensaje"])
        return {"mensaje": "Jugador eliminado"}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error al eliminar jugador")
        raise HTTPException(status_code=500, detail="Error al eliminar jugador")


@app.get("/stats")
def stats():
    try:
        jugadores = listar_jugadores_db()
        recientes = obtener_ultimos_asistentes()
        return {
            "total_jugadores": len(jugadores),
            "asistencias_recientes": len(recientes),
        }
    except Exception:
        logger.exception("Error obteniendo stats")
        raise HTTPException(status_code=500, detail="Error obteniendo estadisticas")


@app.get("/version")
def version():
    return {
        "app": "attendance-api",
        "version": "1.0.0",
    }
