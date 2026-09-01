# AGENT.md - Contexto y Guía del Repositorio

## 📌 Visión General del Proyecto
**Suarez Voley Club (Sistema de Registro de Asistencias)**
Este proyecto es un sistema backend/fullstack en Python que permite registrar jugadores, emitir un código de 4 dígitos único para cada uno, registrar asistencias de manera rápida mediante dicho código y exportar automáticamente reportes en Excel.

---

## 🛠️ Stack Tecnológico
* **Lenguaje:** Python 3.x
* **Framework Web:** FastAPI (con Uvicorn como servidor ASGI)
* **Base de Datos:** PostgreSQL (`psycopg2-binary`)
* **Mapeo / Exportación:** Pandas + `openpyxl` (para generar y sincronizar `Reporte_SVC.xlsx`)
* **Frontend:** HTML5, CSS3, JavaScript (vanilla) alojado estáticamente
* **Testing:** Pytest, Playwright (E2E)

---

## 📂 Estructura del Código

```text
assistance-system-web/
├── AGENT.md                             # Guía de contexto para agentes de IA (raíz)
└── repo/                                # Código fuente del proyecto
    ├── AGENT.md                         # Guía de contexto para agentes de IA (subdirectorio repo)
    ├── main.py                          # Puntos de entrada API (Endpoints FastAPI) y servidor estático
    ├── database.py                      # Conexión a PostgreSQL, inicialización de tablas y exportación a Excel
    ├── console.py                       # CLI interactiva de administración
    ├── bot_prueba_jugadores.py          # Script utilitario para carga masiva y pruebas de asistencias
    ├── import_reporte_excel_postgres.py # Utilidad para migrar/importar datos de Excel a Postgres
    ├── static/                          # Archivos estáticos de la interfaz Web (check-in frontend)
    ├── tests/                           # Suite de tests
    │   ├── test_api.py                  # Pruebas unitarias e integración de API
    │   └── test_asistencia_db.py        # Pruebas End-to-End (E2E) con Playwright
    ├── .env.example                     # Variables de entorno de ejemplo
    ├── pytest.ini                       # Configuración de marcas y opciones de pytest
    └── requirements.txt                 # Dependencias Python
```

---

## 🔌 API & Endpoints Clave

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Chequeo de estado del servicio API |
| `GET` | `/verificar/{codigo}` | Verifica si existe un jugador por su código de 4 dígitos |
| `POST` | `/check-in` | Registra la asistencia de un jugador mediante su código de 4 dígitos |
| `GET` | `/asistencias/recientes` | Obtiene el listado de asistencias del día |
| `POST` | `/jugadores/` | Crea un nuevo jugador (asigna código automático) |
| `GET` | `/jugadores/` | Lista todos los jugadores registrados |
| `GET` | `/jugadores/{id}` | Obtiene la información de un jugador por ID |
| `PUT` | `/jugadores/{id}` | Actualiza la información de un jugador |
| `DELETE` | `/jugadores/{id}` | Elimina a un jugador por ID |
| `GET` | `/stats` | Métricas generales (total de jugadores y asistencias del día) |

---

## ⚙️ Configuración del Entorno y Variables

Copiar `.env.example` a `.env` y definir la conexión PostgreSQL:
```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/asistencia_db
TEST_DATABASE_URL=postgresql://usuario:password@localhost:5432/test_asistencia_db
```

---

## 🚀 Comandos Útiles

### 1. Ejecutar el servidor Web API
```bash
uvicorn main:app --reload
```

### 2. Consola Administrativa (CLI)
```bash
python console.py
```

### 3. Carga masiva / Bot de Pruebas
```bash
python bot_prueba_jugadores.py
```

### 4. Ejecutar la Suite de Pruebas
```bash
# Pruebas unitarias / API (excluyendo e2e)
python -m pytest -q -m "not e2e"

# Pruebas E2E (requiere Uvicorn corriendo y TEST_DATABASE_URL)
python -m pytest -q -m e2e tests/test_asistencia_db.py
```

---

## 📝 Convenciones y Reglas para Agentes
1. **Modelos de Datos:** Asegurarse de mantener la validación del código de 4 dígitos numérico (`^\d{4}$`).
2. **Persistencia & Reportes:** Toda alta, edición, baja o registro de asistencia en `database.py` actualiza la base de datos PostgreSQL y sincroniza el reporte en Excel (`Reporte_SVC.xlsx`).
3. **Manejo de Errores:** Mantener respuestas HTTP apropiadas (`404` para no encontrados, `400` para datos inválidos, `500` con logs en caso de fallos de servidor).
