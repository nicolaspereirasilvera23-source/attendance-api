# WORKFLOW BACKEND - AGENTE: NEMOTRON (ACTUALIZADO CON REQUERIMIENTOS FRONTEND)

Este documento define el flujo de trabajo, responsabilidades y contratos de API para el **Agente Nemotron**, encargado de liderar y desarrollar el **Backend en NestJS + Prisma ORM** del sistema Suarez Voley Club, alineado con las últimas adiciones del Frontend (Claude Sonnet).

---

## 🎯 Responsabilidades de Nemotron (Backend Lead)

1. **Esquema de Datos Prisma (`schema.prisma`):**
   - **Modelo `User`:** Incluir enum `StaffType` (`DIRECTOR_TECNICO`, `ADMINISTRATIVO`) para el sistema de login y auditoría.
   - **Modelo `Player`:** Incluir campo `squad` (Plantel: `Sub-14`, `Sub-16`, `Sub-18`, `Sub-21`, `Mayores Femenino`, `Mayores Masculino`, `Primera Division`).
   - **Modelo `Task`:** Soporte para el Tablero Kanban (Título, Categoría, Estado `TODO` | `IN_PROGRESS` | `DONE`).
   - **Compatibilidad Dual:** Mantener conector condicional (`sqlite` en local dev, `postgresql` en prod).

2. **Endpoints & DTOs Requeridos por el Frontend:**

   ### A. Módulo Autenticación (`AuthModule`)
   - `POST /api/auth/login`
     - **DTO:** `{ email: string, password: string, staffType: 'DIRECTOR_TECNICO' | 'ADMINISTRATIVO' }`
     - **Respuesta:** `{ token: string, user: { id, name, email, role, staffType } }`

   ### B. Módulo Jugadores & PINs (`PlayersModule`)
   - `GET /api/jugadores/` - Listado completo o filtrado por `plantel`.
   - `POST /api/jugadores/`
     - **DTO:** `{ nombre: string, edad: number, plantel: string, tiempo: number }`
     - Generación backend de código PIN de 4 dígitos si no es enviado.
   - `POST /api/jugadores/batch-sync`
     - Sincronización de jugadores y PINs creados offline en IndexedDB PWA.

   ### C. Módulo Asistencias (`AttendanceModule`)
   - `POST /api/check-in` - Registro instantáneo por código.
   - `POST /api/check-in/batch-sync` - Sincronización en lote de asistencias acumuladas offline.

   ### D. Módulo Kanban (`KanbanModule`)
   - `GET /api/tasks` - Listado de tareas clasificadas por columna.
   - `POST /api/tasks` - Creación de nueva tarea desde el Modal Frontend (`title`, `category`, `status`).
   - `PATCH /api/tasks/:id` - Actualización de estado por Drag & Drop.

3. **Integración Asíncrona con Google Sheets API:**
   - Transmitir altas de jugadores (con su Plantel correspondiente) y asistencias a la hoja de cálculo de Google.

---

## 🧪 QA Gatekeeper - Backend Check (Comandos Obligatorios)

Antes de entregar una tarea o pasar de fase, Nemotron debe validar:

```bash
# 1. Verificación de Compilación TypeScript
cd apps/backend && npm run build

# 2. Ejecución de Tests Unitarios
cd apps/backend && npm run test

# 3. Verificación de Migraciones y Esquema Prisma
cd apps/backend && npx prisma validate
```

---

## 🤝 Contrato de Respuesta Estandarizado (JSON)

Nemotron debe asegurar que la API retorne una respuesta uniforme para el cliente React:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operación realizada con éxito"
}
```
