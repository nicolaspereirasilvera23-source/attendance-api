import argparse
import os
from pathlib import Path

import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch

WORKBOOK_PATH = Path(__file__).resolve().parent / "Reporte_SVC.xlsx"
JUGADORES_TABLE = "reporte_svc_jugadores_raw"
ASISTENCIAS_TABLE = "reporte_svc_asistencias_raw"


def _valor_texto(value):
    if pd.isna(value):
        return None

    texto = str(value).strip()
    return texto or None


def _valor_entero(value):
    if pd.isna(value):
        return None

    return int(float(value))


def _valor_codigo(value):
    numero = _valor_entero(value)
    if numero is None:
        return None

    return f"{numero:04d}"


def _cargar_excel():
    jugadores_df = pd.read_excel(WORKBOOK_PATH, sheet_name="Jugadores")
    asistencias_df = pd.read_excel(WORKBOOK_PATH, sheet_name="Asistencias")

    jugadores = []
    for excel_row_num, fila in jugadores_df.iterrows():
        jugador = _valor_texto(fila.get("Jugador"))
        codigo = _valor_codigo(fila.get("Codigo"))
        edad = _valor_entero(fila.get("Edad"))
        tiempo = _valor_entero(fila.get("Tiempo"))

        if not any([jugador, codigo, edad, tiempo]):
            continue

        jugadores.append(
            {
                "excel_row_num": int(excel_row_num) + 2,
                "id_excel": _valor_entero(fila.get("ID")),
                "jugador": jugador,
                "edad": edad,
                "tiempo": tiempo,
                "codigo": codigo,
            }
        )

    asistencias = []
    for excel_row_num, fila in asistencias_df.iterrows():
        jugador = _valor_texto(fila.get("Jugador"))
        codigo = _valor_codigo(fila.get("Codigo"))
        fecha = _valor_texto(fila.get("Fecha"))
        hora = _valor_texto(fila.get("Hora"))

        if not any([jugador, codigo, fecha, hora]):
            continue

        asistencias.append(
            {
                "excel_row_num": int(excel_row_num) + 2,
                "id_excel": _valor_entero(fila.get("ID")),
                "jugador": jugador,
                "codigo": codigo,
                "fecha": fecha,
                "hora": hora,
            }
        )

    return jugadores, asistencias


def _detectar_inconsistencias(jugadores, asistencias):
    codigos_jugadores = {
        jugador["codigo"] for jugador in jugadores if jugador.get("codigo")
    }
    codigos_asistencias = {
        asistencia["codigo"] for asistencia in asistencias if asistencia.get("codigo")
    }
    codigos_faltantes = sorted(codigos_asistencias - codigos_jugadores)

    return {"codigos_asistencias_sin_jugador": codigos_faltantes}


def _crear_tablas(cur):
    cur.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {JUGADORES_TABLE} (
            id BIGSERIAL PRIMARY KEY,
            excel_row_num INTEGER NOT NULL UNIQUE,
            id_excel INTEGER,
            jugador TEXT,
            edad INTEGER,
            tiempo INTEGER,
            codigo TEXT,
            imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )
    cur.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {ASISTENCIAS_TABLE} (
            id BIGSERIAL PRIMARY KEY,
            excel_row_num INTEGER NOT NULL UNIQUE,
            id_excel INTEGER,
            jugador TEXT,
            codigo TEXT,
            fecha TEXT,
            hora TEXT,
            imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )


def _guardar_en_postgres(database_url, jugadores, asistencias):
    with psycopg2.connect(database_url) as conn:
        with conn.cursor() as cur:
            _crear_tablas(cur)
            cur.execute(f"DELETE FROM {ASISTENCIAS_TABLE}")
            cur.execute(f"DELETE FROM {JUGADORES_TABLE}")

            execute_batch(
                cur,
                f"""
                INSERT INTO {JUGADORES_TABLE} (
                    excel_row_num,
                    id_excel,
                    jugador,
                    edad,
                    tiempo,
                    codigo
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                [
                    (
                        fila["excel_row_num"],
                        fila["id_excel"],
                        fila["jugador"],
                        fila["edad"],
                        fila["tiempo"],
                        fila["codigo"],
                    )
                    for fila in jugadores
                ],
            )

            execute_batch(
                cur,
                f"""
                INSERT INTO {ASISTENCIAS_TABLE} (
                    excel_row_num,
                    id_excel,
                    jugador,
                    codigo,
                    fecha,
                    hora
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                [
                    (
                        fila["excel_row_num"],
                        fila["id_excel"],
                        fila["jugador"],
                        fila["codigo"],
                        fila["fecha"],
                        fila["hora"],
                    )
                    for fila in asistencias
                ],
            )


def main():
    parser = argparse.ArgumentParser(
        description="Carga Reporte_SVC.xlsx a tablas raw de PostgreSQL."
    )
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL"),
        help="Cadena de conexion PostgreSQL. Si no se pasa, usa DATABASE_URL.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Solo analiza el Excel y muestra el resumen sin conectarse a PostgreSQL.",
    )
    args = parser.parse_args()

    jugadores, asistencias = _cargar_excel()
    inconsistencias = _detectar_inconsistencias(jugadores, asistencias)

    print(f"Archivo: {WORKBOOK_PATH.name}")
    print(f"Jugadores validos: {len(jugadores)}")
    print(f"Asistencias validas: {len(asistencias)}")
    print(
        "Codigos en asistencias sin jugador en la hoja Jugadores: "
        f"{inconsistencias['codigos_asistencias_sin_jugador']}"
    )

    if args.dry_run:
        return

    if not args.database_url:
        raise SystemExit(
            "Falta --database-url o la variable de entorno DATABASE_URL."
        )

    _guardar_en_postgres(args.database_url, jugadores, asistencias)
    print(
        "Importacion completada en PostgreSQL: "
        f"{JUGADORES_TABLE}={len(jugadores)}, {ASISTENCIAS_TABLE}={len(asistencias)}"
    )


if __name__ == "__main__":
    main()
