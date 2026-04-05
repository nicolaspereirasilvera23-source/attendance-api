# database.py
# Manejo de base de datos PostgreSQL (Supabase compatible)

import os
import random
from contextlib import closing, contextmanager
from datetime import datetime
from pathlib import Path

import pandas as pd
import psycopg2
from psycopg2 import IntegrityError

# ==============================
# CONFIGURACIÓN
# ==============================

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback para entorno local
DB_NAME = os.getenv("POSTGRES_DB", "suarez_voley")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = int(os.getenv("POSTGRES_PORT", "5432"))


# ==============================
# CONEXIÓN A BASE DE DATOS
# ==============================

@contextmanager
def get_connection():
    """
    Genera una conexión a la base de datos.
    Usa DATABASE_URL en producción (Supabase).
    Aplica SSL automáticamente si corresponde.
    """
    try:
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL, sslmode="require")
        else:
            conn = psycopg2.connect(
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST,
                port=DB_PORT,
            )

        with closing(conn) as connection:
            yield connection

    except Exception as e:
        print("❌ Error de conexión a DB:", e)
        raise


# ==============================
# UTILIDADES
# ==============================

def normalizar_nombre(nombre):
    return str(nombre).strip()


def normalizar_codigo(codigo):
    return str(codigo).strip()


def codigo_valido(codigo):
    return len(codigo) == 4 and codigo.isdigit()


def generar_codigo_4_digitos():
    return f"{random.randint(0, 9999):04d}"


def generar_codigo_unico(cursor, codigos_en_uso=None):
    """
    Genera un código único de 4 dígitos que no exista en la DB.
    """
    if codigos_en_uso is None:
        cursor.execute("SELECT codigo FROM jugadores WHERE codigo IS NOT NULL")
        codigos_en_uso = {fila[0] for fila in cursor.fetchall()}

    for _ in range(20000):
        codigo = generar_codigo_4_digitos()
        if codigo not in codigos_en_uso:
            codigos_en_uso.add(codigo)
            return codigo

    raise RuntimeError("No hay códigos disponibles")


# ==============================
# INICIALIZACIÓN DB
# ==============================

def inicializar_db():
    """
    Crea tablas necesarias si no existen.
    NO debe romper la app si falla.
    """
    try:
        with get_connection() as conn:
            cur = conn.cursor()

            cur.execute("""
                CREATE TABLE IF NOT EXISTS jugadores (
                    id BIGSERIAL PRIMARY KEY,
                    nombre TEXT NOT NULL UNIQUE,
                    edad INTEGER NOT NULL CHECK(edad > 0 AND edad <= 120),
                    tiempo INTEGER NOT NULL CHECK(tiempo >= 0 AND tiempo <= 80),
                    codigo TEXT
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS asistencias (
                    id BIGSERIAL PRIMARY KEY,
                    jugador_id BIGINT NOT NULL,
                    fecha TEXT NOT NULL,
                    hora TEXT NOT NULL,
                    presente BOOLEAN DEFAULT TRUE,
                    FOREIGN KEY (jugador_id) REFERENCES jugadores(id)
                )
            """)

            # Asegura estructura consistente
            cur.execute("ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS codigo TEXT")

            cur.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_jugadores_codigo 
                ON jugadores(codigo)
            """)

            conn.commit()

    except Exception as e: # pylint: disable=broad-exception-caught
        print("⚠️ Error inicializando DB:", e)


# ==============================
# CRUD JUGADORES
# ==============================

def agregar_jugador_db(nombre, edad, tiempo):
    nombre = normalizar_nombre(nombre)
    if not nombre:
        return {"exito": False, "mensaje": "Nombre inválido"}

    try:
        with get_connection() as conn:
            cur = conn.cursor()

            # Verificar duplicado
            cur.execute("SELECT id FROM jugadores WHERE LOWER(nombre) = %s", (nombre.lower(),))
            if cur.fetchone():
                return {"exito": False, "mensaje": "Jugador ya existe"}

            codigo = generar_codigo_unico(cur)

            cur.execute("""
                INSERT INTO jugadores (nombre, edad, tiempo, codigo)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (nombre, edad, tiempo, codigo))

            jugador_id = cur.fetchone()[0]
            conn.commit()

            return {"exito": True, "id": jugador_id, "codigo": codigo}

    except IntegrityError as e:
        return {"exito": False, "mensaje": f"Error DB: {e}"}
    except Exception as e: # pylint: disable=broad-exception-caught
        return {"exito": False, "mensaje": str(e)}


def listar_jugadores_db():
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, nombre, edad, tiempo, codigo FROM jugadores ORDER BY id ASC")
        filas = cur.fetchall()

        return [
            {"id": f[0], "nombre": f[1], "edad": f[2], "tiempo": f[3], "codigo": f[4]}
            for f in filas
        ]


# ==============================
# ASISTENCIAS
# ==============================

def registrar_asistencia_db(codigo):
    codigo = normalizar_codigo(codigo)

    if not codigo_valido(codigo):
        return {"exito": False}

    with get_connection() as conn:
        cur = conn.cursor()

        cur.execute("SELECT id, nombre FROM jugadores WHERE codigo = %s", (codigo,))
        jugador = cur.fetchone()

        if not jugador:
            return {"exito": False}

        fecha = datetime.now().strftime("%Y-%m-%d")
        hora = datetime.now().strftime("%H:%M")

        cur.execute("""
            INSERT INTO asistencias (jugador_id, fecha, hora)
            VALUES (%s, %s, %s)
        """, (jugador[0], fecha, hora))

        conn.commit()

        return {
            "exito": True,
            "nombre": jugador[1],
            "hora": hora,
            "codigo": codigo
        }


# ==============================
# EXPORTACIÓN
# ==============================

def exportar_asistencias_excel():
    """
    Exporta datos a Excel.
    Puede fallar en producción (filesystem), por eso NO debe romper flujo principal.
    """
    try:
        ruta_excel = Path(__file__).resolve().parent / "Reporte_SVC.xlsx"

        with get_connection() as conn:
            df_jugadores = pd.read_sql_query("SELECT * FROM jugadores", conn)
            df_asistencias = pd.read_sql_query("SELECT * FROM asistencias", conn)

        with pd.ExcelWriter(ruta_excel, engine="openpyxl") as writer:
            df_jugadores.to_excel(writer, sheet_name="Jugadores", index=False)
            df_asistencias.to_excel(writer, sheet_name="Asistencias", index=False)

        return ruta_excel

    except Exception as e: # pylint: disable=broad-exception-caught
        print("⚠️ Error exportando Excel:", e)
        return