# database.py, importaciones y configuracion de la base de datos

import os
import random
from contextlib import closing, contextmanager
from datetime import datetime
from pathlib import Path

import pandas as pd
import psycopg2
from psycopg2 import IntegrityError

DB_NAME = os.getenv("POSTGRES_DB", "suarez_voley")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("TEST_DATABASE_URL")


@contextmanager
def _get_connection():
    if DATABASE_URL:
        conn = psycopg2.connect(postgresql://postgres:suarezvolleyclu@db.mjhioyayavukdggamjar.supabase.co:5432/postgres)
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


def _normalizar_nombre(nombre):
    return str(nombre).strip()


def _normalizar_codigo(codigo):
    return str(codigo).strip()


def _codigo_valido(codigo):
    return len(codigo) == 4 and codigo.isdigit()


def _generar_codigo_4_digitos():
    return f"{random.randint(0, 9999):04d}"


def _generar_codigo_unico(cursor, codigos_en_uso=None):
    if codigos_en_uso is None:
        cursor.execute("SELECT codigo FROM jugadores WHERE codigo IS NOT NULL")
        codigos_en_uso = {fila[0] for fila in cursor.fetchall()}

    for _ in range(20000):
        codigo = _generar_codigo_4_digitos()
        if codigo not in codigos_en_uso:
            codigos_en_uso.add(codigo)
            return codigo

    raise RuntimeError("No hay codigos de 4 digitos disponibles")


def _asegurar_columna_codigo(cursor):
    cursor.execute("ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS codigo TEXT")

    cursor.execute("SELECT id, codigo FROM jugadores ORDER BY id ASC")
    filas = cursor.fetchall()
    codigos_en_uso = set()
    updates = []

    for jugador_id, codigo_actual in filas:
        codigo_limpio = _normalizar_codigo(codigo_actual) if codigo_actual is not None else ""
        if codigo_limpio.isdigit() and len(codigo_limpio) <= 4:
            codigo_limpio = codigo_limpio.zfill(4)
        else:
            codigo_limpio = ""

        if (not _codigo_valido(codigo_limpio)) or (codigo_limpio in codigos_en_uso):
            codigo_limpio = _generar_codigo_unico(cursor, codigos_en_uso)
        else:
            codigos_en_uso.add(codigo_limpio)

        if codigo_actual != codigo_limpio:
            updates.append((codigo_limpio, jugador_id))

    if updates:
        cursor.executemany("UPDATE jugadores SET codigo = %s WHERE id = %s", updates)

    cursor.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_jugadores_codigo ON jugadores(codigo)"
    )


def _actualizar_reporte_excel_seguro():
    try:
        exportar_asistencias_excel()
    except Exception:
        # Si el archivo esta bloqueado por Excel u otra aplicacion,
        # no rompemos el flujo principal.
        pass


# inicializar la base de datos
def inicializar_db():
    with _get_connection() as conexion:
        cursor = conexion.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS jugadores (
                id BIGSERIAL PRIMARY KEY,
                nombre TEXT NOT NULL UNIQUE,
                edad INTEGER NOT NULL CHECK(edad > 0 AND edad <= 120),
                tiempo INTEGER NOT NULL CHECK(tiempo >= 0 AND tiempo <= 80),
                codigo TEXT
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS asistencias (
                id BIGSERIAL PRIMARY KEY,
                jugador_id BIGINT NOT NULL,
                fecha TEXT NOT NULL,
                hora TEXT NOT NULL,
                presente BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (jugador_id) REFERENCES jugadores(id)
            )
            """
        )
        _asegurar_columna_codigo(cursor)
        conexion.commit()
    _actualizar_reporte_excel_seguro()


# agregar un jugador a la base de datos
def agregar_jugador_db(nombre, edad, tiempo):
    nombre_limpio = _normalizar_nombre(nombre)
    if not nombre_limpio:
        return {"exito": False, "mensaje": "Nombre invalido"}

    with _get_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute(
                "SELECT id FROM jugadores WHERE LOWER(nombre) = %s",
                (nombre_limpio.lower(),),
            )
            if cur.fetchone():
                return {"exito": False, "mensaje": "Jugador ya existe"}

            codigo = _generar_codigo_unico(cur)
            cur.execute(
                """
                INSERT INTO jugadores (nombre, edad, tiempo, codigo)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (nombre_limpio, edad, tiempo, codigo),
            )
            fila = cur.fetchone()
            if not fila:
                conn.rollback()
                return {"exito": False, "mensaje": "No se pudo obtener el ID del jugador creado"}

            jugador_id = fila[0]
            conn.commit()
            _actualizar_reporte_excel_seguro()
            return {"exito": True, "id": jugador_id, "codigo": codigo}
        except IntegrityError as err:
            conn.rollback()
            return {"exito": False, "mensaje": f"Error de integridad: {err}"}


# listar todos los jugadores de la base de datos
def listar_jugadores_db():
    with _get_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, nombre, edad, tiempo, codigo FROM jugadores ORDER BY id ASC")
        filas = cur.fetchall()
        return [
            {"id": f[0], "nombre": f[1], "edad": f[2], "tiempo": f[3], "codigo": f[4]}
            for f in filas
        ]


# obtener un jugador de la base de datos
def obtener_jugador_db(jugador_id):
    with _get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, nombre, edad, tiempo, codigo FROM jugadores WHERE id = %s",
            (jugador_id,),
        )
        fila = cur.fetchone()
        if not fila:
            return None
        return {
            "id": fila[0],
            "nombre": fila[1],
            "edad": fila[2],
            "tiempo": fila[3],
            "codigo": fila[4],
        }


# actualizar un jugador de la base de datos
def actualizar_jugador_db(jugador_id, nombre, edad, tiempo):
    nombre_limpio = _normalizar_nombre(nombre)
    if not nombre_limpio:
        return {"exito": False, "mensaje": "Nombre invalido"}

    with _get_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM jugadores WHERE id = %s", (jugador_id,))
        if not cur.fetchone():
            return {"exito": False, "mensaje": "Jugador no encontrado"}

        cur.execute(
            "SELECT id FROM jugadores WHERE LOWER(nombre) = %s AND id != %s",
            (nombre_limpio.lower(), jugador_id),
        )
        if cur.fetchone():
            return {"exito": False, "mensaje": "Ya existe otro jugador con ese nombre"}

        cur.execute(
            "UPDATE jugadores SET nombre = %s, edad = %s, tiempo = %s WHERE id = %s",
            (nombre_limpio, edad, tiempo, jugador_id),
        )
        conn.commit()
        _actualizar_reporte_excel_seguro()
        return {"exito": True}


# eliminar un jugador de la base de datos
def eliminar_jugador_db(jugador_id):
    with _get_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM jugadores WHERE id = %s", (jugador_id,))
        if not cur.fetchone():
            return {"exito": False, "mensaje": "Jugador no encontrado"}

        cur.execute("DELETE FROM asistencias WHERE jugador_id = %s", (jugador_id,))
        cur.execute("DELETE FROM jugadores WHERE id = %s", (jugador_id,))
        conn.commit()
        _actualizar_reporte_excel_seguro()
        return {"exito": True}


# registrar una asistencia de un jugador a la base de datos
def registrar_asistencia_db(codigo):
    codigo_limpio = _normalizar_codigo(codigo)
    if not _codigo_valido(codigo_limpio):
        return {"exito": False}

    with _get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, nombre, codigo FROM jugadores WHERE codigo = %s",
            (codigo_limpio,),
        )
        jugador = cur.fetchone()

        if not jugador:
            return {"exito": False}

        fecha = datetime.now().strftime("%Y-%m-%d")
        hora = datetime.now().strftime("%H:%M")

        cur.execute(
            "INSERT INTO asistencias (jugador_id, fecha, hora) VALUES (%s, %s, %s)",
            (jugador[0], fecha, hora),
        )
        conn.commit()
        _actualizar_reporte_excel_seguro()
        return {
            "exito": True,
            "nombre": jugador[1],
            "hora": hora,
            "codigo": jugador[2],
        }


# verificar si un jugador existe en la base de datos
def verificar_jugador_db(codigo):
    codigo_limpio = _normalizar_codigo(codigo)
    if not _codigo_valido(codigo_limpio):
        return {"existe": False, "codigo": codigo_limpio}

    with _get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, nombre, codigo FROM jugadores WHERE codigo = %s",
            (codigo_limpio,),
        )
        jugador = cur.fetchone()
        if jugador:
            return {"existe": True, "nombre": jugador[1], "codigo": jugador[2]}
        return {"existe": False, "codigo": codigo_limpio}

# exportar asistencias a excel desde la base de datos
def exportar_asistencias_excel():
    ruta_excel = Path(__file__).resolve().parent / "Reporte_SVC.xlsx"
    with _get_connection() as conn:
        query_jugadores = """
            SELECT id AS ID, nombre AS Jugador, edad AS Edad, tiempo AS Tiempo, codigo AS Codigo
            FROM jugadores
            ORDER BY id ASC
        """
        query_asistencias = """
            SELECT
                a.id AS ID,
                j.nombre AS Jugador,
                j.codigo AS Codigo,
                a.fecha AS Fecha,
                a.hora AS Hora
            FROM asistencias a
            JOIN jugadores j ON a.jugador_id = j.id
            ORDER BY a.fecha DESC, a.hora DESC
        """
        df_jugadores = pd.read_sql_query(query_jugadores, conn)
        df_asistencias = pd.read_sql_query(query_asistencias, conn)

    with pd.ExcelWriter(ruta_excel, engine="openpyxl") as writer:
        df_jugadores.to_excel(writer, sheet_name="Jugadores", index=False)
        df_asistencias.to_excel(writer, sheet_name="Asistencias", index=False)
    return ruta_excel

# obtener los ultimos asistentes de la base de datos
def obtener_ultimos_asistentes(limite=5):
    limite = max(1, int(limite))
    with _get_connection() as conn:
        cur = conn.cursor()
        query = """
            SELECT j.nombre, j.codigo, a.hora
            FROM asistencias a
            JOIN jugadores j ON a.jugador_id = j.id
            WHERE a.fecha = %s
            ORDER BY a.id DESC
            LIMIT %s
        """
        fecha_hoy = datetime.now().strftime("%Y-%m-%d")
        cur.execute(query, (fecha_hoy, limite))
        filas = cur.fetchall()
        return [{"nombre": f[0], "codigo": f[1], "hora": f[2]} for f in filas]
