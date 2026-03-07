# Document Checking

Automatizacion para revisar vencimientos de documentacion de jugadores desde uno o mas archivos Excel, con opcion de consulta web a SENADE, y generar un reporte final clasificado.

## Que hace

- Lee uno o varios archivos Excel de entrada.
- Busca la columna `VENC. SENADE` (incluye deteccion de encabezado en filas desplazadas).
- Detecta columna de CI/documento (`Cedula`, `CI`, `Documento`, etc.).
- Opcionalmente consulta SENADE por CI y trae estado/vencimiento.
- Clasifica jugadores en:
  - `OK` (mas de 30 dias)
  - `ALERTA` (0 a 30 dias)
  - `VENCIDO` (fecha invalida o vencida)
- Exporta un Excel con hojas separadas: `OK`, `ALERTA`, `VENCIDOS`.

## Requisitos

- Python 3.10+ (probado en 3.14)
- Dependencias:
  - `pandas`
  - `openpyxl`
  - `playwright` (solo si se consulta SENADE)

Instalacion recomendada:

```bash
pip install pandas openpyxl playwright
playwright install chromium
```

## Uso

Ejecutar desde la carpeta donde este `check_documentos.py`.

### 1) Modo rapido (sin consulta web)

```bash
python check_documentos.py jugadores.xlsx --skip-senade -o reporte_documentacion.xlsx
```

### 2) Modo completo (consulta SENADE)

```bash
python check_documentos.py jugadores.xlsx -o reporte_documentacion.xlsx
```

### 3) Multiples archivos

```bash
python check_documentos.py archivo1.xlsx archivo2.xlsx archivo3.xlsx
```

## Parametros CLI

- `files`: lista de rutas de Excel (si no se pasan, abre explorador de archivos).
- `-o, --output`: nombre del archivo de salida.
- `--skip-senade`: desactiva consulta web y usa solo fechas del Excel.
- `--show-browser`: muestra navegador durante consultas SENADE.
- `--senade-timeout-ms`: timeout por consulta web en ms (default: `30000`).

## Salida del reporte

Columnas agregadas por el proceso:

- `ESTADO_SENADE`
- `FECHA_VENCIMIENTO_SENADE`
- `DIAS_PARA_VENCIMIENTO`
- `ESTADO`

Archivo de salida:

- `reporte_documentacion.xlsx` (por defecto)
- Hojas: `OK`, `ALERTA`, `VENCIDOS`

## Rendimiento orientativo

Referencia de QA local con 4 jugadores:

- Sin SENADE (`--skip-senade`): ~0.8 s total
- Con SENADE: ~4.1 s total

La mayor latencia depende de la consulta web (cantidad de CI unicos y tiempo de respuesta del sitio oficial).

