# Workflow AI - Flujo de Trabajo con Agentes

## Principios Fundamentales

- **El dev dirige, la IA ejecuta**: Toda la ingeniería (soluciones, debug, refactor) recae en las decisiones del dev
- **La IA puede proponer**: Ideas, alternativas, optimizaciones, pero el dev valida
- **Flujo por fases**: Cada feature se divide en fases manejables

---

## Flujo de Trabajo

### Fase 0: Planificación

```
1. Definir la feature/objetivo
2. Dividir en fases lógicas
3. Documentar en plan-de-accion.md
4. Priorizar y establecer dependencias
```

### Fase 1-3: Ejecución por Fases

```
┌─────────────────────────────────────────────────────────┐
│                    CICLO POR FASE                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐                                        │
│  │ 1. GENERAR  │ → Dev instruye al agente              │
│  │    CÓDIGO   │   sobre qué implementar               │
│  └─────────────┘                                        │
│         ↓                                               │
│  ┌─────────────┐                                        │
│  │ 2. ANALIZAR │ → Dev revisa el código generado        │
│  │    Y TEST   │   ejecuta tests, verifica comportamiento│
│  └─────────────┘                                        │
│         ↓                                               │
│  ┌─────────────┐                                        │
│  │ 3. CORREGIR │ → Dev refactoriza, debuguea, ajusta    │
│  │  O APROBAR  │   marca correcciones necesarias        │
│  └─────────────┘                                        │
│         ↓                                               │
│  ┌─────────────┐                                        │
│  │ 4. COMMIT   │ → Avance con commit limpio             │
│  │   DE AVANCE │   mensaje descriptivo                  │
│  └─────────────┘                                        │
│         ↓                                               │
│  ┌─────────────┐                                        │
│  │ 5. SIGUIENTE│ → Avanzar a la siguiente fase          │
│  │    FASE     │   (volver a paso 1)                    │
│  └─────────────┘                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Fase Final: Verificación

```
1. Review completo del código
2. Tests end-to-end
3. Deploy / Merge
4. Documentación (si aplica)
```

---

## Interacción Dev ↔ Agente

### El Dev puede pedir:
- Implementar funcionalidad específica
- Refactorizar código existente
- Debuggear errores
- Proponer soluciones alternativas
- Explicar código o arquitectura
- Generar tests

### La IA puede proponer:
- Optimizaciones de rendimiento
- Mejoras en patrones de diseño
- Alternativas de implementación
- Detección de code smells
- Sugerencias de arquitectura

### El Dev decide:
- Qué propuestas aceptar
- Cuándo committear
- Si la dirección es correcta
- Prioridad de correcciones
- Cuándo una fase está completa

---

## Reglas de Commit

```
- Un commit por fase completada
- Mensajes descriptivos: "feat: ..." / "fix: ..." / "refactor: ..."
- Nunca commitear código sin análisis previo
- Revisar diff antes de commit
```

---

## Referencia

- Ver `plan-de-accion.md` para el plan específico de cada feature
- Cada fase se documenta con su estado: `pendiente` | `en progreso` | `completada`
