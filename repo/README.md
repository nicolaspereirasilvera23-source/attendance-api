# akumi.dev - Suarez Voley Club (Registro de Asistencias)

Proyecto backend/fullstack junior con API REST en FastAPI, persistencia en PostgreSQL y pruebas automatizadas.

## Stack
- Python 3.x
- FastAPI + Uvicorn
- PostgreSQL
- Pandas + Openpyxl (exportacion de reporte Excel)
- Frontend HTML/CSS/JS
- Pytest + Playwright

## Funcionalidades
- CRUD de jugadores (crear, listar, obtener por id, actualizar, eliminar).
- Generacion automatica de codigo de 4 digitos por jugador.
- Check-in de asistencia por codigo.
- Endpoint de ultimos ingresos del dia.
- Exportacion automatica a `Reporte_SVC.xlsx` en cada alta/edicion/baja/asistencia.
- Interfaz web para check-in y CLI administrativa.

## Estructura
- `main.py`: API FastAPI.
- `database.py`: logica SQL y operaciones de datos.
- `console.py`: menu de administracion por consola.
- `static/iindex.html`: interfaz web actual.
- `tests/test_api.py`: pruebas API.
- `tests/test_asistencia_db.py`: prueba E2E con navegador.

## Variables de entorno
Usa alguno de estos enfoques:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
TEST_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres_test
```

O bien:

```bash
POSTGRES_DB=suarez_voley
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

`TEST_DATABASE_URL` debe apuntar a una base separada para pruebas. Si no existe, los tests de DB se omiten para no tocar datos reales.

## Como ejecutar
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Abrir: `http://127.0.0.1:8000`

## Consola administrativa
```bash
python console.py
```

## Bot de carga rapida (pruebas)
Script con inputs para alta individual, lote manual, importacion CSV y generacion aleatoria.

```bash
python bot_prueba_jugadores.py
```

Incluye opciones para:
- Cargar jugadores desde `Reporte_SVC.xlsx` (hoja `Jugadores`).
- Registrar pruebas/asistencias desde `Reporte_SVC.xlsx` (hoja `Asistencias`, columna `Codigo`).

## Pruebas
Pruebas API/unitarias:

```bash
python -m pytest -q -m "not e2e"
```

Prueba E2E (requiere servidor en ejecucion, navegador Playwright y `TEST_DATABASE_URL`):

```bash
uvicorn main:app
python -m pytest -q -m e2e tests/test_asistencia_db.py
```

## CI
El pipeline base ejecuta `python -m pytest -m "not e2e"`.
Para validar realmente la capa de PostgreSQL en CI, configura `TEST_DATABASE_URL` apuntando a una base aislada.
