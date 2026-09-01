# WORKFLOW FRONTEND - AGENTE: CLAUDE (SONNET)

Este documento define el flujo de trabajo, responsabilidades y criterios de aceptación para el **Agente Claude (Sonnet)**, encargado de liderar y desarrollar el **Frontend en React + TailwindCSS + Vite + PWA** del sistema Suarez Voley Club.

---

## 🎨 Responsabilidades de Claude Sonnet (Frontend & UI/UX Lead)

1. **Diseño de Interfaz & Componentes UI/UX (React 18 + TailwindCSS):**
   - Construcción de una interfaz moderna, limpia y responsive para el Suarez Voley Club.
   - Creación del **Dashboard principal**:
     - Gráficos de asistencias de la semana/mes con `Recharts`.
     - Tarjetas de métricas rápidas (jugadores activos, asistencias de hoy, próximo partido).
   - Desarrollo del **Tablero Kanban** con Drag & Drop (`@hello-pangea/dnd`) para gestión de tareas operativas.
   - Desarrollo del **Calendario de Partidos y Eventos** (`FullCalendar` / `react-big-calendar`).
   - Implementación del **Portal de Check-In** interactivo con pad numérico de 4 dígitos.

2. **Implementación PWA & Soporte Offline-First:**
   - Configuración de `vite-plugin-pwa` para generación de Manifest (`manifest.json`) y Service Worker.
   - Persistencia local mediante **IndexedDB** (`Dexie.js`) para capturar asistencias sin conexión a internet.
   - Event Listener para **Background Sync**: envío automático de lote de asistencias acumuladas al backend NestJS (`POST /check-in/batch-sync`) en cuanto se recupere la conexión a internet.

3. **Gestión de Estado & Cliente HTTP:**
   - Tipado estricto con TypeScript.
   - **TanStack Query (React Query)** para cache de API y sincronización.
   - **Zustand** para la gestión del estado global (Token JWT de autenticación y estado Online/Offline).

---

## 🧪 QA Gatekeeper - Frontend & Playwright Check (Comandos Obligatorios)

Antes de entregar cualquier tarea o pasar de fase, Claude debe validar:

```bash
# 1. Verificación de Linter y Formato
cd apps/frontend && npm run lint

# 2. Build de Producción Vite + PWA Manifest Check
cd apps/frontend && npm run build

# 3. Pruebas E2E de UI, Login JWT y PWA con Playwright
npx playwright test
```

---

## 📲 Especificaciones PWA para Claude Sonnet

- **Manifest (`manifest.json`):**
  - Name: `Suarez Voley Club - Asistencias`
  - Short Name: `SVC CheckIn`
  - Display: `standalone`
  - Theme Color: `#1E3A8A` (Azul Marino del Club)
  - Icons: Maskable 192x192, 512x512 PNG.
- **Estrategia Caching:**
  - Assets estáticos: Cache First.
  - API de jugadores: StaleWhileRevalidate con IndexedDB fallback.
